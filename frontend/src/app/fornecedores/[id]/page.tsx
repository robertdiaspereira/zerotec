"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
    Edit, 
    Building2, 
    MapPin, 
    Phone, 
    FileText, 
    ShoppingBag,
    Calendar,
    DollarSign,
    Loader2
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Fornecedor {
    id: number;
    razao_social: string;
    nome_fantasia: string;
    cnpj: string;
    ie: string;
    telefone_principal: string;
    telefone_secundario: string;
    email: string;
    contato_nome: string;
    contato_cargo: string;
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    observacoes: string;
    active: boolean;
    created_at: string;
    updated_at: string;
}

interface PedidoCompra {
    id: number;
    numero: string;
    data_pedido: string;
    data_entrega_prevista: string;
    status: string;
    valor_total: number;
    forma_pagamento_display: string;
}

export default function DetalhesFornecedorPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = React.useState(true);
    const [fornecedor, setFornecedor] = React.useState<Fornecedor | null>(null);
    const [pedidos, setPedidos] = React.useState<PedidoCompra[]>([]);

    React.useEffect(() => {
        if (params.id) {
            loadData();
        }
    }, [params.id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [fornecedorData, pedidosData] = await Promise.all([
                api.getFornecedor(parseInt(params.id)),
                api.getPedidosCompra({ fornecedor: params.id })
            ]);

            setFornecedor(fornecedorData as Fornecedor);
            setPedidos((pedidosData as any).results || pedidosData);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            toast({
                title: "Erro",
                description: "Não foi possível carregar os dados do fornecedor.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pendente: "bg-yellow-100 text-yellow-800",
            aprovado: "bg-blue-100 text-blue-800",
            recebido: "bg-green-100 text-green-800",
            cancelado: "bg-red-100 text-red-800",
        };

        const labels: Record<string, string> = {
            pendente: "Pendente",
            aprovado: "Aprovado",
            recebido: "Recebido",
            cancelado: "Cancelado",
        };

        return (
            <Badge variant="outline" className={styles[status] || ""}>
                {labels[status] || status}
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!fornecedor) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <p className="text-muted-foreground">Fornecedor não encontrado.</p>
                <Button onClick={() => router.push("/fornecedores")}>
                    Voltar para Lista
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push("/fornecedores")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {fornecedor.nome_fantasia || fornecedor.razao_social}
                        </h1>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="text-sm">Cód: {fornecedor.id}</span>
                            <span>•</span>
                            <span className="text-sm">{fornecedor.cnpj}</span>
                            {!fornecedor.active && (
                                <Badge variant="destructive" className="ml-2">Inativo</Badge>
                            )}
                        </div>
                    </div>
                </div>
                <Button onClick={() => router.push(`/fornecedores/${fornecedor.id}/editar`)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Informações Gerais */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                            <CardTitle>Dados da Empresa</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Razão Social</p>
                                <p>{fornecedor.razao_social}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Nome Fantasia</p>
                                <p>{fornecedor.nome_fantasia || "-"}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">CNPJ</p>
                                <p>{fornecedor.cnpj}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Inscrição Estadual</p>
                                <p>{fornecedor.ie || "-"}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Contato */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Phone className="h-5 w-5 text-muted-foreground" />
                            <CardTitle>Contato</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Telefone Principal</p>
                                <p>{fornecedor.telefone_principal || "-"}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Telefone Secundário</p>
                                <p>{fornecedor.telefone_secundario || "-"}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-sm font-medium text-muted-foreground">E-mail</p>
                                <p>{fornecedor.email || "-"}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Contato</p>
                                <p>{fornecedor.contato_nome || "-"}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Cargo</p>
                                <p>{fornecedor.contato_cargo || "-"}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Endereço */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-muted-foreground" />
                            <CardTitle>Endereço</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <p className="text-sm font-medium text-muted-foreground">Logradouro</p>
                                <p>
                                    {fornecedor.logradouro}, {fornecedor.numero}
                                    {fornecedor.complemento && ` - ${fornecedor.complemento}`}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Bairro</p>
                                <p>{fornecedor.bairro}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">CEP</p>
                                <p>{fornecedor.cep}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Cidade/UF</p>
                                <p>{fornecedor.cidade} / {fornecedor.estado}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Observações */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <CardTitle>Observações</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                            {fornecedor.observacoes || "Nenhuma observação registrada."}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Histórico de Compras */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                            <CardTitle>Histórico de Compras</CardTitle>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => router.push("/compras/novo")}>
                            Nova Compra
                        </Button>
                    </div>
                    <CardDescription>
                        Últimos pedidos realizados para este fornecedor
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Número</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Previsão Entrega</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Valor Total</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pedidos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Nenhuma compra encontrada para este fornecedor.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pedidos.map((pedido) => (
                                    <TableRow key={pedido.id}>
                                        <TableCell className="font-medium">{pedido.numero}</TableCell>
                                        <TableCell>
                                            {format(new Date(pedido.data_pedido), "dd/MM/yyyy", { locale: ptBR })}
                                        </TableCell>
                                        <TableCell>
                                            {pedido.data_entrega_prevista 
                                                ? format(new Date(pedido.data_entrega_prevista), "dd/MM/yyyy", { locale: ptBR })
                                                : "-"
                                            }
                                        </TableCell>
                                        <TableCell>{getStatusBadge(pedido.status)}</TableCell>
                                        <TableCell className="text-right font-medium">
                                            {new Intl.NumberFormat("pt-BR", {
                                                style: "currency",
                                                currency: "BRL",
                                            }).format(pedido.valor_total)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => router.push(`/compras/${pedido.id}`)}
                                            >
                                                Ver Detalhes
                                            </Button>
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
