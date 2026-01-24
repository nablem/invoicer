
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { clientId, items, isRetainer, isBalance, isRecurring, recurringInterval, notes, date, dueDate } = body;

        // 1. Validation
        if (!clientId) {
            return NextResponse.json({ error: "clientId is required" }, { status: 400 });
        }

        if (isRetainer || isBalance) {
            return NextResponse.json({ error: "Cannot create Retainer or Balance invoices via this endpoint" }, { status: 400 });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "At least one item is required" }, { status: 400 });
        }

        // Validate individual items
        for (const item of items) {
            if (!item.title) {
                return NextResponse.json({ error: "Item title is required" }, { status: 400 });
            }
            if (item.price === undefined || item.price === null) {
                return NextResponse.json({ error: "Item price is required" }, { status: 400 });
            }
        }

        // Validate Client existence
        const client = await prisma.client.findUnique({
            where: { id: clientId }
        });

        if (!client) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }

        // 2. Calculations
        // Note: Logic similar to src/actions/invoices.ts but adapted for JSON input
        const processedItems = items.map((item: any) => ({
            title: item.title,
            description: item.description || "",
            quantity: Number(item.quantity) || 1,
            price: Number(item.price),
            vat: Number(item.vat) || 0,
            total: (Number(item.quantity) || 1) * Number(item.price) * (1 + (Number(item.vat) || 0) / 100)
        }));

        const total = processedItems.reduce((acc: number, item: any) => acc + item.total, 0);

        // 3. Creation Transaction (Duplicating logic from src/actions/invoices.ts)
        const invoice = await prisma.$transaction(async (tx) => {
            const organization = await tx.organization.findFirst();

            let number = `INV-${Date.now()}`; // Fallback
            let currentSequence = 1;

            if (organization) {
                const { invoicePrefix, invoiceIncludePrefix, invoiceIncludeYear, invoiceIncludeMonth, invoiceSequence, invoiceDigits } = organization;

                if (invoiceIncludeYear || invoiceIncludeMonth) {
                    const now = new Date();
                    const startOfPeriod = new Date(now.getFullYear(), organization.invoiceIncludeMonth ? now.getMonth() : 0, 1);
                    const endOfPeriod = new Date(now.getFullYear(), organization.invoiceIncludeMonth ? now.getMonth() + 1 : 12, 0);

                    const invoicesInPeriod = await tx.invoice.count({
                        where: {
                            createdAt: {
                                gte: startOfPeriod,
                                lt: endOfPeriod,
                            },
                        },
                    });

                    if (invoicesInPeriod === 0) {
                        currentSequence = 1;
                    } else {
                        currentSequence = invoiceSequence;
                    }
                } else {
                    currentSequence = invoiceSequence;
                }

                const yearPart = invoiceIncludeYear ? new Date().getFullYear().toString() : "";
                const monthPart = invoiceIncludeMonth ? (new Date().getMonth() + 1).toString().padStart(2, '0') : "";
                const sequencePart = currentSequence.toString().padStart(invoiceDigits, '0');

                number = `${invoiceIncludePrefix ? invoicePrefix : ''}${yearPart}${monthPart}${sequencePart}`;

                await tx.organization.update({
                    where: { id: organization.id },
                    data: { invoiceSequence: currentSequence + 1 },
                });
            }

            // Defaults
            const invoiceDate = date ? new Date(date) : new Date();
            // Default due date: today + 30 days if not provided
            const invoiceDueDate = dueDate ? new Date(dueDate) : new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000);

            return await tx.invoice.create({
                data: {
                    number,
                    clientId,
                    date: invoiceDate,
                    dueDate: invoiceDueDate,
                    notes,
                    total,
                    currency: organization?.currency || "EUR",
                    status: "DRAFT",
                    isRecurring: !!isRecurring,
                    recurringInterval: isRecurring ? recurringInterval : undefined,
                    isRetainer: false,
                    isBalance: false,
                    items: {
                        create: processedItems.map((item: any) => ({
                            title: item.title,
                            description: item.description,
                            quantity: item.quantity,
                            price: item.price,
                            vat: item.vat,
                            total: item.total,
                        })),
                    },
                },
                include: {
                    items: true,
                    client: true
                }
            });
        });

        return NextResponse.json(invoice, { status: 201 });

    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Duplicate Invoice Number Generated. Please try again." }, { status: 409 });
        }
        console.error("API Error creating invoice:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
