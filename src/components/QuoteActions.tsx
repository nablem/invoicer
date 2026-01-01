"use client";

import { updateQuoteStatus, deleteQuote } from "@/actions/quotes";
import { Dictionary } from "@/lib/dictionaries";
import SplitButton from "@/components/SplitButton";

interface QuoteActionsProps {
    id: string;
    dict: Dictionary;
}

export default function QuoteActions({ id, dict }: QuoteActionsProps) {
    return (
        <SplitButton
            mainHref={`/quotes/${id}`}
            mainLabel={dict.common.edit}
            dropdownItems={[
                { action: updateQuoteStatus.bind(null, id, "SENT"), label: dict.quotes.mark_as_sent },
                { action: updateQuoteStatus.bind(null, id, "ACCEPTED"), label: dict.quotes.mark_as_accepted },
                { action: updateQuoteStatus.bind(null, id, "REJECTED"), label: dict.quotes.mark_as_rejected },
                { action: deleteQuote.bind(null, id), label: dict.common.delete }
            ]}
            color="default"
        />
    );
}
