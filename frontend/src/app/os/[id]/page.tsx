/**
 * Ordem de Serviço - Detalhes
 * Service order details page
 */

"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
    Printer,
    Trash2,
    User,
    Wrench,
    Package,
    DollarSign,
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    Plus,
    FileText,
} from "lucide-react";

interface OSDetalhes {
    id: number;
    numero: string;
    cliente: {
        id: number;
        nome_razao_social: string;
        telefone_principal: string;
        email: string;
    };
    equipamento: string;
    marca_modelo: string;
    numero_serie: string;
    defeito_reclamado: string;
    defeito_constatado: string;
    solucao_aplicada: string;
    status: string;
    prioridade: string;
    data_abertura: string;
    data_previsao: string;
    data_conclusao: string;
    tecnico_responsavel: {
        id: number;
        nome: string;
    };
    servicos: Array<{
        id: number;
        descricao: string;
        quantidade: number;
        valor_unitario: number;
        valor_total: number;
    }>;
    produtos: Array<{
        id: number;
        produto: {
            id: number;
            nome: string;
        };
        quantidade: number;
        valor_unitario: number;
        valor_total: number;
    }>;
    valor_servicos: number;
    valor_produtos: number;
    valor_desconto: number;
    valor_total: number;
    observacoes: string;
    observacoes_cliente: string;
    checklist: Record<string, boolean>;
    obs_recebimento: string;
    valor_frete: number;
    forma_pagamento: string;
    anexos: Array<{
        id: number;
        arquivo: string;
        tipo: string;
        descricao: string;
    }>;
}

export default function OSDetalhesPage() {
    const params = useParams();
    const router = useRouter();
    const [os, setOS] = React.useState<OSDetalhes | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchOS() {
            try {
                setLoading(true);
                const response = await fetch(
                    `http://localhost:8000/api/assistencia/ordens-servico/${params.id}/`
                );
                const data = await response.json();
                setOS(data);
            } catch (error) {
                console.error("Erro ao carregar OS:", error);
            } finally {
                setLoading(false);
            }
        }

        if (params.id) {
            fetchOS();
        }
    }, [params.id]);

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; className: string; label: string }> = {
            aberta: { variant: "default", className: "bg-blue-600", label: "Aberta" },
            em_andamento: { variant: "secondary", className: "bg-yellow-600", label: "Em Andamento" },
            aguardando_pecas: { variant: "outline", className: "", label: "Aguardando Peças" },
            concluida: { variant: "default", className: "bg-green-600", label: "Concluída" },
            cancelada: { variant: "destructive", className: "", label: "Cancelada" },
        };

        const config = variants[status] || variants.aberta;

        return (
            <Badge variant={config.variant} className={config.className}>
                {config.label}
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-64" />
                <div className="grid gap-6 md:grid-cols-2">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-4 w-32" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-20 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (!os) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <div className="text-center">
                    <p className="text-lg font-semibold">Ordem de Serviço não encontrada</p>
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
                        onClick={() => router.push("/os")}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold tracking-tight">{os.numero}</h1>
                            {getStatusBadge(os.status)}
                        </div>
                        <p className="text-muted-foreground">Detalhes da ordem de serviço</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push(`/os/${os.id}/editar`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                    </Button>
                    <Button variant="outline">
                        <Printer className="mr-2 h-4 w-4" />
                        Imprimir
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Dados do Cliente */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Dados do Cliente
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div>
                            <p className="text-sm font-medium">Nome</p>
                            <p className="text-sm text-muted-foreground">
                                {os.cliente.nome_razao_social}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Telefone</p>
                            <p className="text-sm text-muted-foreground">
                                {os.cliente.telefone_principal || "-"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Email</p>
                            <p className="text-sm text-muted-foreground">
                                {os.cliente.email || "-"}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Informações do Equipamento */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wrench className="h-5 w-5" />
                            Equipamento
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div>
                            <p className="text-sm font-medium">Equipamento</p>
                            <p className="text-sm text-muted-foreground">{os.equipamento}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Marca/Modelo</p>
                            <p className="text-sm text-muted-foreground">
                                {os.marca_modelo || "-"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Número de Série</p>
                            <p className="text-sm text-muted-foreground">
                                {os.numero_serie || "-"}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Datas */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Datas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div>
                            <p className="text-sm font-medium">Data de Abertura</p>
                            <p className="text-sm text-muted-foreground">
                                {new Date(os.data_abertura).toLocaleDateString("pt-BR")}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Previsão de Entrega</p>
                            <p className="text-sm text-muted-foreground">
                                {os.data_previsao
                                    ? new Date(os.data_previsao).toLocaleDateString("pt-BR")
                                    : "-"}
                            </p>
                        </div>
                        {os.data_conclusao && (
                            <div>
                                <p className="text-sm font-medium">Data de Conclusão</p>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(os.data_conclusao).toLocaleDateString("pt-BR")}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Valores */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Valores
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between">
                            <p className="text-sm font-medium">Serviços</p>
                            <p className="text-sm text-muted-foreground">
                                {new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                }).format(Number(os.valor_servicos) || 0)}
                            </p>
                        </div>
                        <div className="flex justify-between">
                            <p className="text-sm font-medium">Produtos</p>
                            <p className="text-sm text-muted-foreground">
                                {new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                }).format(Number(os.valor_produtos) || 0)}
                            </p>
                        </div>
                        <div className="flex justify-between">
                            <p className="text-sm font-medium">Desconto</p>
                            <p className="text-sm text-muted-foreground">
                                {new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                }).format(Number(os.valor_desconto) || 0)}
                            </p>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                            <p className="text-base font-bold">Total</p>
                            <p className="text-base font-bold">
                                {new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                }).format(Number(os.valor_total) || 0)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Checklist */}
            {os.checklist && Object.keys(os.checklist).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5" />
                            Checklist de Entrada
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {Object.entries(os.checklist).map(([label, checked]) => (
                                <div key={label} className="flex items-center space-x-2">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${checked ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                                        {checked && <CheckCircle2 className="h-3 w-3" />}
                                    </div>
                                    <span className={`text-sm ${checked ? 'font-medium' : 'text-muted-foreground'}`}>
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Diagnóstico e Solução */}
            <Card>
                <CardHeader>
                    <CardTitle>Diagnóstico e Solução</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="text-sm font-medium">Defeito Reclamado</p>
                        <p className="text-sm text-muted-foreground">{os.defeito_reclamado}</p>
                    </div>
                    {os.obs_recebimento && (
                        <div>
                            <p className="text-sm font-medium">Obs. Recebimento</p>
                            <p className="text-sm text-muted-foreground">{os.obs_recebimento}</p>
                        </div>
                    )}
                    {os.defeito_constatado && (
                        <div>
                            <p className="text-sm font-medium">Laudo Técnico</p>
                            <p className="text-sm text-muted-foreground">{os.defeito_constatado}</p>
                        </div>
                    )}
                    {os.solucao_aplicada && (
                        <div>
                            <p className="text-sm font-medium">Solução Aplicada</p>
                            <p className="text-sm text-muted-foreground">{os.solucao_aplicada}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Serviços */}
                {os.servicos && os.servicos.length > 0 && (
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Serviços Realizados</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Descrição</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {os.servicos.map((servico) => (
                                        <TableRow key={servico.id}>
                                            <TableCell>
                                                <div className="font-medium">{servico.descricao}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {servico.quantidade}x {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(servico.valor_unitario))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {new Intl.NumberFormat("pt-BR", {
                                                    style: "currency",
                                                    currency: "BRL",
                                                }).format(Number(servico.valor_total) || 0)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Produtos/Peças */}
                {os.produtos && os.produtos.length > 0 && (
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Produtos/Peças Utilizadas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Produto</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {os.produtos.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="font-medium">{item.produto.nome}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {item.quantidade}x {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(item.valor_unitario))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {new Intl.NumberFormat("pt-BR", {
                                                    style: "currency",
                                                    currency: "BRL",
                                                }).format(Number(item.valor_total) || 0)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Observações e Pagamento */}
            <div className="grid gap-6 md:grid-cols-2">
                {(os.observacoes || os.observacoes_cliente) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Observações</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {os.observacoes && (
                                <div>
                                    <p className="text-sm font-medium">Observações Internas</p>
                                    <p className="text-sm text-muted-foreground bg-yellow-50 p-2 rounded border border-yellow-100">{os.observacoes}</p>
                                </div>
                            )}
                            {os.observacoes_cliente && (
                                <div>
                                    <p className="text-sm font-medium">Observações para o Cliente</p>
                                    <p className="text-sm text-muted-foreground">
                                        {os.observacoes_cliente}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Informações Financeiras Adicionais */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informações de Pagamento</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {os.forma_pagamento ? (
                            <div>
                                <p className="text-sm font-medium">Forma de Pagamento</p>
                                <p className="text-sm text-muted-foreground">{os.forma_pagamento}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Nenhuma forma de pagamento registrada.</p>
                        )}

                        {os.valor_frete > 0 && (
                            <div>
                                <p className="text-sm font-medium">Frete</p>
                                <p className="text-sm text-muted-foreground">
                                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(os.valor_frete))}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Anexos */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Anexos</span>
                        <Button variant="outline" size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar Anexo
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {os.anexos && os.anexos.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {os.anexos.map((anexo: any) => (
                                <div key={anexo.id} className="border rounded p-2 flex flex-col items-center gap-2">
                                    <div className="h-20 w-full bg-muted flex items-center justify-center rounded">
                                        <FileText className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <span className="text-xs truncate w-full text-center">{anexo.descricao || "Sem descrição"}</span>
                                    <Button variant="ghost" size="sm" className="w-full text-xs">Baixar</Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            Nenhum anexo encontrado.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
