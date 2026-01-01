import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBill } from "@/actions/send";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const today = new Date();

        // Find bills that are recurring and due
        const dueBills = await prisma.bill.findMany({
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

        for (const bill of dueBills) {
            // 1. Create new bill based on the template bill
            const newBillNumber = `B-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            const newBill = await prisma.bill.create({
                data: {
                    number: newBillNumber,
                    clientId: bill.clientId,
                    date: new Date(),
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days due
                    status: "DRAFT",
                    total: bill.total,
                    notes: bill.notes,
                    items: {
                        create: bill.items.map(item => ({
                            description: item.description,
                            quantity: item.quantity,
                            price: item.price,
                            total: item.total,
                        }))
                    }
                }
            });

            // 2. Update next recurring date for the parent bill
            let nextDate = new Date(bill.nextRecurringDate || today);
            switch (bill.recurringInterval) {
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

            await prisma.bill.update({
                where: { id: bill.id },
                data: { nextRecurringDate: nextDate }
            });

            // 3. Optional: Auto-send the new bill
            // await sendBill(newBill.id);

            results.push({
                parentBillId: bill.id,
                newBillId: newBill.id,
                newDate: nextDate
            });
        }

        return NextResponse.json({
            success: true,
            processed: results.length,
            results
        });

    } catch (error) {
        console.error("Recurring bills error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
