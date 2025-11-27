'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, CreditCard, Banknote, QrCode, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CalculadoraTaxas from './_components/CalculadoraTaxas';

interface FormaRecebimento {
    id: number;
    nome: string;
    tipo: string;
    tipo_display: string;
    taxa_percentual: number;
    taxa_fixa: number;
    permite_parcelamento: boolean;
    max_parcelas: number;
    ativo: boolean;
}

export default function FormasRecebimentoPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [formas, setFormas] = useState<FormaRecebimento[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFormas();
    }, []);

    const loadFormas = async () => {
        try {
            const data = await api.getFormasRecebimento();
            setFormas(data as FormaRecebimento[]);
        } catch (error) {
            console.error('Erro ao carregar formas de recebimento:', error);
            toast({
                title: 'Erro',
                description: 'Não foi possível carregar as formas de recebimento.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir esta forma de recebimento?')) return;

        try {
            await api.deleteFormaRecebimento(id);
            toast({
                title: 'Sucesso',
                description: 'Forma de recebimento excluída com sucesso.',
            });
            loadFormas();
        } catch (error) {
            console.error('Erro ao excluir:', error);
            toast({
                title: 'Erro',
                description: 'Não foi possível excluir a forma de recebimento.',
                variant: 'destructive',
            });
        }
    };

    const getIcon = (tipo: string) => {
        switch (tipo) {
            case 'dinheiro':
                return <Banknote className="h-4 w-4" />;
            case 'cartao_credito':
            case 'cartao_debito':
                return <CreditCard className="h-4 w-4" />;
            case 'pix':
                return <QrCode className="h-4 w-4" />;
            case 'boleto':
                return <FileText className="h-4 w-4" />;
            default:
                return <CreditCard className="h-4 w-4" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Formas de Recebimento</h1>
                    <p className="text-muted-foreground">
                        Gerencie as formas de pagamento aceitas e suas taxas.
                    </p>
                </div>
                <Button onClick={() => router.push('/financeiro/formas-recebimento/novo')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Forma
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Formas Cadastradas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Taxas</TableHead>
                                        <TableHead>Parcelamento</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8">
                                                Carregando...
                                            </TableCell>
                                        </TableRow>
                                    ) : formas.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                Nenhuma forma de recebimento cadastrada.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        formas.map((forma) => (
                                            <TableRow key={forma.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        {getIcon(forma.tipo)}
                                                        {forma.nome}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{forma.tipo_display}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col text-sm">
                                                        {forma.taxa_percentual > 0 && (
                                                            <span>{forma.taxa_percentual}%</span>
                                                        )}
                                                        {forma.taxa_fixa > 0 && (
                                                            <span>+ R$ {forma.taxa_fixa.toFixed(2)}</span>
                                                        )}
                                                        {forma.taxa_percentual === 0 && forma.taxa_fixa === 0 && (
                                                            <span className="text-muted-foreground">Isento</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {forma.permite_parcelamento ? (
                                                        <Badge variant="outline">Até {forma.max_parcelas}x</Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm">À vista</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={forma.ativo ? 'default' : 'secondary'}>
                                                        {forma.ativo ? 'Ativo' : 'Inativo'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => router.push(`/financeiro/formas-recebimento/${forma.id}/editar`)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive hover:text-destructive"
                                                            onClick={() => handleDelete(forma.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <CalculadoraTaxas />
                </div>
            </div>
        </div>
    );
}
