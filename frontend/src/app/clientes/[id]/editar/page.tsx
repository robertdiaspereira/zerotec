"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import api from "@/lib/api";

export default function EditarClientePage() {
    const router = useRouter();
    const params = useParams();
    const id = Number(params.id);

    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const [formData, setFormData] = React.useState({
        tipo: "pf",
        nome_razao_social: "",
        nome_fantasia: "",
        cpf_cnpj: "",
        rg_ie: "",
        telefone_principal: "",
        telefone_secundario: "",
        email: "",
        cep: "",
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
        observacoes: "",
        active: true,
    });

    React.useEffect(() => {
        async function fetchCliente() {
            try {
                setLoading(true);
                const data = await api.getCliente(id);
                setFormData({
                    tipo: data.tipo,
                    nome_razao_social: data.nome_razao_social,
                    nome_fantasia: data.nome_fantasia || "",
                    cpf_cnpj: data.cpf_cnpj,
                    rg_ie: data.rg_ie || "",
                    telefone_principal: data.telefone_principal,
                    telefone_secundario: data.telefone_secundario || "",
                    email: data.email || "",
                    cep: data.cep || "",
                    logradouro: data.logradouro || "",
                    numero: data.numero || "",
                    complemento: data.complemento || "",
                    bairro: data.bairro || "",
                    cidade: data.cidade || "",
                    estado: data.estado || "",
                    observacoes: data.observacoes || "",
                    active: data.active,
                });
            } catch (err) {
                setError("Erro ao carregar dados do cliente");
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchCliente();
        }
    }, [id]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (checked: boolean) => {
        setFormData((prev) => ({ ...prev, active: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            setError(null);
            await api.updateCliente(id, formData);
            router.push(`/clientes/${id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao atualizar cliente");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error && !formData.nome_razao_social) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <div className="text-center">
                    <p className="text-lg font-semibold text-destructive">{error}</p>
                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => router.push("/clientes")}
                    >
                        Voltar para Lista
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Editar Cliente
                        </h1>
                        <p className="text-muted-foreground">
                            Atualize os dados do cliente
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Dados Cadastrais</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {error && (
                            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Tipo de Pessoa</Label>
                                <Select
                                    value={formData.tipo}
                                    onValueChange={(value) =>
                                        handleSelectChange("tipo", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pf">Pessoa Física</SelectItem>
                                        <SelectItem value="pj">Pessoa Jurídica</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="active">Status</Label>
                                <div className="flex items-center space-x-2 pt-2">
                                    <Switch
                                        id="active"
                                        checked={formData.active}
                                        onCheckedChange={handleSwitchChange}
                                    />
                                    <Label htmlFor="active">
                                        {formData.active ? "Ativo" : "Inativo"}
                                    </Label>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nome_razao_social">
                                    {formData.tipo === "pf" ? "Nome Completo" : "Razão Social"} *
                                </Label>
                                <Input
                                    id="nome_razao_social"
                                    name="nome_razao_social"
                                    value={formData.nome_razao_social}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                                <Input
                                    id="nome_fantasia"
                                    name="nome_fantasia"
                                    value={formData.nome_fantasia}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cpf_cnpj">
                                    {formData.tipo === "pf" ? "CPF" : "CNPJ"} *
                                </Label>
                                <Input
                                    id="cpf_cnpj"
                                    name="cpf_cnpj"
                                    value={formData.cpf_cnpj}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="rg_ie">
                                    {formData.tipo === "pf" ? "RG" : "Inscrição Estadual"}
                                </Label>
                                <Input
                                    id="rg_ie"
                                    name="rg_ie"
                                    value={formData.rg_ie}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <Separator />

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="telefone_principal">Telefone Principal *</Label>
                                <Input
                                    id="telefone_principal"
                                    name="telefone_principal"
                                    value={formData.telefone_principal}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="telefone_secundario">Telefone Secundário</Label>
                                <Input
                                    id="telefone_secundario"
                                    name="telefone_secundario"
                                    value={formData.telefone_secundario}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <Separator />

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="cep">CEP</Label>
                                <Input
                                    id="cep"
                                    name="cep"
                                    value={formData.cep}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="logradouro">Logradouro</Label>
                                <Input
                                    id="logradouro"
                                    name="logradouro"
                                    value={formData.logradouro}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="numero">Número</Label>
                                <Input
                                    id="numero"
                                    name="numero"
                                    value={formData.numero}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="complemento">Complemento</Label>
                                <Input
                                    id="complemento"
                                    name="complemento"
                                    value={formData.complemento}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bairro">Bairro</Label>
                                <Input
                                    id="bairro"
                                    name="bairro"
                                    value={formData.bairro}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cidade">Cidade</Label>
                                <Input
                                    id="cidade"
                                    name="cidade"
                                    value={formData.cidade}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="estado">Estado (UF)</Label>
                                <Input
                                    id="estado"
                                    name="estado"
                                    maxLength={2}
                                    value={formData.estado}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <Label htmlFor="observacoes">Observações</Label>
                            <Textarea
                                id="observacoes"
                                name="observacoes"
                                value={formData.observacoes}
                                onChange={handleChange}
                                rows={4}
                            />
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={saving}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={saving}>
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Salvar Alterações
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
