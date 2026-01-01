import { prisma } from "@/lib/prisma";
import QuoteForm from "@/components/QuoteForm";
import styles from "../../page.module.css";
import { getDictionary } from "@/lib/i18n";

export default async function NewQuotePage() {
    const { dict } = await getDictionary();
    const clients = await prisma.client.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true }
    });

    return (
        <div className={styles.container}>
            <h1 className={styles.title} style={{ marginBottom: "2rem" }}>{dict.quotes.new_quote}</h1>
            <QuoteForm clients={clients} dict={dict} />
        </div>
    );
}
