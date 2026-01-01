import Link from "next/link";
import { prisma } from "@/lib/prisma";
import styles from "./page.module.css";
import { deleteBill } from "@/actions/bills";

export const dynamic = "force-dynamic";

export default async function BillsPage() {
    const bills = await prisma.bill.findMany({
        include: { client: true },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Bills</h1>
                <Link href="/bills/new" className={styles.addButton}>
                    New Bill
                </Link>
            </div>

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Number</th>
                        <th>Client</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Recurring</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {bills.map((bill) => (
                        <tr key={bill.id}>
                            <td>{bill.number}</td>
                            <td>{bill.client.name}</td>
                            <td>{new Date(bill.date).toLocaleDateString()}</td>
                            <td>{bill.total.toFixed(2)} {bill.currency}</td>
                            <td>
                                <span className={`${styles.status} ${styles['status_' + bill.status]}`}>
                                    {bill.status}
                                </span>
                            </td>
                            <td>
                                {bill.isRecurring ? bill.recurringInterval : "-"}
                            </td>
                            <td>
                                <Link href={`/bills/${bill.id}`} style={{ marginRight: "1rem", color: "var(--primary)" }}>
                                    Edit
                                </Link>
                                <form action={deleteBill.bind(null, bill.id)} style={{ display: "inline" }}>
                                    <button type="submit" style={{ color: "red" }}>Delete</button>
                                </form>
                            </td>
                        </tr>
                    ))}
                    {bills.length === 0 && (
                        <tr>
                            <td colSpan={7} style={{ textAlign: "center", color: "var(--muted-foreground)" }}>
                                No bills found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
