/**
 * Novo Cliente Page
 * Formulário para criar um cliente
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";

export default function NovoClientePage() {
    const router = useRouter();
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const [form, setForm] = React.useState({
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSelect = (value: string) => {
        setForm((prev) => ({ ...prev, tipo: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            // Envia os dados para a API
            await api.post("/erp/clientes/", form);
            // Redireciona para a lista de clientes
            router.push("/clientes");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao criar cliente");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Novo Cliente</h1>
                <Button variant="ghost" onClick={() => router.back()}>
                    Cancelar
                </Button>
            </div>

            {error && (
                <div className="p-4 bg-destructive/10 text-destructive rounded">
                    {error}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Dados do Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
                        {/* Tipo */}
                        <div className="md:col-span-2">
                            <Label htmlFor="tipo">Tipo</Label>
                            <Select value={form.tipo} onValueChange={handleSelect}>
                                <SelectTrigger id="tipo">
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pf">Pessoa Física</SelectItem>
                                    <SelectItem value="pj">Pessoa Jurídica</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Nome / Razão Social */}
                        <div>
                            <Label htmlFor="nome_razao_social">Nome / Razão Social</Label>
                            <Input
                                id="nome_razao_social"
                                name="nome_razao_social"
                                value={form.nome_razao_social}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Nome Fantasia (opcional) */}
                        <div>
                            <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                            <Input
                                id="nome_fantasia"
                                name="nome_fantasia"
                                value={form.nome_fantasia}
                                onChange={handleChange}
                            />
                        </div>

                        {/* CPF / CNPJ */}
                        <div>
                            <Label htmlFor="cpf_cnpj">CPF / CNPJ</Label>
                            <Input
                                id="cpf_cnpj"
                                name="cpf_cnpj"
                                value={form.cpf_cnpj}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* RG / IE */}
                        <div>
                            <Label htmlFor="rg_ie">RG / IE</Label>
                            <Input
                                id="rg_ie"
                                name="rg_ie"
                                value={form.rg_ie}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Telefone Principal */}
                        <div>
                            <Label htmlFor="telefone_principal">Telefone Principal</Label>
                            <Input
                                id="telefone_principal"
                                name="telefone_principal"
                                value={form.telefone_principal}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Telefone Secundário */}
                        <div>
                            <Label htmlFor="telefone_secundario">Telefone Secundário</Label>
                            <Input
                                id="telefone_secundario"
                                name="telefone_secundario"
                                value={form.telefone_secundario}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Email */}
                        <div className="md:col-span-2">
                            <Label htmlFor="email">E‑mail</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Endereço */}
                        <div className="md:col-span-2">
                            <Separator className="my-4" />
                            <h3 className="text-lg font-medium mb-2">Endereço</h3>
                        </div>
                        <div>
                            <Label htmlFor="cep">CEP</Label>
                            <Input id="cep" name="cep" value={form.cep} onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="estado">Estado (UF)</Label>
                            <Input id="estado" name="estado" value={form.estado} onChange={handleChange} />
                        </div>
                        <div className="md:col-span-2">
                            <Label htmlFor="logradouro">Logradouro</Label>
                            <Input
                                id="logradouro"
                                name="logradouro"
                                value={form.logradouro}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <Label htmlFor="numero">Número</Label>
                            <Input id="numero" name="numero" value={form.numero} onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="complemento">Complemento</Label>
                            <Input
                                id="complemento"
                                name="complemento"
                                value={form.complemento}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <Label htmlFor="bairro">Bairro</Label>
                            <Input id="bairro" name="bairro" value={form.bairro} onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="cidade">Cidade</Label>
                            <Input id="cidade" name="cidade" value={form.cidade} onChange={handleChange} />
                        </div>

                        {/* Observações */}
                        <div className="md:col-span-2">
                            <Label htmlFor="observacoes">Observações</Label>
                            <Textarea
                                id="observacoes"
                                name="observacoes"
                                value={form.observacoes}
                                onChange={handleChange}
                                rows={3}
                            />
                        </div>

                        {/* Ativo */}
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="active"
                                name="active"
                                checked={form.active}
                                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, active: checked }))}
                            />
                            <Label htmlFor="active">Cliente ativo</Label>
                        </div>

                        {/* Submit */}
                        <div className="md:col-span-2 flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    "Salvar"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
