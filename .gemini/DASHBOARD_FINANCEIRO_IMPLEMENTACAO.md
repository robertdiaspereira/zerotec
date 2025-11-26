# Dashboard Financeiro - Implementação

## Mudanças Necessárias

### 1. Tipos Atualizados ✅
Já atualizamos `frontend/src/types/index.ts` com:
```typescript
contas_receber: {
    hoje: number;
    restante_mes: number;
    atrasadas: number;
    total_mes: number;
};
contas_pagar: {
    hoje: number;
    restante_mes: number;
    atrasadas: number;
    total_mes: number;
};
```

### 2. Frontend - Dashboard Page

**Adicionar após os KPIs existentes (linha ~184):**

```tsx
{/* Financial Cards - Contas a Receber e Pagar */}
<div className="grid gap-4 md:grid-cols-2">
    {/* Contas a Receber */}
    <Card>
        <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">A Receber</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Hoje:</span>
                <span className="text-sm font-medium">
                    {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                    }).format(kpis.contas_receber?.hoje || 0)}
                </span>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Restante do mês:</span>
                <span className="text-sm font-medium">
                    {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                    }).format(kpis.contas_receber?.restante_mes || 0)}
                </span>
            </div>
            <div className="flex items-center justify-between border-t pt-3">
                <span className="text-sm font-semibold text-destructive">Em Atraso:</span>
                <span className="text-sm font-bold text-destructive">
                    {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                    }).format(kpis.contas_receber?.atrasadas || 0)}
                </span>
            </div>
        </CardContent>
    </Card>

    {/* Contas a Pagar */}
    <Card>
        <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">A Pagar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Hoje:</span>
                <span className="text-sm font-medium">
                    {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                    }).format(kpis.contas_pagar?.hoje || 0)}
                </span>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Restante do mês:</span>
                <span className="text-sm font-medium">
                    {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                    }).format(kpis.contas_pagar?.restante_mes || 0)}
                </span>
            </div>
            <div className="flex items-center justify-between border-t pt-3">
                <span className="text-sm font-semibold text-destructive">Em Atraso:</span>
                <span className="text-sm font-bold text-destructive">
                    {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                    }).format(kpis.contas_pagar?.atrasadas || 0)}
                </span>
            </div>
        </CardContent>
    </Card>
</div>
```

### 3. Tornar Movimentações Clicáveis

**Substituir o map das movimentações (linha ~235):**

```tsx
{ultimas_movimentacoes.map((mov) => {
    // Generate link based on movement type
    const getMovementLink = () => {
        switch (mov.tipo) {
            case 'venda':
                return `/vendas/${mov.id}`;
            case 'os':
                return `/os/${mov.id}`;
            case 'pagamento':
                return `/financeiro/contas-pagar`;
            case 'recebimento':
                return `/financeiro/contas-receber`;
            default:
                return '#';
        }
    };

    return (
        <Link
            key={mov.id}
            href={getMovementLink()}
            className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0 hover:bg-accent/50 rounded-md p-2 -m-2 transition-colors"
        >
            <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                    {mov.descricao}
                </p>
                <p className="text-xs text-muted-foreground">
                    {new Date(mov.data).toLocaleDateString("pt-BR")}
                </p>
            </div>
            <div className="text-sm font-medium">
                {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                }).format(mov.valor)}
            </div>
        </Link>
    );
})}
```

### 4. Backend - Atualizar View do Dashboard

**Arquivo:** `apps/dashboard/views.py`

Adicionar cálculos para contas_receber e contas_pagar:

```python
from django.utils import timezone
from datetime import datetime, timedelta

# No método get():
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

# Adicionar ao response:
'contas_receber': {
    'hoje': contas_receber_hoje,
    'restante_mes': contas_receber_restante,
    'atrasadas': contas_receber_atrasadas,
    'total_mes': contas_receber_hoje + contas_receber_restante,
},
'contas_pagar': {
    'hoje': contas_pagar_hoje,
    'restante_mes': contas_pagar_restante,
    'atrasadas': contas_pagar_atrasadas,
    'total_mes': contas_pagar_hoje + contas_pagar_restante,
},
```

## Status

- ✅ Tipos atualizados
- ⏳ Frontend - aguardando aplicação manual
- ⏳ Backend - aguardando implementação
