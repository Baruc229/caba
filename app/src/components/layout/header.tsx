"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBars, FaPhone, FaUser, FaXmark } from "react-icons/fa6";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/logements", label: "Logements" },
  { href: "/recherche", label: "Rechercher" },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [lang, setLang] = useState<"fr" | "en">("fr");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen]);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <header
      className={`sticky top-0 z-[1000] border-b bg-bg-primary transition-colors duration-200 ${
        scrolled ? "border-border-subtle" : "border-transparent"
      }`}
    >
      <div className="container-caba relative flex h-[72px] items-center justify-between gap-4">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center text-xl text-text-primary lg:hidden"
          aria-label="Ouvrir le menu"
          onClick={() => setDrawerOpen(true)}
        >
          <FaBars aria-hidden="true" />
        </button>

        <Link
          href="/"
          className="heading-display absolute left-1/2 -translate-x-1/2 text-lg sm:text-xl lg:static lg:translate-x-0 lg:text-2xl"
        >
          Caba Résidence
        </Link>

        <div className="hidden items-center gap-3 lg:flex" data-taborder>
          <div
            className="flex items-center gap-1 text-sm"
            role="group"
            aria-label="Choix de la langue"
          >
            <button
              type="button"
              onClick={() => setLang("fr")}
              aria-pressed={lang === "fr"}
              className={`px-1 py-2 transition-colors ${
                lang === "fr" ? "font-semibold text-text-primary" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              FR
            </button>
            <span className="text-border-subtle" aria-hidden="true">|</span>
            <button
              type="button"
              onClick={() => setLang("en")}
              aria-pressed={lang === "en"}
              className={`px-1 py-2 transition-colors ${
                lang === "en" ? "font-semibold text-text-primary" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              EN
            </button>
          </div>

          <a
            href="tel:+33123456789"
            className="btn-pill border border-border-subtle px-4 py-2 text-sm font-medium text-text-primary hover:border-accent hover:text-accent"
          >
            <FaPhone aria-hidden="true" className="text-accent" />
            +33 1 23 45 67 89
          </a>

          <Link
            href="/inscription"
            className="btn-pill px-3 py-2 text-sm text-text-secondary hover:text-accent"
          >
            <FaUser aria-hidden="true" />
            S&apos;inscrire
          </Link>

          <Link
            href="/connexion"
            className="btn-pill px-3 py-2 text-sm font-medium text-text-secondary hover:text-accent"
          >
            <FaUser aria-hidden="true" />
            Se connecter
          </Link>
        </div>

        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center text-xl text-text-primary lg:hidden"
          aria-label="Ouvrir le menu du compte"
          aria-expanded={accountOpen}
          onClick={() => setAccountOpen((v) => !v)}
        >
          <FaUser aria-hidden="true" />
        </button>

        {accountOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-[1001] cursor-default"
              aria-label="Fermer le menu du compte"
              tabIndex={-1}
              onClick={() => setAccountOpen(false)}
            />
            <div className="absolute right-4 top-[64px] z-[1002] w-48 rounded-xl border border-border-subtle bg-bg-card p-2 shadow-xl lg:hidden">
              <Link
                href="/inscription"
                className="block rounded-lg px-4 py-3 text-sm text-text-secondary hover:bg-bg-primary hover:text-text-primary"
                onClick={() => setAccountOpen(false)}
              >
                S&apos;inscrire
              </Link>
              <Link
                href="/connexion"
                className="block rounded-lg px-4 py-3 text-sm font-medium text-text-secondary hover:bg-bg-primary hover:text-text-primary"
                onClick={() => setAccountOpen(false)}
              >
                Se connecter
              </Link>
            </div>
          </>
        )}
      </div>

      {drawerOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[1001] bg-black/60"
          aria-label="Fermer le menu"
          tabIndex={-1}
          onClick={closeDrawer}
        />
      )}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal"
        className={`fixed inset-y-0 left-0 z-[1002] flex w-80 max-w-[85vw] flex-col bg-bg-card transition-transform duration-300 lg:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[72px] items-center justify-between border-b border-border-subtle px-5">
          <span className="heading-display text-lg">Menu</span>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center text-xl text-text-primary"
            aria-label="Fermer le menu"
            onClick={closeDrawer}
          >
            <FaXmark aria-hidden="true" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-4" aria-label="Navigation principale">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className={`rounded-lg px-4 py-3 text-base ${
                pathname === link.href
                  ? "bg-bg-primary font-semibold text-accent"
                  : "text-text-secondary hover:bg-bg-primary hover:text-text-primary"
              }`}
              onClick={closeDrawer}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-4 border-t border-border-subtle p-5">
          <a
            href="tel:+33123456789"
            className="btn-pill border border-border-subtle px-4 py-3 text-sm font-medium text-text-primary"
          >
            <FaPhone aria-hidden="true" className="text-accent" />
            +33 1 23 45 67 89
          </a>
          <div className="flex gap-4">
            <Link
              href="/inscription"
              className="btn-pill flex-1 border border-border-subtle px-4 py-3 text-sm text-text-primary"
              onClick={closeDrawer}
            >
              S&apos;inscrire
            </Link>
            <Link
              href="/connexion"
              className="btn-pill flex-1 bg-accent px-4 py-3 text-sm font-semibold text-bg-primary hover:bg-accent-hover"
              onClick={closeDrawer}
            >
              Se connecter
            </Link>
          </div>
          <div className="flex items-center gap-2 text-sm" role="group" aria-label="Choix de la langue">
            <button
              type="button"
              onClick={() => setLang("fr")}
              aria-pressed={lang === "fr"}
              className={`px-1 ${
                lang === "fr" ? "font-semibold text-text-primary" : "text-text-secondary"
              }`}
            >
              FR
            </button>
            <span className="text-border-subtle" aria-hidden="true">|</span>
            <button
              type="button"
              onClick={() => setLang("en")}
              aria-pressed={lang === "en"}
              className={`px-1 ${
                lang === "en" ? "font-semibold text-text-primary" : "text-text-secondary"
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </aside>
    </header>
  );
}
