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

---

## 🎯 Tarefas Pendentes

### 1. Backend - Modelos Adicionais
- [ ] **Modelo de Empresa/Perfil**
  - [ ] Criar modelo para dados da empresa
  - [ ] Campos para logo, CNPJ, endereço completo
  - [ ] Textos padrão para PDFs
  - [ ] Serializer e ViewSet

- [ ] **Modelo de Auditoria/LOG**
  - [ ] Criar modelo para registro de ações
  - [ ] Campos: usuário, ação, módulo, descrição, IP, data/hora
  - [ ] Signal para registrar automaticamente
  - [ ] Serializer e ViewSet com filtros

- [ ] **Serializers para Recebimentos**
  - [ ] FormaRecebimentoSerializer
  - [ ] RecebimentoVendaSerializer
  - [ ] RecebimentoOSSerializer
  - [ ] ViewSets e URLs

### 2. Frontend - Integrações
- [ ] **Integrar Formas de Recebimento**
  - [ ] Página de listagem (/financeiro/formas-recebimento)
  - [ ] Formulário de cadastro/edição
  - [ ] Integrar em Nova Venda
  - [ ] Integrar em Nova OS
  - [ ] Mostrar cálculo de taxas em tempo real

- [ ] **Integrar Perfil da Empresa**
  - [ ] Conectar com API
  - [ ] Upload de logo funcional
  - [ ] Salvar configurações

- [ ] **Integrar Gestão de Usuários**
  - [ ] CRUD completo de usuários
  - [ ] Gerenciamento de permissões
  - [ ] Conectar com API

- [ ] **Integrar Histórico LOG**
  - [ ] Buscar logs da API
  - [ ] Filtros funcionais
  - [ ] Exportação

### 3. Funcionalidades do ERP
- [x] Dashboard Principal
- [x] Relatório DRE
- [x] Histórico do Cliente
- [x] PDV (Ponto de Venda)
- [x] Sangria de Caixa
- [ ] Email de boas-vindas
- [ ] Notificações por WhatsApp

### 4. Separação Produtos/Serviços
- [x] Backend: Modelo Servico criado
- [x] Backend: Migração de dados
- [x] Frontend: Menu Serviços
- [x] Frontend: Listagem de Serviços
- [x] Frontend: Cadastro/Edição de Serviços
- [x] Frontend: Integração em vendas e OS

### 5. Melhorias de UX
- [ ] Dropdowns com criação dinâmica (+)
  - [ ] Unidade de Medida
  - [ ] Categoria
  - [ ] Tipo de Produto
  - [ ] Motivo de Ajuste
  - [ ] Categoria DRE
  - [ ] Forma de Recebimento
- [ ] Loading states
- [ ] Mensagens de erro amigáveis
- [ ] Confirmações de ações
- [ ] Feedback visual

### 6. Segurança
- [ ] Revisar configurações de segurança
- [ ] Testar proteção CSRF
- [ ] Testar rate limiting
- [ ] Revisar permissões de API
- [ ] Configurar HTTPS para produção
- [ ] Revisar variáveis de ambiente

### 7. Documentação
- [ ] Atualizar README.md
- [ ] Documentar variáveis de ambiente
- [ ] Criar guia de uso da API
- [ ] Documentar processo de deploy
- [ ] Criar changelog atualizado

### 8. Preparação para Deploy
- [ ] Testar script de backup
- [ ] Testar script de restore
- [ ] Configurar variáveis de ambiente para produção
- [ ] Preparar Dockerfile
- [ ] Preparar docker-compose.yml
- [ ] Testar migrations em PostgreSQL local
- [ ] Criar script de deploy automatizado

### 9. Webhooks (PRIORIDADE BAIXA)
- [ ] Criar sistema de webhooks
- [ ] Webhook para nova venda
- [ ] Webhook para nova OS
- [ ] Webhook para pagamento recebido
- [ ] Documentar webhooks disponíveis

### 10. Painel Super Admin (SaaS) (FUTURO)
- [ ] Dashboard geral (Total de Tenants, Receita Recorrente)
- [ ] Gestão de Tenants (Criar, Editar, Suspender empresas)
- [ ] Planos e Assinaturas (Integração com Gateway de Pagamento)
- [ ] Configurações Globais do SaaS

---

## 📊 Progresso Geral

### Módulos Implementados (8/8) ✅
- ✅ ERP (Cadastros Base)
- ✅ Estoque
- ✅ Compras
- ✅ Vendas
- ✅ Assistência Técnica
- ✅ Financeiro
- ✅ CRM
- ✅ Relatórios

### Funcionalidades Extras
- ✅ Formas de Recebimento com Taxas
- ✅ Gestão de Usuários e Permissões
- ✅ Perfil da Empresa
- ✅ Histórico LOG/Auditoria
- ✅ Central de Ajuda
- ⏳ Exportação PDF/Excel
- ⏳ Testes Automatizados
- ⏳ Notificações Email
- ⏳ Webhooks
- ✅ Frontend Next.js (Em Desenvolvimento)

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

**Última Atualização**: 2025-11-26
**Status**: Sistema de Formas de Recebimento implementado, Configurações reorganizadas, Central de Ajuda completa, Migrations aplicadas.
