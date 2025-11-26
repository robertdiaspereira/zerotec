/**
 * Venda Details Page
 * Detalhes de uma venda específica
 */

"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download, Printer, Edit } from "lucide-react";
import api from "@/lib/api";

interface VendaDetalhes {
    id: number;
    numero: string;
    cliente: {
        id: number;
        nome_razao_social: string;
        cpf_cnpj: string;
        telefone_principal: string;
        email: string;
    };
    data_venda: string;
    status: string;
    valor_produtos: number;
    valor_desconto: number;
    valor_acrescimo: number;
    valor_total: number;
    observacoes: string;
    itens: Array<{
        id: number;
        produto: {
            id: number;
            nome: string;
            codigo_interno: string;
        };
        quantidade: number;
        preco_unitario: number;
        preco_total: number;
        desconto: number;
    }>;
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

export default function VendaDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [venda, setVenda] = React.useState<VendaDetalhes | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        async function fetchVenda() {
            try {
                setLoading(true);
                const id = parseInt(params.id as string);
                const response = await api.getVenda(id);
                setVenda(response as VendaDetalhes);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Erro ao carregar venda");
            } finally {
                setLoading(false);
            }
        }

        if (params.id) {
            fetchVenda();
        }
    }, [params.id]);

    if (loading) {
        return <VendaDetailsSkeleton />;
    }

    if (error || !venda) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <div className="text-center">
                    <p className="text-lg font-semibold text-destructive">
                        Erro ao carregar venda
                    </p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                    <Button className="mt-4" onClick={() => router.push("/vendas")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para Vendas
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/vendas")}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Venda {venda.numero}
                        </h1>
                        <p className="text-muted-foreground">
                            Detalhes da venda
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Printer className="mr-2 h-4 w-4" />
                        Imprimir
                    </Button>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        PDF
                    </Button>
                    <Button>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Informações da Venda */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Informações da Venda</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Número da Venda
                                </p>
                                <p className="text-lg font-semibold">{venda.numero}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Data da Venda
                                </p>
                                <p className="text-lg font-semibold">
                                    {new Date(venda.data_venda).toLocaleDateString("pt-BR", {
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Status
                                </p>
                                <Badge
                                    className={`mt-1 ${statusColors[venda.status] || "bg-gray-500"}`}
                                >
                                    {statusLabels[venda.status] || venda.status}
                                </Badge>
                            </div>
                        </div>

                        {venda.observacoes && (
                            <>
                                <Separator />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">
                                        Observações
                                    </p>
                                    <p className="text-sm">{venda.observacoes}</p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Informações do Cliente */}
                <Card>
                    <CardHeader>
                        <CardTitle>Cliente</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Nome</p>
                            <p className="font-semibold">{venda.cliente.nome_razao_social}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                CPF/CNPJ
                            </p>
                            <p className="text-sm">{venda.cliente.cpf_cnpj}</p>
                        </div>
                        {venda.cliente.telefone_principal && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Telefone
                                </p>
                                <p className="text-sm">{venda.cliente.telefone_principal}</p>
                            </div>
                        )}
                        {venda.cliente.email && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    E-mail
                                </p>
                                <p className="text-sm">{venda.cliente.email}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Itens da Venda */}
            <Card>
                <CardHeader>
                    <CardTitle>Itens da Venda</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Produto</TableHead>
                                <TableHead className="text-right">Quantidade</TableHead>
                                <TableHead className="text-right">Preço Unit.</TableHead>
                                <TableHead className="text-right">Desconto</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {venda.itens && venda.itens.length > 0 ? (
                                venda.itens.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">
                                            {item.produto.codigo_interno}
                                        </TableCell>
                                        <TableCell>{item.produto.nome}</TableCell>
                                        <TableCell className="text-right">
                                            {item.quantidade}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {new Intl.NumberFormat("pt-BR", {
                                                style: "currency",
                                                currency: "BRL",
                                            }).format(item.preco_unitario)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {new Intl.NumberFormat("pt-BR", {
                                                style: "currency",
                                                currency: "BRL",
                                            }).format(item.desconto)}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {new Intl.NumberFormat("pt-BR", {
                                                style: "currency",
                                                currency: "BRL",
                                            }).format(item.preco_total)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">
                                        Nenhum item encontrado
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    <Separator className="my-4" />

                    {/* Totais */}
                    <div className="flex justify-end">
                        <div className="w-full max-w-sm space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal:</span>
                                <span className="font-medium">
                                    {new Intl.NumberFormat("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                    }).format(venda.valor_produtos)}
                                </span>
                            </div>
                            {venda.valor_desconto > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Desconto:</span>
                                    <span className="font-medium text-red-600">
                                        -{" "}
                                        {new Intl.NumberFormat("pt-BR", {
                                            style: "currency",
                                            currency: "BRL",
                                        }).format(venda.valor_desconto)}
                                    </span>
                                </div>
                            )}
                            {venda.valor_acrescimo > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Acréscimo:</span>
                                    <span className="font-medium text-green-600">
                                        +{" "}
                                        {new Intl.NumberFormat("pt-BR", {
                                            style: "currency",
                                            currency: "BRL",
                                        }).format(venda.valor_acrescimo)}
                                    </span>
                                </div>
                            )}
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-lg font-semibold">Total:</span>
                                <span className="text-lg font-bold">
                                    {new Intl.NumberFormat("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                    }).format(venda.valor_total)}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function VendaDetailsSkeleton() {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-8 w-64" />
                <Skeleton className="mt-2 h-4 w-48" />
            </div>
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[200px] w-full" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[200px] w-full" />
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>
        </div>
    );
}
