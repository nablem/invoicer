import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePdf } from "@/lib/pdf";

interface Props {
    params: Promise<{
        type: string;
        id: string;
    }>;
}

// Helper to format currency with configurable separator
function formatCurrency(amount: number, decimalSeparator: string = ','): string {
    const isCommaDecimal = decimalSeparator === ',';
    const thousandSeparator = isCommaDecimal ? ' ' : ',';
    const decimal = isCommaDecimal ? ',' : '.';

    return amount.toFixed(2).replace('.', decimal).replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
}

export async function GET(req: NextRequest, { params }: Props) {
    const { type, id } = await params;

    if (type !== "quote" && type !== "invoice") {
        return new NextResponse("Invalid type", { status: 400 });
    }

    // Default separator
    let decimalSeparator = ",";
    const organization = await prisma.organization.findFirst();
    if (organization?.decimalSeparator) {
        decimalSeparator = organization.decimalSeparator;
    }

    let data;
    let filename;

    if (type === "quote") {
        const quote = await prisma.quote.findUnique({
            where: { id },
            include: { client: true, items: true },
        });
        if (!quote) return new NextResponse("Quote not found", { status: 404 });

        // Format dates
        data = {
            ...quote,
            date: new Date(quote.date).toLocaleDateString(),
            dueDate: quote.dueDate ? new Date(quote.dueDate).toLocaleDateString() : null,
            total: formatCurrency(quote.total, decimalSeparator),
            items: quote.items.map(item => ({
                ...item,
                total: formatCurrency(item.total, decimalSeparator),
                price: formatCurrency(item.price, decimalSeparator)
            })),
            organization,
        };
        filename = `${quote.number}.pdf`;
    } else {
        const invoice = await prisma.invoice.findUnique({
            where: { id },
            include: {
                client: true,
                items: true,
                quote: true,
                retainerInvoice: true
            },
        });
        if (!invoice) return new NextResponse("Invoice not found", { status: 404 });

        data = {
            ...invoice,
            date: new Date(invoice.date).toLocaleDateString(),
            dueDate: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : null,
            total: formatCurrency(
                invoice.isBalance && invoice.retainerDeductionAmount
                    ? (invoice.total - invoice.retainerDeductionAmount)
                    : invoice.total,
                decimalSeparator
            ),
            items: invoice.items.map(item => ({
                ...item,
                total: formatCurrency(item.total, decimalSeparator),
                price: formatCurrency(item.price, decimalSeparator)
            })),
            retainerDeductionAmount: invoice.retainerDeductionAmount
                ? formatCurrency(invoice.retainerDeductionAmount, decimalSeparator)
                : undefined,
            organization,
        };
        filename = `${invoice.number}.pdf`;
    }

    try {
        let pdfBuffer: Buffer;
        if (type === "quote") {
            const template = organization?.quoteTemplate || "quote";
            pdfBuffer = await generatePdf("quote", data, template);
        } else {
            const template = organization?.invoiceTemplate || "invoice";
            pdfBuffer = await generatePdf("invoice", data, template);
        }

        return new NextResponse(pdfBuffer as any, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error(error);
        return new NextResponse("PDF Generation Failed", { status: 500 });
    }
}
