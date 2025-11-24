# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2025-11-24

### 🎉 Lançamento Inicial

Sistema ERP completo com 8 módulos funcionais.

### ✨ Adicionado

#### Infraestrutura
- Configuração Django 4.2 LTS
- Autenticação JWT com refresh tokens
- Multi-tenancy com django-tenants
- API REST com Django REST Framework
- Documentação automática com drf-spectacular (Swagger/ReDoc)
- Internacionalização PT-BR
- Celery para tarefas assíncronas
- Redis para cache e filas

#### Módulo: Cadastros Base (ERP)
- CRUD de Clientes (PF/PJ)
- CRUD de Fornecedores
- CRUD de Produtos/Serviços
- CRUD de Categorias
- Validação de CPF/CNPJ
- Histórico de alterações

#### Módulo: Estoque
- Movimentações de estoque (entrada/saída)
- Controle de lotes
- Inventário
- Alertas de estoque baixo
- Rastreabilidade completa

#### Módulo: Compras
- Cotações de fornecedores
- Pedidos de compra
- Recebimento de mercadorias
- Análise de melhor preço
- Histórico de compras

#### Módulo: Vendas e PDV
- Vendas com múltiplos itens
- PDV (Point of Sale)
- Métodos de pagamento
- Movimentações de caixa
- Histórico de vendas

#### Módulo: Ordem de Serviço
- Workflow completo de OS
- Controle de garantia
- Gestão de peças
- Orçamentos
- Histórico de atendimentos

#### Módulo: Financeiro
- Contas a Pagar
- Contas a Receber
- Fluxo de Caixa
- Categorias financeiras
- Contas bancárias
- Parcelamento
- Conciliação bancária

#### Módulo: CRM
- Pipeline de vendas (Kanban)
- Gestão de oportunidades
- Atividades e tarefas
- Histórico de interações
- Timeline de cliente
- Dashboard CRM
- Automação de mudança de etapa

#### Módulo: Relatórios
- Dashboard geral com KPIs
- Relatório de vendas
- Relatório de estoque
- Relatório financeiro (DRE)
- Relatório de OS
- Top produtos e clientes
- Métricas em tempo real

#### Automações
- Numeração automática de documentos
- Atualização automática de estoque
- Cálculo automático de totais
- Registro de histórico
- Mudança de status automática
- Criação de interações no CRM

#### Segurança
- Proteção CSRF
- Proteção XSS
- SQL Injection protection
- Secure headers
- CORS configurado
- Rate limiting

#### Documentação
- README completo
- Guia de instalação local
- Guia de deploy VPS
- Documentação da API (Swagger)
- Scripts de população de dados

### 🔧 Configurações

#### Desenvolvimento
- SQLite como banco de dados
- Multi-tenancy desabilitado
- Celery em modo eager
- Debug habilitado
- CORS liberado para localhost

#### Produção
- PostgreSQL como banco de dados
- Multi-tenancy habilitado
- Celery com Redis
- Debug desabilitado
- CORS configurado
- Sentry para monitoramento
- Gunicorn como WSGI server

### 📊 Estatísticas

- **130+ Endpoints REST**
- **40+ Models**
- **60+ Serializers**
- **17+ ViewSets**
- **8 Módulos completos**
- **100% Funcional**

### 🐛 Correções

Nenhuma correção nesta versão (lançamento inicial).

### 🔒 Segurança

Nenhum problema de segurança conhecido.

---

## [Unreleased]

### Planejado para v1.1.0

- [ ] Exportação PDF/Excel de relatórios
- [ ] Testes automatizados completos
- [ ] Notificações por email
- [ ] Webhooks
- [ ] Frontend Next.js
- [ ] App mobile (React Native)

### Planejado para v2.0.0

- [ ] Fórum comunitário
- [ ] Sistema de créditos
- [ ] Chatbot com IA
- [ ] Integração WhatsApp
- [ ] Integração Asaas (pagamentos)
- [ ] Integração n8n (automações)

---

## Tipos de Mudanças

- `Adicionado` para novas funcionalidades
- `Modificado` para mudanças em funcionalidades existentes
- `Descontinuado` para funcionalidades que serão removidas
- `Removido` para funcionalidades removidas
- `Corrigido` para correções de bugs
- `Segurança` para vulnerabilidades corrigidas
