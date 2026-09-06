"use client";

import type { ReactNode } from "react";
import { useApp } from "@/components/providers/app-provider";
import {
  daysInMonth,
  leadingBlanks,
  rangeRole,
  toISO,
  type MonthRef,
} from "@/lib/calendar-utils";
import { WEEKDAYS_SHORT } from "@/lib/i18n/dictionaries";
import type { AvailabilityDayInfo } from "@/hooks/use-availability-month";

interface AvailabilityMonthGridProps {
  month: MonthRef;
  todayStr: string;
  days: Record<string, AvailabilityDayInfo> | null;
  loading: boolean;
  arrivee: string;
  depart: string;
  /** Fourni → jours cliquables (sélecteur compact) ; absent → visualisation pure. */
  onSelect?: (iso: string) => void;
}

/**
 * Grille d'un mois de disponibilité (statuts vert/bleu/rouge/orange/gris,
 * sélection en bleu). Composant partagé entre les calendriers de disponibilité
 * (visualisation) et le sélecteur compact de la carte de réservation.
 */
export function AvailabilityMonthGrid({
  month,
  todayStr,
  days,
  loading,
  arrivee,
  depart,
  onSelect,
}: AvailabilityMonthGridProps) {
  const { lang } = useApp();

  const blanks = leadingBlanks(month.year, month.month);
  const total = daysInMonth(month.year, month.month);
  const cells: ReactNode[] = [];

  if (loading) {
    for (let i = 0; i < 35; i++) {
      cells.push(
        <span
          key={`skeleton-${i}`}
          className="cal-day cal-day--skeleton"
          aria-hidden="true"
        />
      );
    }
  } else {
    for (let i = 0; i < blanks; i++) {
      cells.push(
        <span key={`blank-${i}`} className="cal-day is-empty" aria-hidden="true" />
      );
    }

    for (let d = 1; d <= total; d++) {
      const iso = toISO(month.year, month.month, d);
      const info = days?.[iso];
      const statut = info?.statut ?? "disponible";
      const past = iso < todayStr;
      const role = rangeRole(arrivee, depart, iso);
      const label = `${iso}${info?.libelle ? ` — ${info.libelle}` : ""}`;

      const classes = [
        "cal-day",
        `cal-day--${statut}`,
        iso === todayStr ? "cal-day--aujourdhui" : null,
        past ? "cal-day--passe" : null,
        role ? `cal-day--sel-${role}` : null,
      ]
        .filter(Boolean)
        .join(" ");

      if (onSelect) {
        const available = statut === "disponible";
        cells.push(
          <button
            key={iso}
            type="button"
            className={classes}
            disabled={!available || past}
            onClick={() => onSelect(iso)}
            aria-label={label}
            title={info?.libelle ? label : undefined}
          >
            {d}
          </button>
        );
      } else {
        cells.push(
          <span key={iso} className={classes} aria-label={label} title={info?.libelle ? label : undefined}>
            {d}
          </span>
        );
      }
    }
  }

  return (
    <div className="cal-panel-grid">
      {WEEKDAYS_SHORT[lang].map((weekday) => (
        <span key={weekday} className="cal-panel-weekday" aria-hidden="true">
          {weekday}
        </span>
      ))}
      {cells}
    </div>
  );
}