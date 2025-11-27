"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Save, Upload, MapPin, Phone, Mail, FileText, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function EmpresaPage() {
    const { toast } = useToast();
    const [loading, setLoading] = React.useState(false);
    const [saving, setSaving] = React.useState(false);

    const [formData, setFormData] = React.useState({
        razao_social: "",
        nome_fantasia: "",
        cnpj: "",
        inscricao_estadual: "",
        cep: "",
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
        telefone: "",
        celular: "",
        email: "",
        site: "",
        instagram: "",
        facebook: "",
        obs_os: "",
        obs_venda: "",
        garantia_produto: "",
        garantia_servico: ""
    });

    React.useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data: any = await api.getEmpresa();
            if (data && Object.keys(data).length > 0) {
                setFormData(prev => ({
                    ...prev,
                    ...data
                }));
            }
        } catch (error) {
            console.error("Erro ao carregar dados da empresa:", error);
            toast({
                title: "Erro",
                description: "Não foi possível carregar os dados da empresa.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!formData.razao_social || !formData.cnpj) {
            toast({
                title: "Atenção",
                description: "Preencha os campos obrigatórios (Razão Social e CNPJ).",
                variant: "destructive",
            });
            return;
        }

        try {
            setSaving(true);
            await api.updateEmpresa(formData);
            toast({
                title: "Sucesso",
                description: "Dados da empresa atualizados com sucesso!",
            });
        } catch (error) {
            console.error("Erro ao salvar empresa:", error);
            toast({
                title: "Erro",
                description: "Erro ao salvar os dados da empresa.",
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Perfil da Empresa</h1>
                    <p className="text-muted-foreground">
                        Dados da empresa para documentos, relatórios e PDFs
                    </p>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Salvar Alterações
                        </>
                    )}
                </Button>
            </div>

            <Tabs defaultValue="dados" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="dados">Dados Gerais</TabsTrigger>
                    <TabsTrigger value="endereco">Endereço</TabsTrigger>
                    <TabsTrigger value="contato">Contato</TabsTrigger>
                    <TabsTrigger value="garantias">Garantias</TabsTrigger>
                </TabsList>

                {/* Dados Gerais */}
                <TabsContent value="dados" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações da Empresa</CardTitle>
                            <CardDescription>
                                Dados principais que aparecem em documentos e relatórios
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
                                        placeholder="ZEROTEC ASSISTENCIA TECNICA LTDA"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nome_fantasia">Nome Fantasia *</Label>
                                    <Input
                                        id="nome_fantasia"
                                        value={formData.nome_fantasia}
                                        onChange={(e) => handleChange("nome_fantasia", e.target.value)}
                                        placeholder="ZeroTec"
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
                                    <Label htmlFor="inscricao_estadual">Inscrição Estadual</Label>
                                    <Input
                                        id="inscricao_estadual"
                                        value={formData.inscricao_estadual}
                                        onChange={(e) => handleChange("inscricao_estadual", e.target.value)}
                                        placeholder="000.000.000.000"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="logo">Logo da Empresa</Label>
                                <div className="flex items-center gap-4">
                                    <div className="h-24 w-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                                        <Building2 className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1">
                                        <Button variant="outline" size="sm" disabled>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Fazer Upload (Em Breve)
                                        </Button>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Recomendado: PNG ou JPG, máximo 2MB
                                        </p>
                                    </div>
                                </div>
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
                                Endereço completo da empresa
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="cep">CEP *</Label>
                                    <Input
                                        id="cep"
                                        value={formData.cep}
                                        onChange={(e) => handleChange("cep", e.target.value)}
                                        placeholder="00000-000"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="logradouro">Logradouro *</Label>
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
                                    <Label htmlFor="numero">Número *</Label>
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
                                    <Label htmlFor="bairro">Bairro *</Label>
                                    <Input
                                        id="bairro"
                                        value={formData.bairro}
                                        onChange={(e) => handleChange("bairro", e.target.value)}
                                        placeholder="Centro"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cidade">Cidade *</Label>
                                    <Input
                                        id="cidade"
                                        value={formData.cidade}
                                        onChange={(e) => handleChange("cidade", e.target.value)}
                                        placeholder="São Paulo"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="estado">Estado *</Label>
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
                                Telefones, e-mails e redes sociais
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="telefone">Telefone Principal *</Label>
                                    <Input
                                        id="telefone"
                                        value={formData.telefone}
                                        onChange={(e) => handleChange("telefone", e.target.value)}
                                        placeholder="(00) 0000-0000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="celular">Celular/WhatsApp</Label>
                                    <Input
                                        id="celular"
                                        value={formData.celular}
                                        onChange={(e) => handleChange("celular", e.target.value)}
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="email">E-mail Principal *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleChange("email", e.target.value)}
                                        placeholder="contato@empresa.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="site">Website</Label>
                                    <Input
                                        id="site"
                                        value={formData.site}
                                        onChange={(e) => handleChange("site", e.target.value)}
                                        placeholder="www.empresa.com"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="instagram">Instagram</Label>
                                    <Input
                                        id="instagram"
                                        value={formData.instagram}
                                        onChange={(e) => handleChange("instagram", e.target.value)}
                                        placeholder="@empresa"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="facebook">Facebook</Label>
                                    <Input
                                        id="facebook"
                                        value={formData.facebook}
                                        onChange={(e) => handleChange("facebook", e.target.value)}
                                        placeholder="facebook.com/empresa"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Garantias */}
                <TabsContent value="garantias" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                <CardTitle>Políticas de Garantia</CardTitle>
                            </div>
                            <CardDescription>
                                Textos de garantia que aparecem automaticamente em vendas e ordens de serviço
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="garantia_produto">Garantia de Produtos</Label>
                                <Textarea
                                    id="garantia_produto"
                                    value={formData.garantia_produto || ""}
                                    onChange={(e) => handleChange("garantia_produto", e.target.value)}
                                    placeholder="Texto de garantia que aparece em TODAS as vendas..."
                                    rows={6}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Este texto aparecerá automaticamente em todas as vendas e ordens de serviço
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="garantia_servico">Garantia de Serviços</Label>
                                <Textarea
                                    id="garantia_servico"
                                    value={formData.garantia_servico || ""}
                                    onChange={(e) => handleChange("garantia_servico", e.target.value)}
                                    placeholder="Texto de garantia que aparece em TODAS as ordens de serviço..."
                                    rows={6}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Este texto aparecerá automaticamente em todas as ordens de serviço (além da garantia de produtos)
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
