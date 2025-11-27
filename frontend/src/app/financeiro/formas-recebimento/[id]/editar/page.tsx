'use client';

import { use } from 'react';
import FormaRecebimentoForm from '../../_components/FormaRecebimentoForm';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EditarFormaRecebimentoPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const id = parseInt(resolvedParams.id);

    return <FormaRecebimentoForm id={id} />;
}
