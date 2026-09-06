"use client";

import { useMemo, useState, type ReactNode } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { useApp } from "@/components/providers/app-provider";
import { MONTH_NAMES, WEEKDAYS_SHORT } from "@/lib/i18n/dictionaries";
import {
  addMonths,
  daysInMonth,
  leadingBlanks,
  rangeRole,
  toISO,
  type MonthRef,
} from "@/lib/calendar-utils";
import { useAvailabilityMonth } from "@/hooks/use-availability-month";

const LEGEND_KEYS = [
  { statut: "disponible", tKey: "calendar.statutDisponible" },
  { statut: "reserve", tKey: "calendar.statutReserve" },
  { statut: "en_attente", tKey: "calendar.statutEnAttente" },
  { statut: "bloque", tKey: "calendar.statutBloque" },
  { statut: "maintenance", tKey: "calendar.statutMaintenance" },
  { statut: "sel", tKey: "calendar.statutSelection" },
] as const;

interface DoubleMonthCalendarProps {
  propertyId: string;
  arrivee: string;
  depart: string;
}

/**
 * Calendriers de disponibilité : outil de VISUALISATION pure (vert/bleu/rouge/
 * orange/gris). La sélection des dates se fait via le sélecteur compact de la
 * carte de réservation ; on reflète ici la plage choisie en bleu.
 */
export function DoubleMonthCalendar({
  propertyId,
  arrivee,
  depart,
}: DoubleMonthCalendarProps) {
  const { lang, t } = useApp();
  const today = new Date();
  const todayStr = toISO(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const [anchor, setAnchor] = useState<MonthRef>({
    year: today.getFullYear(),
    month: today.getMonth() + 1,
  });

  const visible = useMemo(
    () => ({
      first: anchor,
      second: addMonths(anchor, 1),
    }),
    [anchor]
  );

  const firstData = useAvailabilityMonth(propertyId, visible.first);
  const secondData = useAvailabilityMonth(propertyId, visible.second);
  const loading = firstData.loading || secondData.loading;

  const canGoPrev =
    anchor.year > today.getFullYear() ||
    (anchor.year === today.getFullYear() && anchor.month > today.getMonth() + 1);

  const changeAnchor = (delta: number) => setAnchor((ref) => addMonths(ref, delta));

  function renderPanel(ref: MonthRef, days: Record<string, { statut: string; libelle?: string }> | null) {
    const blanks = leadingBlanks(ref.year, ref.month);
    const total = daysInMonth(ref.year, ref.month);
    const cells: ReactNode[] = [];

    if (loading) {
      for (let i = 0; i < 35; i++) {
        cells.push(
          <span key={`skeleton-${i}`} className="cal-day cal-day--skeleton" aria-hidden="true" />
        );
      }
    } else {
      for (let i = 0; i < blanks; i++) {
        cells.push(
          <span key={`blank-${i}`} className="cal-day is-empty" aria-hidden="true" />
        );
      }
      for (let d = 1; d <= total; d++) {
        const iso = toISO(ref.year, ref.month, d);
        const info = days?.[iso];
        const statut = info?.statut ?? "disponible";
        const past = iso < todayStr;
        const role = rangeRole(arrivee, depart, iso);

        const classes = [
          "cal-day",
          `cal-day--${statut}`,
          iso === todayStr ? "cal-day--aujourdhui" : null,
          past ? "cal-day--passe" : null,
          role ? `cal-day--sel-${role}` : null,
        ].filter(Boolean);

        cells.push(
          <span
            key={iso}
            className={classes.join(" ")}
            aria-label={`${iso}${info?.libelle ? ` — ${info.libelle}` : ""}`}
            title={`${iso}${info?.libelle ? ` — ${info.libelle}` : ""}`}
          >
            {d}
          </span>
        );
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

  return (
    <div
      className="cal-double cal-visual"
      role="group"
      aria-label={t("calendar.availabilityCalendar")}
    >
      <div className="cal-card">
        <div className="cal-card-header">
          <button
            type="button"
            className="calendar-nav"
            onClick={() => changeAnchor(-1)}
            disabled={!canGoPrev || loading}
            aria-label={t("calendar.prevMonth")}
          >
            <FaChevronLeft aria-hidden="true" size={12} />
          </button>
          <span className="cal-card-title" aria-hidden="true">
            {MONTH_NAMES[lang][visible.first.month - 1]} {visible.first.year}
          </span>
        </div>
        {renderPanel(visible.first, firstData.days)}
      </div>

      <div className="cal-card">
        <div className="cal-card-header">
          <span className="cal-card-title" aria-hidden="true">
            {MONTH_NAMES[lang][visible.second.month - 1]} {visible.second.year}
          </span>
          <button
            type="button"
            className="calendar-nav"
            onClick={() => changeAnchor(1)}
            disabled={loading}
            aria-label={t("calendar.nextMonth")}
          >
            <FaChevronRight aria-hidden="true" size={12} />
          </button>
        </div>
        {renderPanel(visible.second, secondData.days)}
      </div>

      <div className="calendar-legend">
        {LEGEND_KEYS.map((item) => (
          <span key={item.statut} className="legend-item">
            <span className={`legend-dot legend-dot--${item.statut}`} aria-hidden="true" />
            {t(item.tKey)}
          </span>
        ))}
      </div>
    </div>
  );
}