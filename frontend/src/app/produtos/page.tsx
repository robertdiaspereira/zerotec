/**
 * Produtos Page
 * Listagem de produtos com filtros e busca
 */

"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Package, AlertTriangle, History } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Produto {
    id: number;
    codigo_interno: string;
    nome: string;
    tipo: string;
    categoria?: string;
    preco_custo: number;
    preco_venda: number;
    estoque_atual: number;
    estoque_minimo: number;
    active: boolean;
}

export default function ProdutosPage() {
    const router = useRouter();
    const [produtos, setProdutos] = React.useState<Produto[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [showLowStockOnly, setShowLowStockOnly] = React.useState(false);

    React.useEffect(() => {
        async function fetchProdutos() {
            try {
                setLoading(true);
                const response = await api.getProdutos() as any;
                setProdutos(response.results || response);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Erro ao carregar produtos"
                );
            } finally {
                setLoading(false);
            }
        }

        fetchProdutos();
    }, []);

    const filteredProdutos = React.useMemo(() => {
        return produtos.filter((produto) => {
            // Only show products, not services
            if (produto.tipo !== 'produto') return false;

            const matchesSearch =
                produto.codigo_interno.toLowerCase().includes(searchTerm.toLowerCase()) ||
                produto.nome.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesLowStock = !showLowStockOnly || (produto.estoque_atual < produto.estoque_minimo);

            return matchesSearch && matchesLowStock;
        });
    }, [produtos, searchTerm, showLowStockOnly]);

    const produtosEstoqueBaixo = produtos.filter(
        (p) => p.tipo === "produto" && p.estoque_atual < p.estoque_minimo
    );

    const valorTotalEstoque = filteredProdutos
        .filter((p) => p.tipo === "produto")
        .reduce((sum, p) => sum + (Number(p.preco_custo) || 0) * (Number(p.estoque_atual) || 0), 0);

    if (loading) {
        return <ProdutosSkeleton />;
    }

    if (error) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <div className="text-center">
                    <p className="text-lg font-semibold text-destructive">
                        Erro ao carregar produtos
                    </p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
                    <p className="text-muted-foreground">
                        Gerencie produtos e serviços
                    </p>
                </div>
                <Link href="/produtos/novo">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Produto
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setShowLowStockOnly(false)}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total de Produtos
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{produtos.length}</div>
                        <p className="text-xs text-muted-foreground">
                            produtos cadastrados
                        </p>
                    </CardContent>
                </Card>

                <Card
                    className={`cursor-pointer hover:bg-muted/50 transition-colors ${showLowStockOnly ? 'border-yellow-500 bg-yellow-50/50' : ''}`}
                    onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Estoque Baixo
                        </CardTitle>
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {produtosEstoqueBaixo.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            itens abaixo do mínimo
                        </p>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Valor em Estoque
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                            }).format(valorTotalEstoque)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            valor total em estoque (custo)
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filtros</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4 md:flex-row">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por código ou nome..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Produtos</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead className="text-right">Estoque</TableHead>
                                <TableHead className="text-right">Preço Custo</TableHead>
                                <TableHead className="text-right">Preço Venda</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProdutos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center">
                                        Nenhum produto encontrado
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredProdutos.map((produto) => {
                                    const estoqueBaixo =
                                        produto.tipo === "produto" &&
                                        produto.estoque_atual < produto.estoque_minimo;

                                    return (
                                        <TableRow
                                            key={produto.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => router.push(`/produtos/${produto.id}/editar`)}
                                        >
                                            <TableCell className="font-medium">
                                                {produto.codigo_interno}
                                            </TableCell>
                                            <TableCell>{produto.nome}</TableCell>
                                            <TableCell className="text-right">
                                                {produto.tipo === "produto" ? (
                                                    <span
                                                        className={estoqueBaixo ? "text-yellow-600 font-semibold" : ""}
                                                    >
                                                        {produto.estoque_atual}
                                                        {estoqueBaixo && (
                                                            <AlertTriangle className="ml-1 inline h-3 w-3" />
                                                        )}
                                                    </span>
                                                ) : (
                                                    "-"
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {new Intl.NumberFormat("pt-BR", {
                                                    style: "currency",
                                                    currency: "BRL",
                                                }).format(Number(produto.preco_custo) || 0)}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {new Intl.NumberFormat("pt-BR", {
                                                    style: "currency",
                                                    currency: "BRL",
                                                }).format(produto.preco_venda)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        produto.active ? "bg-green-500" : "bg-gray-500"
                                                    }
                                                >
                                                    {produto.active ? "Ativo" : "Inativo"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/produtos/${produto.id}/historico`);
                                                    }}
                                                    title="Ver Histórico"
                                                >
                                                    <History className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                }))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

function ProdutosSkeleton() {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="mt-2 h-4 w-64" />
            </div>
            <div className="grid gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-4 w-32" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-40" />
                            <Skeleton className="mt-2 h-3 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[400px] w-full" />
                </CardContent>
            </Card>
        </div>
    );
}
