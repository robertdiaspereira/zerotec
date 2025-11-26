"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import api from "@/lib/api";

interface Produto {
    id: number;
    codigo_interno: string;
    nome: string;
    tipo: string;
    preco_custo: number;
    preco_venda: number;
    estoque_atual: number;
}

interface ItemVenda {
    id: number;
    produto: number;
    quantidade: number;
    preco_unitario: number;
    preco_total: number;
}

interface Venda {
    id: number;
    numero: string;
    data_venda: string;
    cliente: {
        id: number;
        nome_razao_social: string;
    };
    status: string;
    itens: ItemVenda[];
    valor_total: number;
}

interface ItemCompra {
    id: number;
    produto: number;
    quantidade_pedida: number;
    preco_unitario: number;
    preco_total: number;
}

interface Compra {
    id: number;
    numero: string;
    data_pedido: string;
    fornecedor: {
        id: number;
        razao_social: string;
    };
    status: string;
    itens: ItemCompra[];
    valor_total: number;
}

export default function ProdutoHistoricoPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [produto, setProduto] = React.useState<Produto | null>(null);
    const [vendas, setVendas] = React.useState<Venda[]>([]);
    const [compras, setCompras] = React.useState<Compra[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const produtoId = parseInt(params.id);

                // Fetch product details
                const produtoData = await api.getProduto(produtoId);
                setProduto(produtoData as Produto);

                // Fetch sales history
                const vendasData = await api.getVendas({ itens__produto: produtoId }) as any;
                setVendas(vendasData.results || vendasData);

                // Fetch purchase history
                const comprasData = await api.getCompras({ itens__produto: produtoId }) as any;
                setCompras(comprasData.results || comprasData);

            } catch (err) {
                setError(err instanceof Error ? err.message : "Erro ao carregar dados");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [params.id]);

    if (loading) {
        return <HistoricoSkeleton />;
    }

    if (error || !produto) {
        return (
            <div className="flex h-[400px] items-center justify-center flex-col gap-4">
                <div className="text-center">
                    <p className="text-lg font-semibold text-destructive">
                        Erro ao carregar histórico
                    </p>
                    <p className="text-sm text-muted-foreground">{error || "Produto não encontrado"}</p>
                </div>
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
            </div>
        );
    }

    // Calculate totals
    const totalVendido = vendas.reduce((acc, venda) => {
        const item = venda.itens.find(i => i.produto === produto.id);
        return acc + (item ? Number(item.quantidade) : 0);
    }, 0);

    const totalComprado = compras.reduce((acc, compra) => {
        const item = compra.itens.find(i => i.produto === produto.id);
        return acc + (item ? Number(item.quantidade_pedida) : 0);
    }, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Histórico do Produto</h1>
                    <p className="text-muted-foreground">
                        {produto.codigo_interno} - {produto.nome}
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Estoque Atual</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{produto.estoque_atual}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Vendido</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalVendido}</div>
                        <p className="text-xs text-muted-foreground">unidades vendidas</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Comprado</CardTitle>
                        <TrendingDown className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalComprado}</div>
                        <p className="text-xs text-muted-foreground">unidades compradas</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="vendas" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="vendas">Vendas (Clientes)</TabsTrigger>
                    <TabsTrigger value="compras">Compras (Fornecedores)</TabsTrigger>
                </TabsList>

                <TabsContent value="vendas">
                    <Card>
                        <CardHeader>
                            <CardTitle>Histórico de Vendas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Qtd.</TableHead>
                                        <TableHead className="text-right">Preço Unit.</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {vendas.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center">
                                                Nenhuma venda encontrada
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        vendas.map((venda) => {
                                            const item = venda.itens.find(i => i.produto === produto.id);
                                            if (!item) return null;
                                            return (
                                                <TableRow key={venda.id}>
                                                    <TableCell>
                                                        {new Date(venda.data_venda).toLocaleDateString("pt-BR")}
                                                    </TableCell>
                                                    <TableCell>{venda.cliente?.nome_razao_social || "Consumidor Final"}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="capitalize">
                                                            {venda.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">{item.quantidade}</TableCell>
                                                    <TableCell className="text-right">
                                                        {new Intl.NumberFormat("pt-BR", {
                                                            style: "currency",
                                                            currency: "BRL",
                                                        }).format(Number(item.preco_unitario))}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {new Intl.NumberFormat("pt-BR", {
                                                            style: "currency",
                                                            currency: "BRL",
                                                        }).format(Number(item.preco_total))}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="compras">
                    <Card>
                        <CardHeader>
                            <CardTitle>Histórico de Compras</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Fornecedor</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Qtd.</TableHead>
                                        <TableHead className="text-right">Preço Unit.</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {compras.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center">
                                                Nenhuma compra encontrada
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        compras.map((compra) => {
                                            const item = compra.itens.find(i => i.produto === produto.id);
                                            if (!item) return null;
                                            return (
                                                <TableRow key={compra.id}>
                                                    <TableCell>
                                                        {new Date(compra.data_pedido).toLocaleDateString("pt-BR")}
                                                    </TableCell>
                                                    <TableCell>{compra.fornecedor?.razao_social}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="capitalize">
                                                            {compra.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">{item.quantidade_pedida}</TableCell>
                                                    <TableCell className="text-right">
                                                        {new Intl.NumberFormat("pt-BR", {
                                                            style: "currency",
                                                            currency: "BRL",
                                                        }).format(Number(item.preco_unitario))}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {new Intl.NumberFormat("pt-BR", {
                                                            style: "currency",
                                                            currency: "BRL",
                                                        }).format(Number(item.preco_total))}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function HistoricoSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10" />
                <div>
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="mt-2 h-4 w-32" />
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
            </div>
            <Skeleton className="h-[400px]" />
        </div>
    );
}
