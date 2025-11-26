/**
 * Dashboard Page
 * Main dashboard with KPIs, charts and recent activities
 */

"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DollarSign,
    ShoppingCart,
    Wrench,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";
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

    if (loading) {
        return <DashboardSkeleton />;
    }

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

    if (!data) {
        return null;
    }

    const { kpis, graficos, ultimas_movimentacoes } = data;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Visão geral do seu negócio
                </p>
            </div>

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Vendas do Mês */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Vendas do Mês</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                            }).format(kpis.vendas_mes.total)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{kpis.vendas_mes.quantidade} vendas</span>
                            <span>•</span>
                            <span>
                                Ticket médio:{" "}
                                {new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                }).format(kpis.vendas_mes.ticket_medio)}
                            </span>
                        </div>
                        <div className="mt-2 flex items-center gap-1">
                            {kpis.vendas_mes.variacao >= 0 ? (
                                <>
                                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                                    <span className="text-xs font-medium text-green-600">
                                        +{kpis.vendas_mes.variacao.toFixed(1)}%
                                    </span>
                                </>
                            ) : (
                                <>
                                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                                    <span className="text-xs font-medium text-red-600">
                                        {kpis.vendas_mes.variacao.toFixed(1)}%
                                    </span>
                                </>
                            )}
                            <span className="text-xs text-muted-foreground">vs mês anterior</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Ordens de Serviço */}
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
                            }).format(kpis.os_mes.total)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{kpis.os_mes.quantidade} OS</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                                {kpis.os_mes.abertas} abertas
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                                {kpis.os_mes.concluidas} concluídas
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Financeiro */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Saldo do Mês</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                            }).format(kpis.financeiro_mes.saldo)}
                        </div>
                        <div className="mt-2 space-y-1">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">A Receber</span>
                                <span className="font-medium text-green-600">
                                    {new Intl.NumberFormat("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                    }).format(kpis.financeiro_mes.receber)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">A Pagar</span>
                                <span className="font-medium text-red-600">
                                    {new Intl.NumberFormat("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                    }).format(kpis.financeiro_mes.pagar)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Financial Cards - Contas a Receber e Pagar */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Contas a Receber */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold">A Receber</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Link
                            href="/financeiro/fluxo-caixa?tipo=receber&filtro=hoje"
                            className="flex items-center justify-between hover:bg-accent/50 rounded-md p-2 -m-2 transition-colors"
                        >
                            <span className="text-sm text-muted-foreground">Hoje:</span>
                            <span className="text-sm font-medium">
                                {new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                }).format(kpis.contas_receber?.hoje || 0)}
                            </span>
                        </Link>
                        <Link
                            href="/financeiro/fluxo-caixa?tipo=receber&filtro=restante_mes"
                            className="flex items-center justify-between hover:bg-accent/50 rounded-md p-2 -m-2 transition-colors"
                        >
                            <span className="text-sm text-muted-foreground">Restante do mês:</span>
                            <span className="text-sm font-medium">
                                {new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                }).format(kpis.contas_receber?.restante_mes || 0)}
                            </span>
                        </Link>
                        <Link
                            href="/financeiro/fluxo-caixa?tipo=receber&filtro=atrasadas"
                            className="flex items-center justify-between border-t pt-3 hover:bg-accent/50 rounded-md p-2 -m-2 transition-colors"
                        >
                            <span className="text-sm font-semibold text-destructive">Em Atraso:</span>
                            <span className="text-sm font-bold text-destructive">
                                {new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                }).format(kpis.contas_receber?.atrasadas || 0)}
                            </span>
                        </Link>
                    </CardContent>
                </Card>

                {/* Contas a Pagar */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold">A Pagar</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Link
                            href="/financeiro/fluxo-caixa?tipo=pagar&filtro=hoje"
                            className="flex items-center justify-between hover:bg-accent/50 rounded-md p-2 -m-2 transition-colors"
                        >
                            <span className="text-sm text-muted-foreground">Hoje:</span>
                            <span className="text-sm font-medium">
                                {new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                }).format(kpis.contas_pagar?.hoje || 0)}
                            </span>
                        </Link>
                        <Link
                            href="/financeiro/fluxo-caixa?tipo=pagar&filtro=restante_mes"
                            className="flex items-center justify-between hover:bg-accent/50 rounded-md p-2 -m-2 transition-colors"
                        >
                            <span className="text-sm text-muted-foreground">Restante do mês:</span>
                            <span className="text-sm font-medium">
                                {new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                }).format(kpis.contas_pagar?.restante_mes || 0)}
                            </span>
                        </Link>
                        <Link
                            href="/financeiro/fluxo-caixa?tipo=pagar&filtro=atrasadas"
                            className="flex items-center justify-between border-t pt-3 hover:bg-accent/50 rounded-md p-2 -m-2 transition-colors"
                        >
                            <span className="text-sm font-semibold text-destructive">Em Atraso:</span>
                            <span className="text-sm font-bold text-destructive">
                                {new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                }).format(kpis.contas_pagar?.atrasadas || 0)}
                            </span>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Charts and Recent Activity */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Charts */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Visão Anual</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="vendas" className="space-y-4">
                            <TabsList>
                                <TabsTrigger value="vendas">Vendas</TabsTrigger>
                                <TabsTrigger value="custos">Custos</TabsTrigger>
                                <TabsTrigger value="os">Ordens de Serviço</TabsTrigger>
                            </TabsList>
                            <TabsContent value="vendas" className="space-y-4">
                                <SimpleBarChart
                                    data={graficos.vendas_ano}
                                    label="Vendas"
                                    color="hsl(var(--primary))"
                                />
                            </TabsContent>
                            <TabsContent value="custos" className="space-y-4">
                                <SimpleBarChart
                                    data={graficos.custos_ano}
                                    label="Custos"
                                    color="hsl(var(--destructive))"
                                />
                            </TabsContent>
                            <TabsContent value="os" className="space-y-4">
                                <SimpleBarChart
                                    data={graficos.os_ano.map((item) => ({
                                        mes: item.mes,
                                        valor: item.quantidade,
                                    }))}
                                    label="OS"
                                    color="hsl(var(--chart-2))"
                                />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Últimas Movimentações</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {ultimas_movimentacoes.map((mov) => {
                                // Generate link based on movement type
                                const getMovementLink = () => {
                                    switch (mov.tipo) {
                                        case 'venda':
                                            return `/vendas/${mov.id}`;
                                        case 'os':
                                            return `/os/${mov.id}`;
                                        case 'pagamento':
                                            return `/financeiro/contas-pagar`;
                                        case 'recebimento':
                                            return `/financeiro/contas-receber`;
                                        default:
                                            return '#';
                                    }
                                };

                                return (
                                    <Link
                                        key={mov.id}
                                        href={getMovementLink()}
                                        className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0 hover:bg-accent/50 rounded-md p-2 -m-2 transition-colors"
                                    >
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {mov.descricao}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(mov.data).toLocaleDateString("pt-BR")}
                                            </p>
                                        </div>
                                        <div className="text-sm font-medium">
                                            {new Intl.NumberFormat("pt-BR", {
                                                style: "currency",
                                                currency: "BRL",
                                            }).format(mov.valor)}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Simple Bar Chart Component
function SimpleBarChart({
    data,
    label,
    color,
}: {
    data: Array<{ mes: number; valor: number }>;
    label: string;
    color: string;
}) {
    const maxValue = Math.max(...data.map((d) => d.valor));
    const meses = [
        "Jan",
        "Fev",
        "Mar",
        "Abr",
        "Mai",
        "Jun",
        "Jul",
        "Ago",
        "Set",
        "Out",
        "Nov",
        "Dez",
    ];

    return (
        <div className="space-y-2">
            <div className="flex h-[200px] items-end gap-2">
                {data.map((item) => (
                    <div key={item.mes} className="flex flex-1 flex-col items-center gap-1">
                        <div className="relative w-full">
                            <div
                                className="w-full rounded-t transition-all hover:opacity-80"
                                style={{
                                    height: `${(item.valor / maxValue) * 180}px`,
                                    backgroundColor: color,
                                    minHeight: "4px",
                                }}
                            />
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {meses[item.mes - 1]}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Loading Skeleton
function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="mt-2 h-4 w-64" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
        </div>
    );
}
