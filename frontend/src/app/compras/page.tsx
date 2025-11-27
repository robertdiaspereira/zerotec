"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ShoppingCart,
    Plus,
    Search,
    Eye,
    PackageCheck,
    XCircle,
    Loader2,
    TrendingUp,
    AlertCircle,
    CheckCircle2
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function ComprasPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = React.useState(false);
    const [pedidos, setPedidos] = React.useState<any[]>([]);
    const [filters, setFilters] = React.useState({
        search: "",
        status: "all",
    });

    React.useEffect(() => {
        loadPedidos();
    }, []);

    const loadPedidos = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (filters.search) params.search = filters.search;
            if (filters.status !== "all") params.status = filters.status;

            const data: any = await api.getPedidosCompra(params);
            setPedidos(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error("Erro ao carregar pedidos:", error);
            toast({
                title: "Erro",
                description: "Não foi possível carregar os pedidos de compra.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelar = async (id: number, numero: string) => {
        if (!confirm(`Tem certeza que deseja cancelar o pedido "${numero}"?`)) {
            return;
        }

        try {
            await api.cancelarPedidoCompra(id);
            toast({
                title: "Sucesso",
                description: "Pedido cancelado com sucesso!",
            });
            loadPedidos();
        } catch (error) {
            console.error("Erro ao cancelar pedido:", error);
            toast({
                title: "Erro",
                description: "Não foi possível cancelar o pedido.",
                variant: "destructive",
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
            pendente: { label: "Pendente", variant: "secondary" },
            aprovado: { label: "Aprovado", variant: "default" },
            em_transito: { label: "Em Trânsito", variant: "outline" },
            recebido: { label: "Recebido", variant: "default" },
            cancelado: { label: "Cancelado", variant: "destructive" },
        };

        const config = variants[status] || { label: status, variant: "outline" };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("pt-BR");
    };

    const pedidosAtivos = pedidos.filter(p => p.status !== "cancelado" && p.status !== "recebido").length;
    const valorTotal = pedidos.filter(p => p.status !== "cancelado").reduce((sum, p) => sum + parseFloat(p.valor_total || 0), 0);
    const pedidosAtrasados = pedidos.filter(p => {
        if (p.status === "recebido" || p.status === "cancelado") return false;
        const dataEntrega = new Date(p.data_entrega_prevista);
        return dataEntrega < new Date();
    }).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Compras</h1>
                    <p className="text-muted-foreground">
                        Gerencie seus pedidos de compra e recebimentos
                    </p>
                </div>
                <Button onClick={() => router.push("/compras/novo")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Compra
                </Button>
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pedidos Ativos</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pedidosAtivos}</div>
                        <p className="text-xs text-muted-foreground">
                            Em andamento
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Valor em Aberto</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                            }).format(valorTotal)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Total de pedidos
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pedidos Atrasados</CardTitle>
                        <AlertCircle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{pedidosAtrasados}</div>
                        <p className="text-xs text-muted-foreground">
                            Aguardando recebimento
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recebidos no Mês</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {pedidos.filter(p => {
                                if (p.status !== "recebido") return false;
                                const dataRecebimento = new Date(p.data_entrega_real);
                                const mesAtual = new Date().getMonth();
                                return dataRecebimento.getMonth() === mesAtual;
                            }).length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Este mês
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filtros */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Buscar por número do pedido ou fornecedor..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                onKeyDown={(e) => e.key === "Enter" && loadPedidos()}
                            />
                        </div>
                        <Select
                            value={filters.status}
                            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="pendente">Pendente</SelectItem>
                                <SelectItem value="aprovado">Aprovado</SelectItem>
                                <SelectItem value="em_transito">Em Trânsito</SelectItem>
                                <SelectItem value="recebido">Recebido</SelectItem>
                                <SelectItem value="cancelado">Cancelado</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={loadPedidos}>
                            <Search className="mr-2 h-4 w-4" />
                            Buscar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Tabela */}
            <Card>
                <CardHeader>
                    <CardTitle>Pedidos de Compra</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Número</TableHead>
                                    <TableHead>Fornecedor</TableHead>
                                    <TableHead>Data Pedido</TableHead>
                                    <TableHead>Previsão Entrega</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Valor Total</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pedidos.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            Nenhum pedido encontrado.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pedidos.map((pedido) => (
                                        <TableRow key={pedido.id}>
                                            <TableCell className="font-medium">{pedido.numero}</TableCell>
                                            <TableCell>{pedido.fornecedor?.razao_social || pedido.fornecedor?.nome_fantasia || "-"}</TableCell>
                                            <TableCell>{formatDate(pedido.data_pedido)}</TableCell>
                                            <TableCell>
                                                <div className={
                                                    new Date(pedido.data_entrega_prevista) < new Date() &&
                                                        pedido.status !== "recebido" &&
                                                        pedido.status !== "cancelado"
                                                        ? "text-destructive font-medium"
                                                        : ""
                                                }>
                                                    {formatDate(pedido.data_entrega_prevista)}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(pedido.status)}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                {new Intl.NumberFormat("pt-BR", {
                                                    style: "currency",
                                                    currency: "BRL",
                                                }).format(pedido.valor_total || 0)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.push(`/compras/${pedido.id}`)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {(pedido.status === "aprovado" || pedido.status === "em_transito") && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => router.push(`/compras/${pedido.id}/receber`)}
                                                        >
                                                            <PackageCheck className="h-4 w-4 text-green-600" />
                                                        </Button>
                                                    )}
                                                    {pedido.status !== "recebido" && pedido.status !== "cancelado" && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleCancelar(pedido.id, pedido.numero)}
                                                        >
                                                            <XCircle className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
