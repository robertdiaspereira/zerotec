"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function PerfilPage() {
    const { user } = useAuth();

    if (!user) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Informações Pessoais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="username">Usuário</Label>
                            <Input
                                id="username"
                                value={user.username}
                                disabled
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                value={user.email}
                                disabled
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="first_name">Nome</Label>
                            <Input
                                id="first_name"
                                value={user.first_name}
                                disabled
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last_name">Sobrenome</Label>
                            <Input
                                id="last_name"
                                value={user.last_name}
                                disabled
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <p className="text-sm text-muted-foreground">
                            Para alterar suas informações, entre em contato com o administrador do sistema.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Permissões</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Administrador</p>
                            <p className="text-sm text-muted-foreground">
                                Acesso total ao sistema
                            </p>
                        </div>
                        <div className="text-sm font-medium">
                            {user.is_superuser ? (
                                <span className="text-green-600">Sim</span>
                            ) : (
                                <span className="text-muted-foreground">Não</span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Staff</p>
                            <p className="text-sm text-muted-foreground">
                                Acesso à área administrativa
                            </p>
                        </div>
                        <div className="text-sm font-medium">
                            {user.is_staff ? (
                                <span className="text-green-600">Sim</span>
                            ) : (
                                <span className="text-muted-foreground">Não</span>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
