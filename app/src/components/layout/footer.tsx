import Link from "next/link";
import { FaFacebookF, FaInstagram, FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import { NewsletterForm } from "./newsletter-form";

const QUICK_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/logements", label: "Chambres" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

const LEGAL_LINKS = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/politique-confidentialite", label: "Politique de confidentialité" },
  { href: "/cgv", label: "CGV" },
];

const SOCIALS = [
  { href: "#", label: "Facebook", Icon: FaFacebookF },
  { href: "#", label: "Instagram", Icon: FaInstagram },
  { href: "#", label: "X (Twitter)", Icon: FaXTwitter },
  { href: "#", label: "WhatsApp", Icon: FaWhatsapp },
];

const CARD =
  "rounded-2xl border-[0.5px] border-border-subtle bg-bg-card p-4 shadow-card sm:p-6 lg:p-8";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="px-4 pb-8 pt-4 sm:px-6">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 lg:gap-8">
        <section aria-label="Newsletter">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
            <div className={CARD}>
              <h2 className="heading-display text-2xl">Restons en contact</h2>
              <p className="mt-3">
                Inscrivez-vous pour recevoir nos meilleures offres et être
                informé de l&apos;arrivée de nouveaux logements.
              </p>
            </div>
            <div className={CARD}>
              <NewsletterForm />
            </div>
          </div>
        </section>

        <section aria-label="Informations">
          <div className={CARD}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
              <div>
                <p className="heading-display text-lg">Caba Résidence</p>
                <p className="mt-3">
                  Complexe résidentiel proposant des chambres, studios, suites et
                  villas à louer pour tous types de séjours.
                </p>
                <address className="mt-3 not-italic">
                  Cotonou, Bénin
                </address>
              </div>

              <nav aria-label="Pages rapides">
                <h3 className="heading-display text-base">Navigation</h3>
                <ul className="mt-3 space-y-2">
                  {QUICK_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-text-secondary transition-colors duration-200 hover:text-accent-secondary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <nav aria-label="Pages légales">
                <h3 className="heading-display text-base">Légal</h3>
                <ul className="mt-3 space-y-2">
                  {LEGAL_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-text-secondary transition-colors duration-200 hover:text-accent-secondary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </section>

        <section aria-label="Pied de page">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
            <div className={CARD}>
              <small className="text-xs text-text-secondary">
                © {year} Caba Résidence. Tous droits réservés.
              </small>
            </div>
            <div className={CARD}>
              <div className="flex items-center justify-end gap-4">
                <span className="text-sm font-semibold text-text-primary">
                  Nos réseaux sociaux
                </span>
                <ul className="flex gap-3">
                  {SOCIALS.map(({ href, label, Icon }) => (
                    <li key={label}>
                      <a
                        href={href}
                        aria-label={label}
                        className="text-text-secondary transition-colors duration-200 hover:text-accent"
                      >
                        <Icon aria-hidden="true" size={18} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </footer>
  );
}
