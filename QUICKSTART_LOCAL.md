# ZeroTec - Guia de Instalação Local (Windows)

**Zero Complicação, Total Gestão**

Este guia detalha o processo de instalação e configuração do ZeroTec em ambiente de desenvolvimento local no Windows.

## 📋 Pré-requisitos

- Windows 10/11
- Python 3.11 ou superior
- Git
- VS Code (recomendado)

## 🚀 Instalação Passo a Passo

### 1. Instalar Python

1. Baixe Python 3.11+ em https://www.python.org/downloads/
2. **IMPORTANTE:** Marque "Add Python to PATH" durante a instalação
3. Verifique a instalação:
```powershell
python --version
```

### 2. Clonar o Repositório

```powershell
# Clone o repositório
git clone https://github.com/robertdias/zerotec.git

# Entre na pasta do backend
cd zerotec\backend
```

### 3. Criar Ambiente Virtual

```powershell
# Crie o ambiente virtual
python -m venv venv

# Ative o ambiente virtual
.\venv\Scripts\activate

# Você verá (venv) no início da linha do terminal
```

### 4. Instalar Dependências

```powershell
# Atualize o pip
python -m pip install --upgrade pip

# Instale as dependências
pip install -r requirements.txt
```

### 5. Configurar Variáveis de Ambiente

```powershell
# Copie o arquivo de exemplo
copy .env.example .env

# Edite o .env com suas configurações
notepad .env
```

**Configuração mínima para desenvolvimento:**
```env
DJANGO_SETTINGS_MODULE=config.settings.local
SECRET_KEY=sua-chave-secreta-aqui
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

### 6. Executar Migrações

```powershell
# Defina o settings module
$env:DJANGO_SETTINGS_MODULE="config.settings.local"

# Execute as migrações
python manage.py migrate
```

### 7. Criar Superusuário

```powershell
python manage.py createsuperuser
```

Preencha:
- Username: `admin` (ou o que preferir)
- Email: `seu-email@example.com`
- Password: `sua-senha-segura`

### 8. Criar Dados de Teste (Opcional)

```powershell
# Popula o banco com dados de exemplo
python populate_test_data.py
```

Isso criará:
- 5 clientes
- 2 fornecedores
- 8 produtos
- 15 vendas
- 12 oportunidades CRM

### 9. Iniciar o Servidor

```powershell
python manage.py runserver
```

O servidor estará disponível em: http://127.0.0.1:8000/

## 🔗 Acessos

### Admin Django
- URL: http://127.0.0.1:8000/admin/
- Login: Use o superusuário criado no passo 7

### API REST
- URL: http://127.0.0.1:8000/api/
- Documentação: http://127.0.0.1:8000/api/docs/

### Dashboard
- URL: http://127.0.0.1:8000/api/relatorios/dashboard/

## 🧪 Testar a Instalação

### 1. Teste o Admin

1. Acesse http://127.0.0.1:8000/admin/
2. Faça login com o superusuário
3. Navegue pelos módulos

### 2. Teste a API

1. Acesse http://127.0.0.1:8000/api/docs/
2. Explore os endpoints
3. Teste alguns endpoints

### 3. Teste o Dashboard

1. Acesse http://127.0.0.1:8000/api/relatorios/dashboard/
2. Verifique se os dados aparecem (se você executou o populate_test_data.py)

## 🛠️ Comandos Úteis

### Gerenciamento do Servidor

```powershell
# Iniciar servidor
python manage.py runserver

# Iniciar em outra porta
python manage.py runserver 8080

# Parar servidor
Ctrl + C
```

### Banco de Dados

```powershell
# Criar migrações
python manage.py makemigrations

# Aplicar migrações
python manage.py migrate

# Resetar banco de dados (CUIDADO!)
del db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

### Dados

```powershell
# Popular com dados de teste
python populate_test_data.py

# Exportar dados
python manage.py dumpdata > backup.json

# Importar dados
python manage.py loaddata backup.json
```

### Limpeza

```powershell
# Limpar cache Python
Get-ChildItem -Recurse -Filter "__pycache__" | Remove-Item -Recurse -Force
Get-ChildItem -Recurse -Filter "*.pyc" | Remove-Item -Force
```

## ❌ Problemas Comuns

### Erro: "python não é reconhecido"

**Solução:** Python não está no PATH. Reinstale marcando "Add Python to PATH"

### Erro: "No module named django"

**Solução:** Ambiente virtual não está ativado ou dependências não foram instaladas
```powershell
.\venv\Scripts\activate
pip install -r requirements.txt
```

### Erro: "ModuleNotFoundError: No module named 'corsheaders'"

**Solução:** Instale as dependências
```powershell
pip install -r requirements.txt
```

### Erro: "OperationalError: no such table"

**Solução:** Execute as migrações
```powershell
python manage.py migrate
```

### Erro: "DJANGO_SETTINGS_MODULE is not set"

**Solução:** Defina a variável de ambiente
```powershell
$env:DJANGO_SETTINGS_MODULE="config.settings.local"
```

## 🔄 Atualizar o Projeto

```powershell
# Puxar últimas mudanças
git pull origin main

# Ativar ambiente virtual
.\venv\Scripts\activate

# Atualizar dependências
pip install -r requirements.txt

# Executar migrações
python manage.py migrate

# Reiniciar servidor
python manage.py runserver
```

## 📝 Próximos Passos

Após a instalação local, você pode:

1. **Explorar o Admin:** http://127.0.0.1:8000/admin/
2. **Ler a Documentação da API:** http://127.0.0.1:8000/api/docs/
3. **Testar os Endpoints:** Use Postman ou Insomnia
4. **Desenvolver o Frontend:** Consulte a documentação do frontend
5. **Preparar para Deploy:** Consulte [`DEPLOY_VPS.md`](DEPLOY_VPS.md)

## 🆘 Suporte

Se encontrar problemas:

1. Verifique a seção "Problemas Comuns" acima
2. Consulte a documentação oficial do Django
3. Abra uma issue no GitHub
4. Entre em contato: robert.dias.pereira@gmail.com

---

**Boa sorte com o desenvolvimento!** 🚀
