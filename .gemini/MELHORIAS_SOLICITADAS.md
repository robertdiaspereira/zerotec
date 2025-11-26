# 📝 Lista de Melhorias Solicitadas - ZeroTec ERP

**Data**: 2025-11-26  
**Prioridade**: Organizar e implementar gradualmente

---

## 🔴 URGENTE - Correções de Bugs

### 1. NaN em Valores Monetários
- [x] **Produtos**: Preço Custo mostrando R$ NaN
- [x] **Produtos**: Valor em Estoque mostrando R$ NaN  
- [x] **Vendas**: Desconto mostrando R$ NaN
- [ ] **Botão "Novo Produto"**: Não está clicando (falta Link wrapper)

**Solução**: Adicionar `Number()` coercion com fallback `|| 0` em todos os cálculos e displays monetários.

---

## 🟡 ALTA PRIORIDADE - Melhorias de UX

### 2. Menu de Ações em Vendas
- [x] Substituir botão simples por DropdownMenu
- [x] Adicionar opções:
  - Visualizar
  - Editar
  - Copiar
  - Cupom Fiscal
  - Exportar PDF
  - Excluir (destrutivo)
- [ ] Fazer linha inteira clicável para abrir detalhes
- [ ] Adicionar essas opções também na página de detalhes da venda

### 3. Melhorias em Clientes
- [ ] **Botão Ativar/Desativar** na listagem
- [ ] **Seleção múltipla** para excluir vários clientes de uma vez
- [ ] **Checkbox** em cada linha para seleção
- [ ] **Barra de ações em lote** quando itens estiverem selecionados

### 4. Dashboard - Cards Financeiros
Adicionar cards conforme imagem de referência:

#### A Receber
- [ ] **Hoje**: Valor a receber hoje
- [ ] **Restante do mês**: Valor a receber até o fim do mês
- [ ] **Em Atraso**: Valor em atraso (vermelho)

#### A Pagar
- [ ] **Hoje**: Valor a pagar hoje
- [ ] **Restante do mês**: Valor a pagar até o fim do mês
- [ ] **Em Atraso**: Valor em atraso (vermelho)

#### Gráfico de Faturamento
- [ ] **Verde**: Receitas/Entradas
- [ ] **Vermelho**: Custos
- [ ] **Amarelo**: Mão de Obra

---

## 🟢 MÉDIA PRIORIDADE - Novas Funcionalidades

### 5. Separação de Produtos e Serviços
- [ ] Backend: Criar modelo `Servico` separado
- [ ] Backend: Migrar serviços existentes
- [ ] Frontend: Criar menu "Serviços" na sidebar
- [ ] Frontend: Páginas de listagem/cadastro/edição de Serviços
- [ ] Frontend: Remover tipo "serviço" do cadastro de Produtos
- [ ] Frontend: Integrar serviços na criação de OS

### 6. Dropdowns Dinâmicos com Criação Rápida
Adicionar botão "+" em todos os dropdowns para criar novo item sem sair da tela:

- [ ] Unidade de Medida
- [ ] Categoria
- [ ] Tipo de Produto
- [ ] Motivo de Ajuste de Estoque
- [ ] Categoria DRE
- [ ] Forma de Pagamento
- [ ] Fornecedor
- [ ] Cliente

**Componente**: `SelectWithCreate` (reutilizável)

### 7. Configurações do Sistema
- [ ] **Reordenar itens da sidebar**: Drag & drop para personalizar ordem
- [ ] **Logo da empresa**: Upload e exibição no lugar da foto padrão
- [ ] **Outras configurações**: (a definir)

---

## 📊 Referência Visual - Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  Faturamento Bruto Ano: 2025                                │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                                                        │   │
│  │  Receitas  ████████████████████████  (Verde)         │   │
│  │  R$ 0,00                                              │   │
│  │                                                        │   │
│  │  Custos    ████████  (Vermelho)                       │   │
│  │  R$ 0,00                                              │   │
│  │                                                        │   │
│  │  Saldo                                                 │   │
│  │  R$ 0,00                                              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐  ┌──────────────────────┐
│  A Receber           │  │  A Pagar             │
│                      │  │                      │
│  Hoje:      R$ 0,00  │  │  Hoje:      R$ 0,00  │
│  Restante:  R$ 0,00  │  │  Restante:  R$ 0,00  │
│  Em Atraso: R$ 0,00  │  │  Em Atraso: R$ 80,00 │
│             (vermelho)│  │             (vermelho)│
└──────────────────────┘  └──────────────────────┘
```

---

## 🎯 Ordem de Implementação Sugerida

1. **Fase 1 - Correções Urgentes** (1 dia)
   - Corrigir todos os NaN
   - Corrigir botão "Novo Produto"
   - Adicionar menu de ações em Vendas

2. **Fase 2 - Dashboard Financeiro** (2-3 dias)
   - Adicionar cards A Receber/A Pagar
   - Implementar gráfico com cores (verde/vermelho/amarelo)
   - Conectar com API do backend

3. **Fase 3 - Melhorias em Clientes** (2 dias)
   - Botão Ativar/Desativar
   - Seleção múltipla e exclusão em lote

4. **Fase 4 - Dropdowns Dinâmicos** (4-5 dias)
   - Criar componente `SelectWithCreate`
   - Implementar em todos os dropdowns necessários

5. **Fase 5 - Separação Produtos/Serviços** (5-7 dias)
   - Backend: Modelo e migração
   - Frontend: Páginas e integração

6. **Fase 6 - Configurações** (3-4 dias)
   - Reordenação da sidebar
   - Upload de logo
   - Outras configurações

---

**Total Estimado**: 17-26 dias de desenvolvimento

**Prioridade Atual**: Fase 1 (Correções Urgentes)
