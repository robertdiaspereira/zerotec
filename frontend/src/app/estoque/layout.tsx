/**
 * Estoque Layout
 * Layout wrapper with sidebar for estoque pages
 */

import { MainLayout } from "@/components/main-layout";

export default function EstoqueLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <MainLayout breadcrumbs={[{ label: "Estoque", href: "/estoque" }]}>
            {children}
        </MainLayout>
    );
}
