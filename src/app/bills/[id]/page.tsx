import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BillForm from "@/components/BillForm";
import styles from "../page.module.css";
import { sendBill } from "@/actions/send";
import { getDictionary } from "@/lib/i18n";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditBillPage({ params }: PageProps) {
    const { id } = await params;
    const { dict } = await getDictionary();

    const bill = await prisma.bill.findUnique({
        where: { id },
        include: { items: true },
    });

    const clients = await prisma.client.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true }
    });


    if (!bill) {
        notFound();
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h1 className={styles.title}>{dict.bills.edit_bill}</h1>
                    <span className={`${styles.status} ${styles['status_' + bill.status]}`}>
                        {(dict.bills.status as any)[bill.status] || bill.status}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <a
                        href={`/api/pdf/bill/${bill.id}`}
                        target="_blank"
                        className={styles.secondaryButton}
                        style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                    >
                        {dict.quotes.download_pdf}
                    </a>
                    <form action={sendBill.bind(null, bill.id)}>
                        <button type="submit" className={styles.secondaryButton} style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbb' }}>{dict.quotes.send_email}</button>
                    </form>
                    <Link href="/bills" style={{ color: "var(--muted-foreground)", display: 'flex', alignItems: 'center' }}>
                        {dict.common.back}
                    </Link>
                </div>
            </div>
            <BillForm
                clients={clients}
                bill={{
                    ...bill,
                    items: bill.items.map(item => ({
                        ...item,
                        title: item.title ?? undefined
                    }))
                }}
                dict={dict}
            />
        </div>
    );
}
