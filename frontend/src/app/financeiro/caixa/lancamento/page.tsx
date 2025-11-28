"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { ArrowLeft, Save, Loader2, DollarSign, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Categoria {
    id: number;
    nome: string;
    tipo: 'receita' | 'despesa';
}

interface ContaBancaria {
    id: number;
    banco: string;
    agencia: string;
    conta: string;
    saldo_atual: number;
}

export default function LancamentoCaixaPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = React.useState(false);
    const [categorias, setCategorias] = React.useState<Categoria[]>([]);
    const [contas, setContas] = React.useState<ContaBancaria[]>([]);

    const [formData, setFormData] = React.useState({
        tipo: "entrada",
        data: format(new Date(), "yyyy-MM-dd"),
        valor: "",
        categoria: "",
        conta_bancaria: "",
        descricao: "",
        observacoes: "",
    });

    React.useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [categoriasData, contasData] = await Promise.all([
                api.getCategoriasFinanceiras(),
                api.getContasBancarias(),
            ]);
            setCategorias((categoriasData as any).results || categoriasData);
            setContas((contasData as any).results || contasData);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            toast({
                title: "Erro",
                description: "Não foi possível carregar as categorias e contas.",
                variant: "destructive",
            });
        }
    };

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
                valor: parseFloat(formData.valor),
                categoria: parseInt(formData.categoria),
                conta_bancaria: formData.conta_bancaria ? parseInt(formData.conta_bancaria) : null,
            };

            await api.createFluxoCaixa(payload);

            toast({
                title: "Sucesso",
                description: "Lançamento realizado com sucesso!",
            });

            router.push("/financeiro/fluxo-caixa");
        } catch (error) {
            console.error("Erro ao criar lançamento:", error);
            toast({
                title: "Erro",
                description: "Erro ao realizar lançamento. Verifique os dados.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredCategorias = categorias.filter(c =>
        formData.tipo === 'entrada' ? c.tipo === 'receita' : c.tipo === 'despesa'
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Lançamento de Caixa</h1>
                        <p className="text-muted-foreground">Registre entradas e saídas manuais (Sangria/Suprimento)</p>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Dados do Lançamento</CardTitle>
                            <CardDescription>
                                Preencha os dados abaixo para registrar a movimentação.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* Tipo de Movimentação */}
                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    className={`cursor-pointer rounded-lg border-2 p-4 flex flex-col items-center gap-2 transition-all ${formData.tipo === 'entrada' ? 'border-green-500 bg-green-50' : 'border-muted hover:border-green-200'}`}
                                    onClick={() => setFormData(prev => ({ ...prev, tipo: 'entrada', categoria: '' }))}
                                >
                                    <ArrowUpCircle className={`h-8 w-8 ${formData.tipo === 'entrada' ? 'text-green-600' : 'text-muted-foreground'}`} />
                                    <span className={`font-medium ${formData.tipo === 'entrada' ? 'text-green-700' : 'text-muted-foreground'}`}>Entrada (Suprimento)</span>
                                </div>
                                <div
                                    className={`cursor-pointer rounded-lg border-2 p-4 flex flex-col items-center gap-2 transition-all ${formData.tipo === 'saida' ? 'border-red-500 bg-red-50' : 'border-muted hover:border-red-200'}`}
                                    onClick={() => setFormData(prev => ({ ...prev, tipo: 'saida', categoria: '' }))}
                                >
                                    <ArrowDownCircle className={`h-8 w-8 ${formData.tipo === 'saida' ? 'text-red-600' : 'text-muted-foreground'}`} />
                                    <span className={`font-medium ${formData.tipo === 'saida' ? 'text-red-700' : 'text-muted-foreground'}`}>Saída (Sangria)</span>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="data">Data *</Label>
                                    <Input
                                        id="data"
                                        name="data"
                                        type="date"
                                        value={formData.data}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="valor">Valor (R$) *</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="valor"
                                            name="valor"
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            className="pl-8"
                                            value={formData.valor}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="descricao">Descrição *</Label>
                                <Input
                                    id="descricao"
                                    name="descricao"
                                    placeholder="Ex: Suprimento de caixa inicial"
                                    value={formData.descricao}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="categoria">Categoria *</Label>
                                    <Select
                                        value={formData.categoria}
                                        onValueChange={(value) => handleSelectChange("categoria", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione uma categoria" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredCategorias.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                                    {cat.nome}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="conta_bancaria">Conta / Caixa</Label>
                                    <Select
                                        value={formData.conta_bancaria}
                                        onValueChange={(value) => handleSelectChange("conta_bancaria", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione a conta" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {contas.map((conta) => (
                                                <SelectItem key={conta.id} value={conta.id.toString()}>
                                                    {conta.banco} - {conta.conta} (R$ {conta.saldo_atual})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="observacoes">Observações</Label>
                                <Textarea
                                    id="observacoes"
                                    name="observacoes"
                                    value={formData.observacoes}
                                    onChange={handleChange}
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <Button type="button" variant="outline" onClick={() => router.back()}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={loading} className={formData.tipo === 'entrada' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Save className="mr-2 h-4 w-4" />
                                    Confirmar Lançamento
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </div>
    );
}
