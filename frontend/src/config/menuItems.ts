import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    Wrench,
    DollarSign,
    FileText,
    Settings,
    HelpCircle,
    Truck,
    Monitor,
} from "lucide-react";

export const defaultMenuItems = [
    {
        id: "dashboard",
        title: "Dashboard",
        icon: "LayoutDashboard",
        href: "/dashboard",
    },
    {
        id: "vendas",
        title: "Vendas",
        icon: "ShoppingCart",
        href: "/vendas",
    },
    {
        id: "venda-pdv",
        title: "Venda PDV",
        icon: "Monitor",
        href: "/pdv",
    },
    {
        id: "estoque",
        title: "Estoque",
        icon: "Package",
        href: "/estoque/produtos",
    },
    {
        id: "clientes",
        title: "Clientes",
        icon: "Users",
        href: "/clientes",
    },
    {
        id: "fornecedores",
        title: "Fornecedores",
        icon: "Truck",
        href: "/fornecedores",
    },
    {
        id: "compras",
        title: "Compras",
        icon: "ShoppingCart",
        href: "/compras",
    },
    {
        id: "assistencia",
        title: "Assistência Técnica",
        icon: "Wrench",
        href: "/os",
    },
    {
        id: "financeiro",
        title: "Financeiro",
        icon: "DollarSign",
        items: [
            { title: "Contas a Pagar", href: "/financeiro/fluxo-caixa?tipo=pagar" },
            { title: "Contas a Receber", href: "/financeiro/fluxo-caixa?tipo=receber" },
            { title: "Fluxo de Caixa", href: "/financeiro/fluxo-caixa" },
        ],
    },
    {
        id: "relatorios",
        title: "Relatórios",
        icon: "FileText",
        items: [
            { title: "DRE", href: "/relatorios/dre" },
            { title: "Vendas", href: "/relatorios/vendas" },
            { title: "Estoque", href: "/relatorios/estoque" },
        ],
    },
    {
        id: "configuracoes",
        title: "Configurações",
        icon: "Settings",
        href: "/configuracoes",
    },
    {
        id: "ajuda",
        title: "Ajuda",
        icon: "HelpCircle",
        href: "/ajuda",
    },
];

export const iconMap: any = {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    Wrench,
    DollarSign,
    FileText,
    Settings,
    HelpCircle,
    Truck,
    Monitor,
};
