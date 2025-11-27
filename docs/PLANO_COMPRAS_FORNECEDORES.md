# 📦 Plano de Implementação: Módulo de Compras e Fornecedores

## Status Atual

### Backend ✅ (100% Completo)
O backend Django já possui todos os modelos necessários:

**Fornecedores (`apps/erp/models.py`):**
- ✅ Modelo `Fornecedor` com:
  - Razão Social, Nome Fantasia
  - CNPJ, Inscrição Estadual
  - Endereço completo
  - Contatos (telefone, email, pessoa de contato)
  - Observações

**Compras (`apps/compras/models.py`):**
- ✅ `PedidoCompra` - Pedido de compra com fornecedor
- ✅ `ItemPedidoCompra` - Itens do pedido
- ✅ `RecebimentoMercadoria` - Entrada no estoque
- ✅ `ItemRecebimento` - Itens recebidos
- ✅ `Cotacao` - Cotação de preços (comparação)
- ✅ `ItemCotacao` - Itens cotados

**API Endpoints (verificar em `apps/compras/urls.py` e `apps/erp/urls.py`):**
- `/api/erp/fornecedores/` - CRUD de fornecedores
- `/api/compras/pedidos/` - CRUD de pedidos de compra
- `/api/compras/recebimentos/` - Recebimentos de mercadoria

### Frontend ❌ (0% Implementado)
Não existe nenhuma interface para:
- Cadastro de Fornecedores
- Gestão de Compras
- Recebimento de Mercadorias

---

## 🎯 Objetivos

### Objetivo Principal
Criar interface completa para o ciclo de compras:
1. **Cadastrar Fornecedores**
2. **Criar Pedidos de Compra** (saída de caixa)
3. **Receber Mercadorias** (entrada no estoque)

### Fluxo Esperado
```
Cadastro Fornecedor → Nova Compra → Pedido Criado → Recebimento → Estoque Atualizado
                                          ↓
                                   Saída no Caixa
```

---

## 📋 Tarefas Detalhadas

### Fase 1: Módulo de Fornecedores

#### 1.1 API Client (`frontend/src/lib/api.ts`)
Adicionar métodos:
```typescript
// Fornecedores
async getFornecedores(params?: Record<string, string | number>)
async getFornecedor(id: number)
async createFornecedor(data: unknown)
async updateFornecedor(id: number, data: unknown)
async deleteFornecedor(id: number)
```

#### 1.2 Página de Listagem (`/fornecedores/page.tsx`)
- Tabela com colunas:
  - Razão Social / Nome Fantasia
  - CNPJ
  - Cidade/Estado
  - Telefone
  - Email
  - Total de Compras (propriedade do modelo)
  - Ações (Editar, Ver Histórico)
- Filtros: Busca por nome/CNPJ, Cidade, Estado
- Botão "Novo Fornecedor"
- Cards de estatísticas:
  - Total de Fornecedores Ativos
  - Total Comprado (últimos 30 dias)
  - Fornecedor com Mais Compras

#### 1.3 Formulário de Cadastro/Edição (`/fornecedores/novo` e `/fornecedores/[id]/editar`)
- Abas:
  - **Dados Gerais**: Razão Social, Nome Fantasia, CNPJ, IE
  - **Endereço**: CEP, Logradouro, Número, Complemento, Bairro, Cidade, Estado
  - **Contato**: Telefone, Email, Nome do Contato, Cargo
  - **Observações**: Campo de texto livre
- Validação de CNPJ
- Integração com ViaCEP (opcional)

#### 1.4 Página de Detalhes (`/fornecedores/[id]`)
- Informações do fornecedor
- Histórico de compras (tabela)
- Gráfico de compras ao longo do tempo
- Total comprado

---

### Fase 2: Módulo de Compras

#### 2.1 API Client (`frontend/src/lib/api.ts`)
Adicionar métodos:
```typescript
// Pedidos de Compra
async getPedidosCompra(params?: Record<string, string | number>)
async getPedidoCompra(id: number)
async createPedidoCompra(data: unknown)
async updatePedidoCompra(id: number, data: unknown)
async aprovarPedidoCompra(id: number)
async cancelarPedidoCompra(id: number)

// Recebimentos
async getRecebimentos(params?: Record<string, string | number>)
async createRecebimento(data: unknown)
```

#### 2.2 Página de Listagem (`/compras/page.tsx`)
- Tabela com colunas:
  - Número do Pedido
  - Fornecedor
  - Data do Pedido
  - Data Prevista de Entrega
  - Status (Badge colorido)
  - Valor Total
  - Ações (Ver Detalhes, Receber, Cancelar)
- Filtros:
  - Status (Pendente, Aprovado, Em Trânsito, Recebido, Cancelado)
  - Fornecedor
  - Período (Data Início - Data Fim)
- Cards de estatísticas:
  - Total de Pedidos Ativos
  - Valor Total em Aberto
  - Pedidos Atrasados
  - Recebidos no Mês

#### 2.3 Formulário de Nova Compra (`/compras/novo/page.tsx`)
Similar ao formulário de Nova Venda, mas adaptado:

**Estrutura:**
- **Seleção de Fornecedor** (Select com busca)
- **Tabela de Produtos**:
  - Busca de produtos
  - Quantidade
  - Preço Unitário (editável)
  - Subtotal
  - Botão Remover
- **Resumo Financeiro** (Sidebar):
  - Total Produtos
  - Frete (+)
  - Desconto (-)
  - **Total Geral**
  - Forma de Pagamento (Select)
  - Condição de Pagamento (Input)
  - Data Prevista de Entrega
- **Observações**
- Botão "Salvar Pedido"

#### 2.4 Página de Detalhes do Pedido (`/compras/[id]/page.tsx`)
- Informações do pedido
- Dados do fornecedor
- Tabela de itens
- Status e histórico
- Botões de ação:
  - Aprovar Pedido
  - Cancelar Pedido
  - **Receber Mercadoria** (se aprovado)

#### 2.5 Página de Recebimento (`/compras/[id]/receber/page.tsx`)
- Informações do pedido
- Formulário:
  - Número da Nota Fiscal
  - Data de Recebimento (auto-preenchido)
  - Tabela de conferência:
    - Produto
    - Quantidade Pedida
    - Quantidade a Receber (Input)
    - Lote (opcional)
    - Data de Validade (opcional)
    - Checkbox "Conferido"
- Botão "Confirmar Recebimento"
- **Ação ao confirmar**:
  - Atualiza `quantidade_recebida` em `ItemPedidoCompra`
  - Cria `RecebimentoMercadoria` e `ItemRecebimento`
  - **Atualiza estoque do produto** (entrada)
  - Atualiza status do pedido para "Recebido" (se tudo foi recebido)
  - Registra saída no fluxo de caixa (Contas a Pagar)

---

## 🔄 Integração com Outros Módulos

### Estoque
- Ao receber mercadoria, criar movimentação de entrada no estoque
- Atualizar `estoque_atual` do produto

### Financeiro
- Ao criar pedido de compra, criar registro em Contas a Pagar
- Vincular ao fornecedor
- Data de vencimento baseada na condição de pagamento

### Dashboard
- Adicionar card "Compras do Mês"
- Gráfico de compras vs vendas

---

## 🎨 Design e UX

### Paleta de Cores para Compras
- **Primária**: Azul (diferente do verde de vendas)
- **Status**:
  - Pendente: Amarelo
  - Aprovado: Azul
  - Em Trânsito: Roxo
  - Recebido: Verde
  - Cancelado: Vermelho

### Ícones
- Fornecedores: `Building2`, `Truck`
- Compras: `ShoppingCart`, `Package`
- Recebimento: `PackageCheck`, `ClipboardCheck`

---

## 📊 Priorização

### Alta Prioridade (MVP)
1. ✅ Cadastro de Fornecedores (Listagem + CRUD)
2. ✅ Nova Compra (Formulário básico)
3. ✅ Recebimento de Mercadoria (Entrada no estoque)

### Média Prioridade
4. Cotação de Preços (comparar fornecedores)
5. Relatório de Compras
6. Histórico de Compras por Fornecedor

### Baixa Prioridade
7. Integração com XML de NF-e
8. Aprovação de compras (workflow)
9. Alertas de estoque mínimo → sugestão de compra

---

## 🚀 Ordem de Implementação Sugerida

### Sprint 1: Fornecedores (2-3 horas)
1. Adicionar métodos ao `api.ts`
2. Criar página de listagem
3. Criar formulário de cadastro/edição
4. Testar CRUD completo

### Sprint 2: Compras - Parte 1 (3-4 horas)
1. Adicionar métodos ao `api.ts`
2. Criar página de listagem de pedidos
3. Criar formulário de nova compra
4. Testar criação de pedido

### Sprint 3: Compras - Parte 2 (2-3 horas)
1. Criar página de detalhes do pedido
2. Criar página de recebimento
3. Implementar lógica de entrada no estoque
4. Testar fluxo completo

### Sprint 4: Integração Financeira (1-2 horas)
1. Criar registro em Contas a Pagar ao criar pedido
2. Atualizar status ao receber mercadoria
3. Testar integração com financeiro

---

## ✅ Checklist de Validação

Antes de considerar o módulo completo, validar:
- [ ] Consigo cadastrar um fornecedor
- [ ] Consigo editar um fornecedor
- [ ] Consigo ver histórico de compras do fornecedor
- [ ] Consigo criar um pedido de compra
- [ ] O pedido calcula corretamente (produtos + frete - desconto)
- [ ] Consigo receber a mercadoria
- [ ] O estoque é atualizado corretamente
- [ ] O status do pedido muda para "Recebido"
- [ ] É criado um registro em Contas a Pagar
- [ ] Os dados aparecem no Dashboard

---

**Criado em:** 27/11/2025  
**Prioridade:** Alta  
**Estimativa Total:** 8-12 horas de desenvolvimento
