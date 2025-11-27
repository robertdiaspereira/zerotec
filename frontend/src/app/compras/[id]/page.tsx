"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    ArrowLeft,
    PackageCheck,
    XCircle,
    Loader2,
    Building2,
    Calendar,
    CreditCard,
    FileText,
    Package
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function DetalhesPedidoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = React.useState(true);
    const [pedido, setPedido] = React.useState<any>(null);

    React.useEffect(() => {
        loadPedido();
    }, [id]);

    const loadPedido = async () => {
        try {
            setLoading(true);
            const data = await api.getPedidoCompra(parseInt(id));
            setPedido(data);
        } catch (error) {
            console.error("Erro ao carregar pedido:", error);
            toast({
                title: "Erro",
                description: "Não foi possível carregar os detalhes do pedido.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelar = async () => {
        if (!confirm(`Tem certeza que deseja cancelar o pedido "${pedido.numero}"?`)) {
            return;
        }

        try {
            await api.cancelarPedidoCompra(parseInt(id));
            toast({
                title: "Sucesso",
                description: "Pedido cancelado com sucesso!",
            });
            router.push("/compras");
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!pedido) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <p className="text-muted-foreground">Pedido não encontrado.</p>
                <Button onClick={() => router.push("/compras")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push("/compras")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Pedido {pedido.numero}</h1>
                        <p className="text-muted-foreground">
                            Detalhes do pedido de compra
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {(pedido.status === "aprovado" || pedido.status === "em_transito") && (
                        <Button onClick={() => router.push(`/compras/${id}/receber`)}>
                            <PackageCheck className="mr-2 h-4 w-4" />
                            Receber Mercadoria
                        </Button>
                    )}
                    {pedido.status !== "recebido" && pedido.status !== "cancelado" && (
                        <Button variant="destructive" onClick={handleCancelar}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancelar Pedido
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Coluna Principal */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Informações do Pedido */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações do Pedido</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <div className="text-sm text-muted-foreground">Status</div>
                                    <div className="mt-1">{getStatusBadge(pedido.status)}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Data do Pedido</div>
                                    <div className="mt-1 font-medium">{formatDate(pedido.data_pedido)}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Previsão de Entrega</div>
                                    <div className="mt-1 font-medium">{formatDate(pedido.data_entrega_prevista)}</div>
                                </div>
                                {pedido.data_entrega_real && (
                                    <div>
                                        <div className="text-sm text-muted-foreground">Data de Recebimento</div>
                                        <div className="mt-1 font-medium">{formatDate(pedido.data_entrega_real)}</div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Fornecedor */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                <CardTitle>Fornecedor</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div>
                                    <div className="font-medium">{pedido.fornecedor?.razao_social}</div>
                                    {pedido.fornecedor?.nome_fantasia && (
                                        <div className="text-sm text-muted-foreground">{pedido.fornecedor.nome_fantasia}</div>
                                    )}
                                </div>
                                {pedido.fornecedor?.cnpj && (
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">CNPJ:</span> {pedido.fornecedor.cnpj}
                                    </div>
                                )}
                                {pedido.fornecedor?.telefone_principal && (
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Telefone:</span> {pedido.fornecedor.telefone_principal}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Itens do Pedido */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                <CardTitle>Itens do Pedido</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Produto</TableHead>
                                        <TableHead className="text-right">Qtd. Pedida</TableHead>
                                        <TableHead className="text-right">Qtd. Recebida</TableHead>
                                        <TableHead className="text-right">Preço Unit.</TableHead>
                                        <TableHead className="text-right">Subtotal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pedido.itens?.map((item: any) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">
                                                {item.produto?.nome || "-"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {item.quantidade_pedida}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className={item.quantidade_recebida >= item.quantidade_pedida ? "text-green-600 font-medium" : ""}>
                                                    {item.quantidade_recebida}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {new Intl.NumberFormat("pt-BR", {
                                                    style: "currency",
                                                    currency: "BRL",
                                                }).format(item.preco_unitario)}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {new Intl.NumberFormat("pt-BR", {
                                                    style: "currency",
                                                    currency: "BRL",
                                                }).format(item.preco_total)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Observações */}
                    {pedido.observacoes && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    <CardTitle>Observações</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {pedido.observacoes}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar - Resumo Financeiro */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Resumo Financeiro</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total Produtos</span>
                                <span className="font-medium">
                                    {new Intl.NumberFormat("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                    }).format(pedido.valor_produtos)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Frete</span>
                                <span className="font-medium">
                                    {new Intl.NumberFormat("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                    }).format(pedido.valor_frete)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Desconto</span>
                                <span className="font-medium text-green-600">
                                    - {new Intl.NumberFormat("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                    }).format(pedido.valor_desconto)}
                                </span>
                            </div>
                            <div className="pt-3 border-t">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total Geral</span>
                                    <span>
                                        {new Intl.NumberFormat("pt-BR", {
                                            style: "currency",
                                            currency: "BRL",
                                        }).format(pedido.valor_total)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                <CardTitle>Pagamento</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div>
                                <div className="text-sm text-muted-foreground">Forma de Pagamento</div>
                                <div className="mt-1 font-medium capitalize">
                                    {pedido.forma_pagamento?.replace("_", " ")}
                                </div>
                            </div>
                            {pedido.condicao_pagamento && (
                                <div>
                                    <div className="text-sm text-muted-foreground">Condição</div>
                                    <div className="mt-1 font-medium">{pedido.condicao_pagamento}</div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
