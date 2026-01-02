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

export async function sendInvoice(invoiceId: string) {
    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { client: true, items: true },
    });
    if (!invoice) throw new Error("Invoice not found");

    // Generate PDF
    const data = {
        ...invoice,
        date: new Date(invoice.date).toLocaleDateString(),
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : null,
        total: invoice.total.toFixed(2),
        items: invoice.items.map(item => ({ ...item, total: item.total.toFixed(2), price: item.price.toFixed(2) })),
    };
    const pdfBuffer = await generatePdf("invoice", data);

    if (!invoice.client.email) {
        throw new Error("Client has no email address");
    }

    // Send Email
    await sendEmail(
        { email: invoice.client.email, name: invoice.client.name },
        `Invoice ${invoice.number} from FreelanceHub`,
        `<p>Dear ${invoice.client.name},</p><p>Please find attached invoice ${invoice.number}.</p>`,
        { filename: `Invoice-${invoice.number}.pdf`, content: pdfBuffer }
    );

    // Update Status
    await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: "SENT" },
    });

    revalidatePath("/invoices");
}
