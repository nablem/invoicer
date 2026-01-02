import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import InvoiceForm from "@/components/InvoiceForm";
import styles from "../page.module.css";
import { sendInvoice } from "@/actions/send";
import { getDictionary } from "@/lib/i18n";
import SplitButton from "@/components/SplitButton";
import { updateInvoiceStatus as updateStatus } from "@/actions/invoices";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditInvoicePage({ params }: PageProps) {
    const { id } = await params;
    const { dict } = await getDictionary();

    const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: { items: true, client: true },
    });

    const clients = await prisma.client.findMany({
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true }
    });

    const quotes = await prisma.quote.findMany({
        orderBy: { createdAt: "desc" },
        select: { id: true, number: true }
    });


    if (!invoice) {
        notFound();
    }

    const isLocked = ['SENT', 'PAID', 'OVERDUE', 'CANCELLED'].includes(invoice.status);
    const emailMissing = !invoice.client.email;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h1 className={styles.title}>{invoice.number}</h1>
                    <span className={`${styles.status} ${styles['status_' + invoice.status]}`}>
                        {(dict.invoices.status as any)[invoice.status] || invoice.status}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <a
                        href={`/api/pdf/invoice/${invoice.id}`}
                        target="_blank"
                        className={styles.secondaryButton}
                        style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                    >
                        {dict.quotes.download_pdf}
                    </a>

                    <SplitButton
                        mainAction={sendInvoice.bind(null, invoice.id)}
                        mainLabel={dict.quotes.send_email}
                        dropdownItems={[
                            { action: updateStatus.bind(null, invoice.id, "SENT"), label: dict.invoices.mark_as_sent }
                        ]}
                        color="blue"
                        mainActionDisabled={emailMissing}
                    />

                    <SplitButton
                        mainAction={updateStatus.bind(null, invoice.id, "PAID")}
                        mainLabel={dict.invoices.mark_as_paid}
                        dropdownItems={[
                            { action: updateStatus.bind(null, invoice.id, "OVERDUE"), label: dict.invoices.mark_as_overdue }
                        ]}
                        color="green"
                    />


                </div>
            </div>
            <InvoiceForm
                clients={clients}
                quotes={quotes}
                invoice={{
                    ...invoice,
                    items: invoice.items.map(item => ({
                        ...item,
                        title: item.title ?? undefined
                    }))
                }}
                dict={dict}
                readOnly={isLocked}
            />
        </div>
    );
}
