"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBars, FaXmark } from "react-icons/fa6";
import {
  CurrencySwitcher,
  useCurrency,
} from "./currency-switcher";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/logements", label: "Chambres" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const [scrolled, setScrolled] = useState(false);
  const [currency, setCurrency] = useCurrency();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
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

  const langSwitch = (
    <div className="flex items-center gap-1 text-sm" role="group" aria-label="Choix de la langue">
      <button
        type="button"
        onClick={() => setLang("fr")}
        aria-pressed={lang === "fr"}
        className={`px-1 transition-colors ${
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
        className={`px-1 transition-colors ${
          lang === "en" ? "font-semibold text-text-primary" : "text-text-secondary hover:text-text-primary"
        }`}
      >
        EN
      </button>
    </div>
  );

  return (
    <header className="sticky top-0 z-[1000] px-3 pt-3 lg:px-5 lg:pt-5">
      <div
        className={`mx-auto max-w-[1300px] rounded-2xl border-[0.5px] transition-all duration-300 ${
          scrolled
            ? "border-border-subtle bg-bg-card shadow-header"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="flex h-[72px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="heading-display whitespace-nowrap text-xl lg:text-2xl">
            Caba Résidence
          </Link>

          <nav
            aria-label="Navigation principale"
            className="hidden items-center gap-1 rounded-full border border-border-subtle p-2 lg:flex"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-sm transition-colors ${
                  pathname === link.href
                    ? "bg-bg-primary font-semibold text-accent-secondary"
                    : "text-text-secondary hover:bg-bg-primary hover:text-text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          <Link
            href="/connexion"
            className="rounded-full px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-accent-secondary"
          >
            Connexion
          </Link>
          <Link href="/recherche" className="btn-pill btn-primary px-8">
            Réserver
          </Link>
          {langSwitch}
          <CurrencySwitcher currency={currency} onChange={setCurrency} />
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          {langSwitch}
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center text-xl text-text-primary"
            aria-label="Ouvrir le menu"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          >
            <FaBars aria-hidden="true" />
          </button>
        </div>
        </div>
      </div>

      {drawerOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[1001] bg-black/40"
          aria-label="Fermer le menu"
          tabIndex={-1}
          onClick={closeDrawer}
        />
      )}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal"
        className={`fixed inset-y-0 right-0 z-[1002] flex w-80 max-w-[85vw] flex-col bg-bg-card transition-transform duration-300 lg:hidden ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-[72px] items-center justify-between border-b border-border-subtle px-6">
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
                    ? "bg-bg-primary font-semibold text-accent-secondary"
                    : "text-text-secondary hover:bg-bg-primary hover:text-text-primary"
                }`}
              onClick={closeDrawer}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex flex-col items-center gap-4 border-t border-border-subtle p-6">
          <CurrencySwitcher currency={currency} onChange={setCurrency} />
          <Link
            href="/connexion"
            className="btn-pill btn-primary w-full"
            onClick={closeDrawer}
          >
            Connexion
          </Link>
        </div>
      </aside>
    </header>
  );
}
