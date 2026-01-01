import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ClientForm from "@/components/ClientForm";
import styles from "../page.module.css";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditClientPage({ params }: PageProps) {
    const { id } = await params;
    const client = await prisma.client.findUnique({
        where: { id },
    });

    if (!client) {
        notFound();
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Edit Client</h1>
                <Link href="/clients" style={{ color: "var(--muted-foreground)" }}>
                    Back
                </Link>
            </div>
            <ClientForm client={client} />
        </div>
    );
}
