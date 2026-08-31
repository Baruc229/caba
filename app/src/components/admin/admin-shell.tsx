"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
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

interface NavGroup {
  label: string;
  items: NavItem[];
}

export const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    label: "Gestion",
    items: [
      { label: "Tableau de bord", href: "", icon: FaChartPie },
      { label: "Réservations", href: "/reservations", icon: FaCalendarCheck },
      { label: "Calendrier", href: "/calendrier", icon: FaCalendarDays },
      { label: "Logements", href: "/logements", icon: FaHouse },
      { label: "Clients", href: "/clients", icon: FaUsers },
      { label: "Tarifs", href: "/tarifs", icon: FaTags },
      { label: "Promotions", href: "/promotions", icon: FaPercent },
      { label: "Caractéristiques", href: "/caracteristiques", icon: FaListCheck },
    ],
  },
  {
    label: "Relation",
    items: [
      { label: "Avis", href: "/avis", icon: FaStar },
      { label: "Paiements", href: "/paiements", icon: FaCreditCard },
      { label: "Messages", href: "/messages", icon: FaEnvelope },
      { label: "WhatsApp", href: "/whatsapp", icon: FaWhatsapp },
    ],
  },
  {
    label: "Contenu",
    items: [
      { label: "Galerie (page d'accueil)", href: "/galerie", icon: FaImages },
      { label: "iCal/Synchronisation", href: "/ical", icon: FaRotate },
      { label: "Pages", href: "/pages", icon: FaFileLines },
      { label: "Blog", href: "/blog", icon: FaPenNib },
    ],
  },
  {
    label: "Administration",
    items: [
      { label: "Rapports", href: "/rapports", icon: FaChartLine },
      { label: "Rôles & Permissions", href: "/roles", icon: FaUserShield },
      { label: "Paramètres", href: "/parametres", icon: FaGear },
    ],
  },
];

export const ADMIN_NAV_ITEMS: NavItem[] = ADMIN_NAV_GROUPS.flatMap((g) => g.items);

function initials(prenom: string, nom: string) {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

export function AdminShell({
  user,
  children,
  notifCount = 0,
}: {
  user: AdminUser;
  children: React.ReactNode;
  notifCount?: number;
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
          <span className="bo-brand-badge" aria-hidden="true">C</span>
          <span className="bo-brand-text">
            <span className="bo-brand-name">Caba Résidence</span>
            <span className="bo-brand-sub">Back-office</span>
          </span>
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
            {ADMIN_NAV_GROUPS.map((group) => (
              <li key={group.label} className="bo-nav-group">
                <span className="bo-nav-group-label">{group.label}</span>
                <ul className="bo-nav" style={{ padding: 0, marginTop: 6, gap: 2 }}>
                  {group.items.map((item) => {
                    const full = `/admin${item.href}`;
                    const isActive =
                      item.href === ""
                        ? pathname === "/admin"
                        : pathname === full || pathname.startsWith(`${full}/`);
                    return (
                      <li key={item.href}>
                        <Link
                          href={full}
                          className={`bo-nav-item${isActive ? " is-active" : ""}`}
                          aria-current={isActive ? "page" : undefined}
                          onClick={closeDrawer}
                        >
                          <item.icon aria-hidden="true" />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
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
            <Link href="/admin/messages" className="bo-icon-btn" aria-label="Notifications">
              <FaBell aria-hidden="true" />
              {notifCount > 0 && <span className="bo-notif-dot" aria-hidden="true" />}
            </Link>
            <span className="bo-topbar-sep" aria-hidden="true" />
            <span className="bo-user-cluster">
              <span className="bo-avatar" aria-hidden="true">
                {initials(user.prenom, user.nom)}
              </span>
              <span className="bo-user-meta">
                <span className="bo-user-name">
                  {user.prenom} {user.nom}
                </span>
                <span className={`bo-role-chip${user.role === "administrateur" ? " bo-role-chip--admin" : ""}`}>
                  {user.role}
                </span>
              </span>
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
