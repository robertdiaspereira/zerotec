'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Shield, ShieldCheck, ShieldAlert } from 'lucide-react';

interface Group {
    id: number;
    name: string;
}

interface UserFormProps {
    id?: number;
}

export default function UserForm({ id }: UserFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(!!id);
    const [groups, setGroups] = useState<Group[]>([]);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        password: '',
        group_id: '',
        is_active: true,
        // Permissões
        can_manage_os: true,
        can_manage_vendas: true,
        can_manage_compras: false,
        can_manage_financeiro: false,
        can_view_relatorios: true,
    });

    useEffect(() => {
        loadGroups();
        if (id) {
            loadUser(id);
        }
    }, [id]);

    const loadGroups = async () => {
        try {
            const data: any = await api.getGroups();
            setGroups(data.results || data);
        } catch (error) {
            console.error('Erro ao carregar grupos:', error);
        }
    };

    const loadUser = async (userId: number) => {
        try {
            const data: any = await api.getUser(userId);
            setFormData({
                username: data.username,
                email: data.email,
                first_name: data.first_name,
                last_name: data.last_name,
                phone: data.phone || '',
                password: '', // Não carregamos a senha
                group_id: data.groups && data.groups.length > 0 ? String(data.groups[0].id) : '',
                is_active: data.is_active,
                can_manage_os: data.can_manage_os,
                can_manage_vendas: data.can_manage_vendas,
                can_manage_compras: data.can_manage_compras,
                can_manage_financeiro: data.can_manage_financeiro,
                can_view_relatorios: data.can_view_relatorios,
            });
        } catch (error) {
            console.error('Erro ao carregar usuário:', error);
            toast({
                title: 'Erro',
                description: 'Não foi possível carregar os dados do usuário.',
                variant: 'destructive',
            });
            router.push('/configuracoes/usuarios');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleGroupChange = (groupId: string) => {
        handleChange('group_id', groupId);

        // Definir permissões padrão baseadas no grupo (opcional, mas útil)
        const group = groups.find(g => String(g.id) === groupId);
        if (group) {
            const name = group.name.toLowerCase();
            if (name.includes('admin')) {
                setFormData(prev => ({
                    ...prev,
                    can_manage_os: true,
                    can_manage_vendas: true,
                    can_manage_compras: true,
                    can_manage_financeiro: true,
                    can_view_relatorios: true,
                }));
            } else if (name.includes('técnico') || name.includes('tecnico')) {
                setFormData(prev => ({
                    ...prev,
                    can_manage_os: true,
                    can_manage_vendas: false,
                    can_manage_compras: false,
                    can_manage_financeiro: false,
                    can_view_relatorios: true,
                }));
            } else if (name.includes('vendedor')) {
                setFormData(prev => ({
                    ...prev,
                    can_manage_os: false,
                    can_manage_vendas: true,
                    can_manage_compras: false,
                    can_manage_financeiro: false,
                    can_view_relatorios: true,
                }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload: any = { ...formData };

            // Tratamento de senha
            if (!payload.password) {
                delete payload.password;
            }

            // Tratamento de grupos
            if (payload.group_id) {
                payload.group_ids = [Number(payload.group_id)];
            } else {
                payload.group_ids = [];
            }
            delete payload.group_id;

            if (id) {
                await api.updateUser(id, payload);
                toast({
                    title: 'Sucesso',
                    description: 'Usuário atualizado com sucesso.',
                });
            } else {
                if (!formData.password) {
                    toast({
                        title: 'Erro',
                        description: 'Senha é obrigatória para novos usuários.',
                        variant: 'destructive',
                    });
                    setLoading(false);
                    return;
                }
                await api.createUser(payload);
                toast({
                    title: 'Sucesso',
                    description: 'Usuário criado com sucesso.',
                });
            }
            router.push('/configuracoes/usuarios');
        } catch (error: any) {
            console.error('Erro ao salvar:', error);
            const msg = error?.response?.data?.username ? 'Nome de usuário já existe.' : 'Não foi possível salvar os dados.';
            toast({
                title: 'Erro',
                description: msg,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold">
                    {id ? 'Editar Usuário' : 'Novo Usuário'}
                </h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Dados Pessoais</CardTitle>
                        <CardDescription>Informações básicas do usuário</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Nome de Usuário *</Label>
                            <Input
                                id="username"
                                value={formData.username}
                                onChange={(e) => handleChange('username', e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">Nome</Label>
                                <Input
                                    id="first_name"
                                    value={formData.first_name}
                                    onChange={(e) => handleChange('first_name', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_name">Sobrenome</Label>
                                <Input
                                    id="last_name"
                                    value={formData.last_name}
                                    onChange={(e) => handleChange('last_name', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefone</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">{id ? 'Nova Senha (opcional)' : 'Senha *'}</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                required={!id}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Perfil de Acesso</CardTitle>
                            <CardDescription>Defina o grupo principal do usuário</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="group">Grupo / Perfil</Label>
                                <Select
                                    value={formData.group_id}
                                    onValueChange={handleGroupChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um perfil" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {groups.map((group) => (
                                            <SelectItem key={group.id} value={String(group.id)}>
                                                {group.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Selecionar um perfil preenche as permissões padrão automaticamente.
                                </p>
                            </div>

                            <div className="flex items-center space-x-2 pt-4">
                                <Checkbox
                                    id="is_active"
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) => handleChange('is_active', checked)}
                                    disabled={formData.username === 'admin'} // Evitar desativar o admin principal
                                />
                                <Label htmlFor="is_active">Usuário Ativo</Label>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Permissões Individuais</CardTitle>
                            <CardDescription>
                                Ajuste fino do que este usuário pode acessar
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between space-x-2 border-b pb-2">
                                <div className="space-y-1">
                                    <Label htmlFor="can_manage_os">Gerenciar Ordens de Serviço</Label>
                                    <p className="text-xs text-muted-foreground">Criar, editar e finalizar OS</p>
                                </div>
                                <Checkbox
                                    id="can_manage_os"
                                    checked={formData.can_manage_os}
                                    onCheckedChange={(checked) => handleChange('can_manage_os', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between space-x-2 border-b pb-2">
                                <div className="space-y-1">
                                    <Label htmlFor="can_manage_vendas">Gerenciar Vendas</Label>
                                    <p className="text-xs text-muted-foreground">Realizar vendas e orçamentos</p>
                                </div>
                                <Checkbox
                                    id="can_manage_vendas"
                                    checked={formData.can_manage_vendas}
                                    onCheckedChange={(checked) => handleChange('can_manage_vendas', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between space-x-2 border-b pb-2">
                                <div className="space-y-1">
                                    <Label htmlFor="can_manage_compras">Gerenciar Compras</Label>
                                    <p className="text-xs text-muted-foreground">Pedidos de compra e fornecedores</p>
                                </div>
                                <Checkbox
                                    id="can_manage_compras"
                                    checked={formData.can_manage_compras}
                                    onCheckedChange={(checked) => handleChange('can_manage_compras', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between space-x-2 border-b pb-2">
                                <div className="space-y-1">
                                    <Label htmlFor="can_manage_financeiro">Gerenciar Financeiro</Label>
                                    <p className="text-xs text-muted-foreground">Fluxo de caixa, contas a pagar/receber</p>
                                </div>
                                <Checkbox
                                    id="can_manage_financeiro"
                                    checked={formData.can_manage_financeiro}
                                    onCheckedChange={(checked) => handleChange('can_manage_financeiro', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between space-x-2">
                                <div className="space-y-1">
                                    <Label htmlFor="can_view_relatorios">Visualizar Relatórios</Label>
                                    <p className="text-xs text-muted-foreground">Acesso a dashboards e relatórios</p>
                                </div>
                                <Checkbox
                                    id="can_view_relatorios"
                                    checked={formData.can_view_relatorios}
                                    onCheckedChange={(checked) => handleChange('can_view_relatorios', checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                >
                    Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar Usuário
                </Button>
            </div>
        </form>
    );
}
