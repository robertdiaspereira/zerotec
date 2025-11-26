"use client";

import React from "react";

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
import { Search, ArrowUpRight, ArrowDownLeft, Plus } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

interface Movimentacao {
    id: number;
    produto: {
        id: number;
        nome: string;
        codigo_interno: string;
    };
    tipo: "entrada" | "saida";
    quantidade: number;
    data_movimentacao: string;
    motivo: string;
    documento?: string;
    usuario: string;
}

export default function EstoqueContent() {
    const [movimentacoes, setMovimentacoes] = React.useState<Movimentacao[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [tipoFilter, setTipoFilter] = React.useState<string>("all");

    const [dateStart, setDateStart] = React.useState("");
    const [dateEnd, setDateEnd] = React.useState("");

    React.useEffect(() => {
        async function fetchMovimentacoes() {
            try {
                setLoading(true);
                const response = await api.getEstoque() as any;
                setMovimentacoes(response.results || response);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Erro ao carregar movimentações");
            } finally {
                setLoading(false);
            }
        }
        fetchMovimentacoes();
    }, []);

    const filteredMovimentacoes = React.useMemo(() => {
        return movimentacoes.filter((mov) => {
            const productName = mov.produto?.nome ?? "";
            const productCode = mov.produto?.codigo_interno ?? "";
            const matchesSearch =
                productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                productCode.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesTipo = tipoFilter === "all" || mov.tipo === tipoFilter;

            let matchesDate = true;
            if (dateStart) {
                matchesDate = matchesDate && new Date(mov.data_movimentacao) >= new Date(dateStart);
            }
            if (dateEnd) {
                matchesDate = matchesDate && new Date(mov.data_movimentacao) <= new Date(dateEnd);
            }

            return matchesSearch && matchesTipo && matchesDate;
        });
    }, [movimentacoes, searchTerm, tipoFilter, dateStart, dateEnd]);

    if (loading) return <EstoqueSkeleton />;
    if (error)
        return (
            <div className="flex h-[400px] items-center justify-center">
                <div className="text-center">
                    <p className="text-lg font-semibold text-destructive">Erro ao carregar estoque</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                </div>
            </div>
        );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Ajuste de Estoque</h1>
                    <p className="text-muted-foreground">Gerencie movimentações de entrada e saída</p>
                </div>
                <Link href="/estoque/movimentacoes/nova">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Criar Ajuste de Estoque
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setTipoFilter("all")}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Movimentações</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{movimentacoes.length}</div>
                        <p className="text-xs text-muted-foreground">registros encontrados</p>
                    </CardContent>
                </Card>
                <Card
                    className={`cursor-pointer hover:bg-muted/50 transition-colors ${tipoFilter === 'entrada' ? 'border-green-500 bg-green-50/50' : ''}`}
                    onClick={() => setTipoFilter("entrada")}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Entradas</CardTitle>
                        <ArrowDownLeft className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {movimentacoes.filter((m) => m.tipo === "entrada").length}
                        </div>
                        <p className="text-xs text-muted-foreground">registros de entrada</p>
                    </CardContent>
                </Card>
                <Card
                    className={`cursor-pointer hover:bg-muted/50 transition-colors ${tipoFilter === 'saida' ? 'border-red-500 bg-red-50/50' : ''}`}
                    onClick={() => setTipoFilter("saida")}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Saídas</CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {movimentacoes.filter((m) => m.tipo === "saida").length}
                        </div>
                        <p className="text-xs text-muted-foreground">registros de saída</p>
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
                                    placeholder="Buscar por produto..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Input
                                type="date"
                                value={dateStart}
                                onChange={(e) => setDateStart(e.target.value)}
                                className="w-[150px]"
                            />
                            <span className="text-muted-foreground">até</span>
                            <Input
                                type="date"
                                value={dateEnd}
                                onChange={(e) => setDateEnd(e.target.value)}
                                className="w-[150px]"
                            />
                        </div>
                        <Select value={tipoFilter} onValueChange={setTipoFilter}>
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="entrada">Entrada</SelectItem>
                                <SelectItem value="saida">Saída</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Movimentações</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Produto</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead className="text-right">Quantidade</TableHead>
                                <TableHead>Motivo</TableHead>
                                <TableHead>Documento</TableHead>
                                <TableHead>Usuário</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredMovimentacoes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center">
                                        Nenhuma movimentação encontrada
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredMovimentacoes.map((mov) => (
                                    <TableRow key={mov.id}>
                                        <TableCell>{mov.data_movimentacao.slice(0, 10)}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{mov.produto?.nome ?? "-"}</div>
                                            <div className="text-xs text-muted-foreground">{mov.produto?.codigo_interno ?? "-"}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={mov.tipo === "entrada" ? "bg-green-500" : "bg-red-500"}>
                                                {mov.tipo === "entrada" ? "Entrada" : "Saída"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">{mov.quantidade}</TableCell>
                                        <TableCell>{mov.motivo}</TableCell>
                                        <TableCell>{mov.documento || "-"}</TableCell>
                                        <TableCell>{mov.usuario}</TableCell>
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

function EstoqueSkeleton() {
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
