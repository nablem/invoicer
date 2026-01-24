import Navbar from "@/components/Navbar";
import { getDictionary } from "@/lib/i18n";
import { getOrganization } from "@/actions/settings";


// Metadata is handled in root layout effectively, but we can override title here if we want dynamic title based on org
// The generateMetadata was previously here. We can keep it to set the title dynamically.

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { dict, lang } = await getDictionary();
  const org = await getOrganization();

  return (
    <>
      <Navbar dict={dict} lang={lang} organization={org ? { name: org.name, logoUrl: org.logoUrl } : null} />
      <main style={{ padding: "2rem" }}>{children}</main>
    </>
  );
}
