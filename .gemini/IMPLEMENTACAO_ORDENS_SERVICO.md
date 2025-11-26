# 🔧 Ordens de Serviço (OS) - Implementação

## 🎯 Objetivo
Criar páginas de Ordens de Serviço para que todos os links do dashboard funcionem corretamente.

---

## 📋 Páginas Necessárias

### 1. Listagem de OS (`/os`)
**Prioridade**: ALTA  
**Tempo Estimado**: 2-3 horas

**Funcionalidades**:
- Tabela com todas as OS
- Colunas:
  - Número (OS01, OS02...)
  - Cliente
  - Equipamento
  - Status (badge colorido)
  - Prioridade
  - Data Abertura
  - Data Previsão
  - Valor Total
  - Ações
- Filtros:
  - Por status (aberta, em andamento, aguardando peças, concluída, cancelada)
  - Por prioridade (baixa, média, alta, urgente)
  - Por período (data abertura)
  - Por cliente
  - Por técnico
- Busca por número ou cliente
- Cards de resumo:
  - Total de OS abertas
  - OS em andamento
  - OS aguardando peças
  - Valor total em aberto
- **Linha clicável** → `/os/[id]`
- Botão "Nova OS" → `/os/nova`

### 2. Detalhes da OS (`/os/[id]`)
**Prioridade**: ALTA  
**Tempo Estimado**: 3-4 horas

**Seções**:
1. **Cabeçalho**:
   - Número da OS
   - Status (badge grande)
   - Prioridade
   - Botões: Editar, Imprimir, Excluir

2. **Dados do Cliente**:
   - Nome
   - Telefone/Celular
   - Email
   - Link para perfil do cliente

3. **Informações do Equipamento**:
   - Equipamento
   - Marca/Modelo
   - Número de Série
   - Defeito Reclamado
   - Defeito Constatado
   - Solução Aplicada

4. **Serviços e Produtos**:
   - Tabela de serviços realizados
   - Tabela de produtos/peças utilizadas
   - Subtotais

5. **Valores**:
   - Valor Serviços
   - Valor Produtos
   - Desconto
   - Frete
   - **Valor Total**

6. **Datas**:
   - Data Abertura
   - Data Previsão
   - Data Conclusão

7. **Observações**:
   - Observações internas
   - Observações para o cliente

8. **Histórico**:
   - Timeline de mudanças de status
   - Anotações do técnico

### 3. Nova OS (`/os/nova`)
**Prioridade**: ALTA  
**Tempo Estimado**: 4-5 horas

**Formulário em Etapas** (Wizard):

#### Etapa 1: Cliente e Equipamento
- Seleção de cliente (com busca)
- Botão "+" para criar cliente rápido
- Equipamento
- Marca/Modelo
- Número de Série
- Defeito Reclamado

#### Etapa 2: Diagnóstico
- Defeito Constatado
- Solução Proposta
- Prioridade
- Data Previsão
- Técnico Responsável

#### Etapa 3: Serviços
- Adicionar serviços
- Quantidade
- Valor unitário
- Desconto
- Subtotal

#### Etapa 4: Produtos/Peças
- Buscar produto no estoque
- Quantidade
- Valor unitário
- Desconto
- Subtotal
- **Atualizar estoque automaticamente**

#### Etapa 5: Finalização
- Resumo de valores
- Desconto geral
- Frete
- Forma de pagamento
- Observações
- Botão "Criar OS"

### 4. Editar OS (`/os/[id]/editar`)
**Prioridade**: MÉDIA  
**Tempo Estimado**: 2 horas

- Mesmo formulário da criação
- Pré-preenchido com dados existentes
- Permitir mudança de status
- Adicionar/remover serviços e produtos

---

## 🔗 Links do Dashboard que Precisam Funcionar

### Últimas Movimentações
```tsx
// Quando tipo === 'os'
<Link href={`/os/${mov.id}`}>
  OS {numero} - {cliente}
</Link>
```

### Card de OS do Mês
```tsx
<Card>
  <Link href="/os?status=aberta">
    {kpis.os_mes.abertas} abertas
  </Link>
  <Link href="/os?status=concluida">
    {kpis.os_mes.concluidas} concluídas
  </Link>
</Card>
```

---

## 🎨 Design e UX

### Status com Cores
- **Aberta**: Azul (`bg-blue-500`)
- **Em Andamento**: Amarelo (`bg-yellow-500`)
- **Aguardando Peças**: Laranja (`bg-orange-500`)
- **Concluída**: Verde (`bg-green-500`)
- **Cancelada**: Vermelho (`bg-red-500`)

### Prioridade com Ícones
- **Baixa**: 🟢 Verde
- **Média**: 🟡 Amarelo
- **Alta**: 🟠 Laranja
- **Urgente**: 🔴 Vermelho piscando

### Timeline de Status
```
[Aberta] → [Em Andamento] → [Aguardando Peças] → [Concluída]
                                    ↓
                              [Cancelada]
```

---

## 📊 Backend - Verificação

### Models Existentes
✅ `apps/assistencia/models.py` - `OrdemServico`

### Serializers
✅ `apps/assistencia/serializers.py` - `OrdemServicoSerializer`

### Views
✅ `apps/assistencia/views.py` - `OrdemServicoViewSet`

### URLs
✅ `/api/os/` - Endpoint já configurado

**Conclusão**: Backend JÁ EXISTE! Só precisa criar o frontend.

---

## 🚀 Ordem de Implementação Sugerida

1. **Listagem** (`/os`) - 2-3h
   - Criar página básica
   - Tabela com dados
   - Filtros básicos
   - Linhas clicáveis

2. **Detalhes** (`/os/[id]`) - 3-4h
   - Layout de detalhes
   - Todas as seções
   - Botões de ação

3. **Nova OS** (`/os/nova`) - 4-5h
   - Formulário wizard
   - Validações
   - Integração com API

4. **Editar** (`/os/[id]/editar`) - 2h
   - Reutilizar formulário de criação
   - Pré-preencher dados

**Total Estimado**: 11-14 horas (~2 dias de trabalho)

---

## 📝 Checklist de Implementação

### Listagem
- [ ] Criar `frontend/src/app/os/page.tsx`
- [ ] Criar `frontend/src/app/os/layout.tsx` (com sidebar)
- [ ] Implementar tabela com dados da API
- [ ] Adicionar filtros (status, prioridade, período)
- [ ] Adicionar busca
- [ ] Cards de resumo (KPIs)
- [ ] Tornar linhas clicáveis
- [ ] Botão "Nova OS"
- [ ] Paginação

### Detalhes
- [ ] Criar `frontend/src/app/os/[id]/page.tsx`
- [ ] Layout de detalhes
- [ ] Seção de cliente
- [ ] Seção de equipamento
- [ ] Seção de serviços
- [ ] Seção de produtos
- [ ] Seção de valores
- [ ] Seção de datas
- [ ] Seção de observações
- [ ] Timeline de status
- [ ] Botões de ação (editar, imprimir, excluir)

### Nova OS
- [ ] Criar `frontend/src/app/os/nova/page.tsx`
- [ ] Wizard multi-etapas
- [ ] Etapa 1: Cliente e Equipamento
- [ ] Etapa 2: Diagnóstico
- [ ] Etapa 3: Serviços
- [ ] Etapa 4: Produtos
- [ ] Etapa 5: Finalização
- [ ] Validações
- [ ] Integração com API
- [ ] Feedback de sucesso/erro

### Editar
- [ ] Criar `frontend/src/app/os/[id]/editar/page.tsx`
- [ ] Reutilizar componentes de criação
- [ ] Pré-preencher dados
- [ ] Permitir mudança de status
- [ ] Atualização via API

---

## 🎯 Prioridade no Roadmap

**ALTA** - Necessário para:
- Links do dashboard funcionarem
- Fluxo completo de atendimento
- Integração com estoque
- Relatórios financeiros

**Implementar após**:
- ✅ Dashboard financeiro (backend)
- ⏳ Fluxo de caixa

**Implementar antes de**:
- Separação Produtos/Serviços
- Dropdowns dinâmicos
- Configurações
