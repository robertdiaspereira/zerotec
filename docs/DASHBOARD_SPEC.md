# 📊 Dashboard - Especificação Completa

## Baseado no Sistema PHP Existente

---

## 🎯 Objetivo
Página principal do sistema que mostra uma visão geral do negócio com KPIs, gráficos e últimas movimentações.

---

## 📈 KPIs Principais (Cards no Topo)

### 1. Vendas do Mês
- **Total de Vendas** (quantidade)
- **Valor Total** de vendas do mês atual
- **Descontos** aplicados
- **Frete** cobrado

### 2. Ordens de Serviço do Mês
- **Total de OS** (quantidade)
- **Valor de Serviços**
- **Valor de Produtos** vendidos nas OS
- **Custos** das OS

### 3. Contas a Receber
- **Hoje**: Valores a receber hoje
- **Este Mês**: Valores a receber até o final do mês
- **Atrasadas**: Valores vencidos e não pagos

### 4. Contas a Pagar
- **Hoje**: Valores a pagar hoje
- **Este Mês**: Valores a pagar até o final do mês
- **Atrasadas**: Valores vencidos e não pagos

### 5. Despesas
- **Total de Despesas** do mês (categorias DRE)

---

## 📊 Gráficos Anuais

### 1. Gráfico de Vendas (Produtos)
- **Tipo**: Gráfico de linhas/barras
- **Dados**: Vendas mensais do ano atual
- **Eixo X**: Meses (Jan a Dez)
- **Eixo Y**: Valor em R$
- **Cores**: 
  - Receita: Verde/Azul
  - Custos: Vermelho/Laranja

### 2. Gráfico de Ordens de Serviço
- **Tipo**: Gráfico de linhas/barras
- **Dados**: OS mensais do ano atual
- **Separado em**:
  - Valor de Serviços
  - Valor de Produtos nas OS
  - Custos das OS

### 3. Gráfico Comparativo
- **Vendas vs Custos** (produtos)
- **OS vs Custos** (serviços)
- Visualização de lucro/margem

---

## 📋 Últimas Movimentações

### 1. Últimas Vendas
- **Campos**:
  - Número da venda
  - Cliente
  - Data
  - Valor total
  - Status
- **Quantidade**: 5-10 últimas vendas
- **Ação**: Link para ver detalhes

### 2. Últimas Ordens de Serviço
- **Campos**:
  - Número da OS
  - Cliente
  - Data
  - Valor total
  - Status
- **Quantidade**: 5-10 últimas OS
- **Ação**: Link para ver detalhes

### 3. Últimas Compras
- **Campos**:
  - Número da compra
  - Fornecedor
  - Data
  - Valor total
  - Status
- **Quantidade**: 5-10 últimas compras
- **Ação**: Link para ver detalhes

---

## 🔧 Funcionalidades

### Filtros
- **Período**: Selecionar mês/ano para visualização
- **Atualização**: Botão para atualizar dados

### Ações Rápidas
- **Nova Venda**: Botão para abrir PDV
- **Nova OS**: Botão para criar OS
- **Nova Compra**: Botão para registrar compra

---

## 💾 Dados Calculados

### Vendas do Mês
```python
# Período: Primeiro dia do mês até último dia
start_date = f"{year}-{month}-01"
end_date = f"{year}-{month}-31"

# Calcular:
- total_vendas = sum(vendas.valor_total)
- total_descontos = sum(vendas.desconto)
- total_frete = sum(vendas.frete)
- quantidade_vendas = count(vendas)
```

### OS do Mês
```python
# Calcular:
- total_os = count(os)
- valor_servicos = sum(os.valor_servicos)
- valor_produtos = sum(os.valor_produtos)
- custos = sum(os.custos)
```

### Contas a Receber
```python
# Hoje
hoje = date.today()
contas_hoje = contas_receber.filter(vencimento=hoje, pago=False)

# Este Mês
contas_mes = contas_receber.filter(
    vencimento__gte=hoje,
    vencimento__lte=ultimo_dia_mes,
    pago=False
)

# Atrasadas
contas_atrasadas = contas_receber.filter(
    vencimento__lt=hoje,
    pago=False
)
```

### Contas a Pagar
```python
# Mesma lógica das contas a receber
```

### Gráficos Anuais
```python
# Para cada mês do ano (1-12):
for mes in range(1, 13):
    start = f"{year}-{mes:02d}-01"
    end = f"{year}-{mes:02d}-31"
    
    vendas_mes[mes] = sum(vendas.filter(data__range=[start, end]).valor_total)
    custos_mes[mes] = sum(vendas.filter(data__range=[start, end]).custo_total)
    
    os_servicos[mes] = sum(os.filter(data__range=[start, end]).valor_servicos)
    os_produtos[mes] = sum(os.filter(data__range=[start, end]).valor_produtos)
    os_custos[mes] = sum(os.filter(data__range=[start, end]).custos)
```

---

## 🎨 Layout Sugerido

```
┌─────────────────────────────────────────────────────────────┐
│  DASHBOARD - Painel de Controle                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Vendas   │  │ OS       │  │ A Receber│  │ A Pagar  │   │
│  │ R$ 15.5k │  │ R$ 8.2k  │  │ R$ 3.2k  │  │ R$ 2.1k  │   │
│  │ 45 vendas│  │ 23 OS    │  │ 12 contas│  │ 8 contas │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                               │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  │
│  │ Gráfico Vendas Anual    │  │ Gráfico OS Anual        │  │
│  │                         │  │                         │  │
│  │  [Gráfico de Barras]    │  │  [Gráfico de Barras]    │  │
│  │                         │  │                         │  │
│  └─────────────────────────┘  └─────────────────────────┘  │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Últimas Movimentações                                   ││
│  ├─────────────────────────────────────────────────────────┤│
│  │ Vendas | OS | Compras                                   ││
│  │                                                          ││
│  │ [Tabela com últimas vendas]                             ││
│  │ [Tabela com últimas OS]                                 ││
│  │ [Tabela com últimas compras]                            ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 🔌 API Endpoints Necessários

### GET /api/relatorios/dashboard/
```json
{
  "periodo": {
    "mes": 11,
    "ano": 2025
  },
  "vendas": {
    "total": 15500.00,
    "quantidade": 45,
    "descontos": 500.00,
    "frete": 300.00
  },
  "os": {
    "total": 8200.00,
    "quantidade": 23,
    "servicos": 5000.00,
    "produtos": 3200.00,
    "custos": 2100.00
  },
  "contas_receber": {
    "hoje": 3200.00,
    "mes": 12500.00,
    "atrasadas": 1500.00
  },
  "contas_pagar": {
    "hoje": 2100.00,
    "mes": 8500.00,
    "atrasadas": 800.00
  },
  "despesas": 5200.00,
  "graficos": {
    "vendas_anual": [1200, 1500, 1800, ...],
    "custos_anual": [800, 1000, 1200, ...],
    "os_servicos_anual": [500, 600, 700, ...],
    "os_produtos_anual": [300, 400, 500, ...],
    "os_custos_anual": [200, 250, 300, ...]
  },
  "ultimas_movimentacoes": {
    "vendas": [...],
    "os": [...],
    "compras": [...]
  }
}
```

---

## ✅ Checklist de Implementação

- [ ] Criar endpoint `/api/relatorios/dashboard/`
- [ ] Implementar cálculo de vendas do mês
- [ ] Implementar cálculo de OS do mês
- [ ] Implementar cálculo de contas a receber
- [ ] Implementar cálculo de contas a pagar
- [ ] Implementar cálculo de despesas
- [ ] Implementar gráficos anuais (vendas)
- [ ] Implementar gráficos anuais (OS)
- [ ] Implementar últimas movimentações
- [ ] Criar testes unitários
- [ ] Documentar no Swagger

---

**Criado**: 2025-11-25
**Status**: Especificação completa - Pronto para implementação
