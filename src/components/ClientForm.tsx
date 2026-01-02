"use client";

import { createClient, updateClient } from "@/actions/clients";
import styles from "./ClientForm.module.css";
import Link from "next/link";
import { Dictionary } from "@/lib/dictionaries";

interface ClientFormProps {
    client?: {
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        vatNumber: string | null;
        address: string | null;
        city: string | null;
        zipCode: string | null;
        country: string | null;
        companyId: string | null;
    };
    dict: Dictionary;
}

export default function ClientForm({ client, dict }: ClientFormProps) {
    const isEditing = !!client;
    const action = isEditing ? updateClient.bind(null, client.id) : createClient;

    return (
        <form action={action} className={styles.form}>
            <div className={styles.group}>
                <label htmlFor="name" className={styles.label}>
                    {dict.clients.form.name}
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    defaultValue={client?.name}
                    className={styles.input}
                />
            </div>

            <div className={styles.group}>
                <label htmlFor="email" className={styles.label}>
                    {dict.clients.form.email}
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    defaultValue={client?.email || ""}
                    className={styles.input}
                />
            </div>

            <div className={styles.group}>
                <label htmlFor="phone" className={styles.label}>
                    {dict.clients.form.phone}
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
                <label htmlFor="companyId" className={styles.label}>
                    {dict.clients.form.company_id}
                </label>
                <input
                    type="text"
                    id="companyId"
                    name="companyId"
                    defaultValue={client?.companyId || ""}
                    className={styles.input}
                />
            </div>

            <div className={styles.group}>
                <label htmlFor="vatNumber" className={styles.label}>
                    {dict.clients.form.vat}
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
                <label htmlFor="address" className={styles.label}>
                    {dict.clients.form.address}
                </label>
                <input
                    type="text"
                    id="address"
                    name="address"
                    defaultValue={client?.address || ""}
                    className={styles.input}
                />
            </div>

            <div className={styles.group} style={{ flexDirection: 'row', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                    <label htmlFor="zipCode" className={styles.label}>
                        {dict.clients.form.zip}
                    </label>
                    <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        defaultValue={client?.zipCode || ""}
                        className={styles.input}
                        style={{ width: '100%' }}
                    />
                </div>
                <div style={{ flex: 2 }}>
                    <label htmlFor="city" className={styles.label}>
                        {dict.clients.form.city}
                    </label>
                    <input
                        type="text"
                        id="city"
                        name="city"
                        defaultValue={client?.city || ""}
                        className={styles.input}
                        style={{ width: '100%' }}
                    />
                </div>
            </div>

            <div className={styles.group}>
                <label htmlFor="country" className={styles.label}>
                    {dict.clients.form.country}
                </label>
                <input
                    type="text"
                    id="country"
                    name="country"
                    defaultValue={client?.country || ""}
                    className={styles.input}
                />
            </div>

            <div className={styles.actions} style={{ display: 'flex', gap: '1rem', marginTop: "2rem" }}>
                <Link href="/clients" className={styles.secondaryButton}>
                    {dict.common.back}
                </Link>
                <button type="submit" className={styles.button}>
                    {isEditing ? dict.clients.form.submit_update : dict.clients.form.submit_create}
                </button>
            </div>
        </form>
    );
}
