/**
 * Financeiro Layout
 * Layout with sidebar for financial module
 */

import { MainLayout } from "@/components/main-layout";

export default function FinanceiroLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <MainLayout breadcrumbs={[{ label: "Financeiro", href: "/financeiro" }]}>
            {children}
        </MainLayout>
    );
}
