import Link from "next/link";
import { prisma } from "@/lib/prisma";
import styles from "./page.module.css";
import { deleteInvoice } from "@/actions/invoices";
import InvoiceActions from "@/components/InvoiceActions";
import { getDictionary } from "@/lib/i18n";
import SearchInput from "@/components/SearchInput";
import StatusFilter from "@/components/StatusFilter";
import { formatPrice } from "@/lib/format";

// @ts-ignore
import Pagination from "@/components/Pagination";

export const dynamic = "force-dynamic";

interface PageProps {
    searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}

export default async function InvoicesPage({ searchParams }: PageProps) {
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

    const invoicesAndCount = await Promise.all([
        prisma.invoice.findMany({
            where,
            include: { client: true },
            orderBy: { createdAt: "desc" },
            take: pageSize,
            skip: skip,
        }),
        prisma.invoice.count({ where }),
        prisma.organization.findFirst()
    ]);

    const [invoices, totalCount] = invoicesAndCount;
    const organization = invoicesAndCount[2];

    const totalPages = Math.ceil(totalCount / pageSize);

    const statusOptions = Object.entries(dict.invoices.status).map(([value, label]) => ({
        value,
        label: label as string
    }));

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h1 className={styles.title}>{dict.invoices.title}</h1>
                    <SearchInput placeholder={dict.quotes.number + "..."} />
                </div>
                <Link href="/invoices/new" className={styles.addButton}>
                    {dict.invoices.new_invoice}
                </Link>
            </div>

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>{dict.quotes.number}</th>
                        <th>{dict.quotes.client}</th>
                        <th>{dict.invoices.type}</th>
                        <th style={{ textAlign: "right" }}>{dict.common.total}</th>
                        <th style={{ display: "flex", alignItems: "center" }}>
                            {dict.common.status}
                            <StatusFilter options={statusOptions} />
                        </th>
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
                            <td style={{ fontSize: '0.9rem' }}>
                                {invoice.isRecurring ? dict.invoices.type_recurring :
                                    invoice.isRetainer ? dict.invoices.type_retainer :
                                        invoice.isBalance ? dict.invoices.type_balance :
                                            '-'}
                            </td>
                            <td style={{ textAlign: "right" }}>{formatPrice(invoice.total - (invoice.retainerDeductionAmount || 0), invoice.currency, organization?.decimalSeparator)}</td>
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

            <Pagination currentPage={currentPage} totalPages={totalPages} />
        </div>
    );
}
