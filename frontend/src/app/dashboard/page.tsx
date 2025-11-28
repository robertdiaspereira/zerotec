"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import type { Dashboard } from "@/types";
import Link from "next/link";

export default function DashboardPage() {
    const [data, setData] = React.useState<Dashboard | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        async function fetchDashboard() {
            try {
                const response = await api.getDashboard();
                setData(response as Dashboard);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Erro ao carregar dashboard");
            } finally {
                setLoading(false);
            }
        }
        fetchDashboard();
    }, []);

    if (loading) return <DashboardSkeleton />;
    if (error) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <div className="text-center">
                    <p className="text-lg font-semibold text-destructive">Erro ao carregar dashboard</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                </div>
            </div>
        );
    }
    if (!data) return null;

    const { kpis, graficos, ultimas_movimentacoes } = data;

    return (
        <div className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Visão Anual - {new Date().getFullYear()}</CardTitle>
                        <p className="text-sm text-muted-foreground">Receitas e custos mensais</p>
                    </CardHeader>
                    <CardContent>
                        <FinancialChart meses={graficos.meses} vendas={graficos.vendas} servicos={graficos.servicos} custos={graficos.custos} />
                    </CardContent>
                </Card>

                <div className="flex flex-col gap-4 h-full">
                    <Card className="flex-1 flex flex-col">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                                A Receber
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-around space-y-4">
                            <Link href="/financeiro/fluxo-caixa?tipo=receber&filtro=hoje" className="flex items-center justify-between hover:bg-accent/50 rounded-md p-3 -m-3 transition-colors cursor-pointer">
                                <span className="text-sm text-muted-foreground">Hoje:</span>
                                <span className="text-base font-bold text-green-600">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(kpis.contas_receber?.hoje || 0)}</span>
                            </Link>
                            <Link href="/financeiro/fluxo-caixa?tipo=receber&filtro=mes" className="flex items-center justify-between hover:bg-accent/50 rounded-md p-3 -m-3 transition-colors cursor-pointer">
                                <span className="text-sm text-muted-foreground">Restante do mês:</span>
                                <span className="text-base font-bold text-orange-600">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(kpis.contas_receber?.restante_mes || 0)}</span>
                            </Link>
                            <Link href="/financeiro/fluxo-caixa?tipo=receber&filtro=atrasadas" className="flex items-center justify-between pt-4 border-t hover:bg-accent/50 rounded-md p-3 -m-3 transition-colors cursor-pointer">
                                <span className="text-sm font-medium text-muted-foreground">Atrasadas:</span>
                                <span className="text-base font-bold text-red-600">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(kpis.contas_receber?.atrasadas || 0)}</span>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="flex-1 flex flex-col">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <TrendingDown className="h-5 w-5 text-muted-foreground" />
                                A Pagar
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-around space-y-4">
                            <Link href="/financeiro/fluxo-caixa?tipo=pagar&filtro=hoje" className="flex items-center justify-between hover:bg-accent/50 rounded-md p-3 -m-3 transition-colors cursor-pointer">
                                <span className="text-sm text-muted-foreground">Hoje:</span>
                                <span className="text-base font-bold text-green-600">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(kpis.contas_pagar?.hoje || 0)}</span>
                            </Link>
                            <Link href="/financeiro/fluxo-caixa?tipo=pagar&filtro=mes" className="flex items-center justify-between hover:bg-accent/50 rounded-md p-3 -m-3 transition-colors cursor-pointer">
                                <span className="text-sm text-muted-foreground">Restante do mês:</span>
                                <span className="text-base font-bold text-orange-600">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(kpis.contas_pagar?.restante_mes || 0)}</span>
                            </Link>
                            <Link href="/financeiro/fluxo-caixa?tipo=pagar&filtro=atrasadas" className="flex items-center justify-between pt-4 border-t hover:bg-accent/50 rounded-md p-3 -m-3 transition-colors cursor-pointer">
                                <span className="text-sm font-medium text-muted-foreground">Atrasadas:</span>
                                <span className="text-base font-bold text-red-600">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(kpis.contas_pagar?.atrasadas || 0)}</span>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Card>
                <CardHeader className="text-center pb-4 border-b">
                    <CardTitle className="text-2xl font-semibold">Últimas Movimentações</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[280px]">Descrição</TableHead>
                                <TableHead>Detalhes</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Pagamento</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                                <TableHead className="text-right">Data</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ultimas_movimentacoes.map((mov) => {
                                const getLink = () => {
                                    switch (mov.tipo) {
                                        case 'venda': return `/vendas/${mov.id}`;
                                        case 'os': return `/os/${mov.id}`;
                                        case 'pagamento':
                                        case 'compra': return `/financeiro/contas-pagar`;
                                        case 'recebimento': return `/financeiro/contas-receber`;
                                        default: return '#';
                                    }
                                };

                                const getStatusVariant = (status: string | undefined) => {
                                    const s = (status || '').toLowerCase();
                                    if (['pago', 'recebido', 'concluído', 'finalizado', 'entregue'].includes(s)) return 'default';
                                    if (['pendente', 'aberto', 'em andamento', 'aguardando'].includes(s)) return 'secondary';
                                    if (['cancelado', 'atrasado'].includes(s)) return 'destructive';
                                    return 'outline';
                                };

                                const getPaymentStatusVariant = (status: string | undefined) => {
                                    const s = (status || '').toLowerCase();
                                    if (['pago', 'recebido'].includes(s)) return 'default';
                                    if (['pendente', 'parcial'].includes(s)) return 'secondary';
                                    if (['atrasado', 'vencido'].includes(s)) return 'destructive';
                                    return 'outline';
                                };

                                const getDataLabel = () => {
                                    switch (mov.tipo) {
                                        case 'venda': return 'Venda';
                                        case 'os': return 'Abertura';
                                        case 'pagamento': return 'Pagamento';
                                        case 'recebimento': return 'Recebimento';
                                        case 'compra': return 'Pedido';
                                        default: return 'Data';
                                    }
                                };

                                return (
                                    <TableRow key={`${mov.tipo}-${mov.id}`}>
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <Link href={getLink()} className="hover:underline">{mov.descricao}</Link>
                                                <span className="text-xs text-muted-foreground capitalize">{mov.tipo}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {mov.detalhes || ''}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(mov.status)} className="capitalize">
                                                {mov.status || 'Pendente'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {mov.status_pagamento && (
                                                <Badge variant={getPaymentStatusVariant(mov.status_pagamento)} className="capitalize">
                                                    {mov.status_pagamento}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            <span className={mov.tipo === 'pagamento' || mov.tipo === 'compra' ? 'text-red-600' : 'text-green-600'}>
                                                {mov.tipo === 'pagamento' || mov.tipo === 'compra' ? '-' : '+'}
                                                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(mov.valor)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right text-sm">
                                            <div className="flex flex-col items-end">
                                                <span className="text-muted-foreground">{new Date(mov.data).toLocaleDateString("pt-BR")}</span>
                                                <span className="text-xs text-muted-foreground/70">{getDataLabel()}</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

function FinancialChart({ meses, vendas, servicos, custos }: { meses: string[]; vendas: number[]; servicos: number[]; custos: number[] }) {
    const [visible, setVisible] = React.useState({ vendas: true, servicos: true, custos: true });
    const [hovered, setHovered] = React.useState<number | null>(null);

    const toggle = (s: keyof typeof visible) => setVisible(p => ({ ...p, [s]: !p[s] }));
    const maxVal = Math.max(...meses.map((_, i) => (visible.vendas ? vendas[i] : 0) + (visible.servicos ? servicos[i] : 0) + (visible.custos ? custos[i] : 0)), 1);
    const yLabels = Array.from({ length: 5 }, (_, i) => (maxVal / 4) * (4 - i));

    return (
        <div className="space-y-3">
            <div className="relative h-[320px] w-full flex gap-2">
                <div className="flex flex-col justify-between py-2 text-xs text-muted-foreground w-16 text-right">
                    {yLabels.map((v, i) => <span key={i}>{new Intl.NumberFormat("pt-BR", { notation: "compact" }).format(v)}</span>)}
                </div>
                <div className="relative flex-1">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                        {yLabels.map((_, i) => <line key={i} x1="0" y1={(100 / 4) * i} x2="100" y2={(100 / 4) * i} stroke="currentColor" strokeWidth="0.2" className="text-muted-foreground/20" />)}
                        {visible.custos && <AreaPath data={custos} max={maxVal} color="rgb(220 38 38)" />}
                        {visible.servicos && <AreaPath data={servicos} max={maxVal} color="rgb(234 88 12)" />}
                        {visible.vendas && <AreaPath data={vendas} max={maxVal} color="rgb(22 163 74)" />}
                    </svg>
                    <div className="absolute inset-0 flex">
                        {meses.map((m, i) => (
                            <div key={m} className="flex-1 relative cursor-pointer" onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
                                {hovered === i && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-popover text-popover-foreground p-3 rounded-lg border shadow-lg z-10 min-w-[180px]">
                                        <p className="font-bold text-sm mb-2">{m}</p>
                                        {visible.vendas && <div className="flex items-center justify-between gap-4 text-xs mb-1"><span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-green-600" />Vendas:</span><span className="font-semibold">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(vendas[i])}</span></div>}
                                        {visible.servicos && <div className="flex items-center justify-between gap-4 text-xs mb-1"><span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-orange-600" />Serviços:</span><span className="font-semibold">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(servicos[i])}</span></div>}
                                        {visible.custos && <div className="flex items-center justify-between gap-4 text-xs"><span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-red-600" />Custos:</span><span className="font-semibold">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(custos[i])}</span></div>}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
                        {meses.map(m => <span key={m} className="text-[10px] text-muted-foreground">{m}</span>)}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center gap-6 text-sm pt-2 border-t">
                <button onClick={() => toggle('vendas')} className={`flex items-center gap-2 transition-opacity ${visible.vendas ? 'opacity-100' : 'opacity-40'} hover:opacity-100`}>
                    <div className="h-3 w-3 rounded-full bg-green-600" /><span className="font-medium">Receitas (Vendas)</span>
                </button>
                <button onClick={() => toggle('servicos')} className={`flex items-center gap-2 transition-opacity ${visible.servicos ? 'opacity-100' : 'opacity-40'} hover:opacity-100`}>
                    <div className="h-3 w-3 rounded-full bg-orange-600" /><span className="font-medium">Receitas (Serviços)</span>
                </button>
                <button onClick={() => toggle('custos')} className={`flex items-center gap-2 transition-opacity ${visible.custos ? 'opacity-100' : 'opacity-40'} hover:opacity-100`}>
                    <div className="h-3 w-3 rounded-full bg-red-600" /><span className="font-medium">Custos (Produtos)</span>
                </button>
            </div>
        </div>
    );
}

function AreaPath({ data, max, color }: { data: number[]; max: number; color: string }) {
    const w = 100, h = 100, step = w / (data.length - 1);
    let path = `M 0 ${h}`;
    data.forEach((v, i) => {
        const x = i * step, y = h - (v / max) * h;
        path += ` L ${x} ${y}`;
    });
    path += ` L ${w} ${h} Z`;
    return <path d={path} fill={color} opacity="0.6" />;
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2"><CardHeader><Skeleton className="h-6 w-48" /></CardHeader><CardContent><Skeleton className="h-[280px] w-full" /></CardContent></Card>
                <div className="space-y-4"><Skeleton className="h-[180px] w-full" /><Skeleton className="h-[180px] w-full" /></div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map(i => <Card key={i}><CardHeader><Skeleton className="h-4 w-32" /></CardHeader><CardContent><Skeleton className="h-8 w-40" /></CardContent></Card>)}
            </div>
        </div>
    );
}
