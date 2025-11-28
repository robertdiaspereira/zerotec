"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Loader2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Group {
    id: number;
    name: string;
    can_manage_os: boolean;
    can_manage_vendas: boolean;
    can_manage_compras: boolean;
    can_manage_financeiro: boolean;
    can_view_relatorios: boolean;
}

export default function EditarPerfilPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [group, setGroup] = useState<Group | null>(null);

    useEffect(() => {
        loadGroup();
    }, []);

    const loadGroup = async () => {
        try {
            setLoading(true);
            const data: any = await api.getGroup(parseInt(params.id));
            setGroup(data);
        } catch (error) {
            console.error("Erro ao carregar perfil:", error);
            toast({
                title: "Erro",
                description: "Não foi possível carregar os dados do perfil.",
                variant: "destructive",
            });
            router.push("/configuracoes/usuarios");
        } finally {
            setLoading(false);
        }
    };

    const handlePermissionChange = (permission: keyof Group, checked: boolean) => {
        if (!group) return;
        setGroup({ ...group, [permission]: checked });
    };

    const handleSave = async () => {
        if (!group) return;
        setSaving(true);
        try {
            await api.updateGroup(group.id, group);
            toast({
                title: "Sucesso",
                description: "Permissões atualizadas com sucesso!",
            });
            router.push("/configuracoes/usuarios");
        } catch (error) {
            console.error("Erro ao salvar perfil:", error);
            toast({
                title: "Erro",
                description: "Erro ao salvar as alterações.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!group) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Editar Perfil: {group.name}</h1>
                        <p className="text-muted-foreground">
                            Configure as permissões de acesso para este grupo de usuários
                        </p>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <CardTitle>Permissões de Acesso</CardTitle>
                    </div>
                    <CardDescription>
                        Ative ou desative os módulos que este perfil pode acessar e gerenciar.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    <div className="flex items-center justify-between space-x-2 border-b pb-4">
                        <div className="space-y-0.5">
                            <Label className="text-base">Gerenciar Ordens de Serviço</Label>
                            <p className="text-sm text-muted-foreground">
                                Permite criar, editar e visualizar ordens de serviço e assistência técnica.
                            </p>
                        </div>
                        <Switch
                            checked={group.can_manage_os}
                            onCheckedChange={(checked) => handlePermissionChange('can_manage_os', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between space-x-2 border-b pb-4">
                        <div className="space-y-0.5">
                            <Label className="text-base">Gerenciar Vendas</Label>
                            <p className="text-sm text-muted-foreground">
                                Permite realizar vendas, acessar PDV e gerenciar clientes.
                            </p>
                        </div>
                        <Switch
                            checked={group.can_manage_vendas}
                            onCheckedChange={(checked) => handlePermissionChange('can_manage_vendas', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between space-x-2 border-b pb-4">
                        <div className="space-y-0.5">
                            <Label className="text-base">Gerenciar Compras</Label>
                            <p className="text-sm text-muted-foreground">
                                Permite registrar compras, gerenciar fornecedores e estoque.
                            </p>
                        </div>
                        <Switch
                            checked={group.can_manage_compras}
                            onCheckedChange={(checked) => handlePermissionChange('can_manage_compras', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between space-x-2 border-b pb-4">
                        <div className="space-y-0.5">
                            <Label className="text-base">Gerenciar Financeiro</Label>
                            <p className="text-sm text-muted-foreground">
                                Acesso ao fluxo de caixa, contas a pagar e receber.
                            </p>
                        </div>
                        <Switch
                            checked={group.can_manage_financeiro}
                            onCheckedChange={(checked) => handlePermissionChange('can_manage_financeiro', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-0.5">
                            <Label className="text-base">Visualizar Relatórios</Label>
                            <p className="text-sm text-muted-foreground">
                                Acesso aos relatórios gerenciais e DRE.
                            </p>
                        </div>
                        <Switch
                            checked={group.can_view_relatorios}
                            onCheckedChange={(checked) => handlePermissionChange('can_view_relatorios', checked)}
                        />
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <Button variant="outline" onClick={() => router.back()}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" />
                            Salvar Alterações
                        </Button>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
