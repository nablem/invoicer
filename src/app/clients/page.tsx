import Link from "next/link";
import { prisma } from "@/lib/prisma";
import styles from "./page.module.css";
import { getDictionary } from "@/lib/i18n";
import SearchInput from "@/components/SearchInput";
import ClientActions from "@/components/ClientActions";

export const dynamic = "force-dynamic";

interface PageProps {
    searchParams: Promise<{ search?: string }>;
}

export default async function ClientsPage({ searchParams }: PageProps) {
    const { dict } = await getDictionary();
    const { search } = await searchParams;

    const where: any = {};
    if (search) {
        where.name = { contains: search }; // Case insensitive? SQLite/Postgres difference. Prisma default depends on provider.
        // Usually, mode: 'insensitive' if Postgres. If SQLite, it might not support it directly without raw, but let's try standard contains.
    }

    const clients = await prisma.client.findMany({
        where,
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h1 className={styles.title}>{dict.clients.title}</h1>
                    <SearchInput placeholder={dict.clients.form.name + "..."} />
                </div>
                <Link href="/clients/new" className={styles.addButton}>
                    {dict.clients.new_client}
                </Link>
            </div>

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>{dict.clients.form.name}</th>
                        <th>{dict.clients.form.company_id}</th>
                        <th>{dict.clients.form.vat}</th>
                        <th>{dict.common.actions}</th>
                    </tr>
                </thead>
                <tbody>
                    {clients.map((client) => (
                        <tr key={client.id}>
                            <td>{client.name}</td>
                            <td>{client.companyId}</td>
                            <td>{client.vatNumber}</td>
                            <td>
                                <ClientActions clientId={client.id} dict={dict} />
                            </td>
                        </tr>
                    ))}
                    {clients.length === 0 && (
                        <tr>
                            <td colSpan={4} style={{ textAlign: "center", color: "var(--muted-foreground)" }}>
                                {dict.clients.no_clients}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
