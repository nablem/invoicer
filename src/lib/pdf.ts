import fs from "fs/promises";
import path from "path";
import Handlebars from "handlebars";

const GOTENBERG_URL = process.env.GOTENBERG_URL || "http://localhost:3001";

export async function generatePdf(templateName: string, data: any): Promise<Buffer> {
    // 1. Read template
    const templatePath = path.join(process.cwd(), "src", "templates", `${templateName}.html`);
    const templateContent = await fs.readFile(templatePath, "utf-8");

    // 2. Compile template
    const template = Handlebars.compile(templateContent);
    const html = template(data);

    // 3. Send to Gotenberg
    const formData = new FormData();
    // Gotenberg expects 'index.html' for the main file
    const blob = new Blob([html], { type: "text/html" });
    formData.append("files", blob, "index.html");

    // Optional: Add styling options
    formData.append("marginTop", "0");
    formData.append("marginBottom", "0");
    formData.append("marginLeft", "0");
    formData.append("marginRight", "0");

    const response = await fetch(`${GOTENBERG_URL}/forms/chromium/convert/html`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Gotenberg failed: ${response.status} ${text}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}
