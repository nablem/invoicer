import ClientForm from "@/components/ClientForm";
import styles from "../page.module.css";

export default function NewClientPage() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title} style={{ marginBottom: "2rem" }}>
                New Client
            </h1>
            <ClientForm />
        </div>
    );
}
