import InvoiceForm from "@/components/InvoiceForm";
import { prisma } from "@/lib/prisma";
import styles from "../../page.module.css";
import { getDictionary } from "@/lib/i18n";

export default async function NewInvoicePage() {
    const { dict } = await getDictionary();
    const clients = await prisma.client.findMany({
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true }
    });
    const quotes = await prisma.quote.findMany({
        orderBy: { number: "desc" },
        select: { id: true, number: true }
    });

    const organization = await prisma.organization.findFirst();

    return (
        <div className={styles.container}>
            <h1 className={styles.title} style={{ marginBottom: "2rem" }}>{dict.invoices.new_invoice}</h1>
            <InvoiceForm clients={clients} quotes={quotes} dict={dict} defaultVat={organization?.defaultVat || 0} />
        </div>
    );
}
