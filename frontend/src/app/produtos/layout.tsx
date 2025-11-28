import { MainLayout } from "@/components/main-layout";

export default function ProdutosLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <MainLayout breadcrumbs={[{ label: "Produtos", href: "/estoque/produtos" }]}>
            {children}
        </MainLayout>
    );
}
