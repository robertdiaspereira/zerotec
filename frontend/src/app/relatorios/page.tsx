import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { FileText, TrendingUp, Package } from "lucide-react";

export default function RelatoriosPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
                <p className="text-muted-foreground">
                    Visualize os relatórios gerenciais do sistema
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Link href="/relatorios/dre">
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                <CardTitle>DRE</CardTitle>
                            </div>
                            <CardDescription>
                                Demonstrativo de Resultados do Exercício
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/relatorios/vendas">
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-green-500" />
                                <CardTitle>Vendas</CardTitle>
                            </div>
                            <CardDescription>
                                Relatório detalhado de vendas por período
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/relatorios/estoque">
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-blue-500" />
                                <CardTitle>Estoque</CardTitle>
                            </div>
                            <CardDescription>
                                Posição atual e movimentações de estoque
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
