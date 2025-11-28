/**
 * PDV (Ponto de Venda)
 * Fullscreen sales interface with cash register check
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, ShoppingCart, Search, Plus, Trash2, CreditCard, Banknote } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

export default function PDVPage() {
    const router = useRouter();
    const [loading, setLoading] = React.useState(true);
    const [caixaAberto, setCaixaAberto] = React.useState(false);
    const [showCaixaModal, setShowCaixaModal] = React.useState(false);

    // Estado da venda
    const [itens, setItens] = React.useState<any[]>([]);
    const [busca, setBusca] = React.useState("");

    React.useEffect(() => {
        checkCaixa();
    }, []);

    const checkCaixa = async () => {
        try {
            const response = await api.getCaixaAtual() as any;
            if (response && response.id) {
                setCaixaAberto(true);
                setShowCaixaModal(false);
            } else {
                setCaixaAberto(false);
                setShowCaixaModal(true);
            }
        } catch (error: any) {
            // Se der 404, é porque não tem caixa aberto
            if (error.response?.status === 404 || error.status === 404) {
                setCaixaAberto(false);
                setShowCaixaModal(true);
            } else {
                console.error("Erro ao verificar caixa:", error);
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Carregando PDV...</div>;
    }

    return (
        <div className="flex h-screen flex-col bg-background">
            {/* Header Simplificado */}
            <header className="flex h-14 items-center justify-between border-b px-4 bg-primary text-primary-foreground">
                <div className="flex items-center gap-2">
                    <ShoppingCart className="h-6 w-6" />
                    <span className="font-bold text-lg">ZeroTec PDV</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm">Operador: Admin</span>
                    <Button variant="secondary" size="sm" onClick={() => router.push('/dashboard')}>
                        Sair (ESC)
                    </Button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Área Esquerda: Lista de Produtos */}
                <div className="flex flex-1 flex-col p-4 gap-4">
                    {/* Barra de Busca */}
                    <Card>
                        <CardContent className="p-4 flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar produto (Código de barras ou Nome)... [F2]"
                                    className="pl-10 text-lg h-12"
                                    value={busca}
                                    onChange={(e) => setBusca(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <Button size="lg" className="h-12 px-8">
                                Adicionar
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Lista de Itens */}
                    <Card className="flex-1 overflow-hidden flex flex-col">
                        <div className="bg-muted p-3 font-medium grid grid-cols-12 gap-4 text-sm">
                            <div className="col-span-1">#</div>
                            <div className="col-span-5">Produto</div>
                            <div className="col-span-2 text-right">Qtd</div>
                            <div className="col-span-2 text-right">Unitário</div>
                            <div className="col-span-2 text-right">Total</div>
                        </div>
                        <div className="flex-1 overflow-auto p-2">
                            {itens.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center text-muted-foreground opacity-50">
                                    <ShoppingCart className="h-16 w-16 mb-4" />
                                    <p className="text-xl">Caixa Livre</p>
                                    <p className="text-sm">Aguardando produtos...</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {/* Lista de itens virá aqui */}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Área Direita: Totais e Ações */}
                <div className="w-[400px] bg-muted/30 border-l p-4 flex flex-col gap-4">
                    <Card className="flex-1 flex flex-col">
                        <CardContent className="flex-1 p-6 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>R$ 0,00</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Descontos</span>
                                    <span className="text-red-500">- R$ 0,00</span>
                                </div>
                                <div className="border-t pt-4 mt-4">
                                    <div className="flex justify-between items-end">
                                        <span className="font-bold text-xl">Total a Pagar</span>
                                        <span className="font-bold text-4xl text-primary">R$ 0,00</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" className="h-20 flex flex-col gap-1" disabled>
                            <Trash2 className="h-6 w-6" />
                            Cancelar Item
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col gap-1 text-red-600 hover:text-red-700" disabled>
                            <AlertCircle className="h-6 w-6" />
                            Cancelar Venda
                        </Button>
                        <Button className="h-24 col-span-2 bg-green-600 hover:bg-green-700 flex flex-col gap-1 text-lg" disabled>
                            <Banknote className="h-8 w-8" />
                            Finalizar Venda (F10)
                        </Button>
                    </div>
                </div>
            </div>

            {/* Modal de Caixa Fechado */}
            <Dialog open={showCaixaModal} onOpenChange={setShowCaixaModal}>
                <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-6 w-6" />
                            Caixa Fechado
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            Para realizar vendas no PDV, é necessário abrir o caixa primeiro.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center justify-center py-6">
                        <div className="bg-red-100 p-4 rounded-full">
                            <ShoppingCart className="h-12 w-12 text-red-600 opacity-50" />
                        </div>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button variant="outline" onClick={() => router.push('/dashboard')}>
                            Voltar ao Dashboard
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => router.push('/caixa/abrir')}>
                            Abrir Caixa Agora
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
