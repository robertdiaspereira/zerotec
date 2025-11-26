import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AjudaOSPage() {
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
                        <Wrench className="h-6 w-6 text-blue-500" />
                        <h1 className="text-3xl font-bold tracking-tight">Como Criar uma Nova Ordem de Serviço</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Guia completo para abertura e gerenciamento de OS
                    </p>
                </div>
            </div>

            {/* Passo a Passo */}
            <Card>
                <CardHeader>
                    <CardTitle>Passo a Passo</CardTitle>
                    <CardDescription>
                        Siga estas etapas para criar uma ordem de serviço
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        {/* Passo 1 */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white font-bold">
                                    1
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold mb-2">Acessar Nova OS</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                    No menu lateral, clique em <Badge variant="outline">Assistência Técnica</Badge> → <Badge variant="outline">Nova OS</Badge>
                                </p>
                            </div>
                        </div>

                        {/* Passo 2 */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white font-bold">
                                    2
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold mb-2">Dados do Cliente e Equipamento</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Selecione o cliente e preencha os dados do equipamento:
                                </p>
                                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                                    <li><strong>Equipamento:</strong> Tipo do aparelho (ex: Notebook, Smartphone)</li>
                                    <li><strong>Marca e Modelo:</strong> Informações do fabricante</li>
                                    <li><strong>Número de Série:</strong> Se disponível</li>
                                    <li><strong>Acessórios:</strong> Itens que vieram junto (carregador, capa, etc.)</li>
                                </ul>
                            </div>
                        </div>

                        {/* Passo 3 */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white font-bold">
                                    3
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold mb-2">Preencher Checklist</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Marque os itens do checklist de recebimento:
                                </p>
                                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                                    <li>Bateria presente</li>
                                    <li>Tampa traseira</li>
                                    <li>Tela sem trincas</li>
                                    <li>Botões funcionando</li>
                                    <li>Outros itens configurados em Configurações → Checklist</li>
                                </ul>
                                <div className="bg-muted p-3 rounded-md text-xs mt-2">
                                    <strong>Dica:</strong> O checklist protege você e o cliente, documentando o estado do aparelho na entrada
                                </div>
                            </div>
                        </div>

                        {/* Passo 4 */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white font-bold">
                                    4
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold mb-2">Defeito Relatado</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Descreva o problema relatado pelo cliente de forma clara:
                                </p>
                                <div className="bg-blue-50 border border-blue-200 p-3 rounded-md text-xs">
                                    <strong>Exemplo:</strong> "Cliente relata que o aparelho não liga. Bateria não carrega. Aparelho caiu na água há 2 dias."
                                </div>
                            </div>
                        </div>

                        {/* Passo 5 */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white font-bold">
                                    5
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold mb-2">Definir Prioridade e Técnico</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Escolha a prioridade e o técnico responsável:
                                </p>
                                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                                    <li><Badge variant="outline">Baixa:</Badge> Serviços não urgentes</li>
                                    <li><Badge variant="outline">Normal:</Badge> Atendimento padrão</li>
                                    <li><Badge variant="outline">Alta:</Badge> Cliente prioritário</li>
                                    <li><Badge variant="destructive">Urgente:</Badge> Precisa ser feito hoje</li>
                                </ul>
                            </div>
                        </div>

                        {/* Passo 6 */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white font-bold">
                                    6
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold mb-2">Salvar OS</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Clique em "Salvar OS" para gerar o número da ordem
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    O sistema irá:
                                </p>
                                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 mt-1">
                                    <li>Gerar número automático (ex: OS000123)</li>
                                    <li>Definir status como "Aberta"</li>
                                    <li>Disponibilizar PDF para impressão e entrega ao cliente</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Fluxo da OS */}
            <Card>
                <CardHeader>
                    <CardTitle>Fluxo de Status da OS</CardTitle>
                    <CardDescription>
                        Entenda os status e quando usá-los
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 p-3 border rounded-md">
                        <Badge>Aberta</Badge>
                        <div className="text-sm text-muted-foreground">
                            OS criada, aguardando início do diagnóstico
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-md">
                        <Badge>Em Diagnóstico</Badge>
                        <div className="text-sm text-muted-foreground">
                            Técnico está analisando o problema
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-md">
                        <Badge>Aguardando Orçamento</Badge>
                        <div className="text-sm text-muted-foreground">
                            Orçamento criado, aguardando aprovação do cliente
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-md">
                        <Badge variant="secondary">Aprovada</Badge>
                        <div className="text-sm text-muted-foreground">
                            Cliente aprovou o orçamento, pode iniciar reparo
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-md">
                        <Badge variant="secondary">Em Execução</Badge>
                        <div className="text-sm text-muted-foreground">
                            Reparo em andamento
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-md">
                        <Badge variant="outline">Aguardando Peça</Badge>
                        <div className="text-sm text-muted-foreground">
                            Peça encomendada, aguardando chegada
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-md">
                        <Badge variant="default">Concluída</Badge>
                        <div className="text-sm text-muted-foreground">
                            Serviço finalizado, aguardando retirada
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-md">
                        <Badge variant="default">Entregue</Badge>
                        <div className="text-sm text-muted-foreground">
                            Equipamento entregue ao cliente
                        </div>
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
                            <strong>Fotos:</strong> Tire fotos do equipamento na entrada, especialmente se houver danos visíveis
                        </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-green-50 border border-green-200 rounded-md">
                        <div className="text-green-600 font-bold">✓</div>
                        <div className="text-sm">
                            <strong>Garantia:</strong> O prazo de garantia é configurável e começa a contar da data de conclusão
                        </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-purple-50 border border-purple-200 rounded-md">
                        <div className="text-purple-600 font-bold">📋</div>
                        <div className="text-sm">
                            <strong>Histórico:</strong> Todas as alterações na OS ficam registradas no histórico para auditoria
                        </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                        <div className="text-amber-600 font-bold">⚠️</div>
                        <div className="text-sm">
                            <strong>Recebimento:</strong> As taxas de máquina de cartão são calculadas automaticamente
                            conforme configurado em "Formas de Recebimento"
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
