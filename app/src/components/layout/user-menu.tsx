"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  FaCalendarDays,
  FaHeart,
  FaUser,
  FaRightFromBracket,
  FaChevronDown,
  FaXmark,
} from "react-icons/fa6";
import { UserAvatar } from "./user-avatar";

interface UserMenuUser {
  prenom: string;
  nom: string;
  email: string;
  avatarUrl?: string | null;
  role: string;
}

const MENU_ITEMS = [
  {
    href: "/compte/reservations",
    label: "Mes réservations",
    icon: FaCalendarDays,
  },
  {
    href: "/compte/favoris",
    label: "Mes favoris",
    icon: FaHeart,
  },
  {
    href: "/compte/profil",
    label: "Gérer mon profil",
    icon: FaUser,
  },
] as const;

export function UserMenu({ user }: { user: UserMenuUser }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  const handleLogout = useCallback(async () => {
    await signOut({ redirect: false });
    window.location.href = "/";
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const idx = itemRefs.current.indexOf(
          document.activeElement as HTMLAnchorElement
        );
        const next = idx < itemRefs.current.length - 1 ? idx + 1 : 0;
        itemRefs.current[next]?.focus();
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const idx = itemRefs.current.indexOf(
          document.activeElement as HTMLAnchorElement
        );
        const prev = idx > 0 ? idx - 1 : itemRefs.current.length - 1;
        itemRefs.current[prev]?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open, close]);

  return (
    <div className="user-menu-container" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        className="user-menu-trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        <UserAvatar
          prenom={user.prenom}
          nom={user.nom}
          avatarUrl={user.avatarUrl}
          size={28}
        />
        <span className="user-menu-trigger-name">{user.prenom}</span>
        <FaChevronDown
          aria-hidden="true"
          className={`user-menu-chevron ${open ? "user-menu-chevron--up" : ""}`}
        />
      </button>

      <div
        ref={menuRef}
        className="user-menu-dropdown"
        data-open={open}
        role="menu"
        aria-label="Menu utilisateur"
      >
        <div className="user-menu-header">
          <UserAvatar
            prenom={user.prenom}
            nom={user.nom}
            avatarUrl={user.avatarUrl}
            size={36}
          />
          <div className="user-menu-header-text">
            <span className="user-menu-header-name">
              {user.prenom} {user.nom}
            </span>
            <span className="user-menu-header-email">{user.email}</span>
          </div>
        </div>

        <div className="user-menu-separator" />

        {MENU_ITEMS.map((item, i) => (
          <Link
            key={item.href}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            href={item.href}
            role="menuitem"
            className="user-menu-option"
            onClick={close}
          >
            <item.icon aria-hidden="true" className="user-menu-option-icon" />
            {item.label}
          </Link>
        ))}

        <div className="user-menu-separator" />

        <button
          type="button"
          role="menuitem"
          className="user-menu-option user-menu-option--danger"
          onClick={handleLogout}
        >
          <FaRightFromBracket
            aria-hidden="true"
            className="user-menu-option-icon"
          />
          Déconnexion
        </button>
      </div>
    </div>
  );
}

export function UserBottomSheet({
  user,
  onClose,
}: {
  user: UserMenuUser;
  onClose: () => void;
}) {
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    onClose();
    await signOut({ redirect: false });
    window.location.href = "/";
  }, [onClose]);

  const handleOptionClick = useCallback(
    (href: string) => {
      onClose();
      router.push(href);
    },
    [onClose, router]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <>
      <button
        type="button"
        className="user-sidesheet-overlay"
        aria-label="Fermer"
        onClick={onClose}
      />
      <div
        className="user-sidesheet"
        role="dialog"
        aria-modal="true"
        aria-label="Menu utilisateur"
      >
        <div className="user-sidesheet-header">
          <span className="heading-display text-lg">Mon compte</span>
          <button
            type="button"
            className="user-sidesheet-close"
            aria-label="Fermer le menu"
            onClick={onClose}
          >
            <FaXmark aria-hidden="true" />
          </button>
        </div>

        <div className="user-menu-header">
          <UserAvatar
            prenom={user.prenom}
            nom={user.nom}
            avatarUrl={user.avatarUrl}
            size={40}
          />
          <div className="user-menu-header-text">
            <span className="user-menu-header-name">
              {user.prenom} {user.nom}
            </span>
            <span className="user-menu-header-email">{user.email}</span>
          </div>
        </div>

        <div className="user-menu-separator" />

        {MENU_ITEMS.map((item) => (
          <button
            key={item.href}
            type="button"
            role="menuitem"
            className="user-menu-option"
            onClick={() => handleOptionClick(item.href)}
          >
            <item.icon aria-hidden="true" className="user-menu-option-icon" />
            {item.label}
          </button>
        ))}

        <div className="user-menu-separator" />

        <button
          type="button"
          role="menuitem"
          className="user-menu-option user-menu-option--danger"
          onClick={handleLogout}
        >
          <FaRightFromBracket
            aria-hidden="true"
            className="user-menu-option-icon"
          />
          Déconnexion
        </button>
      </div>
    </>
  );
}

export function UserMenuMobileTrigger({
  user,
  onClick,
}: {
  user: UserMenuUser;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="user-avatar-trigger-mobile"
      aria-label={`Menu de ${user.prenom} ${user.nom}`}
      onClick={onClick}
    >
      <UserAvatar
        prenom={user.prenom}
        nom={user.nom}
        avatarUrl={user.avatarUrl}
        size={32}
      />
    </button>
  );
}
