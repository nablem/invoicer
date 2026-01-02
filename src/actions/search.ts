"use server";

import { prisma } from "@/lib/prisma";

export async function searchClients(query: string) {
    if (query.length < 2) return [];

    const clients = await prisma.client.findMany({
        where: {
            name: {
                contains: query,
                //   mode: "insensitive", // SQLite doesn't strictly support mode: insensitive for all setups, but let's try or just use contains
            },
        },
        orderBy: { createdAt: "desc" },
        take: 15,
        select: { id: true, name: true }
    });
    return clients;
}

export async function searchQuotes(query: string) {
    if (query.length < 4) return [];

    const quotes = await prisma.quote.findMany({
        where: {
            number: {
                contains: query,
            },
        },
        orderBy: { createdAt: "desc" },
        take: 15,
        select: { id: true, number: true }
    });
    return quotes;
}
