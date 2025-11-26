import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    HelpCircle,
    ShoppingCart,
    Wrench,
    Package,
    Users,
} from "lucide-react";

export default function AjudaPage() {
    const guias = [
        {
            title: "Nova Venda",
            description: "Aprenda a criar e gerenciar vendas no sistema",
            icon: ShoppingCart,
            href: "/ajuda/vendas",
            color: "text-green-500",
        },
        {
            title: "Nova Ordem de Serviço",
            description: "Como criar e acompanhar ordens de serviço",
            icon: Wrench,
            href: "/ajuda/os",
            color: "text-blue-500",
        },
        {
            title: "Gestão de Estoque",
            description: "Controle de produtos e movimentações",
            icon: Package,
            href: "/ajuda/estoque",
            color: "text-orange-500",
        },
        {
            title: "Cadastro de Clientes",
            description: "Como cadastrar e gerenciar clientes",
            icon: Users,
            href: "/ajuda/clientes",
            color: "text-purple-500",
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Central de Ajuda</h1>
                <p className="text-muted-foreground">
                    Guias e tutoriais para utilizar o sistema ZeroTec
                </p>
            </div>

            {/* Guias Principais */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                {guias.map((guia) => (
                    <Link key={guia.href} href={guia.href}>
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {guia.title}
                                </CardTitle>
                                <guia.icon className={`h-4 w-4 ${guia.color}`} />
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground">
                                    {guia.description}
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* FAQ */}
            <Card>
                <CardHeader>
                    <CardTitle>Perguntas Frequentes</CardTitle>
                    <CardDescription>
                        Dúvidas comuns sobre o sistema
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <div className="border-b pb-3">
                            <h3 className="font-semibold text-sm mb-1">Como faço para cancelar uma venda?</h3>
                            <p className="text-xs text-muted-foreground">
                                Acesse a listagem de vendas, clique na venda desejada e utilize o botão "Cancelar Venda".
                                Vendas canceladas não podem ser revertidas.
                            </p>
                        </div>
                        <div className="border-b pb-3">
                            <h3 className="font-semibold text-sm mb-1">Como configurar as taxas de cartão?</h3>
                            <p className="text-xs text-muted-foreground">
                                As formas de recebimento e suas taxas são configuradas no menu Financeiro → Formas de Recebimento.
                                Informe as taxas cobradas pela operadora para cada tipo de pagamento.
                            </p>
                        </div>
                        <div className="border-b pb-3">
                            <h3 className="font-semibold text-sm mb-1">Como visualizar o histórico de alterações?</h3>
                            <p className="text-xs text-muted-foreground">
                                Acesse Configurações → Histórico LOG para ver todas as alterações realizadas no sistema,
                                incluindo usuário, data, hora e descrição da ação.
                            </p>
                        </div>
                        <div className="pb-3">
                            <h3 className="font-semibold text-sm mb-1">Como dar permissões para funcionários?</h3>
                            <p className="text-xs text-muted-foreground">
                                Em Configurações → Gestão de Usuários você pode criar novos usuários e definir o perfil
                                (Administrador, Técnico ou Vendedor) com permissões específicas.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
