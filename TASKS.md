# 📋 Checklist de Tarefas - ZeroTec ERP

## Status Atual
✅ **Backend Django funcionando**
- Servidor rodando em http://127.0.0.1:8000/
- Todos os módulos carregados corretamente
- Database SQLite configurado

✅ **Frontend Next.js funcionando**
- Servidor rodando em http://localhost:3000/
- Integração com API Django
- Componentes shadcn/ui implementados

---

## 🎯 Tarefas Concluídas Recentemente

### ✅ Formas de Recebimento e Taxas (26/11/2025)
- [x] **Backend: Modelo FormaRecebimento**
  - [x] Renomeado de FormaPagamento para FormaRecebimento
  - [x] Campos para taxas percentuais e fixas
  - [x] Taxas específicas por parcela (2x, 3x, 4-6x, 7-12x)
  - [x] Dias para recebimento
  - [x] Operadora/Bandeira
  - [x] Método calcular_taxa() automático

- [x] **Backend: RecebimentoVenda**
  - [x] Modelo completo com cálculo de taxas
  - [x] Campos: valor_bruto, valor_taxa_total, valor_liquido
  - [x] Data prevista de recebimento
  - [x] Atualizado modelo Venda com propriedades total_recebido e total_liquido_recebido

- [x] **Backend: RecebimentoOS**
  - [x] Modelo para recebimentos de Ordem de Serviço
  - [x] Mesma estrutura do RecebimentoVenda
  - [x] Removido campo simples forma_pagamento da OrdemServico

- [x] **Migrations**
  - [x] Criadas migrations para todos os modelos
  - [x] Aplicadas com sucesso no banco

### ✅ Configurações do Sistema (26/11/2025)
- [x] **Página de Configurações reorganizada**
  - [x] Gestão de Usuários (permissões por perfil)
  - [x] Perfil da Empresa (dados para documentos e PDFs)
  - [x] Histórico LOG (auditoria completa)
  - [x] Removidos: Serviços, Checklist, Termos, Formas de Recebimento

- [x] **Gestão de Usuários** (/configuracoes/usuarios)
  - [x] Tabela de usuários com perfis
  - [x] Badges de status e permissões
  - [x] Cards de permissões por perfil

- [x] **Perfil da Empresa** (/configuracoes/empresa)
  - [x] Abas: Dados Gerais, Endereço, Contato, Documentos
  - [x] Upload de logo
  - [x] Campos completos para CNPJ, endereço, contatos
  - [x] Configurações de textos para PDFs

- [x] **Histórico LOG** (/configuracoes/logs)
  - [x] Estatísticas de atividades
  - [x] Filtros avançados
  - [x] Tabela de auditoria completa
  - [x] Exportação de logs

### ✅ Central de Ajuda (26/11/2025)
- [x] **Página Principal** (/ajuda)
  - [x] Cards de guias principais
  - [x] FAQ com perguntas frequentes
  - [x] Link direto no sidebar (sem submenus)

- [x] **Guias Completos**
  - [x] Nova Venda (/ajuda/vendas)
  - [x] Nova OS (/ajuda/os)
  - [x] Gestão de Estoque (/ajuda/estoque)
  - [x] Cadastro de Clientes (/ajuda/clientes)

### ✅ Melhorias de UX e Correções (28/11/2025)
- [x] **Dashboard - Últimas Movimentações**
  - [x] Adicionada coluna de Status de Pagamento
  - [x] Removido "N/A" dos campos vazios (detalhes)
  - [x] Melhorada descrição da coluna Data (específica por tipo)
  - [x] Data exibida com label contextual (Venda, Abertura, Pagamento, etc.)

- [x] **Perfil do Usuário**
  - [x] Corrigido layout duplo na página /configuracoes/usuarios/perfil
  - [x] Removido header duplicado que causava carregamento infinito

- [x] **Compras - Nova Compra**
  - [x] Formas de Pagamento modernizadas
  - [x] Removido "Cheque"
  - [x] Adicionado PIX, Cartão de Crédito e Cartão de Débito
  - [x] Ícones visuais nas opções de pagamento
  - [x] Card Resumo Financeiro redesenhado
  - [x] Removido "Total Produtos" redundante
  - [x] Total Geral destacado com fonte maior e cor primária
  - [x] Cards com border-2 para melhor visibilidade

- [x] **Gestão de Usuários**
  - [x] Cards de perfis já clicáveis (Administrador, Técnico, Vendedor)
  - [x] Script create_default_groups.py disponível para criar perfis padrão
  - [x] Navegação para /configuracoes/usuarios/perfis/[id] implementada

---

## 📝 Notas

- **Ambiente Atual**: Desenvolvimento Local (SQLite)
- **Ambiente Alvo**: VPS (PostgreSQL + Redis)
- **Multi-tenancy**: Desabilitado em local, será habilitado na VPS
- **Celery**: Desabilitado em local, será habilitado na VPS
- **Frontend**: Next.js 16 + TypeScript + TailwindCSS + shadcn/ui
- **Servidores Rodando**:
  - Backend: http://127.0.0.1:8000/
  - Frontend: http://localhost:3000/

---

**Última Atualização**: 28/11/2025 10:00
**Status**: Melhorias de UX implementadas. Dashboard com status de pagamento, perfil do usuário corrigido, e formulário de compras modernizado. Próximos passos: Implementar página de edição de perfis de usuário e testar integração completa.
