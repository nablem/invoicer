import Link from "next/link";
import { prisma } from "@/lib/prisma";
import styles from "./page.module.css";
import { deleteClient } from "@/actions/clients";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
    const clients = await prisma.client.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Clients</h1>
                <Link href="/clients/new" className={styles.addButton}>
                    Add Client
                </Link>
            </div>

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>VAT Number</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {clients.map((client) => (
                        <tr key={client.id}>
                            <td>{client.name}</td>
                            <td>{client.email}</td>
                            <td>{client.phone}</td>
                            <td>{client.vatNumber}</td>
                            <td>
                                <Link href={`/clients/${client.id}`} style={{ marginRight: "1rem", color: "var(--primary)" }}>
                                    Edit
                                </Link>
                                <form action={deleteClient.bind(null, client.id)} style={{ display: "inline" }}>
                                    <button type="submit" style={{ color: "red" }}>Delete</button>
                                </form>
                            </td>
                        </tr>
                    ))}
                    {clients.length === 0 && (
                        <tr>
                            <td colSpan={5} style={{ textAlign: "center", color: "var(--muted-foreground)" }}>
                                No clients found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
