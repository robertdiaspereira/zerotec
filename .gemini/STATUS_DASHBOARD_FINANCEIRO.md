# 📊 Dashboard Financeiro - Status da Implementação

## ✅ Concluído

### Frontend
1. ✅ **Tipos atualizados** (`frontend/src/types/index.ts`)
   - Adicionado `contas_receber` com hoje, restante_mes, atrasadas
   - Adicionado `contas_pagar` com hoje, restante_mes, atrasadas

2. ✅ **Dashboard com cards clicáveis** (`frontend/src/app/dashboard/page.tsx`)
   - Cards "A Receber" e "A Pagar" implementados
   - Cada linha clicável com link para fluxo de caixa filtrado
   - Últimas movimentações agora são clicáveis (venda, OS, pagamento, recebimento)

### URLs dos Cards Financeiros
- `/financeiro/fluxo-caixa?tipo=receber&filtro=hoje`
- `/financeiro/fluxo-caixa?tipo=receber&filtro=restante_mes`
- `/financeiro/fluxo-caixa?tipo=receber&filtro=atrasadas`
- `/financeiro/fluxo-caixa?tipo=pagar&filtro=hoje`
- `/financeiro/fluxo-caixa?tipo=pagar&filtro=restante_mes`
- `/financeiro/fluxo-caixa?tipo=pagar&filtro=atrasadas`

---

## ⏳ Pendente - BACKEND

### 1. Atualizar Dashboard View (`apps/dashboard/views.py`)

Precisa adicionar os cálculos de contas a receber e pagar:

```python
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum

# No método get() da DashboardView:
hoje = timezone.now().date()
inicio_mes = hoje.replace(day=1)
fim_mes = (inicio_mes + timedelta(days=32)).replace(day=1) - timedelta(days=1)

# Contas a Receber
contas_receber_hoje = ContaReceber.objects.filter(
    data_vencimento=hoje,
    status='pendente'
).aggregate(total=Sum('valor_original'))['total'] or 0

contas_receber_restante = ContaReceber.objects.filter(
    data_vencimento__gt=hoje,
    data_vencimento__lte=fim_mes,
    status='pendente'
).aggregate(total=Sum('valor_original'))['total'] or 0

contas_receber_atrasadas = ContaReceber.objects.filter(
    data_vencimento__lt=hoje,
    status='pendente'
).aggregate(total=Sum('valor_original'))['total'] or 0

# Contas a Pagar
contas_pagar_hoje = ContaPagar.objects.filter(
    data_vencimento=hoje,
    status='pendente'
).aggregate(total=Sum('valor_original'))['total'] or 0

contas_pagar_restante = ContaPagar.objects.filter(
    data_vencimento__gt=hoje,
    data_vencimento__lte=fim_mes,
    status='pendente'
).aggregate(total=Sum('valor_original'))['total'] or 0

contas_pagar_atrasadas = ContaPagar.objects.filter(
    data_vencimento__lt=hoje,
    status='pendente'
).aggregate(total=Sum('valor_original'))['total'] or 0

# Adicionar ao response['kpis']:
'contas_receber': {
    'hoje': float(contas_receber_hoje),
    'restante_mes': float(contas_receber_restante),
    'atrasadas': float(contas_receber_atrasadas),
    'total_mes': float(contas_receber_hoje + contas_receber_restante),
},
'contas_pagar': {
    'hoje': float(contas_pagar_hoje),
    'restante_mes': float(contas_pagar_restante),
    'atrasadas': float(contas_pagar_atrasadas),
    'total_mes': float(contas_pagar_hoje + contas_pagar_restante),
},
```

---

## ⏳ Pendente - MÓDULO FINANCEIRO

### 2. Criar Módulo Financeiro Completo

**Estrutura necessária:**

```
apps/financeiro/
├── __init__.py
├── models.py          # ContaPagar, ContaReceber
├── serializers.py     # Serializers para as contas
├── views.py           # ViewSets para CRUD
├── urls.py            # Rotas da API
└── admin.py           # Admin do Django
```

**Frontend necessário:**

```
frontend/src/app/financeiro/
├── layout.tsx                          # Layout com sidebar
├── fluxo-caixa/
│   └── page.tsx                        # Página principal com filtros
├── contas-receber/
│   ├── page.tsx                        # Listagem
│   ├── [id]/
│   │   └── page.tsx                    # Detalhes
│   └── nova/
│       └── page.tsx                    # Criar nova
└── contas-pagar/
    ├── page.tsx                        # Listagem
    ├── [id]/
    │   └── page.tsx                    # Detalhes
    └── nova/
        └── page.tsx                    # Criar nova
```

### 3. Página de Fluxo de Caixa

**Funcionalidades necessárias:**
- Ler query params `tipo` e `filtro`
- Exibir contas a receber e pagar em uma única view
- Filtros:
  - Por data (hoje, restante do mês, atrasadas)
  - Por tipo (receber/pagar)
  - Por status (pendente, pago, vencido)
- Ações: Marcar como pago, editar, excluir
- Totalizadores por período

---

## 📝 Outras Melhorias Solicitadas

### 4. Numeração Sequencial Simplificada
- **OS**: Mudar de `OS000053` para `OS01`, `OS02`, etc.
- **Vendas**: Mudar de `VD000053` para `VD01`, `VD02`, etc.
- **Serviços**: Quando implementado, usar `SER01`, `SER02`, etc.

**Implementação:**
- Backend: Ajustar geração de números nos models
- Usar contador simples incremental
- Formato: `{PREFIXO}{NUMERO}` (ex: `OS1`, `VD1`)

---

## 🎯 Próximos Passos Recomendados

1. **URGENTE**: Implementar backend do dashboard (cálculos financeiros)
2. **ALTA**: Criar módulo financeiro completo (models, views, serializers)
3. **ALTA**: Criar página de fluxo de caixa com filtros
4. **MÉDIA**: Ajustar numeração sequencial (OS, VD, SER)
5. **BAIXA**: Outras melhorias da lista

---

## 🚀 Para Testar Agora

O frontend já está pronto! Para testar:

1. Acesse `/dashboard`
2. Os cards "A Receber" e "A Pagar" estarão visíveis
3. Clique em qualquer linha (Hoje, Restante do mês, Em Atraso)
4. Será redirecionado para `/financeiro/fluxo-caixa` com filtros
5. **NOTA**: A página de fluxo de caixa ainda não existe, precisa ser criada

**Valores mostrados**: Atualmente `R$ 0,00` porque o backend ainda não está retornando os dados.
