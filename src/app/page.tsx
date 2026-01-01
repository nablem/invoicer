import Link from "next/link";
import { prisma } from "@/lib/prisma";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
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
      <h1 className={styles.title} style={{ marginBottom: "2rem" }}>Dashboard</h1>

      <div className={styles.statsGrid}>
        <div className={styles.card}>
          <h3>Clients</h3>
          <p className={styles.number}>{clientCount}</p>
          <Link href="/clients" className={styles.link}>View Clients →</Link>
        </div>
        <div className={styles.card}>
          <h3>Quotes</h3>
          <p className={styles.number}>{quoteCount}</p>
          <Link href="/quotes" className={styles.link}>View Quotes →</Link>
        </div>
        <div className={styles.card}>
          <h3>Bills</h3>
          <p className={styles.number}>{billCount}</p>
          <Link href="/bills" className={styles.link}>View Bills →</Link>
        </div>
      </div>

      <div className={styles.recentGrid}>
        <div className={styles.section}>
          <h2>Recent Quotes</h2>
          <ul className={styles.list}>
            {recentQuotes.map(q => (
              <li key={q.id} className={styles.listItem}>
                <span>{q.number} - {q.client.name}</span>
                <span className={styles.amount}>{q.total.toFixed(2)} EUR</span>
              </li>
            ))}
            {recentQuotes.length === 0 && <p style={{ color: 'var(--muted-foreground)' }}>No recent quotes</p>}
          </ul>
        </div>
        <div className={styles.section}>
          <h2>Recent Bills</h2>
          <ul className={styles.list}>
            {recentBills.map(b => (
              <li key={b.id} className={styles.listItem}>
                <span>{b.number} - {b.client.name}</span>
                <span className={styles.amount}>{b.total.toFixed(2)} EUR</span>
              </li>
            ))}
            {recentBills.length === 0 && <p style={{ color: 'var(--muted-foreground)' }}>No recent bills</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}
