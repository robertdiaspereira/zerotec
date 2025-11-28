/**
 * Fechamento de Caixa
 * Page for closing an existing cash register session
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Lock, AlertCircle, ArrowLeft, Calculator } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

interface CaixaDetalhes {
    id: number;
    valor_inicial: number;
    total_vendas: number;
    quantidade_vendas: number;
    valor_esperado: number; // Calculado no front ou vindo da API se implementado
}

export default function FecharCaixaPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [loading, setLoading] = React.useState(true);
    const [submitting, setSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [caixa, setCaixa] = React.useState<CaixaDetalhes | null>(null);

    const [valorFinal, setValorFinal] = React.useState("");
    const [observacoes, setObservacoes] = React.useState("");

    React.useEffect(() => {
        async function loadCaixa() {
            try {
                const id = parseInt(params.id);
                // Carregar dados do caixa
                const caixaData = await api.getCaixa(id) as any;

                // Se já estiver fechado, redirecionar
                if (caixaData.status === 'fechado') {
                    router.push('/caixa');
                    return;
                }

                // Carregar vendas para calcular total (se a API de caixa não retornar o total atualizado)
                // Assumindo que a API getCaixa já retorna total_vendas atualizado ou calculamos aqui
                // Para garantir, vamos pegar as estatísticas ou confiar no serializer

                setCaixa({
                    id: caixaData.id,
                    valor_inicial: parseFloat(caixaData.valor_inicial),
                    total_vendas: parseFloat(caixaData.total_vendas || 0),
                    quantidade_vendas: caixaData.quantidade_vendas || 0,
                    valor_esperado: parseFloat(caixaData.valor_inicial) + parseFloat(caixaData.total_vendas || 0)
                });
            } catch (err) {
                console.error("Erro ao carregar caixa:", err);
                setError("Não foi possível carregar os dados do caixa.");
            } finally {
                setLoading(false);
            }
        }
        loadCaixa();
    }, [params.id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!caixa) return;

        setError(null);
        setSubmitting(true);

        try {
            const valor = parseFloat(valorFinal.replace(",", "."));
            if (isNaN(valor) || valor < 0) {
                throw new Error("Valor final inválido");
            }

            await api.fecharCaixa(caixa.id, {
                valor_final: valor,
                observacoes_fechamento: observacoes,
            });

            router.push("/caixa");
        } catch (err: any) {
            console.error("Erro ao fechar caixa:", err);
            setError(err.message || "Erro ao fechar caixa.");
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    if (loading) {
        return <div className="flex justify-center p-8">Carregando...</div>;
    }

    if (!caixa) {
        return <div className="flex justify-center p-8 text-red-500">Caixa não encontrado</div>;
    }

    const valorInformado = parseFloat(valorFinal.replace(",", ".")) || 0;
    const diferenca = valorInformado - caixa.valor_esperado;
    const temDiferenca = Math.abs(diferenca) > 0.01;

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
            <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-red-100 p-3 rounded-full w-fit mb-4">
                        <Lock className="h-8 w-8 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl">Fechar Caixa</CardTitle>
                    <CardDescription>
                        Confira os valores e informe a contagem final.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
                        <div>
                            <p className="text-sm text-muted-foreground">Valor Inicial</p>
                            <p className="font-semibold">{formatCurrency(caixa.valor_inicial)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Total Vendas ({caixa.quantidade_vendas})</p>
                            <p className="font-semibold text-green-600">
                                + {formatCurrency(caixa.total_vendas)}
                            </p>
                        </div>
                        <div className="col-span-2 border-t pt-2 mt-2 flex justify-between items-center">
                            <span className="font-medium">Valor Esperado na Gaveta</span>
                            <span className="text-xl font-bold">{formatCurrency(caixa.valor_esperado)}</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Erro</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="valor">Valor Final (Contagem Física)</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="valor"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0,00"
                                    className={`pl-10 text-lg ${temDiferenca ? (diferenca < 0 ? "border-red-300 focus:ring-red-200" : "border-green-300 focus:ring-green-200") : ""}`}
                                    value={valorFinal}
                                    onChange={(e) => setValorFinal(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>

                            {valorFinal && temDiferenca && (
                                <div className={`text-sm flex items-center gap-1 ${diferenca < 0 ? "text-red-600" : "text-green-600"}`}>
                                    <AlertCircle className="h-3 w-3" />
                                    {diferenca < 0 ? "Falta" : "Sobra"}: {formatCurrency(Math.abs(diferenca))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="obs">Observações</Label>
                            <Textarea
                                id="obs"
                                placeholder="Justifique qualquer diferença de valor..."
                                value={observacoes}
                                onChange={(e) => setObservacoes(e.target.value)}
                                required={temDiferenca} // Obriga observação se houver diferença
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Button
                                type="submit"
                                className="w-full"
                                variant={temDiferenca ? "destructive" : "default"}
                                size="lg"
                                disabled={submitting}
                            >
                                {submitting ? "Fechando..." : "Confirmar Fechamento"}
                            </Button>
                            <Link href="/caixa">
                                <Button variant="outline" className="w-full" type="button">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Cancelar
                                </Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
