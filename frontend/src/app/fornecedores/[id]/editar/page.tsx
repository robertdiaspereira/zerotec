"use client";

import { FornecedorForm } from "../../_components/FornecedorForm";
import { use } from "react";

export default function EditarFornecedorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return <FornecedorForm fornecedorId={parseInt(id)} />;
}
