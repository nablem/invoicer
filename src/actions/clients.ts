"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createClient(formData: FormData) {
    const name = formData.get("name") as string;
    const email = (formData.get("email") as string) || null;
    const phone = (formData.get("phone") as string) || null;
    const address = (formData.get("address") as string) || null;
    const city = (formData.get("city") as string) || null;
    const zipCode = (formData.get("zipCode") as string) || null;
    const country = (formData.get("country") as string) || null;
    const vatNumber = (formData.get("vatNumber") as string) || null;
    const companyId = (formData.get("companyId") as string) || null;

    await prisma.client.create({
        data: {
            name,
            email,
            phone,
            address,
            city,
            zipCode,
            country,
            vatNumber,
            companyId,
        },
    });

    revalidatePath("/clients");
    redirect("/clients");
}

export async function updateClient(id: string, formData: FormData) {
    const name = formData.get("name") as string;
    const email = (formData.get("email") as string) || null;
    const phone = (formData.get("phone") as string) || null;
    const address = (formData.get("address") as string) || null;
    const city = (formData.get("city") as string) || null;
    const zipCode = (formData.get("zipCode") as string) || null;
    const country = (formData.get("country") as string) || null;
    const vatNumber = (formData.get("vatNumber") as string) || null;
    const companyId = (formData.get("companyId") as string) || null;

    await prisma.client.update({
        where: { id },
        data: {
            name,
            email,
            phone,
            address,
            city,
            zipCode,
            country,
            vatNumber,
            companyId,
        },
    });

    revalidatePath("/clients");
    redirect("/clients");
}

export async function deleteClient(id: string) {
    await prisma.client.delete({
        where: { id },
    });
    revalidatePath("/clients");
}
