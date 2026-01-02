import Link from "next/link";
import { prisma } from "@/lib/prisma";
import styles from "./page.module.css";
import { deleteInvoice } from "@/actions/invoices";
import InvoiceActions from "@/components/InvoiceActions";
import { getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
    const { dict } = await getDictionary();
    const invoices = await prisma.invoice.findMany({
        include: { client: true },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>{dict.invoices.title}</h1>
                <Link href="/invoices/new" className={styles.addButton}>
                    {dict.invoices.new_invoice}
                </Link>
            </div>

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>{dict.quotes.number}</th>
                        <th>{dict.quotes.client}</th>
                        <th>{dict.invoices.recurring}</th>
                        <th style={{ textAlign: "right" }}>{dict.common.total}</th>
                        <th>{dict.common.status}</th>
                        <th>{dict.common.actions}</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.map((invoice) => (
                        <tr key={invoice.id}>
                            <td>
                                <Link href={`/invoices/${invoice.id}`} style={{ fontWeight: 500, color: 'inherit', textDecoration: 'none' }}>
                                    {invoice.number}
                                </Link>
                            </td>
                            <td>{invoice.client.name}</td>
                            <td style={{ fontSize: '0.8rem' }}>{invoice.isRecurring ? `${(dict.invoices.intervals as any)[invoice.recurringInterval?.toLowerCase() || ''] || invoice.recurringInterval}` : '-'}</td>
                            <td style={{ textAlign: "right" }}>{invoice.total.toFixed(2)} {invoice.currency}</td>
                            <td><span className={`${styles.status} ${styles['status_' + invoice.status]}`}>
                                {(dict.invoices.status as any)[invoice.status] || invoice.status}
                            </span></td>
                            <td>
                                <InvoiceActions id={invoice.id} dict={dict} />
                            </td>
                        </tr>
                    ))}
                    {invoices.length === 0 && (
                        <tr>
                            <td colSpan={6} style={{ textAlign: "center", color: "var(--muted-foreground)" }}>
                                {dict.invoices.no_invoices}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
