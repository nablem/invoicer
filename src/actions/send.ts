"use server";

import { prisma } from "@/lib/prisma";
import { generatePdf } from "@/lib/pdf";
import { sendEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

export async function sendQuote(quoteId: string) {
    const quote = await prisma.quote.findUnique({
        where: { id: quoteId },
        include: { client: true, items: true },
    });
    if (!quote) throw new Error("Quote not found");

    // Generate PDF
    const data = {
        ...quote,
        date: new Date(quote.date).toLocaleDateString(),
        dueDate: quote.dueDate ? new Date(quote.dueDate).toLocaleDateString() : null,
        total: quote.total.toFixed(2),
        items: quote.items.map(item => ({ ...item, total: item.total.toFixed(2), price: item.price.toFixed(2) })),
    };
    const pdfBuffer = await generatePdf("quote", data);

    if (!quote.client.email) {
        throw new Error("Client has no email address");
    }

    // Send Email
    await sendEmail(
        { email: quote.client.email, name: quote.client.name },
        `Quote ${quote.number} from FreelanceHub`,
        `<p>Dear ${quote.client.name},</p><p>Please find attached quote ${quote.number}.</p>`,
        { filename: `Quote-${quote.number}.pdf`, content: pdfBuffer }
    );

    // Update Status
    await prisma.quote.update({
        where: { id: quoteId },
        data: { status: "SENT" },
    });

    revalidatePath("/quotes");
}

export async function sendBill(billId: string) {
    const bill = await prisma.bill.findUnique({
        where: { id: billId },
        include: { client: true, items: true },
    });
    if (!bill) throw new Error("Bill not found");

    // Generate PDF
    const data = {
        ...bill,
        date: new Date(bill.date).toLocaleDateString(),
        dueDate: bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : null,
        total: bill.total.toFixed(2),
        items: bill.items.map(item => ({ ...item, total: item.total.toFixed(2), price: item.price.toFixed(2) })),
    };
    const pdfBuffer = await generatePdf("bill", data);

    if (!bill.client.email) {
        throw new Error("Client has no email address");
    }

    // Send Email
    await sendEmail(
        { email: bill.client.email, name: bill.client.name },
        `Bill ${bill.number} from FreelanceHub`,
        `<p>Dear ${bill.client.name},</p><p>Please find attached bill ${bill.number}.</p>`,
        { filename: `Bill-${bill.number}.pdf`, content: pdfBuffer }
    );

    // Update Status
    await prisma.bill.update({
        where: { id: billId },
        data: { status: "SENT" },
    });

    revalidatePath("/bills");
}
