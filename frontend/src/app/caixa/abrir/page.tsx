/**
 * Abertura de Caixa
 * Page for opening a new cash register session
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DollarSign, Unlock, AlertCircle, ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

export default function AbrirCaixaPage() {
    const router = useRouter();
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [valorInicial, setValorInicial] = React.useState("");
    const [observacoes, setObservacoes] = React.useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Validar valor
            const valor = parseFloat(valorInicial.replace(",", "."));
            if (isNaN(valor) || valor < 0) {
                throw new Error("Valor inicial inválido");
            }

            await api.abrirCaixa({
                valor_inicial: valor,
                observacoes_abertura: observacoes,
            });

            router.push("/pdv");
        } catch (err: any) {
            console.error("Erro ao abrir caixa:", err);
            setError(err.message || "Erro ao abrir caixa. Verifique se você já tem um caixa aberto.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4">
                        <Unlock className="h-8 w-8 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl">Abrir Caixa</CardTitle>
                    <CardDescription>
                        Informe o valor em dinheiro na gaveta para iniciar as operações.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Erro</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="valor">Valor Inicial (R$)</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="valor"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0,00"
                                    className="pl-10 text-lg"
                                    value={valorInicial}
                                    onChange={(e) => setValorInicial(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Conte o dinheiro físico na gaveta antes de confirmar.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="obs">Observações (Opcional)</Label>
                            <Textarea
                                id="obs"
                                placeholder="Ex: Turno da manhã, gaveta 2..."
                                value={observacoes}
                                onChange={(e) => setObservacoes(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Button
                                type="submit"
                                className="w-full bg-green-600 hover:bg-green-700"
                                size="lg"
                                disabled={loading}
                            >
                                {loading ? "Abrindo..." : "Confirmar Abertura"}
                            </Button>
                            <Link href="/caixa">
                                <Button variant="outline" className="w-full" type="button">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Voltar para Histórico
                                </Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
