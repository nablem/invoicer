import Link from "next/link";
import { prisma } from "@/lib/prisma";
import styles from "./page.module.css";
import { deleteQuote } from "@/actions/quotes";
import { getDictionary } from "@/lib/i18n";
import QuoteActions from "@/components/QuoteActions";
import SearchInput from "@/components/SearchInput";
import StatusFilter from "@/components/StatusFilter";
import { formatPrice } from "@/lib/format";

// @ts-ignore
import Pagination from "@/components/Pagination";

export const dynamic = "force-dynamic";

interface PageProps {
    searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}

export default async function QuotesPage({ searchParams }: PageProps) {
    const { page, search, status } = await searchParams;
    const currentPage = parseInt(page || "1", 10);
    const pageSize = 20;
    const skip = (currentPage - 1) * pageSize;

    const { dict } = await getDictionary();

    const where: any = {};
    if (search) {
        where.number = { contains: search };
    }
    if (status) {
        where.status = { in: status.split(",") };
    }

    // Parallel fetch for data and count
    const quotesAndCount = await Promise.all([
        prisma.quote.findMany({
            where,
            include: { client: true },
            orderBy: { createdAt: "desc" },
            take: pageSize,
            skip: skip,
        }),
        prisma.quote.count({ where }),
        prisma.organization.findFirst()
    ]);
    const [quotes, totalCount] = quotesAndCount;
    const organization = quotesAndCount[2];

    const totalPages = Math.ceil(totalCount / pageSize);

    const statusOptions = Object.entries(dict.quotes.status).map(([value, label]) => ({
        value,
        label: label as string
    }));

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h1 className={styles.title}>{dict.quotes.title}</h1>
                    <SearchInput placeholder={dict.quotes.number + "..."} />
                </div>
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
                        <th style={{ display: "flex", alignItems: "center" }}>
                            {dict.common.status}
                            <StatusFilter options={statusOptions} />
                        </th>
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
                            <td style={{ textAlign: "right" }}>{formatPrice(quote.total, quote.currency, organization?.decimalSeparator)}</td>
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
