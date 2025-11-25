# 💰 DRE (Demonstrativo de Resultado do Exercício) - Especificação

## Baseado no Sistema PHP Existente

---

## 🎯 Objetivo
Relatório financeiro completo que mostra a estrutura de receitas, custos, despesas e lucro da empresa, seguindo o padrão contábil brasileiro.

---

## 📊 Estrutura do DRE

### 1. RECEITA OPERACIONAL BRUTA
- **(+) Vendas de Produtos** (ID: 1)
- **(+) Vendas de Mercadorias** (calculado: custo de vendas)
- **(+) Prestação de Serviços** (ID: 3)
- **(+) Frete** (calculado)

**Total Receita Bruta** = Soma de todos os itens acima

### 2. DEDUÇÕES DA RECEITA BRUTA
- **(-)  Devoluções de Vendas** (ID: 5)
- **(-) Abatimentos** (ID: 6 + descontos)
- **(-) Impostos e Contribuições sobre Vendas** (ID: 7)

**Total Deduções** = Soma de todos os itens acima

### 3. RECEITA OPERACIONAL LÍQUIDA
**ROL** = Receita Bruta - Deduções

### 4. CUSTOS DAS VENDAS
- **(-) Custo dos Produtos Vendidos** (ID: 8)
- **(-) Custo das Mercadorias** (calculado: buying_price)
- **(-) Custo dos Serviços Prestados** (ID: 10)

**Total Custos** = Soma de todos os itens acima

### 5. RESULTADO OPERACIONAL BRUTO (Lucro Bruto)
**Lucro Bruto** = ROL - Custos das Vendas

### 6. DESPESAS OPERACIONAIS
- **(-) Despesas com Vendas** (ID: 11)
- **(-) Despesas Administrativas** (ID: 12)
- **(-) Pagamento de Salários** (ID: 13)

**Total Despesas Operacionais** = Soma de todos os itens acima

### 7. DESPESAS FINANCEIRAS LÍQUIDAS
- **(-) Despesas Financeiras** (ID: 14)
- **(+) Variações Monetárias e Cambiais Passivas** (ID: 15)

**Total Despesas Financeiras Líquidas** = Variações - Despesas Financeiras

### 8. OUTRAS RECEITAS E DESPESAS
- **(+) Resultado da Equivalência Patrimonial** (ID: 16)
- **(+) Venda de Bens e Direitos** (ID: 17)
- **(-) Custo da Venda de Bens** (ID: 18)
- **(+) Outras Receitas** (ID: 21)
- **(-) Outras Despesas** (ID: 22)

**Total Outras Receitas/Despesas** = (16 + 17 + 21) - (18 + 22)

### 9. RESULTADO OPERACIONAL
**Resultado Operacional** = Lucro Bruto - Despesas Operacionais + Despesas Financeiras Líquidas + Outras Receitas/Despesas

### 10. PROVISÃO PARA IR E CSLL
- **(-) Provisão para Imposto de Renda e CSLL** (ID: 19)

### 11. LUCRO LÍQUIDO ANTES DAS PARTICIPAÇÕES
**Lucro antes Participações** = Resultado Operacional - Provisão IR/CSLL

### 12. PARTICIPAÇÕES
- **(-) Participações de Administradores** (ID: 20)

### 13. LUCRO LÍQUIDO DO EXERCÍCIO
**Lucro Líquido** = Lucro antes Participações - Participações

---

## 🏷️ Categorias DRE (IDs)

| ID | Nome | Tipo | Descrição |
|----|------|------|-----------|
| 1 | Vendas de Produtos | Receita | Venda de produtos |
| 3 | Prestação de Serviços | Receita | Serviços prestados |
| 5 | Devoluções de Vendas | Dedução | Vendas devolvidas |
| 6 | Abatimentos | Dedução | Abatimentos concedidos |
| 7 | Impostos sobre Vendas | Dedução | Impostos e contribuições |
| 8 | Custo dos Produtos | Custo | CPV - Custo produtos vendidos |
| 10 | Custo dos Serviços | Custo | Custo serviços prestados |
| 11 | Despesas com Vendas | Despesa | Comissões, marketing, etc |
| 12 | Despesas Administrativas | Despesa | Aluguel, água, luz, etc |
| 13 | Pagamento Salários | Despesa | Folha de pagamento |
| 14 | Despesas Financeiras | Despesa | Juros pagos, taxas |
| 15 | Variações Cambiais | Receita | Ganhos cambiais |
| 16 | Equivalência Patrimonial | Receita | Resultado de investimentos |
| 17 | Venda de Bens | Receita | Venda de ativos |
| 18 | Custo Venda de Bens | Custo | Custo dos ativos vendidos |
| 19 | Provisão IR/CSLL | Despesa | Imposto de renda |
| 20 | Participações | Despesa | Participações nos lucros |
| 21 | Outras Receitas | Receita | Receitas diversas |
| 22 | Outras Despesas | Despesa | Despesas diversas |

---

## 💾 Dados Calculados

### Vendas de Mercadorias
```python
# Soma do preço de venda de todos os produtos vendidos
vendas_mercadorias = sum(vendas.valor_produtos) + sum(os.valor_produtos)
```

### Custo das Mercadorias
```python
# Soma do preço de custo de todos os produtos vendidos
custo_mercadorias = sum(vendas.custo_produtos) + sum(os.custo_produtos)
```

### Frete
```python
# Soma de todos os fretes cobrados
frete = sum(vendas.frete) + sum(os.frete)
```

### Abatimentos
```python
# Soma de descontos + categoria 6
abatimentos = sum(vendas.desconto) + sum(os.desconto) + categoria_6
```

### Prestação de Serviços
```python
# Soma de serviços das OS
prestacao_servicos = sum(os.valor_servicos)
```

---

## 📅 Relatório Mensal e Anual

### DRE Mensal
- Selecionar mês/ano específico
- Mostrar todos os valores do mês
- Comparar com mês anterior

### DRE Anual
- Mostrar 12 colunas (uma para cada mês)
- Linha para cada item do DRE
- Coluna TOTAL no final
- Gráfico de evolução mensal

---

## 🎨 Layout Sugerido (DRE Anual)

```
┌────────────────────────────────────────────────────────────────┐
│  DRE - DEMONSTRATIVO DE RESULTADO DO EXERCÍCIO - 2025          │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Descrição          │ Jan │ Fev │ Mar │ ... │ Dez │ TOTAL     │
│  ─────────────────────────────────────────────────────────────│
│  RECEITA BRUTA                                                 │
│  Vendas Produtos    │ 10k │ 12k │ 15k │ ... │ 20k │ 180k     │
│  Vendas Mercadorias │  5k │  6k │  7k │ ... │ 10k │  90k     │
│  Serviços           │  3k │  4k │  5k │ ... │  8k │  60k     │
│  Frete              │  1k │  1k │  1k │ ... │  2k │  15k     │
│  ─────────────────────────────────────────────────────────────│
│  TOTAL BRUTO        │ 19k │ 23k │ 28k │ ... │ 40k │ 345k     │
│                                                                 │
│  DEDUÇÕES                                                       │
│  Devoluções         │  1k │  1k │  1k │ ... │  2k │  15k     │
│  Abatimentos        │  2k │  2k │  3k │ ... │  4k │  30k     │
│  Impostos           │  3k │  4k │  5k │ ... │  7k │  60k     │
│  ─────────────────────────────────────────────────────────────│
│  TOTAL DEDUÇÕES     │  6k │  7k │  9k │ ... │ 13k │ 105k     │
│                                                                 │
│  RECEITA LÍQUIDA    │ 13k │ 16k │ 19k │ ... │ 27k │ 240k     │
│                                                                 │
│  ... (continua com todos os itens)                             │
│                                                                 │
│  LUCRO LÍQUIDO      │  2k │  3k │  4k │ ... │  6k │  48k     │
│  Margem %           │ 15% │ 19% │ 21% │ ... │ 22% │  20%     │
└────────────────────────────────────────────────────────────────┘
```

---

## 🔌 API Endpoints

### GET /api/relatorios/dre/
**Parâmetros**:
- `ano` (obrigatório): Ano do relatório
- `mes` (opcional): Mês específico (1-12). Se não informado, retorna anual

**Resposta Mensal**:
```json
{
  "periodo": {
    "mes": 11,
    "ano": 2025
  },
  "receita_bruta": {
    "vendas_produtos": 10000.00,
    "vendas_mercadorias": 5000.00,
    "prestacao_servicos": 3000.00,
    "frete": 1000.00,
    "total": 19000.00
  },
  "deducoes": {
    "devolucoes": 1000.00,
    "abatimentos": 2000.00,
    "impostos": 3000.00,
    "total": 6000.00
  },
  "receita_liquida": 13000.00,
  "custos": {
    "produtos": 4000.00,
    "mercadorias": 2000.00,
    "servicos": 1000.00,
    "total": 7000.00
  },
  "lucro_bruto": 6000.00,
  "despesas_operacionais": {
    "vendas": 500.00,
    "administrativas": 1000.00,
    "salarios": 2000.00,
    "total": 3500.00
  },
  "despesas_financeiras_liquidas": -200.00,
  "outras_receitas_despesas": 100.00,
  "resultado_operacional": 2400.00,
  "provisao_ir_csll": 400.00,
  "lucro_antes_participacoes": 2000.00,
  "participacoes": 200.00,
  "lucro_liquido": 1800.00,
  "margem_liquida": 13.85
}
```

**Resposta Anual**:
```json
{
  "periodo": {
    "ano": 2025
  },
  "meses": [
    {
      "mes": 1,
      "receita_bruta": {...},
      "lucro_liquido": 1800.00
    },
    ...
  ],
  "totais": {
    "receita_bruta": 228000.00,
    "lucro_liquido": 48000.00,
    "margem_liquida": 21.05
  }
}
```

---

## ✅ Checklist de Implementação

- [ ] Criar model CategoriaDRE
- [ ] Migrar categorias padrão (IDs 1-22)
- [ ] Adicionar campo categoria_dre em ContaPagar/ContaReceber
- [ ] Criar endpoint /api/relatorios/dre/
- [ ] Implementar cálculo DRE mensal
- [ ] Implementar cálculo DRE anual
- [ ] Adicionar exportação PDF
- [ ] Adicionar exportação Excel
- [ ] Criar testes unitários
- [ ] Documentar no Swagger

---

**Criado**: 2025-11-25
**Status**: Especificação completa - Pronto para implementação
