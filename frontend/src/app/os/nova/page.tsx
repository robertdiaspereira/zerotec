/**
 * Nova Ordem de Serviço - Versão Completa
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus, Trash2, Search, CreditCard, Upload } from "lucide-react";
import api from "@/lib/api";
import { SeletorPagamento } from "@/components/vendas/SeletorPagamento";
import { useToast } from "@/hooks/use-toast";

interface CarrinhoItem {
    id: string;
    tipo: "produto" | "servico";
    nome: string;
    quantidade: number;
    valor_unitario: number;
    valor_total: number;
    servico_id?: number;
}

interface ChecklistItem {
    id: number;
    label: string;
    ordem: number;
    ativo: boolean;
    checked?: boolean;
}

interface ServicoTemplate {
    id: number;
    descricao: string;
    valor_padrao: string;
}

interface TermoGarantia {
    id: number;
    titulo: string;
    conteudo: string;
    tipo: "produto" | "servico";
    padrao: boolean;
}

interface PagamentoInfo {
    formaRecebimentoId: number;
    parcelas: number;
    valor: number;
}

export default function NovaOSPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = React.useState(false);
    const [clientes, setClientes] = React.useState<any[]>([]);
    const [carrinho, setCarrinho] = React.useState<CarrinhoItem[]>([]);

    const [checklistItems, setChecklistItems] = React.useState<ChecklistItem[]>([]);
    const [servicosTemplate, setServicosTemplate] = React.useState<ServicoTemplate[]>([]);
    const [termosGarantia, setTermosGarantia] = React.useState<TermoGarantia[]>([]);
    const [searchResults, setSearchResults] = React.useState<any[]>([]);

    const [formData, setFormData] = React.useState({
        cliente_id: "",
        status: "aberta",
        data_inicio: new Date().toISOString().split("T")[0],
        data_entrega: "",
        responsavel: "",
        equipamento: "",
        numero_serie: "",
        marca: "",
        modelo: "",
        obs_recebimento: "",
        defeito_reclamado: "",
        laudo_tecnico: "",
        obs_internas: "",
        obs_cliente: "",
        valor_frete: "0",
        valor_desconto: "0",
        termo_garantia_produto_id: "",
        termo_garantia_servico_id: "",
    });

    const [pagamentoInfo, setPagamentoInfo] = React.useState<PagamentoInfo | null>(null);

    const [novoServico, setNovoServico] = React.useState({
        template_id: "",
        descricao: "",
        quantidade: 1,
        valor: 0,
    });

    React.useEffect(() => {
        async function loadData() {
            try {
                // Usando fetch direto para endpoints que ainda não estão no api.ts
                // Idealmente mover tudo para api.ts
                const [clientesRes, checklistRes, servicosRes, termosRes] = await Promise.all([
                    api.getClientes(),
                    fetch("http://localhost:8000/api/assistencia/checklist-items/"),
                    fetch("http://localhost:8000/api/assistencia/servicos-template/"),
                    fetch("http://localhost:8000/api/assistencia/termos-garantia/"),
                ]);

                const clientesData = clientesRes; // api.getClientes já retorna json
                const checklistData = await checklistRes.json();
                const servicosData = await servicosRes.json();
                const termosData = await termosRes.json();

                setClientes(Array.isArray(clientesData) ? clientesData : clientesData.results || []);

                const checklistArray = Array.isArray(checklistData) ? checklistData : checklistData.results || [];
                setChecklistItems(checklistArray.filter((item: any) => item.ativo).map((item: any) => ({
                    ...item,
                    checked: false
                })));

                setServicosTemplate(Array.isArray(servicosData) ? servicosData : servicosData.results || []);
                setTermosGarantia(Array.isArray(termosData) ? termosData : termosData.results || []);

                const defaultProduto = termosData.find((t: any) => t.tipo === "produto" && t.padrao);
                const defaultServico = termosData.find((t: any) => t.tipo === "servico" && t.padrao);

                if (defaultProduto || defaultServico) {
                    setFormData(prev => ({
                        ...prev,
                        termo_garantia_produto_id: defaultProduto?.id.toString() || "",
                        termo_garantia_servico_id: defaultServico?.id.toString() || "",
                    }));
                }

            } catch (error) {
                console.error("Erro ao carregar dados:", error);
                toast({
                    title: "Erro",
                    description: "Erro ao carregar dados iniciais.",
                    variant: "destructive",
                });
            }
        }
        loadData();
    }, []);

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleChecklistChange = (id: number, checked: boolean) => {
        setChecklistItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, checked } : item))
        );
    };

    const handleServicoTemplateChange = (templateId: string) => {
        const template = servicosTemplate.find(s => s.id.toString() === templateId);
        if (template) {
            setNovoServico({
                ...novoServico,
                template_id: templateId,
                descricao: template.descricao,
                valor: parseFloat(template.valor_padrao),
            });
        }
    };

    const adicionarServico = () => {
        if (!novoServico.descricao || novoServico.valor <= 0) {
            toast({
                title: "Atenção",
                description: "Preencha descrição e valor do serviço",
                variant: "destructive",
            });
            return;
        }

        const item: CarrinhoItem = {
            id: Date.now().toString(),
            tipo: "servico",
            nome: novoServico.descricao,
            quantidade: novoServico.quantidade,
            valor_unitario: novoServico.valor,
            valor_total: novoServico.quantidade * novoServico.valor,
            servico_id: novoServico.template_id ? parseInt(novoServico.template_id) : undefined,
        };

        setCarrinho([...carrinho, item]);
        setNovoServico({ template_id: "", descricao: "", quantidade: 1, valor: 0 });
    };

    const removerItem = (id: string) => {
        setCarrinho(carrinho.filter((item) => item.id !== id));
    };

    const calcularTotais = () => {
        const totalProdutos = carrinho
            .filter((i) => i.tipo === "produto")
            .reduce((sum, i) => sum + i.valor_total, 0);

        const totalServicos = carrinho
            .filter((i) => i.tipo === "servico")
            .reduce((sum, i) => sum + i.valor_total, 0);

        const frete = parseFloat(formData.valor_frete) || 0;
        const desconto = parseFloat(formData.valor_desconto) || 0;
        const totalGeral = totalProdutos + totalServicos + frete - desconto;

        return { totalProdutos, totalServicos, frete, desconto, totalGeral };
    };

    const handleSubmit = async () => {
        if (!formData.cliente_id || !formData.equipamento || !formData.defeito_reclamado) {
            toast({
                title: "Atenção",
                description: "Preencha os campos obrigatórios: Cliente, Equipamento e Defeito Reclamado",
                variant: "destructive",
            });
            return;
        }

        try {
            setLoading(true);
            const totais = calcularTotais();

            const checklistData = checklistItems.reduce((acc: any, item) => {
                acc[item.label] = item.checked;
                return acc;
            }, {});

            const payload = {
                cliente: parseInt(formData.cliente_id),
                equipamento: formData.equipamento,
                marca: formData.marca,
                modelo: formData.modelo,
                numero_serie: formData.numero_serie,
                defeito_relatado: formData.defeito_reclamado,
                diagnostico: formData.laudo_tecnico,
                status: formData.status,
                data_previsao: formData.data_entrega || null,
                valor_servico: totais.totalServicos,
                valor_pecas: totais.totalProdutos,
                valor_desconto: totais.desconto,
                valor_frete: parseFloat(formData.valor_frete) || 0,
                observacoes_internas: formData.obs_internas,
                observacoes_cliente: formData.obs_cliente,
                checklist: checklistData,
                obs_recebimento: formData.obs_recebimento,
                // forma_pagamento removido do payload principal pois agora é via RecebimentoOS
            };

            const response = await fetch("http://localhost:8000/api/assistencia/ordens-servico/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const data = await response.json();

                // Se houver pagamento selecionado, cria o RecebimentoOS
                if (pagamentoInfo) {
                    await api.createRecebimentoOS({
                        ordem_servico: data.id,
                        forma_recebimento: pagamentoInfo.formaRecebimentoId,
                        valor_bruto: pagamentoInfo.valor,
                        parcelas: pagamentoInfo.parcelas,
                        data_vencimento: new Date().toISOString().split('T')[0]
                    });
                }

                toast({
                    title: "Sucesso",
                    description: "Ordem de Serviço criada com sucesso!",
                });
                router.push(`/os/${data.id}`);
            } else {
                toast({
                    title: "Erro",
                    description: "Erro ao criar ordem de serviço",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Erro:", error);
            toast({
                title: "Erro",
                description: "Erro ao criar ordem de serviço",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const totais = calcularTotais();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push("/os")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Nova OS</h1>
                        <p className="text-muted-foreground">Criar nova ordem de serviço</p>
                    </div>
                </div>
                <Button onClick={handleSubmit} disabled={loading} size="lg">
                    {loading ? "Salvando..." : "Salvar OS"}
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Coluna Principal */}
                <div className="lg:col-span-2 space-y-6">
                    <Tabs defaultValue="dados" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="dados">Ordem de Serviço</TabsTrigger>
                            <TabsTrigger value="servicos">Serviços</TabsTrigger>
                            <TabsTrigger value="produtos">Produtos</TabsTrigger>
                            <TabsTrigger value="anexos">Anexos</TabsTrigger>
                        </TabsList>

                        {/* Tab: Dados Principais */}
                        <TabsContent value="dados" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Dados Principais</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Cliente *</Label>
                                            <Select
                                                value={formData.cliente_id}
                                                onValueChange={(value) => handleChange("cliente_id", value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {clientes.map((c) => (
                                                        <SelectItem key={c.id} value={c.id.toString()}>
                                                            {c.nome_razao_social}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Status</Label>
                                            <Select
                                                value={formData.status}
                                                onValueChange={(value) => handleChange("status", value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="aberta">Aberta</SelectItem>
                                                    <SelectItem value="em_diagnostico">Em Diagnóstico</SelectItem>
                                                    <SelectItem value="orcamento">Aguardando Orçamento</SelectItem>
                                                    <SelectItem value="aprovada">Aprovada</SelectItem>
                                                    <SelectItem value="em_execucao">Em Execução</SelectItem>
                                                    <SelectItem value="aguardando_peca">Aguardando Peça</SelectItem>
                                                    <SelectItem value="concluida">Concluída</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label>Data Início</Label>
                                            <Input
                                                type="date"
                                                value={formData.data_inicio}
                                                onChange={(e) => handleChange("data_inicio", e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Previsão Entrega</Label>
                                            <Input
                                                type="date"
                                                value={formData.data_entrega}
                                                onChange={(e) => handleChange("data_entrega", e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Responsável</Label>
                                            <Input
                                                value={formData.responsavel}
                                                onChange={(e) => handleChange("responsavel", e.target.value)}
                                                placeholder="Técnico"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Equipamento *</Label>
                                            <Input
                                                value={formData.equipamento}
                                                onChange={(e) => handleChange("equipamento", e.target.value)}
                                                placeholder="Ex: Notebook"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Nº de Série</Label>
                                            <Input
                                                value={formData.numero_serie}
                                                onChange={(e) => handleChange("numero_serie", e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Marca</Label>
                                            <Input
                                                value={formData.marca}
                                                onChange={(e) => handleChange("marca", e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Modelo</Label>
                                            <Input
                                                value={formData.modelo}
                                                onChange={(e) => handleChange("modelo", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Checklist */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Checklist de Entrada</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {checklistItems.map((item) => (
                                            <div key={item.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`check-${item.id}`}
                                                    checked={item.checked}
                                                    onCheckedChange={(checked) =>
                                                        handleChecklistChange(item.id, checked as boolean)
                                                    }
                                                />
                                                <label htmlFor={`check-${item.id}`} className="text-sm cursor-pointer">
                                                    {item.label}
                                                </label>
                                            </div>
                                        ))}
                                        {checklistItems.length === 0 && (
                                            <p className="text-muted-foreground text-sm col-span-3">
                                                Nenhum item de checklist configurado.
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Observações */}
                            <Card>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="space-y-2">
                                        <Label>Obs. sobre o recebimento</Label>
                                        <Textarea
                                            value={formData.obs_recebimento}
                                            onChange={(e) => handleChange("obs_recebimento", e.target.value)}
                                            rows={2}
                                            placeholder="Estado físico do equipamento, arranhões, etc."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Defeito Relatado *</Label>
                                        <Textarea
                                            value={formData.defeito_reclamado}
                                            onChange={(e) => handleChange("defeito_reclamado", e.target.value)}
                                            rows={3}
                                            placeholder="Descrição do problema informado pelo cliente"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Diagnóstico Técnico</Label>
                                        <Textarea
                                            value={formData.laudo_tecnico}
                                            onChange={(e) => handleChange("laudo_tecnico", e.target.value)}
                                            rows={3}
                                            placeholder="Análise técnica do problema"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Observações Internas</Label>
                                        <Textarea
                                            value={formData.obs_internas}
                                            onChange={(e) => handleChange("obs_internas", e.target.value)}
                                            rows={2}
                                            className="border-yellow-300 bg-yellow-50"
                                            placeholder="Anotações visíveis apenas para a equipe"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tab: Serviços */}
                        <TabsContent value="servicos">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Adicionar Serviço</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Selecionar Serviço (Catálogo)</Label>
                                        <Select
                                            value={novoServico.template_id}
                                            onValueChange={handleServicoTemplateChange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione um serviço pré-cadastrado..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {servicosTemplate.map((s) => (
                                                    <SelectItem key={s.id} value={s.id.toString()}>
                                                        {s.descricao} - {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(parseFloat(s.valor_padrao))}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Descrição do Serviço</Label>
                                        <Input
                                            value={novoServico.descricao}
                                            onChange={(e) =>
                                                setNovoServico({ ...novoServico, descricao: e.target.value })
                                            }
                                            placeholder="Ex: Troca de tela"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Quantidade</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={novoServico.quantidade}
                                                onChange={(e) =>
                                                    setNovoServico({
                                                        ...novoServico,
                                                        quantidade: parseInt(e.target.value) || 1,
                                                    })
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Valor Unitário</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={novoServico.valor}
                                                onChange={(e) =>
                                                    setNovoServico({
                                                        ...novoServico,
                                                        valor: parseFloat(e.target.value) || 0,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>

                                    <Button onClick={adicionarServico} className="w-full">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Adicionar Serviço
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tab: Produtos */}
                        <TabsContent value="produtos">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Adicionar Produto</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Buscar produto por nome ou código..."
                                            onChange={(e) => {
                                                const term = e.target.value;
                                                if (term.length > 2) {
                                                    fetch(`http://localhost:8000/api/erp/produtos/?search=${term}`)
                                                        .then(res => res.json())
                                                        .then(data => {
                                                            const products = (Array.isArray(data) ? data : data.results)
                                                                .filter((p: any) => p.active && p.tipo === 'produto');
                                                            setSearchResults(products);
                                                        });
                                                } else {
                                                    setSearchResults([]);
                                                }
                                            }}
                                        />
                                        <Button variant="outline">
                                            <Search className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {searchResults.length > 0 ? (
                                        <div className="border rounded-md max-h-[300px] overflow-y-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Produto</TableHead>
                                                        <TableHead className="text-right">Preço</TableHead>
                                                        <TableHead className="text-center">Estoque</TableHead>
                                                        <TableHead className="text-right">Ação</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {searchResults.map((produto: any) => (
                                                        <TableRow key={produto.id}>
                                                            <TableCell>
                                                                <div className="font-medium">{produto.nome}</div>
                                                                <div className="text-xs text-muted-foreground">{produto.codigo_interno}</div>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(parseFloat(produto.preco_venda))}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Badge variant={produto.estoque_atual > 0 ? "outline" : "destructive"}>
                                                                    {produto.estoque_atual}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Button
                                                                    size="sm"
                                                                    disabled={produto.estoque_atual <= 0}
                                                                    onClick={() => {
                                                                        const item: CarrinhoItem = {
                                                                            id: Date.now().toString(),
                                                                            tipo: "produto",
                                                                            nome: produto.nome,
                                                                            quantidade: 1,
                                                                            valor_unitario: parseFloat(produto.preco_venda),
                                                                            valor_total: parseFloat(produto.preco_venda),
                                                                        };
                                                                        setCarrinho([...carrinho, item]);
                                                                    }}
                                                                >
                                                                    <Plus className="h-4 w-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            Digite o nome do produto para buscar...
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tab: Anexos */}
                        <TabsContent value="anexos">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Anexos</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                                        <div className="flex flex-col items-center gap-2">
                                            <Upload className="h-8 w-8 text-muted-foreground" />
                                            <p className="text-sm font-medium">Clique para adicionar arquivos</p>
                                            <p className="text-xs text-muted-foreground">Fotos, documentos, etc.</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground text-center">
                                        Funcionalidade de upload será implementada na próxima etapa.
                                    </p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Tabela de Itens */}
                    {carrinho.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Produtos e Serviços</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Produto/Serviço</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead className="text-center">Qtd</TableHead>
                                            <TableHead className="text-right">Valor</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                            <TableHead className="text-right">Ação</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {carrinho.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>{item.nome}</TableCell>
                                                <TableCell>
                                                    <Badge variant={item.tipo === "produto" ? "default" : "secondary"}>
                                                        {item.tipo === "produto" ? "Produto" : "Serviço"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">{item.quantidade}</TableCell>
                                                <TableCell className="text-right">
                                                    {new Intl.NumberFormat("pt-BR", {
                                                        style: "currency",
                                                        currency: "BRL",
                                                    }).format(item.valor_unitario)}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {new Intl.NumberFormat("pt-BR", {
                                                        style: "currency",
                                                        currency: "BRL",
                                                    }).format(item.valor_total)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removerItem(item.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Coluna Lateral - Resumo */}
                <div className="space-y-6">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle>Resumo Financeiro</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Total Produtos:</span>
                                    <span>
                                        {new Intl.NumberFormat("pt-BR", {
                                            style: "currency",
                                            currency: "BRL",
                                        }).format(totais.totalProdutos)}
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span>Total Serviços:</span>
                                    <span>
                                        {new Intl.NumberFormat("pt-BR", {
                                            style: "currency",
                                            currency: "BRL",
                                        }).format(totais.totalServicos)}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                    <span>Frete:</span>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.valor_frete}
                                        onChange={(e) => handleChange("valor_frete", e.target.value)}
                                        className="w-24 h-8 text-right"
                                    />
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                    <span>Desconto:</span>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.valor_desconto}
                                        onChange={(e) => handleChange("valor_desconto", e.target.value)}
                                        className="w-24 h-8 text-right"
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="flex justify-between text-lg font-bold">
                                <span>Total Geral:</span>
                                <span>
                                    {new Intl.NumberFormat("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                    }).format(totais.totalGeral)}
                                </span>
                            </div>

                            <Separator />

                            {/* Pagamento */}
                            <div className="space-y-3 pt-2">
                                <h4 className="font-medium flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    Pagamento
                                </h4>

                                <SeletorPagamento
                                    valorTotal={totais.totalGeral}
                                    onChange={setPagamentoInfo}
                                />
                            </div>

                            <Separator />

                            {/* Garantia */}
                            <div className="space-y-3 pt-2">
                                <h4 className="font-medium text-sm">Garantia</h4>
                                <div className="space-y-2">
                                    <Label className="text-xs">Termo para Serviços</Label>
                                    <Select
                                        value={formData.termo_garantia_servico_id}
                                        onValueChange={(value) => handleChange("termo_garantia_servico_id", value)}
                                    >
                                        <SelectTrigger className="h-8">
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {termosGarantia.filter(t => t.tipo === "servico").map((t) => (
                                                <SelectItem key={t.id} value={t.id.toString()}>
                                                    {t.titulo}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
