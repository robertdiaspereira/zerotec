"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface ServiceCreationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ServiceCreationModal({ open, onOpenChange }: ServiceCreationModalProps) {
    const [loading, setLoading] = React.useState(false);
    const [categorias, setCategorias] = React.useState<any[]>([]);
    const [formData, setFormData] = React.useState({
        descricao: "",
        descricao_detalhada: "",
        valor_padrao: "",
        tempo_estimado: "",
        categoria: "",
    });

    React.useEffect(() => {
        if (open) {
            fetchCategorias();
        }
    }, [open]);

    const fetchCategorias = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/assistencia/categorias-servico/");
            if (response.ok) {
                const data = await response.json();
                setCategorias(data.results || data);
            }
        } catch (error) {
            console.error("Erro ao carregar categorias:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("http://localhost:8000/api/assistencia/servicos-template/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    valor_padrao: parseFloat(formData.valor_padrao),
                    tempo_estimado: parseInt(formData.tempo_estimado) || null,
                    categoria: formData.categoria ? parseInt(formData.categoria) : null,
                }),
            });

            if (response.ok) {
                onOpenChange(false);
                setFormData({
                    descricao: "",
                    descricao_detalhada: "",
                    valor_padrao: "",
                    tempo_estimado: "",
                    categoria: "",
                });
                // Optional: Show success toast
            } else {
                console.error("Erro ao criar serviço");
            }
        } catch (error) {
            console.error("Erro ao criar serviço:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Novo Serviço</DialogTitle>
                    <DialogDescription>
                        Cadastre um novo serviço no sistema. O código será gerado automaticamente.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="descricao">Descrição</Label>
                        <Input
                            id="descricao"
                            value={formData.descricao}
                            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="categoria">Categoria</Label>
                        <Select
                            value={formData.categoria}
                            onValueChange={(value) => setFormData({ ...formData, categoria: value })}
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="valor">Valor Padrão (R$)</Label>
                            <Input
                                id="valor"
                                type="number"
                                step="0.01"
                                value={formData.valor_padrao}
                                onChange={(e) => setFormData({ ...formData, valor_padrao: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tempo">Tempo Estimado (min)</Label>
                            <Input
                                id="tempo"
                                type="number"
                                value={formData.tempo_estimado}
                                onChange={(e) => setFormData({ ...formData, tempo_estimado: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="detalhes">Descrição Detalhada</Label>
                        <Textarea
                            id="detalhes"
                            value={formData.descricao_detalhada}
                            onChange={(e) => setFormData({ ...formData, descricao_detalhada: e.target.value })}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar Serviço
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
