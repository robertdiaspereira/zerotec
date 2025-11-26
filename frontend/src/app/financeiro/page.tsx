/**
 * Financeiro Dashboard
 * Main financial dashboard page
 */

"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Building2,
    TrendingUp,
    TrendingDown,
    BarChart3,
    FolderTree,
    FileText,
    ArrowRight,
} from "lucide-react";

export default function FinanceiroDashboard() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
                <p className="text-muted-foreground">
                    Gestão financeira completa
                </p>
            </div>

            {/* Quick Access Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Fluxo de Caixa */}
                <Link href="/financeiro/fluxo-caixa">
                    <Card className="cursor-pointer transition-colors hover:bg-accent/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Fluxo de Caixa
                            </CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                Visão consolidada de entradas e saídas
                            </p>
                            <div className="mt-4 flex items-center text-sm font-medium text-primary">
                                Acessar
                                <ArrowRight className="ml-1 h-4 w-4" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {/* Contas a Receber */}
                <Link href="/financeiro/fluxo-caixa?tipo=receber">
                    <Card className="cursor-pointer transition-colors hover:bg-accent/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Contas a Receber
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                Gerenciar recebimentos de clientes
                            </p>
                            <div className="mt-4 flex items-center text-sm font-medium text-primary">
                                Acessar
                                <ArrowRight className="ml-1 h-4 w-4" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {/* Contas a Pagar */}
                <Link href="/financeiro/fluxo-caixa?tipo=pagar">
                    <Card className="cursor-pointer transition-colors hover:bg-accent/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Contas a Pagar
                            </CardTitle>
                            <TrendingDown className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                Gerenciar pagamentos a fornecedores
                            </p>
                            <div className="mt-4 flex items-center text-sm font-medium text-primary">
                                Acessar
                                <ArrowRight className="ml-1 h-4 w-4" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {/* Contas Bancárias */}
                <Link href="/financeiro/contas-bancarias">
                    <Card className="cursor-pointer transition-colors hover:bg-accent/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Contas Bancárias
                            </CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                Gerenciar contas e extratos bancários
                            </p>
                            <div className="mt-4 flex items-center text-sm font-medium text-primary">
                                Acessar
                                <ArrowRight className="ml-1 h-4 w-4" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {/* Categorias */}
                <Link href="/financeiro/categorias">
                    <Card className="cursor-pointer transition-colors hover:bg-accent/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Categorias
                            </CardTitle>
                            <FolderTree className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                Categorias de receitas e despesas
                            </p>
                            <div className="mt-4 flex items-center text-sm font-medium text-primary">
                                Acessar
                                <ArrowRight className="ml-1 h-4 w-4" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {/* Relatórios */}
                <Link href="/financeiro/relatorios">
                    <Card className="cursor-pointer transition-colors hover:bg-accent/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Relatórios
                            </CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                DRE, Balancete e Conciliação
                            </p>
                            <div className="mt-4 flex items-center text-sm font-medium text-primary">
                                Acessar
                                <ArrowRight className="ml-1 h-4 w-4" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Módulo Financeiro</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Gerencie todas as operações financeiras da sua empresa em um só lugar.
                        Controle contas a pagar e receber, acompanhe o fluxo de caixa,
                        gerencie suas contas bancárias e tenha acesso a relatórios completos.
                    </p>
                    <div className="mt-4 grid gap-2 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-600" />
                            <span>Fluxo de Caixa em tempo real</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-600" />
                            <span>Controle de múltiplas contas bancárias</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-purple-600" />
                            <span>Relatórios financeiros completos</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
