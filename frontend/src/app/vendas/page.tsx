/**
 * Vendas Page
 * Listagem de vendas com filtros e paginação
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Download, Eye, Plus, MoreVertical, Edit, Copy, FileText, Trash } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from "@/lib/api";
import Link from "next/link";

interface Venda {
    id: number;
    numero: string;
    cliente: {
        id: number;
        nome_razao_social: string;
    };
    data_venda: string;
    status: string;
    valor_total: number;
    valor_desconto: number;
}

const statusColors: Record<string, string> = {
    orcamento: "bg-gray-500",
    aprovado: "bg-blue-500",
    faturado: "bg-green-500",
    entregue: "bg-purple-500",
    cancelado: "bg-red-500",
};

const statusLabels: Record<string, string> = {
    orcamento: "Orçamento",
    aprovado: "Aprovado",
    faturado: "Faturado",
    entregue: "Entregue",
    cancelado: "Cancelado",
};

export default function VendasPage() {
    const [vendas, setVendas] = React.useState<Venda[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState<string>("all");

    React.useEffect(() => {
        async function fetchVendas() {
            try {
                setLoading(true);
                const response = await api.getVendas() as any;
                setVendas(response.results || response);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Erro ao carregar vendas"
                );
            } finally {
                setLoading(false);
            }
        }

        fetchVendas();
    }, []);

    const filteredVendas = React.useMemo(() => {
        return vendas.filter((venda) => {
            const matchesSearch =
                venda.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                venda.cliente?.nome_razao_social?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus =
                statusFilter === "all" || venda.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [vendas, searchTerm, statusFilter]);

    const totalVendas = filteredVendas.reduce((sum, v) => sum + (Number(v.valor_total) || 0), 0);
    const totalDescontos = filteredVendas.reduce((sum, v) => sum + (Number(v.valor_desconto) || 0), 0);

    if (loading) {
        return <VendasSkeleton />;
    }

    if (error) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <div className="text-center">
                    <p className="text-lg font-semibold text-destructive">
                        Erro ao carregar vendas
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
                    <h1 className="text-3xl font-bold tracking-tight">Vendas</h1>
                    <p className="text-muted-foreground">
                        Gerencie todas as vendas do sistema
                    </p>
                </div>
                <Link href="/vendas/nova">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Venda
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredVendas.length}</div>
                        <p className="text-xs text-muted-foreground">
                            vendas encontradas
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                            }).format(totalVendas)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            em vendas filtradas
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Descontos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                            }).format(totalDescontos)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            em descontos concedidos
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
                                    placeholder="Buscar por número ou cliente..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os Status</SelectItem>
                                <SelectItem value="orcamento">Orçamento</SelectItem>
                                <SelectItem value="aprovado">Aprovado</SelectItem>
                                <SelectItem value="faturado">Faturado</SelectItem>
                                <SelectItem value="entregue">Entregue</SelectItem>
                                <SelectItem value="cancelado">Cancelado</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Exportar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Vendas</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Número</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Desconto</TableHead>
                                <TableHead className="text-right">Valor Total</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredVendas.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center">
                                        Nenhuma venda encontrada
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredVendas.map((venda) => (
                                    <TableRow key={venda.id}>
                                        <TableCell className="font-medium">{venda.numero}</TableCell>
                                        <TableCell>
                                            {venda.cliente?.nome_razao_social || "Sem cliente"}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(venda.data_venda).toLocaleDateString("pt-BR")}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={statusColors[venda.status] || "bg-gray-500"}
                                            >
                                                {statusLabels[venda.status] || venda.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {new Intl.NumberFormat("pt-BR", {
                                                style: "currency",
                                                currency: "BRL",
                                            }).format(Number(venda.valor_desconto) || 0)}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {new Intl.NumberFormat("pt-BR", {
                                                style: "currency",
                                                currency: "BRL",
                                            }).format(venda.valor_total)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/vendas/${venda.id}`}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Visualizar
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/vendas/${venda.id}/editar`}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Editar
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Copy className="mr-2 h-4 w-4" />
                                                        Copiar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem>
                                                        <FileText className="mr-2 h-4 w-4" />
                                                        Cupom Fiscal
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Exportar PDF
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem variant="destructive">
                                                        <Trash className="mr-2 h-4 w-4" />
                                                        Excluir
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

function VendasSkeleton() {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="mt-2 h-4 w-64" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
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
