"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Building2,
    Plus,
    Search,
    Edit,
    Trash2,
    Phone,
    Mail,
    MapPin,
    Loader2,
    TrendingUp
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function FornecedoresPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = React.useState(false);
    const [fornecedores, setFornecedores] = React.useState<any[]>([]);
    const [search, setSearch] = React.useState("");

    React.useEffect(() => {
        loadFornecedores();
    }, []);

    const loadFornecedores = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (search) params.search = search;

            const data: any = await api.getFornecedores(params);
            setFornecedores(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error("Erro ao carregar fornecedores:", error);
            toast({
                title: "Erro",
                description: "Não foi possível carregar os fornecedores.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        loadFornecedores();
    };

    const handleDelete = async (id: number, nome: string) => {
        if (!confirm(`Tem certeza que deseja excluir o fornecedor "${nome}"?`)) {
            return;
        }

        try {
            await api.deleteFornecedor(id);
            toast({
                title: "Sucesso",
                description: "Fornecedor excluído com sucesso!",
            });
            loadFornecedores();
        } catch (error) {
            console.error("Erro ao excluir fornecedor:", error);
            toast({
                title: "Erro",
                description: "Não foi possível excluir o fornecedor.",
                variant: "destructive",
            });
        }
    };

    const formatCNPJ = (cnpj: string) => {
        if (!cnpj) return "-";
        const cleaned = cnpj.replace(/\D/g, "");
        if (cleaned.length === 14) {
            return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
        }
        return cnpj;
    };

    const formatPhone = (phone: string) => {
        if (!phone) return "-";
        const cleaned = phone.replace(/\D/g, "");
        if (cleaned.length === 11) {
            return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
        } else if (cleaned.length === 10) {
            return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
        }
        return phone;
    };

    const fornecedoresAtivos = fornecedores.filter(f => f.active).length;
    const totalCompras = fornecedores.reduce((sum, f) => sum + (f.total_compras || 0), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Fornecedores</h1>
                    <p className="text-muted-foreground">
                        Gerencie seus fornecedores e histórico de compras
                    </p>
                </div>
                <Button onClick={() => router.push("/fornecedores/novo")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Fornecedor
                </Button>
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Fornecedores Ativos</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{fornecedoresAtivos}</div>
                        <p className="text-xs text-muted-foreground">
                            de {fornecedores.length} cadastrados
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Comprado</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                            }).format(totalCompras)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Histórico total
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Média por Fornecedor</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                            }).format(fornecedoresAtivos > 0 ? totalCompras / fornecedoresAtivos : 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Por fornecedor ativo
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filtros */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Buscar por razão social, nome fantasia ou CNPJ..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                        </div>
                        <Button onClick={handleSearch}>
                            <Search className="mr-2 h-4 w-4" />
                            Buscar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Tabela */}
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Fornecedores</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fornecedor</TableHead>
                                    <TableHead>CNPJ</TableHead>
                                    <TableHead>Cidade/UF</TableHead>
                                    <TableHead>Contato</TableHead>
                                    <TableHead className="text-right">Total Compras</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fornecedores.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            Nenhum fornecedor encontrado.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    fornecedores.map((fornecedor) => (
                                        <TableRow key={fornecedor.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{fornecedor.razao_social}</div>
                                                    {fornecedor.nome_fantasia && (
                                                        <div className="text-sm text-muted-foreground">
                                                            {fornecedor.nome_fantasia}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {formatCNPJ(fornecedor.cnpj)}
                                            </TableCell>
                                            <TableCell>
                                                {fornecedor.cidade && fornecedor.estado ? (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <MapPin className="h-3 w-3" />
                                                        {fornecedor.cidade}/{fornecedor.estado}
                                                    </div>
                                                ) : (
                                                    "-"
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1 text-sm">
                                                    {fornecedor.telefone_principal && (
                                                        <div className="flex items-center gap-1">
                                                            <Phone className="h-3 w-3" />
                                                            {formatPhone(fornecedor.telefone_principal)}
                                                        </div>
                                                    )}
                                                    {fornecedor.email && (
                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                            <Mail className="h-3 w-3" />
                                                            {fornecedor.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {new Intl.NumberFormat("pt-BR", {
                                                    style: "currency",
                                                    currency: "BRL",
                                                }).format(fornecedor.total_compras || 0)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={fornecedor.active ? "default" : "secondary"}>
                                                    {fornecedor.active ? "Ativo" : "Inativo"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.push(`/fornecedores/${fornecedor.id}/editar`)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(fornecedor.id, fornecedor.razao_social)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
