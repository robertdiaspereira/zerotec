import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AjudaVendasPage() {
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
                        <ShoppingCart className="h-6 w-6 text-green-500" />
                        <h1 className="text-3xl font-bold tracking-tight">Como Criar uma Nova Venda</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Guia passo a passo para realizar vendas no sistema
                    </p>
                </div>
            </div>

            {/* Passo a Passo */}
            <Card>
                <CardHeader>
                    <CardTitle>Passo a Passo</CardTitle>
                    <CardDescription>
                        Siga estas etapas para criar uma venda
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        {/* Passo 1 */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white font-bold">
                                    1
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold mb-2">Acessar Nova Venda</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                    No menu lateral, clique em <Badge variant="outline">Vendas</Badge> → <Badge variant="outline">Nova Venda</Badge>
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Ou use o atalho direto no Dashboard clicando no botão "Nova Venda"
                                </p>
                            </div>
                        </div>

                        {/* Passo 2 */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white font-bold">
                                    2
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold mb-2">Selecionar Cliente</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Escolha o cliente na lista ou clique em "Novo Cliente" para cadastrar um novo
                                </p>
                                <div className="bg-muted p-3 rounded-md text-xs">
                                    <strong>Dica:</strong> Você pode buscar o cliente por nome, CPF ou telefone
                                </div>
                            </div>
                        </div>

                        {/* Passo 3 */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white font-bold">
                                    3
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold mb-2">Adicionar Produtos/Serviços</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Clique em "Adicionar Item" e selecione os produtos ou serviços
                                </p>
                                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                                    <li>Informe a quantidade desejada</li>
                                    <li>O preço será preenchido automaticamente</li>
                                    <li>Você pode alterar o preço se necessário</li>
                                    <li>Adicione quantos itens precisar</li>
                                </ul>
                            </div>
                        </div>

                        {/* Passo 4 */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white font-bold">
                                    4
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold mb-2">Aplicar Desconto (Opcional)</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Se necessário, aplique um desconto em valor (R$) ou percentual (%)
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    O valor total será atualizado automaticamente
                                </p>
                            </div>
                        </div>

                        {/* Passo 5 */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white font-bold">
                                    5
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold mb-2">Definir Forma de Recebimento</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Selecione como o cliente irá pagar:
                                </p>
                                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                                    <li><strong>Dinheiro:</strong> Pagamento à vista em espécie</li>
                                    <li><strong>PIX:</strong> Transferência instantânea</li>
                                    <li><strong>Débito:</strong> Cartão de débito (taxa da máquina aplicada)</li>
                                    <li><strong>Crédito:</strong> Cartão de crédito (escolha o número de parcelas)</li>
                                    <li><strong>Boleto:</strong> Pagamento via boleto bancário</li>
                                </ul>
                                <div className="bg-amber-50 border border-amber-200 p-3 rounded-md text-xs mt-2">
                                    <strong>Importante:</strong> As taxas de máquina de cartão são descontadas automaticamente
                                    conforme configurado em "Formas de Recebimento"
                                </div>
                            </div>
                        </div>

                        {/* Passo 6 */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white font-bold">
                                    6
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold mb-2">Finalizar Venda</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Revise todos os dados e clique em "Finalizar Venda"
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    O sistema irá:
                                </p>
                                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 mt-1">
                                    <li>Baixar o estoque automaticamente</li>
                                    <li>Gerar o número da venda</li>
                                    <li>Criar as contas a receber (se parcelado)</li>
                                    <li>Disponibilizar o PDF da venda para impressão</li>
                                </ul>
                            </div>
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
                            <strong>Estoque Insuficiente:</strong> Se não houver estoque suficiente, o sistema avisará
                            e não permitirá finalizar a venda
                        </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-green-50 border border-green-200 rounded-md">
                        <div className="text-green-600 font-bold">✓</div>
                        <div className="text-sm">
                            <strong>Vendas Rápidas:</strong> Para agilizar, você pode usar o PDV (Ponto de Venda)
                            que possui uma interface simplificada
                        </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-purple-50 border border-purple-200 rounded-md">
                        <div className="text-purple-600 font-bold">📊</div>
                        <div className="text-sm">
                            <strong>Relatórios:</strong> Todas as vendas ficam disponíveis nos relatórios para
                            acompanhamento de performance
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
