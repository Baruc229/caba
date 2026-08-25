import Link from "next/link";
import { FaFacebookF, FaInstagram, FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import { NewsletterForm } from "./newsletter-form";

const QUICK_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/logements", label: "Chambres" },
  { href: "/a-propos", label: "À propos" },
  { href: "/services", label: "Nos services" },
  { href: "/equipements", label: "Nos équipements" },
  { href: "/blog", label: "Blog" },
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

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border-subtle bg-bg-card">
      {/* Pleine largeur : le fond court sur toute la largeur de l'écran,
          seul le contenu reste aligné au conteneur du site */}
      <div className="mx-auto max-w-[1300px] px-4 py-10 sm:px-6 lg:py-14">
        <section
          aria-label="Informations et newsletter"
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div className="text-center sm:text-left">
            <p className="heading-display text-lg">Caba Résidence</p>
            <p className="mt-3">
              Complexe résidentiel proposant des chambres, studios, suites et villas à
              louer pour tous types de séjours.
            </p>
            <address className="mt-3 not-italic">Cotonou, Bénin</address>
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

          <nav aria-label="Pages légales" className="text-center sm:text-left">
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

          <div className="text-center sm:text-left">
            <h3 className="heading-display text-base">Restons en contact</h3>
            <p className="mt-3">
              Recevez nos meilleures offres et soyez informé de l&apos;arrivée de
              nouveaux logements.
            </p>
            <div className="mt-3">
              <NewsletterForm />
            </div>
          </div>
        </section>
      </div>

      {/* Pied de page : copyright seul, séparé par un trait fin */}
      <div className="border-t border-border-subtle">
        <p className="mx-auto max-w-[1300px] px-4 py-5 text-center text-sm text-text-secondary sm:px-6">
          © {year} Caba Résidence. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
