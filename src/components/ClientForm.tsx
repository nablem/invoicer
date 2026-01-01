"use client";

import { createClient, updateClient } from "@/actions/clients";
import styles from "./ClientForm.module.css";
import type { Client } from "@prisma/client";

interface ClientFormProps {
    client?: Client;
}

export default function ClientForm({ client }: ClientFormProps) {
    const action = client ? updateClient.bind(null, client.id) : createClient;

    return (
        <form action={action} className={styles.form}>
            <div className={styles.group}>
                <label htmlFor="name" className={styles.label}>
                    Name
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    defaultValue={client?.name}
                    required
                    className={styles.input}
                />
            </div>

            <div className={styles.group}>
                <label htmlFor="email" className={styles.label}>
                    Email
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    defaultValue={client?.email}
                    required
                    className={styles.input}
                />
            </div>

            <div className={styles.group}>
                <label htmlFor="phone" className={styles.label}>
                    Phone
                </label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    defaultValue={client?.phone || ""}
                    className={styles.input}
                />
            </div>

            <div className={styles.group}>
                <label htmlFor="vatNumber" className={styles.label}>
                    VAT Number
                </label>
                <input
                    type="text"
                    id="vatNumber"
                    name="vatNumber"
                    defaultValue={client?.vatNumber || ""}
                    className={styles.input}
                />
            </div>

            <div className={styles.group}>
                <label htmlFor="billingAddress" className={styles.label}>
                    Billing Address
                </label>
                <textarea
                    id="billingAddress"
                    name="billingAddress"
                    defaultValue={client?.billingAddress || ""}
                    className={`${styles.input} ${styles.textarea}`}
                />
            </div>

            <button type="submit" className={styles.submit}>
                {client ? "Update Client" : "Create Client"}
            </button>
        </form>
    );
}
