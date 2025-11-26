"use client";

import * as React from "react";
import { Plus, Edit, Trash2, CheckSquare, GripVertical } from "lucide-react";
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ChecklistItem {
    id: number;
    label: string;
    ordem: number;
    ativo: boolean;
}

export default function ChecklistPage() {
    const [items, setItems] = React.useState<ChecklistItem[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [showModal, setShowModal] = React.useState(false);
    const [editingId, setEditingId] = React.useState<number | null>(null);
    const [formData, setFormData] = React.useState({
        label: "",
        ordem: "",
        ativo: true,
    });

    const fetchItems = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/assistencia/checklist-items/");
            if (response.ok) {
                const data = await response.json();
                setItems(Array.isArray(data) ? data : data.results);
            }
        } catch (error) {
            console.error("Erro ao carregar checklist:", error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchItems();
    }, []);

    const handleSubmit = async () => {
        try {
            const url = editingId
                ? `http://localhost:8000/api/assistencia/checklist-items/${editingId}/`
                : "http://localhost:8000/api/assistencia/checklist-items/";

            const method = editingId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    ordem: parseInt(formData.ordem) || 0,
                }),
            });

            if (response.ok) {
                setShowModal(false);
                fetchItems();
                resetForm();
            } else {
                alert("Erro ao salvar item");
            }
        } catch (error) {
            console.error("Erro:", error);
            alert("Erro ao salvar item");
        }
    };

    const handleEdit = (item: ChecklistItem) => {
        setEditingId(item.id);
        setFormData({
            label: item.label,
            ordem: item.ordem.toString(),
            ativo: item.ativo,
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Tem certeza que deseja excluir este item?")) return;

        try {
            const response = await fetch(`http://localhost:8000/api/assistencia/checklist-items/${id}/`, {
                method: "DELETE",
            });

            if (response.ok) {
                fetchItems();
            } else {
                alert("Erro ao excluir item");
            }
        } catch (error) {
            console.error("Erro:", error);
            alert("Erro ao excluir item");
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            label: "",
            ordem: (items.length + 1).toString(),
            ativo: true,
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Checklist</h1>
                    <p className="text-muted-foreground">
                        Personalize os itens do checklist da OS
                    </p>
                </div>
                <Button onClick={() => { resetForm(); setShowModal(true); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Item
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Itens do Checklist</CardTitle>
                    <CardDescription>
                        Estes itens aparecerão na criação de novas Ordens de Serviço
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded bg-muted text-muted-foreground font-mono text-sm">
                                        {item.ordem}
                                    </div>
                                    <div className="font-medium">{item.label}</div>
                                    {!item.ativo && (
                                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                                            Inativo
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEdit(item)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(item.id)}
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {items.length === 0 && !loading && (
                            <div className="text-center py-8 text-muted-foreground">
                                Nenhum item cadastrado
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Editar Item" : "Novo Item"}</DialogTitle>
                        <DialogDescription>
                            Configure o item do checklist
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="label" className="text-right">
                                Nome do Item
                            </Label>
                            <Input
                                id="label"
                                value={formData.label}
                                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                className="col-span-3"
                                placeholder="Ex: Carregador"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="ordem" className="text-right">
                                Ordem
                            </Label>
                            <Input
                                id="ordem"
                                type="number"
                                value={formData.ordem}
                                onChange={(e) => setFormData({ ...formData, ordem: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="ativo" className="text-right">
                                Ativo
                            </Label>
                            <div className="flex items-center space-x-2 col-span-3">
                                <Switch
                                    id="ativo"
                                    checked={formData.ativo}
                                    onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                                />
                                <Label htmlFor="ativo">Item disponível para uso</Label>
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
