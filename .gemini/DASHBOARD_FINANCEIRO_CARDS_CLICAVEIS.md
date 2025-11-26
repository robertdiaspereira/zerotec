# Dashboard Financeiro - Cards Clicáveis

## Implementação dos Cards com Links para Fluxo de Caixa

### Cards A Receber e A Pagar - Com Filtros

```tsx
{/* Financial Cards - Contas a Receber e Pagar */}
<div className="grid gap-4 md:grid-cols-2">
    {/* Contas a Receber */}
    <Card>
        <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">A Receber</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
            {/* Hoje - Clicável */}
            <Link 
                href="/financeiro/fluxo-caixa?tipo=receber&filtro=hoje"
                className="flex items-center justify-between hover:bg-accent/50 rounded-md p-2 -m-2 transition-colors"
            >
                <span className="text-sm text-muted-foreground">Hoje:</span>
                <span className="text-sm font-medium">
                    {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                    }).format(kpis.contas_receber?.hoje || 0)}
                </span>
            </Link>

            {/* Restante do Mês - Clicável */}
            <Link 
                href="/financeiro/fluxo-caixa?tipo=receber&filtro=restante_mes"
                className="flex items-center justify-between hover:bg-accent/50 rounded-md p-2 -m-2 transition-colors"
            >
                <span className="text-sm text-muted-foreground">Restante do mês:</span>
                <span className="text-sm font-medium">
                    {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                    }).format(kpis.contas_receber?.restante_mes || 0)}
                </span>
            </Link>

            {/* Em Atraso - Clicável */}
            <Link 
                href="/financeiro/fluxo-caixa?tipo=receber&filtro=atrasadas"
                className="flex items-center justify-between border-t pt-3 hover:bg-accent/50 rounded-md p-2 -m-2 transition-colors"
            >
                <span className="text-sm font-semibold text-destructive">Em Atraso:</span>
                <span className="text-sm font-bold text-destructive">
                    {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                    }).format(kpis.contas_receber?.atrasadas || 0)}
                </span>
            </Link>
        </CardContent>
    </Card>

    {/* Contas a Pagar */}
    <Card>
        <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">A Pagar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
            {/* Hoje - Clicável */}
            <Link 
                href="/financeiro/fluxo-caixa?tipo=pagar&filtro=hoje"
                className="flex items-center justify-between hover:bg-accent/50 rounded-md p-2 -m-2 transition-colors"
            >
                <span className="text-sm text-muted-foreground">Hoje:</span>
                <span className="text-sm font-medium">
                    {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                    }).format(kpis.contas_pagar?.hoje || 0)}
                </span>
            </Link>

            {/* Restante do Mês - Clicável */}
            <Link 
                href="/financeiro/fluxo-caixa?tipo=pagar&filtro=restante_mes"
                className="flex items-center justify-between hover:bg-accent/50 rounded-md p-2 -m-2 transition-colors"
            >
                <span className="text-sm text-muted-foreground">Restante do mês:</span>
                <span className="text-sm font-medium">
                    {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                    }).format(kpis.contas_pagar?.restante_mes || 0)}
                </span>
            </Link>

            {/* Em Atraso - Clicável */}
            <Link 
                href="/financeiro/fluxo-caixa?tipo=pagar&filtro=atrasadas"
                className="flex items-center justify-between border-t pt-3 hover:bg-accent/50 rounded-md p-2 -m-2 transition-colors"
            >
                <span className="text-sm font-semibold text-destructive">Em Atraso:</span>
                <span className="text-sm font-bold text-destructive">
                    {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                    }).format(kpis.contas_pagar?.atrasadas || 0)}
                </span>
            </Link>
        </CardContent>
    </Card>
</div>
```

## Parâmetros de URL para Filtros

### Query Params:
- `tipo`: `receber` ou `pagar`
- `filtro`: `hoje`, `restante_mes`, ou `atrasadas`

### Exemplos de URLs:
- `/financeiro/fluxo-caixa?tipo=receber&filtro=hoje` - Contas a receber hoje
- `/financeiro/fluxo-caixa?tipo=receber&filtro=restante_mes` - Contas a receber restante do mês
- `/financeiro/fluxo-caixa?tipo=receber&filtro=atrasadas` - Contas a receber atrasadas
- `/financeiro/fluxo-caixa?tipo=pagar&filtro=hoje` - Contas a pagar hoje
- `/financeiro/fluxo-caixa?tipo=pagar&filtro=restante_mes` - Contas a pagar restante do mês
- `/financeiro/fluxo-caixa?tipo=pagar&filtro=atrasadas` - Contas a pagar atrasadas

## Página de Fluxo de Caixa

A página `/financeiro/fluxo-caixa` deve:

1. Ler os query params `tipo` e `filtro`
2. Aplicar os filtros automaticamente:
   - **hoje**: `data_vencimento = hoje`
   - **restante_mes**: `data_vencimento > hoje AND data_vencimento <= fim_do_mes`
   - **atrasadas**: `data_vencimento < hoje AND status = 'pendente'`
3. Filtrar por tipo (receber ou pagar)
4. Exibir a lista filtrada

## Próximos Passos

1. ✅ Criar cards clicáveis no dashboard
2. ⏳ Criar/atualizar página de Fluxo de Caixa
3. ⏳ Implementar leitura de query params
4. ⏳ Aplicar filtros automaticamente
