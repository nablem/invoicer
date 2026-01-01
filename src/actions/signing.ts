"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function sendForSigning(quoteId: string) {
    const quote = await prisma.quote.findUnique({
        where: { id: quoteId },
        include: { client: true }
    });

    if (!quote) throw new Error("Quote not found");

    // In a real implementation:
    // 1. Generate PDF
    // 2. Upload to DocuSeal / Create Submission
    // 3. Get Signing URL or trigger email via DocuSeal
    // 4. Save external ID to database

    // Mock implementation for now
    console.log(`Sending Quote ${quote.number} for signing to ${quote.client.email}`);

    await prisma.quote.update({
        where: { id: quoteId },
        data: { status: "SENT_FOR_SIGNATURE" } // We might need to add this status to schema if we want strict typing or just use string
    });

    revalidatePath("/quotes");
}
