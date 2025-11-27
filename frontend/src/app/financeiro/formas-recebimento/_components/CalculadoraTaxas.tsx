'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calculator, Loader2 } from 'lucide-react';

interface FormaRecebimento {
    id: number;
    nome: string;
    permite_parcelamento: boolean;
    max_parcelas: number;
}

export default function CalculadoraTaxas() {
    const [formas, setFormas] = useState<FormaRecebimento[]>([]);
    const [loading, setLoading] = useState(false);
    const [calculating, setCalculating] = useState(false);

    const [selectedForma, setSelectedForma] = useState<string>('');
    const [valor, setValor] = useState<string>('');
    const [parcelas, setParcelas] = useState<string>('1');

    const [resultado, setResultado] = useState<any>(null);

    useEffect(() => {
        loadFormas();
    }, []);

    const loadFormas = async () => {
        try {
            const data: any = await api.getFormasRecebimentoAtivas();
            setFormas(data);
        } catch (error) {
            console.error('Erro ao carregar formas:', error);
        }
    };

    const handleCalcular = async () => {
        if (!selectedForma || !valor) return;

        setCalculating(true);
        try {
            const data = await api.calcularTaxa(
                Number(selectedForma),
                Number(valor),
                Number(parcelas)
            );
            setResultado(data);
        } catch (error) {
            console.error('Erro ao calcular:', error);
        } finally {
            setCalculating(false);
        }
    };

    const getFormaSelecionada = () => {
        return formas.find(f => f.id.toString() === selectedForma);
    };

    const forma = getFormaSelecionada();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Simulador de Taxas
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Forma de Pagamento</Label>
                    <Select value={selectedForma} onValueChange={setSelectedForma}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            {formas.map((f) => (
                                <SelectItem key={f.id} value={f.id.toString()}>
                                    {f.nome}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Valor (R$)</Label>
                        <Input
                            type="number"
                            step="0.01"
                            value={valor}
                            onChange={(e) => setValor(e.target.value)}
                            placeholder="0,00"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Parcelas</Label>
                        <Select
                            value={parcelas}
                            onValueChange={setParcelas}
                            disabled={!forma?.permite_parcelamento}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">1x (À vista)</SelectItem>
                                {forma?.permite_parcelamento && Array.from({ length: forma.max_parcelas - 1 }, (_, i) => i + 2).map((p) => (
                                    <SelectItem key={p} value={p.toString()}>
                                        {p}x
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Button
                    className="w-full"
                    onClick={handleCalcular}
                    disabled={!selectedForma || !valor || calculating}
                >
                    {calculating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Calcular
                </Button>

                {resultado && (
                    <div className="mt-4 p-4 bg-muted rounded-lg space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Valor Bruto:</span>
                            <span className="font-medium">R$ {Number(resultado.valor_bruto).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-destructive">
                            <span>Taxas Total:</span>
                            <span>- R$ {Number(resultado.taxa_total).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-primary font-bold pt-2 border-t">
                            <span>Valor Líquido:</span>
                            <span>R$ {Number(resultado.valor_liquido).toFixed(2)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground pt-2">
                            Taxa aplicada: {resultado.taxa_percentual}% + R$ {Number(resultado.taxa_fixa).toFixed(2)}
                            <br />
                            Recebimento em: {resultado.dias_recebimento} dias
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
