# 📝 Notas Importantes do Sistema

## Estrutura de Páginas

### Estoque
- **`/estoque`** = Relatório de Estoque + Movimentações (MESMA PÁGINA)
  - Não criar `/estoque/relatorio` separado
  - Não criar `/estoque/movimentacoes` separado
  - Tudo em uma única página com tabs ou seções

### Outras Observações
- Todas as linhas de tabelas devem ser clicáveis para abrir detalhes
- Numeração simplificada: OS01, VD01, SER01 (ao invés de OS000053)
- Cards financeiros devem linkar para fluxo de caixa com filtros

---

## Estrutura de Rotas Atual

```
/dashboard                          # Dashboard principal
/produtos                           # Lista de produtos
/produtos/[id]                      # Detalhes do produto
/produtos/novo                      # Criar produto
/vendas                             # Lista de vendas
/vendas/[id]                        # Detalhes da venda
/clientes                           # Lista de clientes
/clientes/[id]                      # Detalhes do cliente
/clientes/[id]/editar              # Editar cliente
/estoque                            # Estoque + Movimentações (TUDO JUNTO)
/os                                 # Ordens de Serviço
/financeiro/fluxo-caixa            # Fluxo de caixa (a criar)
/financeiro/contas-receber         # Contas a receber (a criar)
/financeiro/contas-pagar           # Contas a pagar (a criar)
```

---

## Padrão de Nomenclatura

### Numeração de Documentos
- **OS**: OS01, OS02, OS03... (não OS000001)
- **Vendas**: VD01, VD02, VD03... (não VD000001)
- **Serviços**: SER01, SER02, SER03... (não SER000001)

### URLs
- Sempre em português
- Kebab-case: `/contas-receber`, `/fluxo-caixa`
- IDs numéricos: `/produtos/123`

---

## UX Patterns

### Tabelas
- ✅ Linhas clicáveis para abrir detalhes
- ✅ Hover effect: `hover:bg-accent/50`
- ✅ Cursor pointer: `cursor-pointer`
- ✅ Dropdown de ações com `stopPropagation`

### Cards Financeiros
- ✅ Linhas clicáveis com filtros
- ✅ Links para: `/financeiro/fluxo-caixa?tipo=X&filtro=Y`
- ✅ Valores em vermelho para atrasados

### Movimentações
- ✅ Clicáveis para detalhes
- ✅ Links dinâmicos baseados no tipo
- ✅ Hover effect

---

## Módulos do Sistema

### Implementados
- ✅ Dashboard
- ✅ Produtos
- ✅ Vendas
- ✅ Clientes
- ✅ Estoque (relatório + movimentações juntos)
- ✅ Fornecedores (parcial)

### Em Desenvolvimento
- ⏳ Financeiro (fluxo de caixa, contas a pagar/receber)
- ⏳ Ordens de Serviço (OS)

### Planejados
- 📋 Serviços (separado de Produtos)
- 📋 DRE
- 📋 Relatórios avançados
- 📋 CRM
- 📋 Configurações

---

## Convenções de Código

### Frontend
- TypeScript strict mode
- Client components: `"use client"` no topo
- Server components: sem diretiva
- API calls: sempre com try/catch
- Formatação de moeda: `Intl.NumberFormat("pt-BR")`
- Datas: `toLocaleDateString("pt-BR")`

### Backend
- Django REST Framework
- Permissions: `AllowAny` (temporário para desenvolvimento)
- Serializers para todos os models
- ViewSets para CRUD
- Filtros e paginação habilitados

---

## Prioridades de Desenvolvimento

1. **URGENTE**: Completar backend do dashboard (5 min)
2. **ALTA**: Criar fluxo de caixa (2-3h)
3. **ALTA**: Linhas clicáveis em todas as tabelas (2h)
4. **MÉDIA**: Numeração simplificada (1h)
5. **MÉDIA**: Separar Produtos/Serviços (5-7 dias)
6. **BAIXA**: Dropdowns dinâmicos (4-5 dias)
7. **BAIXA**: Configurações (3-4 dias)
