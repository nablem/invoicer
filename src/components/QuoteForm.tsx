"use client";

import { useState } from "react";
import { createQuote, updateQuote, type QuoteInput } from "@/actions/quotes";
import styles from "./QuoteForm.module.css";
import type { Client, Quote, QuoteItem } from "@prisma/client";

interface QuoteFormProps {
    clients: Client[];
    quote?: Quote & { items: QuoteItem[] };
}

type FormItem = {
    key: string | number;
    description: string;
    quantity: number;
    price: number;
};

export default function QuoteForm({ clients, quote }: QuoteFormProps) {
    const [clientId, setClientId] = useState(quote?.clientId || "");
    const [date, setDate] = useState(quote?.date ? new Date(quote.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState(quote?.dueDate ? new Date(quote.dueDate).toISOString().split('T')[0] : "");
    const [items, setItems] = useState<FormItem[]>(
        quote?.items.map(i => ({
            key: i.id,
            description: i.description,
            quantity: i.quantity,
            price: i.price
        })) || [{ key: Date.now(), description: "", quantity: 1, price: 0 }]
    );
    const [notes, setNotes] = useState(quote?.notes || "");

    const handleAddItem = () => {
        setItems([...items, { key: Date.now(), description: "", quantity: 1, price: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: keyof typeof items[0], value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const calculateTotal = () => {
        return items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.price)), 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientId) {
            alert("Please select a client");
            return;
        }

        const data: QuoteInput = {
            clientId,
            date: new Date(date),
            dueDate: dueDate ? new Date(dueDate) : undefined,
            items: items.map(item => ({
                description: item.description,
                quantity: Number(item.quantity),
                price: Number(item.price),
            })),
            notes,
        };

        if (quote) {
            await updateQuote(quote.id, data);
        } else {
            await createQuote(data);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Client & Dates</h3>
                <div className={styles.row}>
                    <div className={styles.col}>
                        <label className={styles.label}>Client</label>
                        <select
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            className={styles.select}
                            required
                        >
                            <option value="">Select Client</option>
                            {clients.map((client) => (
                                <option key={client.id} value={client.id}>
                                    {client.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.col}>
                        <label className={styles.label}>Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>
                    <div className={styles.col}>
                        <label className={styles.label}>Due Date</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className={styles.input}
                        />
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Items</h3>
                {items.map((item, index) => (
                    <div key={item.key || index} className={styles.itemRow}>
                        <input
                            placeholder="Description"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, "description", e.target.value)}
                            className={styles.input}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))}
                            className={styles.input}
                            min="0.01"
                            step="0.01"
                            required
                        />
                        <input
                            type="number"
                            placeholder="Price"
                            value={item.price}
                            onChange={(e) => handleItemChange(index, "price", Number(e.target.value))}
                            className={styles.input}
                            min="0"
                            step="0.01"
                            required
                        />
                        <div style={{ marginLeft: "auto" }}>
                            {(Number(item.quantity) * Number(item.price)).toFixed(2)}
                        </div>
                        <button type="button" onClick={() => handleRemoveItem(index)} className={styles.removeButton}>
                            ✕
                        </button>
                    </div>
                ))}
                <button type="button" onClick={handleAddItem} className={styles.secondaryButton} style={{ width: "fit-content" }}>
                    + Add Item
                </button>
                <div className={styles.total}>Total: {calculateTotal().toFixed(2)} EUR</div>
            </div>

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Notes</h3>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className={styles.input}
                    style={{ minHeight: "100px", resize: "vertical" }}
                />
            </div>

            <button type="submit" className={styles.button}>
                {quote ? "Update Quote" : "Create Quote"}
            </button>
        </form>
    );
}
