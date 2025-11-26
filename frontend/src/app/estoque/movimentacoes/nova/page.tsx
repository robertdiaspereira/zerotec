"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowLeft, Save, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

interface Produto {
    id: number;
    nome: string;
    codigo_interno: string;
    estoque_atual: number;
}

export default function NovaMovimentacaoPage() {
    const router = useRouter();
    const [loading, setLoading] = React.useState(false);
    const [produtos, setProdutos] = React.useState<Produto[]>([]);
    const [openProduto, setOpenProduto] = React.useState(false);

    // Form State
    const [produtoSelecionado, setProdutoSelecionado] = React.useState<Produto | null>(null);
    const [tipo, setTipo] = React.useState<"entrada" | "saida">("entrada");
    const [quantidade, setQuantidade] = React.useState("");
    const [motivo, setMotivo] = React.useState("ajuste_estoque");
    const [documento, setDocumento] = React.useState("");
    const [observacoes, setObservacoes] = React.useState("");

    React.useEffect(() => {
        async function loadProdutos() {
            try {
                const response = await api.getProdutos();
                setProdutos(response.results || response);
            } catch (error) {
                console.error("Erro ao carregar produtos:", error);
            }
        }
        loadProdutos();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!produtoSelecionado) {
            alert("Selecione um produto");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                produto: produtoSelecionado.id,
                tipo,
                quantidade: parseFloat(quantidade),
                motivo,
                documento,
                observacoes
            };

            await api.createMovimentacao(payload);
            router.push("/estoque");
        } catch (error) {
            console.error("Erro ao registrar movimentação:", error);
            alert("Erro ao registrar movimentação. Verifique os dados.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Nova Movimentação</h1>
                        <p className="text-muted-foreground">Registre entrada ou saída manual de estoque</p>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Dados da Movimentação</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label>Produto *</Label>
                                <Popover open={openProduto} onOpenChange={setOpenProduto}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openProduto}
                                            className="w-full justify-between"
                                        >
                                            {produtoSelecionado
                                                ? `${produtoSelecionado.nome} (${produtoSelecionado.codigo_interno})`
                                                : "Selecione um produto..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[400px] p-0">
                                        <Command>
                                            <CommandInput placeholder="Buscar produto..." />
                                            <CommandList>
                                                <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                                                <CommandGroup>
                                                    {produtos.map((produto) => (
                                                        <CommandItem
                                                            key={produto.id}
                                                            value={`${produto.nome} ${produto.codigo_interno}`}
                                                            onSelect={() => {
                                                                setProdutoSelecionado(produto);
                                                                setOpenProduto(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    produtoSelecionado?.id === produto.id
                                                                        ? "opacity-100"
                                                                        : "opacity-0"
                                                                )}
                                                            />
                                                            <div className="flex flex-col">
                                                                <span>{produto.nome}</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    Estoque Atual: {Number(produto.estoque_atual) || 0}
                                                                </span>
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tipo de Movimentação *</Label>
                                    <Select
                                        value={tipo}
                                        onValueChange={(value: "entrada" | "saida") => setTipo(value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="entrada">Entrada (+)</SelectItem>
                                            <SelectItem value="saida">Saída (-)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Quantidade *</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={quantidade}
                                        onChange={(e) => setQuantidade(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Motivo *</Label>
                                <Select value={motivo} onValueChange={setMotivo}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="compra">Compra</SelectItem>
                                        <SelectItem value="venda">Venda</SelectItem>
                                        <SelectItem value="ajuste_estoque">Ajuste de Estoque</SelectItem>
                                        <SelectItem value="perda">Perda/Quebra</SelectItem>
                                        <SelectItem value="devolucao">Devolução</SelectItem>
                                        <SelectItem value="outros">Outros</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Documento (Opcional)</Label>
                                <Input
                                    placeholder="Ex: NF 1234"
                                    value={documento}
                                    onChange={(e) => setDocumento(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Observações (Opcional)</Label>
                                <Input
                                    value={observacoes}
                                    onChange={(e) => setObservacoes(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <Button type="button" variant="outline" onClick={() => router.back()}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Save className="mr-2 h-4 w-4" />
                                    Registrar Movimentação
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
