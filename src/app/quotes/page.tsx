import Link from "next/link";
import { prisma } from "@/lib/prisma";
import styles from "./page.module.css";
import { deleteQuote } from "@/actions/quotes";

export const dynamic = "force-dynamic";

export default async function QuotesPage() {
    const quotes = await prisma.quote.findMany({
        include: { client: true },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Quotes</h1>
                <Link href="/quotes/new" className={styles.addButton}>
                    New Quote
                </Link>
            </div>

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Number</th>
                        <th>Client</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {quotes.map((quote) => (
                        <tr key={quote.id}>
                            <td>{quote.number}</td>
                            <td>{quote.client.name}</td>
                            <td>{new Date(quote.date).toLocaleDateString()}</td>
                            <td>{quote.total.toFixed(2)} {quote.currency}</td>
                            <td>
                                <span className={`${styles.status} ${styles['status_' + quote.status]}`}>
                                    {quote.status}
                                </span>
                            </td>
                            <td>
                                <Link href={`/quotes/${quote.id}`} style={{ marginRight: "1rem", color: "var(--primary)" }}>
                                    Edit
                                </Link>
                                <form action={deleteQuote.bind(null, quote.id)} style={{ display: "inline" }}>
                                    <button type="submit" style={{ color: "red" }}>Delete</button>
                                </form>
                            </td>
                        </tr>
                    ))}
                    {quotes.length === 0 && (
                        <tr>
                            <td colSpan={6} style={{ textAlign: "center", color: "var(--muted-foreground)" }}>
                                No quotes found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
