# 🔧 Ordem de Serviço - Funcionalidades Avançadas

## 📋 Análise do Sistema de Referência

### Funcionalidades Observadas:

#### 1. **Tabs de Navegação**
- ✅ Ordem de Serviço (principal)
- ✅ Prestar Serviço
- ✅ Procurar Produtos
- ✅ Anexos

#### 2. **Dados Principais**
- ✅ Cliente (dropdown)
- ✅ Status (dropdown)
- ✅ Data Início
- ✅ Data Entrega
- ✅ Responsável
- ✅ Equipamento
- ✅ Nº de Série
- ✅ Marca
- ✅ Modelo

#### 3. **Checklist de Itens**
```
☐ PERIFÉRICOS
☐ LENTE CARREGADOR
☐ COM CARTÃO SD
☐ DESBLOQUEADO
☐ TELA QUEBRADA
☐ COM FONTE
☐ MARCAS DE USO
☐ COM CAPINHA
☐ COM CABO
☐ PELÍCULA TRINCADA
☐ COM CHIP
```

#### 4. **Campos de Texto**
- ✅ Obs. sobre o recebimento do equipamento
- ✅ Descrição do problema ou defeito relatado
- ✅ Laudo técnico
- ✅ Termo de garantia (texto fixo)
- ✅ Observações internas (não aparece para cliente)

#### 5. **Carrinho de Produtos/Serviços**
- ✅ Tabela com colunas: ID, Produto/Serviço, Tipo, Qtd, Valor, Total, Ação
- ✅ Adicionar produtos
- ✅ Adicionar serviços
- ✅ Remover itens

#### 6. **Resumo do Pedido**
```
Total Produtos:    R$ 0,00
Total Serviços:    R$ 0,00
Frete:            R$ 0,00
Desconto:         R$ 0,00
Em Reais:         R$ 0,00
─────────────────────────
Total Geral:      R$ 0,00
```

#### 7. **Pagamento**
- ✅ Forma de pagamento (dropdown)
- ✅ Adicionar Protocolo de Entrega (toggle)

#### 8. **Anexos**
- ✅ Upload de fotos
- ✅ Múltiplos anexos

---

## 🎯 Melhorias para Implementar

### 1. **Tabs de Navegação**

```tsx
<Tabs defaultValue="dados" className="w-full">
  <TabsList className="grid w-full grid-cols-4">
    <TabsTrigger value="dados">Ordem de Serviço</TabsTrigger>
    <TabsTrigger value="servicos">Serviços</TabsTrigger>
    <TabsTrigger value="produtos">Produtos</TabsTrigger>
    <TabsTrigger value="anexos">Anexos</TabsTrigger>
  </TabsList>

  <TabsContent value="dados">
    {/* Formulário principal */}
  </TabsContent>

  <TabsContent value="servicos">
    {/* Adicionar serviços */}
  </TabsContent>

  <TabsContent value="produtos">
    {/* Buscar e adicionar produtos */}
  </TabsContent>

  <TabsContent value="anexos">
    {/* Upload de fotos */}
  </TabsContent>
</Tabs>
```

---

### 2. **Checklist Customizável**

```tsx
interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

const checklistPadrao: ChecklistItem[] = [
  { id: "perifericos", label: "PERIFÉRICOS", checked: false },
  { id: "lente_carregador", label: "LENTE CARREGADOR", checked: false },
  { id: "cartao_sd", label: "COM CARTÃO SD", checked: false },
  { id: "desbloqueado", label: "DESBLOQUEADO", checked: false },
  { id: "tela_quebrada", label: "TELA QUEBRADA", checked: false },
  { id: "com_fonte", label: "COM FONTE", checked: false },
  { id: "marcas_uso", label: "MARCAS DE USO", checked: false },
  { id: "com_capinha", label: "COM CAPINHA", checked: false },
  { id: "com_cabo", label: "COM CABO", checked: false },
  { id: "pelicula_trincada", label: "PELÍCULA TRINCADA", checked: false },
  { id: "com_chip", label: "COM CHIP", checked: false },
];

// Componente
<Card>
  <CardHeader>
    <CardTitle>Checklist</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-3 gap-4">
      {checklist.map((item) => (
        <div key={item.id} className="flex items-center space-x-2">
          <Checkbox
            id={item.id}
            checked={item.checked}
            onCheckedChange={(checked) => 
              handleChecklistChange(item.id, checked as boolean)
            }
          />
          <label htmlFor={item.id} className="text-sm">
            {item.label}
          </label>
        </div>
      ))}
    </div>
  </CardContent>
</Card>
```

---

### 3. **Carrinho de Produtos/Serviços**

```tsx
interface CarrinhoItem {
  id: string;
  tipo: 'produto' | 'servico';
  produto_id?: number;
  nome: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
}

const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);

const adicionarItem = (item: CarrinhoItem) => {
  setCarrinho([...carrinho, { ...item, id: Date.now().toString() }]);
};

const removerItem = (id: string) => {
  setCarrinho(carrinho.filter(item => item.id !== id));
};

const calcularTotais = () => {
  const totalProdutos = carrinho
    .filter(i => i.tipo === 'produto')
    .reduce((sum, i) => sum + i.valor_total, 0);
  
  const totalServicos = carrinho
    .filter(i => i.tipo === 'servico')
    .reduce((sum, i) => sum + i.valor_total, 0);
  
  return { totalProdutos, totalServicos };
};

// Componente
<Card>
  <CardHeader>
    <CardTitle>Produtos e Serviços</CardTitle>
  </CardHeader>
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Produto/Serviço</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead className="text-center">Qtd</TableHead>
          <TableHead className="text-right">Valor</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="text-right">Ação</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {carrinho.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.nome}</TableCell>
            <TableCell>
              <Badge variant={item.tipo === 'produto' ? 'default' : 'secondary'}>
                {item.tipo === 'produto' ? 'Produto' : 'Serviço'}
              </Badge>
            </TableCell>
            <TableCell className="text-center">{item.quantidade}</TableCell>
            <TableCell className="text-right">
              {formatCurrency(item.valor_unitario)}
            </TableCell>
            <TableCell className="text-right font-medium">
              {formatCurrency(item.valor_total)}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removerItem(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CardContent>
</Card>
```

---

### 4. **Buscar e Adicionar Produtos**

```tsx
// Tab "Produtos"
<TabsContent value="produtos">
  <Card>
    <CardHeader>
      <CardTitle>Procurar Produtos</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Buscar produto..."
          value={buscaProduto}
          onChange={(e) => setBuscaProduto(e.target.value)}
        />
        <Button onClick={buscarProdutos}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {produtosEncontrados.length > 0 && (
        <div className="space-y-2">
          {produtosEncontrados.map((produto) => (
            <div
              key={produto.id}
              className="flex items-center justify-between border p-3 rounded-lg"
            >
              <div>
                <p className="font-medium">{produto.nome}</p>
                <p className="text-sm text-muted-foreground">
                  Estoque: {produto.estoque_atual}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  max={produto.estoque_atual}
                  defaultValue="1"
                  className="w-20"
                  id={`qtd-${produto.id}`}
                />
                <Button
                  size="sm"
                  onClick={() => {
                    const qtd = parseInt(
                      (document.getElementById(`qtd-${produto.id}`) as HTMLInputElement).value
                    );
                    adicionarProdutoAoCarrinho(produto, qtd);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
</TabsContent>
```

---

### 5. **Adicionar Serviços**

```tsx
// Tab "Serviços"
<TabsContent value="servicos">
  <Card>
    <CardHeader>
      <CardTitle>Adicionar Serviço</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Label>Descrição do Serviço</Label>
        <Input
          placeholder="Ex: Troca de tela"
          value={novoServico.descricao}
          onChange={(e) => 
            setNovoServico({ ...novoServico, descricao: e.target.value })
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Quantidade</Label>
          <Input
            type="number"
            min="1"
            value={novoServico.quantidade}
            onChange={(e) => 
              setNovoServico({ ...novoServico, quantidade: parseInt(e.target.value) })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Valor Unitário</Label>
          <Input
            type="number"
            step="0.01"
            value={novoServico.valor}
            onChange={(e) => 
              setNovoServico({ ...novoServico, valor: parseFloat(e.target.value) })
            }
          />
        </div>
      </div>

      <Button onClick={adicionarServico} className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Adicionar Serviço
      </Button>
    </CardContent>
  </Card>
</TabsContent>
```

---

### 6. **Upload de Anexos**

```tsx
// Tab "Anexos"
<TabsContent value="anexos">
  <Card>
    <CardHeader>
      <CardTitle>Anexos e Fotos</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="border-2 border-dashed rounded-lg p-8 text-center">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Clique para adicionar fotos
          </p>
        </label>
      </div>

      {anexos.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {anexos.map((anexo, index) => (
            <div key={index} className="relative group">
              <img
                src={anexo.preview}
                alt={`Anexo ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                onClick={() => removerAnexo(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
</TabsContent>
```

---

### 7. **Resumo do Pedido**

```tsx
<Card className="sticky top-6">
  <CardHeader>
    <CardTitle>Resumo do Pedido</CardTitle>
  </CardHeader>
  <CardContent className="space-y-2">
    <div className="flex justify-between text-sm">
      <span>Total Produtos:</span>
      <span>{formatCurrency(totais.totalProdutos)}</span>
    </div>
    <div className="flex justify-between text-sm">
      <span>Total Serviços:</span>
      <span>{formatCurrency(totais.totalServicos)}</span>
    </div>
    <div className="flex justify-between text-sm">
      <span>Frete:</span>
      <Input
        type="number"
        step="0.01"
        value={frete}
        onChange={(e) => setFrete(parseFloat(e.target.value) || 0)}
        className="w-24 h-8 text-right"
      />
    </div>
    <div className="flex justify-between text-sm">
      <span>Desconto:</span>
      <Input
        type="number"
        step="0.01"
        value={desconto}
        onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)}
        className="w-24 h-8 text-right"
      />
    </div>
    <Separator />
    <div className="flex justify-between text-lg font-bold">
      <span>Total Geral:</span>
      <span>{formatCurrency(calcularTotalGeral())}</span>
    </div>
  </CardContent>
</Card>
```

---

### 8. **Observações Separadas**

```tsx
<div className="space-y-4">
  <div className="space-y-2">
    <Label>Observações sobre o recebimento</Label>
    <Textarea
      placeholder="Descreva o estado do equipamento ao receber"
      value={formData.obs_recebimento}
      onChange={(e) => handleChange('obs_recebimento', e.target.value)}
      rows={2}
    />
  </div>

  <div className="space-y-2">
    <Label>Laudo Técnico</Label>
    <Textarea
      placeholder="Diagnóstico técnico detalhado"
      value={formData.laudo_tecnico}
      onChange={(e) => handleChange('laudo_tecnico', e.target.value)}
      rows={3}
    />
  </div>

  <div className="space-y-2">
    <Label>Observações Internas (não aparece para o cliente)</Label>
    <Textarea
      placeholder="Observações apenas para uso interno"
      value={formData.obs_internas}
      onChange={(e) => handleChange('obs_internas', e.target.value)}
      rows={2}
      className="border-yellow-300 bg-yellow-50"
    />
    <p className="text-xs text-yellow-600">
      ⚠️ Estas observações não serão exibidas para o cliente
    </p>
  </div>

  <div className="space-y-2">
    <Label>Observações para o Cliente</Label>
    <Textarea
      placeholder="Informações que serão exibidas para o cliente"
      value={formData.obs_cliente}
      onChange={(e) => handleChange('obs_cliente', e.target.value)}
      rows={2}
    />
  </div>
</div>
```

---

## 📊 Estrutura de Dados Atualizada

### Backend - Modelo OrdemServico

```python
class OrdemServico(models.Model):
    # ... campos existentes ...
    
    # Checklist
    checklist = models.JSONField(default=dict, blank=True)
    
    # Observações separadas
    obs_recebimento = models.TextField(blank=True)
    laudo_tecnico = models.TextField(blank=True)
    obs_internas = models.TextField(blank=True)  # Não aparece para cliente
    obs_cliente = models.TextField(blank=True)
    
    # Valores adicionais
    valor_frete = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Pagamento
    forma_pagamento = models.CharField(max_length=50, blank=True)
    protocolo_entrega = models.BooleanField(default=False)

class OSAnexo(models.Model):
    ordem_servico = models.ForeignKey(OrdemServico, on_delete=models.CASCADE, related_name='anexos')
    arquivo = models.FileField(upload_to='os_anexos/')
    tipo = models.CharField(max_length=50)  # 'foto', 'documento'
    descricao = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

---

## ✅ Checklist de Implementação

### Fase 1: Estrutura Base
- [ ] Criar tabs de navegação
- [ ] Implementar checklist customizável
- [ ] Separar observações (internas vs cliente)

### Fase 2: Carrinho
- [ ] Sistema de carrinho de produtos/serviços
- [ ] Buscar e adicionar produtos
- [ ] Adicionar serviços manualmente
- [ ] Calcular totais automaticamente

### Fase 3: Anexos
- [ ] Upload de múltiplas fotos
- [ ] Preview de imagens
- [ ] Remover anexos

### Fase 4: Resumo e Pagamento
- [ ] Card de resumo do pedido
- [ ] Campos de frete e desconto
- [ ] Forma de pagamento
- [ ] Protocolo de entrega

---

## 🎯 Prioridade

**ALTA** - Funcionalidades essenciais para OS profissional

**Estimativa**: 3-4 dias de trabalho

---

**OS completa e profissional! 🚀**
