"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Shield, ShieldCheck, ShieldAlert } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function UsuariosPage() {
    // Mock data - substituir por dados reais da API
    const usuarios = [
        {
            id: 1,
            nome: "Admin Sistema",
            email: "admin@zerotec.com",
            role: "admin",
            ativo: true,
            ultimo_acesso: "2025-11-26 17:30:00"
        },
        {
            id: 2,
            nome: "João Silva",
            email: "joao@zerotec.com",
            role: "tecnico",
            ativo: true,
            ultimo_acesso: "2025-11-26 15:20:00"
        },
        {
            id: 3,
            nome: "Maria Santos",
            email: "maria@zerotec.com",
            role: "vendedor",
            ativo: true,
            ultimo_acesso: "2025-11-25 18:45:00"
        },
    ];

    const getRoleIcon = (role: string) => {
        switch (role) {
            case "admin":
                return <ShieldCheck className="h-4 w-4 text-red-500" />;
            case "tecnico":
                return <Shield className="h-4 w-4 text-blue-500" />;
            default:
                return <ShieldAlert className="h-4 w-4 text-gray-500" />;
        }
    };

    const getRoleBadge = (role: string) => {
        const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
            admin: { label: "Administrador", variant: "destructive" },
            tecnico: { label: "Técnico", variant: "default" },
            vendedor: { label: "Vendedor", variant: "secondary" },
        };

        const config = variants[role] || { label: role, variant: "outline" };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestão de Usuários</h1>
                    <p className="text-muted-foreground">
                        Gerencie usuários e suas permissões no sistema
                    </p>
                </div>
                <Button>
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
                            {usuarios.map((usuario) => (
                                <TableRow key={usuario.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {getRoleIcon(usuario.role)}
                                            {usuario.nome}
                                        </div>
                                    </TableCell>
                                    <TableCell>{usuario.email}</TableCell>
                                    <TableCell>{getRoleBadge(usuario.role)}</TableCell>
                                    <TableCell>
                                        <Badge variant={usuario.ativo ? "default" : "secondary"}>
                                            {usuario.ativo ? "Ativo" : "Inativo"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(usuario.ultimo_acesso).toLocaleString("pt-BR")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
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
                            <Card>
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

                            <Card>
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

                            <Card>
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
