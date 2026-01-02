"use client";

import { updateInvoiceStatus, deleteInvoice } from "@/actions/invoices";
import { Dictionary } from "@/lib/dictionaries";
import SplitButton from "@/components/SplitButton";

interface InvoiceActionsProps {
    id: string;
    dict: Dictionary;
}

export default function InvoiceActions({ id, dict }: InvoiceActionsProps) {
    return (
        <SplitButton
            mainHref={`/invoices/${id}`}
            mainLabel={dict.common.edit}
            dropdownItems={[
                { action: updateInvoiceStatus.bind(null, id, "SENT"), label: dict.invoices.mark_as_sent },
                { action: updateInvoiceStatus.bind(null, id, "PAID"), label: dict.invoices.mark_as_paid },
                { action: updateInvoiceStatus.bind(null, id, "OVERDUE"), label: dict.invoices.mark_as_overdue },
                { action: updateInvoiceStatus.bind(null, id, "CANCELLED"), label: dict.invoices.mark_as_cancelled },
                { action: deleteInvoice.bind(null, id), label: dict.common.delete }
            ]}
            color="default"
        />
    );
}
