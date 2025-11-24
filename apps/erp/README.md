# Módulo ERP - Documentação

## 📦 Visão Geral

O módulo ERP implementa os cadastros base do sistema: Clientes, Fornecedores, Produtos e Categorias.

## 🗂️ Models Implementados

### 1. Categoria
Categorização de produtos e serviços.

**Campos principais:**
- `nome`: Nome da categoria
- `tipo`: Produto ou Serviço
- `descricao`: Descrição da categoria
- `active`: Status ativo/inativo

**Relacionamentos:**
- `produtos`: Produtos desta categoria

---

### 2. Cliente
Cadastro de clientes (Pessoa Física ou Jurídica).

**Campos principais:**
- `tipo`: PF ou PJ
- `nome_razao_social`: Nome completo ou Razão Social
- `nome_fantasia`: Nome fantasia (PJ)
- `cpf_cnpj`: CPF ou CNPJ (validado)
- `rg_ie`: RG ou Inscrição Estadual
- Telefones, email, endereço completo
- `data_nascimento`: Data de nascimento (PF)
- `observacoes`: Observações gerais

**Propriedades calculadas:**
- `total_vendas`: Total de vendas do cliente
- `total_os`: Total de ordens de serviço

**Validações:**
- CPF/CNPJ validado automaticamente
- Formatação automática removida

---

### 3. Fornecedor
Cadastro de fornecedores (sempre Pessoa Jurídica).

**Campos principais:**
- `razao_social`: Razão Social
- `nome_fantasia`: Nome fantasia
- `cnpj`: CNPJ (validado)
- `ie`: Inscrição Estadual
- Telefones, email, endereço completo
- `contato_nome` e `contato_cargo`: Dados do contato
- `observacoes`: Observações gerais

**Propriedades calculadas:**
- `total_compras`: Total de compras do fornecedor

**Validações:**
- CNPJ validado automaticamente

---

### 4. Produto
Cadastro de produtos ou serviços.

**Campos principais:**
- `tipo`: Produto ou Serviço
- `nome`: Nome do produto
- `descricao`: Descrição detalhada
- `categoria`: Categoria (FK)
- `codigo_interno`: Código interno único
- `codigo_barras`: Código de barras
- `ncm`: NCM (Nomenclatura Comum do Mercosul)
- `unidade_medida`: UN, KG, M, L, CX, etc.
- `preco_custo`: Preço de custo
- `preco_venda`: Preço de venda
- `margem_lucro`: Margem de lucro (calculada automaticamente)
- `estoque_atual`: Estoque atual
- `estoque_minimo`: Estoque mínimo
- `estoque_maximo`: Estoque máximo
- `localizacao`: Localização física
- `controla_lote`: Se controla lote
- `controla_validade`: Se controla validade
- `imagem`: Imagem do produto

**Propriedades calculadas:**
- `estoque_baixo`: True se estoque < mínimo
- `valor_estoque`: Valor total do estoque (custo × quantidade)

**Lógica automática:**
- Margem de lucro calculada ao salvar
- Alertas de estoque baixo

---

## 🔌 API Endpoints

### Categorias
```
GET    /api/erp/categorias/              # Listar categorias
POST   /api/erp/categorias/              # Criar categoria
GET    /api/erp/categorias/{id}/         # Detalhe da categoria
PUT    /api/erp/categorias/{id}/         # Atualizar categoria
DELETE /api/erp/categorias/{id}/         # Deletar categoria
```

### Clientes
```
GET    /api/erp/clientes/                # Listar clientes
POST   /api/erp/clientes/                # Criar cliente
GET    /api/erp/clientes/{id}/           # Detalhe do cliente
PUT    /api/erp/clientes/{id}/           # Atualizar cliente
DELETE /api/erp/clientes/{id}/           # Deletar cliente
GET    /api/erp/clientes/{id}/historico/ # Histórico (vendas + OS)
GET    /api/erp/clientes/{id}/contas-receber/ # Contas a receber
```

**Filtros disponíveis:**
- `tipo`: pf ou pj
- `active`: true ou false
- `cidade`: nome da cidade
- `estado`: UF

**Busca:**
- Nome, CPF/CNPJ, email, telefone

### Fornecedores
```
GET    /api/erp/fornecedores/            # Listar fornecedores
POST   /api/erp/fornecedores/            # Criar fornecedor
GET    /api/erp/fornecedores/{id}/       # Detalhe do fornecedor
PUT    /api/erp/fornecedores/{id}/       # Atualizar fornecedor
DELETE /api/erp/fornecedores/{id}/       # Deletar fornecedor
GET    /api/erp/fornecedores/{id}/historico/ # Histórico de compras
GET    /api/erp/fornecedores/{id}/contas-pagar/ # Contas a pagar
```

**Filtros disponíveis:**
- `active`: true ou false
- `cidade`: nome da cidade
- `estado`: UF

**Busca:**
- Razão social, nome fantasia, CNPJ, email, telefone

### Produtos
```
GET    /api/erp/produtos/                # Listar produtos
POST   /api/erp/produtos/                # Criar produto
GET    /api/erp/produtos/{id}/           # Detalhe do produto
PUT    /api/erp/produtos/{id}/           # Atualizar produto
DELETE /api/erp/produtos/{id}/           # Deletar produto
GET    /api/erp/produtos/baixo-estoque/  # Produtos com estoque baixo
GET    /api/erp/produtos/{id}/movimentacoes/ # Movimentações de estoque
POST   /api/erp/produtos/importar/       # Importar produtos (CSV/Excel)
```

**Filtros disponíveis:**
- `tipo`: produto ou servico
- `categoria`: ID da categoria
- `active`: true ou false

**Busca:**
- Nome, descrição, código interno, código de barras

---

## 📊 Serializers

### Listagem vs Detalhe
Cada model possui dois serializers:
- **List**: Versão simplificada para listagens (menos campos)
- **Detail**: Versão completa com todos os campos e relacionamentos

**Exemplo:**
- `ClienteListSerializer`: Para GET /api/erp/clientes/
- `ClienteSerializer`: Para GET /api/erp/clientes/{id}/

---

## 🔍 Filtros e Busca

Todos os endpoints suportam:
- **Busca**: `?search=termo`
- **Ordenação**: `?ordering=campo` ou `?ordering=-campo` (desc)
- **Filtros**: `?campo=valor`
- **Paginação**: `?page=1&page_size=50`

**Exemplos:**
```bash
# Buscar clientes por nome
GET /api/erp/clientes/?search=João

# Filtrar produtos por categoria
GET /api/erp/produtos/?categoria=1

# Ordenar fornecedores por razão social
GET /api/erp/fornecedores/?ordering=razao_social

# Produtos com estoque baixo
GET /api/erp/produtos/baixo-estoque/
```

---

## 🧪 Testes

Execute os testes do módulo ERP:

```bash
# Todos os testes
pytest apps/erp/tests.py

# Com coverage
pytest apps/erp/tests.py --cov=apps.erp

# Testes específicos
pytest apps/erp/tests.py::ClienteModelTest
```

---

## 📝 Exemplos de Uso

### Criar um Cliente (PF)
```json
POST /api/erp/clientes/
{
  "tipo": "pf",
  "nome_razao_social": "João Silva",
  "cpf_cnpj": "123.456.789-01",
  "telefone_principal": "(11) 99999-9999",
  "email": "joao@email.com",
  "data_nascimento": "1990-01-15",
  "cep": "01310-100",
  "logradouro": "Av. Paulista",
  "numero": "1000",
  "bairro": "Bela Vista",
  "cidade": "São Paulo",
  "estado": "SP"
}
```

### Criar um Produto
```json
POST /api/erp/produtos/
{
  "tipo": "produto",
  "nome": "Tela LCD 15.6\"",
  "descricao": "Tela LCD para notebook 15.6 polegadas",
  "categoria": 1,
  "codigo_interno": "LCD156",
  "codigo_barras": "7891234567890",
  "unidade_medida": "UN",
  "preco_custo": 150.00,
  "preco_venda": 250.00,
  "estoque_atual": 20,
  "estoque_minimo": 5,
  "estoque_maximo": 50,
  "localizacao": "Prateleira A1"
}
```

### Buscar Produtos com Estoque Baixo
```bash
GET /api/erp/produtos/baixo-estoque/
```

---

## 🔐 Permissões

Todos os endpoints requerem autenticação JWT.

**Header necessário:**
```
Authorization: Bearer {access_token}
```

---

## 📌 Próximos Passos

1. ✅ Cadastros base implementados
2. 🚧 Implementar módulo de Estoque
3. 🚧 Implementar módulo de Compras
4. 🚧 Implementar módulo de Vendas
5. 🚧 Implementar módulo de OS
6. 🚧 Implementar módulo Financeiro
