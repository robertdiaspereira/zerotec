# Plano de Melhorias - ZeroTec ERP

## 1. FAB (Floating Action Button) - Melhorias Visuais ✓
- [ ] Alterar opacidade do botão FAB (esmaecido por padrão)
- [ ] Adicionar efeito hover para "acender" o botão
- [ ] Remover itens: "Novo Serviço" e "Ajuste de Estoque"
- [ ] Alterar "Fluxo de Caixa" para "Lançamento Caixa" (rota: /financeiro/caixa/lancamento)

## 2. Menu Lateral - Comportamento ao Recolher ✓
- [ ] Manter ícones visíveis quando menu recolhido
- [ ] Submenu abre ao passar mouse sobre ícone
- [ ] Permitir clique no ícone para navegação
- [ ] Persistir estado do menu (aberto/fechado) entre páginas
- [ ] Remover texto "Menu Principal"
- [ ] Logo/nome "ZeroTec" redireciona para dashboard ao clicar

## 3. Configurações - Dashboard Card ✓
- [ ] Adicionar card "Dashboard" em /configuracoes
- [ ] Permitir usuário configurar widgets do dashboard
- [ ] Opções: melhor cliente, melhores serviços, etc.

## 4. Menu Lateral - Correções de Rotas ✓
- [ ] Verificar todas as rotas onde menu não abre
- [ ] Garantir MainLayout em todas as páginas

## 5. Configurações > Menu - Drag and Drop ✓
- [ ] Implementar funcionalidade de arrastar e soltar
- [ ] Permitir reordenação dos itens do menu
- [ ] Salvar ordem personalizada

## 6. Serviços - Reestruturação ✓
- [ ] Remover /servicos da raiz (menu lateral)
- [ ] Remover /servicos/novo da raiz
- [ ] Mover para Assistência Técnica > Configuração OS > Cadastro de Serviços
- [ ] Em /configuracoes/servicos: remover categoria
- [ ] Listar serviços cadastrados + formulário na mesma página

## 7. Assistência Técnica - Reorganização ✓
- [ ] Remover "Termo de Garantia" (já está em Configuração > Empresa)
- [ ] Criar submenu "Configuração OS" com:
  - Checklist
  - Cadastro de Serviços
- [ ] Simplificar menu: apenas "Assistência Técnica" clicável
- [ ] Ao clicar: abre /os (listagem de OS)
- [ ] Botão "Nova OS" dentro da página

## 8. Configurações > Usuários - Perfis Padrão ✓
- [ ] Criar 3 perfis padrão: Administrador, Técnico, Vendedor
- [ ] Cards clicáveis para personalizar cada perfil
- [ ] Remover necessidade de criar perfil antes de usuário

## 9. Vendas - Separação Menu ✓
- [ ] Criar 2 itens separados no menu:
  - **Vendas**: abre /vendas (listagem) + botão "Nova Venda"
  - **Venda PDV**: abre página de quebra de caixa
- [ ] Lógica PDV:
  - Se caixa aberto → vai para venda PDV
  - Se caixa fechado → solicita abertura + valor inicial

## 10. Configurações > Menu - Personalização ✓
- [ ] Permitir usuário alterar ordem do menu
- [ ] Interface drag-and-drop em /configuracoes/menu
- [ ] Salvar preferências do usuário

## Prioridades
1. FAB - melhorias visuais
2. Menu lateral - comportamento ao recolher
3. Assistência Técnica - reorganização
4. Serviços - reestruturação
5. Vendas - separação menu
6. Configurações - novos cards
7. Usuários - perfis padrão
8. Menu - personalização drag-and-drop
