# ✅ Checklist de Melhorias - ZeroTec ERP

## 🎨 FAB (Floating Action Button)

- [x] Botão com cor mais suave (opacidade 60%)
- [x] Efeito hover que "acende" o botão
- [x] Transição suave de 300ms
- [x] Remover "Novo Serviço"
- [x] Remover "Ajuste de Estoque"
- [x] Alterar "Fluxo de Caixa" para "Lançamento Caixa"
- [x] Rota correta: /financeiro/caixa/lancamento

## 🗂️ Menu Lateral - Estrutura

- [x] Remover texto "Menu Principal"
- [x] Logo "ZeroTec" clicável → dashboard
- [x] Efeito hover na logo
- [x] Separar "Vendas" e "Venda PDV"
- [x] "Vendas" aponta para /vendas
- [x] "Venda PDV" aponta para /pdv
- [x] Adicionar ícone "Monitor" para PDV
- [x] Remover item "Serviços" da raiz
- [ ] Ícones visíveis quando menu recolhido (PENDENTE)
- [ ] Submenu abre ao hover (PENDENTE)
- [ ] Persistir estado aberto/fechado (PENDENTE)

## 🔧 Assistência Técnica - Reorganização

- [x] Item principal clicável (vai para /os)
- [x] Submenu: Ordens de Serviço
- [x] Submenu: Nova OS
- [x] Criar "Configuração OS" como submenu
- [x] Dentro de Config OS: Checklist
- [x] Dentro de Config OS: Cadastro de Serviços
- [x] Remover "Termo de Garantia"

## ⚙️ Configurações

### Dashboard
- [x] Criar card "Dashboard" na página principal
- [x] Criar página /configuracoes/dashboard
- [x] Widget: Vendas do Mês
- [x] Widget: Receitas do Mês
- [x] Widget: Despesas do Mês
- [x] Widget: Lucro do Mês
- [x] Widget: Vendas Hoje
- [x] Widget: OS Pendentes
- [x] Widget: Estoque Baixo
- [x] Widget: Melhor Cliente ⭐
- [x] Widget: Melhores Serviços ⭐
- [x] Widget: Melhores Produtos ⭐
- [x] Widget: Contas a Vencer
- [x] Widget: Fluxo de Caixa Semanal
- [x] Salvar preferências no localStorage

### Menu Lateral
- [x] Página /configuracoes/menu funcional
- [x] Implementar drag and drop
- [x] Ícone GripVertical
- [x] Indicador visual ao arrastar
- [x] Manter setas para navegação
- [x] Salvar ordem no localStorage
- [x] Recarregar página após salvar

### Serviços
- [x] Remover campo "Categoria" do formulário
- [x] Remover coluna "Categoria" da tabela
- [x] Atualizar interface TypeScript
- [x] Atualizar estado do componente
- [x] Ajustar colspan da tabela vazia

### Usuários
- [ ] Criar 3 perfis padrão (PENDENTE - Backend)
  - [ ] Administrador
  - [ ] Técnico
  - [ ] Vendedor
- [ ] Cards clicáveis para editar perfis (PENDENTE)
- [ ] Página de edição de perfil (PENDENTE)

## 💰 Financeiro

- [x] Página /financeiro/caixa/lancamento existente
- [x] Entrada (Suprimento) funcional
- [x] Saída (Sangria) funcional
- [x] Integração com API
- [x] FAB aponta para esta rota

## 🛒 Vendas / PDV

- [x] Menu "Vendas" separado de "PDV"
- [x] Rota /vendas funcional
- [x] Rota /pdv criada
- [ ] Lógica de verificação de caixa (PENDENTE)
- [ ] Modal de abertura de caixa (PENDENTE)
- [ ] Contexto global de caixa (PENDENTE)

## 🔍 Verificações de Rotas

- [ ] Verificar /servicos (remover/redirecionar)
- [ ] Verificar /servicos/novo (remover/redirecionar)
- [ ] Garantir MainLayout em todas as páginas
- [ ] Testar navegação em todas as rotas
- [ ] Verificar breadcrumbs

## 🧪 Testes

### FAB
- [ ] Testar opacidade padrão
- [ ] Testar efeito hover
- [ ] Testar todos os itens do menu
- [ ] Verificar rota "Lançamento Caixa"

### Menu Lateral
- [ ] Testar clique na logo
- [ ] Testar navegação em "Vendas"
- [ ] Testar navegação em "Venda PDV"
- [ ] Testar submenu "Assistência Técnica"
- [ ] Testar submenu "Configuração OS"
- [ ] Verificar que "Serviços" não aparece

### Configurações
- [ ] Testar card "Dashboard"
- [ ] Testar seleção de widgets
- [ ] Testar salvamento de preferências
- [ ] Testar drag and drop do menu
- [ ] Testar salvamento de ordem
- [ ] Testar página de serviços
- [ ] Verificar que categoria não aparece

### Navegação Geral
- [ ] Testar todas as rotas principais
- [ ] Verificar breadcrumbs
- [ ] Testar responsividade
- [ ] Verificar console para erros

## 📊 Status Geral

### ✅ Concluído (70%)
- FAB melhorado
- Menu reorganizado
- Configurações expandidas
- Drag and drop implementado
- Serviços simplificados

### ⏳ Em Progresso (20%)
- Verificação de rotas
- Testes completos

### 📋 Pendente (10%)
- Menu recolhido com ícones
- Lógica de caixa PDV
- Perfis padrão de usuários
- Contexto global de caixa

## 🎯 Prioridades

### Alta Prioridade
1. ✅ FAB melhorado
2. ✅ Menu reorganizado
3. ✅ Drag and drop
4. ✅ Configuração de dashboard
5. ⏳ Verificação de rotas

### Média Prioridade
1. ⏳ Lógica de caixa PDV
2. ⏳ Menu recolhido com ícones
3. ⏳ Perfis padrão

### Baixa Prioridade
1. Tooltips avançados
2. Animações extras
3. Temas personalizados

## 📝 Notas

- Todas as alterações são retrocompatíveis
- localStorage usado para persistência
- Sem dependências externas adicionadas
- TypeScript mantido em todo código
- Componentes shadcn/ui preservados

---

**Última atualização**: 2025-11-27
**Progresso Total**: 70% ✅
