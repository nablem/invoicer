"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface InvoiceItemInput {
    title?: string;
    description: string;
    quantity: number;
    price: number;
    vat: number;
}

export interface InvoiceInput {
    clientId: string;
    date: Date;
    dueDate?: Date;
    items: InvoiceItemInput[];
    notes?: string;
    isRecurring?: boolean;
    recurringInterval?: string;
    isRetainer?: boolean;
    retainerPercentage?: number;
    isBalance?: boolean;
    retainerInvoiceId?: string;
    retainerDeductionAmount?: number;
}

// ... parseItems function ... (unchanged, but replace_file_content might need context. I'll target the interface and createInvoice body)

// Actually I will target from interface definition down to createInvoice body

// Helper to parse items from FormData
function parseItems(formData: FormData): InvoiceItemInput[] {
    const items: InvoiceItemInput[] = [];
    const entries = Array.from(formData.entries());

    // Find all indices
    const indices = new Set<number>();
    for (const [key] of entries) {
        if (key.startsWith("title_")) {
            const index = parseInt(key.split("_")[1]);
            indices.add(index);
        }
    }

    // Build items
    for (const index of indices) {
        const title = formData.get(`title_${index}`) as string;
        const description = formData.get(`description_${index}`) as string;
        const quantity = parseFloat(formData.get(`quantity_${index}`) as string || "0");
        const price = parseFloat(formData.get(`price_${index}`) as string || "0");
        const vat = parseFloat(formData.get(`vat_${index}`) as string || "0");

        if (title) {
            items.push({ title, description, quantity, price, vat });
        }
    }

    return items;
}

export async function createInvoice(formData: FormData) {
    const clientId = formData.get("clientId") as string;
    const quoteId = formData.get("quoteId") as string || undefined;
    const date = new Date(formData.get("date") as string);
    const dueDateStr = formData.get("dueDate") as string;
    const dueDate = dueDateStr ? new Date(dueDateStr) : undefined;
    const notes = formData.get("notes") as string;
    const isRecurring = formData.get("isRecurring") === "on";
    const recurringInterval = formData.get("recurringInterval") as string;
    const isRetainer = formData.get("isRetainer") === "on";
    const retainerPercentage = parseFloat(formData.get("retainerPercentage") as string || "0");
    const isBalance = formData.get("isBalance") === "on";
    const retainerInvoiceId = formData.get("retainerInvoiceId") as string || undefined;
    const retainerDeductionAmount = parseFloat(formData.get("retainerDeductionAmount") as string || "0");

    if (!clientId) throw new Error("Client ID is required");
    if (isRetainer && !quoteId) throw new Error("Quote is required for retainer invoices");
    if (isBalance && !retainerInvoiceId) throw new Error("Retainer invoice is required for balance invoices");

    const items = parseItems(formData);
    const total = items.reduce((acc, item) => acc + (item.quantity * item.price * (1 + (item.vat || 0) / 100)), 0);

    // Generate Invoice Number inside a transaction to ensure sequence atomicity
    try {
        await prisma.$transaction(async (tx) => {
            const organization = await tx.organization.findFirst();

            let number = `INV-${Date.now()}`; // Fallback

            if (organization) {
                const { invoicePrefix, invoiceIncludeYear, invoiceIncludeMonth, invoiceSequence, invoiceDigits } = organization;

                const yearPart = invoiceIncludeYear ? new Date().getFullYear().toString() : "";
                const monthPart = invoiceIncludeMonth ? (new Date().getMonth() + 1).toString().padStart(2, '0') : "";
                const sequencePart = invoiceSequence.toString().padStart(invoiceDigits, '0');

                number = `${invoicePrefix}${yearPart}${monthPart}${sequencePart}`;

                // Increment sequence
                await tx.organization.update({
                    where: { id: organization.id },
                    data: { invoiceSequence: { increment: 1 } }
                });
            }

            await tx.invoice.create({
                data: {
                    number,
                    clientId,
                    quoteId,
                    date,
                    dueDate,
                    notes,
                    total,
                    isRecurring,
                    recurringInterval: isRecurring ? recurringInterval : undefined,
                    isRetainer,
                    retainerPercentage: isRetainer ? retainerPercentage : undefined,
                    isBalance,
                    retainerInvoiceId: isBalance ? retainerInvoiceId : undefined,
                    retainerDeductionAmount: isBalance ? retainerDeductionAmount : undefined,
                    items: {
                        create: items.map((item) => ({
                            title: item.title,
                            description: item.description,
                            quantity: item.quantity,
                            price: item.price,
                            vat: item.vat,
                            total: item.quantity * item.price * (1 + (item.vat || 0) / 100),
                        })),
                    },
                },
            });
        });

        revalidatePath("/invoices");
        redirect("/invoices");
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { error: "DUPLICATE_NUMBER" };
        }
        throw error;
    }
}

export async function updateInvoice(id: string, formData: FormData) {
    const clientId = formData.get("clientId") as string;
    const quoteId = formData.get("quoteId") as string || null;
    const date = new Date(formData.get("date") as string);
    const dueDateStr = formData.get("dueDate") as string;
    const dueDate = dueDateStr ? new Date(dueDateStr) : undefined;
    const notes = formData.get("notes") as string;
    const isRecurring = formData.get("isRecurring") === "on";
    const recurringInterval = formData.get("recurringInterval") as string;
    const isRetainer = formData.get("isRetainer") === "on";
    const retainerPercentage = parseFloat(formData.get("retainerPercentage") as string || "0");
    const isBalance = formData.get("isBalance") === "on";
    const retainerInvoiceId = formData.get("retainerInvoiceId") as string || null;
    const retainerDeductionAmount = parseFloat(formData.get("retainerDeductionAmount") as string || "0");

    const items = parseItems(formData);
    const total = items.reduce((acc, item) => acc + (item.quantity * item.price * (1 + (item.vat || 0) / 100)), 0);

    await prisma.$transaction(async (tx) => {

        await tx.invoiceItem.deleteMany({
            where: { invoiceId: id }
        });

        await tx.invoice.update({
            where: { id },
            data: {
                clientId,
                quoteId,
                date,
                dueDate,
                notes,
                isRecurring,
                recurringInterval: isRecurring ? recurringInterval : undefined,
                isRetainer,
                retainerPercentage: isRetainer ? retainerPercentage : undefined,
                isBalance,
                retainerInvoiceId: isBalance ? retainerInvoiceId : undefined,
                retainerDeductionAmount: isBalance ? retainerDeductionAmount : undefined,
                total,
                items: {
                    create: items.map((item) => ({
                        title: item.title,
                        description: item.description,
                        quantity: item.quantity,
                        price: item.price,
                        vat: item.vat,
                        total: item.quantity * item.price * (1 + (item.vat || 0) / 100),
                    })),
                }
            }
        });
    });

    revalidatePath("/invoices");
    revalidatePath(`/invoices/${id}`);
}

export async function deleteInvoice(id: string) {
    await prisma.invoice.delete({ where: { id } });
    revalidatePath("/invoices");
}

export async function updateInvoiceStatus(id: string, status: string) {
    const validStatuses = ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"];
    if (!validStatuses.includes(status)) {
        throw new Error("Invalid status");
    }

    await prisma.invoice.update({
        where: { id },
        data: { status }
    });

    revalidatePath("/invoices");
    revalidatePath(`/invoices/${id}`);
}

export async function createInvoiceFromQuote(quoteId: string) {
    const quote = await prisma.quote.findUnique({
        where: { id: quoteId },
        include: { items: true }
    });

    if (!quote) throw new Error("Quote not found");

    try {
        // Generate invoice number securely
        const invoice = await prisma.$transaction(async (tx) => {
            const organization = await tx.organization.findFirst();

            let number = `INV-${Date.now()}`;

            if (organization) {
                const { invoicePrefix, invoiceIncludeYear, invoiceIncludeMonth, invoiceSequence, invoiceDigits } = organization;

                const yearPart = invoiceIncludeYear ? new Date().getFullYear().toString() : "";
                const monthPart = invoiceIncludeMonth ? (new Date().getMonth() + 1).toString().padStart(2, '0') : "";
                const sequencePart = invoiceSequence.toString().padStart(invoiceDigits, '0');

                number = `${invoicePrefix}${yearPart}${monthPart}${sequencePart}`;

                await tx.organization.update({
                    where: { id: organization.id },
                    data: { invoiceSequence: { increment: 1 } }
                });
            }

            return await tx.invoice.create({
                data: {
                    number,
                    clientId: quote.clientId,
                    quoteId: quote.id,
                    date: new Date(),
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
                    notes: quote.notes,
                    total: quote.total,
                    items: {
                        create: quote.items.map(item => ({
                            title: (item as any).title || null,
                            description: item.description,
                            quantity: item.quantity,
                            price: item.price,
                            vat: (item as any).vat || 0,
                            total: item.total
                        }))
                    }
                }
            });
        });

        revalidatePath("/invoices");
        redirect(`/invoices/${invoice.id}`);

    } catch (error: any) {
        if (error.code === 'P2002') {
            return { error: "DUPLICATE_NUMBER" };
        }
        throw error;
    }
}
