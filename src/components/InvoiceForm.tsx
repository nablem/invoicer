"use client";

import { createInvoice, updateInvoice } from "@/actions/invoices";
import { getQuoteDetails } from "@/actions/quotes";
import { getRetainerDetails, searchRetainerInvoices } from "@/actions/retainers";
import { searchClients, searchQuotes } from "@/actions/search";
import Combobox from "@/components/Combobox";
import styles from "./InvoiceForm.module.css";
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

interface InvoiceFormProps {
    clients: { id: string; name: string }[];
    quotes: { id: string; number: string }[];
    invoice?: {
        id: string;
        clientId: string;
        quoteId?: string | null;
        date: Date;
        dueDate: Date | null;
        number: string;
        items: FormItem[];
        notes: string | null;
        isRecurring: boolean;
        recurringInterval: string | null;
        isRetainer: boolean;
        retainerPercentage: number | null;
        isBalance: boolean;
        retainerInvoiceId: string | null;
        retainerDeductionAmount: number | null;
    };
    retainerInvoiceNumber?: string;
    dict: Dictionary;
    readOnly?: boolean;
    defaultVat: number;
    title?: string;
    currency?: string;
    decimalSeparator?: string;
}

export default function InvoiceForm({ clients, quotes, invoice, retainerInvoiceNumber, dict, readOnly, defaultVat, title, currency = "EUR", decimalSeparator = "," }: InvoiceFormProps) {
    const isEditing = !!invoice;
    const action = isEditing ? updateInvoice.bind(null, invoice.id) : createInvoice;

    // Default due date is 30 days from now
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 30);
    const defaultDueDateStr = defaultDueDate.toISOString().split('T')[0];

    // Initialize items with one empty row if creating new, or existing items
    const [items, setItems] = useState<FormItem[]>(
        invoice?.items.map(i => ({ ...i, vat: (i as any).vat ?? 0 })) || [{ title: "", description: "", quantity: 1, price: 0, vat: defaultVat, total: 0 }]
    );
    const [isRecurring, setIsRecurring] = useState(invoice?.isRecurring || false);
    const [isRetainer, setIsRetainer] = useState(invoice?.isRetainer || false);
    const [isBalance, setIsBalance] = useState(invoice?.isBalance || false);
    const [retainerPercentage, setRetainerPercentage] = useState(invoice?.retainerPercentage || 30);
    const [selectedQuoteId, setSelectedQuoteId] = useState<string | undefined>(invoice?.quoteId || undefined);
    const [selectedClientId, setSelectedClientId] = useState<string | undefined>(invoice?.clientId || undefined);
    const [selectedRetainerId, setSelectedRetainerId] = useState<string | undefined>(invoice?.retainerInvoiceId || undefined);
    const [retainerDeductionAmount, setRetainerDeductionAmount] = useState<number>(invoice?.retainerDeductionAmount || 0);
    const [currentRetainerNumber, setCurrentRetainerNumber] = useState<string | undefined>(retainerInvoiceNumber);

    // ... (keep generic handlers) ...
    // Note: I will replace the top section to inject state, and handleSubmit
    // But since I can't easily replace just "handlers", I will continue with replacement.

    // START handlers replacement
    const handleQuoteChange = async (val: string | null) => {
        const newQuoteId = val || undefined;
        setSelectedQuoteId(newQuoteId);
        if (newQuoteId) {
            const quote = await getQuoteDetails(newQuoteId);
            if (quote) {
                if (isRetainer) {
                    updateRetainerItem(quote.total, retainerPercentage, quote.number);
                } else if (isBalance) {
                    // Populate items from new quote
                    setItems(quote.items.map(item => ({
                        title: (item as any).title || "",
                        description: item.description,
                        quantity: item.quantity,
                        price: item.price,
                        vat: (item as any).vat || 0,
                        total: item.total
                    })));
                }
            }
        }
    };
    // ... keep explicit ...
    const updateRetainerItem = (quoteTotal: number, percentage: number, quoteNumber: string) => {
        const amount = quoteTotal * (percentage / 100);
        setItems([{
            title: dict.invoices.retainer_associated_article_title.replace("{number}", quoteNumber),
            description: "",
            quantity: 1,
            price: amount,
            vat: defaultVat,
            total: amount * (1 + defaultVat / 100)
        }]);
    };

    const handleRetainerChange = async (checked: boolean) => {
        setIsRecurring(false);
        setIsBalance(false);
        setIsRetainer(checked);
        setRetainerDeductionAmount(0);
        if (checked && selectedQuoteId) {
            const quote = await getQuoteDetails(selectedQuoteId);
            if (quote) {
                updateRetainerItem(quote.total, retainerPercentage, quote.number);
            }
        } else if (!checked && !invoice) {
            // Reset to empty item if unchecking and creating new
            setItems([{ title: "", description: "", quantity: 1, price: 0, vat: defaultVat, total: 0 }]);
        }
    };

    const handlePercentageChange = async (val: string) => {
        if (val === "") {
            setRetainerPercentage(0); // Or handle as null, but 0 is safe for now
            return;
        }
        const pct = parseFloat(val);
        if (isNaN(pct)) return;

        setRetainerPercentage(pct);
        if (selectedQuoteId) {
            const quote = await getQuoteDetails(selectedQuoteId);
            if (quote) {
                updateRetainerItem(quote.total, pct, quote.number);
            }
        }
    }

    const addItem = () => {
        setItems([...items, { title: "", description: "", quantity: 1, price: 0, vat: defaultVat, total: 0 }]);
    };

    const updateItem = (index: number, field: keyof FormItem, value: any) => {
        const newItems = [...items];
        const item = { ...newItems[index] };

        if (field === "quantity" || field === "price") {
            item[field] = Number(value);
            // Total = Qty * Price * (1 + VAT/100)
            // Use Organization VAT (defaultVat) for calculation
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

    const handleRecurringChange = (checked: boolean) => {
        setIsRecurring(checked);
        if (checked) {
            setIsRetainer(false);
            setIsBalance(false);
            setRetainerDeductionAmount(0);
            if (!invoice && (isRetainer || isBalance)) {
                setItems([{ title: "", description: "", quantity: 1, price: 0, vat: defaultVat, total: 0 }]);
            }
        }
    };

    const [recentRetainers, setRecentRetainers] = useState<{ id: string; label: string }[]>(
        invoice?.retainerInvoiceId && retainerInvoiceNumber
            ? [{ id: invoice.retainerInvoiceId, label: retainerInvoiceNumber }]
            : []
    );

    const handleBalanceChange = async (checked: boolean) => {
        setIsBalance(checked);
        setRetainerDeductionAmount(0);
        setCurrentRetainerNumber(undefined);
        if (checked) {
            setIsRetainer(false);
            setIsRecurring(false);
            if (!invoice) {
                setItems([{ title: "", description: "", quantity: 1, price: 0, vat: defaultVat, total: 0 }]);
                setSelectedRetainerId(undefined);
                setSelectedQuoteId(undefined);
                setSelectedClientId(undefined);
            }
            // Fetch recent retainers to populate initialItems
            searchRetainerInvoices("").then(retainers => {
                setRecentRetainers(retainers.map(r => ({ id: r.id, label: r.number })));
            });
        } else if (!checked && !invoice) {
            setItems([{ title: "", description: "", quantity: 1, price: 0, vat: defaultVat, total: 0 }]);
        }
    }

    const handleRetainerInvoiceChange = async (val: string | null) => {
        const id = val || undefined;
        setSelectedRetainerId(id);

        if (isBalance && id) {
            const retainer = await getRetainerDetails(id);
            if (retainer) {
                // Auto populate quote and client
                setSelectedQuoteId(retainer.quoteId || undefined);
                setSelectedClientId(retainer.clientId);

                // Populate items (Quote items only)
                const newItems: FormItem[] = retainer.items.map(item => ({
                    title: (item as any).title || "",
                    description: item.description,
                    quantity: item.quantity,
                    price: item.price,
                    vat: (item as any).vat || 0,
                    total: item.total
                }));

                setItems(newItems);

                // Set deduction amount
                setRetainerDeductionAmount(retainer.total);
                setCurrentRetainerNumber(retainer.number);
            }
        } else {
            setRetainerDeductionAmount(0);
            setCurrentRetainerNumber(undefined);
        }
    }

    const [saved, setSaved] = useState(false);
    const [clientError, setClientError] = useState(false);
    const [quoteError, setQuoteError] = useState(false);
    const [retainerError, setRetainerError] = useState(false);
    const [duplicateError, setDuplicateError] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        let hasError = false;
        const clientId = formData.get("clientId");

        if (!clientId) {
            setClientError(true);
            hasError = true;
            setTimeout(() => setClientError(false), 3000);
        }

        if (isRetainer && !formData.get("quoteId")) {
            setQuoteError(true);
            hasError = true;
            setTimeout(() => setQuoteError(false), 3000);
        }

        if (isBalance && !formData.get("retainerInvoiceId")) {
            setRetainerError(true);
            hasError = true;
            setTimeout(() => setRetainerError(false), 3000);
        }

        if (hasError) return;

        try {
            const result = await action(formData);
            if (result && result.error === "DUPLICATE_NUMBER") {
                setDuplicateError(true);
                setTimeout(() => setDuplicateError(false), 3000);
            } else {
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }
        } catch (e: any) {
            console.error(e);
            // Fallback for unexpected errors
        }
    };

    const itemsTotal = items.reduce((sum, item) => sum + item.total, 0);
    const total = itemsTotal - retainerDeductionAmount;

    return (
        <form action={handleSubmit} className={styles.form}>
            {title && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{title}</h1>
                    {duplicateError && (
                        <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.875rem' }}>
                            {dict.invoices.validation.duplicate_number_error}
                        </span>
                    )}
                </div>
            )}
            <input type="hidden" name="retainerDeductionAmount" value={retainerDeductionAmount} />
            <div className={styles.row}>
                <div className={styles.group}>

                    <Combobox
                        key={selectedClientId}
                        name="clientId"
                        label={dict.invoices.client}
                        initialItems={clients.map(c => ({ id: c.id, label: c.name }))}
                        searchAction={searchClients}
                        defaultValue={selectedClientId}
                        placeholder={dict.invoices.select_client}
                        minSearchLength={2}
                        valueKey="name"
                        disabled={readOnly || isBalance}
                        error={clientError ? dict.invoices.validation.required_field : undefined}
                    />
                </div>
                <div className={styles.group}>

                    <Combobox
                        key={selectedQuoteId}
                        name="quoteId"
                        label={dict.common.quotes}
                        initialItems={quotes.map(q => ({ id: q.id, label: q.number }))}
                        searchAction={searchQuotes}
                        defaultValue={selectedQuoteId}
                        onSelect={handleQuoteChange}
                        placeholder="-"
                        minSearchLength={4}
                        valueKey="number"
                        allowClear={!isRetainer && !isBalance}
                        disabled={readOnly || isBalance}
                        error={quoteError ? dict.invoices.validation.quote_required : undefined}
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
                        defaultValue={invoice ? new Date(invoice.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                        className={styles.input}
                        disabled={readOnly}
                    />
                </div>
                <div className={styles.group}>
                    <label htmlFor="dueDate" className={styles.label}>
                        {dict.invoices.form.due_date}
                    </label>
                    <input
                        type="date"
                        id="dueDate"
                        name="dueDate"
                        defaultValue={invoice?.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : defaultDueDateStr}

                        className={styles.input}
                        disabled={readOnly}
                    />
                </div>
            </div>
            <div className={styles.row} style={{ alignItems: 'center', marginTop: '1rem', marginBottom: '1rem' }}>
                <div className={styles.group} style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', width: 'auto' }}>
                    <input
                        type="checkbox"
                        id="isRecurring"
                        name="isRecurring"
                        checked={isRecurring}
                        onChange={(e) => handleRecurringChange(e.target.checked)}

                        style={{ width: 'auto' }}
                        disabled={readOnly}
                    />
                    <label htmlFor="isRecurring" className={styles.label} style={{ marginBottom: 0 }}>
                        {dict.invoices.recurring_invoice}
                    </label>
                </div>

                <div className={styles.group} style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', width: 'auto' }}>
                    <input
                        type="checkbox"
                        id="isRetainer"
                        name="isRetainer"
                        checked={isRetainer}
                        onChange={(e) => handleRetainerChange(e.target.checked)}
                        style={{ width: 'auto' }}
                        disabled={readOnly}
                    />
                    <label htmlFor="isRetainer" className={styles.label} style={{ marginBottom: 0 }}>
                        {dict.invoices.retainer_invoice}
                    </label>
                </div>

                <div className={styles.group} style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', width: 'auto' }}>
                    <input
                        type="checkbox"
                        id="isBalance"
                        name="isBalance"
                        checked={isBalance}
                        onChange={(e) => handleBalanceChange(e.target.checked)}
                        style={{ width: 'auto' }}
                        disabled={readOnly}
                    />
                    <label htmlFor="isBalance" className={styles.label} style={{ marginBottom: 0 }}>
                        {dict.invoices.balance_invoice}
                    </label>
                </div>
            </div>

            {isBalance && (
                <div className={styles.group}>
                    <Combobox
                        name="retainerInvoiceId"
                        label={dict.invoices.associated_retainer}
                        initialItems={recentRetainers}
                        searchAction={searchRetainerInvoices}
                        onSelect={handleRetainerInvoiceChange}
                        defaultValue={invoice?.retainerInvoiceId || undefined}
                        placeholder={dict.invoices.select_retainer}
                        minSearchLength={0}
                        valueKey="number"
                        disabled={readOnly}
                        error={retainerError ? dict.invoices.validation.retainer_required : undefined}
                    />
                </div>
            )}

            {isRetainer && (
                <div className={styles.group}>
                    <label htmlFor="retainerPercentage" className={styles.label}>
                        {dict.invoices.retainer_percentage}
                    </label>
                    <input
                        type="number"
                        id="retainerPercentage"
                        name="retainerPercentage"
                        value={retainerPercentage}
                        onChange={(e) => handlePercentageChange(e.target.value)}
                        className={styles.input}
                        min="1"
                        max="100"
                        disabled={readOnly}
                    />
                </div>
            )}

            {isRecurring && (
                <div className={styles.group}>
                    <label htmlFor="recurringInterval" className={styles.label}>
                        {dict.invoices.frequency}
                    </label>
                    <select
                        id="recurringInterval"
                        name="recurringInterval"
                        defaultValue={invoice?.recurringInterval || "MONTHLY"}

                        className={styles.select}
                        disabled={readOnly}
                    >
                        <option value="WEEKLY">{dict.invoices.intervals.weekly}</option>
                        <option value="MONTHLY">{dict.invoices.intervals.monthly}</option>
                        <option value="QUARTERLY">{dict.invoices.intervals.quarterly}</option>
                        <option value="YEARLY">{dict.invoices.intervals.yearly}</option>
                    </select>
                </div>
            )}

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
                                disabled={readOnly || isRetainer || isBalance}
                            />
                            <SmartTextarea
                                placeholder={dict.quotes.form.description_placeholder}
                                value={item.description}
                                onValueChange={(val) => updateItem(index, "description", val)}
                                className={styles.textarea}

                                style={{ minHeight: '80px', resize: 'vertical' }}

                                disabled={readOnly || isRetainer || isBalance}
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
                            disabled={readOnly || isRetainer || isBalance}
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
                            disabled={readOnly || isRetainer || isBalance}
                        />

                        {/* VAT input hidden but keeping value for form submission if needed, though we set it in updateItem now */}
                        {/* <input ... vat input removed ... /> */}
                        <div style={{ fontWeight: 'bold', textAlign: 'right', paddingTop: '0.75rem' }}>
                            {formatPrice(item.total, "", decimalSeparator).trim()}
                        </div>
                        {!readOnly && !isRetainer && !isBalance && (
                            <button type="button" onClick={() => removeItem(index)} className={styles.deleteButton} aria-label="Remove item" style={{ marginTop: '0.5rem' }}>
                                ×
                            </button>
                        )}
                    </div>
                ))}

                {!readOnly && !isRetainer && !isBalance && (
                    <button type="button" onClick={addItem} className={styles.secondaryButton} style={{ marginTop: '1rem' }}>
                        {dict.quotes.form.add_item}
                    </button>
                )}

                {isBalance && retainerDeductionAmount > 0 && (
                    <div className={styles.itemRow} style={{ borderTop: '1px solid #e5e7eb', marginTop: '1rem', paddingTop: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: '1 / span 1' }}>
                            <span style={{ fontSize: '0.875rem', color: '#ef4444', fontWeight: 'bold' }}>
                                {dict.invoices.amount_paid_retainer.replace("{number}", currentRetainerNumber || "")}
                            </span>
                        </div>
                        {/* Empty columns for Qty and Price */}
                        <div></div>
                        <div></div>

                        <div style={{ fontWeight: 'bold', textAlign: 'right', color: '#ef4444' }}>
                            - {formatPrice(retainerDeductionAmount, "", decimalSeparator).trim()}
                        </div>
                    </div>
                )}

                <div className={styles.totalRow}>
                    <span>{defaultVat > 0 ? dict.common.total_ttc : dict.common.total_ht}:</span>
                    <span>{formatPrice(total, currency, decimalSeparator)}</span>
                </div>
            </div>

            <div className={styles.group}>
                <label htmlFor="notes" className={styles.label}>
                    {dict.quotes.form.notes_section}
                </label>
                <textarea
                    id="notes"
                    name="notes"
                    defaultValue={invoice?.notes || ""}
                    className={styles.textarea}

                    rows={4}

                    disabled={readOnly}
                />
            </div>

            <div className={styles.actions} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Link href="/invoices" className={styles.secondaryButton}>
                    {dict.common.back}
                </Link>
                {(!readOnly) && (
                    <button type="submit" className={styles.button} disabled={saved} style={saved ? { background: '#22c55e' } : {}}>
                        {saved ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                ✓ {dict.common.saved}
                            </span>
                        ) : (
                            isEditing ? dict.invoices.form.submit_update : dict.invoices.form.submit_create
                        )}
                    </button>
                )}
            </div>
        </form>
    );
}
