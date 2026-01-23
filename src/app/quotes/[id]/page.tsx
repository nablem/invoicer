import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import QuoteForm from "@/components/QuoteForm";
import styles from "../page.module.css";
import SplitButton from "@/components/SplitButton";
import { createInvoiceFromQuote } from "@/actions/invoices";
import { sendQuote } from "@/actions/send";
import { sendForSigning } from "@/actions/signing";
import { updateQuoteStatus as updateStatus } from "@/actions/quotes";
import { getDictionary } from "@/lib/i18n";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditQuotePage({ params }: PageProps) {
    const { id } = await params;
    const { dict } = await getDictionary();

    const quote = await prisma.quote.findUnique({
        where: { id },
        include: { items: true, client: true },
    });

    const clients = await prisma.client.findMany({
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true }
    });

    const organization = await prisma.organization.findFirst();


    if (!quote) {
        notFound();
    }

    const isLocked = ['SENT', 'ACCEPTED', 'REJECTED', 'SENT_FOR_SIGNATURE'].includes(quote.status);
    const emailMissing = !quote.client.email;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h1 className={styles.title}>{quote.number}</h1>
                    <span className={`${styles.status} ${styles['status_' + quote.status]}`}>
                        {(dict.quotes.status as any)[quote.status] || quote.status}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <SplitButton
                        mainHref={`/api/pdf/quote/${quote.id}`}
                        mainLabel={dict.quotes.download_pdf}
                        dropdownItems={[
                            { action: updateStatus.bind(null, quote.id, "SENT_FOR_SIGNATURE"), label: dict.quotes.mark_as_sent_for_signature || "Mark as sent for signature" },
                            { action: updateStatus.bind(null, quote.id, "ACCEPTED"), label: dict.quotes.mark_as_accepted },
                            { action: updateStatus.bind(null, quote.id, "REJECTED"), label: dict.quotes.mark_as_rejected }
                        ]}
                        color="default"
                    />
                </div>
            </div>
            <QuoteForm
                clients={clients}
                quote={{
                    ...quote,
                    items: quote.items.map(item => ({
                        ...item,
                        title: item.title ?? undefined,
                        vat: item.vat
                    }))
                }}
                dict={dict}
                convertAction={createInvoiceFromQuote.bind(null, quote.id)}
                readOnly={isLocked}
                defaultVat={organization?.defaultVat || 0}
                currency={quote.currency}
                decimalSeparator={organization?.decimalSeparator}
            />
        </div>
    );
}
