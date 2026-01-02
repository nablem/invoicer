import Link from "next/link";
import { prisma } from "@/lib/prisma";
import styles from "./page.module.css";
import { deleteQuote } from "@/actions/quotes";
import { getDictionary } from "@/lib/i18n";
import QuoteActions from "@/components/QuoteActions";

// @ts-ignore
import Pagination from "@/components/Pagination";

export const dynamic = "force-dynamic";

interface PageProps {
    searchParams: Promise<{ page?: string }>;
}

export default async function QuotesPage({ searchParams }: PageProps) {
    const { page } = await searchParams;
    const currentPage = parseInt(page || "1", 10);
    const pageSize = 20;
    const skip = (currentPage - 1) * pageSize;

    const { dict } = await getDictionary();

    // Parallel fetch for data and count
    const [quotes, totalCount] = await Promise.all([
        prisma.quote.findMany({
            include: { client: true },
            orderBy: { createdAt: "desc" },
            take: pageSize,
            skip: skip,
        }),
        prisma.quote.count()
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>{dict.quotes.title}</h1>
                <Link href="/quotes/new" className={styles.addButton}>
                    {dict.quotes.new_quote}
                </Link>
            </div>

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>{dict.quotes.number}</th>
                        <th>{dict.quotes.client}</th>
                        <th style={{ textAlign: "right" }}>{dict.common.total}</th>
                        <th>{dict.common.status}</th>
                        <th>{dict.common.actions}</th>
                    </tr>
                </thead>
                <tbody>
                    {quotes.map((quote) => (
                        <tr key={quote.id}>
                            <td>
                                <Link href={`/quotes/${quote.id}`} style={{ fontWeight: 500, color: 'inherit', textDecoration: 'none' }}>
                                    {quote.number}
                                </Link>
                            </td>
                            <td>{quote.client.name}</td>
                            <td style={{ textAlign: "right" }}>{quote.total.toFixed(2)} {quote.currency}</td>
                            <td><span className={`${styles.status} ${styles['status_' + quote.status]}`}>
                                {(dict.quotes.status as any)[quote.status] || quote.status}
                            </span></td>
                            <td>
                                <QuoteActions id={quote.id} dict={dict} />
                            </td>
                        </tr>
                    ))}
                    {quotes.length === 0 && (
                        <tr>
                            <td colSpan={5} style={{ textAlign: "center", color: "var(--muted-foreground)" }}>
                                {dict.quotes.no_quotes}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <Pagination currentPage={currentPage} totalPages={totalPages} />
        </div>
    );
}
