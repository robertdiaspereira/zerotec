# 📝 Padrões de Numeração e Sistema de Ajuda

## 🔢 Padrão de Numeração Definido

### Prefixos Aprovados:
- **CP_** = Compra (Ex: CP001, CP002, CP003...)
- **OS_** = Ordem de Serviço (Ex: OS001, OS002, OS003...)
- **VD_** = Venda (Ex: VD001, VD002, VD003...)
- **SE_** = Serviço (Ex: SE001, SE002, SE003...)

### Formato:
- Prefixo: 2-3 letras + underscore
- Número: 3 dígitos (001, 002, 003...)
- Exemplo completo: `VD001`, `OS042`, `CP123`

### Vantagens:
✅ Fácil identificação visual
✅ Curto e prático
✅ Ordenação alfabética funciona
✅ Fácil de digitar
✅ Profissional

### Implementação Backend:

```python
# apps/core/utils.py
def gerar_numero_sequencial(tipo: str) -> str:
    """
    Gera número sequencial para documentos
    tipo: 'venda', 'os', 'compra', 'servico'
    """
    prefixos = {
        'venda': 'VD_',
        'os': 'OS_',
        'compra': 'CP_',
        'servico': 'SE_'
    }
    
    prefixo = prefixos.get(tipo, 'DOC_')
    
    # Buscar último número
    ultimo = obter_ultimo_numero(tipo)
    proximo = ultimo + 1
    
    return f"{prefixo}{proximo:03d}"

# Exemplos de uso:
# gerar_numero_sequencial('venda')  → 'VD001'
# gerar_numero_sequencial('os')     → 'OS042'
# gerar_numero_sequencial('compra') → 'CP123'
```

### Outros Documentos (Futuros):
- **NF_** = Nota Fiscal
- **OR_** = Orçamento
- **CT_** = Contrato
- **RC_** = Recibo
- **BL_** = Boleto
- **PG_** = Pagamento
- **RB_** = Recebimento

---

## 📚 Sistema de Ajuda e Tutoriais

### Localização no Menu
```
Sidebar (Footer)
├── Configurações
├── Sair
└── ❓ Ajuda  ← NOVO
```

### Estrutura do Sistema de Ajuda

#### 1. Central de Ajuda (`/ajuda`)

```tsx
┌─────────────────────────────────────────────────────────────┐
│  Central de Ajuda                                    [Buscar]│
├─────────────────────────────────────────────────────────────┤
│  📖 Tutoriais                                               │
│     Aprenda a usar o sistema passo a passo                  │
│     [Acessar →]                                             │
├─────────────────────────────────────────────────────────────┤
│  🎥 Vídeos Tutoriais                                        │
│     Assista aos vídeos de demonstração                      │
│     [Acessar →]                                             │
├─────────────────────────────────────────────────────────────┤
│  ❓ Perguntas Frequentes (FAQ)                              │
│     Respostas para dúvidas comuns                           │
│     [Acessar →]                                             │
├─────────────────────────────────────────────────────────────┤
│  📞 Suporte                                                 │
│     Entre em contato com nossa equipe                       │
│     [Acessar →]                                             │
├─────────────────────────────────────────────────────────────┤
│  🔄 Novidades                                               │
│     Veja as últimas atualizações do sistema                 │
│     [Acessar →]                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 2. Tutoriais Interativos

#### Estrutura de Tutoriais:

```
/ajuda/tutoriais
├── Primeiros Passos
│   ├── 1. Configuração Inicial
│   ├── 2. Cadastro de Empresa
│   ├── 3. Criar Primeiro Usuário
│   └── 4. Navegação Básica
├── Módulo de Vendas
│   ├── 1. Cadastrar Cliente
│   ├── 2. Criar Nova Venda
│   ├── 3. Emitir Cupom Fiscal
│   ├── 4. Cancelar Venda
│   └── 5. Relatórios de Vendas
├── Módulo de Estoque
│   ├── 1. Cadastrar Produto
│   ├── 2. Movimentação de Estoque
│   ├── 3. Inventário
│   └── 4. Alertas de Estoque Baixo
├── Ordens de Serviço
│   ├── 1. Criar Nova OS
│   ├── 2. Acompanhar Status
│   ├── 3. Finalizar OS
│   └── 4. Imprimir OS
├── Módulo Financeiro
│   ├── 1. Configurar Contas Bancárias
│   ├── 2. Lançamentos Financeiros
│   ├── 3. Contas a Pagar
│   ├── 4. Contas a Receber
│   ├── 5. Fluxo de Caixa
│   ├── 6. Categorias DRE
│   └── 7. Relatório DRE
└── Configurações
    ├── 1. Gestão de Usuários
    ├── 2. Perfis e Permissões
    ├── 3. Personalização
    └── 4. Backup e Segurança
```

---

### 3. Formato de Tutorial

#### Exemplo: "Como Criar uma Venda"

```markdown
# Como Criar uma Venda

## Objetivo
Aprender a registrar uma nova venda no sistema.

## Pré-requisitos
- ✅ Cliente cadastrado
- ✅ Produtos cadastrados
- ✅ Permissão para criar vendas

## Passo a Passo

### 1. Acessar o Módulo de Vendas
1. No menu lateral, clique em **Vendas**
2. Clique em **Nova Venda**

[Imagem: Menu Vendas]

### 2. Selecionar Cliente
1. No campo "Cliente", clique para abrir o dropdown
2. Digite o nome do cliente ou selecione da lista
3. Se o cliente não existe, clique em **[+ Novo Cliente]**

[Imagem: Seleção de Cliente]

### 3. Adicionar Produtos
1. Clique em **Adicionar Produto**
2. Selecione o produto
3. Informe a quantidade
4. O valor será calculado automaticamente
5. Repita para adicionar mais produtos

[Imagem: Adicionar Produtos]

### 4. Aplicar Desconto (Opcional)
1. No campo "Desconto", informe o valor ou percentual
2. O total será recalculado automaticamente

[Imagem: Aplicar Desconto]

### 5. Finalizar Venda
1. Revise os dados da venda
2. Selecione a forma de pagamento
3. Clique em **Finalizar Venda**
4. A venda receberá um número (Ex: VD001)

[Imagem: Finalizar Venda]

## Resultado
✅ Venda criada com sucesso!
✅ Estoque atualizado automaticamente
✅ Financeiro atualizado (se configurado)

## Próximos Passos
- Emitir cupom fiscal
- Visualizar relatório de vendas
- Criar nova venda

## Dúvidas?
- [FAQ sobre Vendas](#)
- [Vídeo Tutorial](#)
- [Contatar Suporte](#)
```

---

### 4. Tutoriais em Vídeo

#### Estrutura:
```
📹 Vídeos Tutoriais
├── Introdução ao Sistema (5 min)
├── Dashboard e Navegação (3 min)
├── Cadastro de Clientes (4 min)
├── Criando uma Venda (6 min)
├── Ordens de Serviço (8 min)
├── Gestão de Estoque (7 min)
├── Módulo Financeiro (10 min)
├── Relatórios (5 min)
└── Configurações Avançadas (8 min)
```

#### Plataforma:
- Vídeos hospedados no YouTube (privados)
- Embed no sistema
- Legendas em português
- Velocidade ajustável

---

### 5. FAQ (Perguntas Frequentes)

#### Categorias:
```
❓ Perguntas Frequentes
├── Geral
│   ├── Como faço login?
│   ├── Esqueci minha senha
│   └── Como alterar meu perfil?
├── Vendas
│   ├── Como cancelar uma venda?
│   ├── Posso editar uma venda finalizada?
│   └── Como aplicar desconto?
├── Estoque
│   ├── Como dar entrada em produtos?
│   ├── O que fazer quando o estoque está negativo?
│   └── Como fazer inventário?
├── Financeiro
│   ├── Como lançar uma despesa?
│   ├── Diferença entre Sangria e Despesa?
│   └── Como gerar o DRE?
└── Técnico
    ├── Erro ao salvar dados
    ├── Sistema está lento
    └── Como fazer backup?
```

---

### 6. Tour Guiado (Onboarding)

#### Primeira vez no sistema:
```tsx
// Tour automático para novos usuários
const tourSteps = [
  {
    target: '.sidebar',
    title: 'Menu de Navegação',
    content: 'Use este menu para acessar todos os módulos do sistema.',
  },
  {
    target: '.dashboard-cards',
    title: 'Dashboard',
    content: 'Aqui você vê um resumo de todas as operações.',
  },
  {
    target: '.quick-create-button',
    title: 'Criar Novo',
    content: 'Use este botão para criar rapidamente vendas, OS, clientes, etc.',
  },
  {
    target: '.user-menu',
    title: 'Menu do Usuário',
    content: 'Acesse suas configurações e saia do sistema aqui.',
  },
];
```

---

### 7. Tooltips Contextuais

```tsx
// Tooltips em campos importantes
<Tooltip content="Informe o CPF ou CNPJ do cliente">
  <Input name="cpf_cnpj" />
</Tooltip>

<Tooltip content="Desconto máximo permitido: 10%">
  <Input name="desconto" />
</Tooltip>
```

---

### 8. Busca Inteligente de Ajuda

```tsx
┌─────────────────────────────────────────────────────────────┐
│  🔍 Buscar na Ajuda                                         │
│  [Como criar uma venda___________________] [Buscar]         │
├─────────────────────────────────────────────────────────────┤
│  Resultados:                                                │
│  📖 Tutorial: Como Criar uma Venda                          │
│  🎥 Vídeo: Criando sua Primeira Venda                       │
│  ❓ FAQ: Posso editar uma venda finalizada?                 │
└─────────────────────────────────────────────────────────────┘
```

---

### 9. Changelog (Novidades)

```markdown
# Novidades do Sistema

## Versão 2.0.0 - 26/11/2025

### ✨ Novas Funcionalidades
- ✅ Módulo Financeiro completo
- ✅ Sistema de Categorias DRE
- ✅ Fluxo de Caixa avançado
- ✅ Histórico de Alterações

### 🔧 Melhorias
- ✅ Dashboard mais rápido
- ✅ Filtros avançados
- ✅ Exportação de relatórios

### 🐛 Correções
- ✅ Fix NaN em valores
- ✅ Dropdowns clicáveis
- ✅ Performance melhorada

## Versão 1.5.0 - 15/11/2025
...
```

---

## ✅ Checklist de Implementação

### Fase 1: Estrutura Básica
- [ ] Criar rota `/ajuda`
- [ ] Menu "Ajuda" na sidebar
- [ ] Página inicial da central de ajuda
- [ ] Estrutura de navegação

### Fase 2: Conteúdo
- [ ] Escrever tutoriais (todos os módulos)
- [ ] Criar FAQ
- [ ] Gravar vídeos tutoriais
- [ ] Screenshots de cada funcionalidade

### Fase 3: Recursos Avançados
- [ ] Tour guiado (onboarding)
- [ ] Tooltips contextuais
- [ ] Busca inteligente
- [ ] Changelog automático

### Fase 4: Suporte
- [ ] Formulário de contato
- [ ] Chat de suporte (opcional)
- [ ] Base de conhecimento
- [ ] Ticket system (opcional)

---

## 🎯 Prioridade

**BAIXA** - Implementar após sistema completo

**Estimativa**: 5-7 dias de trabalho
- 2 dias: Estrutura e navegação
- 3 dias: Conteúdo (tutoriais, FAQ)
- 2 dias: Vídeos e recursos avançados

---

## 📝 Observações

### Quando Implementar:
✅ **Após** todos os módulos estarem funcionando
✅ **Após** sistema estável
✅ **Antes** do lançamento oficial

### Conteúdo Dinâmico:
- Tutoriais devem ser atualizados a cada nova feature
- FAQ baseado em dúvidas reais dos usuários
- Vídeos podem ser adicionados gradualmente

### Multilíngua (Futuro):
- Português (padrão)
- Espanhol (opcional)
- Inglês (opcional)

---

**Sistema completo com documentação profissional! 🚀**
