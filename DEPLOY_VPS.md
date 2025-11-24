# ZeroTec - Guia de Deploy em VPS

**Zero Complicação, Total Gestão - Agora em Produção!**

Este guia detalha o processo completo de deploy do ZeroTec em um servidor VPS (Hostinger ou similar).

## 📋 Pré-requisitos

### VPS Recomendada
- **Provedor:** Hostinger VPS
- **Plano Mínimo:** VPS 1 (2 vCPU, 4GB RAM, 50GB SSD)
- **Sistema Operacional:** Ubuntu 22.04 LTS
- **Acesso:** SSH root

### Domínio
- Domínio registrado (ex: zerotec.com.br)
- DNS apontando para o IP da VPS

## 🚀 Instalação Passo a Passo

### 1. Acesso Inicial à VPS

```bash
# Conectar via SSH
ssh root@SEU_IP_VPS

# Atualizar sistema
apt update && apt upgrade -y
```

### 2. Criar Usuário para Deploy

```bash
# Criar usuário
adduser zerotec

# Adicionar ao grupo sudo
usermod -aG sudo zerotec

# Trocar para o novo usuário
su - zerotec
```

### 3. Instalar Dependências do Sistema

```bash
# Python e ferramentas
sudo apt install -y python3.11 python3.11-venv python3-pip python3.11-dev

# PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Redis
sudo apt install -y redis-server

# Nginx
sudo apt install -y nginx

# Certbot (SSL)
sudo apt install -y certbot python3-certbot-nginx

# Git
sudo apt install -y git

# Ferramentas adicionais
sudo apt install -y build-essential libpq-dev
```

### 4. Configurar PostgreSQL

```bash
# Entrar no PostgreSQL
sudo -u postgres psql

# Criar banco de dados e usuário
CREATE DATABASE zerotec_db;
CREATE USER zerotec_user WITH PASSWORD 'SUA_SENHA_SEGURA_AQUI';
ALTER ROLE zerotec_user SET client_encoding TO 'utf8';
ALTER ROLE zerotec_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE zerotec_user SET timezone TO 'America/Sao_Paulo';
GRANT ALL PRIVILEGES ON DATABASE zerotec_db TO zerotec_user;
\q
```

### 5. Configurar Redis

```bash
# Editar configuração
sudo nano /etc/redis/redis.conf

# Alterar:
# supervised no -> supervised systemd
# bind 127.0.0.1 ::1 (manter)

# Reiniciar Redis
sudo systemctl restart redis
sudo systemctl enable redis

# Testar
redis-cli ping
# Deve retornar: PONG
```

### 6. Clonar Repositório

```bash
# Criar diretório para aplicação
mkdir -p /home/zerotec/apps
cd /home/zerotec/apps

# Clonar repositório
git clone https://github.com/robertdias/zerotec.git
cd zerotec/backend
```

### 7. Configurar Ambiente Python

```bash
# Criar ambiente virtual
python3.11 -m venv venv

# Ativar ambiente virtual
source venv/bin/activate

# Atualizar pip
pip install --upgrade pip

# Instalar dependências
pip install -r requirements.txt

# Instalar Gunicorn
pip install gunicorn
```

### 8. Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env
nano .env
```

**Conteúdo do .env:**

```env
# Django Settings
DJANGO_SETTINGS_MODULE=config.settings.production
SECRET_KEY=GERE_UMA_CHAVE_SECRETA_AQUI
DEBUG=False
ALLOWED_HOSTS=zerotec.com.br,www.zerotec.com.br,SEU_IP_VPS

# Database
DB_ENGINE=django.db.backends.postgresql
DB_NAME=zerotec_db
DB_USER=zerotec_user
DB_PASSWORD=SUA_SENHA_POSTGRESQL
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Email (Configure com seu provedor)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=seu-email@gmail.com
EMAIL_HOST_PASSWORD=sua-senha-app

# Security
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_HSTS_SECONDS=31536000

# Multi-tenancy
ENABLE_MULTI_TENANCY=False

# Celery
ENABLE_CELERY=True
```

**Gerar SECRET_KEY:**

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 9. Executar Migrações

```bash
# Ativar ambiente virtual
source venv/bin/activate

# Coletar arquivos estáticos
python manage.py collectstatic --noinput

# Executar migrações
python manage.py migrate

# Criar superusuário
python manage.py createsuperuser
```

### 10. Configurar Gunicorn

```bash
# Criar arquivo de serviço
sudo nano /etc/systemd/system/zerotec.service
```

**Conteúdo:**

```ini
[Unit]
Description=ZeroTec Gunicorn daemon
After=network.target

[Service]
User=zerotec
Group=www-data
WorkingDirectory=/home/zerotec/apps/zerotec/backend
Environment="PATH=/home/zerotec/apps/zerotec/backend/venv/bin"
EnvironmentFile=/home/zerotec/apps/zerotec/backend/.env
ExecStart=/home/zerotec/apps/zerotec/backend/venv/bin/gunicorn \
          --workers 3 \
          --bind unix:/home/zerotec/apps/zerotec/backend/zerotec.sock \
          config.wsgi:application

[Install]
WantedBy=multi-user.target
```

```bash
# Iniciar e habilitar serviço
sudo systemctl start zerotec
sudo systemctl enable zerotec

# Verificar status
sudo systemctl status zerotec
```

### 11. Configurar Celery (Opcional)

```bash
# Criar arquivo de serviço Celery Worker
sudo nano /etc/systemd/system/zerotec-celery.service
```

**Conteúdo:**

```ini
[Unit]
Description=ZeroTec Celery Worker
After=network.target redis.service

[Service]
Type=forking
User=zerotec
Group=www-data
WorkingDirectory=/home/zerotec/apps/zerotec/backend
Environment="PATH=/home/zerotec/apps/zerotec/backend/venv/bin"
EnvironmentFile=/home/zerotec/apps/zerotec/backend/.env
ExecStart=/home/zerotec/apps/zerotec/backend/venv/bin/celery -A config worker --loglevel=info

[Install]
WantedBy=multi-user.target
```

```bash
# Iniciar e habilitar
sudo systemctl start zerotec-celery
sudo systemctl enable zerotec-celery
```

### 12. Configurar Nginx

```bash
# Criar configuração do site
sudo nano /etc/nginx/sites-available/zerotec
```

**Conteúdo:**

```nginx
server {
    listen 80;
    server_name zerotec.com.br www.zerotec.com.br;

    client_max_body_size 100M;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        alias /home/zerotec/apps/zerotec/backend/staticfiles/;
    }

    location /media/ {
        alias /home/zerotec/apps/zerotec/backend/media/;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/home/zerotec/apps/zerotec/backend/zerotec.sock;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_redirect off;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/zerotec /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 13. Configurar SSL (HTTPS)

```bash
# Obter certificado SSL
sudo certbot --nginx -d zerotec.com.br -d www.zerotec.com.br

# Renovação automática já está configurada
# Testar renovação:
sudo certbot renew --dry-run
```

### 14. Configurar Firewall

```bash
# Permitir SSH, HTTP e HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'

# Ativar firewall
sudo ufw enable

# Verificar status
sudo ufw status
```

## 🔄 Atualização do Sistema

### Script de Deploy

Crie um script para facilitar atualizações:

```bash
nano /home/zerotec/apps/zerotec/deploy.sh
```

**Conteúdo:**

```bash
#!/bin/bash

echo "🚀 Iniciando deploy do ZeroTec..."

# Ir para diretório
cd /home/zerotec/apps/zerotec/backend

# Ativar ambiente virtual
source venv/bin/activate

# Puxar últimas mudanças
git pull origin main

# Instalar/atualizar dependências
pip install -r requirements.txt

# Coletar arquivos estáticos
python manage.py collectstatic --noinput

# Executar migrações
python manage.py migrate

# Reiniciar serviços
sudo systemctl restart zerotec
sudo systemctl restart zerotec-celery

echo "✅ Deploy concluído!"
```

```bash
# Tornar executável
chmod +x /home/zerotec/apps/zerotec/deploy.sh

# Usar:
./deploy.sh
```

## 📊 Monitoramento

### Logs

```bash
# Logs do Gunicorn
sudo journalctl -u zerotec -f

# Logs do Celery
sudo journalctl -u zerotec-celery -f

# Logs do Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Status dos Serviços

```bash
# Verificar todos os serviços
sudo systemctl status zerotec
sudo systemctl status zerotec-celery
sudo systemctl status nginx
sudo systemctl status postgresql
sudo systemctl status redis
```

## 🔐 Segurança

### Backup Automático

```bash
# Criar script de backup
nano /home/zerotec/backup.sh
```

**Conteúdo:**

```bash
#!/bin/bash
cd /home/zerotec/apps/zerotec/backend
source venv/bin/activate
python backup_database.py
```

```bash
# Tornar executável
chmod +x /home/zerotec/backup.sh

# Adicionar ao cron (backup diário às 2h)
crontab -e

# Adicionar linha:
0 2 * * * /home/zerotec/backup.sh
```

### Hardening

```bash
# Desabilitar login root via SSH
sudo nano /etc/ssh/sshd_config
# Alterar: PermitRootLogin no

# Reiniciar SSH
sudo systemctl restart sshd

# Fail2ban (proteção contra brute force)
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## ✅ Checklist Final

- [ ] VPS configurada e acessível
- [ ] PostgreSQL instalado e configurado
- [ ] Redis instalado e funcionando
- [ ] Código clonado do GitHub
- [ ] Ambiente virtual criado
- [ ] Dependências instaladas
- [ ] Variáveis de ambiente configuradas
- [ ] Migrações executadas
- [ ] Superusuário criado
- [ ] Gunicorn configurado e rodando
- [ ] Celery configurado (se necessário)
- [ ] Nginx configurado
- [ ] SSL/HTTPS configurado
- [ ] Firewall ativado
- [ ] Backup automático configurado
- [ ] DNS apontando corretamente
- [ ] Site acessível via HTTPS

## 🆘 Troubleshooting

### Erro 502 Bad Gateway

```bash
# Verificar se Gunicorn está rodando
sudo systemctl status zerotec

# Verificar logs
sudo journalctl -u zerotec -n 50

# Verificar socket
ls -l /home/zerotec/apps/zerotec/backend/zerotec.sock
```

### Erro de Permissão

```bash
# Ajustar permissões
sudo chown -R zerotec:www-data /home/zerotec/apps/zerotec
sudo chmod -R 755 /home/zerotec/apps/zerotec
```

### Banco de Dados não Conecta

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Testar conexão
psql -U zerotec_user -d zerotec_db -h localhost
```

## 📞 Suporte

Para dúvidas ou problemas:
- Email: suporte@zerotec.com.br
- GitHub: https://github.com/robertdias/zerotec/issues

---

**ZeroTec - Zero Complicação, Total Gestão**  
**Versão:** 1.0  
**Última Atualização:** 24/11/2025
