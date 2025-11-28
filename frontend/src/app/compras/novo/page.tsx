"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    Search,
    Loader2,
    ShoppingCart,
    Package
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ItemCompra {
    produto_id: number;
    produto_nome: string;
    quantidade: number;
    preco_unitario: number;
    subtotal: number;
}

export default function NovaCompraPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [saving, setSaving] = React.useState(false);
    const [loadingFornecedores, setLoadingFornecedores] = React.useState(false);
    const [loadingProdutos, setLoadingProdutos] = React.useState(false);

    const [fornecedores, setFornecedores] = React.useState<any[]>([]);
    const [produtos, setProdutos] = React.useState<any[]>([]);
    const [produtoSearch, setProdutoSearch] = React.useState("");

    const [formData, setFormData] = React.useState({
        fornecedor_id: "",
        data_entrega_prevista: "",
        valor_frete: "0",
        valor_desconto: "0",
        desconto_percentual: "0",
        tipo_desconto: "valor" as "valor" | "percentual",
        forma_pagamento: "boleto",
        condicao_pagamento: "",
        observacoes: "",
    });

    const [itens, setItens] = React.useState<ItemCompra[]>([]);

    React.useEffect(() => {
        loadFornecedores();
    }, []);

    const loadFornecedores = async () => {
        try {
            setLoadingFornecedores(true);
            const data: any = await api.getFornecedores({ active: 1 });
            setFornecedores(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error("Erro ao carregar fornecedores:", error);
        } finally {
            setLoadingFornecedores(false);
        }
    };

    const searchProdutos = async (query: string) => {
        if (!query || query.length < 2) {
            setProdutos([]);
            return;
        }

        try {
            setLoadingProdutos(true);
            const data: any = await api.getProdutos({ search: query });
            setProdutos(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error("Erro ao buscar produtos:", error);
        } finally {
            setLoadingProdutos(false);
        }
    };

    const handleAddProduto = (produto: any) => {
        const jaAdicionado = itens.find(item => item.produto_id === produto.id);
        if (jaAdicionado) {
            toast({
                title: "Atenção",
                description: "Este produto já foi adicionado.",
                variant: "destructive",
            });
            return;
        }

        const novoItem: ItemCompra = {
            produto_id: produto.id,
            produto_nome: produto.nome,
            quantidade: 1,
            preco_unitario: parseFloat(produto.preco_custo || produto.preco_venda || 0),
            subtotal: parseFloat(produto.preco_custo || produto.preco_venda || 0),
        };

        setItens([...itens, novoItem]);
        setProdutoSearch("");
        setProdutos([]);
    };

    const handleRemoveProduto = (index: number) => {
        setItens(itens.filter((_, i) => i !== index));
    };

    const handleUpdateItem = (index: number, field: string, value: any) => {
        const novosItens = [...itens];
        novosItens[index] = {
            ...novosItens[index],
            [field]: value,
        };

        if (field === "quantidade" || field === "preco_unitario") {
            novosItens[index].subtotal = novosItens[index].quantidade * novosItens[index].preco_unitario;
        }

        setItens(novosItens);
    };

    const calcularTotais = () => {
        const totalProdutos = itens.reduce((sum, item) => sum + item.subtotal, 0);
        const frete = parseFloat(formData.valor_frete) || 0;

        let desconto = 0;
        if (formData.tipo_desconto === "percentual") {
            const percentual = parseFloat(formData.desconto_percentual) || 0;
            desconto = (totalProdutos * percentual) / 100;
        } else {
            desconto = parseFloat(formData.valor_desconto) || 0;
        }

        const total = totalProdutos + frete - desconto;

        return { totalProdutos, frete, desconto, total };
    };

    const handleSubmit = async () => {
        if (!formData.fornecedor_id) {
            toast({
                title: "Atenção",
                description: "Selecione um fornecedor.",
                variant: "destructive",
            });
            return;
        }

        if (itens.length === 0) {
            toast({
                title: "Atenção",
                description: "Adicione pelo menos um produto.",
                variant: "destructive",
            });
            return;
        }

        if (!formData.data_entrega_prevista) {
            toast({
                title: "Atenção",
                description: "Informe a data prevista de entrega.",
                variant: "destructive",
            });
            return;
        }

        try {
            setSaving(true);
            const { totalProdutos, total } = calcularTotais();

            const payload = {
                fornecedor: parseInt(formData.fornecedor_id),
                data_entrega_prevista: formData.data_entrega_prevista,
                valor_produtos: totalProdutos,
                valor_frete: parseFloat(formData.valor_frete) || 0,
                valor_desconto: parseFloat(formData.valor_desconto) || 0,
                valor_total: total,
                forma_pagamento: formData.forma_pagamento,
                condicao_pagamento: formData.condicao_pagamento,
                observacoes: formData.observacoes,
                itens: itens.map(item => ({
                    produto: item.produto_id,
                    quantidade_pedida: item.quantidade,
                    preco_unitario: item.preco_unitario,
                })),
            };

            await api.createPedidoCompra(payload);
            toast({
                title: "Sucesso",
                description: "Pedido de compra criado com sucesso!",
            });
            router.push("/compras");
        } catch (error) {
            console.error("Erro ao criar pedido:", error);
            toast({
                title: "Erro",
                description: "Não foi possível criar o pedido de compra.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const { totalProdutos, frete, desconto, total } = calcularTotais();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push("/compras")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Nova Compra</h1>
                        <p className="text-muted-foreground">
                            Crie um novo pedido de compra
                        </p>
                    </div>
                </div>
                <Button onClick={handleSubmit} disabled={saving}>
                    {saving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Salvar Pedido
                        </>
                    )}
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Coluna Principal */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Fornecedor e Data */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações do Pedido</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="fornecedor">Fornecedor *</Label>
                                    <Select
                                        value={formData.fornecedor_id}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, fornecedor_id: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o fornecedor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {loadingFornecedores ? (
                                                <SelectItem value="loading" disabled>Carregando...</SelectItem>
                                            ) : fornecedores.length === 0 ? (
                                                <SelectItem value="empty" disabled>Nenhum fornecedor ativo</SelectItem>
                                            ) : (
                                                fornecedores.map((fornecedor) => (
                                                    <SelectItem key={fornecedor.id} value={fornecedor.id.toString()}>
                                                        {fornecedor.razao_social || fornecedor.nome_fantasia}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="data_entrega">Data Prevista de Entrega *</Label>
                                    <Input
                                        id="data_entrega"
                                        type="date"
                                        value={formData.data_entrega_prevista}
                                        onChange={(e) => setFormData(prev => ({ ...prev, data_entrega_prevista: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Produtos */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Produtos</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                        {itens.length} {itens.length === 1 ? "item" : "itens"}
                                    </span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Busca de Produtos */}
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar produto por nome ou código..."
                                    value={produtoSearch}
                                    onChange={(e) => {
                                        setProdutoSearch(e.target.value);
                                        searchProdutos(e.target.value);
                                    }}
                                    className="pl-10"
                                />
                                {loadingProdutos && (
                                    <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                                )}
                                {produtos.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                                        {produtos.map((produto) => (
                                            <button
                                                key={produto.id}
                                                onClick={() => handleAddProduto(produto)}
                                                className="w-full px-4 py-2 text-left hover:bg-accent flex justify-between items-center"
                                            >
                                                <div>
                                                    <div className="font-medium">{produto.nome}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Código: {produto.codigo || "-"}
                                                    </div>
                                                </div>
                                                <div className="text-sm font-medium">
                                                    {new Intl.NumberFormat("pt-BR", {
                                                        style: "currency",
                                                        currency: "BRL",
                                                    }).format(produto.preco_custo || produto.preco_venda || 0)}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Tabela de Itens */}
                            {itens.length > 0 && (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Produto</TableHead>
                                            <TableHead className="w-[120px]">Quantidade</TableHead>
                                            <TableHead className="w-[150px]">Preço Unit.</TableHead>
                                            <TableHead className="text-right">Subtotal</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {itens.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{item.produto_nome}</TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        min="0.001"
                                                        step="0.001"
                                                        value={item.quantidade}
                                                        onChange={(e) => handleUpdateItem(index, "quantidade", parseFloat(e.target.value) || 0)}
                                                        className="w-full"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={item.preco_unitario}
                                                        onChange={(e) => handleUpdateItem(index, "preco_unitario", parseFloat(e.target.value) || 0)}
                                                        className="w-full"
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {new Intl.NumberFormat("pt-BR", {
                                                        style: "currency",
                                                        currency: "BRL",
                                                    }).format(item.subtotal)}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveProduto(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar - Resumo e Pagamento */}
                <div className="space-y-6">
                    {/* Resumo Financeiro */}
                    <Card className="border-2">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Resumo Financeiro</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor="frete" className="text-sm">Frete</Label>
                                    <Input
                                        id="frete"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.valor_frete}
                                        onChange={(e) => setFormData(prev => ({ ...prev, valor_frete: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="desconto" className="text-sm">Desconto</Label>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant={formData.tipo_desconto === "valor" ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setFormData(prev => ({ ...prev, tipo_desconto: "valor" }))}
                                            >
                                                R$
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={formData.tipo_desconto === "percentual" ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setFormData(prev => ({ ...prev, tipo_desconto: "percentual" }))}
                                            >
                                                %
                                            </Button>
                                        </div>
                                    </div>
                                    {formData.tipo_desconto === "valor" ? (
                                        <Input
                                            id="desconto"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="0,00"
                                            value={formData.valor_desconto}
                                            onChange={(e) => setFormData(prev => ({ ...prev, valor_desconto: e.target.value }))}
                                        />
                                    ) : (
                                        <div className="space-y-1">
                                            <Input
                                                id="desconto_percentual"
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.1"
                                                placeholder="0"
                                                value={formData.desconto_percentual}
                                                onChange={(e) => setFormData(prev => ({ ...prev, desconto_percentual: e.target.value }))}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Desconto: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(desconto)}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold">Total Geral</span>
                                        <span className="text-2xl font-bold text-primary">
                                            {new Intl.NumberFormat("pt-BR", {
                                                style: "currency",
                                                currency: "BRL",
                                            }).format(total)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pagamento */}
                    <Card className="border-2">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Pagamento</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="forma_pagamento" className="text-sm font-medium">Forma de Pagamento</Label>
                                <Select
                                    value={formData.forma_pagamento}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, forma_pagamento: value }))}
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="dinheiro">💵 Dinheiro</SelectItem>
                                        <SelectItem value="pix">🔷 PIX</SelectItem>
                                        <SelectItem value="cartao_credito">💳 Cartão de Crédito</SelectItem>
                                        <SelectItem value="cartao_debito">💳 Cartão de Débito</SelectItem>
                                        <SelectItem value="boleto">📄 Boleto</SelectItem>
                                        <SelectItem value="transferencia">🏦 Transferência</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="condicao">Condição de Pagamento</Label>
                                <Input
                                    id="condicao"
                                    value={formData.condicao_pagamento}
                                    onChange={(e) => setFormData(prev => ({ ...prev, condicao_pagamento: e.target.value }))}
                                    placeholder="Ex: 30/60/90 dias"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="observacoes">Observações</Label>
                                <Textarea
                                    id="observacoes"
                                    value={formData.observacoes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                                    placeholder="Observações adicionais..."
                                    rows={4}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
