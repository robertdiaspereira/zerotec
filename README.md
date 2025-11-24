# ZeroTec ERP

[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-4.2-green.svg)](https://www.djangoproject.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Zero Complicação, Total Gestão**

Sistema completo de ERP com foco em Assistência Técnica, incluindo gestão de vendas, estoque, financeiro, CRM e muito mais. Do zero ao sucesso com a plataforma mais completa do mercado.

## 🚀 Funcionalidades

### Módulos Implementados (100%)

- ✅ **Cadastros Base** - Clientes, Fornecedores, Produtos, Categorias
- ✅ **Estoque** - Movimentações, Lotes, Inventário, Controle de Estoque
- ✅ **Compras** - Cotações, Pedidos de Compra, Recebimento de Mercadorias
- ✅ **Vendas e PDV** - Vendas, PDV, Métodos de Pagamento, Histórico
- ✅ **Ordem de Serviço** - Workflow completo, Garantia, Peças, Orçamentos
- ✅ **Financeiro** - Contas a Pagar/Receber, Fluxo de Caixa, Conciliação
- ✅ **CRM** - Pipeline de Vendas, Oportunidades, Atividades, Kanban
- ✅ **Relatórios** - Dashboard, Métricas, KPIs

### Características Técnicas

- 🔐 **Autenticação JWT** com refresh tokens
- 🏢 **Multi-tenancy** (preparado para SaaS)
- 📱 **API REST** completa e documentada (Swagger/ReDoc)
- 🤖 **Automação** via Celery e signals
- 🌍 **Internacionalização** (PT-BR)
- 📊 **Dashboard** com métricas em tempo real
- 🔄 **Versionamento** de dados
- 📝 **Logs** estruturados

## 📋 Requisitos

- Python 3.11+
- PostgreSQL 14+ (produção) ou SQLite (desenvolvimento)
- Redis 6+ (produção, opcional em desenvolvimento)

## 🛠️ Instalação

### Desenvolvimento Local (Windows)

1. **Clone o repositório**
```powershell
git clone https://github.com/robertdias/zerotec.git
cd zerotec/backend
```

2. **Crie e ative o ambiente virtual**
```powershell
python -m venv venv
.\venv\Scripts\activate
```

3. **Instale as dependências**
```powershell
pip install -r requirements.txt
```

4. **Configure as variáveis de ambiente**
```powershell
cp .env.example .env
# Edite o .env com suas configurações
```

5. **Execute as migrações**
```powershell
$env:DJANGO_SETTINGS_MODULE="config.settings.local"
python manage.py migrate
```

6. **Crie um superusuário**
```powershell
python manage.py createsuperuser
```

7. **Popule com dados de teste (opcional)**
```powershell
python populate_test_data.py
```

8. **Inicie o servidor**
```powershell
python manage.py runserver
```

Acesse:
- **API:** http://127.0.0.1:8000/api/
- **Admin:** http://127.0.0.1:8000/admin/
- **Documentação:** http://127.0.0.1:8000/api/docs/

### Produção (VPS)

Consulte o guia detalhado em [`DEPLOY_VPS.md`](DEPLOY_VPS.md)

## 📚 Documentação

- [Guia de Instalação Local](QUICKSTART_LOCAL.md)
- [Guia de Deploy VPS](DEPLOY_VPS.md)
- [Documentação da API](http://127.0.0.1:8000/api/docs/) (após iniciar o servidor)
- [Changelog](CHANGELOG.md)

## 🏗️ Estrutura do Projeto

```
backend/
├── apps/
│   ├── accounts/        # Autenticação e usuários
│   ├── assistencia/     # Ordens de Serviço
│   ├── compras/         # Gestão de Compras
│   ├── core/            # Funcionalidades base
│   ├── crm/             # CRM e Pipeline de Vendas
│   ├── erp/             # Cadastros Base
│   ├── estoque/         # Controle de Estoque
│   ├── financeiro/      # Gestão Financeira
│   ├── relatorios/      # Relatórios e Dashboard
│   └── vendas/          # Vendas e PDV
├── config/
│   ├── settings/
│   │   ├── base.py      # Configurações base
│   │   ├── local.py     # Desenvolvimento
│   │   └── production.py # Produção
│   ├── urls.py
│   └── wsgi.py
├── manage.py
└── requirements.txt
```

## 🔌 API Endpoints

### Autenticação
- `POST /api/auth/register/` - Registro de usuário
- `POST /api/auth/login/` - Login (retorna JWT)
- `POST /api/auth/token/refresh/` - Refresh token
- `GET /api/auth/me/` - Perfil do usuário

### Módulos ERP
- `/api/erp/` - Clientes, Fornecedores, Produtos
- `/api/estoque/` - Movimentações, Lotes, Inventário
- `/api/compras/` - Cotações, Pedidos
- `/api/vendas/` - Vendas, PDV
- `/api/os/` - Ordens de Serviço
- `/api/financeiro/` - Contas, Fluxo de Caixa
- `/api/crm/` - Oportunidades, Pipeline
- `/api/relatorios/` - Dashboard, Relatórios

Documentação completa: http://127.0.0.1:8000/api/docs/

## 🧪 Testes

```powershell
# Executar todos os testes
python manage.py test

# Executar testes de um app específico
python manage.py test apps.vendas

# Com coverage
coverage run --source='.' manage.py test
coverage report
```

## 📊 Dashboard e Relatórios

O sistema inclui um dashboard completo com:

- **KPIs principais:** Vendas, Financeiro, OS, CRM
- **Gráficos:** Vendas por período, Top produtos, Top clientes
- **Métricas:** Taxa de conversão, Ticket médio, Margem de lucro
- **Alertas:** Estoque baixo, Contas vencidas

Acesse: `GET /api/relatorios/dashboard/`

## 🔐 Segurança

- ✅ JWT Authentication
- ✅ CORS configurado
- ✅ CSRF Protection
- ✅ SQL Injection protection (Django ORM)
- ✅ XSS Protection
- ✅ Secure headers
- ✅ Rate limiting (produção)

## 🚀 Deploy

### Hostinger VPS (Recomendado)

1. Adquira uma VPS na Hostinger
2. Siga o guia [`DEPLOY_VPS.md`](DEPLOY_VPS.md)
3. Configure PostgreSQL e Redis
4. Configure Nginx e SSL
5. Deploy!

### Outras Plataformas

O sistema é compatível com:
- AWS EC2
- Digital Ocean
- Heroku
- Google Cloud
- Azure

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Robert Dias Pereira**
- Email: robert.dias.pereira@gmail.com
- GitHub: [@robertdias](https://github.com/robertdias)
- Website: https://zerotec.com.br

## 🙏 Agradecimentos

- Django Community
- Django REST Framework
- Todos os contribuidores

## 📞 Suporte

Para suporte, envie um email para robert.dias.pereira@gmail.com ou abra uma issue no GitHub.

---

**⭐ Se este projeto foi útil, considere dar uma estrela!**
