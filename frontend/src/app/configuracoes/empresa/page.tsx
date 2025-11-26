"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Save, Upload, MapPin, Phone, Mail, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EmpresaPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Perfil da Empresa</h1>
                    <p className="text-muted-foreground">
                        Dados da empresa para documentos, relatórios e PDFs
                    </p>
                </div>
                <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                </Button>
            </div>

            <Tabs defaultValue="dados" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="dados">Dados Gerais</TabsTrigger>
                    <TabsTrigger value="endereco">Endereço</TabsTrigger>
                    <TabsTrigger value="contato">Contato</TabsTrigger>
                    <TabsTrigger value="documentos">Documentos</TabsTrigger>
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
                                        placeholder="ZEROTEC ASSISTENCIA TECNICA LTDA"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nome_fantasia">Nome Fantasia *</Label>
                                    <Input
                                        id="nome_fantasia"
                                        placeholder="ZeroTec"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="cnpj">CNPJ *</Label>
                                    <Input
                                        id="cnpj"
                                        placeholder="00.000.000/0000-00"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="inscricao_estadual">Inscrição Estadual</Label>
                                    <Input
                                        id="inscricao_estadual"
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
                                        <Button variant="outline" size="sm">
                                            <Upload className="mr-2 h-4 w-4" />
                                            Fazer Upload
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
                                        placeholder="00000-000"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="logradouro">Logradouro *</Label>
                                    <Input
                                        id="logradouro"
                                        placeholder="Rua, Avenida, etc."
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-4">
                                <div className="space-y-2">
                                    <Label htmlFor="numero">Número *</Label>
                                    <Input
                                        id="numero"
                                        placeholder="123"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-3">
                                    <Label htmlFor="complemento">Complemento</Label>
                                    <Input
                                        id="complemento"
                                        placeholder="Sala, Andar, etc."
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="bairro">Bairro *</Label>
                                    <Input
                                        id="bairro"
                                        placeholder="Centro"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cidade">Cidade *</Label>
                                    <Input
                                        id="cidade"
                                        placeholder="São Paulo"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="estado">Estado *</Label>
                                    <Input
                                        id="estado"
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
                                        placeholder="(00) 0000-0000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="celular">Celular/WhatsApp</Label>
                                    <Input
                                        id="celular"
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
                                        placeholder="contato@empresa.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="site">Website</Label>
                                    <Input
                                        id="site"
                                        placeholder="www.empresa.com"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="instagram">Instagram</Label>
                                    <Input
                                        id="instagram"
                                        placeholder="@empresa"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="facebook">Facebook</Label>
                                    <Input
                                        id="facebook"
                                        placeholder="facebook.com/empresa"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Documentos */}
                <TabsContent value="documentos" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                <CardTitle>Configurações de Documentos</CardTitle>
                            </div>
                            <CardDescription>
                                Textos e informações para PDFs e documentos
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="obs_os">Observações Padrão - Ordem de Serviço</Label>
                                <Textarea
                                    id="obs_os"
                                    placeholder="Texto que aparece no rodapé das OS..."
                                    rows={4}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="obs_venda">Observações Padrão - Vendas</Label>
                                <Textarea
                                    id="obs_venda"
                                    placeholder="Texto que aparece no rodapé das vendas..."
                                    rows={4}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="politica_garantia">Política de Garantia</Label>
                                <Textarea
                                    id="politica_garantia"
                                    placeholder="Política de garantia padrão da empresa..."
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
