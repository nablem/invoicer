"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function getOrganization() {
    return await prisma.organization.findFirst();
}

export async function updateOrganization(formData: FormData) {
    const name = formData.get("name") as string;
    const companyId = formData.get("companyId") as string;
    const vatNumber = formData.get("vatNumber") as string;
    const defaultVat = parseFloat(formData.get("defaultVat") as string) || 0;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const zipCode = formData.get("zipCode") as string;
    const country = formData.get("country") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const website = formData.get("website") as string;
    const language = formData.get("language") as string;
    const currency = formData.get("currency") as string;
    const decimalSeparator = formData.get("decimalSeparator") as string;


    // Handle Logo
    const logoFile = formData.get("logo") as File | null;
    let logoUrl: string | undefined;

    if (logoFile && logoFile.size > 0) {
        const buffer = Buffer.from(await logoFile.arrayBuffer());
        const filename = `logo-${Date.now()}.png`; // Force PNG extension as we assume canvas conversion
        const uploadDir = path.join(process.cwd(), "public", "uploads");

        // Ensure upload directory exists
        await mkdir(uploadDir, { recursive: true });

        // Write file
        await writeFile(path.join(uploadDir, filename), buffer);
        logoUrl = `/uploads/${filename}`;

        // Removed try-catch to allow error to bubble up if write fails
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
                defaultVat,
                address,
                city,
                zipCode,
                country,
                email,
                phone,
                website,
                language,
                currency,
                decimalSeparator,
                bankName: formData.get("bankName") as string,
                bankBeneficiary: formData.get("bankBeneficiary") as string,
                iban: formData.get("iban") as string,
                bic: formData.get("bic") as string,
                ...(logoUrl && { logoUrl }),
                invoicePrefix: formData.get("invoicePrefix") as string,
                invoiceIncludePrefix: formData.get("invoiceIncludePrefix") === "on",
                invoiceIncludeYear: formData.get("invoiceIncludeYear") === "on",
                invoiceIncludeMonth: formData.get("invoiceIncludeMonth") === "on",
                invoiceSequence: parseInt(formData.get("invoiceSequence") as string) || 1,
                invoiceDigits: parseInt(formData.get("invoiceDigits") as string) || 0,
                // Template Settings
                invoiceTemplate: formData.get("invoiceTemplate") as string,
                quoteTemplate: formData.get("quoteTemplate") as string,

            }
        });
    } else {
        await prisma.organization.create({
            data: {
                name: name || "My Organization",
                companyId,
                vatNumber,
                defaultVat,
                address,
                city,
                zipCode,
                country,
                email,
                phone,
                website,
                language: language || "en",
                currency: currency || "EUR",
                decimalSeparator: decimalSeparator || ",",
                bankName: formData.get("bankName") as string,
                bankBeneficiary: formData.get("bankBeneficiary") as string,
                iban: formData.get("iban") as string,
                bic: formData.get("bic") as string,
                logoUrl,
                invoicePrefix: formData.get("invoicePrefix") as string,
                invoiceIncludePrefix: formData.get("invoiceIncludePrefix") === "on",
                invoiceIncludeYear: formData.get("invoiceIncludeYear") === "on",
                invoiceIncludeMonth: formData.get("invoiceIncludeMonth") === "on",
                invoiceSequence: parseInt(formData.get("invoiceSequence") as string) || 1,
                invoiceDigits: parseInt(formData.get("invoiceDigits") as string) || 0,
                // Template Settings
                invoiceTemplate: (formData.get("invoiceTemplate") as string) || "invoice",
                quoteTemplate: (formData.get("quoteTemplate") as string) || "quote",

            }
        });
    }

    if (language) {
        (await cookies()).set("NEXT_LOCALE", language, { path: "/", maxAge: 60 * 60 * 24 * 365 });
    }

    revalidatePath("/settings");
    revalidatePath("/");
    return { success: true };
}


