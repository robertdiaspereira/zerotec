/**
 * Fluxo de Caixa Page
 * Cash flow with filters from dashboard
 */

"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Filter,
    Download,
    TrendingUp,
    TrendingDown
} from "lucide-react";

interface Conta {
    id: number;
    numero: string;
    descricao: string;
    valor_original: number;
    valor_pago?: number;
    valor_recebido?: number;
    data_vencimento: string;
    status: string;
    cliente?: { nome_razao_social: string };
    fornecedor?: { razao_social: string };
    tipo?: string;
}

export default function FluxoCaixaPage() {
    const searchParams = useSearchParams();
    const tipo = searchParams.get("tipo");
    const filtro = searchParams.get("filtro");

    const [contas, setContas] = React.useState<Conta[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        async function fetchContas() {
            try {
                setLoading(true);
                setError(null);

                let allContas: Conta[] = [];

                if (tipo === "receber") {
                    const response = await fetch("http://localhost:8000/api/financeiro/contas-receber/");
                    const data = await response.json();
                    const contasArray = Array.isArray(data) ? data : (data.results || []);
                    allContas = contasArray.map((c: any) => ({ ...c, tipo: 'receber' }));
                } else if (tipo === "pagar") {
                    const response = await fetch("http://localhost:8000/api/financeiro/contas-pagar/");
                    const data = await response.json();
                    const contasArray = Array.isArray(data) ? data : (data.results || []);
                    allContas = contasArray.map((c: any) => ({ ...c, tipo: 'pagar' }));
                } else {
                    const [receber, pagar] = await Promise.all([
                        fetch("http://localhost:8000/api/financeiro/contas-receber/"),
                        fetch("http://localhost:8000/api/financeiro/contas-pagar/")
                    ]);
                    const receberData = await receber.json();
                    const pagarData = await pagar.json();

                    const receberArray = Array.isArray(receberData) ? receberData : (receberData.results || []);
                    const pagarArray = Array.isArray(pagarData) ? pagarData : (pagarData.results || []);

                    allContas = [
                        ...receberArray.map((c: any) => ({ ...c, tipo: 'receber' })),
                        ...pagarArray.map((c: any) => ({ ...c, tipo: 'pagar' }))
                    ];
                }

                setContas(aplicarFiltros(allContas));
            } catch (err) {
                console.error("Erro ao carregar contas:", err);
                setError(err instanceof Error ? err.message : "Erro ao carregar contas");
                setContas([]);
            } finally {
                setLoading(false);
            }
        }

        fetchContas();
    }, [tipo, filtro]);

    function aplicarFiltros(contas: Conta[]) {
        if (!filtro) return contas;

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

        return contas.filter(conta => {
            const vencimento = new Date(conta.data_vencimento);
            vencimento.setHours(0, 0, 0, 0);

            switch (filtro) {
                case 'hoje':
                    return vencimento.getTime() === hoje.getTime() && conta.status === 'pendente';
                case 'restante_mes':
                    return vencimento > hoje && vencimento <= fimMes && conta.status === 'pendente';
                case 'atrasadas':
                    return vencimento < hoje && conta.status === 'pendente';
                default:
                    return true;
            }
        });
    }

    const getTitulo = () => {
        const tipoTexto = tipo === 'receber' ? 'Receber' : tipo === 'pagar' ? 'Pagar' : 'Fluxo de Caixa';
        const filtroTexto = filtro === 'hoje' ? 'Hoje' :
            filtro === 'restante_mes' ? 'Restante do Mês' :
                filtro === 'atrasadas' ? 'Atrasadas' : '';
        return `${tipoTexto}${filtroTexto ? ` - ${filtroTexto}` : ''}`;
    };

    const calcularTotais = () => {
        const total = contas.reduce((sum, c) => sum + (Number(c.valor_original) || 0), 0);
        const pago = contas.reduce((sum, c) => sum + (Number(c.valor_pago || c.valor_recebido) || 0), 0);
        return { total, pago, pendente: total - pago };
    };

    const totais = calcularTotais();

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-64" />
                <div className="grid gap-4 md:grid-cols-3">
                    {[1, 2, 3].map(i => (
                        <Card key={i}>
                            <CardHeader><Skeleton className="h-4 w-32" /></CardHeader>
                            <CardContent><Skeleton className="h-8 w-40" /></CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <div className="text-center">
                    <p className="text-lg font-semibold text-destructive">Erro ao carregar contas</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{getTitulo()}</h1>
                    <p className="text-muted-foreground">{contas.length} {contas.length === 1 ? 'conta' : 'contas'}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline"><Filter className="mr-2 h-4 w-4" />Filtros</Button>
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" />Exportar</Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totais.total)}
                        </div>
                        <p className="text-xs text-muted-foreground">{contas.length} {contas.length === 1 ? 'conta' : 'contas'}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {tipo === 'receber' ? 'Recebido' : tipo === 'pagar' ? 'Pago' : 'Realizado'}
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totais.pago)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pendente</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totais.pendente)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Contas</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Número</TableHead>
                                <TableHead>Cliente/Fornecedor</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Vencimento</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {contas.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center">Nenhuma conta encontrada</TableCell>
                                </TableRow>
                            ) : (
                                contas.map((conta) => (
                                    <TableRow key={conta.id}>
                                        <TableCell>
                                            {conta.tipo === 'receber' ? (
                                                <ArrowUpRight className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <ArrowDownRight className="h-4 w-4 text-red-600" />
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">{conta.numero}</TableCell>
                                        <TableCell>{conta.cliente?.nome_razao_social || conta.fornecedor?.razao_social || '-'}</TableCell>
                                        <TableCell>{conta.descricao}</TableCell>
                                        <TableCell>{new Date(conta.data_vencimento).toLocaleDateString("pt-BR")}</TableCell>
                                        <TableCell className="text-right font-medium">
                                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(conta.valor_original) || 0)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                conta.status === 'pago' || conta.status === 'recebido' ? 'default' :
                                                    conta.status === 'atrasado' ? 'destructive' : 'secondary'
                                            }>
                                                {conta.status}
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
