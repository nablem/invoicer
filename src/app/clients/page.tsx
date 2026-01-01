import Link from "next/link";
import { prisma } from "@/lib/prisma";
import styles from "./page.module.css";
import { deleteClient } from "@/actions/clients";
import { getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
    const { dict } = await getDictionary();
    const clients = await prisma.client.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>{dict.clients.title}</h1>
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
                                <Link href={`/clients/${client.id}`} style={{ marginRight: "1rem", color: "var(--primary)" }}>
                                    {dict.common.edit}
                                </Link>
                                <form action={deleteClient.bind(null, client.id)} style={{ display: "inline" }}>
                                    <button type="submit" style={{ color: "red" }}>{dict.common.delete}</button>
                                </form>
                            </td>
                        </tr>
                    ))}
                    {clients.length === 0 && (
                        <tr>
                            <td colSpan={5} style={{ textAlign: "center", color: "var(--muted-foreground)" }}>
                                {dict.clients.no_clients}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
