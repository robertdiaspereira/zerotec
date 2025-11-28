/**
 * OS Layout
 * Layout with sidebar for service orders module
 */

import { MainLayout } from "@/components/main-layout";

export default function OSLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <MainLayout breadcrumbs={[{ label: "Ordens de Serviço", href: "/os" }]}>
            {children}
        </MainLayout>
    );
}
