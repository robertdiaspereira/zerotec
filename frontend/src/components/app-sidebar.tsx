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
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar";

import { defaultMenuItems, iconMap } from "@/config/menuItems";
import { useAuth } from "@/contexts/AuthContext";

export function AppSidebar() {
    const pathname = usePathname();
    const { user } = useAuth();
    const [openMenus, setOpenMenus] = React.useState<string[]>([]);
    const [menuItems, setMenuItems] = React.useState(defaultMenuItems);

    // Load persisted order with version check
    React.useEffect(() => {
        const MENU_VERSION = "2.1";
        const savedVersion = localStorage.getItem("sidebarMenuVersion");
        if (savedVersion !== MENU_VERSION) {
            console.log("Nova versão do menu detectada. Limpando cache...");
            localStorage.removeItem("sidebarMenuOrder");
            localStorage.setItem("sidebarMenuVersion", MENU_VERSION);
            setMenuItems(defaultMenuItems);
            return;
        }
        const saved = localStorage.getItem("sidebarMenuOrder");
        if (saved) {
            try {
                const parsedMenu = JSON.parse(saved);
                setMenuItems(parsedMenu);
            } catch (e) {
                console.error("Failed to parse saved menu order", e);
                localStorage.removeItem("sidebarMenuOrder");
                setMenuItems(defaultMenuItems);
            }
        }
    }, []);

    const toggleMenu = (title: string) => {
        setOpenMenus((prev) =>
            prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
        );
    };

    return (
        <Sidebar
            className="border-r"
            style={{ "--sidebar-width": "220px" } as React.CSSProperties}
        >
            <SidebarHeader className="border-b px-3 py-3 flex flex-row items-center justify-start gap-3">
                <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity w-full">
                    <div className="flex h-8 w-8 min-w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <span className="text-base font-bold">Z</span>
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <h2 className="text-base font-bold truncate">ZeroTec</h2>
                        <p className="text-xs text-muted-foreground truncate">ERP - v1.2</p>
                    </div>
                </Link>
            </SidebarHeader>

            <SidebarContent className="px-2 pt-4">
                <SidebarMenu>
                    {menuItems
                        .filter((item) => {
                            // Hide Configurações menu for non-admin users
                            if (item.title === "Configurações" && user && !user.is_superuser && !user.is_staff) {
                                return false;
                            }
                            return true;
                        })
                        .map((item) => {
                            const Icon = iconMap[item.icon] || iconMap.LayoutDashboard;
                            const isActive =
                                pathname === item.href ||
                                (item.href !== "/" && pathname?.startsWith(item.href + "/"));

                            return (
                                <SidebarMenuItem key={item.title}>
                                    {item.items ? (
                                        <>
                                            <SidebarMenuButton
                                                onClick={() => toggleMenu(item.title)}
                                                className="w-full gap-2 px-3"
                                            >
                                                <Icon className="h-4 w-4" />
                                                <span className="text-sm font-medium truncate">{item.title}</span>
                                                <ChevronDown
                                                    className={`ml-auto h-3 w-3 transition-transform ${openMenus.includes(item.title) ? "rotate-180" : ""
                                                        }`}
                                                />
                                            </SidebarMenuButton>
                                            {openMenus.includes(item.title) && (
                                                <SidebarMenuSub>
                                                    {item.items.map((subItem) => (
                                                        <SidebarMenuSubItem key={subItem.href}>
                                                            <SidebarMenuSubButton
                                                                asChild
                                                                isActive={pathname === subItem.href}
                                                            >
                                                                <Link href={subItem.href} className="font-medium">{subItem.title}</Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            )}
                                        </>
                                    ) : (
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            className="gap-2 px-3"
                                        >
                                            <Link href={item.href!}>
                                                <Icon className="h-4 w-4" />
                                                <span className="text-sm font-medium truncate">{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    )}
                                </SidebarMenuItem>
                            );
                        })}
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
    );
}
