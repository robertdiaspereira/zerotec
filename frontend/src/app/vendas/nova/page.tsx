"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Plus, Trash2, ArrowLeft, Save, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";
import { SeletorPagamento } from "@/components/vendas/SeletorPagamento";
import { useToast } from "@/hooks/use-toast";

interface Produto {
    id: number;
    nome: string;
    codigo_interno: string;
    preco_venda: number;
    estoque_atual: number;
}

interface Cliente {
    id: number;
    nome_razao_social: string;
    cpf_cnpj: string;
}

interface ItemVenda {
    produto: Produto;
    quantidade: number;
    preco_unitario: number;
    desconto: number;
}

interface PagamentoInfo {
    formaRecebimentoId: number;
    parcelas: number;
    valor: number;
}

export default function NovaVendaPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = React.useState(false);
    const [produtos, setProdutos] = React.useState<Produto[]>([]);
    const [clientes, setClientes] = React.useState<Cliente[]>([]);

    // Form State
    const [clienteSelecionado, setClienteSelecionado] = React.useState<Cliente | null>(null);
    const [itens, setItens] = React.useState<ItemVenda[]>([]);
    const [observacoes, setObservacoes] = React.useState("");
    const [pagamentoInfo, setPagamentoInfo] = React.useState<PagamentoInfo | null>(null);

    // UI State
    const [openCliente, setOpenCliente] = React.useState(false);
    const [openProduto, setOpenProduto] = React.useState(false);

    React.useEffect(() => {
        async function loadData() {
            try {
                const [produtosRes, clientesRes] = await Promise.all([
                    api.getProdutos(),
                    api.getClientes()
                ]);
                setProdutos(produtosRes.results || produtosRes);
                setClientes(clientesRes.results || clientesRes);
            } catch (error) {
                console.error("Erro ao carregar dados:", error);
                toast({
                    title: "Erro",
                    description: "Não foi possível carregar produtos e clientes.",
                    variant: "destructive",
                });
            }
        }
        loadData();
    }, []);

    const adicionarItem = (produto: Produto) => {
        setItens([
            ...itens,
            {
                produto,
                quantidade: 1,
                preco_unitario: produto.preco_venda,
                desconto: 0,
            },
        ]);
        setOpenProduto(false);
    };

    const removerItem = (index: number) => {
        const newItens = [...itens];
        newItens.splice(index, 1);
        setItens(newItens);
    };

    const atualizarItem = (index: number, field: keyof ItemVenda, value: number) => {
        const newItens = [...itens];
        newItens[index] = { ...newItens[index], [field]: value };
        setItens(newItens);
    };

    const calcularTotais = () => {
        const subtotal = itens.reduce((acc, item) => acc + (item.preco_unitario * item.quantidade), 0);
        const descontoTotal = itens.reduce((acc, item) => acc + item.desconto, 0);
        const total = subtotal - descontoTotal;
        return { subtotal, descontoTotal, total };
    };

    const { subtotal, descontoTotal, total } = calcularTotais();

    const finalizarVenda = async (status: 'orcamento' | 'aprovado' | 'faturado') => {
        if (!clienteSelecionado) {
            toast({
                title: "Atenção",
                description: "Selecione um cliente para continuar.",
                variant: "destructive",
            });
            return;
        }
        if (itens.length === 0) {
            toast({
                title: "Atenção",
                description: "Adicione pelo menos um item à venda.",
                variant: "destructive",
            });
            return;
        }

        // Se for faturar, exige pagamento selecionado
        if (status === 'faturado' && !pagamentoInfo) {
            toast({
                title: "Atenção",
                description: "Selecione uma forma de pagamento para finalizar a venda.",
                variant: "destructive",
            });
            return;
        }

        try {
            setLoading(true);

            // 1. Criar Venda
            const payloadVenda = {
                cliente: clienteSelecionado.id,
                status: status === 'faturado' ? 'aprovado' : status, // Cria como aprovado primeiro se for faturar
                observacoes,
                itens: itens.map(item => ({
                    produto: item.produto.id,
                    quantidade: item.quantidade,
                    preco_unitario: item.preco_unitario,
                    desconto: item.desconto
                }))
            };

            const vendaCriada: any = await api.createVenda(payloadVenda);

            // 2. Se for faturar, criar Recebimento e atualizar status
            if (status === 'faturado' && pagamentoInfo) {
                // Criar Recebimento
                await api.createRecebimentoVenda({
                    venda: vendaCriada.id,
                    forma_recebimento: pagamentoInfo.formaRecebimentoId,
                    valor_bruto: pagamentoInfo.valor,
                    parcelas: pagamentoInfo.parcelas,
                    data_vencimento: new Date().toISOString().split('T')[0] // Vencimento hoje por padrão
                });

                // Faturar Venda (Isso dispara a baixa de estoque no backend se houver lógica para isso, ou atualiza status)
                // O endpoint 'faturar' do VendaViewSet já faz a verificação de estoque e muda status
                // Mas como o VendaViewSet tem action 'faturar', vamos usá-la se existir, ou update simples

                // Vamos tentar chamar a action faturar se ela existir no seu backend (verifiquei antes e existe)
                // Mas a action faturar do backend não recebe pagamento, então criamos o pagamento antes.

                // Chamada para faturar (que muda status para 'faturado' e baixa estoque)
                // Preciso verificar como chamar a action customizada via api.ts
                // Como não tenho método específico, vou usar um request direto ou adicionar no api.ts depois.
                // Por enquanto, vou assumir que o backend lida com isso ou vou fazer um patch simples se não tiver action.
                // O VendaViewSet tem action `faturar`.

                await api.post(`/vendas/vendas/${vendaCriada.id}/faturar/`);
            }

            toast({
                title: "Sucesso",
                description: `Venda ${vendaCriada.numero} salva com sucesso!`,
            });

            router.push("/vendas");
        } catch (error) {
            console.error("Erro ao salvar venda:", error);
            toast({
                title: "Erro",
                description: "Ocorreu um erro ao salvar a venda. Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Nova Venda</h1>
                        <p className="text-muted-foreground">PDV - Ponto de Venda</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => finalizarVenda('orcamento')} disabled={loading}>
                        Salvar Orçamento
                    </Button>
                    <Button onClick={() => finalizarVenda('faturado')} disabled={loading}>
                        <Save className="mr-2 h-4 w-4" />
                        Finalizar Venda
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Coluna Esquerda: Produtos e Itens */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Busca de Produtos */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Adicionar Produtos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Popover open={openProduto} onOpenChange={setOpenProduto}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openProduto}
                                        className="w-full justify-between"
                                    >
                                        <div className="flex items-center gap-2">
                                            <ShoppingCart className="h-4 w-4" />
                                            Buscar produto por nome ou código...
                                        </div>
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[500px] p-0" align="start">
                                    <Command>
                                        <CommandInput placeholder="Buscar produto..." />
                                        <CommandList>
                                            <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                                            <CommandGroup>
                                                {produtos.map((produto) => (
                                                    <CommandItem
                                                        key={produto.id}
                                                        value={`${produto.nome} ${produto.codigo_interno}`}
                                                        onSelect={() => adicionarItem(produto)}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4 opacity-0"
                                                            )}
                                                        />
                                                        <div className="flex flex-col">
                                                            <span>{produto.nome}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                Cód: {produto.codigo_interno} | Estoque: {produto.estoque_atual}
                                                            </span>
                                                        </div>
                                                        <div className="ml-auto font-medium">
                                                            {new Intl.NumberFormat("pt-BR", {
                                                                style: "currency",
                                                                currency: "BRL",
                                                            }).format(produto.preco_venda)}
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </CardContent>
                    </Card>

                    {/* Lista de Itens */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Itens da Venda</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Produto</TableHead>
                                        <TableHead className="w-[100px]">Qtd</TableHead>
                                        <TableHead className="w-[120px]">Preço Unit.</TableHead>
                                        <TableHead className="w-[120px]">Desconto</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {itens.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                Nenhum item adicionado à venda
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        itens.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <div className="font-medium">{item.produto.nome}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {item.produto.codigo_interno}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantidade}
                                                        onChange={(e) => atualizarItem(index, 'quantidade', parseFloat(e.target.value) || 0)}
                                                        className="h-8"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={item.preco_unitario}
                                                        onChange={(e) => atualizarItem(index, 'preco_unitario', parseFloat(e.target.value) || 0)}
                                                        className="h-8"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={item.desconto}
                                                        onChange={(e) => atualizarItem(index, 'desconto', parseFloat(e.target.value) || 0)}
                                                        className="h-8 text-red-500"
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {new Intl.NumberFormat("pt-BR", {
                                                        style: "currency",
                                                        currency: "BRL",
                                                    }).format((item.preco_unitario * item.quantidade) - item.desconto)}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                                        onClick={() => removerItem(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Coluna Direita: Cliente e Totais */}
                <div className="space-y-6">
                    {/* Seleção de Cliente */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Cliente</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Popover open={openCliente} onOpenChange={setOpenCliente}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openCliente}
                                        className="w-full justify-between"
                                    >
                                        {clienteSelecionado
                                            ? clienteSelecionado.nome_razao_social
                                            : "Selecione um cliente..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Buscar cliente..." />
                                        <CommandList>
                                            <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                                            <CommandGroup>
                                                {clientes.map((cliente) => (
                                                    <CommandItem
                                                        key={cliente.id}
                                                        value={cliente.nome_razao_social}
                                                        onSelect={() => {
                                                            setClienteSelecionado(cliente);
                                                            setOpenCliente(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                clienteSelecionado?.id === cliente.id
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                            )}
                                                        />
                                                        {cliente.nome_razao_social}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>

                            {clienteSelecionado && (
                                <div className="rounded-md bg-muted p-3 text-sm">
                                    <p className="font-medium">{clienteSelecionado.nome_razao_social}</p>
                                    <p className="text-muted-foreground">{clienteSelecionado.cpf_cnpj}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Resumo Financeiro */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Resumo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>
                                        {new Intl.NumberFormat("pt-BR", {
                                            style: "currency",
                                            currency: "BRL",
                                        }).format(subtotal)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Descontos</span>
                                    <span className="text-red-500">
                                        - {new Intl.NumberFormat("pt-BR", {
                                            style: "currency",
                                            currency: "BRL",
                                        }).format(descontoTotal)}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span>
                                        {new Intl.NumberFormat("pt-BR", {
                                            style: "currency",
                                            currency: "BRL",
                                        }).format(total)}
                                    </span>
                                </div>
                            </div>

                            <Separator />

                            <SeletorPagamento
                                valorTotal={total}
                                onChange={setPagamentoInfo}
                            />

                            <div className="space-y-2 pt-4">
                                <Label>Observações</Label>
                                <Textarea
                                    placeholder="Observações da venda..."
                                    value={observacoes}
                                    onChange={(e) => setObservacoes(e.target.value)}
                                    className="h-20"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
