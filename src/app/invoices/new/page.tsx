import InvoiceForm from "@/components/InvoiceForm";
import { prisma } from "@/lib/prisma";
import styles from "../../page.module.css";
import { getDictionary } from "@/lib/i18n";
import { getAvailableTemplates } from "@/actions/templates";

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
    const availableTemplates = await getAvailableTemplates("invoice");

    return (
        <div className={styles.container}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <InvoiceForm
                    clients={clients}
                    quotes={quotes}
                    dict={dict}
                    defaultVat={organization?.defaultVat || 0}
                    title={dict.invoices.new_invoice}
                    currency={organization?.currency || "EUR"}
                    decimalSeparator={organization?.decimalSeparator}
                    availableTemplates={availableTemplates}
                    defaultTemplate={organization?.invoiceTemplate || "invoice"}
                />
            </div>
        </div>
    );
}
