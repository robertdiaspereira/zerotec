'use client';

import UserForm from '../_components/UserForm';

interface PageProps {
    params: {
        id: string;
    };
}

export default function EditarUsuarioPage({ params }: PageProps) {
    return <UserForm id={Number(params.id)} />;
}
