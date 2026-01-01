import { getDictionary } from "@/lib/i18n";
import { getOrganization } from "@/actions/settings";
import SettingsForm from "@/components/SettingsForm";

export default async function SettingsPage() {
    const { dict } = await getDictionary();
    const organization = await getOrganization();

    return (
        <div>
            <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "2rem" }}>
                {dict.settings.title}
            </h1>
            <SettingsForm organization={organization} dict={dict} />
        </div>
    );
}
