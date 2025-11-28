"use client";

import { MainLayout } from "@/components/main-layout";

export default function FornecedoresLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <MainLayout breadcrumbs={[{ label: "Fornecedores", href: "/fornecedores" }]}>
            {children}
        </MainLayout>
    );
}
