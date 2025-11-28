"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Shield, ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    groups: { id: number; name: string }[];
    is_active: boolean;
    last_login: string | null;
}

export default function UsuariosPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [usuarios, setUsuarios] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsuarios();
    }, []);

    const loadUsuarios = async () => {
        try {
            setLoading(true);
            const data: any = await api.getUsers();
            setUsuarios(data.results || data);
        } catch (error) {
            console.error("Erro ao carregar usuários:", error);
            toast({
                title: "Erro",
                description: "Não foi possível carregar a lista de usuários.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const getRoleIcon = (groups: { name: string }[]) => {
        if (!groups || groups.length === 0) return <ShieldAlert className="h-4 w-4 text-gray-500" />;

        const role = groups[0].name.toLowerCase();
        if (role.includes('admin')) return <ShieldCheck className="h-4 w-4 text-red-500" />;
        if (role.includes('técnico') || role.includes('tecnico')) return <Shield className="h-4 w-4 text-blue-500" />;
        return <ShieldAlert className="h-4 w-4 text-gray-500" />;
    };

    const getRoleBadge = (groups: { name: string }[]) => {
        if (!groups || groups.length === 0) return <Badge variant="outline">Sem Perfil</Badge>;

        const roleName = groups[0].name;
        const role = roleName.toLowerCase();

        let variant: "default" | "secondary" | "destructive" | "outline" = "outline";

        if (role.includes('admin')) variant = "destructive";
        else if (role.includes('técnico') || role.includes('tecnico')) variant = "default";
        else if (role.includes('vendedor')) variant = "secondary";

        return <Badge variant={variant}>{roleName}</Badge>;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestão de Usuários</h1>
                    <p className="text-muted-foreground">
                        Gerencie usuários e suas permissões no sistema
                    </p>
                </div>
                <Button onClick={() => router.push('/configuracoes/usuarios/novo')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Usuário
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Usuários do Sistema</CardTitle>
                    <CardDescription>
                        Lista de todos os usuários cadastrados e suas permissões
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Usuário</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Perfil</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Último Acesso</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {usuarios.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Nenhum usuário encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                usuarios.map((usuario) => (
                                    <TableRow key={usuario.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                {getRoleIcon(usuario.groups)}
                                                {usuario.first_name ? `${usuario.first_name} ${usuario.last_name}` : usuario.username}
                                            </div>
                                        </TableCell>
                                        <TableCell>{usuario.email}</TableCell>
                                        <TableCell>{getRoleBadge(usuario.groups)}</TableCell>
                                        <TableCell>
                                            <Badge variant={usuario.is_active ? "default" : "secondary"}>
                                                {usuario.is_active ? "Ativo" : "Inativo"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {usuario.last_login
                                                ? new Date(usuario.last_login).toLocaleString("pt-BR")
                                                : "Nunca acessou"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => router.push(`/configuracoes/usuarios/${usuario.id}`)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Permissões por Perfil */}
            <Card>
                <CardHeader>
                    <CardTitle>Permissões por Perfil</CardTitle>
                    <CardDescription>
                        Configure as permissões de cada tipo de usuário
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => router.push('/configuracoes/usuarios/perfis/1')} // Assuming Admin is ID 1
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="h-5 w-5 text-red-500" />
                                        <CardTitle className="text-base">Administrador</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground">
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Acesso total ao sistema</li>
                                        <li>Gerenciar usuários</li>
                                        <li>Configurações avançadas</li>
                                        <li>Visualizar logs</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => router.push('/configuracoes/usuarios/perfis/2')} // Assuming Técnico is ID 2
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-blue-500" />
                                        <CardTitle className="text-base">Técnico</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground">
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Criar e editar OS</li>
                                        <li>Gerenciar estoque</li>
                                        <li>Visualizar relatórios</li>
                                        <li>Sem acesso a configurações</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => router.push('/configuracoes/usuarios/perfis/3')} // Assuming Vendedor is ID 3
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <ShieldAlert className="h-5 w-5 text-gray-500" />
                                        <CardTitle className="text-base">Vendedor</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground">
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Criar vendas</li>
                                        <li>Visualizar clientes</li>
                                        <li>Consultar estoque</li>
                                        <li>Sem acesso a OS</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
