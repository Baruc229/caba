"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaCalendarDays, FaUserGroup, FaBed, FaSliders, FaX } from "react-icons/fa6";
import { SearchBarCompact } from "@/components/search/search-bar-compact";
import { PROPERTY_TYPES } from "@/lib/property-types";
import { useApp } from "@/components/providers/app-provider";

interface SearchSummaryBarProps {
  initialArrivee: string;
  initialDepart: string;
  initialAdultes: number;
  initialEnfants: number;
  initialBebes: number;
  initialType: string;
  initialTypeReservation: string;
  initialHeureArrivee?: string;
  initialHeureDepart?: string;
}

const TYPE_SHORT: Record<string, string> = {
  nuee: "Nuit",
  journee: "Journée",
  semaine: "Semaine",
  mois: "Mois",
};

const MONTHS_FR = ["janv.", "fév.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(iso: string, lang: string): string {
  if (!iso) return "";
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!parts) return iso;
  const m = Number(parts[2]);
  if (m < 1 || m > 12) return iso;
  const months = lang === "en" ? MONTHS_EN : MONTHS_FR;
  return `${Number(parts[3])} ${months[m - 1]}`;
}

interface Pill {
  label: string;
  icon?: React.ReactNode;
}

export function SearchSummaryBar({
  initialArrivee,
  initialDepart,
  initialAdultes,
  initialEnfants,
  initialBebes,
  initialType,
  initialTypeReservation,
  initialHeureArrivee,
  initialHeureDepart,
}: SearchSummaryBarProps) {
  const { t, lang } = useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const scrollYRef = useRef(0);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (drawerOpen) {
      scrollYRef.current = window.scrollY;
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const guests = Math.max(1, initialAdultes) + initialEnfants + initialBebes;
  const hasDates = Boolean(initialArrivee && initialDepart);
  const guestsLabel =
    guests > 1
      ? `${guests} ${t(guests > 1 ? "home.guestAdultesPlural" : "home.guestAdultesSingular")}`
      : `${guests} ${t("home.guestAdultesSingular")}`;
  const typeLabel = TYPE_SHORT[initialTypeReservation] ?? initialTypeReservation;

  const pills: Pill[] = [];
  if (hasDates) {
    pills.push({
      label: `${formatDate(initialArrivee, lang)} → ${formatDate(initialDepart, lang)}`,
      icon: <FaCalendarDays aria-hidden="true" size={13} />,
    });
  }
  pills.push({ label: guestsLabel, icon: <FaUserGroup aria-hidden="true" size={13} /> });
  if (initialType) {
    const pair = PROPERTY_TYPES.find((pt) => pt.value === initialType);
    const label = pair ? t(pair.labelKey) : initialType;
    pills.push({ label, icon: <FaBed aria-hidden="true" size={13} /> });
  }
  if (typeLabel && initialTypeReservation) {
    pills.push({ label: typeLabel });
  }

  const drawerContent =
    drawerOpen && mounted ? (
      <div className="drawer-root">
        <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
        <div
          className="drawer-panel"
          role="dialog"
          aria-modal="true"
          aria-label={t("logements.editSearch") ?? "Modifier la recherche"}
        >
          <div className="drawer-header">
            <h2 className="drawer-title">{t("logements.editSearch") ?? "Modifier la recherche"}</h2>
            <button
              type="button"
              className="drawer-close"
              onClick={() => setDrawerOpen(false)}
              aria-label={t("common.fermer") ?? "Fermer"}
            >
              <FaX aria-hidden="true" size={18} />
            </button>
          </div>
          <SearchBarCompact
            initialArrivee={initialArrivee}
            initialDepart={initialDepart}
            initialAdultes={initialAdultes}
            initialEnfants={initialEnfants}
            initialBebes={initialBebes}
            initialType={initialType}
            initialTypeReservation={initialTypeReservation}
            initialHeureArrivee={initialHeureArrivee}
            initialHeureDepart={initialHeureDepart}
          />
        </div>
      </div>
    ) : null;

  return (
    <>
      <div className="search-summary-bar">
        <div className="search-summary-pills">
          {pills.length === 0 ? (
            <span className="search-summary-placeholder">
              {t("logements.searchPlaceholder") ?? "Rechercher un logement"}
            </span>
          ) : (
            pills.map((pill, i) => (
              <span key={i} className="search-summary-pill">
                {pill.icon}
                {pill.label}
              </span>
            ))
          )}
        </div>
        <button
          type="button"
          className="search-summary-edit-btn"
          onClick={() => setDrawerOpen(true)}
          aria-label={t("logements.editSearch") ?? "Modifier la recherche"}
        >
          <FaSliders aria-hidden="true" size={13} />
          {t("logements.editSearch") ?? "Modifier"}
        </button>
      </div>

      {mounted ? createPortal(drawerContent, document.body) : null}
    </>
  );
}
