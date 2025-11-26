/**
 * Serviços Page
 * Listagem de serviços
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
import { Search, Plus, Wrench } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Servico {
    id: number;
    codigo_interno: string;
    nome: string;
    categoria_nome?: string;
    preco_venda: number;
    tempo_estimado: number;
    active: boolean;
}

export default function ServicosPage() {
    const router = useRouter();
    const [servicos, setServicos] = React.useState<Servico[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [searchTerm, setSearchTerm] = React.useState("");

    React.useEffect(() => {
        async function fetchServicos() {
            try {
                setLoading(true);
                const response = await api.getServicos() as any;
                setServicos(response.results || response);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Erro ao carregar serviços"
                );
            } finally {
                setLoading(false);
            }
        }

        fetchServicos();
    }, []);

    const filteredServicos = React.useMemo(() => {
        return servicos.filter((servico) => {
            const matchesSearch =
                servico.codigo_interno.toLowerCase().includes(searchTerm.toLowerCase()) ||
                servico.nome.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });
    }, [servicos, searchTerm]);

    if (loading) {
        return <ServicosSkeleton />;
    }

    if (error) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <div className="text-center">
                    <p className="text-lg font-semibold text-destructive">
                        Erro ao carregar serviços
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
                    <h1 className="text-3xl font-bold tracking-tight">Serviços</h1>
                    <p className="text-muted-foreground">
                        Gerencie serviços prestados
                    </p>
                </div>
                <Link href="/servicos/novo">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Serviço
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total de Serviços
                        </CardTitle>
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{servicos.length}</div>
                        <p className="text-xs text-muted-foreground">
                            serviços cadastrados
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
                    <CardTitle>Lista de Serviços</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead>Categoria</TableHead>
                                <TableHead className="text-right">Preço Venda</TableHead>
                                <TableHead className="text-right">Tempo Est. (min)</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredServicos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">
                                        Nenhum serviço encontrado
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredServicos.map((servico) => (
                                    <TableRow
                                        key={servico.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => router.push(`/servicos/${servico.id}/editar`)}
                                    >
                                        <TableCell className="font-medium">
                                            {servico.codigo_interno}
                                        </TableCell>
                                        <TableCell>{servico.nome}</TableCell>
                                        <TableCell>{servico.categoria_nome || "-"}</TableCell>
                                        <TableCell className="text-right font-medium">
                                            {new Intl.NumberFormat("pt-BR", {
                                                style: "currency",
                                                currency: "BRL",
                                            }).format(servico.preco_venda)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {servico.tempo_estimado || "-"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={
                                                    servico.active ? "bg-green-500" : "bg-gray-500"
                                                }
                                            >
                                                {servico.active ? "Ativo" : "Inativo"}
                                            </Badge>
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

function ServicosSkeleton() {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="mt-2 h-4 w-64" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-32" />
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
