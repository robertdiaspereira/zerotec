import { MainLayout } from "@/components/main-layout";

export default function ConfiguracoesLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <MainLayout breadcrumbs={[{ label: "Configurações", href: "/configuracoes" }]}>
            {children}
        </MainLayout>
    )
}
