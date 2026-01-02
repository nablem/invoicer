import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n";
import styles from "@/app/page.module.css"; // Reuse global or create specific? reusing global/inline for consistency with dashboard

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ClientDetailsPage({ params }: PageProps) {
    const { id } = await params;
    const { dict } = await getDictionary();

    const client = await prisma.client.findUnique({
        where: { id },
        include: {
            quotes: { orderBy: { createdAt: "desc" } },
            invoices: { orderBy: { createdAt: "desc" } }
        }
    });

    if (!client) {
        return <div>Client not found</div>;
    }

    return (
        <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
            <Link href="/clients" style={{ marginBottom: "1rem", display: "inline-block", color: "#666", textDecoration: "none" }}>
                ← {dict.common.back}
            </Link>

            <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "2rem" }}>{client.name}</h1>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "3rem" }}>
                <div style={{ padding: "1.5rem", border: "1px solid #eee", borderRadius: "8px", background: "white" }}>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem" }}>{dict.clients.title}</h2>
                    <div style={{ display: "grid", gap: "0.5rem" }}>
                        <p><strong>{dict.clients.form.email}:</strong> {client.email}</p>
                        <p><strong>{dict.clients.form.phone}:</strong> {client.phone}</p>
                        <p><strong>{dict.clients.form.vat}:</strong> {client.vatNumber}</p>
                        <p><strong>{dict.clients.form.company_id}:</strong> {client.companyId}</p>
                        <p><strong>{dict.clients.form.address}:</strong> {client.address}, {client.zipCode} {client.city}, {client.country}</p>
                    </div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                <div>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>{dict.common.quotes}</h2>
                    <table className={styles.table} style={{ width: "100%", borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                                <th style={{ padding: '0.75rem' }}>{dict.quotes.number}</th>
                                <th style={{ padding: '0.75rem' }}>{dict.common.date}</th>
                                <th style={{ padding: '0.75rem' }}>{dict.common.total}</th>
                                <th style={{ padding: '0.75rem' }}>{dict.common.status}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {client.quotes.map(q => (
                                <tr key={q.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '0.75rem' }}>
                                        <Link href={`/quotes/${q.id}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                                            {q.number}
                                        </Link>
                                    </td>
                                    <td style={{ padding: '0.75rem' }}>{new Date(q.date).toLocaleDateString()}</td>
                                    <td style={{ padding: '0.75rem' }}>{q.total.toFixed(2)}</td>
                                    <td style={{ padding: '0.75rem' }}>{dict.quotes.status[q.status as keyof typeof dict.quotes.status] || q.status}</td>
                                </tr>
                            ))}
                            {client.quotes.length === 0 && <tr><td colSpan={4} style={{ padding: '0.75rem', color: '#666' }}>{dict.quotes.no_quotes}</td></tr>}
                        </tbody>
                    </table>
                </div>

                <div>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>{dict.common.invoices}</h2>
                    <table className={styles.table} style={{ width: "100%", borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                                <th style={{ padding: '0.75rem' }}>{dict.quotes.number}</th>
                                <th style={{ padding: '0.75rem' }}>{dict.common.date}</th>
                                <th style={{ padding: '0.75rem' }}>{dict.common.total}</th>
                                <th style={{ padding: '0.75rem' }}>{dict.common.status}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {client.invoices.map(i => (
                                <tr key={i.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '0.75rem' }}>
                                        <Link href={`/invoices/${i.id}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                                            {i.number}
                                        </Link>
                                    </td>
                                    <td style={{ padding: '0.75rem' }}>{new Date(i.date).toLocaleDateString()}</td>
                                    <td style={{ padding: '0.75rem' }}>{i.total.toFixed(2)}</td>
                                    <td style={{ padding: '0.75rem' }}>{dict.invoices.status[i.status as keyof typeof dict.invoices.status] || i.status}</td>
                                </tr>
                            ))}
                            {client.invoices.length === 0 && <tr><td colSpan={4} style={{ padding: '0.75rem', color: '#666' }}>{dict.invoices.no_invoices}</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
