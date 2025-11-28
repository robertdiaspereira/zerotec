import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Settings,
    Users,
    Building2,
    History,
    LayoutDashboard,
} from "lucide-react";

export default function ConfiguracoesPage() {
    const menus = [
        {
            title: "Dashboard",
            description: "Configure widgets e métricas do painel principal",
            icon: LayoutDashboard,
            href: "/configuracoes/dashboard",
            color: "text-blue-500",
        },
        {
            title: "Gestão de Usuários",
            description: "Controlar permissões e acessos dos funcionários",
            icon: Users,
            href: "/configuracoes/usuarios",
            color: "text-indigo-500",
        },
        {
            title: "Perfil da Empresa",
            description: "Dados da empresa para documentos e relatórios",
            icon: Building2,
            href: "/configuracoes/empresa",
            color: "text-cyan-500",
        },
        {
            title: "Histórico LOG",
            description: "Auditoria de alterações no sistema",
            icon: History,
            href: "/configuracoes/logs",
            color: "text-amber-500",
        },
        {
            title: "Menu Lateral",
            description: "Personalize a ordem do menu lateral",
            icon: Settings,
            href: "/configuracoes/menu",
            color: "text-purple-500",
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
                <p className="text-muted-foreground">
                    Gerencie as configurações do sistema
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {menus.map((menu) => (
                    <Link key={menu.href} href={menu.href}>
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {menu.title}
                                </CardTitle>
                                <menu.icon className={`h-4 w-4 ${menu.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold"></div>
                                <p className="text-xs text-muted-foreground">
                                    {menu.description}
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
