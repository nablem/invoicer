import Link from "next/link";
import { prisma } from "@/lib/prisma";
import styles from "./page.module.css";
import { deleteBill } from "@/actions/bills";
import { getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function BillsPage() {
    const { dict } = await getDictionary();
    const bills = await prisma.bill.findMany({
        include: { client: true },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>{dict.bills.title}</h1>
                <Link href="/bills/new" className={styles.addButton}>
                    {dict.bills.new_bill}
                </Link>
            </div>

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>{dict.quotes.number}</th>
                        <th>{dict.quotes.client}</th>
                        <th>{dict.bills.recurring}</th>
                        <th style={{ textAlign: "right" }}>{dict.common.total}</th>
                        <th>{dict.common.status}</th>
                        <th>{dict.common.actions}</th>
                    </tr>
                </thead>
                <tbody>
                    {bills.map((bill) => (
                        <tr key={bill.id}>
                            <td>
                                <Link href={`/bills/${bill.id}`} style={{ fontWeight: 500, color: 'inherit', textDecoration: 'none' }}>
                                    {bill.number}
                                </Link>
                            </td>
                            <td>{bill.client.name}</td>
                            <td style={{ fontSize: '0.8rem' }}>{bill.isRecurring ? `${(dict.bills.intervals as any)[bill.recurringInterval?.toLowerCase() || ''] || bill.recurringInterval}` : '-'}</td>
                            <td style={{ textAlign: "right" }}>{bill.total.toFixed(2)} {bill.currency}</td>
                            <td><span className={`${styles.status} ${styles['status_' + bill.status]}`}>
                                {(dict.bills.status as any)[bill.status] || bill.status}
                            </span></td>
                            <td>
                                <Link href={`/bills/${bill.id}`} style={{ marginRight: "1rem", color: "var(--primary)" }}>
                                    {dict.common.edit}
                                </Link>
                                <form action={deleteBill.bind(null, bill.id)} style={{ display: "inline" }}>
                                    <button type="submit" style={{ color: "red" }}>{dict.common.delete}</button>
                                </form>
                            </td>
                        </tr>
                    ))}
                    {bills.length === 0 && (
                        <tr>
                            <td colSpan={6} style={{ textAlign: "center", color: "var(--muted-foreground)" }}>
                                {dict.bills.no_bills}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
