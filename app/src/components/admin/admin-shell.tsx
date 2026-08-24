"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  FaBars,
  FaBell,
  FaCalendarCheck,
  FaCalendarDays,
  FaChartLine,
  FaChartPie,
  FaCreditCard,
  FaEnvelope,
  FaFileLines,
  FaGear,
  FaHouse,
  FaImages,
  FaListCheck,
  FaPenNib,
  FaPercent,
  FaRightFromBracket,
  FaRotate,
  FaStar,
  FaTags,
  FaUserShield,
  FaUsers,
  FaWhatsapp,
  FaXmark,
} from "react-icons/fa6";
import type { IconType } from "react-icons";

export interface AdminUser {
  prenom: string;
  nom: string;
  role: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: IconType;
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: "Tableau de bord", href: "", icon: FaChartPie },
  { label: "Réservations", href: "/reservations", icon: FaCalendarCheck },
  { label: "Calendrier", href: "/calendrier", icon: FaCalendarDays },
  { label: "Logements", href: "/logements", icon: FaHouse },
  { label: "Clients", href: "/clients", icon: FaUsers },
  { label: "Tarifs", href: "/tarifs", icon: FaTags },
  { label: "Promotions", href: "/promotions", icon: FaPercent },
  { label: "Caractéristiques", href: "/caracteristiques", icon: FaListCheck },
  { label: "Avis", href: "/avis", icon: FaStar },
  { label: "Paiements", href: "/paiements", icon: FaCreditCard },
  { label: "Messages", href: "/messages", icon: FaEnvelope },
  { label: "WhatsApp", href: "/whatsapp", icon: FaWhatsapp },
  { label: "Galerie (page d'accueil)", href: "/galerie", icon: FaImages },
  { label: "iCal/Synchronisation", href: "/ical", icon: FaRotate },
  { label: "Pages", href: "/pages", icon: FaFileLines },
  { label: "Blog", href: "/blog", icon: FaPenNib },
  { label: "Rapports", href: "/rapports", icon: FaChartLine },
  { label: "Rôles & Permissions", href: "/roles", icon: FaUserShield },
  { label: "Paramètres", href: "/parametres", icon: FaGear },
];

function initials(prenom: string, nom: string) {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

export function AdminShell({
  user,
  children,
}: {
  user: AdminUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [drawerOpen, closeDrawer]);

  const currentTitle = useMemo(() => {
    const match = ADMIN_NAV_ITEMS.find((item) => {
      const full = `/admin${item.href}`;
      return item.href === ""
        ? pathname === "/admin"
        : pathname === full || pathname.startsWith(`${full}/`);
    });
    return match?.label ?? "Back-office";
  }, [pathname]);

  return (
    <div className="bo-shell">
      {drawerOpen && (
        <button
          type="button"
          className="bo-backdrop"
          aria-label="Fermer le menu"
          onClick={closeDrawer}
        />
      )}

      <aside className={`bo-sidebar${drawerOpen ? " is-open" : ""}`}>
        <div className="bo-brand">
          <span className="bo-brand-name">Caba Résidence</span>
          <span className="bo-brand-sub">Back-office</span>
          <button
            type="button"
            className="bo-drawer-close"
            aria-label="Fermer le menu"
            onClick={closeDrawer}
          >
            <FaXmark aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Navigation back-office">
          <ul className="bo-nav">
            {ADMIN_NAV_ITEMS.map((item) => {
              const full = `/admin${item.href}`;
              const isActive =
                item.href === ""
                  ? pathname === "/admin"
                  : pathname === full || pathname.startsWith(`${full}/`);
              return (
                <li key={item.href}>
                  <a
                    href={full}
                    className={`bo-nav-item${isActive ? " is-active" : ""}`}
                    aria-current={isActive ? "page" : undefined}
                    onClick={closeDrawer}
                  >
                    <item.icon aria-hidden="true" />
                    <span>{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <div className="bo-main">
        <header className="bo-topbar">
          <div className="bo-topbar-left">
            <button
              type="button"
              className="bo-burger"
              aria-label="Ouvrir le menu"
              onClick={() => setDrawerOpen(true)}
            >
              <FaBars aria-hidden="true" />
            </button>
            <h1 className="bo-topbar-title">{currentTitle}</h1>
          </div>

          <div className="bo-topbar-right">
            <button type="button" className="bo-icon-btn" aria-label="Notifications">
              <FaBell aria-hidden="true" />
            </button>
            <span className="bo-topbar-sep" aria-hidden="true" />
            <span className="bo-avatar" aria-hidden="true">
              {initials(user.prenom, user.nom)}
            </span>
            <span className="bo-user-meta">
              <span className="bo-user-name">
                {user.prenom} {user.nom}
              </span>
              <span className="bo-user-role">{user.role}</span>
            </span>
            <button
              type="button"
              className="bo-icon-btn"
              aria-label="Se déconnecter"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <FaRightFromBracket aria-hidden="true" />
            </button>
          </div>
        </header>

        <main className="bo-content">{children}</main>
      </div>
    </div>
  );
}
