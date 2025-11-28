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
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSelect = (value: string) => {
        setForm((prev) => ({ ...prev, tipo: value }));
    };

    const handleEstadoSelect = (value: string) => {
        setForm((prev) => ({ ...prev, estado: value }));
    };

    // Buscar CEP usando ViaCEP
    const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const cep = e.target.value.replace(/\D/g, ""); // Remove caracteres não numéricos
        setForm((prev) => ({ ...prev, cep: e.target.value }));

        if (cep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();

                if (!data.erro) {
                    setForm((prev) => ({
                        ...prev,
                        logradouro: data.logradouro || prev.logradouro,
                        bairro: data.bairro || prev.bairro,
                        cidade: data.localidade || prev.cidade,
                        estado: data.uf || prev.estado,
                    }));
                }
            } catch (err) {
                console.error("Erro ao buscar CEP:", err);
            }
        }
    };

    // Buscar CNPJ usando ReceitaWS (apenas para PJ)
    const handleCnpjChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const cnpj = e.target.value.replace(/\D/g, ""); // Remove caracteres não numéricos
        setForm((prev) => ({ ...prev, cpf_cnpj: e.target.value }));

        if (form.tipo === "pj" && cnpj.length === 14) {
            try {
                const response = await fetch(`https://receitaws.com.br/v1/cnpj/${cnpj}`);
                const data = await response.json();

                if (data.status !== "ERROR") {
                    setForm((prev) => ({
                        ...prev,
                        nome_razao_social: data.nome || prev.nome_razao_social,
                        nome_fantasia: data.fantasia || prev.nome_fantasia,
                        cep: data.cep?.replace(/\D/g, "") || prev.cep,
                        logradouro: data.logradouro || prev.logradouro,
                        numero: data.numero || prev.numero,
                        complemento: data.complemento || prev.complemento,
                        bairro: data.bairro || prev.bairro,
                        cidade: data.municipio || prev.cidade,
                        estado: data.uf || prev.estado,
                        telefone_principal: data.telefone?.replace(/\D/g, "") || prev.telefone_principal,
                        email: data.email || prev.email,
                    }));
                }
            } catch (err) {
                console.error("Erro ao buscar CNPJ:", err);
            }
        }
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
                        <div className="md:col-span-2 space-y-2">
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
                        <div className="space-y-2">
                            <Label htmlFor="nome_razao_social">
                                {form.tipo === "pf" ? "Nome" : "Razão Social"}
                            </Label>
                            <Input
                                id="nome_razao_social"
                                name="nome_razao_social"
                                value={form.nome_razao_social}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Nome Fantasia (apenas PJ) */}
                        {form.tipo === "pj" && (
                            <div className="space-y-2">
                                <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                                <Input
                                    id="nome_fantasia"
                                    name="nome_fantasia"
                                    value={form.nome_fantasia}
                                    onChange={handleChange}
                                />
                            </div>
                        )}

                        {/* CPF / CNPJ */}
                        <div className="space-y-2">
                            <Label htmlFor="cpf_cnpj">
                                {form.tipo === "pf" ? "CPF" : "CNPJ"}
                            </Label>
                            <Input
                                id="cpf_cnpj"
                                name="cpf_cnpj"
                                value={form.cpf_cnpj}
                                onChange={handleCnpjChange}
                                placeholder={form.tipo === "pf" ? "000.000.000-00" : "00.000.000/0000-00"}
                                required
                            />
                        </div>

                        {/* RG / IE */}
                        <div className="space-y-2">
                            <Label htmlFor="rg_ie">
                                {form.tipo === "pf" ? "RG" : "Inscrição Estadual"}
                            </Label>
                            <Input
                                id="rg_ie"
                                name="rg_ie"
                                value={form.rg_ie}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Telefone Principal */}
                        <div className="space-y-2">
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
                        <div className="space-y-2">
                            <Label htmlFor="telefone_secundario">Telefone Secundário</Label>
                            <Input
                                id="telefone_secundario"
                                name="telefone_secundario"
                                value={form.telefone_secundario}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Email */}
                        <div className="md:col-span-2 space-y-2">
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
                        <div className="space-y-2">
                            <Label htmlFor="cep">CEP</Label>
                            <Input
                                id="cep"
                                name="cep"
                                value={form.cep}
                                onChange={handleCepChange}
                                placeholder="00000-000"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="estado">Estado (UF)</Label>
                            <Select value={form.estado} onValueChange={handleEstadoSelect}>
                                <SelectTrigger id="estado">
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AC">AC</SelectItem>
                                    <SelectItem value="AL">AL</SelectItem>
                                    <SelectItem value="AP">AP</SelectItem>
                                    <SelectItem value="AM">AM</SelectItem>
                                    <SelectItem value="BA">BA</SelectItem>
                                    <SelectItem value="CE">CE</SelectItem>
                                    <SelectItem value="DF">DF</SelectItem>
                                    <SelectItem value="ES">ES</SelectItem>
                                    <SelectItem value="GO">GO</SelectItem>
                                    <SelectItem value="MA">MA</SelectItem>
                                    <SelectItem value="MT">MT</SelectItem>
                                    <SelectItem value="MS">MS</SelectItem>
                                    <SelectItem value="MG">MG</SelectItem>
                                    <SelectItem value="PA">PA</SelectItem>
                                    <SelectItem value="PB">PB</SelectItem>
                                    <SelectItem value="PR">PR</SelectItem>
                                    <SelectItem value="PE">PE</SelectItem>
                                    <SelectItem value="PI">PI</SelectItem>
                                    <SelectItem value="RJ">RJ</SelectItem>
                                    <SelectItem value="RN">RN</SelectItem>
                                    <SelectItem value="RS">RS</SelectItem>
                                    <SelectItem value="RO">RO</SelectItem>
                                    <SelectItem value="RR">RR</SelectItem>
                                    <SelectItem value="SC">SC</SelectItem>
                                    <SelectItem value="SP">SP</SelectItem>
                                    <SelectItem value="SE">SE</SelectItem>
                                    <SelectItem value="TO">TO</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="logradouro">Logradouro</Label>
                            <Input
                                id="logradouro"
                                name="logradouro"
                                value={form.logradouro}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="numero">Número</Label>
                            <Input id="numero" name="numero" value={form.numero} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="complemento">Complemento</Label>
                            <Input
                                id="complemento"
                                name="complemento"
                                value={form.complemento}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bairro">Bairro</Label>
                            <Input id="bairro" name="bairro" value={form.bairro} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cidade">Cidade</Label>
                            <Input id="cidade" name="cidade" value={form.cidade} onChange={handleChange} />
                        </div>

                        {/* Observações */}
                        <div className="md:col-span-2 space-y-2">
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
