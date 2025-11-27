'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';

interface FormaRecebimentoFormProps {
    id?: number;
}

export default function FormaRecebimentoForm({ id }: FormaRecebimentoFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(!!id);

    const [formData, setFormData] = useState({
        nome: '',
        tipo: 'dinheiro',
        operadora: '',
        taxa_percentual: 0,
        taxa_fixa: 0,
        permite_parcelamento: false,
        max_parcelas: 1,
        taxa_parcelado_2x: 0,
        taxa_parcelado_3x: 0,
        taxa_parcelado_4_6x: 0,
        taxa_parcelado_7_12x: 0,
        dias_recebimento: 0,
        ativo: true,
    });

    useEffect(() => {
        if (id) {
            loadForma(id);
        }
    }, [id]);

    const loadForma = async (id: number) => {
        try {
            const data: any = await api.getFormaRecebimento(id);
            setFormData({
                nome: data.nome,
                tipo: data.tipo,
                operadora: data.operadora || '',
                taxa_percentual: Number(data.taxa_percentual),
                taxa_fixa: Number(data.taxa_fixa),
                permite_parcelamento: data.permite_parcelamento,
                max_parcelas: data.max_parcelas,
                taxa_parcelado_2x: Number(data.taxa_parcelado_2x || 0),
                taxa_parcelado_3x: Number(data.taxa_parcelado_3x || 0),
                taxa_parcelado_4_6x: Number(data.taxa_parcelado_4_6x || 0),
                taxa_parcelado_7_12x: Number(data.taxa_parcelado_7_12x || 0),
                dias_recebimento: data.dias_recebimento,
                ativo: data.ativo,
            });
        } catch (error) {
            console.error('Erro ao carregar forma:', error);
            toast({
                title: 'Erro',
                description: 'Não foi possível carregar os dados.',
                variant: 'destructive',
            });
            router.push('/financeiro/formas-recebimento');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (id) {
                await api.updateFormaRecebimento(id, formData);
                toast({
                    title: 'Sucesso',
                    description: 'Forma de recebimento atualizada com sucesso.',
                });
            } else {
                await api.createFormaRecebimento(formData);
                toast({
                    title: 'Sucesso',
                    description: 'Forma de recebimento criada com sucesso.',
                });
            }
            router.push('/financeiro/formas-recebimento');
        } catch (error: any) {
            console.error('Erro ao salvar:', error);
            const errorMessage = error?.message || error?.detail || 'Não foi possível salvar os dados.';
            toast({
                title: 'Erro',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold">
                    {id ? 'Editar Forma de Recebimento' : 'Nova Forma de Recebimento'}
                </h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Dados Básicos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome</Label>
                            <Input
                                id="nome"
                                value={formData.nome}
                                onChange={(e) => handleChange('nome', e.target.value)}
                                placeholder="Ex: Cartão de Crédito Visa"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="tipo">Tipo</Label>
                                <Select
                                    value={formData.tipo}
                                    onValueChange={(value) => handleChange('tipo', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                                        <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                                        <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                                        <SelectItem value="pix">PIX</SelectItem>
                                        <SelectItem value="boleto">Boleto</SelectItem>
                                        <SelectItem value="transferencia">Transferência</SelectItem>
                                        <SelectItem value="cheque">Cheque</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="operadora">Operadora (Opcional)</Label>
                                <Input
                                    id="operadora"
                                    value={formData.operadora}
                                    onChange={(e) => handleChange('operadora', e.target.value)}
                                    placeholder="Ex: Cielo, Stone"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-4">
                            <Checkbox
                                id="ativo"
                                checked={formData.ativo}
                                onCheckedChange={(checked) => handleChange('ativo', checked)}
                            />
                            <Label htmlFor="ativo">Ativo</Label>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Taxas e Prazos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="taxa_percentual">Taxa Padrão (%)</Label>
                                <Input
                                    id="taxa_percentual"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.taxa_percentual}
                                    onChange={(e) => handleChange('taxa_percentual', Number(e.target.value))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="taxa_fixa">Taxa Fixa (R$)</Label>
                                <Input
                                    id="taxa_fixa"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.taxa_fixa}
                                    onChange={(e) => handleChange('taxa_fixa', Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dias_recebimento">Dias para Recebimento</Label>
                            <Input
                                id="dias_recebimento"
                                type="number"
                                min="0"
                                value={formData.dias_recebimento}
                                onChange={(e) => handleChange('dias_recebimento', Number(e.target.value))}
                                helpText="0 = Recebimento imediato (D+0)"
                            />
                            <p className="text-xs text-muted-foreground">
                                Quantos dias para o dinheiro cair na conta (D+X)
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Parcelamento</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="permite_parcelamento"
                                checked={formData.permite_parcelamento}
                                onCheckedChange={(checked) => handleChange('permite_parcelamento', checked)}
                            />
                            <Label htmlFor="permite_parcelamento">Permite Parcelamento</Label>
                        </div>

                        {formData.permite_parcelamento && (
                            <div className="space-y-4 pt-4 border-t">
                                <div className="w-1/3">
                                    <Label htmlFor="max_parcelas">Máximo de Parcelas</Label>
                                    <Input
                                        id="max_parcelas"
                                        type="number"
                                        min="1"
                                        max="18"
                                        value={formData.max_parcelas}
                                        onChange={(e) => handleChange('max_parcelas', Number(e.target.value))}
                                    />
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="taxa_2x">Taxa 2x (%)</Label>
                                        <Input
                                            id="taxa_2x"
                                            type="number"
                                            step="0.01"
                                            value={formData.taxa_parcelado_2x}
                                            onChange={(e) => handleChange('taxa_parcelado_2x', Number(e.target.value))}
                                            placeholder="Opcional"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="taxa_3x">Taxa 3x (%)</Label>
                                        <Input
                                            id="taxa_3x"
                                            type="number"
                                            step="0.01"
                                            value={formData.taxa_parcelado_3x}
                                            onChange={(e) => handleChange('taxa_parcelado_3x', Number(e.target.value))}
                                            placeholder="Opcional"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="taxa_4_6x">Taxa 4-6x (%)</Label>
                                        <Input
                                            id="taxa_4_6x"
                                            type="number"
                                            step="0.01"
                                            value={formData.taxa_parcelado_4_6x}
                                            onChange={(e) => handleChange('taxa_parcelado_4_6x', Number(e.target.value))}
                                            placeholder="Opcional"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="taxa_7_12x">Taxa 7-12x (%)</Label>
                                        <Input
                                            id="taxa_7_12x"
                                            type="number"
                                            step="0.01"
                                            value={formData.taxa_parcelado_7_12x}
                                            onChange={(e) => handleChange('taxa_parcelado_7_12x', Number(e.target.value))}
                                            placeholder="Opcional"
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Se deixar as taxas específicas zeradas, será usada a taxa padrão.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                >
                    Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar Forma de Recebimento
                </Button>
            </div>
        </form>
    );
}
