# Módulo de Relatórios

## 📊 Funcionalidades

### Dashboard Geral
- KPIs principais do negócio
- Vendas do mês vs mês anterior
- Contas a receber/pagar vencidas
- OS abertas
- Oportunidades no pipeline
- Top 5 produtos mais vendidos
- Top 5 clientes

### Relatório de Vendas
- Total de vendas por período
- Vendas por dia (gráfico)
- Vendas por cliente
- Vendas por produto
- Ticket médio
- Quantidade de vendas

### Relatório de Estoque
- Produtos com estoque baixo
- Valor total em estoque
- Movimentações recentes
- Produtos mais movimentados

### Relatório Financeiro (DRE)
- Receitas x Despesas
- Lucro líquido
- Margem percentual
- Fluxo de caixa por dia
- Contas a receber vencidas e a vencer
- Contas a pagar vencidas e a vencer

### Relatório de Ordens de Serviço
- Total de OS por período
- OS por status
- OS por técnico
- Tempo médio de conclusão
- Valor total de OS

## 📡 Endpoints

### Dashboard
```
GET /api/relatorios/dashboard/
```

Retorna KPIs principais:
```json
{
  "vendas": {
    "total_mes": 50000.00,
    "quantidade_mes": 25,
    "total_mes_passado": 45000.00,
    "crescimento_percentual": 11.11,
    "ticket_medio": 2000.00
  },
  "financeiro": {
    "contas_receber_vencidas": 5000.00,
    "contas_pagar_vencidas": 3000.00,
    "saldo_liquido": 10000.00
  },
  "os": {
    "abertas": 15,
    "mes": 30
  },
  "crm": {
    "oportunidades_abertas": 20,
    "valor_pipeline": 150000.00
  },
  "top_produtos": [...],
  "top_clientes": [...]
}
```

### Relatório de Vendas
```
GET /api/relatorios/vendas/
  ?data_inicio=2025-01-01
  &data_fim=2025-01-31
  &cliente_id=1
  &produto_id=1
```

### Relatório de Estoque
```
GET /api/relatorios/estoque/
```

### Relatório Financeiro
```
GET /api/relatorios/financeiro/
  ?data_inicio=2025-01-01
  &data_fim=2025-01-31
```

### Relatório de OS
```
GET /api/relatorios/os/
  ?data_inicio=2025-01-01
  &data_fim=2025-01-31
  &status=concluida
```

## 🎯 Uso Recomendado

### 1. Dashboard Principal
```javascript
// No frontend, chamar ao carregar a página
fetch('/api/relatorios/dashboard/')
  .then(res => res.json())
  .then(data => {
    // Exibir KPIs em cards
    // Criar gráficos
  })
```

### 2. Relatório de Vendas com Filtros
```javascript
const params = new URLSearchParams({
  data_inicio: '2025-01-01',
  data_fim: '2025-01-31',
  cliente_id: 1
})

fetch(`/api/relatorios/vendas/?${params}`)
  .then(res => res.json())
  .then(data => {
    // Exibir tabela de vendas
    // Criar gráfico de vendas por dia
  })
```

### 3. Monitorar Estoque Baixo
```javascript
fetch('/api/relatorios/estoque/')
  .then(res => res.json())
  .then(data => {
    if (data.produtos_estoque_baixo.length > 0) {
      // Alertar sobre produtos com estoque baixo
    }
  })
```

## 📈 Gráficos Recomendados (Frontend)

### Dashboard
- **Vendas do Mês:** Card com valor e % de crescimento
- **Contas Vencidas:** Cards de alerta (vermelho)
- **Top Produtos:** Gráfico de barras horizontal
- **Top Clientes:** Tabela

### Vendas
- **Vendas por Dia:** Gráfico de linha
- **Vendas por Produto:** Gráfico de pizza
- **Lista de Vendas:** Tabela com paginação

### Financeiro
- **Fluxo de Caixa:** Gráfico de barras (entradas vs saídas)
- **DRE:** Cards com receitas, despesas, lucro
- **Contas a Vencer:** Timeline

### Estoque
- **Produtos com Estoque Baixo:** Tabela com alerta
- **Movimentações:** Timeline
- **Valor em Estoque:** Card

### OS
- **OS por Status:** Gráfico de pizza
- **OS por Técnico:** Gráfico de barras
- **Tempo Médio:** Card

## 🔄 Atualização em Tempo Real

Para dashboard em tempo real, você pode:

1. **Polling:** Atualizar a cada X segundos
```javascript
setInterval(() => {
  fetch('/api/relatorios/dashboard/')
    .then(res => res.json())
    .then(updateDashboard)
}, 30000) // 30 segundos
```

2. **WebSockets:** Para atualizações instantâneas (implementar depois)

## 💡 Dicas de Implementação no Frontend

### Next.js
```typescript
// app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Card, LineChart, BarChart } from '@/components'

export default function Dashboard() {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    fetch('/api/relatorios/dashboard/')
      .then(res => res.json())
      .then(setData)
  }, [])
  
  if (!data) return <Loading />
  
  return (
    <div className="grid grid-cols-4 gap-4">
      <Card title="Vendas do Mês" value={data.vendas.total_mes} />
      <Card title="OS Abertas" value={data.os.abertas} />
      {/* ... */}
    </div>
  )
}
```

### Bibliotecas Recomendadas
- **Gráficos:** Recharts, Chart.js, ou ApexCharts
- **Tabelas:** TanStack Table (React Table)
- **Exportação:** jsPDF, xlsx

---

**Módulo de Relatórios completo!** 🎉

Todos os dados necessários para análise de negócio estão disponíveis via API.
