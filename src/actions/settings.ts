"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function getOrganization() {
    return await prisma.organization.findFirst();
}

export async function updateOrganization(formData: FormData) {
    const name = formData.get("name") as string;
    const companyId = formData.get("companyId") as string;
    const vatNumber = formData.get("vatNumber") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const zipCode = formData.get("zipCode") as string;
    const country = formData.get("country") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const website = formData.get("website") as string;

    // Handle Logo
    const logoFile = formData.get("logo") as File | null;
    let logoUrl: string | undefined;

    if (logoFile && logoFile.size > 0) {
        const buffer = Buffer.from(await logoFile.arrayBuffer());
        const filename = `logo-${Date.now()}.png`; // Force PNG extension as we assume canvas conversion
        const uploadDir = path.join(process.cwd(), "public", "uploads");

        try {
            await mkdir(uploadDir, { recursive: true });
            await writeFile(path.join(uploadDir, filename), buffer);
            logoUrl = `/uploads/${filename}`;
        } catch (error) {
            console.error("Error saving logo:", error);
        }
    }

    // Check if organization exists
    const existing = await prisma.organization.findFirst();

    if (existing) {
        await prisma.organization.update({
            where: { id: existing.id },
            data: {
                name,
                companyId,
                vatNumber,
                address,
                city,
                zipCode,
                country,
                email,
                phone,
                website,
                ...(logoUrl && { logoUrl }),
            }
        });
    } else {
        await prisma.organization.create({
            data: {
                name: name || "My Organization",
                companyId,
                vatNumber,
                address,
                city,
                zipCode,
                country,
                email,
                phone,
                website,
                logoUrl,
            }
        });
    }

    revalidatePath("/settings");
    revalidatePath("/");
    return { success: true };
}

export async function deleteTestData() {
    try {
        // Find seeded clients (pattern: client___@example.com)
        // We use a safer check: email starts with 'client' and ends with '@example.com' 
        // to avoid deleting real clients named "client" if possible, but for dev tool it's acceptable.
        const clients = await prisma.client.findMany({
            where: {
                email: {
                    startsWith: "client",
                    endsWith: "@example.com"
                }
            },
            select: { id: true }
        });

        const clientIds = clients.map(c => c.id);

        if (clientIds.length > 0) {
            // Delete related invoices
            await prisma.invoiceItem.deleteMany({
                where: { invoice: { clientId: { in: clientIds } } }
            });
            await prisma.invoice.deleteMany({
                where: { clientId: { in: clientIds } }
            });

            // Delete related quotes
            await prisma.invoiceItem.deleteMany({
                where: { invoice: { quoteId: { not: null } } } // Cleaning up invoice items linked to quotes? No.
            });
            // Quote items
            await prisma.quoteItem.deleteMany({
                where: { quote: { clientId: { in: clientIds } } }
            });
            await prisma.quote.deleteMany({
                where: { clientId: { in: clientIds } }
            });

            // Delete clients
            await prisma.client.deleteMany({
                where: { id: { in: clientIds } }
            });
        }

        revalidatePath("/");
        return { success: true, count: clientIds.length };
    } catch (error) {
        console.error("Error deleting test data:", error);
        return { success: false, error: String(error) };
    }
}
