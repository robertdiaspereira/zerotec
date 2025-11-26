import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AjudaEstoquePage() {
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
                        <Package className="h-6 w-6 text-orange-500" />
                        <h1 className="text-3xl font-bold tracking-tight">Gestão de Estoque</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Como gerenciar produtos e movimentações de estoque
                    </p>
                </div>
            </div>

            {/* Cadastro de Produtos */}
            <Card>
                <CardHeader>
                    <CardTitle>Cadastrar Novo Produto</CardTitle>
                    <CardDescription>
                        Passo a passo para adicionar produtos ao estoque
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white font-bold">
                                    1
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold mb-2">Acessar Cadastro</h3>
                                <p className="text-sm text-muted-foreground">
                                    Menu <Badge variant="outline">Estoque</Badge> → <Badge variant="outline">Produtos</Badge> → Botão "Novo Produto"
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white font-bold">
                                    2
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold mb-2">Informações Básicas</h3>
                                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                                    <li><strong>Nome:</strong> Nome do produto</li>
                                    <li><strong>Código/SKU:</strong> Código único (gerado automaticamente se deixar em branco)</li>
                                    <li><strong>Categoria:</strong> Classifique o produto</li>
                                    <li><strong>Descrição:</strong> Detalhes adicionais</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white font-bold">
                                    3
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold mb-2">Preços e Estoque</h3>
                                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                                    <li><strong>Preço de Custo:</strong> Quanto você paga pelo produto</li>
                                    <li><strong>Preço de Venda:</strong> Quanto você cobra do cliente</li>
                                    <li><strong>Estoque Inicial:</strong> Quantidade atual em estoque</li>
                                    <li><strong>Estoque Mínimo:</strong> Alerta quando atingir este valor</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Movimentações de Estoque */}
            <Card>
                <CardHeader>
                    <CardTitle>Ajustar Estoque</CardTitle>
                    <CardDescription>
                        Como fazer entrada e saída de produtos
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge>Entrada</Badge>
                                <span className="text-sm font-semibold">Adicionar produtos ao estoque</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Use quando receber mercadorias de fornecedores, devoluções de clientes ou correção de inventário.
                            </p>
                            <div className="mt-2 text-xs text-muted-foreground">
                                <strong>Caminho:</strong> Estoque → Ajuste de Estoque → Nova Movimentação → Tipo: Entrada
                            </div>
                        </div>

                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="destructive">Saída</Badge>
                                <span className="text-sm font-semibold">Remover produtos do estoque</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Use para perdas, quebras, doações ou correção de inventário.
                            </p>
                            <div className="mt-2 text-xs text-muted-foreground">
                                <strong>Caminho:</strong> Estoque → Ajuste de Estoque → Nova Movimentação → Tipo: Saída
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 p-3 rounded-md text-xs">
                            <strong>Importante:</strong> Vendas e OS baixam o estoque automaticamente. Use movimentações manuais
                            apenas para ajustes, perdas ou entradas de fornecedores.
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Alertas e Relatórios */}
            <Card>
                <CardHeader>
                    <CardTitle>Alertas e Controles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex gap-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                        <div className="text-amber-600 font-bold">⚠️</div>
                        <div className="text-sm">
                            <strong>Estoque Baixo:</strong> O sistema alerta automaticamente quando produtos atingem
                            o estoque mínimo. Verifique regularmente no Dashboard.
                        </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-green-50 border border-green-200 rounded-md">
                        <div className="text-green-600 font-bold">✓</div>
                        <div className="text-sm">
                            <strong>Histórico:</strong> Cada produto tem um histórico completo de movimentações,
                            vendas e compras. Acesse em Produtos → Selecionar Produto → Histórico.
                        </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-purple-50 border border-purple-200 rounded-md">
                        <div className="text-purple-600 font-bold">📊</div>
                        <div className="text-sm">
                            <strong>Relatórios:</strong> Acesse relatórios detalhados de estoque em
                            Relatórios → Estoque para análises e tomada de decisão.
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
