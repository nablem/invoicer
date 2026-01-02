import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const count = parseInt(searchParams.get("count") || "10");

    const getRandomDate = (start: Date, end: Date) => {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }

    try {
        const clients = [];
        for (let i = 0; i < count; i++) {
            const creationDate = getRandomDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date());
            const client = await prisma.client.create({
                data: {
                    name: `Client ${Math.floor(Math.random() * 10000)}`,
                    email: `client${Math.floor(Math.random() * 10000)}@example.com`,
                    createdAt: creationDate,
                }
            });
            clients.push(client);
        }

        for (const client of clients) {
            const creationDate = getRandomDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date());

            // Create Quote
            await prisma.quote.create({
                data: {
                    number: `Q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    clientId: client.id,
                    date: creationDate,
                    dueDate: new Date(creationDate.getTime() + 90 * 24 * 60 * 60 * 1000),
                    status: "DRAFT",
                    total: 1000,
                    items: {
                        create: [{
                            title: "Seeded Service",
                            description: "Auto-generated seed item",
                            quantity: 1,
                            price: 1000,
                            total: 1000
                        }]
                    },
                    createdAt: creationDate
                }
            });

            // Create Invoice
            await prisma.invoice.create({
                data: {
                    number: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    clientId: client.id,
                    date: creationDate,
                    dueDate: new Date(creationDate.getTime() + 30 * 24 * 60 * 60 * 1000),
                    status: "DRAFT",
                    total: 1500,
                    items: {
                        create: [{
                            title: "Seeded Project",
                            description: "Auto-generated seed invoice item",
                            quantity: 1,
                            price: 1500,
                            total: 1500
                        }]
                    },
                    createdAt: creationDate
                }
            });
        }

        return NextResponse.json({ success: true, count });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
