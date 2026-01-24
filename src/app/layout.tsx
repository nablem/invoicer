import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Freelance Billing",
    description: "Manage clients, quotes, and bills",
    robots: {
        index: false,
        follow: false,
    },
};

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
