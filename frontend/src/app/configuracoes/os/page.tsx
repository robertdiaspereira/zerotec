import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    CheckSquare,
    Wrench,
} from "lucide-react";

export default function ConfiguracaoOSPage() {
    const menus = [
        {
            title: "Checklist",
            description: "Configure os itens de checklist para ordens de serviço",
            icon: CheckSquare,
            href: "/configuracoes/checklist",
            color: "text-blue-500",
        },
        {
            title: "Cadastro de Serviços",
            description: "Gerencie o catálogo de serviços disponíveis",
            icon: Wrench,
            href: "/configuracoes/servicos",
            color: "text-purple-500",
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configuração OS</h1>
                <p className="text-muted-foreground">
                    Configure os parâmetros das ordens de serviço
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
