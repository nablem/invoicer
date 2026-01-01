"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface BillItemInput {
    title?: string;
    description: string;
    quantity: number;
    price: number;
}

export interface BillInput {
    clientId: string;
    date: Date;
    dueDate?: Date;
    items: BillItemInput[];
    notes?: string;
    isRecurring?: boolean;
    recurringInterval?: string;
}

// Helper to parse items from FormData
function parseItems(formData: FormData): BillItemInput[] {
    const items: BillItemInput[] = [];
    const entries = Array.from(formData.entries());

    // Find all indices
    const indices = new Set<number>();
    for (const [key] of entries) {
        if (key.startsWith("description_")) {
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

        if (description) {
            items.push({ title, description, quantity, price });
        }
    }

    return items;
}

export async function createBill(formData: FormData) {
    const clientId = formData.get("clientId") as string;
    const date = new Date(formData.get("date") as string);
    const dueDateStr = formData.get("dueDate") as string;
    const dueDate = dueDateStr ? new Date(dueDateStr) : undefined;
    const notes = formData.get("notes") as string;
    const isRecurring = formData.get("isRecurring") === "on";
    const recurringInterval = formData.get("recurringInterval") as string;

    const items = parseItems(formData);
    const total = items.reduce((acc, item) => acc + item.quantity * item.price, 0);

    const number = `B-${Date.now()}`;

    await prisma.bill.create({
        data: {
            number,
            clientId,
            date,
            dueDate,
            notes,
            total,
            isRecurring,
            recurringInterval: isRecurring ? recurringInterval : undefined,
            items: {
                create: items.map((item) => ({
                    title: item.title,
                    description: item.description,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.quantity * item.price,
                })),
            },
        },
    });

    revalidatePath("/bills");
    redirect("/bills");
}

export async function updateBill(id: string, formData: FormData) {
    const clientId = formData.get("clientId") as string;
    const date = new Date(formData.get("date") as string);
    const dueDateStr = formData.get("dueDate") as string;
    const dueDate = dueDateStr ? new Date(dueDateStr) : undefined;
    const notes = formData.get("notes") as string;
    const isRecurring = formData.get("isRecurring") === "on";
    const recurringInterval = formData.get("recurringInterval") as string;

    const items = parseItems(formData);
    const total = items.reduce((acc, item) => acc + item.quantity * item.price, 0);

    await prisma.$transaction(async (tx) => {
        await tx.billItem.deleteMany({
            where: { billId: id }
        });

        await tx.bill.update({
            where: { id },
            data: {
                clientId,
                date,
                dueDate,
                notes,
                isRecurring,
                recurringInterval: isRecurring ? recurringInterval : undefined,
                total,
                items: {
                    create: items.map((item) => ({
                        title: item.title,
                        description: item.description,
                        quantity: item.quantity,
                        price: item.price,
                        total: item.quantity * item.price,
                    })),
                }
            }
        });
    });

    revalidatePath("/bills");
    redirect("/bills");
}

export async function deleteBill(id: string) {
    await prisma.bill.delete({ where: { id } });
    revalidatePath("/bills");
}

export async function createBillFromQuote(quoteId: string) {
    const quote = await prisma.quote.findUnique({
        where: { id: quoteId },
        include: { items: true }
    });

    if (!quote) throw new Error("Quote not found");

    const number = `B-${Date.now()}`; // Generate bill number

    await prisma.bill.create({
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
                    total: item.total
                }))
            }
        }
    });

    revalidatePath("/bills");
    redirect("/bills");
}
