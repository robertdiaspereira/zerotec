"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NovoServicoRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/configuracoes/servicos");
    }, [router]);

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-center">
                <p className="text-lg">Redirecionando...</p>
            </div>
        </div>
    );
}
