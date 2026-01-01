"use client";

import { setLanguage } from "@/actions/language";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function LanguageSwitcher({ currentLang }: { currentLang: "fr" | "en" }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const toggleLanguage = () => {
        const newLang = currentLang === "fr" ? "en" : "fr";
        startTransition(async () => {
            await setLanguage(newLang);
            router.refresh();
        });
    };

    return (
        <button
            onClick={toggleLanguage}
            disabled={isPending}
            style={{
                padding: "0.25rem 0.5rem",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                fontSize: "0.85rem",
                fontWeight: 500,
                opacity: isPending ? 0.7 : 1,
                marginLeft: "auto"
            }}
        >
            {currentLang === "fr" ? "FR" : "EN"} | {currentLang === "fr" ? "EN" : "FR"}
        </button>
    );
}
