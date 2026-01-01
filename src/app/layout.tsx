import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { getDictionary } from "@/lib/i18n";
import { getOrganization } from "@/actions/settings";

export async function generateMetadata(): Promise<Metadata> {
  const org = await getOrganization();
  return {
    title: org?.name || "Freelance Billing",
    description: "Manage clients, quotes, and bills",
    icons: org?.logoUrl ? [{ rel: 'icon', url: org.logoUrl }] : undefined
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { dict, lang } = await getDictionary();
  const org = await getOrganization();

  return (
    <html lang="en">
      <body>
        <Navbar dict={dict} lang={lang} organization={org ? { name: org.name, logoUrl: org.logoUrl } : null} />
        <main style={{ padding: "2rem" }}>{children}</main>
      </body>
    </html>
  );
}
