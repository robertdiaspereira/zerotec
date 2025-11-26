/**
 * Clientes Page
 * Listagem de clientes com filtros e estatísticas
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Search, Plus, User, CheckCircle, XCircle } from "lucide-react";
import api from "@/lib/api";

interface Cliente {
    id: number;
    tipo: string; // pf ou pj
    nome_razao_social: string;
    cpf_cnpj: string;
    telefone_principal: string;
    email: string;
    active: boolean;
}

export default function ClientesPage() {
    const router = useRouter();
    const [clientes, setClientes] = React.useState<Cliente[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [tipoFilter, setTipoFilter] = React.useState<string>("all");

    React.useEffect(() => {
        async function fetchClientes() {
            try {
                setLoading(true);
                const response = await api.getClientes() as any;
                setClientes(response.results || response);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Erro ao carregar clientes");
            } finally {
                setLoading(false);
            }
        }
        fetchClientes();
    }, []);

    const filtered = React.useMemo(() => {
        return clientes.filter((c) => {
            const matchesSearch =
                c.nome_razao_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.cpf_cnpj.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesTipo = tipoFilter === "all" || c.tipo === tipoFilter;
            return matchesSearch && matchesTipo;
        });
    }, [clientes, searchTerm, tipoFilter]);

    const totalActive = filtered.filter((c) => c.active).length;
    const totalInactive = filtered.length - totalActive;

    if (loading) {
        return <ClientesSkeleton />;
    }

    if (error) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <div className="text-center">
                    <p className="text-lg font-semibold text-destructive">Erro ao carregar clientes</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                    <Button className="mt-4" onClick={() => router.refresh()}>
                        Tentar novamente
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
                    <p className="text-muted-foreground">Gerencie a base de clientes</p>
                </div>
                <Button onClick={() => router.push("/clientes/novo")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Cliente
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filtered.length}</div>
                        <p className="text-xs text-muted-foreground">clientes encontrados</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ativos</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">{totalActive}</div>
                        <p className="text-xs text-muted-foreground">clientes ativos</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inativos</CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">{totalInactive}</div>
                        <p className="text-xs text-muted-foreground">clientes inativos</p>
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
                        <div className="flex-1 relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nome ou CPF/CNPJ..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        <select
                            value={tipoFilter}
                            onChange={(e) => setTipoFilter(e.target.value)}
                            className="rounded border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="all">Todos os tipos</option>
                            <option value="pf">Pessoa Física</option>
                            <option value="pj">Pessoa Jurídica</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Clientes</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome / Razão Social</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>CPF/CNPJ</TableHead>
                                <TableHead>Telefone</TableHead>
                                <TableHead>E-mail</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">
                                        Nenhum cliente encontrado
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((c) => (
                                    <TableRow key={c.id} className="cursor-pointer" onClick={() => router.push(`/clientes/${c.id}`)}>
                                        <TableCell className="font-medium">{c.nome_razao_social}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{c.tipo === "pf" ? "PF" : "PJ"}</Badge>
                                        </TableCell>
                                        <TableCell>{c.cpf_cnpj}</TableCell>
                                        <TableCell>{c.telefone_principal}</TableCell>
                                        <TableCell>{c.email}</TableCell>
                                        <TableCell>
                                            <Badge className={c.active ? "bg-green-500" : "bg-gray-500"}>
                                                {c.active ? "Ativo" : "Inativo"}
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

function ClientesSkeleton() {
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
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[400px] w-full" />
                </CardContent>
            </Card>
        </div>
    );
}
