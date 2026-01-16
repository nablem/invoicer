import { getDictionary } from "@/lib/i18n";
import { getOrganization } from "@/actions/settings";
import SettingsForm from "@/components/SettingsForm";

import { getAvailableTemplates } from "@/actions/templates";

export default async function SettingsPage() {
    const { dict, lang } = await getDictionary();
    const organization = await getOrganization();

    const templates = {
        invoice: await getAvailableTemplates("invoice"),
        quote: await getAvailableTemplates("quote"),
        emailInvoice: await getAvailableTemplates("email-invoice"),
        emailQuote: await getAvailableTemplates("email-quote"),
    };

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "2rem" }}>
                {dict.settings.title}
            </h1>
            <SettingsForm
                organization={organization}
                dict={dict}
                defaultLanguage={lang}
                availableTemplates={templates}
            />
        </div>
    );
}
