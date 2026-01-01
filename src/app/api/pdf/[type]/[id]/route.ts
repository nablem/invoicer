import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePdf } from "@/lib/pdf";

interface Props {
    params: Promise<{
        type: string;
        id: string;
    }>;
}

export async function GET(req: NextRequest, { params }: Props) {
    const { type, id } = await params;

    if (type !== "quote" && type !== "bill") {
        return new NextResponse("Invalid type", { status: 400 });
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
            total: quote.total.toFixed(2),
            items: quote.items.map(item => ({ ...item, total: item.total.toFixed(2), price: item.price.toFixed(2) })),
        };
        filename = `Quote-${quote.number}.pdf`;
    } else {
        const bill = await prisma.bill.findUnique({
            where: { id },
            include: { client: true, items: true },
        });
        if (!bill) return new NextResponse("Bill not found", { status: 404 });

        data = {
            ...bill,
            date: new Date(bill.date).toLocaleDateString(),
            dueDate: bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : null,
            total: bill.total.toFixed(2),
            items: bill.items.map(item => ({ ...item, total: item.total.toFixed(2), price: item.price.toFixed(2) })),
        };
        filename = `Bill-${bill.number}.pdf`;
    }

    try {
        const pdfBuffer = await generatePdf(type, data);

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
