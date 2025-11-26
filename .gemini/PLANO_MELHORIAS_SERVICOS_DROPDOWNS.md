# 📋 Plano de Melhorias - Serviços e Dropdowns Dinâmicos

## 🎯 Objetivo
Separar completamente Produtos de Serviços e adicionar funcionalidade de criação rápida em todos os dropdowns do sistema.

---

## 1️⃣ Separação de Produtos e Serviços

### Justificativa
- **Produtos** e **Serviços** têm naturezas diferentes
- Produtos têm estoque, serviços não
- Serviços são usados principalmente em Ordens de Serviço
- Produtos são vendidos no PDV e em vendas normais

### Backend - Novo Modelo `Servico`

```python
# apps/erp/models.py

class Servico(BaseModel):
    """Modelo para serviços prestados pela empresa"""
    
    nome = models.CharField(max_length=200, verbose_name="Nome do Serviço")
    descricao = models.TextField(blank=True, verbose_name="Descrição")
    codigo_interno = models.CharField(max_length=50, unique=True, verbose_name="Código")
    
    # Categoria
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.PROTECT,
        related_name='servicos',
        verbose_name="Categoria"
    )
    
    # Preços
    preco_venda = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Preço de Venda"
    )
    preco_custo = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name="Custo Estimado"
    )
    
    # Tempo estimado (em minutos)
    tempo_estimado = models.IntegerField(
        default=0,
        verbose_name="Tempo Estimado (min)",
        help_text="Tempo estimado para execução do serviço em minutos"
    )
    
    # Status
    ativo = models.BooleanField(default=True, verbose_name="Ativo")
    
    # Observações
    observacoes = models.TextField(blank=True, verbose_name="Observações")
    
    class Meta:
        verbose_name = "Serviço"
        verbose_name_plural = "Serviços"
        ordering = ['nome']
    
    def __str__(self):
        return f"{self.codigo_interno} - {self.nome}"
```

### Backend - Migração de Dados

```python
# Script de migração (executar após criar o modelo)

from apps.erp.models import Produto, Servico

# Migrar produtos do tipo "servico" para o novo modelo Servico
produtos_servico = Produto.objects.filter(tipo='servico')

for produto in produtos_servico:
    Servico.objects.create(
        tenant=produto.tenant,
        nome=produto.nome,
        descricao=produto.descricao,
        codigo_interno=produto.codigo_interno,
        categoria=produto.categoria,
        preco_venda=produto.preco_venda,
        preco_custo=produto.preco_custo,
        ativo=produto.ativo,
        observacoes=produto.observacoes,
        tempo_estimado=0,  # Valor padrão
        created_by=produto.created_by,
        updated_by=produto.updated_by,
    )

# Após migração, remover produtos do tipo serviço
# produtos_servico.delete()  # Descomentar após validar migração
```

### Backend - API Endpoints

```python
# apps/erp/views.py

class ServicoViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar serviços"""
    queryset = Servico.objects.all()
    serializer_class = ServicoSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['categoria', 'ativo']
    search_fields = ['nome', 'codigo_interno', 'descricao']
    ordering_fields = ['nome', 'preco_venda', 'created_at']
    ordering = ['nome']
```

### Frontend - Estrutura de Páginas

```
frontend/src/app/
├── servicos/
│   ├── layout.tsx          # Layout com sidebar
│   ├── page.tsx            # Listagem de serviços
│   ├── novo/
│   │   └── page.tsx        # Cadastro de novo serviço
│   └── [id]/
│       ├── page.tsx        # Detalhes do serviço
│       └── editar/
│           └── page.tsx    # Edição do serviço
```

### Frontend - Atualizar Sidebar

```tsx
// components/app-sidebar.tsx

const menuItems = [
    // ... outros itens
    {
        title: "Produtos",
        icon: Package,
        items: [
            { title: "Listagem", href: "/produtos" },
            { title: "Novo Produto", href: "/produtos/novo" },
        ],
    },
    {
        title: "Serviços",  // NOVO MENU
        icon: Wrench,
        items: [
            { title: "Listagem", href: "/servicos" },
            { title: "Novo Serviço", href: "/servicos/novo" },
        ],
    },
    // ... outros itens
];
```

---

## 2️⃣ Dropdowns Dinâmicos com Criação Rápida

### Componente Reutilizável: `SelectWithCreate`

```tsx
// components/ui/select-with-create.tsx

"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SelectWithCreateProps {
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  createLabel: string;
  createTitle: string;
  createDescription: string;
  onCreateNew: (name: string) => Promise<{ id: string; name: string }>;
  disabled?: boolean;
}

export function SelectWithCreate({
  value,
  onValueChange,
  options,
  placeholder = "Selecione...",
  createLabel,
  createTitle,
  createDescription,
  onCreateNew,
  disabled = false,
}: SelectWithCreateProps) {
  const [open, setOpen] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [newItemName, setNewItemName] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleCreate = async () => {
    if (!newItemName.trim()) return;

    setLoading(true);
    try {
      const newItem = await onCreateNew(newItemName);
      onValueChange(newItem.id);
      setDialogOpen(false);
      setNewItemName("");
      setOpen(false);
    } catch (error) {
      console.error("Erro ao criar:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Select
        value={value}
        onValueChange={onValueChange}
        open={open}
        onOpenChange={setOpen}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {/* Botão para criar novo */}
          <div className="p-1">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={(e) => {
                e.preventDefault();
                setDialogOpen(true);
                setOpen(false);
              }}
            >
              <Plus className="h-4 w-4" />
              {createLabel}
            </Button>
          </div>
          
          {/* Separador */}
          {options.length > 0 && (
            <div className="border-t my-1" />
          )}
          
          {/* Opções existentes */}
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Dialog para criar novo */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{createTitle}</DialogTitle>
            <DialogDescription>{createDescription}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Digite o nome..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreate();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setNewItemName("");
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={loading || !newItemName.trim()}>
              {loading ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

### Exemplo de Uso

```tsx
// Exemplo: Dropdown de Categoria com criação rápida

<SelectWithCreate
  value={categoriaId}
  onValueChange={setCategoriaId}
  options={categorias.map(c => ({ value: c.id.toString(), label: c.nome }))}
  placeholder="Selecione uma categoria"
  createLabel="Nova Categoria"
  createTitle="Criar Nova Categoria"
  createDescription="Digite o nome da nova categoria"
  onCreateNew={async (nome) => {
    const novaCategoria = await api.createCategoria({ nome });
    // Atualizar lista local
    setCategorias([...categorias, novaCategoria]);
    return { id: novaCategoria.id.toString(), name: novaCategoria.nome };
  }}
/>
```

### Dropdowns que precisam dessa funcionalidade:

1. **Unidade de Medida** (Produto)
2. **Categoria** (Produto, Serviço, DRE)
3. **Tipo de Produto** (se mantido)
4. **Motivo de Ajuste** (Movimentação de Estoque)
5. **Categoria DRE** (Contas a Pagar/Receber)
6. **Forma de Pagamento** (Vendas, OS)
7. **Fornecedor** (Compras)
8. **Cliente** (Vendas, OS)

---

## 📅 Cronograma Sugerido

### Fase 1: Backend - Serviços (2-3 dias)
1. Criar modelo `Servico`
2. Criar serializer e ViewSet
3. Adicionar rotas na API
4. Criar script de migração
5. Testar endpoints

### Fase 2: Frontend - Serviços (3-4 dias)
1. Criar tipos TypeScript
2. Adicionar métodos na API client
3. Criar páginas (listagem, cadastro, edição)
4. Atualizar sidebar
5. Remover tipo "serviço" de Produtos
6. Integrar com OS

### Fase 3: Dropdowns Dinâmicos (4-5 dias)
1. Criar componente `SelectWithCreate`
2. Implementar para Categoria
3. Implementar para Unidade de Medida
4. Implementar para Motivo de Ajuste
5. Implementar para outros dropdowns
6. Testar criação e atualização em tempo real

---

## ✅ Checklist de Validação

### Serviços
- [ ] Modelo criado e migrado
- [ ] API funcionando (CRUD completo)
- [ ] Páginas frontend criadas
- [ ] Serviços aparecem na OS
- [ ] Produtos não mostram mais tipo "serviço"
- [ ] Dados migrados corretamente

### Dropdowns Dinâmicos
- [ ] Componente reutilizável criado
- [ ] Botão "+" aparece em todos os dropdowns
- [ ] Modal de criação funciona
- [ ] Lista atualiza sem reload
- [ ] Novo item é selecionado automaticamente
- [ ] Validação de campos funciona
- [ ] Tratamento de erros implementado

---

**Criado em**: 2025-11-26  
**Prioridade**: Alta ⭐  
**Estimativa Total**: 9-12 dias
