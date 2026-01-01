"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createClient(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const billingAddress = formData.get("billingAddress") as string;
    const vatNumber = formData.get("vatNumber") as string;

    await prisma.client.create({
        data: {
            name,
            email,
            phone,
            billingAddress,
            vatNumber,
        },
    });

    revalidatePath("/clients");
    redirect("/clients");
}

export async function updateClient(id: string, formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const billingAddress = formData.get("billingAddress") as string;
    const vatNumber = formData.get("vatNumber") as string;

    await prisma.client.update({
        where: { id },
        data: {
            name,
            email,
            phone,
            billingAddress,
            vatNumber,
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
