"use client";

import * as React from "react";
import { Plus, Search, Edit, Trash2, Wrench } from "lucide-react";
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
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Servico {
    id: number;
    codigo: string;
    descricao: string;
    descricao_detalhada: string;
    valor_padrao: string;
    tempo_estimado: number;
    categoria: string;
    ativo: boolean;
}

export default function ServicosPage() {
    const [servicos, setServicos] = React.useState<Servico[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [showModal, setShowModal] = React.useState(false);
    const [editingId, setEditingId] = React.useState<number | null>(null);
    const [formData, setFormData] = React.useState({
        codigo: "",
        descricao: "",
        descricao_detalhada: "",
        valor_padrao: "",
        tempo_estimado: "",
        categoria: "",
    });

    const fetchServicos = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/assistencia/servicos-template/");
            if (response.ok) {
                const data = await response.json();
                setServicos(Array.isArray(data) ? data : data.results);
            }
        } catch (error) {
            console.error("Erro ao carregar serviços:", error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchServicos();
    }, []);

    const handleSubmit = async () => {
        try {
            const url = editingId
                ? `http://localhost:8000/api/assistencia/servicos-template/${editingId}/`
                : "http://localhost:8000/api/assistencia/servicos-template/";

            const method = editingId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    tempo_estimado: parseInt(formData.tempo_estimado) || 0,
                    valor_padrao: parseFloat(formData.valor_padrao) || 0,
                }),
            });

            if (response.ok) {
                setShowModal(false);
                fetchServicos();
                resetForm();
            } else {
                alert("Erro ao salvar serviço");
            }
        } catch (error) {
            console.error("Erro:", error);
            alert("Erro ao salvar serviço");
        }
    };

    const handleEdit = (servico: Servico) => {
        setEditingId(servico.id);
        setFormData({
            codigo: servico.codigo,
            descricao: servico.descricao,
            descricao_detalhada: servico.descricao_detalhada,
            valor_padrao: servico.valor_padrao,
            tempo_estimado: servico.tempo_estimado?.toString() || "",
            categoria: servico.categoria,
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Tem certeza que deseja excluir este serviço?")) return;

        try {
            const response = await fetch(`http://localhost:8000/api/assistencia/servicos-template/${id}/`, {
                method: "DELETE",
            });

            if (response.ok) {
                fetchServicos();
            } else {
                alert("Erro ao excluir serviço");
            }
        } catch (error) {
            console.error("Erro:", error);
            alert("Erro ao excluir serviço");
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            codigo: "",
            descricao: "",
            descricao_detalhada: "",
            valor_padrao: "",
            tempo_estimado: "",
            categoria: "",
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Serviços</h1>
                    <p className="text-muted-foreground">
                        Gerencie o catálogo de serviços
                    </p>
                </div>
                <Button onClick={() => { resetForm(); setShowModal(true); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Serviço
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Serviços Cadastrados</CardTitle>
                    <CardDescription>
                        Lista de todos os serviços disponíveis para OS
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Categoria</TableHead>
                                <TableHead className="text-right">Valor Padrão</TableHead>
                                <TableHead>Tempo Est.</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {servicos.map((servico) => (
                                <TableRow key={servico.id}>
                                    <TableCell className="font-mono">{servico.codigo}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{servico.descricao}</div>
                                        <div className="text-xs text-muted-foreground truncate max-w-[300px]">
                                            {servico.descricao_detalhada}
                                        </div>
                                    </TableCell>
                                    <TableCell>{servico.categoria}</TableCell>
                                    <TableCell className="text-right">
                                        {new Intl.NumberFormat("pt-BR", {
                                            style: "currency",
                                            currency: "BRL",
                                        }).format(parseFloat(servico.valor_padrao))}
                                    </TableCell>
                                    <TableCell>{servico.tempo_estimado} min</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(servico)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(servico.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {servicos.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Nenhum serviço cadastrado
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
                        <DialogTitle>{editingId ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
                        <DialogDescription>
                            Preencha os dados do serviço abaixo
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="codigo" className="text-right">
                                Código
                            </Label>
                            <Input
                                id="codigo"
                                value={formData.codigo}
                                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                                className="col-span-3"
                                placeholder="Ex: SRV001"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="descricao" className="text-right">
                                Descrição
                            </Label>
                            <Input
                                id="descricao"
                                value={formData.descricao}
                                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                className="col-span-3"
                                placeholder="Ex: Formatação"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="categoria" className="text-right">
                                Categoria
                            </Label>
                            <Select
                                value={formData.categoria}
                                onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="manutencao">Manutenção</SelectItem>
                                    <SelectItem value="reparo">Reparo</SelectItem>
                                    <SelectItem value="instalacao">Instalação</SelectItem>
                                    <SelectItem value="configuracao">Configuração</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="valor" className="text-right">
                                Valor (R$)
                            </Label>
                            <Input
                                id="valor"
                                type="number"
                                step="0.01"
                                value={formData.valor_padrao}
                                onChange={(e) => setFormData({ ...formData, valor_padrao: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="tempo" className="text-right">
                                Tempo (min)
                            </Label>
                            <Input
                                id="tempo"
                                type="number"
                                value={formData.tempo_estimado}
                                onChange={(e) => setFormData({ ...formData, tempo_estimado: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="detalhes" className="text-right">
                                Detalhes
                            </Label>
                            <Textarea
                                id="detalhes"
                                value={formData.descricao_detalhada}
                                onChange={(e) => setFormData({ ...formData, descricao_detalhada: e.target.value })}
                                className="col-span-3"
                                rows={3}
                            />
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
