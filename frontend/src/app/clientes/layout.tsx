import { MainLayout } from "@/components/main-layout";

export default function ClientesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <MainLayout breadcrumbs={[{ label: "Clientes", href: "/clientes" }]}>
            {children}
        </MainLayout>
    );
}
