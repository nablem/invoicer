import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ClientForm from "@/components/ClientForm";
import styles from "../page.module.css";
import { getDictionary } from "@/lib/i18n";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditClientPage({ params }: PageProps) {
    const { id } = await params;
    const { dict } = await getDictionary();

    const client = await prisma.client.findUnique({
        where: { id },
    });

    if (!client) {
        notFound();
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>{dict.clients.edit_client}</h1>

            </div>
            <ClientForm client={client} dict={dict} />
        </div>
    );
}
