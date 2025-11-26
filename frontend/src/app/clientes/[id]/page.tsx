/**
 * Cliente Details Page
 * Detalhes de um cliente com histórico
 */

"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft,
    Edit,
    Mail,
    Phone,
    MapPin,
    ShoppingCart,
    Wrench,
    TrendingUp,
} from "lucide-react";
import api from "@/lib/api";

interface ClienteDetalhes {
    id: number;
    tipo: string;
    nome_razao_social: string;
    nome_fantasia: string;
    cpf_cnpj: string;
    rg_ie: string;
    telefone_principal: string;
    telefone_secundario: string;
    email: string;
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    observacoes: string;
    active: boolean;
}

interface Venda {
    id: number;
    numero: string;
    data_venda: string;
    status: string;
    valor_total: number;
}

interface OrdemServico {
    id: number;
    numero: string;
    data_abertura: string;
    equipamento: string;
    status: string;
    valor_total: number;
}

export default function ClienteDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [cliente, setCliente] = React.useState<ClienteDetalhes | null>(null);
    const [vendas, setVendas] = React.useState<Venda[]>([]);
    const [ordens, setOrdens] = React.useState<OrdemServico[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const id = parseInt(params.id as string);

                // Fetch cliente details
                const clienteResponse = await api.getCliente(id);
                setCliente(clienteResponse as ClienteDetalhes);

                // Fetch vendas do cliente
                try {
                    const vendasResponse = await api.getVendas({ cliente_id: id });
                    setVendas(vendasResponse.results || vendasResponse || []);
                } catch (err) {
                    console.error("Erro ao carregar vendas:", err);
                    setVendas([]);
                }

                // Fetch OS do cliente
                try {
                    const osResponse = await api.getOrdemServico({ cliente_id: id });
                    setOrdens(osResponse.results || osResponse || []);
                } catch (err) {
                    console.error("Erro ao carregar OS:", err);
                    setOrdens([]);
                }
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Erro ao carregar cliente"
                );
            } finally {
                setLoading(false);
            }
        }

        if (params.id) {
            fetchData();
        }
    }, [params.id]);

    if (loading) {
        return <ClienteDetailsSkeleton />;
    }

    if (error || !cliente) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <div className="text-center">
                    <p className="text-lg font-semibold text-destructive">
                        Erro ao carregar cliente
                    </p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                    <Button className="mt-4" onClick={() => router.push("/clientes")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para Clientes
                    </Button>
                </div>
            </div>
        );
    }

    const totalVendas = vendas.reduce((sum, v) => sum + v.valor_total, 0);
    const totalOS = ordens.reduce((sum, o) => sum + o.valor_total, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/clientes")}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {cliente.nome_razao_social}
                        </h1>
                        <p className="text-muted-foreground">
                            Detalhes do cliente
                        </p>
                    </div>
                </div>
                <Button onClick={() => router.push(`/clientes/${cliente.id}/editar`)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total em Vendas</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                            }).format(totalVendas)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {vendas.length} vendas realizadas
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ordens de Serviço</CardTitle>
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                            }).format(totalOS)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {ordens.length} ordens de serviço
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Geral</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                            }).format(totalVendas + totalOS)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            valor total movimentado
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Informações do Cliente */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Informações do Cliente</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Tipo
                                </p>
                                <Badge variant="outline" className="mt-1">
                                    {cliente.tipo === "pf" ? "Pessoa Física" : "Pessoa Jurídica"}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    {cliente.tipo === "pf" ? "CPF" : "CNPJ"}
                                </p>
                                <p className="font-mono">{cliente.cpf_cnpj}</p>
                            </div>
                            {cliente.nome_fantasia && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Nome Fantasia
                                    </p>
                                    <p>{cliente.nome_fantasia}</p>
                                </div>
                            )}
                            {cliente.rg_ie && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {cliente.tipo === "pf" ? "RG" : "IE"}
                                    </p>
                                    <p>{cliente.rg_ie}</p>
                                </div>
                            )}
                        </div>

                        <Separator />

                        <div>
                            <h4 className="mb-3 font-semibold">Contato</h4>
                            <div className="space-y-2">
                                {cliente.telefone_principal && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span>{cliente.telefone_principal}</span>
                                    </div>
                                )}
                                {cliente.telefone_secundario && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span>{cliente.telefone_secundario}</span>
                                    </div>
                                )}
                                {cliente.email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span>{cliente.email}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {(cliente.logradouro || cliente.cidade) && (
                            <>
                                <Separator />
                                <div>
                                    <h4 className="mb-3 font-semibold">Endereço</h4>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <div className="text-sm">
                                            {cliente.logradouro && (
                                                <p>
                                                    {cliente.logradouro}
                                                    {cliente.numero && `, ${cliente.numero}`}
                                                    {cliente.complemento && ` - ${cliente.complemento}`}
                                                </p>
                                            )}
                                            {cliente.bairro && <p>{cliente.bairro}</p>}
                                            {cliente.cidade && cliente.estado && (
                                                <p>
                                                    {cliente.cidade}/{cliente.estado}
                                                </p>
                                            )}
                                            {cliente.cep && <p>CEP: {cliente.cep}</p>}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {cliente.observacoes && (
                            <>
                                <Separator />
                                <div>
                                    <h4 className="mb-2 font-semibold">Observações</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {cliente.observacoes}
                                    </p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                                Situação
                            </p>
                            <Badge
                                className={cliente.active ? "bg-green-500" : "bg-gray-500"}
                            >
                                {cliente.active ? "Ativo" : "Inativo"}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Histórico */}
            <Card>
                <CardHeader>
                    <CardTitle>Histórico</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="vendas">
                        <TabsList>
                            <TabsTrigger value="vendas">
                                Vendas ({vendas.length})
                            </TabsTrigger>
                            <TabsTrigger value="os">
                                Ordens de Serviço ({ordens.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="vendas" className="mt-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Número</TableHead>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Valor</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {vendas.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center">
                                                Nenhuma venda encontrada
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        vendas.map((venda) => (
                                            <TableRow key={venda.id}>
                                                <TableCell className="font-medium">
                                                    {venda.numero}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(venda.data_venda).toLocaleDateString("pt-BR")}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{venda.status}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {new Intl.NumberFormat("pt-BR", {
                                                        style: "currency",
                                                        currency: "BRL",
                                                    }).format(venda.valor_total)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TabsContent>

                        <TabsContent value="os" className="mt-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Número</TableHead>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Equipamento</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Valor</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {ordens.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center">
                                                Nenhuma ordem de serviço encontrada
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        ordens.map((os) => (
                                            <TableRow key={os.id}>
                                                <TableCell className="font-medium">
                                                    {os.numero}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(os.data_abertura).toLocaleDateString("pt-BR")}
                                                </TableCell>
                                                <TableCell>{os.equipamento}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{os.status}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {new Intl.NumberFormat("pt-BR", {
                                                        style: "currency",
                                                        currency: "BRL",
                                                    }).format(os.valor_total)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}

function ClienteDetailsSkeleton() {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-8 w-64" />
                <Skeleton className="mt-2 h-4 w-48" />
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
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[300px] w-full" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[100px] w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
