import BillForm from "@/components/BillForm";
import { prisma } from "@/lib/prisma";
import styles from "../../page.module.css";
import { getDictionary } from "@/lib/i18n";

export default async function NewBillPage() {
    const { dict } = await getDictionary();
    const clients = await prisma.client.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true }
    });

    return (
        <div className={styles.container}>
            <h1 className={styles.title} style={{ marginBottom: "2rem" }}>{dict.bills.new_bill}</h1>
            <BillForm clients={clients} dict={dict} />
        </div>
    );
}
