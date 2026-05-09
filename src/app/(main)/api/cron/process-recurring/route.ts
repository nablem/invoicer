import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


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
            const newInvoice = await prisma.$transaction(async (tx) => {
                const organization = await tx.organization.findFirst();

                let newInvoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                let currentSequence = 1;

                if (organization) {
                    const {
                        invoicePrefix,
                        invoiceIncludePrefix,
                        invoiceIncludeYear,
                        invoiceIncludeMonth,
                        invoiceSequence,
                        invoicePeriodStartSequence,
                        invoiceDigits,
                    } = organization;

                    if (invoiceIncludeYear || invoiceIncludeMonth) {
                        const now = new Date();
                        const startOfPeriod = new Date(now.getFullYear(), invoiceIncludeMonth ? now.getMonth() : 0, 1);
                        const endOfPeriod = new Date(now.getFullYear(), invoiceIncludeMonth ? now.getMonth() + 1 : 12, 0);

                        const invoicesInPeriod = await tx.invoice.count({
                            where: {
                                createdAt: {
                                    gte: startOfPeriod,
                                    lt: endOfPeriod,
                                },
                            },
                        });

                        if (invoicesInPeriod === 0) {
                            currentSequence = Math.max(1, invoicePeriodStartSequence || 1);
                        } else {
                            currentSequence = invoiceSequence;
                        }
                    } else {
                        currentSequence = invoiceSequence;
                    }

                    const yearPart = invoiceIncludeYear ? new Date().getFullYear().toString() : "";
                    const monthPart = invoiceIncludeMonth ? (new Date().getMonth() + 1).toString().padStart(2, "0") : "";
                    const sequencePart = currentSequence.toString().padStart(invoiceDigits, "0");

                    newInvoiceNumber = `${invoiceIncludePrefix ? invoicePrefix : ""}${yearPart}${monthPart}${sequencePart}`;

                    await tx.organization.update({
                        where: { id: organization.id },
                        data: { invoiceSequence: currentSequence + 1 },
                    });
                }

                return tx.invoice.create({
                    data: {
                        number: newInvoiceNumber,
                        clientId: invoice.clientId,
                        date: new Date(),
                        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days due
                        status: "DRAFT",
                        total: invoice.total,
                        notes: invoice.notes,
                        currency: organization?.currency || invoice.currency,
                        template: invoice.template,
                        items: {
                            create: invoice.items.map(item => ({
                                title: item.title,
                                description: item.description,
                                quantity: item.quantity,
                                price: item.price,
                                vat: item.vat,
                                total: item.total,
                            }))
                        }
                    }
                });
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
            // (Functionality removed)

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
