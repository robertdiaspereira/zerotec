/**
 * Caixa History Page
 * Lists all cash register sessions and provides access to open/close actions
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
import {
    Search,
    Download,
    Eye,
    Plus,
    Lock,
    Unlock,
    AlertCircle,
    CheckCircle2,
    DollarSign,
    Calendar
} from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Caixa {
    id: number;
    usuario_abertura_nome: string;
    usuario_fechamento_nome: string | null;
    data_abertura: string;
    data_fechamento: string | null;
    valor_inicial: number;
    valor_final: number | null;
    status: 'aberto' | 'fechado';
    quebra_caixa: number | null;
    total_vendas: number | null;
    quantidade_vendas: number | null;
}

export default function CaixaPage() {
    const router = useRouter();
    const [caixas, setCaixas] = React.useState<Caixa[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState<string>("all");
    const [caixaAberto, setCaixaAberto] = React.useState<Caixa | null>(null);

    const fetchCaixas = React.useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.getCaixas() as any;
            const data = Array.isArray(response) ? response : (response.results || []);
            setCaixas(data);

            // Verificar se tem caixa aberto
            const aberto = data.find((c: Caixa) => c.status === 'aberto');
            setCaixaAberto(aberto || null);
        } catch (error) {
            console.error("Erro ao carregar caixas:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchCaixas();
    }, [fetchCaixas]);

    const filteredCaixas = React.useMemo(() => {
        return caixas.filter((caixa) => {
            const matchesSearch =
                caixa.usuario_abertura_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (caixa.usuario_fechamento_nome?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

            const matchesStatus =
                statusFilter === "all" || caixa.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [caixas, searchTerm, statusFilter]);

    const formatCurrency = (value: number | null) => {
        if (value === null) return "-";
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-";
        return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
    };

    if (loading) {
        return <CaixaSkeleton />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestão de Caixa</h1>
                    <p className="text-muted-foreground">
                        Histórico de aberturas e fechamentos de caixa
                    </p>
                </div>
                <div className="flex gap-2">
                    {caixaAberto ? (
                        <Link href={`/caixa/${caixaAberto.id}/fechar`}>
                            <Button variant="destructive">
                                <Lock className="mr-2 h-4 w-4" />
                                Fechar Caixa Atual
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/caixa/abrir">
                            <Button className="bg-green-600 hover:bg-green-700">
                                <Unlock className="mr-2 h-4 w-4" />
                                Abrir Novo Caixa
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Status Card if Open */}
            {caixaAberto && (
                <Card className="border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-900">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                                    <Unlock className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                                        Caixa Aberto
                                    </h3>
                                    <p className="text-sm text-green-700 dark:text-green-300">
                                        Aberto por {caixaAberto.usuario_abertura_nome} em {formatDate(caixaAberto.data_abertura)}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Valor Inicial</p>
                                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                                    {formatCurrency(caixaAberto.valor_inicial)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

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
                                    placeholder="Buscar por usuário..."
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
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="aberto">Aberto</SelectItem>
                                <SelectItem value="fechado">Fechado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Histórico</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Status</TableHead>
                                <TableHead>Abertura</TableHead>
                                <TableHead>Fechamento</TableHead>
                                <TableHead>Responsável</TableHead>
                                <TableHead className="text-right">Valor Inicial</TableHead>
                                <TableHead className="text-right">Vendas</TableHead>
                                <TableHead className="text-right">Valor Final</TableHead>
                                <TableHead className="text-right">Quebra</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCaixas.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                        Nenhum registro de caixa encontrado
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCaixas.map((caixa) => (
                                    <TableRow key={caixa.id}>
                                        <TableCell>
                                            <Badge
                                                variant={caixa.status === "aberto" ? "default" : "secondary"}
                                                className={caixa.status === "aberto" ? "bg-green-600" : ""}
                                            >
                                                {caixa.status === "aberto" ? "Aberto" : "Fechado"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{formatDate(caixa.data_abertura)}</TableCell>
                                        <TableCell>{formatDate(caixa.data_fechamento)}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{caixa.usuario_abertura_nome}</span>
                                                {caixa.usuario_fechamento_nome && caixa.usuario_fechamento_nome !== caixa.usuario_abertura_nome && (
                                                    <span className="text-xs text-muted-foreground">
                                                        Fechado por: {caixa.usuario_fechamento_nome}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">{formatCurrency(caixa.valor_inicial)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex flex-col items-end">
                                                <span>{formatCurrency(caixa.total_vendas || 0)}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {caixa.quantidade_vendas || 0} vendas
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(caixa.valor_final)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {caixa.quebra_caixa !== null && (
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        caixa.quebra_caixa > 0
                                                            ? "text-green-600 border-green-200 bg-green-50"
                                                            : caixa.quebra_caixa < 0
                                                                ? "text-red-600 border-red-200 bg-red-50"
                                                                : "text-gray-500"
                                                    }
                                                >
                                                    {caixa.quebra_caixa > 0 ? "+" : ""}
                                                    {formatCurrency(caixa.quebra_caixa)}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/caixa/${caixa.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
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

function CaixaSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-[400px] w-full" />
        </div>
    );
}
