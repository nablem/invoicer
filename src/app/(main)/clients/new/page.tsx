import Link from "next/link";
import ClientForm from "@/components/ClientForm";
import styles from "../../page.module.css";
import { getDictionary } from "@/lib/i18n";

export default async function NewClientPage() {
    const { dict } = await getDictionary();
    return (
        <div className={styles.container}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 className={styles.title} style={{ marginBottom: "2rem" }}>{dict.clients.new_client}</h1>
                <ClientForm dict={dict} />
            </div>
        </div>
    );
}
