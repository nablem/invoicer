"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface QuoteItemInput {
    description: string;
    quantity: number;
    price: number;
}

export interface QuoteInput {
    clientId: string;
    date: Date;
    dueDate?: Date;
    items: QuoteItemInput[];
    notes?: string;
}

export async function createQuote(data: QuoteInput) {
    const total = data.items.reduce((acc, item) => acc + item.quantity * item.price, 0);

    // Generate a simple quote number (e.g. Q-TIMESTAMP)
    // In a real app, strict sequential numbering is better.
    const number = `Q-${Date.now()}`;

    await prisma.quote.create({
        data: {
            number,
            clientId: data.clientId,
            date: data.date,
            dueDate: data.dueDate,
            notes: data.notes,
            total,
            items: {
                create: data.items.map((item) => ({
                    description: item.description,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.quantity * item.price,
                })),
            },
        },
    });

    revalidatePath("/quotes");
    redirect("/quotes");
}

export async function updateQuote(id: string, data: QuoteInput) {
    const total = data.items.reduce((acc, item) => acc + item.quantity * item.price, 0);

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
                clientId: data.clientId,
                date: data.date,
                dueDate: data.dueDate,
                notes: data.notes,
                total,
                items: {
                    create: data.items.map((item) => ({
                        description: item.description,
                        quantity: item.quantity,
                        price: item.price,
                        total: item.quantity * item.price,
                    })),
                }
            }
        });
    });

    revalidatePath("/quotes");
    redirect("/quotes");
}

export async function deleteQuote(id: string) {
    await prisma.quote.delete({ where: { id } });
    revalidatePath("/quotes");
}
