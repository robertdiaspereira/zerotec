# 💰 Últimas Movimentações - Regras de Negócio

## 📊 O que deve aparecer

**Regra**: Apenas movimentações relacionadas a **entrada ou saída de dinheiro**.

### Tipos de Movimentações Financeiras

#### ✅ Devem Aparecer:
1. **Vendas** (Entrada de dinheiro)
   - Tipo: `venda`
   - Link: `/vendas/[id]`
   - Formato: "Venda VD01 - João Silva - R$ 1.500,00"

2. **Ordens de Serviço** (Entrada de dinheiro)
   - Tipo: `os`
   - Link: `/os/[id]`
   - Formato: "OS OS01 - Maria Santos - R$ 850,00"

3. **Compras** (Saída de dinheiro)
   - Tipo: `compra`
   - Link: `/compras/[id]`
   - Formato: "Compra CP01 - Fornecedor XYZ - R$ 2.300,00"

4. **Pagamentos** (Saída de dinheiro)
   - Tipo: `pagamento`
   - Link: `/financeiro/contas-pagar/[id]`
   - Formato: "Pagamento - Aluguel - R$ 1.200,00"

5. **Recebimentos** (Entrada de dinheiro)
   - Tipo: `recebimento`
   - Link: `/financeiro/contas-receber/[id]`
   - Formato: "Recebimento - Cliente ABC - R$ 500,00"

#### ❌ NÃO devem aparecer:
- Movimentações de estoque (entrada/saída de produtos)
- Ajustes de estoque
- Cadastros de clientes/fornecedores
- Outras operações sem impacto financeiro

---

## 🔧 Implementação Backend

### Arquivo: `apps/relatorios/views.py`
### Método: `_get_ultimas_movimentacoes()`

**Atualmente retorna**:
```python
{
    'vendas': [...],
    'os': [...],
    'compras': [...]
}
```

**Deve incluir também**:
```python
{
    'vendas': [...],
    'os': [...],
    'compras': [...],
    'pagamentos': [...],      # ADICIONAR
    'recebimentos': [...]     # ADICIONAR
}
```

### Query para Pagamentos
```python
# Últimos 10 pagamentos
ultimos_pagamentos = ContaPagar.objects.filter(
    status='pago'
).values(
    'id',
    'numero',
    'data_pagamento',
    'descricao',
    'fornecedor__razao_social',
    'valor_pago'
).order_by('-data_pagamento')[:10]
```

### Query para Recebimentos
```python
# Últimos 10 recebimentos
ultimos_recebimentos = ContaReceber.objects.filter(
    status='recebido'
).values(
    'id',
    'numero',
    'data_recebimento',
    'descricao',
    'cliente__nome_razao_social',
    'valor_recebido'
).order_by('-data_recebimento')[:10]
```

---

## 🎨 Implementação Frontend

### Arquivo: `frontend/src/app/dashboard/page.tsx`
### Método: `getMovementLink()`

**Atualizar para incluir novos tipos**:
```tsx
const getMovementLink = () => {
    switch (mov.tipo) {
        case 'venda':
            return `/vendas/${mov.id}`;
        case 'os':
            return `/os/${mov.id}`;
        case 'compra':
            return `/compras/${mov.id}`;
        case 'pagamento':
            return `/financeiro/contas-pagar/${mov.id}`;
        case 'recebimento':
            return `/financeiro/contas-receber/${mov.id}`;
        default:
            return '#';
    }
};
```

### Ícones por Tipo (Opcional)
```tsx
const getMovementIcon = (tipo: string) => {
    switch (tipo) {
        case 'venda':
            return <ShoppingCart className="h-4 w-4 text-green-600" />;
        case 'os':
            return <Wrench className="h-4 w-4 text-blue-600" />;
        case 'compra':
            return <Package className="h-4 w-4 text-red-600" />;
        case 'pagamento':
            return <ArrowDownRight className="h-4 w-4 text-red-600" />;
        case 'recebimento':
            return <ArrowUpRight className="h-4 w-4 text-green-600" />;
        default:
            return <DollarSign className="h-4 w-4" />;
    }
};
```

### Cores por Tipo
```tsx
const getMovementColor = (tipo: string) => {
    switch (tipo) {
        case 'venda':
        case 'os':
        case 'recebimento':
            return 'text-green-600'; // Entrada de dinheiro
        case 'compra':
        case 'pagamento':
            return 'text-red-600'; // Saída de dinheiro
        default:
            return 'text-foreground';
    }
};
```

---

## 📊 Formato de Exibição

### Layout Sugerido
```
┌─────────────────────────────────────────────────────┐
│  Últimas Movimentações                              │
├─────────────────────────────────────────────────────┤
│  [↗] Venda VD01 - João Silva          R$ 1.500,00  │
│      25/11/2025                                      │
├─────────────────────────────────────────────────────┤
│  [↗] OS OS01 - Maria Santos             R$ 850,00  │
│      25/11/2025                                      │
├─────────────────────────────────────────────────────┤
│  [↘] Compra CP01 - Fornecedor XYZ     R$ 2.300,00  │
│      24/11/2025                                      │
├─────────────────────────────────────────────────────┤
│  [↘] Pagamento - Aluguel              R$ 1.200,00  │
│      24/11/2025                                      │
├─────────────────────────────────────────────────────┤
│  [↗] Recebimento - Cliente ABC          R$ 500,00  │
│      23/11/2025                                      │
└─────────────────────────────────────────────────────┘

Legenda:
[↗] = Entrada (verde)
[↘] = Saída (vermelho)
```

---

## 🎯 Prioridade

**ALTA** - Implementar junto com:
- Backend do dashboard (adicionar pagamentos e recebimentos)
- Páginas de Contas a Pagar/Receber

---

## ✅ Checklist de Implementação

### Backend
- [ ] Adicionar query de pagamentos em `_get_ultimas_movimentacoes()`
- [ ] Adicionar query de recebimentos em `_get_ultimas_movimentacoes()`
- [ ] Atualizar `_format_movimentacoes()` para incluir novos tipos
- [ ] Testar endpoint `/api/dashboard/`

### Frontend
- [ ] Atualizar `getMovementLink()` com novos tipos
- [ ] Adicionar ícones por tipo (opcional)
- [ ] Adicionar cores por tipo (entrada/saída)
- [ ] Testar navegação para todos os tipos

### Páginas Necessárias
- [ ] `/compras/[id]` - Detalhes da compra
- [ ] `/financeiro/contas-pagar/[id]` - Detalhes do pagamento
- [ ] `/financeiro/contas-receber/[id]` - Detalhes do recebimento

---

## 📝 Observações

1. **Ordenação**: Por data (mais recente primeiro)
2. **Limite**: 10 movimentações mais recentes
3. **Filtro**: Apenas movimentações com impacto financeiro
4. **Status**: Apenas movimentações finalizadas/pagas/recebidas
5. **Clicável**: Todas as linhas devem abrir detalhes
