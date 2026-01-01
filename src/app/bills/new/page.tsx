import BillForm from "@/components/BillForm";
import { prisma } from "@/lib/prisma";
import styles from "../page.module.css";

export default async function NewBillPage() {
    const clients = await prisma.client.findMany({ orderBy: { name: "asc" } });

    return (
        <div className={styles.container}>
            <h1 className={styles.title} style={{ marginBottom: "2rem" }}>
                New Bill
            </h1>
            <BillForm clients={clients} />
        </div>
    );
}
