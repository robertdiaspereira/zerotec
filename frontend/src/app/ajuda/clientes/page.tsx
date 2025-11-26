import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AjudaClientesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/ajuda">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <div className="flex items-center gap-2">
                        <Users className="h-6 w-6 text-purple-500" />
                        <h1 className="text-3xl font-bold tracking-tight">Cadastro de Clientes</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Como cadastrar e gerenciar clientes no sistema
                    </p>
                </div>
            </div>

            {/* Cadastro de Cliente */}
            <Card>
                <CardHeader>
                    <CardTitle>Cadastrar Novo Cliente</CardTitle>
                    <CardDescription>
                        Passo a passo para adicionar clientes
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-white font-bold">
                                    1
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold mb-2">Acessar Cadastro</h3>
                                <p className="text-sm text-muted-foreground">
                                    Menu <Badge variant="outline">Clientes</Badge> → <Badge variant="outline">Novo Cliente</Badge>
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Ou durante uma venda/OS, clique em "Novo Cliente" no seletor
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-white font-bold">
                                    2
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold mb-2">Escolher Tipo de Pessoa</h3>
                                <div className="space-y-2">
                                    <div className="p-3 border rounded-md">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge>Pessoa Física</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Para clientes individuais. Campos: Nome, CPF, RG, Data de Nascimento
                                        </p>
                                    </div>
                                    <div className="p-3 border rounded-md">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="secondary">Pessoa Jurídica</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Para empresas. Campos: Razão Social, Nome Fantasia, CNPJ, Inscrição Estadual
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-white font-bold">
                                    3
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold mb-2">Dados de Contato</h3>
                                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                                    <li><strong>Telefone:</strong> Número principal de contato</li>
                                    <li><strong>Celular:</strong> WhatsApp preferencial</li>
                                    <li><strong>E-mail:</strong> Para envio de documentos</li>
                                </ul>
                                <div className="bg-muted p-3 rounded-md text-xs mt-2">
                                    <strong>Dica:</strong> Pelo menos um telefone é obrigatório para contato
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-white font-bold">
                                    4
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold mb-2">Endereço</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Preencha o CEP e os campos serão preenchidos automaticamente:
                                </p>
                                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                                    <li>Logradouro (Rua, Avenida)</li>
                                    <li>Bairro</li>
                                    <li>Cidade e Estado</li>
                                    <li>Complete com número e complemento</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-white font-bold">
                                    5
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold mb-2">Salvar Cliente</h3>
                                <p className="text-sm text-muted-foreground">
                                    Revise os dados e clique em "Salvar Cliente". O cliente estará disponível
                                    imediatamente para vendas e ordens de serviço.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Buscar e Editar */}
            <Card>
                <CardHeader>
                    <CardTitle>Buscar e Editar Clientes</CardTitle>
                    <CardDescription>
                        Como encontrar e atualizar informações
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold text-sm mb-2">Busca Rápida</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                            Na listagem de clientes, você pode buscar por:
                        </p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                            <li>Nome ou Razão Social</li>
                            <li>CPF ou CNPJ</li>
                            <li>Telefone ou Celular</li>
                            <li>E-mail</li>
                        </ul>
                    </div>

                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold text-sm mb-2">Editar Dados</h3>
                        <p className="text-sm text-muted-foreground">
                            Clique no cliente desejado na listagem e depois em "Editar".
                            Atualize as informações necessárias e salve.
                        </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold text-sm mb-2">Histórico do Cliente</h3>
                        <p className="text-sm text-muted-foreground">
                            Ao visualizar um cliente, você pode ver:
                        </p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 mt-1">
                            <li>Todas as vendas realizadas</li>
                            <li>Ordens de serviço abertas e concluídas</li>
                            <li>Valor total gasto</li>
                            <li>Última compra/atendimento</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* Dicas Importantes */}
            <Card>
                <CardHeader>
                    <CardTitle>Dicas Importantes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex gap-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="text-blue-600 font-bold">💡</div>
                        <div className="text-sm">
                            <strong>CPF/CNPJ:</strong> O sistema valida automaticamente se o documento é válido
                        </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-green-50 border border-green-200 rounded-md">
                        <div className="text-green-600 font-bold">✓</div>
                        <div className="text-sm">
                            <strong>Duplicados:</strong> O sistema avisa se já existe um cliente com o mesmo CPF/CNPJ
                        </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-purple-50 border border-purple-200 rounded-md">
                        <div className="text-purple-600 font-bold">📱</div>
                        <div className="text-sm">
                            <strong>WhatsApp:</strong> Cadastre o celular para facilitar comunicação via WhatsApp
                        </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                        <div className="text-amber-600 font-bold">🔒</div>
                        <div className="text-sm">
                            <strong>LGPD:</strong> Dados de clientes são protegidos e apenas usuários autorizados têm acesso
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
