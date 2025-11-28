import { MainLayout } from "@/components/main-layout";

export default function ServicosLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <MainLayout breadcrumbs={[{ label: "Serviços", href: "/servicos" }]}>
            {children}
        </MainLayout>
    );
}
