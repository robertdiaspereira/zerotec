"use client";

import * as React from "react";
import { Plus, Edit, Trash2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface FormaPagamento {
    id: number;
    nome: string;
    tipo: string;
    taxa_percentual: string;
    taxa_fixa: string;
    permite_parcelamento: boolean;
    max_parcelas: number;
    ativo: boolean;
}

export default function FormasPagamentoPage() {
    const [formas, setFormas] = React.useState<FormaPagamento[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [showModal, setShowModal] = React.useState(false);
    const [editingId, setEditingId] = React.useState<number | null>(null);
    const [formData, setFormData] = React.useState({
        nome: "",
        tipo: "dinheiro",
        taxa_percentual: "0",
        taxa_fixa: "0",
        permite_parcelamento: false,
        max_parcelas: "1",
        ativo: true,
    });

    const fetchFormas = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/financeiro/formas-pagamento/");
            if (response.ok) {
                const data = await response.json();
                setFormas(Array.isArray(data) ? data : data.results);
            }
        } catch (error) {
            console.error("Erro ao carregar formas de pagamento:", error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchFormas();
    }, []);

    const handleSubmit = async () => {
        try {
            const url = editingId
                ? `http://localhost:8000/api/financeiro/formas-pagamento/${editingId}/`
                : "http://localhost:8000/api/financeiro/formas-pagamento/";

            const method = editingId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    taxa_percentual: parseFloat(formData.taxa_percentual) || 0,
                    taxa_fixa: parseFloat(formData.taxa_fixa) || 0,
                    max_parcelas: parseInt(formData.max_parcelas) || 1,
                }),
            });

            if (response.ok) {
                setShowModal(false);
                fetchFormas();
                resetForm();
            } else {
                alert("Erro ao salvar forma de pagamento");
            }
        } catch (error) {
            console.error("Erro:", error);
            alert("Erro ao salvar forma de pagamento");
        }
    };

    const handleEdit = (forma: FormaPagamento) => {
        setEditingId(forma.id);
        setFormData({
            nome: forma.nome,
            tipo: forma.tipo,
            taxa_percentual: forma.taxa_percentual,
            taxa_fixa: forma.taxa_fixa,
            permite_parcelamento: forma.permite_parcelamento,
            max_parcelas: forma.max_parcelas.toString(),
            ativo: forma.ativo,
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Tem certeza que deseja excluir esta forma de pagamento?")) return;

        try {
            const response = await fetch(`http://localhost:8000/api/financeiro/formas-pagamento/${id}/`, {
                method: "DELETE",
            });

            if (response.ok) {
                fetchFormas();
            } else {
                alert("Erro ao excluir forma de pagamento");
            }
        } catch (error) {
            console.error("Erro:", error);
            alert("Erro ao excluir forma de pagamento");
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            nome: "",
            tipo: "dinheiro",
            taxa_percentual: "0",
            taxa_fixa: "0",
            permite_parcelamento: false,
            max_parcelas: "1",
            ativo: true,
        });
    };

    const getTipoLabel = (tipo: string) => {
        const tipos: Record<string, string> = {
            dinheiro: "Dinheiro",
            cartao_credito: "Cartão de Crédito",
            cartao_debito: "Cartão de Débito",
            pix: "PIX",
            boleto: "Boleto",
            transferencia: "Transferência",
        };
        return tipos[tipo] || tipo;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Formas de Pagamento</h1>
                    <p className="text-muted-foreground">
                        Gerencie os métodos de pagamento aceitos
                    </p>
                </div>
                <Button onClick={() => { resetForm(); setShowModal(true); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Forma de Pagamento
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Métodos Cadastrados</CardTitle>
                    <CardDescription>
                        Configure taxas e parcelamento para cada método
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead className="text-right">Taxa (%)</TableHead>
                                <TableHead className="text-right">Taxa Fixa (R$)</TableHead>
                                <TableHead className="text-center">Parcelamento</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {formas.map((forma) => (
                                <TableRow key={forma.id}>
                                    <TableCell className="font-medium">{forma.nome}</TableCell>
                                    <TableCell>{getTipoLabel(forma.tipo)}</TableCell>
                                    <TableCell className="text-right">
                                        {parseFloat(forma.taxa_percentual) > 0 ? `${forma.taxa_percentual}%` : "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {parseFloat(forma.taxa_fixa) > 0
                                            ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(parseFloat(forma.taxa_fixa))
                                            : "-"}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {forma.permite_parcelamento ? `Até ${forma.max_parcelas}x` : "Não"}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs ${forma.ativo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                            {forma.ativo ? "Ativo" : "Inativo"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(forma)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(forma.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {formas.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        Nenhuma forma de pagamento cadastrada
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Editar Forma de Pagamento" : "Nova Forma de Pagamento"}</DialogTitle>
                        <DialogDescription>
                            Configure as taxas e opções de parcelamento
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nome" className="text-right">
                                Nome
                            </Label>
                            <Input
                                id="nome"
                                value={formData.nome}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                className="col-span-3"
                                placeholder="Ex: Cartão Visa Crédito"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="tipo" className="text-right">
                                Tipo
                            </Label>
                            <Select
                                value={formData.tipo}
                                onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                                    <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                                    <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                                    <SelectItem value="pix">PIX</SelectItem>
                                    <SelectItem value="boleto">Boleto</SelectItem>
                                    <SelectItem value="transferencia">Transferência</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="taxa_percentual" className="text-right">
                                Taxa (%)
                            </Label>
                            <Input
                                id="taxa_percentual"
                                type="number"
                                step="0.01"
                                value={formData.taxa_percentual}
                                onChange={(e) => setFormData({ ...formData, taxa_percentual: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="taxa_fixa" className="text-right">
                                Taxa Fixa (R$)
                            </Label>
                            <Input
                                id="taxa_fixa"
                                type="number"
                                step="0.01"
                                value={formData.taxa_fixa}
                                onChange={(e) => setFormData({ ...formData, taxa_fixa: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Parcelamento</Label>
                            <div className="col-span-3 flex items-center space-x-2">
                                <Switch
                                    id="permite_parcelamento"
                                    checked={formData.permite_parcelamento}
                                    onCheckedChange={(checked) => setFormData({ ...formData, permite_parcelamento: checked })}
                                />
                                <Label htmlFor="permite_parcelamento">Permitir parcelamento</Label>
                            </div>
                        </div>
                        {formData.permite_parcelamento && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="max_parcelas" className="text-right">
                                    Máx. Parcelas
                                </Label>
                                <Input
                                    id="max_parcelas"
                                    type="number"
                                    min="1"
                                    max="12"
                                    value={formData.max_parcelas}
                                    onChange={(e) => setFormData({ ...formData, max_parcelas: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                        )}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Status</Label>
                            <div className="col-span-3 flex items-center space-x-2">
                                <Switch
                                    id="ativo"
                                    checked={formData.ativo}
                                    onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                                />
                                <Label htmlFor="ativo">Ativo</Label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowModal(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSubmit}>Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
