"use client";

import { createQuote, updateQuote } from "@/actions/quotes";
import { searchClients } from "@/actions/search";
import Combobox from "@/components/Combobox";
import styles from "./QuoteForm.module.css";
import { useState } from "react";
import Link from "next/link";
import { Dictionary } from "@/lib/dictionaries";
import SmartTextarea from "./SmartTextarea";
import { formatPrice } from "@/lib/format";

interface FormItem {
    id?: string;
    title?: string;
    description: string;
    quantity: number;
    price: number;
    vat: number;
    total: number;
}

interface QuoteFormProps {
    clients: { id: string; name: string }[];
    quote?: {
        id: string;
        clientId: string;
        date: Date;
        dueDate: Date | null;
        number: string;
        items: FormItem[];
        notes: string | null;
    };
    dict: Dictionary;
    convertAction?: any;
    readOnly?: boolean;
    defaultVat: number;
    currency?: string;
    decimalSeparator?: string;
}

export default function QuoteForm({ clients, quote, dict, convertAction, readOnly, defaultVat, currency = "EUR", decimalSeparator = "," }: QuoteFormProps) {
    const isEditing = !!quote;
    const action = isEditing ? updateQuote.bind(null, quote.id) : createQuote;

    // Default expiry date is 3 months from now
    const defaultExpiry = new Date();
    defaultExpiry.setMonth(defaultExpiry.getMonth() + 3);
    const defaultExpiryStr = defaultExpiry.toISOString().split('T')[0];

    // Initialize items with one empty row if creating new, or existing items
    const [items, setItems] = useState<FormItem[]>(
        quote?.items.map(i => ({ ...i, vat: (i as any).vat ?? 0 })) || [{ title: "", description: "", quantity: 1, price: 0, vat: defaultVat, total: 0 }]
    );

    const addItem = () => {
        setItems([...items, { title: "", description: "", quantity: 1, price: 0, vat: defaultVat, total: 0 }]);
    };


    const updateItem = (index: number, field: keyof FormItem, value: any) => {
        const newItems = [...items];
        const item = { ...newItems[index] };

        if (field === "quantity" || field === "price") {
            item[field] = Number(value);
            // Total = Qty * Price * (1 + VAT/100)
            item.vat = defaultVat;
            item.total = item.quantity * item.price * (1 + defaultVat / 100);
        } else if (field === "description" || field === "title") {
            item[field] = value;
        }

        newItems[index] = item;
        setItems(newItems);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const [saved, setSaved] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        await action(formData);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const total = items.reduce((sum, item) => sum + item.total, 0);

    return (
        <form action={handleSubmit} className={styles.form}>
            <div className={styles.row}>
                <div className={styles.group}>
                    <Combobox
                        name="clientId"
                        label={dict.quotes.form.client}
                        initialItems={clients.map(c => ({ id: c.id, label: c.name }))}
                        searchAction={searchClients}
                        defaultValue={quote?.clientId}
                        placeholder={dict.quotes.form.select_client}
                        minSearchLength={2}
                        valueKey="name"
                        disabled={readOnly}
                    />

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
                        defaultValue={quote ? new Date(quote.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                        className={styles.input}
                        disabled={readOnly}
                    />
                </div>
                <div className={styles.group}>
                    <label htmlFor="dueDate" className={styles.label}>
                        {dict.quotes.form.due_date}
                    </label>
                    <input
                        type="date"
                        id="dueDate"
                        name="dueDate"
                        defaultValue={quote?.dueDate ? new Date(quote.dueDate).toISOString().split('T')[0] : defaultExpiryStr}
                        className={styles.input}
                        disabled={readOnly}
                    />
                </div>
            </div>

            <div className={styles.itemsSection}>
                <h3>{dict.quotes.form.items_section}</h3>
                <div className={styles.itemsHeader}>
                    <div>{dict.quotes.form.description}</div>
                    <div>{dict.quotes.form.qty}</div>
                    <div>{dict.quotes.form.price}</div>
                    <div>{defaultVat > 0 ? dict.common.total_ttc : dict.common.total_ht}</div>
                </div>

                {items.map((item, index) => (
                    <div key={index} className={styles.itemRow}>
                        <input type="hidden" name={`title_${index}`} value={item.title || ""} />
                        <input type="hidden" name={`description_${index}`} value={item.description} />
                        <input type="hidden" name={`quantity_${index}`} value={item.quantity} />
                        <input type="hidden" name={`price_${index}`} value={item.price} />
                        <input type="hidden" name={`vat_${index}`} value={item.vat} />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <input
                                type="text"
                                placeholder={dict.quotes.form.title}
                                value={item.title || ""}
                                onChange={(e) => updateItem(index, "title", e.target.value)}
                                className={styles.input}

                                required
                                disabled={readOnly}
                            />
                            <SmartTextarea
                                placeholder={dict.quotes.form.description_placeholder}
                                value={item.description}
                                onValueChange={(val) => updateItem(index, "description", val)}
                                className={styles.textarea}
                                style={{ minHeight: '80px', resize: 'vertical' }}

                                disabled={readOnly}
                            />
                        </div>
                        <input
                            type="number"
                            min="1"
                            placeholder={dict.quotes.form.qty}
                            value={item.quantity}
                            onChange={(e) => updateItem(index, "quantity", e.target.value)}
                            className={styles.input}
                            style={{ textAlign: 'right' }}
                            disabled={readOnly}
                        />
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder={dict.quotes.form.price}
                            value={item.price}
                            onChange={(e) => updateItem(index, "price", e.target.value)}
                            className={styles.input}
                            style={{ textAlign: 'right' }}
                            disabled={readOnly}
                        />

                        {/* VAT input removed */}
                        <div style={{ fontWeight: 'bold', textAlign: 'right', paddingTop: '0.75rem' }}>
                            {formatPrice(item.total, "", decimalSeparator).trim()}
                        </div>
                        {!readOnly && (
                            <button type="button" onClick={() => removeItem(index)} className={styles.deleteButton} aria-label="Remove item" style={{ marginTop: '0.5rem' }}>
                                ×
                            </button>
                        )}
                    </div>
                ))}

                {!readOnly && (
                    <button type="button" onClick={addItem} className={styles.secondaryButton} style={{ marginTop: '1rem' }}>
                        {dict.quotes.form.add_item}
                    </button>
                )}

                <div className={styles.totalRow}>
                    <span>{defaultVat > 0 ? dict.common.total_ttc : dict.common.total_ht}:</span>
                    <span>{formatPrice(items.reduce((sum, item) => sum + item.total, 0), currency, decimalSeparator)}</span>
                </div>
            </div>

            <div className={styles.group}>
                <label htmlFor="notes" className={styles.label}>
                    {dict.quotes.form.notes_section}
                </label>
                <textarea
                    id="notes"
                    name="notes"
                    defaultValue={quote?.notes || ""}
                    className={styles.textarea}


                    rows={4}
                    disabled={readOnly}
                />
            </div>

            <div className={styles.actions} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link href="/quotes" className={styles.secondaryButton}>
                        {dict.common.back}
                    </Link>
                    {!readOnly && (
                        <button type="submit" className={styles.button} disabled={saved} style={saved ? { background: '#22c55e' } : {}}>
                            {saved ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    ✓ {dict.common.saved}
                                </span>
                            ) : (
                                isEditing ? dict.quotes.form.submit_update : dict.quotes.form.submit_create
                            )}
                        </button>
                    )}
                </div>

                {/* Convert Button */}
                {convertAction && (
                    <button
                        formAction={convertAction}
                        className={styles.button}
                        style={{ background: '#f59e0b', color: 'white' }}
                    >
                        {dict.quotes.convert}
                    </button>
                )}
            </div>
        </form>
    );
}
