"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ArrowLeft,
    Save,
    Loader2,
    PackageCheck,
    AlertCircle,
    FileText
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ItemRecebimento {
    item_pedido_id: number;
    produto_nome: string;
    quantidade_pedida: number;
    quantidade_recebida_anterior: number;
    quantidade_receber: number;
    lote: string;
    data_validade: string;
    conferido: boolean;
}

export default function RecebimentoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [pedido, setPedido] = React.useState<any>(null);
    const [itensRecebimento, setItensRecebimento] = React.useState<ItemRecebimento[]>([]);
    const [notaFiscal, setNotaFiscal] = React.useState("");
    const [observacoes, setObservacoes] = React.useState("");

    React.useEffect(() => {
        loadPedido();
    }, [id]);

    const loadPedido = async () => {
        try {
            setLoading(true);
            const data = await api.getPedidoCompra(parseInt(id));
            setPedido(data);

            // Inicializar itens de recebimento
            const itens: ItemRecebimento[] = data.itens?.map((item: any) => ({
                item_pedido_id: item.id,
                produto_nome: item.produto?.nome || "-",
                quantidade_pedida: parseFloat(item.quantidade_pedida),
                quantidade_recebida_anterior: parseFloat(item.quantidade_recebida || 0),
                quantidade_receber: parseFloat(item.quantidade_pedida) - parseFloat(item.quantidade_recebida || 0),
                lote: "",
                data_validade: "",
                conferido: false,
            })) || [];

            setItensRecebimento(itens);
        } catch (error) {
            console.error("Erro ao carregar pedido:", error);
            toast({
                title: "Erro",
                description: "Não foi possível carregar os detalhes do pedido.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateItem = (index: number, field: string, value: any) => {
        const novosItens = [...itensRecebimento];
        novosItens[index] = {
            ...novosItens[index],
            [field]: value,
        };
        setItensRecebimento(novosItens);
    };

    const handleReceberTudo = () => {
        const novosItens = itensRecebimento.map(item => ({
            ...item,
            quantidade_receber: item.quantidade_pedida - item.quantidade_recebida_anterior,
            conferido: true,
        }));
        setItensRecebimento(novosItens);
    };

    const handleSubmit = async () => {
        if (!notaFiscal) {
            toast({
                title: "Atenção",
                description: "Informe o número da nota fiscal.",
                variant: "destructive",
            });
            return;
        }

        const itensParaReceber = itensRecebimento.filter(item => item.quantidade_receber > 0);

        if (itensParaReceber.length === 0) {
            toast({
                title: "Atenção",
                description: "Informe a quantidade a receber para pelo menos um item.",
                variant: "destructive",
            });
            return;
        }

        // Validar quantidades
        for (const item of itensParaReceber) {
            const totalRecebido = item.quantidade_recebida_anterior + item.quantidade_receber;
            if (totalRecebido > item.quantidade_pedida) {
                toast({
                    title: "Atenção",
                    description: `A quantidade a receber de "${item.produto_nome}" excede a quantidade pedida.`,
                    variant: "destructive",
                });
                return;
            }
        }

        try {
            setSaving(true);

            const payload = {
                pedido_compra: parseInt(id),
                nota_fiscal: notaFiscal,
                observacoes: observacoes,
                itens: itensParaReceber.map(item => ({
                    item_pedido: item.item_pedido_id,
                    quantidade: item.quantidade_receber,
                    lote: item.lote || "",
                    data_validade: item.data_validade || null,
                    conferido: item.conferido,
                })),
            };

            await api.createRecebimento(payload);

            toast({
                title: "Sucesso",
                description: "Mercadoria recebida com sucesso! O estoque foi atualizado.",
            });

            router.push(`/compras/${id}`);
        } catch (error: any) {
            console.error("Erro ao receber mercadoria:", error);
            toast({
                title: "Erro",
                description: error?.message || "Não foi possível registrar o recebimento.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!pedido) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <p className="text-muted-foreground">Pedido não encontrado.</p>
                <Button onClick={() => router.push("/compras")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Button>
            </div>
        );
    }

    if (pedido.status === "recebido") {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <PackageCheck className="h-16 w-16 text-green-500" />
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Pedido já recebido</h2>
                    <p className="text-muted-foreground mt-2">
                        Este pedido já foi totalmente recebido.
                    </p>
                </div>
                <Button onClick={() => router.push(`/compras/${id}`)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Ver Detalhes
                </Button>
            </div>
        );
    }

    const totalItens = itensRecebimento.reduce((sum, item) => sum + item.quantidade_receber, 0);
    const itensConferidos = itensRecebimento.filter(item => item.conferido).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/compras/${id}`)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Receber Mercadoria</h1>
                        <p className="text-muted-foreground">
                            Pedido {pedido.numero} - {pedido.fornecedor?.razao_social}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleReceberTudo}>
                        Receber Tudo
                    </Button>
                    <Button onClick={handleSubmit} disabled={saving}>
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processando...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Confirmar Recebimento
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Alerta */}
            <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                    <div className="flex gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900">
                            <p className="font-medium">Atenção ao receber mercadorias:</p>
                            <ul className="mt-2 space-y-1 list-disc list-inside">
                                <li>Confira a quantidade recebida com a nota fiscal</li>
                                <li>Verifique a qualidade dos produtos</li>
                                <li>Registre lote e validade quando aplicável</li>
                                <li>O estoque será atualizado automaticamente após confirmar</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Coluna Principal */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Nota Fiscal */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                <CardTitle>Nota Fiscal</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="nota_fiscal">Número da NF *</Label>
                                    <Input
                                        id="nota_fiscal"
                                        value={notaFiscal}
                                        onChange={(e) => setNotaFiscal(e.target.value)}
                                        placeholder="Ex: 12345"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Data de Recebimento</Label>
                                    <Input
                                        value={new Date().toLocaleDateString("pt-BR")}
                                        disabled
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Itens para Conferência */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Conferência de Itens</CardTitle>
                                <div className="text-sm text-muted-foreground">
                                    {itensConferidos} de {itensRecebimento.length} conferidos
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Produto</TableHead>
                                        <TableHead className="text-center">Pedida</TableHead>
                                        <TableHead className="text-center">Já Recebida</TableHead>
                                        <TableHead className="text-center">A Receber</TableHead>
                                        <TableHead>Lote</TableHead>
                                        <TableHead>Validade</TableHead>
                                        <TableHead className="text-center">OK</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {itensRecebimento.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">
                                                {item.produto_nome}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {item.quantidade_pedida}
                                            </TableCell>
                                            <TableCell className="text-center text-muted-foreground">
                                                {item.quantidade_recebida_anterior}
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max={item.quantidade_pedida - item.quantidade_recebida_anterior}
                                                    step="0.001"
                                                    value={item.quantidade_receber}
                                                    onChange={(e) => handleUpdateItem(index, "quantidade_receber", parseFloat(e.target.value) || 0)}
                                                    className="w-24"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    value={item.lote}
                                                    onChange={(e) => handleUpdateItem(index, "lote", e.target.value)}
                                                    placeholder="Lote"
                                                    className="w-32"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="date"
                                                    value={item.data_validade}
                                                    onChange={(e) => handleUpdateItem(index, "data_validade", e.target.value)}
                                                    className="w-40"
                                                />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Checkbox
                                                    checked={item.conferido}
                                                    onCheckedChange={(checked) => handleUpdateItem(index, "conferido", checked)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Observações */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Observações</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={observacoes}
                                onChange={(e) => setObservacoes(e.target.value)}
                                placeholder="Observações sobre o recebimento (avarias, divergências, etc.)"
                                rows={4}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar - Resumo */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Resumo do Recebimento</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="text-sm text-muted-foreground">Total de Itens</div>
                                <div className="text-2xl font-bold">{itensRecebimento.length}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Quantidade Total</div>
                                <div className="text-2xl font-bold">{totalItens.toFixed(3)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Conferidos</div>
                                <div className="text-2xl font-bold text-green-600">
                                    {itensConferidos}/{itensRecebimento.length}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Ações Automáticas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                                <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <div className="h-2 w-2 rounded-full bg-green-600" />
                                </div>
                                <div>
                                    <div className="font-medium">Atualização de Estoque</div>
                                    <div className="text-muted-foreground">
                                        O estoque será incrementado automaticamente
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <div className="h-2 w-2 rounded-full bg-blue-600" />
                                </div>
                                <div>
                                    <div className="font-medium">Status do Pedido</div>
                                    <div className="text-muted-foreground">
                                        Será atualizado para "Recebido" se tudo for recebido
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="h-5 w-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <div className="h-2 w-2 rounded-full bg-purple-600" />
                                </div>
                                <div>
                                    <div className="font-medium">Registro de Auditoria</div>
                                    <div className="text-muted-foreground">
                                        Ação será registrada no histórico
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
