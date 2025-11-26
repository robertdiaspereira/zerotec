# 🎨 Melhorias de UX e Sistema de Permissões

## 🎯 Melhorias Solicitadas

### 1. Sidebar Aprimorada

#### A. Logo Clicável
- **Ação**: Clicar na logo "ZeroTec" redireciona para `/dashboard`
- **Benefício**: Atalho rápido para voltar ao início

#### B. Remover "Menu Principal"
- Remover o label `<SidebarGroupLabel>Menu Principal</SidebarGroupLabel>`
- Menu mais limpo e moderno

#### C. Botão "Novo +" (Quick Create)
- **Localização**: No topo da sidebar, abaixo da logo
- **Funcionalidade**: Dropdown com atalhos para criar:
  - 🛒 Nova Venda
  - 🔧 Nova Ordem de Serviço
  - 👤 Novo Cliente
  - 📦 Novo Produto
  - 🏭 Novo Fornecedor
  - 💰 Novo Lançamento Financeiro
  - 🛍️ Nova Compra

```tsx
┌─────────────────────────────────┐
│  [Z] ZeroTec                    │
│      ERP System                 │
├─────────────────────────────────┤
│  [+ Novo ▼]                     │  ← Botão Quick Create
├─────────────────────────────────┤
│  🏠 Dashboard                   │
│  🛒 Vendas                      │
│  📦 Estoque                     │
└─────────────────────────────────┘
```

---

## 👥 Sistema de Permissões e Usuários

### Estrutura de Perfis

#### 1. Super Admin (Sistema)
- Acesso total ao sistema
- Gerencia todas as assistências
- Configurações globais

#### 2. Admin (Dono da Assistência)
- Acesso total à sua assistência
- Gerencia usuários da assistência
- Visualiza histórico de alterações
- Configura permissões
- Perfil da empresa

#### 3. Gerente
- Acesso a relatórios
- Aprovação de vendas/OS
- Visualiza histórico
- Não pode excluir dados críticos

#### 4. Vendedor
- Criar/editar vendas
- Criar/editar clientes
- Visualizar produtos
- Não acessa financeiro

#### 5. Técnico
- Criar/editar OS
- Visualizar clientes
- Visualizar produtos
- Não acessa vendas/financeiro

#### 6. Atendente
- Criar clientes
- Criar OS
- Visualizar vendas
- Não edita preços

#### 7. Financeiro
- Acesso total ao módulo financeiro
- Contas a pagar/receber
- Relatórios financeiros
- Não acessa vendas/OS

---

## 🔐 Matriz de Permissões

### Módulo: Vendas
| Ação | Admin | Gerente | Vendedor | Técnico | Atendente | Financeiro |
|------|-------|---------|----------|---------|-----------|------------|
| Visualizar | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Criar | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Editar | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Excluir | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Aprovar | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Desconto >10% | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### Módulo: Ordens de Serviço
| Ação | Admin | Gerente | Vendedor | Técnico | Atendente | Financeiro |
|------|-------|---------|----------|---------|-----------|------------|
| Visualizar | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| Criar | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| Editar | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Excluir | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Finalizar | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |

### Módulo: Financeiro
| Ação | Admin | Gerente | Vendedor | Técnico | Atendente | Financeiro |
|------|-------|---------|----------|---------|-----------|------------|
| Visualizar | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Criar | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Editar | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Excluir | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Relatórios | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |

### Módulo: Clientes
| Ação | Admin | Gerente | Vendedor | Técnico | Atendente | Financeiro |
|------|-------|---------|----------|---------|-----------|------------|
| Visualizar | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Criar | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Editar | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Excluir | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### Módulo: Produtos
| Ação | Admin | Gerente | Vendedor | Técnico | Atendente | Financeiro |
|------|-------|---------|----------|---------|-----------|------------|
| Visualizar | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Criar | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Editar | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Excluir | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Ajustar Estoque | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 📋 Histórico de Alterações (Audit Log)

### Tabela: `historico_alteracoes`
```sql
CREATE TABLE historico_alteracoes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuario(id) NOT NULL,
    acao VARCHAR(50) NOT NULL,  -- 'criar', 'editar', 'excluir', 'aprovar'
    modulo VARCHAR(50) NOT NULL,  -- 'venda', 'os', 'cliente', 'produto', etc.
    registro_id INTEGER NOT NULL,  -- ID do registro afetado
    descricao TEXT,  -- Ex: "Alterou o status de 'Aberta' para 'Concluída'"
    dados_anteriores JSONB,  -- Estado anterior (para edições)
    dados_novos JSONB,  -- Estado novo
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_historico_usuario ON historico_alteracoes(usuario_id);
CREATE INDEX idx_historico_modulo ON historico_alteracoes(modulo, registro_id);
CREATE INDEX idx_historico_data ON historico_alteracoes(created_at DESC);
```

### Interface: `/configuracoes/historico`

```tsx
┌─────────────────────────────────────────────────────────────┐
│  Histórico de Alterações                                    │
├─────────────────────────────────────────────────────────────┤
│  Filtros:                                                   │
│  Usuário: [Todos ▼]  Módulo: [Todos ▼]  Ação: [Todas ▼]   │
│  Período: [01/11/2025] a [30/11/2025]  [Filtrar]           │
├─────────────────────────────────────────────────────────────┤
│  Data/Hora         Usuário    Ação      Módulo    Descrição│
│  26/11 14:30      João       Editou    Venda     VD001...  │
│  26/11 14:25      Maria      Criou     OS        OS123...  │
│  26/11 14:20      João       Excluiu   Cliente   Cliente..│
│  26/11 14:15      Pedro      Aprovou   Venda     VD002...  │
├─────────────────────────────────────────────────────────────┤
│  [Ver Detalhes] - Mostra dados anteriores vs novos         │
└─────────────────────────────────────────────────────────────┘
```

### Detalhes da Alteração (Modal)
```tsx
┌─────────────────────────────────────────────────────────────┐
│  Detalhes da Alteração                                  [X] │
├─────────────────────────────────────────────────────────────┤
│  Usuário: João Silva                                        │
│  Data/Hora: 26/11/2025 14:30:15                            │
│  IP: 192.168.1.100                                          │
│  Ação: Editou Venda VD001                                   │
├─────────────────────────────────────────────────────────────┤
│  Alterações:                                                │
│                                                             │
│  Campo          Antes              Depois                   │
│  Status         Pendente           Finalizada               │
│  Valor Total    R$ 1.000,00        R$ 1.200,00             │
│  Desconto       R$ 0,00            R$ 50,00                │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Menu de Configurações

### Estrutura: `/configuracoes`

```tsx
┌─────────────────────────────────────────────────────────────┐
│  Configurações                                              │
├─────────────────────────────────────────────────────────────┤
│  👥 Gestão de Usuários                                      │
│     Gerenciar usuários e permissões                         │
│     [Acessar →]                                             │
├─────────────────────────────────────────────────────────────┤
│  🏢 Perfil da Empresa                                       │
│     Dados da empresa, logo, configurações gerais            │
│     [Acessar →]                                             │
├─────────────────────────────────────────────────────────────┤
│  📜 Histórico de Alterações                                 │
│     Visualizar todas as alterações do sistema               │
│     [Acessar →]                                             │
├─────────────────────────────────────────────────────────────┤
│  🔐 Segurança                                               │
│     Alterar senha, autenticação em dois fatores             │
│     [Acessar →]                                             │
├─────────────────────────────────────────────────────────────┤
│  🎨 Personalização                                          │
│     Tema, cores, ordem do menu                              │
│     [Acessar →]                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 👥 Gestão de Usuários

### Interface: `/configuracoes/usuarios`

```tsx
┌─────────────────────────────────────────────────────────────┐
│  Gestão de Usuários                          [+ Novo Usuário]│
├─────────────────────────────────────────────────────────────┤
│  Buscar: [_______]                                          │
├─────────────────────────────────────────────────────────────┤
│  Nome          Email              Perfil      Status  Ações │
│  João Silva    joao@email.com     Admin       Ativo   [⋮]  │
│  Maria Santos  maria@email.com    Vendedor    Ativo   [⋮]  │
│  Pedro Costa   pedro@email.com    Técnico     Inativo [⋮]  │
└─────────────────────────────────────────────────────────────┘
```

### Criar/Editar Usuário

```tsx
┌─────────────────────────────────────────────────────────────┐
│  Novo Usuário                                               │
├─────────────────────────────────────────────────────────────┤
│  Nome Completo *                                            │
│  [_____________________________]                            │
├─────────────────────────────────────────────────────────────┤
│  Email *                        Telefone                    │
│  [________________]             [________________]          │
├─────────────────────────────────────────────────────────────┤
│  Perfil de Acesso *                                         │
│  [Selecione o perfil ▼]                                     │
│  ├── Admin (Acesso total)                                   │
│  ├── Gerente (Relatórios e aprovações)                      │
│  ├── Vendedor (Vendas e clientes)                           │
│  ├── Técnico (OS e clientes)                                │
│  ├── Atendente (Cadastros básicos)                          │
│  └── Financeiro (Módulo financeiro)                         │
├─────────────────────────────────────────────────────────────┤
│  Senha Temporária *             Confirmar Senha *           │
│  [________________]             [________________]          │
├─────────────────────────────────────────────────────────────┤
│  ☑ Forçar troca de senha no primeiro acesso                │
│  ☑ Enviar credenciais por email                            │
├─────────────────────────────────────────────────────────────┤
│  Permissões Personalizadas (Opcional)                       │
│  [Configurar Permissões →]                                  │
├─────────────────────────────────────────────────────────────┤
│                                      [Cancelar] [Salvar]    │
└─────────────────────────────────────────────────────────────┘
```

### Permissões Personalizadas

```tsx
┌─────────────────────────────────────────────────────────────┐
│  Permissões Personalizadas - João Silva                    │
├─────────────────────────────────────────────────────────────┤
│  Módulo: Vendas                                             │
│  ☑ Visualizar    ☑ Criar    ☑ Editar    ☐ Excluir         │
│  ☐ Aprovar       ☐ Desconto >10%                           │
├─────────────────────────────────────────────────────────────┤
│  Módulo: Ordens de Serviço                                  │
│  ☑ Visualizar    ☑ Criar    ☑ Editar    ☐ Excluir         │
│  ☑ Finalizar                                                │
├─────────────────────────────────────────────────────────────┤
│  Módulo: Financeiro                                         │
│  ☐ Visualizar    ☐ Criar    ☐ Editar    ☐ Excluir         │
│  ☐ Relatórios                                               │
├─────────────────────────────────────────────────────────────┤
│  Módulo: Clientes                                           │
│  ☑ Visualizar    ☑ Criar    ☑ Editar    ☐ Excluir         │
├─────────────────────────────────────────────────────────────┤
│  Módulo: Produtos                                           │
│  ☑ Visualizar    ☐ Criar    ☐ Editar    ☐ Excluir         │
│  ☐ Ajustar Estoque                                          │
├─────────────────────────────────────────────────────────────┤
│                                      [Cancelar] [Salvar]    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏢 Perfil da Empresa

### Interface: `/configuracoes/empresa`

```tsx
┌─────────────────────────────────────────────────────────────┐
│  Perfil da Empresa                                          │
├─────────────────────────────────────────────────────────────┤
│  Logo da Empresa                                            │
│  ┌─────────┐                                                │
│  │ [Logo]  │  [Alterar Logo]                                │
│  └─────────┘                                                │
├─────────────────────────────────────────────────────────────┤
│  Razão Social *                                             │
│  [_____________________________]                            │
├─────────────────────────────────────────────────────────────┤
│  Nome Fantasia                  CNPJ *                      │
│  [________________]             [________________]          │
├─────────────────────────────────────────────────────────────┤
│  Telefone                       Email                       │
│  [________________]             [________________]          │
├─────────────────────────────────────────────────────────────┤
│  Endereço                                                   │
│  CEP: [_________]  [Buscar]                                │
│  Rua: [_____________________________]  Nº: [_____]         │
│  Bairro: [______________]  Cidade: [______________]        │
│  Estado: [__]                                               │
├─────────────────────────────────────────────────────────────┤
│  Configurações de Nota Fiscal                               │
│  Série NF: [___]  Próximo Número: [_____]                  │
├─────────────────────────────────────────────────────────────┤
│                                              [Salvar]       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Implementação do Audit Log

### Backend - Middleware Django

```python
# middleware/audit_log.py
class AuditLogMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Registrar ações de modificação
        if request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            self.log_action(request, response)
        
        return response

    def log_action(self, request, response):
        if response.status_code in [200, 201, 204]:
            HistoricoAlteracao.objects.create(
                usuario=request.user,
                acao=self.get_acao(request.method),
                modulo=self.get_modulo(request.path),
                registro_id=self.get_registro_id(request, response),
                descricao=self.get_descricao(request),
                dados_anteriores=self.get_dados_anteriores(request),
                dados_novos=request.data,
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
```

### Frontend - Hook useAuditLog

```tsx
// hooks/useAuditLog.ts
export function useAuditLog() {
    const logAction = async (
        acao: string,
        modulo: string,
        registroId: number,
        descricao: string
    ) => {
        await api.post('/api/historico/', {
            acao,
            modulo,
            registro_id: registroId,
            descricao
        });
    };

    return { logAction };
}

// Uso:
const { logAction } = useAuditLog();

// Ao editar uma venda
await api.put(`/api/vendas/${id}/`, data);
await logAction('editar', 'venda', id, `Alterou status para ${data.status}`);
```

---

## ✅ Checklist de Implementação

### Sidebar Melhorada
- [ ] Logo clicável para dashboard
- [ ] Remover "Menu Principal"
- [ ] Botão "Novo +" com dropdown
- [ ] Atalhos para criar registros

### Sistema de Permissões
- [ ] Modelo de Perfis
- [ ] Modelo de Permissões
- [ ] Middleware de verificação
- [ ] Decorators para views
- [ ] Frontend: ocultar botões sem permissão

### Histórico de Alterações
- [ ] Modelo HistoricoAlteracao
- [ ] Middleware de audit log
- [ ] API de consulta
- [ ] Interface de visualização
- [ ] Filtros avançados
- [ ] Modal de detalhes

### Gestão de Usuários
- [ ] CRUD de usuários
- [ ] Atribuição de perfis
- [ ] Permissões personalizadas
- [ ] Ativar/Desativar usuários
- [ ] Resetar senha

### Perfil da Empresa
- [ ] CRUD de dados da empresa
- [ ] Upload de logo
- [ ] Configurações de NF

---

## 🎯 Prioridade

**ALTA** - Essencial para:
- Segurança do sistema
- Controle de acesso
- Rastreabilidade
- Conformidade

**Estimativa**: 7-10 dias de desenvolvimento

---

**Sistema profissional com controle total! 🚀**
