"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Loader2, Building2, MapPin, Phone, FileText } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface FornecedorFormProps {
    fornecedorId?: number;
}

export function FornecedorForm({ fornecedorId }: FornecedorFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = React.useState(false);
    const [saving, setSaving] = React.useState(false);

    const [formData, setFormData] = React.useState({
        razao_social: "",
        nome_fantasia: "",
        cnpj: "",
        ie: "",
        telefone_principal: "",
        telefone_secundario: "",
        email: "",
        contato_nome: "",
        contato_cargo: "",
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
        if (fornecedorId) {
            loadFornecedor();
        }
    }, [fornecedorId]);

    const loadFornecedor = async () => {
        try {
            setLoading(true);
            const data: any = await api.getFornecedor(fornecedorId!);
            setFormData({
                razao_social: data.razao_social || "",
                nome_fantasia: data.nome_fantasia || "",
                cnpj: data.cnpj || "",
                ie: data.ie || "",
                telefone_principal: data.telefone_principal || "",
                telefone_secundario: data.telefone_secundario || "",
                email: data.email || "",
                contato_nome: data.contato_nome || "",
                contato_cargo: data.contato_cargo || "",
                cep: data.cep || "",
                logradouro: data.logradouro || "",
                numero: data.numero || "",
                complemento: data.complemento || "",
                bairro: data.bairro || "",
                cidade: data.cidade || "",
                estado: data.estado || "",
                observacoes: data.observacoes || "",
                active: data.active !== undefined ? data.active : true,
            });
        } catch (error) {
            console.error("Erro ao carregar fornecedor:", error);
            toast({
                title: "Erro",
                description: "Não foi possível carregar os dados do fornecedor.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.razao_social || !formData.cnpj) {
            toast({
                title: "Atenção",
                description: "Preencha os campos obrigatórios: Razão Social e CNPJ.",
                variant: "destructive",
            });
            return;
        }

        try {
            setSaving(true);
            if (fornecedorId) {
                await api.updateFornecedor(fornecedorId, formData);
                toast({
                    title: "Sucesso",
                    description: "Fornecedor atualizado com sucesso!",
                });
            } else {
                await api.createFornecedor(formData);
                toast({
                    title: "Sucesso",
                    description: "Fornecedor cadastrado com sucesso!",
                });
            }
            router.push("/fornecedores");
        } catch (error) {
            console.error("Erro ao salvar fornecedor:", error);
            toast({
                title: "Erro",
                description: "Não foi possível salvar o fornecedor.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push("/fornecedores")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {fornecedorId ? "Editar Fornecedor" : "Novo Fornecedor"}
                        </h1>
                        <p className="text-muted-foreground">
                            {fornecedorId ? "Atualize os dados do fornecedor" : "Cadastre um novo fornecedor"}
                        </p>
                    </div>
                </div>
                <Button onClick={handleSubmit} disabled={saving}>
                    {saving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Salvar
                        </>
                    )}
                </Button>
            </div>

            <Tabs defaultValue="dados" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="dados">Dados Gerais</TabsTrigger>
                    <TabsTrigger value="endereco">Endereço</TabsTrigger>
                    <TabsTrigger value="contato">Contato</TabsTrigger>
                    <TabsTrigger value="observacoes">Observações</TabsTrigger>
                </TabsList>

                {/* Dados Gerais */}
                <TabsContent value="dados" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                <CardTitle>Informações da Empresa</CardTitle>
                            </div>
                            <CardDescription>
                                Dados principais do fornecedor
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="razao_social">Razão Social *</Label>
                                    <Input
                                        id="razao_social"
                                        value={formData.razao_social}
                                        onChange={(e) => handleChange("razao_social", e.target.value)}
                                        placeholder="EMPRESA FORNECEDORA LTDA"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                                    <Input
                                        id="nome_fantasia"
                                        value={formData.nome_fantasia}
                                        onChange={(e) => handleChange("nome_fantasia", e.target.value)}
                                        placeholder="Fornecedor XYZ"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="cnpj">CNPJ *</Label>
                                    <Input
                                        id="cnpj"
                                        value={formData.cnpj}
                                        onChange={(e) => handleChange("cnpj", e.target.value)}
                                        placeholder="00.000.000/0000-00"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ie">Inscrição Estadual</Label>
                                    <Input
                                        id="ie"
                                        value={formData.ie}
                                        onChange={(e) => handleChange("ie", e.target.value)}
                                        placeholder="000.000.000.000"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="active"
                                    checked={formData.active}
                                    onCheckedChange={(checked) => handleChange("active", checked)}
                                />
                                <Label htmlFor="active">Fornecedor Ativo</Label>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Endereço */}
                <TabsContent value="endereco" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                <CardTitle>Endereço</CardTitle>
                            </div>
                            <CardDescription>
                                Endereço completo do fornecedor
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="cep">CEP</Label>
                                    <Input
                                        id="cep"
                                        value={formData.cep}
                                        onChange={(e) => handleChange("cep", e.target.value)}
                                        placeholder="00000-000"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="logradouro">Logradouro</Label>
                                    <Input
                                        id="logradouro"
                                        value={formData.logradouro}
                                        onChange={(e) => handleChange("logradouro", e.target.value)}
                                        placeholder="Rua, Avenida, etc."
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-4">
                                <div className="space-y-2">
                                    <Label htmlFor="numero">Número</Label>
                                    <Input
                                        id="numero"
                                        value={formData.numero}
                                        onChange={(e) => handleChange("numero", e.target.value)}
                                        placeholder="123"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-3">
                                    <Label htmlFor="complemento">Complemento</Label>
                                    <Input
                                        id="complemento"
                                        value={formData.complemento}
                                        onChange={(e) => handleChange("complemento", e.target.value)}
                                        placeholder="Sala, Andar, etc."
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="bairro">Bairro</Label>
                                    <Input
                                        id="bairro"
                                        value={formData.bairro}
                                        onChange={(e) => handleChange("bairro", e.target.value)}
                                        placeholder="Centro"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cidade">Cidade</Label>
                                    <Input
                                        id="cidade"
                                        value={formData.cidade}
                                        onChange={(e) => handleChange("cidade", e.target.value)}
                                        placeholder="São Paulo"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="estado">Estado</Label>
                                    <Input
                                        id="estado"
                                        value={formData.estado}
                                        onChange={(e) => handleChange("estado", e.target.value)}
                                        placeholder="SP"
                                        maxLength={2}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Contato */}
                <TabsContent value="contato" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Phone className="h-5 w-5" />
                                <CardTitle>Informações de Contato</CardTitle>
                            </div>
                            <CardDescription>
                                Telefones, e-mails e pessoa de contato
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="telefone_principal">Telefone Principal</Label>
                                    <Input
                                        id="telefone_principal"
                                        value={formData.telefone_principal}
                                        onChange={(e) => handleChange("telefone_principal", e.target.value)}
                                        placeholder="(00) 0000-0000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="telefone_secundario">Telefone Secundário</Label>
                                    <Input
                                        id="telefone_secundario"
                                        value={formData.telefone_secundario}
                                        onChange={(e) => handleChange("telefone_secundario", e.target.value)}
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    placeholder="contato@fornecedor.com"
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="contato_nome">Nome do Contato</Label>
                                    <Input
                                        id="contato_nome"
                                        value={formData.contato_nome}
                                        onChange={(e) => handleChange("contato_nome", e.target.value)}
                                        placeholder="João Silva"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contato_cargo">Cargo do Contato</Label>
                                    <Input
                                        id="contato_cargo"
                                        value={formData.contato_cargo}
                                        onChange={(e) => handleChange("contato_cargo", e.target.value)}
                                        placeholder="Gerente Comercial"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Observações */}
                <TabsContent value="observacoes" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                <CardTitle>Observações</CardTitle>
                            </div>
                            <CardDescription>
                                Informações adicionais sobre o fornecedor
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="observacoes">Observações</Label>
                                <Textarea
                                    id="observacoes"
                                    value={formData.observacoes}
                                    onChange={(e) => handleChange("observacoes", e.target.value)}
                                    placeholder="Informações adicionais, condições especiais, etc."
                                    rows={6}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
