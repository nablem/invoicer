"use server";

import { prisma } from "@/lib/prisma";
import { generatePdf } from "@/lib/pdf";
import { sendEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

import fs from "fs/promises";
import path from "path";
import Handlebars from "handlebars";

async function loadEmailTemplate(type: "invoices" | "quotes", templateName: string, data: any) {
    try {
        const filePath = path.join(process.cwd(), "src", "templates", "emails", type, `${templateName}.html`);
        const content = await fs.readFile(filePath, "utf-8");
        const template = Handlebars.compile(content);
        return template(data);
    } catch (error) {
        console.error(`Error loading email template ${type}/${templateName}:`, error);
        return `<p>Please find attached document.</p>`; // Fallback
    }
}

export async function sendQuote(quoteId: string) {
    const quote = await prisma.quote.findUnique({
        where: { id: quoteId },
        include: { client: true, items: true },
    });
    if (!quote) throw new Error("Quote not found");

    const organization = await prisma.organization.findFirst();
    const pdfTemplate = organization?.quoteTemplate || "quote";
    const emailTemplate = organization?.quoteEmailTemplate || "standard";

    // Generate PDF
    const data = {
        ...quote,
        date: new Date(quote.date).toLocaleDateString(),
        dueDate: quote.dueDate ? new Date(quote.dueDate).toLocaleDateString() : null,
        total: quote.total.toFixed(2),
        items: quote.items.map(item => ({ ...item, total: item.total.toFixed(2), price: item.price.toFixed(2) })),
        organization,
    };
    const pdfBuffer = await generatePdf("quote", data, pdfTemplate);

    if (!quote.client.email) {
        throw new Error("Client has no email address");
    }

    // Email Content
    const subject = `Quote ${quote.number} from ${organization?.name || "FreelanceHub"}`;

    const emailData = {
        clientName: quote.client.name,
        quoteNumber: quote.number,
        organizationName: organization?.name || "FreelanceHub",
        ...quote
    };

    const html = await loadEmailTemplate("quotes", emailTemplate, emailData);

    // Send Email
    await sendEmail(
        { email: quote.client.email, name: quote.client.name },
        subject,
        html,
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

    const organization = await prisma.organization.findFirst();
    const pdfTemplate = organization?.invoiceTemplate || "invoice";
    const emailTemplate = organization?.invoiceEmailTemplate || "standard";

    // Generate PDF
    const data = {
        ...invoice,
        date: new Date(invoice.date).toLocaleDateString(),
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : null,
        total: invoice.total.toFixed(2),
        items: invoice.items.map(item => ({ ...item, total: item.total.toFixed(2), price: item.price.toFixed(2) })),
        organization,
    };
    const pdfBuffer = await generatePdf("invoice", data, pdfTemplate);

    if (!invoice.client.email) {
        throw new Error("Client has no email address");
    }

    // Email Content
    const subject = `Invoice ${invoice.number} from ${organization?.name || "FreelanceHub"}`;

    const emailData = {
        clientName: invoice.client.name,
        invoiceNumber: invoice.number,
        organizationName: organization?.name || "FreelanceHub",
        ...invoice
    };

    const html = await loadEmailTemplate("invoices", emailTemplate, emailData);

    // Send Email
    await sendEmail(
        { email: invoice.client.email, name: invoice.client.name },
        subject,
        html,
        { filename: `Invoice-${invoice.number}.pdf`, content: pdfBuffer }
    );

    // Update Status
    await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: "SENT" },
    });

    revalidatePath("/invoices");
}
