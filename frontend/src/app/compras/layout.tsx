"use client";

import { MainLayout } from "@/components/main-layout";

export default function ComprasLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <MainLayout breadcrumbs={[{ label: "Compras", href: "/compras" }]}>
            {children}
        </MainLayout>
    );
}
