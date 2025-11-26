/**
 * Dashboard Layout
 * Main layout wrapper with sidebar for authenticated pages
 */

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

import { HeaderAlerts } from "@/components/header-alerts";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebar />
                <main className="flex-1">
                    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <div className="flex h-14 items-center px-4 justify-between">
                            <SidebarTrigger />
                            <HeaderAlerts />
                        </div>
                    </div>
                    <div className="flex-1 space-y-4 p-8 pt-6">{children}</div>
                </main>
            </div>
        </SidebarProvider>
    );
}
