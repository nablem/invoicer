"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";
import LanguageSwitcher from "./LanguageSwitcher";
import { Dictionary } from "@/lib/dictionaries";

export default function Navbar({ dict, lang, organization }: { dict: Dictionary; lang: "fr" | "en"; organization: { name: string | null; logoUrl: string | null } | null }) {
  const pathname = usePathname();

  const links = [
    { href: "/", label: dict.common.dashboard },
    { href: "/clients", label: dict.common.clients },
    { href: "/quotes", label: dict.common.quotes },
    { href: "/invoices", label: dict.common.invoices },
    { href: "/settings", label: dict.settings.title },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.logo} style={{ display: 'flex', alignItems: 'center' }}>
        {organization?.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={organization.logoUrl}
            alt="Organization Logo"
            style={{ height: '32px', width: 'auto', marginRight: '0.75rem', borderRadius: '4px' }}
          />
        )}
        {organization?.name || "FreelanceHub"}
      </div>
      <nav className={styles.nav}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.link} ${pathname === link.href ? styles.active : ""
              }`}
          >
            {link.label}
          </Link>
        ))}
        <LanguageSwitcher currentLang={lang} />
      </nav>
    </header>
  );
}
