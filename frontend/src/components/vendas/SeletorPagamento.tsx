'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

interface FormaRecebimento {
    id: number;
    nome: string;
    permite_parcelamento: boolean;
    max_parcelas: number;
}

interface PagamentoInfo {
    formaRecebimentoId: number;
    parcelas: number;
    valor: number;
}

interface SeletorPagamentoProps {
    valorTotal: number;
    onChange: (info: PagamentoInfo | null) => void;
}

export function SeletorPagamento({ valorTotal, onChange }: SeletorPagamentoProps) {
    const [formas, setFormas] = useState<FormaRecebimento[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFormaId, setSelectedFormaId] = useState<string>('');
    const [parcelas, setParcelas] = useState<string>('1');
    const [calculating, setCalculating] = useState(false);
    const [taxaInfo, setTaxaInfo] = useState<any>(null);

    useEffect(() => {
        loadFormas();
    }, []);

    useEffect(() => {
        if (selectedFormaId && valorTotal > 0) {
            calcularTaxas();
            onChange({
                formaRecebimentoId: Number(selectedFormaId),
                parcelas: Number(parcelas),
                valor: valorTotal
            });
        } else {
            onChange(null);
            setTaxaInfo(null);
        }
    }, [selectedFormaId, parcelas, valorTotal]);

    const loadFormas = async () => {
        try {
            const data: any = await api.getFormasRecebimentoAtivas();
            setFormas(data);
        } catch (error) {
            console.error('Erro ao carregar formas:', error);
        } finally {
            setLoading(false);
        }
    };

    const calcularTaxas = async () => {
        if (!selectedFormaId) return;

        setCalculating(true);
        try {
            const data = await api.calcularTaxa(
                Number(selectedFormaId),
                valorTotal,
                Number(parcelas)
            );
            setTaxaInfo(data);
        } catch (error) {
            console.error('Erro ao calcular taxas:', error);
        } finally {
            setCalculating(false);
        }
    };

    const selectedForma = formas.find(f => f.id.toString() === selectedFormaId);

    if (loading) {
        return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Carregando formas...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Forma de Pagamento</Label>
                <Select value={selectedFormaId} onValueChange={setSelectedFormaId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione a forma de pagamento" />
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

            {selectedForma && selectedForma.permite_parcelamento && (
                <div className="space-y-2">
                    <Label>Parcelamento</Label>
                    <Select value={parcelas} onValueChange={setParcelas}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">1x (À vista)</SelectItem>
                            {Array.from({ length: selectedForma.max_parcelas - 1 }, (_, i) => i + 2).map((p) => (
                                <SelectItem key={p} value={p.toString()}>
                                    {p}x de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotal / p)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {taxaInfo && (
                <div className="rounded-md bg-muted p-3 text-sm space-y-1">
                    <div className="flex justify-between">
                        <span>Valor Líquido a Receber:</span>
                        <span className="font-medium text-green-600">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(taxaInfo.valor_liquido)}
                        </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Taxas ({taxaInfo.taxa_percentual}% + R$ {taxaInfo.taxa_fixa}):</span>
                        <span>- {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(taxaInfo.taxa_total)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground pt-1">
                        Previsão de recebimento: {taxaInfo.dias_recebimento} dias
                    </div>
                </div>
            )}
        </div>
    );
}
