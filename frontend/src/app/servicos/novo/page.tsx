"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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

export default function NovoServicoPage() {
    const router = useRouter();
    const [loading, setLoading] = React.useState(false);
    const [categorias, setCategorias] = React.useState<Categoria[]>([]);

    // Form State
    const [formData, setFormData] = React.useState({
        nome: "",
        codigo_interno: "",
        categoria: "",
        preco_custo: "",
        preco_venda: "",
        tempo_estimado: "",
        descricao: "",
    });

    React.useEffect(() => {
        async function loadCategorias() {
            try {
                const response = await api.getCategorias() as any;
                // Filter only service categories if possible, or just show all
                const allCats = response.results || response;
                setCategorias(allCats.filter((c: any) => c.tipo === 'servico'));
            } catch (error) {
                console.error("Erro ao carregar categorias:", error);
            }
        }
        loadCategorias();
    }, []);

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
            const payload = {
                ...formData,
                categoria: formData.categoria ? parseInt(formData.categoria) : null,
                preco_custo: parseFloat(formData.preco_custo) || 0,
                preco_venda: parseFloat(formData.preco_venda) || 0,
                tempo_estimado: parseInt(formData.tempo_estimado) || 0,
            };

            await api.createServico(payload);
            router.push("/servicos");
        } catch (error) {
            console.error("Erro ao criar serviço:", error);
            alert("Erro ao criar serviço. Verifique os dados e tente novamente.");
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
                        <h1 className="text-3xl font-bold tracking-tight">Novo Serviço</h1>
                        <p className="text-muted-foreground">Cadastre um novo serviço</p>
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
                                <Label htmlFor="nome">Nome do Serviço *</Label>
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
                                <Label htmlFor="tempo_estimado">Tempo Estimado (minutos)</Label>
                                <Input
                                    id="tempo_estimado"
                                    name="tempo_estimado"
                                    type="number"
                                    value={formData.tempo_estimado}
                                    onChange={handleChange}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Preços e Custos</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="preco_custo">Custo Estimado (R$)</Label>
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

                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Descrição</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                name="descricao"
                                value={formData.descricao}
                                onChange={handleChange}
                                placeholder="Descrição detalhada do serviço..."
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
                        Salvar Serviço
                    </Button>
                </div>
            </form>
        </div>
    );
}
