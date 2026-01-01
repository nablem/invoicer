"use client";

import { createBill, updateBill } from "@/actions/bills";
import styles from "./BillForm.module.css";
import { useState } from "react";
import Link from "next/link";
import { Dictionary } from "@/lib/dictionaries";
import SmartTextarea from "./SmartTextarea";

interface FormItem {
    id?: string;
    title?: string;
    description: string;
    quantity: number;
    price: number;
    total: number;
}

interface BillFormProps {
    clients: { id: string; name: string }[];
    bill?: {
        id: string;
        clientId: string;
        date: Date;
        dueDate: Date | null;
        number: string;
        items: FormItem[];
        notes: string | null;
        isRecurring: boolean;
        recurringInterval: string | null;
    };
    dict: Dictionary;
}

export default function BillForm({ clients, bill, dict }: BillFormProps) {
    const isEditing = !!bill;
    const action = isEditing ? updateBill.bind(null, bill.id) : createBill;

    // Default due date is 30 days from now
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 30);
    const defaultDueDateStr = defaultDueDate.toISOString().split('T')[0];

    // Initialize items with one empty row if creating new, or existing items
    const [items, setItems] = useState<FormItem[]>(
        bill?.items || [{ title: "", description: "", quantity: 1, price: 0, total: 0 }]
    );
    const [isRecurring, setIsRecurring] = useState(bill?.isRecurring || false);

    const addItem = () => {
        setItems([...items, { title: "", description: "", quantity: 1, price: 0, total: 0 }]);
    };

    const updateItem = (index: number, field: keyof FormItem, value: any) => {
        const newItems = [...items];
        const item = { ...newItems[index] };

        if (field === "quantity" || field === "price") {
            item[field] = Number(value);
            item.total = item.quantity * item.price;
        } else if (field === "description" || field === "title") {
            item[field] = value;
        }

        newItems[index] = item;
        setItems(newItems);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const total = items.reduce((sum, item) => sum + item.total, 0);

    return (
        <form action={action} className={styles.form}>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label htmlFor="clientId" className={styles.label}>
                        {dict.quotes.form.client}
                    </label>
                    <select
                        id="clientId"
                        name="clientId"
                        required
                        defaultValue={bill?.clientId || ""}
                        className={styles.select}
                    >
                        <option value="">{dict.quotes.form.select_client}</option>
                        {clients.map((client) => (
                            <option key={client.id} value={client.id}>
                                {client.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.row}>
                <div className={styles.group}>
                    <label htmlFor="date" className={styles.label}>
                        {dict.quotes.form.date}
                    </label>
                    <input
                        type="date"
                        id="date"
                        name="date"
                        required
                        defaultValue={bill ? new Date(bill.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                        className={styles.input}
                    />
                </div>
                <div className={styles.group}>
                    <label htmlFor="dueDate" className={styles.label}>
                        {dict.bills.form.due_date}
                    </label>
                    <input
                        type="date"
                        id="dueDate"
                        name="dueDate"
                        defaultValue={bill?.dueDate ? new Date(bill.dueDate).toISOString().split('T')[0] : defaultDueDateStr}
                        className={styles.input}
                    />
                </div>
            </div>
            <div className={styles.group} style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                <input
                    type="checkbox"
                    id="isRecurring"
                    name="isRecurring"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    style={{ width: 'auto' }}
                />
                <label htmlFor="isRecurring" className={styles.label} style={{ marginBottom: 0 }}>
                    {dict.bills.recurring_bill}
                </label>
            </div>

            {isRecurring && (
                <div className={styles.group}>
                    <label htmlFor="recurringInterval" className={styles.label}>
                        {dict.bills.recurring} Interval
                    </label>
                    <select
                        id="recurringInterval"
                        name="recurringInterval"
                        defaultValue={bill?.recurringInterval || "MONTHLY"}
                        className={styles.select}
                    >
                        <option value="WEEKLY">{dict.bills.intervals.weekly}</option>
                        <option value="MONTHLY">{dict.bills.intervals.monthly}</option>
                        <option value="QUARTERLY">{dict.bills.intervals.quarterly}</option>
                        <option value="YEARLY">{dict.bills.intervals.yearly}</option>
                    </select>
                </div>
            )}

            <div className={styles.itemsSection}>
                <h3>{dict.quotes.form.items_section}</h3>
                <div className={styles.itemsHeader}>
                    <div style={{ flex: 3 }}>{dict.quotes.form.description}</div>
                    <div style={{ flex: 1 }}>{dict.quotes.form.qty}</div>
                    <div style={{ flex: 1 }}>{dict.quotes.form.price}</div>
                    <div style={{ flex: 1 }}>{dict.common.total}</div>
                    <div style={{ width: '40px' }}></div>
                </div>

                {items.map((item, index) => (
                    <div key={index} className={styles.itemRow} style={{ alignItems: 'flex-start' }}>
                        <input type="hidden" name={`title_${index}`} value={item.title || ""} />
                        <input type="hidden" name={`description_${index}`} value={item.description} />
                        <input type="hidden" name={`quantity_${index}`} value={item.quantity} />
                        <input type="hidden" name={`price_${index}`} value={item.price} />

                        <div style={{ flex: 3, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <input
                                type="text"
                                placeholder={dict.quotes.form.title}
                                value={item.title || ""}
                                onChange={(e) => updateItem(index, "title", e.target.value)}
                                className={styles.input}
                            />
                            <SmartTextarea
                                placeholder={dict.quotes.form.description}
                                value={item.description}
                                onValueChange={(val) => updateItem(index, "description", val)}
                                className={styles.textarea}
                                style={{ minHeight: '80px', resize: 'vertical' }}
                                required
                            />
                        </div>
                        <input
                            type="number"
                            min="1"
                            placeholder={dict.quotes.form.qty}
                            value={item.quantity}
                            onChange={(e) => updateItem(index, "quantity", e.target.value)}
                            className={styles.input}
                            style={{ flex: 1 }}
                        />
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder={dict.quotes.form.price}
                            value={item.price}
                            onChange={(e) => updateItem(index, "price", e.target.value)}
                            className={styles.input}
                            style={{ flex: 1 }}
                        />
                        <div style={{ flex: 1, fontWeight: 'bold', textAlign: 'right', paddingTop: '0.75rem' }}>
                            {item.total.toFixed(2)}
                        </div>
                        <button type="button" onClick={() => removeItem(index)} className={styles.deleteButton} aria-label="Remove item" style={{ marginTop: '0.5rem' }}>
                            ×
                        </button>
                    </div>
                ))}

                <button type="button" onClick={addItem} className={styles.secondaryButton} style={{ marginTop: '1rem' }}>
                    {dict.quotes.form.add_item}
                </button>

                <div className={styles.totalRow}>
                    <span>{dict.common.total}:</span>
                    <span>{total.toFixed(2)}</span>
                </div>
            </div>

            <div className={styles.group}>
                <label htmlFor="notes" className={styles.label}>
                    {dict.quotes.form.notes_section}
                </label>
                <textarea
                    id="notes"
                    name="notes"
                    defaultValue={bill?.notes || ""}
                    className={styles.textarea}
                    rows={4}
                />
            </div>

            <div className={styles.actions}>
                <button type="submit" className={styles.button}>
                    {isEditing ? dict.quotes.form.submit_update : dict.quotes.form.submit_create}
                </button>
            </div>
        </form>
    );
}
