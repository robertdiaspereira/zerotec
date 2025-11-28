"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const availableWidgets = [
    { id: "vendas-mes", label: "Vendas do Mês", description: "Total de vendas realizadas no mês atual", enabled: true },
    { id: "receitas-mes", label: "Receitas do Mês", description: "Total de receitas recebidas", enabled: true },
    { id: "despesas-mes", label: "Despesas do Mês", description: "Total de despesas pagas", enabled: true },
    { id: "lucro-mes", label: "Lucro do Mês", description: "Lucro líquido do período", enabled: true },
    { id: "vendas-hoje", label: "Vendas Hoje", description: "Vendas realizadas hoje", enabled: false },
    { id: "os-pendentes", label: "OS Pendentes", description: "Ordens de serviço em aberto", enabled: false },
    { id: "estoque-baixo", label: "Estoque Baixo", description: "Produtos com estoque abaixo do mínimo", enabled: false },
    { id: "melhor-cliente", label: "Melhor Cliente", description: "Cliente com maior volume de compras", enabled: false },
    { id: "melhores-servicos", label: "Melhores Serviços", description: "Serviços mais vendidos", enabled: false },
    { id: "melhores-produtos", label: "Melhores Produtos", description: "Produtos mais vendidos", enabled: false },
    { id: "contas-vencer", label: "Contas a Vencer", description: "Contas próximas do vencimento", enabled: false },
    { id: "fluxo-caixa-semanal", label: "Fluxo de Caixa Semanal", description: "Gráfico de fluxo de caixa da semana", enabled: false },
];

export default function DashboardConfigPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [widgets, setWidgets] = React.useState(availableWidgets);

    React.useEffect(() => {
        const savedWidgets = localStorage.getItem("dashboardWidgets");
        if (savedWidgets) {
            try {
                setWidgets(JSON.parse(savedWidgets));
            } catch (e) {
                console.error("Failed to parse saved widgets", e);
            }
        }
    }, []);

    const toggleWidget = (id: string) => {
        setWidgets(widgets.map(w =>
            w.id === id ? { ...w, enabled: !w.enabled } : w
        ));
    };

    const handleSave = () => {
        localStorage.setItem("dashboardWidgets", JSON.stringify(widgets));
        toast({
            title: "Sucesso",
            description: "Configurações do dashboard salvas com sucesso!",
        });
        router.push("/dashboard");
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Configurar Dashboard</h1>
                        <p className="text-muted-foreground">Escolha quais widgets deseja exibir no painel principal</p>
                    </div>
                </div>
                <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Configurações
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Widgets Disponíveis</CardTitle>
                    <CardDescription>
                        Selecione os widgets que deseja visualizar no dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        {widgets.map((widget) => (
                            <div
                                key={widget.id}
                                className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                            >
                                <Checkbox
                                    id={widget.id}
                                    checked={widget.enabled}
                                    onCheckedChange={() => toggleWidget(widget.id)}
                                />
                                <div className="flex-1 space-y-1">
                                    <Label
                                        htmlFor={widget.id}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {widget.label}
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        {widget.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
