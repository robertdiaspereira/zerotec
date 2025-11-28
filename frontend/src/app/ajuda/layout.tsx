"use client";

import { MainLayout } from "@/components/main-layout";

export default function AjudaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <MainLayout breadcrumbs={[{ label: "Ajuda", href: "/ajuda" }]}>
            {children}
        </MainLayout>
    );
}
