"use server";

import fs from "fs/promises";
import path from "path";

export async function getAvailableTemplates(type: "invoice" | "quote" | "email-invoice" | "email-quote"): Promise<string[]> {
    let dirPath = "";

    switch (type) {
        case "invoice":
            dirPath = path.join(process.cwd(), "src", "templates", "invoices");
            break;
        case "quote":
            dirPath = path.join(process.cwd(), "src", "templates", "quotes");
            break;
        case "email-invoice":
            dirPath = path.join(process.cwd(), "src", "templates", "emails", "invoices");
            break;
        case "email-quote":
            dirPath = path.join(process.cwd(), "src", "templates", "emails", "quotes");
            break;
    }

    try {
        const files = await fs.readdir(dirPath);
        return files
            .filter(file => file.endsWith(".html"))
            .map(file => file.replace(".html", ""));
    } catch (error) {
        console.error(`Error reading templates for ${type}:`, error);
        return [];
    }
}
