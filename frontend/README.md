# ZeroTec ERP - Frontend

Frontend moderno para o sistema ZeroTec ERP, construído com Next.js 16, TypeScript, TailwindCSS e shadcn/ui.

## 🚀 Tecnologias

- **Next.js 16** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **TailwindCSS v4** - Framework CSS utilitário
- **shadcn/ui** - Componentes UI de alta qualidade
- **Lucide React** - Ícones modernos

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Rodar produção
npm start
```

## 🔧 Configuração

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_APP_NAME=ZeroTec ERP
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── app/                    # App Router (Next.js 13+)
│   │   ├── dashboard/         # Página do dashboard
│   │   │   ├── layout.tsx     # Layout com sidebar
│   │   │   └── page.tsx       # Página principal
│   │   ├── layout.tsx         # Layout raiz
│   │   ├── page.tsx           # Página inicial (redireciona para /dashboard)
│   │   └── globals.css        # Estilos globais
│   ├── components/            # Componentes React
│   │   ├── ui/               # Componentes shadcn/ui
│   │   └── app-sidebar.tsx   # Sidebar de navegação
│   ├── lib/                  # Utilitários
│   │   ├── api.ts           # Cliente API
│   │   └── utils.ts         # Funções auxiliares
│   └── types/               # Tipos TypeScript
│       └── index.ts         # Tipos da API
├── public/                  # Arquivos estáticos
├── .env.local              # Variáveis de ambiente (não commitado)
├── package.json
└── tsconfig.json
```

## 🎨 Componentes Disponíveis

O projeto utiliza os seguintes componentes do shadcn/ui:

- **Button** - Botões estilizados
- **Card** - Cards para conteúdo
- **Input** - Campos de entrada
- **Label** - Labels para formulários
- **Table** - Tabelas de dados
- **Dropdown Menu** - Menus dropdown
- **Avatar** - Avatares de usuário
- **Badge** - Badges e tags
- **Dialog** - Modais e diálogos
- **Select** - Seleção de opções
- **Tabs** - Abas de navegação
- **Sidebar** - Sidebar de navegação
- **Sheet** - Painéis laterais
- **Skeleton** - Loading states

## 🔌 API Client

O cliente API está localizado em `src/lib/api.ts` e fornece métodos para:

### Autenticação
```typescript
await api.login(username, password);
await api.logout();
```

### Dashboard
```typescript
const dashboard = await api.getDashboard();
```

### DRE
```typescript
const dre = await api.getDRE(2025, 11); // Ano e mês (opcional)
api.exportDRE(2025, 11, 'pdf'); // Exportar PDF ou Excel
```

### Vendas
```typescript
const vendas = await api.getVendas({ page: 1, limit: 50 });
const venda = await api.getVenda(1);
```

### Produtos
```typescript
const produtos = await api.getProdutos();
const produto = await api.getProduto(1);
```

### Clientes
```typescript
const clientes = await api.getClientes();
const cliente = await api.getCliente(1);
const historico = await api.getClienteHistorico(1);
```

### Estoque
```typescript
const estoque = await api.getEstoque();
const baixo = await api.getEstoqueBaixo();
```

### Ordens de Serviço
```typescript
const os = await api.getOrdemServico();
const ordem = await api.getOS(1);
```

### Financeiro
```typescript
const pagar = await api.getContasPagar();
const receber = await api.getContasReceber();
```

## 🎯 Páginas Implementadas

### ✅ Dashboard (`/dashboard`)
- KPIs do mês (Vendas, OS, Financeiro)
- Gráficos anuais (Vendas, Custos, OS)
- Últimas movimentações
- Integração completa com API Django

### 🚧 Em Desenvolvimento
- Vendas (listagem e detalhes)
- Produtos (listagem e cadastro)
- Clientes (listagem e histórico)
- DRE (relatório mensal e anual)
- Autenticação (login/logout)

## 🔐 Autenticação

A autenticação é gerenciada pelo cliente API:

```typescript
// Login
const { access, refresh } = await api.login('username', 'password');
// Token é armazenado automaticamente no localStorage

// Logout
await api.logout();
// Token é removido do localStorage
```

## 🎨 Customização de Tema

O tema pode ser customizado editando `src/app/globals.css`:

```css
@layer base {
  :root {
    --primary: 222.2 47.4% 11.2%;
    --secondary: 210 40% 96.1%;
    /* ... outras variáveis */
  }
}
```

## 📱 Responsividade

O frontend é totalmente responsivo e funciona em:
- Desktop (1920px+)
- Tablet (768px - 1919px)
- Mobile (< 768px)

## 🚀 Deploy

### Vercel (Recomendado)
```bash
npm install -g vercel
vercel
```

### Build Manual
```bash
npm run build
npm start
```

## 📝 Próximos Passos

- [ ] Implementar página de Vendas
- [ ] Implementar página de Produtos
- [ ] Implementar página de Clientes
- [ ] Implementar página de DRE
- [ ] Implementar autenticação completa
- [ ] Adicionar testes unitários
- [ ] Adicionar testes E2E

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.
