import "server-only";
import { cookies } from "next/headers";
import { fr, en, type Dictionary } from "./dictionaries";

export async function getDictionary(): Promise<{ dict: Dictionary; lang: "fr" | "en" }> {
    try {
        const cookieStore = await cookies();
        const locale = cookieStore.get("NEXT_LOCALE")?.value;

        if (locale === "en") {
            return { dict: en, lang: "en" };
        }
        return { dict: fr, lang: "fr" };
    } catch (error) {
        // Fallback for static generation if needed, though most pages are dynamic
        return { dict: fr, lang: "fr" };
    }
}
