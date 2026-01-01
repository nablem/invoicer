import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BillForm from "@/components/BillForm";
import styles from "../page.module.css";
import { sendBill } from "@/actions/send";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditBillPage({ params }: PageProps) {
    const { id } = await params;

    const [bill, clients] = await Promise.all([
        prisma.bill.findUnique({
            where: { id },
            include: { items: true },
        }),
        prisma.client.findMany({ orderBy: { name: "asc" } }),
    ]);

    if (!bill) {
        notFound();
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h1 className={styles.title}>Edit Bill</h1>
                    <span className={`${styles.status} ${styles['status_' + bill.status]}`}>{bill.status}</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <a
                        href={`/api/pdf/bill/${bill.id}`}
                        target="_blank"
                        className={styles.secondaryButton}
                        style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                    >
                        Download PDF
                    </a>
                    <form action={sendBill.bind(null, bill.id)}>
                        <button type="submit" className={styles.secondaryButton} style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbb' }}>Send Email</button>
                    </form>
                    <Link href="/bills" style={{ color: "var(--muted-foreground)", display: 'flex', alignItems: 'center' }}>
                        Back
                    </Link>
                </div>
            </div>
            <BillForm clients={clients} bill={bill} />
        </div>
    );
}
