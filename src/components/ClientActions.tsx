"use client";

import { deleteClient } from "@/actions/clients";
import SplitButton from "@/components/SplitButton";

interface ClientActionsProps {
    clientId: string;
    dict: any;
}

export default function ClientActions({ clientId, dict }: ClientActionsProps) {
    const handleDelete = async () => {
        if (confirm(dict.common.delete + "?")) {
            await deleteClient(clientId);
        }
    };

    return (
        <SplitButton
            mainHref={`/clients/${clientId}/details`}
            mainLabel={dict.common.edit}
            dropdownItems={[
                { href: `/clients/${clientId}`, label: dict.clients.edit_client },
                { action: handleDelete as any, label: dict.common.delete }
            ]}
            color="default"
        />
    );
}
