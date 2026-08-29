"use client";

import Link from "next/link";
import { FaFacebookF, FaInstagram, FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import { useApp } from "@/components/providers/app-provider";
import { NewsletterForm } from "./newsletter-form";

const QUICK_LINKS = [
  { href: "/", key: "nav.accueil" as const },
  { href: "/logements", key: "nav.chambres" as const },
  { href: "/a-propos", key: "nav.aPropos" as const },
  { href: "/services", key: "footer.nosServices" as const },
  { href: "/equipements", key: "footer.nosEquipements" as const },
  { href: "/blog", key: "footer.blog" as const },
  { href: "/contact", key: "nav.contact" as const },
];

const LEGAL_LINKS = [
  { href: "/mentions-legales", key: "footer.mentionsLegales" as const },
  { href: "/politique-confidentialite", key: "footer.politiqueConfidentialite" as const },
  { href: "/cgv", key: "footer.cgv" as const },
];

const SOCIALS = [
  { href: "#", label: "Facebook", Icon: FaFacebookF },
  { href: "#", label: "Instagram", Icon: FaInstagram },
  { href: "#", label: "X (Twitter)", Icon: FaXTwitter },
  { href: "#", label: "WhatsApp", Icon: FaWhatsapp },
];

export function Footer() {
  const year = new Date().getFullYear();
  const { t } = useApp();

  return (
    <footer className="border-t border-border-subtle bg-bg-card">
      <div className="mx-auto max-w-[1300px] px-4 py-10 sm:px-6 lg:py-14">
        <section
          aria-label="Informations et newsletter"
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div className="text-center sm:text-left">
            <p className="heading-display text-lg">{t("nav.maison")}</p>
            <p className="mt-3">
              {t("footer.description")}
            </p>
            <address className="mt-3 not-italic">{t("footer.address")}</address>
            <ul className="mt-3 flex justify-center gap-3 sm:justify-start">
              {SOCIALS.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    aria-label={label}
                    className="flex size-9 items-center justify-center rounded-[10%] bg-accent-secondary text-on-accent transition-colors duration-200 hover:bg-accent"
                  >
                    <Icon aria-hidden="true" size={18} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Pages rapides" className="text-center sm:text-left">
            <h3 className="heading-display text-base">{t("footer.navigation")}</h3>
            <ul className="mt-3 space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-secondary transition-colors duration-200 hover:text-accent-secondary"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Pages légales" className="text-center sm:text-left">
            <h3 className="heading-display text-base">{t("footer.legal")}</h3>
            <ul className="mt-3 space-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-secondary transition-colors duration-200 hover:text-accent-secondary"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="text-center sm:text-left">
            <h3 className="heading-display text-base">{t("footer.resteEnContact")}</h3>
            <p className="mt-3">
              {t("footer.newsletterDesc")}
            </p>
            <div className="mt-3">
              <NewsletterForm />
            </div>
          </div>
        </section>
      </div>

      <div className="border-t border-border-subtle">
        <p className="mx-auto max-w-[1300px] px-4 py-5 text-center text-sm text-text-secondary sm:px-6">
          © {year} {t("nav.maison")}. {t("footer.tousDroitsReserves")}
        </p>
      </div>
    </footer>
  );
}
