/**
 * AppSidebar Component
 * Main navigation sidebar for ZeroTec ERP
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    Wrench,
    DollarSign,
    FileText,
    Settings,
    ChevronDown,
    LogOut,
    HelpCircle,
} from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const menuItems = [
    {
        title: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
    },
    {
        title: "Vendas",
        icon: ShoppingCart,
        items: [
            { title: "Listagem", href: "/vendas" },
            { title: "Nova Venda", href: "/vendas/nova" },
            { title: "PDV", href: "/pdv" },
        ],
    },
    {
        title: "Estoque",
        icon: Package,
        href: "/estoque/produtos",
    },
    {
        title: "Serviços",
        icon: Wrench,
        href: "/servicos",
    },
    {
        title: "Clientes",
        icon: Users,
        href: "/clientes",
    },
    {
        title: "Fornecedores",
        icon: Users,
        href: "/fornecedores",
    },
    {
        title: "Compras",
        icon: ShoppingCart,
        href: "/compras",
    },
    {
        title: "Assistência Técnica",
        icon: Wrench,
        items: [
            { title: "Ordens de Serviço", href: "/os" },
            { title: "Nova OS", href: "/os/nova" },
            { title: "Checklist", href: "/configuracoes/checklist" },
            { title: "Cadastro Serviços", href: "/configuracoes/servicos" },
            { title: "Termo de Garantia", href: "/configuracoes/termos-garantia" },
        ],
    },
    {
        title: "Financeiro",
        icon: DollarSign,
        items: [
            { title: "Contas a Pagar", href: "/financeiro/fluxo-caixa?tipo=pagar" },
            { title: "Contas a Receber", href: "/financeiro/fluxo-caixa?tipo=receber" },
            { title: "Fluxo de Caixa", href: "/financeiro/fluxo-caixa" },
            { title: "Formas de Pagamento", href: "/configuracoes/formas-pagamento" },
        ],
    },
    {
        title: "Relatórios",
        icon: FileText,
        items: [
            { title: "DRE", href: "/relatorios/dre" },
            { title: "Vendas", href: "/relatorios/vendas" },
            { title: "Estoque", href: "/relatorios/estoque" },
        ],
    },
    {
        title: "Configurações",
        icon: Settings,
        href: "/configuracoes",
    },
    {
        title: "Ajuda",
        icon: HelpCircle,
        href: "/ajuda",
    },
];

export function AppSidebar() {
    const pathname = usePathname();
    const [openMenus, setOpenMenus] = React.useState<string[]>([]);

    const toggleMenu = (title: string) => {
        setOpenMenus((prev) =>
            prev.includes(title)
                ? prev.filter((item) => item !== title)
                : [...prev, title]
        );
    };

    return (
        <Sidebar>
            <SidebarHeader className="border-b px-6 py-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <span className="text-lg font-bold">Z</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">ZeroTec</h2>
                        <p className="text-xs text-muted-foreground">ERP System</p>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    {item.items ? (
                                        <>
                                            <SidebarMenuButton
                                                onClick={() => toggleMenu(item.title)}
                                                className="w-full"
                                            >
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                                <ChevronDown
                                                    className={`ml-auto h-4 w-4 transition-transform ${openMenus.includes(item.title) ? "rotate-180" : ""
                                                        }`}
                                                />
                                            </SidebarMenuButton>
                                            {openMenus.includes(item.title) && (
                                                <SidebarMenuSub>
                                                    {item.items.map((subItem) => (
                                                        <SidebarMenuSubItem key={subItem.href}>
                                                            <SidebarMenuSubButton
                                                                isActive={pathname === subItem.href}
                                                            >
                                                                <Link href={subItem.href}>{subItem.title}</Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            )}
                                        </>
                                    ) : (
                                        <SidebarMenuButton
                                            asChild
                                            isActive={pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href + "/"))}
                                        >
                                            <Link href={item.href!}>
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    )}
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t p-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-accent">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>AD</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-left text-sm">
                                <p className="font-medium">Admin</p>
                                <p className="text-xs text-muted-foreground">admin@zerotec.com</p>
                            </div>
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            Configurações
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                            if (typeof window !== 'undefined') {
                                localStorage.removeItem('access_token');
                                localStorage.removeItem('refresh_token');
                                window.location.href = '/login';
                            }
                        }}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Sair
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
