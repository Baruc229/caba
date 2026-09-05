"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { useApp } from "@/components/providers/app-provider";
import { MONTH_NAMES, WEEKDAYS_SHORT } from "@/lib/i18n/dictionaries";
import {
  addMonths,
  daysInMonth,
  leadingBlanks,
  nextSelection,
  rangeRole,
  toISO,
  type MonthRef,
} from "@/lib/calendar-utils";

const LEGEND_KEYS = [
  { statut: "disponible", tKey: "calendar.statutDisponible" },
  { statut: "reserve", tKey: "calendar.statutReserve" },
  { statut: "en_attente", tKey: "calendar.statutEnAttente" },
  { statut: "bloque", tKey: "calendar.statutBloque" },
  { statut: "maintenance", tKey: "calendar.statutMaintenance" },
  { statut: "sel", tKey: "calendar.statutSelection" },
] as const;

interface DayInfo {
  statut: string;
  libelle?: string;
}

interface DoubleMonthCalendarProps {
  propertyId: string;
  arrivee: string;
  depart: string;
  onChange: (arrivee: string, depart: string) => void;
}

export function DoubleMonthCalendar({
  propertyId,
  arrivee,
  depart,
  onChange,
}: DoubleMonthCalendarProps) {
  const { lang, t } = useApp();
  const today = new Date();
  const todayStr = toISO(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const [anchor, setAnchor] = useState<MonthRef>({
    year: today.getFullYear(),
    month: today.getMonth() + 1,
  });
  const [days, setDays] = useState<Record<string, DayInfo>>({});
  const [loadedAnchor, setLoadedAnchor] = useState<MonthRef | null>(null);

  const visible = useMemo(
    () => ({
      first: anchor,
      second: addMonths(anchor, 1),
    }),
    [anchor]
  );

  const loading =
    loadedAnchor === null ||
    loadedAnchor.year !== anchor.year ||
    loadedAnchor.month !== anchor.month;

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const { first, second } = { first: anchor, second: addMonths(anchor, 1) };
    const fetchMonth = (ref: MonthRef, signal: AbortSignal) =>
      fetch(
        `/api/availability?propertyId=${propertyId}&year=${ref.year}&month=${ref.month}`,
        { signal }
      ).then((r) => (r.ok ? r.json() : null));

    Promise.all([
      fetchMonth(first, controller.signal),
      fetchMonth(second, controller.signal),
    ])
      .then(([a, b]) => {
        if (cancelled) return;
        const merged: Record<string, DayInfo> = {};
        for (const payload of [a, b]) {
          if (payload?.days) {
            for (const day of payload.days) {
              merged[day.date] = {
                statut: day.statut,
                libelle: day.libelle ?? "",
              };
            }
          }
        }
        setDays(merged);
        setLoadedAnchor(anchor);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [propertyId, anchor]);

  const canGoPrev =
    anchor.year > today.getFullYear() ||
    (anchor.year === today.getFullYear() && anchor.month > today.getMonth() + 1);

  const changeAnchor = (delta: number) => setAnchor((ref) => addMonths(ref, delta));

  function renderPanel(ref: MonthRef) {
    const blanks = leadingBlanks(ref.year, ref.month);
    const total = daysInMonth(ref.year, ref.month);
    const cells: ReactNode[] = [];

    const handleSelect = (iso: string) => {
      const selection = nextSelection(arrivee, depart, iso);
      onChange(selection.arrivee, selection.depart);
    };

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
        const info = days[iso];
        const statut = info?.statut ?? "disponible";
        const available = statut === "disponible";
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
          <button
            key={iso}
            type="button"
            className={classes.join(" ")}
            disabled={!available || past}
            onClick={() => handleSelect(iso)}
            aria-label={`${iso}${info?.libelle ? ` — ${info.libelle}` : ""}`}
            title={`${iso}${info?.libelle ? ` — ${info.libelle}` : ""}`}
          >
            {d}
          </button>
        );
      }
    }

    return (
      <div className="cal-panel">
        <span className="cal-panel-title" aria-hidden="true">
          {MONTH_NAMES[lang][ref.month - 1]} {ref.year}
        </span>
        <div className="cal-panel-grid">
          {WEEKDAYS_SHORT[lang].map((weekday) => (
            <span key={weekday} className="cal-panel-weekday" aria-hidden="true">
              {weekday}
            </span>
          ))}
          {cells}
        </div>
      </div>
    );
  }

  return (
    <div className="cal-double" role="group" aria-label={t("calendar.availabilityCalendar")}>
      <div className="cal-double-header">
        <button
          type="button"
          className="calendar-nav"
          onClick={() => changeAnchor(-1)}
          disabled={!canGoPrev || loading}
          aria-label={t("calendar.prevMonth")}
        >
          <FaChevronLeft aria-hidden="true" size={12} />
        </button>
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

      <div className="cal-double-grid">
        {renderPanel(visible.first)}
        {renderPanel(visible.second)}
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