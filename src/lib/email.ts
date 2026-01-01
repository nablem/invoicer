import { type Quote, type Bill, type Client } from "@prisma/client";

const BREVO_API_KEY = process.env.BREVO_API_KEY;

export async function sendEmail(
    to: { email: string; name: string },
    subject: string,
    content: string,
    attachment?: { filename: string; content: Buffer }
) {
    if (!BREVO_API_KEY) {
        console.log("Mock Sending Email:", { to, subject, attachment: attachment?.filename });
        return;
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "api-key": BREVO_API_KEY,
            "Content-Type": "application/json",
            "accept": "application/json",
        },
        body: JSON.stringify({
            sender: { name: "Freelance Hub", email: "billing@freelancehub.local" }, // Change this to verified sender
            to: [{ email: to.email, name: to.name }],
            subject,
            htmlContent: content,
            attachment: attachment ? [{
                name: attachment.filename,
                content: attachment.content.toString("base64"),
            }] : undefined,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Brevo Error: ${error}`);
    }
}
