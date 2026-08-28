"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { FaBars, FaXmark } from "react-icons/fa6";
import { Segmented } from "@/components/ui/segmented";
import {
  CurrencySwitcher,
} from "./currency-switcher";
import {
  UserMenu,
  UserBottomSheet,
  UserMenuMobileTrigger,
} from "./user-menu";
import {
  MiniLangSwitcher,
  MiniCurrencySwitcher,
} from "./mini-switches";
import { useApp } from "@/components/providers/app-provider";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/logements", label: "Chambres" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

export function Header({
  initialUser = null,
}: {
  initialUser?: {
    prenom: string;
    nom: string;
    email: string | null;
    role: string;
  } | null;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { lang, setLang, currency, setCurrency } = useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  // La session serveur (initialUser) évite d'attendre le fetch client de
  // /api/auth/session ; useSession() prend le relais dès qu'elle est prête.
  const user = session?.user ?? initialUser;
  const isClient = user?.role === "client";

  useEffect(() => {
    document.body.style.overflow = drawerOpen || sheetOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen, sheetOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen]);

  useEffect(() => {
    if (!sheetOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSheetOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sheetOpen]);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const closeSheet = useCallback(() => setSheetOpen(false), []);

  const langSwitch = (
    <Segmented
      ariaLabel="Choix de la langue"
      options={[
        { value: "fr", label: "FR" },
        { value: "en", label: "EN" },
      ]}
      value={lang}
      onChange={setLang}
    />
  );

  return (
    <header className="sticky top-0 z-[1000] border-b border-border-subtle bg-bg-card">
      <div className="mx-auto flex h-[72px] max-w-[1300px] items-center justify-between gap-1 px-3 sm:gap-6 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 lg:gap-6">
          <Link href="/" className="heading-display whitespace-nowrap text-base lg:text-2xl">
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

        {/* ── Desktop right zone ── */}
        <div className="hidden items-center gap-4 lg:flex">
          {isClient && user ? (
            <UserMenu
              user={{
                prenom: user.prenom,
                nom: user.nom,
                email: user.email ?? "",
                avatarUrl: null,
                role: user.role,
              }}
            />
          ) : user ? (
            <Link
              href="/admin"
              className="rounded-full px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-accent-secondary"
            >
              Back-office
            </Link>
          ) : (
            <Link
              href="/connexion"
              className="rounded-full px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-accent-secondary"
            >
              Connexion
            </Link>
          )}
          <Link href="/recherche" className="btn-pill btn-primary px-8">
            Réserver
          </Link>
          {langSwitch}
          <CurrencySwitcher currency={currency} onChange={setCurrency} />
        </div>

        {/* ── Mobile right zone ── */}
        <div className="flex items-center gap-1.5 lg:hidden">
          <MiniLangSwitcher lang={lang} onChange={setLang} />
          <MiniCurrencySwitcher currency={currency} onChange={setCurrency} />
          {isClient && user ? (
            <UserMenuMobileTrigger
              user={{
                prenom: user.prenom,
                nom: user.nom,
                email: user.email ?? "",
                avatarUrl: null,
                role: user.role,
              }}
              onClick={() => setSheetOpen(true)}
            />
          ) : null}
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

      {/* ── Mobile drawer ── */}
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
          <div className="flex w-full items-center justify-center gap-4">
            {langSwitch}
            <CurrencySwitcher currency={currency} onChange={setCurrency} />
          </div>
          {!user ? (
            <Link
              href="/connexion"
              className="btn-pill btn-primary w-full"
              onClick={closeDrawer}
            >
              Connexion
            </Link>
          ) : !isClient ? (
            <Link
              href="/admin"
              className="btn-pill btn-primary w-full"
              onClick={closeDrawer}
            >
              Back-office
            </Link>
          ) : null}
        </div>
      </aside>

      {/* ── Mobile bottom sheet (user account) ── */}
      {sheetOpen && isClient && user && (
        <UserBottomSheet
          user={{
            prenom: user.prenom,
            nom: user.nom,
            email: user.email ?? "",
            avatarUrl: null,
            role: user.role,
          }}
          langSwitch={langSwitch}
          currencySwitch={
            <CurrencySwitcher currency={currency} onChange={setCurrency} />
          }
          onClose={closeSheet}
        />
      )}
    </header>
  );
}
