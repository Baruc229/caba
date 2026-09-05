"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaCalendarDays, FaUserGroup, FaBed, FaSliders, FaX } from "react-icons/fa6";
import { SearchBarCompact } from "@/components/search/search-bar-compact";
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

function formatDate(iso: string, lang: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const months = lang === "fr"
    ? ["janv.", "fév.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."]
    : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d} ${months[m - 1]}`;
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

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const guests = initialAdultes + initialEnfants + initialBebes;
  const hasDates = Boolean(initialArrivee && initialDepart);
  const guestsLabel = guests > 1
    ? `${guests} ${t("home.guestAdultesPlural")}`
    : `${guests} ${t("home.guestAdultesSingular")}`;
  const typeLabel = TYPE_SHORT[initialTypeReservation] ?? initialTypeReservation;

  const pills: { label: string; icon: React.ReactNode }[] = [];
  if (hasDates) {
    pills.push({
      label: `${formatDate(initialArrivee, lang)} → ${formatDate(initialDepart, lang)}`,
      icon: <FaCalendarDays aria-hidden="true" size={13} />,
    });
  }
  pills.push({
    label: guestsLabel,
    icon: <FaUserGroup aria-hidden="true" size={13} />,
  });
  if (initialType) {
    const typeEntries: [string, string][] = [
      ["", "allTypes"],
      ["chambre", "typeChambre"],
      ["chambre_avec_salon", "typeChambreAvecSalon"],
      ["studio", "typeStudio"],
      ["appartement_meuble", "typeAppartementMeuble"],
      ["suite", "typeSuite"],
      ["villa", "typeVilla"],
      ["duplex", "typeDuplex"],
      ["maison_entiere", "typeMaisonEntiere"],
    ];
    const typePair = typeEntries.find(([v]) => v === initialType);
    const label = typePair ? t(`home.${typePair[1]}`) : initialType;
    pills.push({ label, icon: <FaBed aria-hidden="true" size={13} /> });
  }
  if (initialTypeReservation && TYPE_SHORT[initialTypeReservation]) {
    pills.push({ label: typeLabel, icon: null as unknown as React.ReactNode });
  }

  const drawerContent = drawerOpen && mounted ? (
    <div className="search-drawer-portal">
      <div
        className="search-drawer-backdrop"
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />
      <div
        className="search-drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label={t("logements.editSearch") ?? "Modifier la recherche"}
      >
        <div className="search-drawer-header">
          <h2 className="search-drawer-title">
            {t("logements.editSearch") ?? "Modifier la recherche"}
          </h2>
          <button
            type="button"
            className="search-drawer-close"
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
