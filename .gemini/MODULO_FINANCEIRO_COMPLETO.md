# 💰 Módulo Financeiro Completo - Plano de Implementação

## 🎯 Visão Geral

Sistema financeiro completo com controle de contas bancárias, contas a pagar/receber, fluxo de caixa, conciliação bancária e relatórios financeiros.

---

## 📊 Estrutura do Módulo

### Backend ✅ JÁ EXISTE!
- ✅ `ContaBancaria` - Contas bancárias
- ✅ `CategoriaFinanceira` - Categorias de receitas/despesas
- ✅ `ContaPagar` - Contas a pagar
- ✅ `ContaReceber` - Contas a receber
- ✅ `FluxoCaixa` - Movimentações financeiras

### Frontend ⏳ A IMPLEMENTAR
```
/financeiro/
├── layout.tsx                          # Layout com sidebar
├── page.tsx                            # Dashboard financeiro
├── contas-bancarias/
│   ├── page.tsx                        # Listagem
│   ├── [id]/page.tsx                   # Detalhes + Extrato
│   ├── [id]/editar/page.tsx           # Editar
│   └── nova/page.tsx                   # Criar nova
├── contas-receber/
│   ├── page.tsx                        # Listagem
│   ├── [id]/page.tsx                   # Detalhes
│   ├── [id]/editar/page.tsx           # Editar
│   ├── nova/page.tsx                   # Criar nova
│   └── receber/page.tsx                # Ação de recebimento
├── contas-pagar/
│   ├── page.tsx                        # Listagem
│   ├── [id]/page.tsx                   # Detalhes
│   ├── [id]/editar/page.tsx           # Editar
│   ├── nova/page.tsx                   # Criar nova
│   └── pagar/page.tsx                  # Ação de pagamento
├── fluxo-caixa/
│   └── page.tsx                        # Fluxo de caixa consolidado
├── categorias/
│   └── page.tsx                        # Gerenciar categorias
└── relatorios/
    ├── dre/page.tsx                    # DRE
    ├── balancete/page.tsx              # Balancete
    └── conciliacao/page.tsx            # Conciliação bancária
```

---

## 🏦 1. CONTAS BANCÁRIAS

### Funcionalidades Principais

#### Listagem (`/financeiro/contas-bancarias`)
**Cards de Resumo**:
- Total em todas as contas
- Conta com maior saldo
- Conta com menor saldo
- Número de contas ativas

**Tabela**:
- Banco
- Agência
- Conta
- Tipo (Corrente, Poupança, Investimento)
- Saldo Atual
- Status (Ativa/Inativa)
- Ações

**Recursos**:
- Filtro por banco
- Filtro por status
- Busca por agência/conta
- Ordenação por saldo
- **Linha clicável** → Detalhes

#### Detalhes (`/financeiro/contas-bancarias/[id]`)
**Seções**:
1. **Informações da Conta**:
   - Banco, Agência, Conta
   - Tipo de conta
   - Saldo inicial
   - Saldo atual
   - Data de abertura

2. **Extrato Bancário**:
   - Tabela de movimentações
   - Filtro por período
   - Filtro por tipo (entrada/saída)
   - Busca por descrição
   - Exportar PDF/Excel

3. **Gráfico de Evolução**:
   - Saldo ao longo do tempo
   - Entradas vs Saídas

4. **Conciliação**:
   - Saldo no sistema vs Saldo real
   - Diferença
   - Botão "Conciliar"

#### Criar/Editar Conta
**Campos**:
- Banco (select com principais bancos)
- Agência
- Conta
- Dígito
- Tipo (Corrente, Poupança, Investimento, Caixa)
- Saldo Inicial
- Data de Abertura
- Observações
- Status (Ativa/Inativa)

**Validações**:
- Agência e conta obrigatórios
- Saldo inicial não negativo
- Não permitir duplicatas (mesmo banco/agência/conta)

---

## 💸 2. CONTAS A RECEBER

### Funcionalidades Principais

#### Listagem (`/financeiro/contas-receber`)
**Cards de Resumo**:
- A receber hoje
- A receber esta semana
- A receber este mês
- Atrasadas (em vermelho)
- Total a receber

**Tabela**:
- Número
- Cliente
- Descrição
- Vencimento
- Valor Original
- Valor Recebido
- Saldo
- Status (badge colorido)
- Ações

**Filtros Avançados**:
- Por status (Pendente, Recebido, Atrasado, Cancelado)
- Por cliente
- Por período (vencimento)
- Por forma de pagamento
- Por categoria
- Por conta bancária

**Ações em Lote**:
- Marcar múltiplas como recebidas
- Exportar selecionadas
- Enviar lembrete por email

#### Detalhes (`/financeiro/contas-receber/[id]`)
**Seções**:
1. **Informações Principais**:
   - Número, Cliente, Descrição
   - Valor original
   - Descontos
   - Juros/Multa
   - Valor total
   - Status

2. **Datas**:
   - Emissão
   - Vencimento
   - Recebimento (se pago)
   - Dias de atraso

3. **Pagamento**:
   - Forma de pagamento
   - Conta bancária
   - Valor recebido
   - Data de recebimento
   - Comprovante (upload)

4. **Histórico**:
   - Timeline de mudanças
   - Recebimentos parciais
   - Observações

**Ações**:
- Receber (total ou parcial)
- Editar
- Cancelar
- Enviar lembrete
- Imprimir boleto/recibo
- Duplicar

#### Receber Conta (`/financeiro/contas-receber/receber`)
**Modal/Página de Recebimento**:
- Valor a receber
- Valor recebido (permitir parcial)
- Desconto
- Juros/Multa
- **Conta bancária** (select)
- Forma de pagamento
- Data de recebimento
- Observações
- Upload de comprovante

**Cálculos Automáticos**:
- Juros por atraso (configurável)
- Multa por atraso (configurável)
- Desconto por antecipação (opcional)

---

## 💳 3. CONTAS A PAGAR

### Funcionalidades Principais

#### Listagem (`/financeiro/contas-pagar`)
**Cards de Resumo**:
- A pagar hoje
- A pagar esta semana
- A pagar este mês
- Atrasadas (em vermelho)
- Total a pagar

**Tabela**:
- Número
- Fornecedor
- Descrição
- Vencimento
- Valor Original
- Valor Pago
- Saldo
- Status (badge colorido)
- Ações

**Filtros** (mesmos de Contas a Receber)

**Ações em Lote**:
- Marcar múltiplas como pagas
- Agendar pagamentos
- Exportar selecionadas

#### Pagar Conta (`/financeiro/contas-pagar/pagar`)
**Modal/Página de Pagamento**:
- Valor a pagar
- Valor pago (permitir parcial)
- Desconto obtido
- Juros/Multa
- **Conta bancária** (select) ⭐
- Forma de pagamento
- Data de pagamento
- Observações
- Upload de comprovante

---

## 📈 4. FLUXO DE CAIXA

### Visão Consolidada (`/financeiro/fluxo-caixa`)

**Filtros**:
- Período (hoje, semana, mês, personalizado)
- Conta bancária (todas ou específica)
- Tipo (entrada/saída/ambos)
- Categoria
- Status (realizado/previsto)

**Visualizações**:

#### Modo Tabela
| Data | Descrição | Categoria | Tipo | Conta | Valor | Saldo |
|------|-----------|-----------|------|-------|-------|-------|
| 25/11 | Venda VD01 | Vendas | ↗ | Itaú | +R$ 1.500 | R$ 10.500 |
| 25/11 | Aluguel | Despesas | ↘ | Itaú | -R$ 1.200 | R$ 9.300 |

#### Modo Gráfico
- Gráfico de barras: Entradas vs Saídas por período
- Gráfico de linha: Evolução do saldo
- Gráfico de pizza: Despesas por categoria

#### Cards de Resumo
- Saldo inicial
- Total de entradas
- Total de saídas
- Saldo final
- Maior entrada
- Maior saída

**Recursos Avançados**:
- Projeção de fluxo de caixa (próximos 30/60/90 dias)
- Alertas de saldo baixo
- Comparação com períodos anteriores
- Exportar relatório (PDF/Excel)

---

## 📂 5. CATEGORIAS FINANCEIRAS

### Gerenciamento (`/financeiro/categorias`)

**Tipos**:
- Receitas
- Despesas

**Funcionalidades**:
- Criar categoria
- Editar categoria
- Ativar/Desativar
- Definir cor (para gráficos)
- Definir ícone
- Hierarquia (categoria pai/filha)

**Categorias Padrão**:

**Receitas**:
- Vendas de Produtos
- Vendas de Serviços
- Ordens de Serviço
- Outras Receitas

**Despesas**:
- Fornecedores
- Salários
- Impostos
- Aluguel
- Energia
- Telefone/Internet
- Marketing
- Manutenção
- Outras Despesas

---

## 📊 6. RELATÓRIOS FINANCEIROS

### DRE - Demonstração do Resultado do Exercício
**Já existe**: `/relatorios/dre`

### Balancete
**Novo**: `/financeiro/relatorios/balancete`
- Receitas por categoria
- Despesas por categoria
- Resultado (lucro/prejuízo)
- Comparação com meses anteriores

### Conciliação Bancária
**Novo**: `/financeiro/relatorios/conciliacao`
- Saldo no sistema vs Saldo no banco
- Lançamentos não conciliados
- Diferenças
- Ação de conciliar

---

## 🎨 Design e UX

### Cores por Status

**Contas a Receber/Pagar**:
- Pendente: Azul (`bg-blue-500`)
- Recebido/Pago: Verde (`bg-green-500`)
- Atrasado: Vermelho (`bg-red-500`)
- Cancelado: Cinza (`bg-gray-500`)

**Fluxo de Caixa**:
- Entrada: Verde (`text-green-600`)
- Saída: Vermelho (`text-red-600`)

### Ícones
- Contas Bancárias: 🏦 `Building2`
- Contas a Receber: 💰 `TrendingUp`
- Contas a Pagar: 💸 `TrendingDown`
- Fluxo de Caixa: 📊 `BarChart3`
- Categorias: 📂 `FolderTree`

---

## 🚀 Ordem de Implementação Sugerida

### Fase 1: Fundação (1-2 dias)
1. **Layout Financeiro** (`/financeiro/layout.tsx`)
   - Sidebar com menu
   - Breadcrumbs
   - Dashboard financeiro básico

2. **Contas Bancárias** (4-5h)
   - Listagem
   - Criar/Editar
   - Detalhes básicos

### Fase 2: Contas (2-3 dias)
3. **Contas a Receber** (6-8h)
   - Listagem com filtros
   - Criar/Editar
   - Detalhes
   - Ação de receber

4. **Contas a Pagar** (6-8h)
   - Listagem com filtros
   - Criar/Editar
   - Detalhes
   - Ação de pagar

### Fase 3: Fluxo de Caixa (1-2 dias)
5. **Fluxo de Caixa** (6-8h)
   - Visão consolidada
   - Filtros avançados
   - Gráficos
   - Projeções

### Fase 4: Categorias e Relatórios (1-2 dias)
6. **Categorias** (2-3h)
   - CRUD completo
   - Hierarquia

7. **Relatórios** (4-5h)
   - Balancete
   - Conciliação
   - Exportações

**Total Estimado**: 6-9 dias de trabalho

---

## 💡 Funcionalidades Avançadas (Futuro)

### Automações
- [ ] Recorrências (contas mensais automáticas)
- [ ] Lembretes por email/WhatsApp
- [ ] Integração com bancos (Open Banking)
- [ ] Importação de OFX/CSV

### Inteligência
- [ ] Previsão de fluxo de caixa (ML)
- [ ] Alertas inteligentes
- [ ] Sugestões de otimização
- [ ] Análise de tendências

### Integrações
- [ ] Emissão de boletos
- [ ] PIX automático
- [ ] Nota fiscal eletrônica
- [ ] Contabilidade

---

## 📝 Checklist de Implementação

### Contas Bancárias
- [ ] Listagem
- [ ] Criar
- [ ] Editar
- [ ] Detalhes
- [ ] Extrato
- [ ] Conciliação
- [ ] Gráficos

### Contas a Receber
- [ ] Listagem
- [ ] Filtros avançados
- [ ] Criar
- [ ] Editar
- [ ] Detalhes
- [ ] Receber (total/parcial)
- [ ] Histórico
- [ ] Ações em lote

### Contas a Pagar
- [ ] Listagem
- [ ] Filtros avançados
- [ ] Criar
- [ ] Editar
- [ ] Detalhes
- [ ] Pagar (total/parcial)
- [ ] Histórico
- [ ] Ações em lote

### Fluxo de Caixa
- [ ] Visão consolidada
- [ ] Filtros
- [ ] Modo tabela
- [ ] Modo gráfico
- [ ] Projeções
- [ ] Exportações

### Categorias
- [ ] CRUD
- [ ] Hierarquia
- [ ] Cores e ícones

### Relatórios
- [ ] Balancete
- [ ] Conciliação
- [ ] Exportações

---

## 🎯 Prioridade no Roadmap Geral

**ALTA** - Implementar após:
- ✅ Dashboard financeiro (backend) - FEITO!
- ⏳ Ordens de Serviço

**Ordem sugerida**:
1. Contas Bancárias (base para tudo)
2. Fluxo de Caixa (visão geral)
3. Contas a Receber (entrada de dinheiro)
4. Contas a Pagar (saída de dinheiro)
5. Categorias
6. Relatórios

---

**Este é o plano para criar o MELHOR sistema financeiro! 🚀**
