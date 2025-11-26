/**
 * TypeScript types for ZeroTec ERP
 */

// Dashboard Types
export interface DashboardKPIs {
    vendas_mes: {
        total: number;
        quantidade: number;
        ticket_medio: number;
        variacao: number;
    };
    os_mes: {
        total: number;
        quantidade: number;
        abertas: number;
        concluidas: number;
    };
    financeiro_mes: {
        receber: number;
        pagar: number;
        saldo: number;
    };
}

export interface DashboardGraficos {
    vendas_ano: Array<{ mes: number; valor: number }>;
    custos_ano: Array<{ mes: number; valor: number }>;
    os_ano: Array<{ mes: number; quantidade: number }>;
}

export interface DashboardMovimentacao {
    id: number;
    tipo: 'venda' | 'os' | 'pagamento' | 'recebimento';
    descricao: string;
    valor: number;
    data: string;
}

export interface Dashboard {
    kpis: DashboardKPIs;
    graficos: DashboardGraficos;
    ultimas_movimentacoes: DashboardMovimentacao[];
}

// DRE Types
export interface DREPeriodo {
    mes?: number;
    ano: number;
    data_inicio?: string;
    data_fim?: string;
}

export interface DREReceita {
    vendas_produtos: number;
    vendas_mercadorias: number;
    prestacao_servicos: number;
    frete: number;
    total: number;
}

export interface DREDeducoes {
    devolucoes: number;
    abatimentos: number;
    impostos: number;
    total: number;
}

export interface DRECustos {
    produtos: number;
    mercadorias: number;
    servicos: number;
    total: number;
}

export interface DREDespesas {
    vendas: number;
    administrativas: number;
    salarios: number;
    total: number;
}

export interface DREMensal {
    periodo: DREPeriodo;
    receita_bruta: DREReceita;
    deducoes: DREDeducoes;
    receita_liquida: number;
    custos: DRECustos;
    lucro_bruto: number;
    despesas_operacionais: DREDespesas;
    despesas_financeiras_liquidas: number;
    outras_receitas_despesas: number;
    resultado_operacional: number;
    provisao_ir_csll: number;
    lucro_antes_participacoes: number;
    participacoes: number;
    lucro_liquido: number;
    margem_liquida: number;
}

export interface DREAnualMes {
    mes: number;
    receita_bruta: number;
    deducoes: number;
    receita_liquida: number;
    custos: number;
    lucro_bruto: number;
    despesas_operacionais: number;
    lucro_liquido: number;
    margem_liquida: number;
}

export interface DREAnual {
    periodo: DREPeriodo;
    meses: DREAnualMes[];
    totais: {
        receita_bruta: number;
        deducoes: number;
        receita_liquida: number;
        custos: number;
        lucro_bruto: number;
        despesas_operacionais: number;
        lucro_liquido: number;
        margem_liquida: number;
    };
}

// Cliente Types
export interface Cliente {
    id: number;
    nome: string;
    tipo_pessoa: 'fisica' | 'juridica';
    cpf_cnpj: string;
    email: string;
    telefone: string;
    celular: string;
    endereco: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    ativo: boolean;
    data_cadastro: string;
}

// Produto Types
export interface Produto {
    id: number;
    codigo: string;
    codigo_barras: string;
    nome: string;
    descricao: string;
    categoria: string;
    unidade_medida: string;
    preco_custo: number;
    preco_venda: number;
    margem_lucro: number;
    estoque_atual: number;
    estoque_minimo: number;
    estoque_maximo: number;
    ativo: boolean;
    data_cadastro: string;
}

// Venda Types
export interface VendaItem {
    id: number;
    produto: Produto;
    quantidade: number;
    preco_unitario: number;
    desconto: number;
    subtotal: number;
}

export interface Venda {
    id: number;
    numero_venda: string;
    cliente: Cliente;
    data_venda: string;
    status: 'orcamento' | 'aprovado' | 'finalizada' | 'cancelada';
    itens: VendaItem[];
    subtotal: number;
    desconto: number;
    frete: number;
    valor_total: number;
    custo_total: number;
    lucro: number;
    forma_pagamento: string;
    observacoes: string;
}

// Ordem de Serviço Types
export interface OrdemServico {
    id: number;
    numero_os: string;
    cliente: Cliente;
    equipamento: string;
    defeito_reclamado: string;
    defeito_constatado: string;
    solucao: string;
    status: 'aberta' | 'em_andamento' | 'aguardando_pecas' | 'concluida' | 'cancelada';
    prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
    data_abertura: string;
    data_previsao: string;
    data_conclusao: string;
    valor_servicos: number;
    valor_produtos: number;
    desconto: number;
    frete: number;
    valor_total: number;
    custo_total: number;
    tecnico: string;
    observacoes: string;
}

// Estoque Types
export interface MovimentacaoEstoque {
    id: number;
    produto: Produto;
    tipo: 'entrada' | 'saida' | 'ajuste';
    quantidade: number;
    motivo: string;
    data_movimentacao: string;
    usuario: string;
    observacoes: string;
}

// Financeiro Types
export interface ContaPagar {
    id: number;
    descricao: string;
    fornecedor: string;
    valor_original: number;
    valor_pago: number;
    data_vencimento: string;
    data_pagamento: string;
    status: 'pendente' | 'pago' | 'vencido' | 'cancelado';
    categoria_dre: string;
    forma_pagamento: string;
    observacoes: string;
}

export interface ContaReceber {
    id: number;
    descricao: string;
    cliente: Cliente;
    valor_original: number;
    valor_recebido: number;
    data_vencimento: string;
    data_recebimento: string;
    status: 'pendente' | 'recebido' | 'vencido' | 'cancelado';
    categoria_dre: string;
    forma_pagamento: string;
    observacoes: string;
}

// Pagination
export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}
