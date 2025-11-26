# 🎯 Melhorias de UX - Linhas Clicáveis

## Regra Geral
**TODAS as tabelas de listagem devem ter linhas clicáveis que abrem o objeto.**

Exemplo: Clientes já funciona assim - ao clicar na linha, abre `/clientes/[id]`

---

## 📋 Tabelas que Precisam de Linhas Clicáveis

### ✅ Já Implementado
- [x] **Clientes** (`/clientes`) → `/clientes/[id]`
- [x] **Últimas Movimentações** (Dashboard) → Links específicos por tipo

### ⏳ Pendente

#### 1. **Produtos** (`/produtos`)
- Clicar na linha → `/produtos/[id]`
- Manter botão de ações separado (editar, excluir)

#### 2. **Vendas** (`/vendas`)
- Clicar na linha → `/vendas/[id]`
- Dropdown de ações já existe, manter

#### 3. **Ordens de Serviço** (`/os`)
- Clicar na linha → `/os/[id]`

#### 4. **Fornecedores** (`/fornecedores`)
- Clicar na linha → `/fornecedores/[id]`

#### 5. **Estoque - Movimentações** (`/estoque/movimentacoes`)
- Clicar na linha → `/estoque/movimentacoes/[id]`

#### 6. **Contas a Receber** (`/financeiro/contas-receber`)
- Clicar na linha → `/financeiro/contas-receber/[id]`

#### 7. **Contas a Pagar** (`/financeiro/contas-pagar`)
- Clicar na linha → `/financeiro/contas-pagar/[id]`

#### 8. **Fluxo de Caixa** (`/financeiro/fluxo-caixa`)
- Clicar na linha → Abrir modal ou página de detalhes

---

## 🎨 Padrão de Implementação

### Exemplo: Tornar Produtos Clicável

```tsx
<TableBody>
    {filteredProdutos.map((produto) => (
        <TableRow 
            key={produto.id}
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => router.push(`/produtos/${produto.id}`)}
        >
            <TableCell>{produto.codigo_interno}</TableCell>
            <TableCell>{produto.nome}</TableCell>
            {/* ... outros campos ... */}
            <TableCell onClick={(e) => e.stopPropagation()}>
                {/* Botões de ação - stopPropagation para não abrir detalhes */}
                <DropdownMenu>
                    {/* ... ações ... */}
                </DropdownMenu>
            </TableCell>
        </TableRow>
    ))}
</TableBody>
```

### Pontos Importantes:

1. **Adicionar `useRouter`**:
   ```tsx
   import { useRouter } from 'next/navigation';
   const router = useRouter();
   ```

2. **Classes CSS**:
   - `cursor-pointer` - Mostra que é clicável
   - `hover:bg-accent/50` - Destaque ao passar o mouse
   - `transition-colors` - Transição suave

3. **stopPropagation nos Botões**:
   - Evita que clicar em botões de ação abra os detalhes
   - Usar `onClick={(e) => e.stopPropagation()}` na célula de ações

4. **Acessibilidade**:
   - Considerar adicionar `role="button"` e `tabIndex={0}`
   - Suportar navegação por teclado (Enter)

---

## 📝 Implementação Sugerida

### Ordem de Prioridade:

1. **ALTA**: Produtos, Vendas, OS (usados frequentemente)
2. **MÉDIA**: Fornecedores, Estoque
3. **BAIXA**: Financeiro (quando implementar as páginas)

### Estimativa de Tempo:
- ~15 minutos por tabela
- Total: ~2 horas para todas

---

## 🚀 Próximos Passos

1. Implementar em Produtos
2. Implementar em Vendas
3. Implementar em OS
4. Implementar nas demais conforme prioridade

**Nota**: Algumas páginas de detalhes podem ainda não existir. Criar páginas básicas de detalhes conforme necessário.
