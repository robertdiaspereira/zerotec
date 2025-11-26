"use client";

import * as React from "react";
import { Plus, Edit, Trash2, FileText } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface TermoGarantia {
    id: number;
    tipo: "produto" | "servico";
    titulo: string;
    conteudo: string;
    ativo: boolean;
    padrao: boolean;
}

export default function TermosGarantiaPage() {
    const [termos, setTermos] = React.useState<TermoGarantia[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [showModal, setShowModal] = React.useState(false);
    const [editingId, setEditingId] = React.useState<number | null>(null);
    const [formData, setFormData] = React.useState({
        tipo: "produto" as "produto" | "servico",
        titulo: "",
        conteudo: "",
        ativo: true,
        padrao: false,
    });

    const fetchTermos = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/assistencia/termos-garantia/");
            if (response.ok) {
                const data = await response.json();
                setTermos(Array.isArray(data) ? data : data.results);
            }
        } catch (error) {
            console.error("Erro ao carregar termos:", error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchTermos();
    }, []);

    const handleSubmit = async () => {
        try {
            const url = editingId
                ? `http://localhost:8000/api/assistencia/termos-garantia/${editingId}/`
                : "http://localhost:8000/api/assistencia/termos-garantia/";

            const method = editingId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setShowModal(false);
                fetchTermos();
                resetForm();
            } else {
                alert("Erro ao salvar termo");
            }
        } catch (error) {
            console.error("Erro:", error);
            alert("Erro ao salvar termo");
        }
    };

    const handleEdit = (termo: TermoGarantia) => {
        setEditingId(termo.id);
        setFormData({
            tipo: termo.tipo,
            titulo: termo.titulo,
            conteudo: termo.conteudo,
            ativo: termo.ativo,
            padrao: termo.padrao,
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Tem certeza que deseja excluir este termo?")) return;

        try {
            const response = await fetch(`http://localhost:8000/api/assistencia/termos-garantia/${id}/`, {
                method: "DELETE",
            });

            if (response.ok) {
                fetchTermos();
            } else {
                alert("Erro ao excluir termo");
            }
        } catch (error) {
            console.error("Erro:", error);
            alert("Erro ao excluir termo");
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            tipo: "produto",
            titulo: "",
            conteudo: "",
            ativo: true,
            padrao: false,
        });
    };

    const renderTermosList = (tipo: "produto" | "servico") => {
        const filteredTermos = termos.filter(t => t.tipo === tipo);

        if (filteredTermos.length === 0) {
            return (
                <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                    Nenhum termo de garantia cadastrado para {tipo === "produto" ? "produtos" : "serviços"}
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {filteredTermos.map((termo) => (
                    <Card key={termo.id}>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-base">{termo.titulo}</CardTitle>
                                    {termo.padrao && <Badge variant="secondary">Padrão</Badge>}
                                    {!termo.ativo && <Badge variant="destructive">Inativo</Badge>}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEdit(termo)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(termo.id)}
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
                                {termo.conteudo}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Termos de Garantia</h1>
                    <p className="text-muted-foreground">
                        Configure os termos de garantia para produtos e serviços
                    </p>
                </div>
                <Button onClick={() => { resetForm(); setShowModal(true); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Termo
                </Button>
            </div>

            <Tabs defaultValue="produto" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="produto">Produtos</TabsTrigger>
                    <TabsTrigger value="servico">Serviços</TabsTrigger>
                </TabsList>
                <TabsContent value="produto" className="mt-4">
                    {renderTermosList("produto")}
                </TabsContent>
                <TabsContent value="servico" className="mt-4">
                    {renderTermosList("servico")}
                </TabsContent>
            </Tabs>

            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Editar Termo" : "Novo Termo"}</DialogTitle>
                        <DialogDescription>
                            Configure o texto do termo de garantia
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="tipo" className="text-right">
                                Tipo
                            </Label>
                            <div className="col-span-3 flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id="tipo-produto"
                                        name="tipo"
                                        value="produto"
                                        checked={formData.tipo === "produto"}
                                        onChange={() => setFormData({ ...formData, tipo: "produto" })}
                                        className="cursor-pointer"
                                    />
                                    <Label htmlFor="tipo-produto" className="cursor-pointer">Produto</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id="tipo-servico"
                                        name="tipo"
                                        value="servico"
                                        checked={formData.tipo === "servico"}
                                        onChange={() => setFormData({ ...formData, tipo: "servico" })}
                                        className="cursor-pointer"
                                    />
                                    <Label htmlFor="tipo-servico" className="cursor-pointer">Serviço</Label>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="titulo" className="text-right">
                                Título
                            </Label>
                            <Input
                                id="titulo"
                                value={formData.titulo}
                                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                className="col-span-3"
                                placeholder="Ex: Garantia de 90 dias"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="conteudo" className="text-right mt-2">
                                Conteúdo
                            </Label>
                            <Textarea
                                id="conteudo"
                                value={formData.conteudo}
                                onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                                className="col-span-3 min-h-[200px]"
                                placeholder="Digite o texto do termo de garantia..."
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Opções</Label>
                            <div className="col-span-3 space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="padrao"
                                        checked={formData.padrao}
                                        onCheckedChange={(checked) => setFormData({ ...formData, padrao: checked })}
                                    />
                                    <Label htmlFor="padrao">Definir como padrão para {formData.tipo}s</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="ativo"
                                        checked={formData.ativo}
                                        onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                                    />
                                    <Label htmlFor="ativo">Ativo</Label>
                                </div>
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
