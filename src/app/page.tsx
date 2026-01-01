import Link from "next/link";
import { prisma } from "@/lib/prisma";
import styles from "./page.module.css";
import { getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { dict } = await getDictionary();

  const [
    clientCount,
    quoteCount,
    billCount,
    recentQuotes,
    recentBills
  ] = await Promise.all([
    prisma.client.count(),
    prisma.quote.count(),
    prisma.bill.count(),
    prisma.quote.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { client: true } }),
    prisma.bill.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { client: true } }),
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
          <h3>{dict.common.bills}</h3>
          <p className={styles.number}>{billCount}</p>
          <Link href="/bills" className={styles.link}>{dict.dashboard.view_bills}</Link>
        </div>
      </div>

      <div className={styles.recentGrid}>
        <div className={styles.section}>
          <h2>{dict.dashboard.recent_quotes}</h2>
          <ul className={styles.list}>
            {recentQuotes.map(q => (
              <li key={q.id} className={styles.listItem}>
                <span>{q.number} - {q.client.name}</span>
                <span className={styles.amount}>{q.total.toFixed(2)} {q.currency}</span>
              </li>
            ))}
            {recentQuotes.length === 0 && <p style={{ color: 'var(--muted-foreground)' }}>{dict.dashboard.no_recent_quotes}</p>}
          </ul>
        </div>
        <div className={styles.section}>
          <h2>{dict.dashboard.recent_bills}</h2>
          <ul className={styles.list}>
            {recentBills.map(b => (
              <li key={b.id} className={styles.listItem}>
                <span>{b.number} - {b.client.name}</span>
                <span className={styles.amount}>{b.total.toFixed(2)} {b.currency}</span>
              </li>
            ))}
            {recentBills.length === 0 && <p style={{ color: 'var(--muted-foreground)' }}>{dict.dashboard.no_recent_bills}</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}
