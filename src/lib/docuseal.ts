const DOCUSEAL_URL = process.env.DOCUSEAL_URL || "http://localhost:3002";
const DOCUSEAL_API_KEY = process.env.DOCUSEAL_API_KEY;

export async function createSigningRequest(
    templateHtml: string,
    signers: { email: string; name: string }[]
) {
    if (!DOCUSEAL_API_KEY) {
        console.log("Mocking DocuSeal Request", { signers });
        return { id: "mock-submission-id", slug: "mock-slug" };
    }

    // 1. Create a template from HTML (or use existing)
    // For simplicity in this flow, we might upload a PDF or HTML to create a submission directly if supported,
    // or we assume a structured approach. DocuSeal typically works with Templates.
    // Let's assume we are sending a "submission" based on an existing template or creating one on the fly.
    // NOTE: DocuSeal API specifics vary. A common pattern is creating a submission from a template.
    // If we want to sign arbitrary generated PDFs, we usually upload the PDF to create a formatted submission.

    // Using the "HTML to PDF" feature of DocuSeal or uploading the generated PDF is ideal.

    // For this implementation, we will assume we simulate the request if self-hosted complexity is high without a running instance.
    // But let's write the code for a PDF upload submission.

    // TODO: Implementation depends on specific DocuSeal API version.
    // This is a placeholder for the actual API call.

    return { id: "mock-submission-id", slug: "mock-slug" };
}
