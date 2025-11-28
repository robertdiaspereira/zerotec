"use client";

import { MainLayout } from "@/components/main-layout";

export default function RelatoriosLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <MainLayout breadcrumbs={[{ label: "Relatórios", href: "/relatorios" }]}>
            {children}
        </MainLayout>
    );
}
