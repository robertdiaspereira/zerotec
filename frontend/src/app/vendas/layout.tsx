import { MainLayout } from "@/components/main-layout";

export default function VendasLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <MainLayout breadcrumbs={[{ label: "Vendas", href: "/vendas" }]}>
            {children}
        </MainLayout>
    );
}
