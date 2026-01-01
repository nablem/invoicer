import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import QuoteForm from "@/components/QuoteForm";
import styles from "../page.module.css";
import { createBillFromQuote } from "@/actions/bills";
import { sendQuote } from "@/actions/send";
import { sendForSigning } from "@/actions/signing";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditQuotePage({ params }: PageProps) {
    const { id } = await params;

    const [quote, clients] = await Promise.all([
        prisma.quote.findUnique({
            where: { id },
            include: { items: true },
        }),
        prisma.client.findMany({ orderBy: { name: "asc" } }),
    ]);

    if (!quote) {
        notFound();
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h1 className={styles.title}>Edit Quote</h1>
                    <span className={`${styles.status} ${styles['status_' + quote.status]}`}>{quote.status}</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <a
                        href={`/api/pdf/quote/${quote.id}`}
                        target="_blank"
                        className={styles.secondaryButton}
                        style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                    >
                        Download PDF
                    </a>
                    <form action={sendQuote.bind(null, quote.id)}>
                        <button type="submit" className={styles.secondaryButton} style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbb' }}>Send Email</button>
                    </form>
                    <form action={sendForSigning.bind(null, quote.id)}>
                        <button type="submit" className={styles.secondaryButton} style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bbb' }}>Sign via DocuSeal</button>
                    </form>
                    <form action={createBillFromQuote.bind(null, quote.id)}>
                        <button type="submit" className={styles.button}>Convert to Bill</button>
                    </form>
                    <Link href="/quotes" className={styles.secondaryButton} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                        Back
                    </Link>
                </div>
            </div>
            <QuoteForm clients={clients} quote={quote} />
        </div>
    );
}
