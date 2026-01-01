import QuoteForm from "@/components/QuoteForm";
import { prisma } from "@/lib/prisma";
import styles from "../page.module.css";

export default async function NewQuotePage() {
    const clients = await prisma.client.findMany({ orderBy: { name: "asc" } });

    return (
        <div className={styles.container}>
            <h1 className={styles.title} style={{ marginBottom: "2rem" }}>
                New Quote
            </h1>
            <QuoteForm clients={clients} />
        </div>
    );
}
