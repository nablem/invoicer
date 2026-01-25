import type { Metadata } from "next";
import { getOrganization } from "@/actions/settings";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
    const organization = await getOrganization();

    // Construct the logo URL with the prefix if it exists
    let iconUrl = "/file.svg"; // Default fallback
    if (organization?.logoUrl) {
        iconUrl = organization.logoUrl.startsWith("http")
            ? organization.logoUrl
            : `${process.env.NEXT_PUBLIC_INVOICER_URL_PREFIX || ""}${organization.logoUrl}`;
    }

    return {
        title: "Invoicer",
        description: "Manage clients, quotes, and bills",
        robots: {
            index: false,
            follow: false,
        },
        icons: {
            icon: iconUrl,
        },
    };
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
