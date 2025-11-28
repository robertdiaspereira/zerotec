"use client";

import * as React from "react";
import { AlertTriangle, DollarSign, Package, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface AlertData {
    lowStockCount: number;
    pendingReceivablesCount: number;
}

export function HeaderAlerts() {
    const router = useRouter();
    const [alerts, setAlerts] = React.useState<AlertData>({
        lowStockCount: 0,
        pendingReceivablesCount: 0,
    });

    React.useEffect(() => {
        const fetchAlerts = async () => {
            try {
                // Fetch Low Stock
                const stockData: any = await api.getEstoqueBaixo();
                if (stockData) {
                    setAlerts((prev) => ({ ...prev, lowStockCount: stockData.length }));
                }

                // Fetch Pending Receivables
                const receivablesData: any = await api.getContasReceber({ status: 'pendente' });
                if (receivablesData) {
                    // Assuming pagination or list
                    const count = Array.isArray(receivablesData) ? receivablesData.length : receivablesData.results?.length || 0;
                    setAlerts((prev) => ({ ...prev, pendingReceivablesCount: count }));
                }
            } catch (error) {
                console.error("Error fetching alerts:", error);
            }
        };

        fetchAlerts();
        // Poll every 5 minutes
        const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-2 mr-4">
            {/* Stock Alert */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                        <Package className="h-5 w-5" />
                        {alerts.lowStockCount > 0 && (
                            <Badge
                                variant="destructive"
                                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full p-0 text-[10px]"
                            >
                                {alerts.lowStockCount}
                            </Badge>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Estoque</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/estoque/baixo")}>
                        <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
                        <span>{alerts.lowStockCount} Itens com estoque baixo</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Financial Alert */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                        <DollarSign className="h-5 w-5" />
                        {alerts.pendingReceivablesCount > 0 && (
                            <Badge
                                variant="destructive"
                                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full p-0 text-[10px]"
                            >
                                {alerts.pendingReceivablesCount}
                            </Badge>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Financeiro</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/financeiro/fluxo-caixa?tipo=receber&status=pendente")}>
                        <Bell className="mr-2 h-4 w-4 text-blue-500" />
                        <span>{alerts.pendingReceivablesCount} Recebimentos pendentes</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
