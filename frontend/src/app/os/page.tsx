/**
 * Ordens de Serviço - Listagem
 * Service orders listing page
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Wrench,
    Plus,
    Search,
    MoreVertical,
    Eye,
    Edit,
    Printer,
    Trash2,
    Clock,
    CheckCircle2,
    AlertCircle,
    XCircle,
} from "lucide-react";

interface OrdemServico {
    id: number;
    numero: string;
    cliente: {
        id: number;
        nome_razao_social: string;
    };
    equipamento: string;
    defeito_reclamado: string;
    status: string;
    prioridade: string;
    data_abertura: string;
    data_previsao: string;
    valor_total: number;
}

export default function OSPage() {
    const router = useRouter();
    const [ordens, setOrdens] = React.useState<OrdemServico[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("todos");
    const [prioridadeFilter, setPrioridadeFilter] = React.useState("todas");

    React.useEffect(() => {
        async function fetchOrdens() {
            try {
                setLoading(true);
                const response = await fetch("http://localhost:8000/api/assistencia/ordens-servico/");
                const data = await response.json();
                setOrdens(Array.isArray(data) ? data : (data.results || []));
            } catch (error) {
                console.error("Erro ao carregar OS:", error);
                setOrdens([]);
            } finally {
                setLoading(false);
            }
        }

        fetchOrdens();
    }, []);

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; icon: any; label: string }> = {
            aberta: { variant: "default", icon: Clock, label: "Aberta" },
            em_andamento: { variant: "secondary", icon: Wrench, label: "Em Andamento" },
            aguardando_pecas: { variant: "outline", icon: AlertCircle, label: "Aguardando Peças" },
            concluida: { variant: "default", icon: CheckCircle2, label: "Concluída" },
            cancelada: { variant: "destructive", icon: XCircle, label: "Cancelada" },
        };

        const config = variants[status] || variants.aberta;
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className="gap-1">
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const getPrioridadeBadge = (prioridade: string) => {
        const colors: Record<string, string> = {
            baixa: "bg-green-100 text-green-800",
            media: "bg-yellow-100 text-yellow-800",
            alta: "bg-orange-100 text-orange-800",
            urgente: "bg-red-100 text-red-800 animate-pulse",
        };

        return (
            <Badge className={colors[prioridade] || colors.media}>
                {prioridade.charAt(0).toUpperCase() + prioridade.slice(1)}
            </Badge>
        );
    };

    const filteredOrdens = ordens.filter((os) => {
        const matchesSearch =
            os.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
            os.cliente.nome_razao_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
            os.equipamento.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "todos" || os.status === statusFilter;
        const matchesPrioridade = prioridadeFilter === "todas" || os.prioridade === prioridadeFilter;

        return matchesSearch && matchesStatus && matchesPrioridade;
    });

    const calcularResumo = () => {
        return {
            total: ordens.length,
            abertas: ordens.filter((os) => os.status === "aberta").length,
            em_andamento: ordens.filter((os) => os.status === "em_andamento").length,
            concluidas: ordens.filter((os) => os.status === "concluida").length,
            valor_total: ordens.reduce((sum, os) => sum + (Number(os.valor_total) || 0), 0),
        };
    };

    const resumo = calcularResumo();

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-64" />
                <div className="grid gap-4 md:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-4 w-32" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-20" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Ordens de Serviço</h1>
                    <p className="text-muted-foreground">
                        Gerencie as ordens de serviço da assistência técnica
                    </p>
                </div>
                <Link href="/os/nova">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Nova OS
                    </Button>
                </Link>
            </div>

            {/* Cards de Resumo */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de OS</CardTitle>
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{resumo.total}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Abertas</CardTitle>
                        <Clock className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{resumo.abertas}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
                        <Wrench className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{resumo.em_andamento}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{resumo.concluidas}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filtros */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col gap-4 md:flex-row">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por número, cliente ou equipamento..."
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
                                <SelectItem value="todos">Todos os Status</SelectItem>
                                <SelectItem value="aberta">Aberta</SelectItem>
                                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                                <SelectItem value="aguardando_pecas">Aguardando Peças</SelectItem>
                                <SelectItem value="concluida">Concluída</SelectItem>
                                <SelectItem value="cancelada">Cancelada</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={prioridadeFilter} onValueChange={setPrioridadeFilter}>
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="Prioridade" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todas">Todas</SelectItem>
                                <SelectItem value="baixa">Baixa</SelectItem>
                                <SelectItem value="media">Média</SelectItem>
                                <SelectItem value="alta">Alta</SelectItem>
                                <SelectItem value="urgente">Urgente</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Tabela */}
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Número</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Equipamento</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Prioridade</TableHead>
                                <TableHead>Data Abertura</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrdens.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center">
                                        Nenhuma ordem de serviço encontrada
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredOrdens.map((os) => (
                                    <TableRow
                                        key={os.id}
                                        className="cursor-pointer hover:bg-accent/50"
                                        onClick={() => router.push(`/os/${os.id}`)}
                                    >
                                        <TableCell className="font-medium">{os.numero}</TableCell>
                                        <TableCell>{os.cliente.nome_razao_social}</TableCell>
                                        <TableCell>{os.equipamento}</TableCell>
                                        <TableCell>{getStatusBadge(os.status)}</TableCell>
                                        <TableCell>{getPrioridadeBadge(os.prioridade)}</TableCell>
                                        <TableCell>
                                            {new Date(os.data_abertura).toLocaleDateString("pt-BR")}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {new Intl.NumberFormat("pt-BR", {
                                                style: "currency",
                                                currency: "BRL",
                                            }).format(Number(os.valor_total) || 0)}
                                        </TableCell>
                                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="z-[100]">
                                                    <DropdownMenuItem onClick={() => router.push(`/os/${os.id}`)}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        Visualizar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => router.push(`/os/${os.id}/editar`)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Printer className="mr-2 h-4 w-4" />
                                                        Imprimir
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4" />
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
