"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import api from "@/lib/api";

interface Categoria {
    id: number;
    nome: string;
}

export default function EditarProdutoPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = React.useState(false);
    const [fetching, setFetching] = React.useState(true);
    const [categorias, setCategorias] = React.useState<Categoria[]>([]);

    // Form State
    const [formData, setFormData] = React.useState({
        nome: "",
        codigo_interno: "",
        codigo_barras: "",
        tipo: "produto",
        categoria: "",
        preco_custo: "",
        preco_venda: "",
        estoque_minimo: "0",
        estoque_atual: "0",
        unidade_medida: "UN",
        descricao: "",
    });

    React.useEffect(() => {
        async function loadData() {
            try {
                const id = parseInt(params.id as string);
                const [produtoRes, categoriasRes] = await Promise.all([
                    api.getProduto(id),
                    api.getCategorias()
                ]);

                setCategorias(categoriasRes.results || categoriasRes);

                // Populate form
                const produto = produtoRes as any;
                setFormData({
                    nome: produto.nome,
                    codigo_interno: produto.codigo_interno,
                    codigo_barras: produto.codigo_barras || "",
                    tipo: produto.tipo,
                    categoria: produto.categoria ? produto.categoria.toString() : "",
                    preco_custo: produto.preco_custo.toString(),
                    preco_venda: produto.preco_venda.toString(),
                    estoque_minimo: produto.estoque_minimo.toString(),
                    estoque_atual: produto.estoque_atual.toString(),
                    unidade_medida: produto.unidade_medida,
                    descricao: produto.descricao || "",
                });
            } catch (error) {
                console.error("Erro ao carregar dados:", error);
                alert("Erro ao carregar produto");
                router.push("/produtos");
            } finally {
                setFetching(false);
            }
        }
        loadData();
    }, [params.id, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const id = parseInt(params.id as string);
            const payload = {
                ...formData,
                categoria: formData.categoria ? parseInt(formData.categoria) : null,
                preco_custo: parseFloat(formData.preco_custo) || 0,
                preco_venda: parseFloat(formData.preco_venda) || 0,
                estoque_minimo: parseInt(formData.estoque_minimo) || 0,
                // Estoque atual geralmente não é editado diretamente aqui, mas via movimentação
                // Mantemos aqui caso seja um ajuste simples
                estoque_atual: parseInt(formData.estoque_atual) || 0,
            };

            await api.updateProduto(id, payload);
            router.push("/produtos");
        } catch (error) {
            console.error("Erro ao atualizar produto:", error);
            alert("Erro ao atualizar produto. Verifique os dados e tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Editar Produto</h1>
                        <p className="text-muted-foreground">Atualize as informações do produto</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Informações Básicas</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="nome">Nome do Produto *</Label>
                                <Input
                                    id="nome"
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="codigo_interno">Código Interno *</Label>
                                <Input
                                    id="codigo_interno"
                                    name="codigo_interno"
                                    value={formData.codigo_interno}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="codigo_barras">Código de Barras</Label>
                                <Input
                                    id="codigo_barras"
                                    name="codigo_barras"
                                    value={formData.codigo_barras}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="categoria">Categoria</Label>
                                <Select
                                    value={formData.categoria}
                                    onValueChange={(value) => handleSelectChange("categoria", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione uma categoria" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categorias.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                                {cat.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="unidade_medida">Unidade de Medida</Label>
                                <Select
                                    value={formData.unidade_medida}
                                    onValueChange={(value) => handleSelectChange("unidade_medida", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="UN">Unidade (UN)</SelectItem>
                                        <SelectItem value="KG">Quilograma (KG)</SelectItem>
                                        <SelectItem value="LT">Litro (LT)</SelectItem>
                                        <SelectItem value="CX">Caixa (CX)</SelectItem>
                                        <SelectItem value="MT">Metro (MT)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Preços e Custos</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="preco_custo">Preço de Custo (R$)</Label>
                                <Input
                                    id="preco_custo"
                                    name="preco_custo"
                                    type="number"
                                    step="0.01"
                                    value={formData.preco_custo}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="preco_venda">Preço de Venda (R$) *</Label>
                                <Input
                                    id="preco_venda"
                                    name="preco_venda"
                                    type="number"
                                    step="0.01"
                                    value={formData.preco_venda}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Estoque</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="estoque_atual">Estoque Atual</Label>
                                <Input
                                    id="estoque_atual"
                                    name="estoque_atual"
                                    type="number"
                                    value={formData.estoque_atual}
                                    onChange={handleChange}
                                    disabled // Disable direct stock editing to encourage using movements
                                />
                                <p className="text-xs text-muted-foreground">
                                    Para ajustar o estoque, use o módulo de Estoque.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="estoque_minimo">Estoque Mínimo</Label>
                                <Input
                                    id="estoque_minimo"
                                    name="estoque_minimo"
                                    type="number"
                                    value={formData.estoque_minimo}
                                    onChange={handleChange}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Descrição</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                name="descricao"
                                value={formData.descricao}
                                onChange={handleChange}
                                placeholder="Descrição detalhada do produto..."
                                className="h-32"
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-6 flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Alterações
                    </Button>
                </div>
            </form>
        </div>
    );
}
