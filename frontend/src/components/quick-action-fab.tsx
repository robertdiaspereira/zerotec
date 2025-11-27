"use client";

import * as React from "react";
import {
    Plus,
    FileText,
    UserPlus,
    PackagePlus,
    ShoppingCart,
    Wrench,
    Truck,
    ArrowLeftRight,
    DollarSign,
    Printer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "next/navigation";
import { ServiceCreationModal } from "./service-creation-modal";

export function QuickActionFab() {
    const router = useRouter();
    const pathname = usePathname();
    const [serviceModalOpen, setServiceModalOpen] = React.useState(false);

    if (pathname === "/login") return null;

    return (
        <>
            <div className="fixed bottom-6 right-6 z-50">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="icon"
                            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
                        >
                            <Plus className="h-6 w-6" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 mb-2">


                        <DropdownMenuItem onClick={() => router.push("/os/nova")}>
                            <Wrench className="mr-2 h-4 w-4" />
                            <span>Nova OS</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => router.push("/vendas/nova")}>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            <span>Nova Venda</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => router.push("/vendas/nova")}>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            <span>Nova Venda PDV</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={() => router.push("/clientes/novo")}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            <span>Novo Cliente</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => router.push("/clientes/novo?tipo=fornecedor")}>
                            <Truck className="mr-2 h-4 w-4" />
                            <span>Novo Fornecedor</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => router.push("/produtos/novo")}>
                            <PackagePlus className="mr-2 h-4 w-4" />
                            <span>Novo Produto</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => router.push("/estoque/movimentacoes/nova")}>
                            <ArrowLeftRight className="mr-2 h-4 w-4" />
                            <span>Ajuste de Estoque</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={() => setServiceModalOpen(true)}>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Novo Serviço</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => router.push("/financeiro/fluxo-caixa")}>
                            <DollarSign className="mr-2 h-4 w-4" />
                            <span>Fluxo de Caixa</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem disabled>
                            <Printer className="mr-2 h-4 w-4" />
                            <span>Imprimir Barcode</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <ServiceCreationModal
                open={serviceModalOpen}
                onOpenChange={setServiceModalOpen}
            />
        </>
    );
}
