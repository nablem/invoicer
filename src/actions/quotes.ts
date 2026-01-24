"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface QuoteItemInput {
    title?: string;
    description: string;
    quantity: number;
    price: number;
    vat: number;
}

export interface QuoteInput {
    clientId: string;
    date: Date;
    dueDate?: Date;
    items: QuoteItemInput[];
    notes?: string;
}

// Helper to parse items from FormData
function parseItems(formData: FormData): QuoteItemInput[] {
    const items: QuoteItemInput[] = [];
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

export async function createQuote(formData: FormData) {
    const clientId = formData.get("clientId") as string;
    const date = new Date(formData.get("date") as string);
    const dueDateStr = formData.get("dueDate") as string;
    const dueDate = dueDateStr ? new Date(dueDateStr) : undefined;
    const notes = formData.get("notes") as string;
    const template = formData.get("template") as string || undefined;

    const items = parseItems(formData);

    const total = items.reduce((acc, item) => acc + (item.quantity * item.price * (1 + (item.vat || 0) / 100)), 0);

    let quote;
    try {
        quote = await prisma.$transaction(async (tx) => {
            const now = new Date();
            const year = now.getFullYear();
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            const prefix = `D${year}${month}`;

            const lastQuote = await tx.quote.findFirst({
                where: { number: { startsWith: prefix } },
                orderBy: { number: 'desc' },
            });

            let nextSequence = 11;
            if (lastQuote) {
                const lastSequence = parseInt(lastQuote.number.substring(7), 10);
                nextSequence = lastSequence + 1;
            }

            const number = `${prefix}${nextSequence}`;

            const organization = await tx.organization.findFirst();

            return await tx.quote.create({
                data: {
                    number,
                    clientId,
                    date,
                    dueDate,
                    notes,
                    total,
                    currency: organization?.currency || "EUR",
                    template: template,
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
    } catch (error) {
        // Handle potential errors, e.g., unique constraint violation if something goes wrong
        console.error("Failed to create quote:", error);
        // You might want to return an error to the UI
        return { error: "Failed to create quote." };
    }

    revalidatePath("/quotes");
    redirect(`/quotes/${quote.id}`);
}

export async function updateQuote(id: string, formData: FormData) {
    const clientId = formData.get("clientId") as string;
    const date = new Date(formData.get("date") as string);
    const dueDateStr = formData.get("dueDate") as string;
    const dueDate = dueDateStr ? new Date(dueDateStr) : undefined;
    const notes = formData.get("notes") as string;
    const template = formData.get("template") as string || null;

    const items = parseItems(formData);
    const total = items.reduce((acc, item) => acc + (item.quantity * item.price * (1 + (item.vat || 0) / 100)), 0);

    // Transaction to update quote and replace items
    await prisma.$transaction(async (tx) => {
        // Delete existing items
        await tx.quoteItem.deleteMany({
            where: { quoteId: id }
        });

        // Update quote
        await tx.quote.update({
            where: { id },
            data: {
                clientId,
                date,
                dueDate,
                notes,
                template,
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

    revalidatePath("/quotes");
    revalidatePath(`/quotes/${id}`);
}

export async function deleteQuote(id: string) {
    await prisma.quote.delete({ where: { id } });
    revalidatePath("/quotes");
}

export async function updateQuoteStatus(id: string, status: string) {
    const validStatuses = ["DRAFT", "SENT", "ACCEPTED", "REJECTED", "SENT_FOR_SIGNATURE"];
    if (!validStatuses.includes(status)) {
        throw new Error("Invalid status");
    }

    await prisma.quote.update({
        where: { id },
        data: { status }
    });

    revalidatePath("/quotes");
    revalidatePath(`/quotes/${id}`);
}

export async function getQuoteDetails(id: string) {
    const quote = await prisma.quote.findUnique({
        where: { id },
        include: {
            items: true
        }
    });
    return quote;
}

export async function duplicateQuote(id: string) {
    const quote = await prisma.quote.findUnique({
        where: { id },
        include: { items: true }
    });

    if (!quote) {
        throw new Error("Quote not found");
    }

    let newQuote;
    try {
        newQuote = await prisma.$transaction(async (tx) => {
            const now = new Date();
            const year = now.getFullYear();
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            const prefix = `D${year}${month}`;

            const lastQuote = await tx.quote.findFirst({
                where: { number: { startsWith: prefix } },
                orderBy: { number: 'desc' },
            });

            let nextSequence = 11;
            if (lastQuote) {
                const lastSequence = parseInt(lastQuote.number.substring(7), 10);
                nextSequence = isNaN(lastSequence) ? 11 : lastSequence + 1;
            }

            const number = `${prefix}${nextSequence}`;

            // Calculate new Due Date (default 30 days if not set, or keep relative difference? original request said "everything is copied")
            // "everything is copied and a new draft document is created" -> usually implies meaningful dates for the NEW document.
            // Let's set date to NOW, and due date to NOW + (original due date - original date) OR default 30 days.
            // Using standard creation logic is safer: Date = Now, DueDate = Now + 30 days (or whatever the standard is).
            // Let's stick to simple: Date = Now, DueDate = Now + 30 days for now, or copy the timeframe.
            // Actually, usually users want the *content* duplicated.
            const date = new Date();
            const dueDate = new Date(date);
            dueDate.setDate(date.getDate() + 30); // Default 30 days validity for new quote

            return await tx.quote.create({
                data: {
                    number,
                    clientId: quote.clientId,
                    date: date,
                    dueDate: dueDate,
                    notes: quote.notes,
                    total: quote.total,
                    currency: quote.currency,
                    template: quote.template,
                    status: "DRAFT",
                    items: {
                        create: quote.items.map((item) => ({
                            title: item.title,
                            description: item.description,
                            quantity: item.quantity,
                            price: item.price,
                            vat: item.vat,
                            total: item.total,
                        })),
                    },
                },
            });
        });
    } catch (error) {
        console.error("Failed to duplicate quote:", error);
        throw new Error("Failed to duplicate quote.");
    }

    revalidatePath("/quotes");
    redirect(`/quotes/${newQuote.id}`);
}
