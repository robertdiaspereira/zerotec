# 📊 Sistema de Categorias DRE - Plano Completo

## 🎯 Objetivo

Criar um sistema de categorias financeiras hierárquico que:
1. Tenha categorias **fixas da DRE** (não podem ser excluídas)
2. Permita criar **subcategorias personalizadas** vinculadas às categorias fixas
3. Todo lançamento financeiro seja categorizado
4. Gere automaticamente o relatório DRE

---

## 📋 Estrutura de Categorias DRE (Padrão Contábil)

### 1. RECEITAS

#### 1.1 Receita Bruta de Vendas
- **Subcategorias Sugeridas**:
  - Vendas de Produtos
  - Vendas de Serviços
  - Ordens de Serviço
  - Revenda de Mercadorias

#### 1.2 Deduções de Vendas (-)
- **Subcategorias Fixas**:
  - Devoluções de Vendas
  - Abatimentos
  - Impostos e Contribuições Incidentes sobre Vendas
  - Descontos Incondicionais

#### 1.3 Receita Líquida de Vendas (=)
- Calculado automaticamente: Receita Bruta - Deduções

---

### 2. CUSTOS

#### 2.1 Custo dos Produtos Vendidos (CPV)
- **Subcategorias Sugeridas**:
  - Custo de Produtos Vendidos
  - Custo de Mercadorias Vendidas
  - Custo de Serviços Prestados

#### 2.2 Custo da Venda de Bens e Direitos do Ativo Não Circulante
- **Subcategorias Sugeridas**:
  - Custo de Venda de Imobilizado
  - Custo de Venda de Investimentos

---

### 3. DESPESAS OPERACIONAIS

#### 3.1 Despesas Com Vendas
- **Subcategorias Sugeridas**:
  - Comissões de Vendedores
  - Propaganda e Marketing
  - Frete sobre Vendas
  - Embalagens
  - Brindes e Amostras

#### 3.2 Despesas Administrativas
- **Subcategorias Sugeridas**:
  - Salários e Encargos
  - Pró-labore
  - Aluguel
  - Energia Elétrica
  - Água
  - Telefone e Internet
  - Material de Escritório
  - Material de Limpeza
  - Manutenção e Reparos
  - Depreciação
  - Seguros
  - Honorários Contábeis
  - Honorários Advocatícios
  - Taxas e Contribuições

#### 3.3 Despesas Financeiras
- **Subcategorias Sugeridas**:
  - Juros Pagos
  - Multas Fiscais
  - Tarifas Bancárias
  - IOF
  - Descontos Concedidos

#### 3.4 Outras Despesas Operacionais
- **Subcategorias Personalizáveis**

---

### 4. OUTRAS RECEITAS E DESPESAS

#### 4.1 Outras Receitas
- **Subcategorias Sugeridas**:
  - Receitas Financeiras (Juros Recebidos)
  - Descontos Obtidos
  - Rendimentos de Aplicações
  - Venda de Sucata
  - Aluguéis Recebidos

#### 4.2 Outras Despesas
- **Subcategorias Personalizáveis**

---

### 5. MOVIMENTAÇÕES ESPECIAIS

#### 5.1 Lançamento Inicial de Caixa (+)
- Saldo inicial do caixa

#### 5.2 Sangria (-)
- Retirada de dinheiro do caixa

#### 5.3 Suprimento (+)
- Entrada de dinheiro no caixa

#### 5.4 Investimento
- **Subcategorias Sugeridas**:
  - Aquisição patrimonial Veículo
  - Aquisição patrimonial Imóveis
  - Aplicações Financeiras
  - Compra de Ações

#### 5.5 Diminuir Caixa (-)
- Ajustes de caixa

---

## 🗂️ Categorias Observadas nas Imagens

### Do Sistema de Referência:
1. ✅ Lançamento Inicial Caixa
2. ✅ Aquisição patrimonial Veículo
3. ✅ Aquisição patrimonial Imóveis
4. ✅ Investimento
5. ✅ Custo de produção variável
6. ✅ Diminuir Caixa
7. ✅ Devoluções de Vendas
8. ✅ Abatimentos
9. ✅ Impostos e Contribuições Incidentes sobre Vendas
10. ✅ Despesas Com Vendas
11. ✅ Despesas Administrativas
12. ✅ Pagamento Salários
13. ✅ Despesas Financeiras
14. ✅ Variações Monetárias e Cambiais Passivas
15. ✅ Resultado da Equivalência Patrimonial
16. ✅ Venda de Bens e Direitos do Ativo Não Circulante
17. ✅ Custo da Venda de Bens e Direitos do Ativo Não Circulante
18. ✅ Provisão para Imposto de Renda e Contribuição Social Sobre o Lucro
19. ✅ Participações de Administradores e outros
20. ✅ Outras Receitas
21. ✅ Outras Despesas
22. ✅ Compra Inicial

---

## 💾 Estrutura de Banco de Dados

### Tabela: `categoria_dre`
```sql
CREATE TABLE categoria_dre (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(10) UNIQUE NOT NULL,  -- Ex: "1.1", "2.1", "3.1.1"
    nome VARCHAR(200) NOT NULL,
    tipo VARCHAR(20) NOT NULL,  -- 'receita', 'despesa', 'custo', 'especial'
    grupo_dre VARCHAR(50) NOT NULL,  -- 'receita_bruta', 'deducoes', 'cpv', etc.
    categoria_pai_id INTEGER REFERENCES categoria_dre(id),
    nivel INTEGER NOT NULL,  -- 1, 2, 3 (hierarquia)
    fixa BOOLEAN DEFAULT FALSE,  -- TRUE = não pode excluir
    ordem INTEGER NOT NULL,  -- Para ordenação no DRE
    ativa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: `lancamento_financeiro`
```sql
CREATE TABLE lancamento_financeiro (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL,  -- 'entrada', 'saida'
    valor DECIMAL(15,2) NOT NULL,
    data DATE NOT NULL,
    descricao TEXT,
    categoria_dre_id INTEGER REFERENCES categoria_dre(id) NOT NULL,
    conta_bancaria_id INTEGER REFERENCES conta_bancaria(id),
    cliente_id INTEGER REFERENCES cliente(id),
    fornecedor_id INTEGER REFERENCES fornecedor(id),
    venda_id INTEGER REFERENCES venda(id),
    os_id INTEGER REFERENCES ordem_servico(id),
    recorrente BOOLEAN DEFAULT FALSE,
    anexo_1 VARCHAR(500),
    anexo_2 VARCHAR(500),
    usuario_id INTEGER REFERENCES usuario(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎨 Interface - Gerenciar Categorias DRE

### Tela: `/financeiro/categorias`

```tsx
┌─────────────────────────────────────────────────────────────┐
│  Categorias DRE                                             │
├─────────────────────────────────────────────────────────────┤
│  [Criar Subcategoria +]                                     │
├─────────────────────────────────────────────────────────────┤
│  Categoria Pai: [Selecione...]                             │
│  Nome da SubCategoria: [_____________________________]      │
│  [Salvar]                                                   │
├─────────────────────────────────────────────────────────────┤
│  Buscar: [_______]                                          │
├─────────────────────────────────────────────────────────────┤
│  ID  Categoria                        SubCategoria    Ações │
│  16  (+)Lançamento Inicial Caixa     (mesma)         [✏️][🗑️]│
│  17  (-)Aquisição patrimonial        Veículo         [✏️][🗑️]│
│  18  (-)Aquisição patrimonial        Imóveis         [✏️][🗑️]│
│  19  (-)Investimento                 (mesma)         [✏️][🗑️]│
│  20  (-)Custo de produção variável   (mesma)         [✏️][🗑️]│
└─────────────────────────────────────────────────────────────┘
```

### Dropdown de Categorias (Hierárquico)
```
Selecione a categoria do lançamento
├── 📈 RECEITAS
│   ├── Receita Bruta de Vendas
│   │   ├── Vendas de Produtos
│   │   ├── Vendas de Serviços
│   │   └── + Nova Subcategoria
│   ├── (-) Devoluções de Vendas
│   └── (-) Impostos sobre Vendas
├── 💰 CUSTOS
│   ├── Custo de Produtos Vendidos
│   └── Custo de Serviços Prestados
├── 💸 DESPESAS OPERACIONAIS
│   ├── Despesas Com Vendas
│   │   ├── Comissões
│   │   ├── Marketing
│   │   └── + Nova Subcategoria
│   ├── Despesas Administrativas
│   │   ├── Salários
│   │   ├── Aluguel
│   │   ├── Energia
│   │   └── + Nova Subcategoria
│   └── Despesas Financeiras
└── 🔄 MOVIMENTAÇÕES ESPECIAIS
    ├── (+) Lançamento Inicial Caixa
    ├── (-) Sangria
    ├── (+) Suprimento
    └── (-) Investimento
```

---

## 🎯 Tela de Lançamento Financeiro

### `/financeiro/fluxo-caixa` - Tab "Novo Lançamento"

```tsx
┌─────────────────────────────────────────────────────────────┐
│  Criar Lançamento                                           │
├─────────────────────────────────────────────────────────────┤
│  Valor *          Data *              Recebido/Pago         │
│  [Ex: 5,50]       [26/11/2025]        [SIM] [NÃO]          │
├─────────────────────────────────────────────────────────────┤
│  Subcategoria DRE * [+]               Repetir               │
│  [Selecione a categoria...]           [SIM] [NÃO]          │
├─────────────────────────────────────────────────────────────┤
│  Descrição *                                                │
│  [____________________________________________]              │
├─────────────────────────────────────────────────────────────┤
│  1º Anexo              2º Anexo                             │
│  [Escolher arquivo]    [Escolher arquivo]                   │
├─────────────────────────────────────────────────────────────┤
│  Conta Bancária *                                           │
│  [Selecione a conta...]                                     │
├─────────────────────────────────────────────────────────────┤
│  Cliente/Fornecedor (opcional)                              │
│  [Selecione...]                                             │
├─────────────────────────────────────────────────────────────┤
│                                          [Cancelar] [Salvar]│
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Relatório DRE Gerado

### `/relatorios/dre`

```
DEMONSTRAÇÃO DO RESULTADO DO EXERCÍCIO (DRE)
Período: 01/11/2025 a 30/11/2025

1. RECEITA BRUTA DE VENDAS                        R$ 50.000,00
   1.1 Vendas de Produtos                         R$ 30.000,00
   1.2 Vendas de Serviços                         R$ 15.000,00
   1.3 Ordens de Serviço                          R$  5.000,00

2. (-) DEDUÇÕES DE VENDAS                         R$ (8.000,00)
   2.1 Devoluções                                 R$ (1.000,00)
   2.2 Impostos sobre Vendas                      R$ (7.000,00)

3. (=) RECEITA LÍQUIDA                            R$ 42.000,00

4. (-) CUSTO DOS PRODUTOS VENDIDOS                R$ (20.000,00)
   4.1 CPV - Produtos                             R$ (15.000,00)
   4.2 CPV - Serviços                             R$ (5.000,00)

5. (=) LUCRO BRUTO                                R$ 22.000,00

6. (-) DESPESAS OPERACIONAIS                      R$ (12.000,00)
   6.1 Despesas Com Vendas                        R$ (3.000,00)
       - Comissões                                R$ (2.000,00)
       - Marketing                                R$ (1.000,00)
   6.2 Despesas Administrativas                   R$ (7.000,00)
       - Salários                                 R$ (4.000,00)
       - Aluguel                                  R$ (2.000,00)
       - Energia                                  R$ (1.000,00)
   6.3 Despesas Financeiras                       R$ (2.000,00)
       - Juros                                    R$ (1.500,00)
       - Tarifas Bancárias                        R$ (500,00)

7. (=) LUCRO OPERACIONAL                          R$ 10.000,00

8. (+/-) OUTRAS RECEITAS E DESPESAS               R$  1.000,00
   8.1 Outras Receitas                            R$  1.500,00
   8.2 Outras Despesas                            R$ (500,00)

9. (=) LUCRO ANTES DO IR/CSLL                     R$ 11.000,00

10. (-) IR/CSLL                                   R$ (2.000,00)

11. (=) LUCRO LÍQUIDO DO EXERCÍCIO                R$  9.000,00
```

---

## 🔄 Funcionalidades Especiais

### 1. Sangria
- **Tipo**: Saída
- **Categoria**: Movimentações Especiais > Sangria
- **Afeta**: Caixa (diminui saldo)
- **Não afeta**: DRE (é movimentação de caixa, não despesa)

### 2. Suprimento
- **Tipo**: Entrada
- **Categoria**: Movimentações Especiais > Suprimento
- **Afeta**: Caixa (aumenta saldo)
- **Não afeta**: DRE (é movimentação de caixa, não receita)

### 3. Lançamento Inicial
- **Tipo**: Entrada
- **Categoria**: Movimentações Especiais > Lançamento Inicial
- **Afeta**: Caixa (saldo inicial)
- **Não afeta**: DRE

### 4. Investimento
- **Tipo**: Saída
- **Categoria**: Movimentações Especiais > Investimento
- **Afeta**: Caixa + Ativo
- **Afeta DRE**: Apenas depreciação futura

---

## ✅ Checklist de Implementação

### Backend
- [ ] Criar modelo `CategoriaDRE`
- [ ] Criar modelo `LancamentoFinanceiro`
- [ ] Seed de categorias fixas da DRE
- [ ] API CRUD de categorias
- [ ] API CRUD de lançamentos
- [ ] Endpoint de relatório DRE

### Frontend
- [ ] Página de gerenciar categorias
- [ ] Formulário de criar subcategoria
- [ ] Dropdown hierárquico de categorias
- [ ] Formulário de lançamento financeiro
- [ ] Tab "Lançamento" no fluxo de caixa
- [ ] Botão "+ Nova Subcategoria" inline
- [ ] Página de relatório DRE

### Recursos Avançados
- [ ] Recorrência de lançamentos
- [ ] Upload de anexos (2 arquivos)
- [ ] Exportar DRE (PDF/Excel)
- [ ] Comparação de períodos
- [ ] Gráficos do DRE

---

## 🎯 Prioridade

**ALTA** - Sistema fundamental para:
- Controle financeiro completo
- Relatórios contábeis
- Tomada de decisão
- Conformidade fiscal

**Estimativa**: 5-7 dias de desenvolvimento

---

**Este será o sistema financeiro mais completo! 🚀**
