import Link from "next/link";
import { prisma } from "@/lib/prisma";
import styles from "./page.module.css";
import { getDictionary } from "@/lib/i18n";
import DashboardFilter from "@/components/DashboardFilter";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ year?: string; month?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const { dict } = await getDictionary();
  const { year, month } = await searchParams;

  const whereDate: any = {};
  if (year) {
    const startDate = new Date(parseInt(year), month ? parseInt(month) - 1 : 0, 1);
    const endDate = new Date(parseInt(year), month ? parseInt(month) : 12, 0, 23, 59, 59);
    whereDate.createdAt = {
      gte: startDate,
      lte: endDate
    };
  }

  const [
    clientCount,
    quoteCount,
    invoiceCount,
    recentQuotes,
    recentInvoices,
    revenue,
    pending
  ] = await Promise.all([
    prisma.client.count(),
    prisma.quote.count(),
    prisma.invoice.count(),
    prisma.quote.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { client: true } }),
    prisma.invoice.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { client: true } }),
    prisma.invoice.aggregate({
      where: { status: "PAID", ...whereDate },
      _sum: { total: true }
    }),
    prisma.invoice.aggregate({
      where: { status: "SENT", ...whereDate },
      _sum: { total: true }
    })
  ]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title} style={{ marginBottom: "2rem" }}>{dict.dashboard.title}</h1>

      <div className={styles.statsGrid}>
        <div className={styles.card}>
          <h3>{dict.common.clients}</h3>
          <p className={styles.number}>{clientCount}</p>
          <Link href="/clients" className={styles.link}>{dict.dashboard.view_clients}</Link>
        </div>
        <div className={styles.card}>
          <h3>{dict.common.quotes}</h3>
          <p className={styles.number}>{quoteCount}</p>
          <Link href="/quotes" className={styles.link}>{dict.dashboard.view_quotes}</Link>
        </div>
        <div className={styles.card}>
          <h3>{dict.common.invoices}</h3>
          <p className={styles.number}>{invoiceCount}</p>
          <Link href="/invoices" className={styles.link}>{dict.dashboard.view_invoices}</Link>
        </div>
      </div>

      <div style={{ marginTop: "3rem", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>{dict.dashboard.financials}</h2>
        <DashboardFilter />

        <div className={styles.statsGrid}>
          <div className={styles.card} style={{ backgroundColor: "#ecfdf5", borderColor: "#10b981" }}>
            <h3 style={{ color: "#047857" }}>{dict.dashboard.revenue}</h3>
            <p className={styles.number} style={{ color: "#047857" }}>
              {(revenue._sum.total || 0).toFixed(2)} €
            </p>
          </div>
          <div className={styles.card} style={{ backgroundColor: "#eff6ff", borderColor: "#3b82f6" }}>
            <h3 style={{ color: "#1d4ed8" }}>{dict.dashboard.pending}</h3>
            <p className={styles.number} style={{ color: "#1d4ed8" }}>
              {(pending._sum.total || 0).toFixed(2)} €
            </p>
          </div>
        </div>
      </div>

      <div className={styles.recentGrid}>
        <div className={styles.section}>
          <h2>{dict.dashboard.recent_quotes}</h2>
          <ul className={styles.list}>
            {recentQuotes.map(q => (
              <li key={q.id} className={styles.listItem}>
                <Link href={`/quotes/${q.id}`} style={{ display: 'flex', justifyContent: 'space-between', width: '100%', color: 'inherit', textDecoration: 'none' }}>
                  <span>{q.number} - {q.client.name}</span>
                  <span className={styles.amount}>{q.total.toFixed(2)} {q.currency}</span>
                </Link>
              </li>
            ))}
            {recentQuotes.length === 0 && <p style={{ color: 'var(--muted-foreground)' }}>{dict.dashboard.no_recent_quotes}</p>}
          </ul>
        </div>
        <div className={styles.section}>
          <h2>{dict.dashboard.recent_invoices}</h2>
          <ul className={styles.list}>
            {recentInvoices.map(b => (
              <li key={b.id} className={styles.listItem}>
                <Link href={`/invoices/${b.id}`} style={{ display: 'flex', justifyContent: 'space-between', width: '100%', color: 'inherit', textDecoration: 'none' }}>
                  <span>{b.number} - {b.client.name}</span>
                  <span className={styles.amount}>{b.total.toFixed(2)} {b.currency}</span>
                </Link>
              </li>
            ))}
            {recentInvoices.length === 0 && <p style={{ color: 'var(--muted-foreground)' }}>{dict.dashboard.no_recent_invoices}</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}
