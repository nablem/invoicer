"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface BillItemInput {
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

export async function createBill(data: BillInput) {
    const total = data.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
    const number = `B-${Date.now()}`;

    await prisma.bill.create({
        data: {
            number,
            clientId: data.clientId,
            date: data.date,
            dueDate: data.dueDate,
            notes: data.notes,
            total,
            isRecurring: data.isRecurring || false,
            recurringInterval: data.recurringInterval,
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

    revalidatePath("/bills");
    redirect("/bills");
}

export async function updateBill(id: string, data: BillInput) {
    const total = data.items.reduce((acc, item) => acc + item.quantity * item.price, 0);

    await prisma.$transaction(async (tx) => {
        await tx.billItem.deleteMany({
            where: { billId: id }
        });

        await tx.bill.update({
            where: { id },
            data: {
                clientId: data.clientId,
                date: data.date,
                dueDate: data.dueDate,
                notes: data.notes,
                isRecurring: data.isRecurring || false,
                recurringInterval: data.recurringInterval,
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
