"use client";

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { HeaderAlerts } from "@/components/header-alerts"
import Link from "next/link"
import { Settings, LogOut, User } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface MainLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: { label: string; href?: string }[];
}

export function MainLayout({ children, breadcrumbs = [] }: MainLayoutProps) {
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "220px",
                } as React.CSSProperties
            }
        >
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <SidebarTrigger className="-ml-1 z-50" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                            </BreadcrumbItem>
                            {breadcrumbs.map((crumb, index) => (
                                <div key={crumb.label} className="flex items-center">
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        {crumb.href ? (
                                            <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                                        ) : (
                                            <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                        )}
                                    </BreadcrumbItem>
                                </div>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>
                    <div className="ml-auto flex items-center gap-4">
                        <HeaderAlerts />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 rounded-full hover:opacity-80 transition-opacity">
                                    <Avatar className="h-8 w-8 border">
                                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">AD</AvatarFallback>
                                    </Avatar>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <div className="flex items-center justify-start gap-2 p-2">
                                    <div className="flex flex-col space-y-1 leading-none">
                                        <p className="font-medium">Admin</p>
                                        <p className="w-[200px] truncate text-xs text-muted-foreground">admin@zerotec.com</p>
                                    </div>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/configuracoes/usuarios/perfil" className="cursor-pointer">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Meu Perfil</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600 cursor-pointer"
                                    onClick={() => {
                                        if (typeof window !== "undefined") {
                                            localStorage.removeItem("access_token");
                                            localStorage.removeItem("refresh_token");
                                            window.location.href = "/login";
                                        }
                                    }}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Sair</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-6 pt-0">
                    <div className="mx-auto w-full max-w-[1600px] min-h-[100vh] flex-1 rounded-xl md:min-h-min pt-6">
                        {children}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
