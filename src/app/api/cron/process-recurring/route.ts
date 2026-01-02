import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendInvoice } from "@/actions/send";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const today = new Date();

        // Find invoices that are recurring and due
        const dueInvoices = await prisma.invoice.findMany({
            where: {
                isRecurring: true,
                nextRecurringDate: {
                    lte: today,
                },
            },
            include: {
                items: true,
            },
        });

        const results = [];

        for (const invoice of dueInvoices) {
            // 1. Create new invoice based on the template invoice
            const newInvoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            const newInvoice = await prisma.invoice.create({
                data: {
                    number: newInvoiceNumber,
                    clientId: invoice.clientId,
                    date: new Date(),
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days due
                    status: "DRAFT",
                    total: invoice.total,
                    notes: invoice.notes,
                    items: {
                        create: invoice.items.map(item => ({
                            description: item.description,
                            quantity: item.quantity,
                            price: item.price,
                            total: item.total,
                        }))
                    }
                }
            });

            // 2. Update next recurring date for the parent invoice
            let nextDate = new Date(invoice.nextRecurringDate || today);
            switch (invoice.recurringInterval) {
                case "WEEKLY":
                    nextDate.setDate(nextDate.getDate() + 7);
                    break;
                case "MONTHLY":
                    nextDate.setMonth(nextDate.getMonth() + 1);
                    break;
                case "QUARTERLY":
                    nextDate.setMonth(nextDate.getMonth() + 3);
                    break;
                case "YEARLY":
                    nextDate.setFullYear(nextDate.getFullYear() + 1);
                    break;
                default:
                    nextDate.setMonth(nextDate.getMonth() + 1); // Default monthly
            }

            await prisma.invoice.update({
                where: { id: invoice.id },
                data: { nextRecurringDate: nextDate }
            });

            // 3. Optional: Auto-send the new invoice
            // await sendInvoice(newInvoice.id);

            results.push({
                parentInvoiceId: invoice.id,
                newInvoiceId: newInvoice.id,
                newDate: nextDate
            });
        }

        return NextResponse.json({
            success: true,
            processed: results.length,
            results
        });

    } catch (error) {
        console.error("Recurring invoices error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
