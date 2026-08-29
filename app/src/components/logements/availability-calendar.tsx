"use client";

import { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { useApp } from "@/components/providers/app-provider";
import { MONTH_NAMES, WEEKDAYS_SHORT } from "@/lib/i18n/dictionaries";

interface CalendarSlot {
  debut: string;
  fin: string;
  statut: "reserve" | "bloque" | "maintenance";
  source: string;
}

interface CalendarDay {
  date: string;
  statut: "disponible" | "reserve" | "bloque" | "maintenance" | "en_attente";
  creneaux: CalendarSlot[];
  libelle: string;
}

const LEGEND_KEYS = [
  { statut: "disponible", tKey: "calendar.statutDisponible" },
  { statut: "reserve", tKey: "calendar.statutReserve" },
  { statut: "en_attente", tKey: "calendar.statutEnAttente" },
  { statut: "bloque", tKey: "calendar.statutBloque" },
  { statut: "maintenance", tKey: "calendar.statutMaintenance" },
] as const;

function buildTooltip(day: CalendarDay, t: (path: string) => string): string {
  const base = `${day.date} — ${day.libelle}`;
  if (day.creneaux.length === 0) return base;
  const slots = day.creneaux
    .map((c) => {
      const source =
        c.source === "ical"
          ? t("calendar.tooltipSourceIcal")
          : c.source === "maintenance"
            ? t("calendar.tooltipSourceMaintenance")
            : c.source === "whatsapp"
              ? t("calendar.tooltipSourceWhatsapp")
              : c.source === "booking"
                ? t("calendar.tooltipSourceBooking")
                : t("calendar.tooltipSourceAdministration");
      return `${c.debut}–${c.fin} (${source})`;
    })
    .join(", ");
  return `${base} · ${slots}`;
}

function leadingBlanks(year: number, month: number): number {
  const jsDay = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  return (jsDay + 6) % 7;
}

export function AvailabilityCalendar({ propertyId }: { propertyId: string }) {
  const { lang, t } = useApp();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);

  const todayStr = now.toISOString().slice(0, 10);
  const minPeriod = year * 12 + month <= now.getFullYear() * 12 + now.getMonth() + 1;

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    fetch(`/api/availability?propertyId=${propertyId}&year=${year}&month=${month}`, {
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data) {
          setDays(data.days ?? []);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [propertyId, year, month]);

  const goPrevious = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const goNext = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const blanks = leadingBlanks(year, month);

  return (
    <div className="calendar" role="group" aria-label={t("calendar.availabilityCalendar")}>
      <div className="calendar-header">
        <button
          type="button"
          className="calendar-nav"
          onClick={goPrevious}
          disabled={minPeriod || loading}
          aria-label={t("calendar.prevMonth")}
        >
          <FaChevronLeft aria-hidden="true" size={12} />
        </button>
        <span className="calendar-title" aria-live="polite">
          {MONTH_NAMES[lang][month - 1]} {year}
        </span>
        <button type="button" className="calendar-nav" onClick={goNext} aria-label={t("calendar.nextMonth")}>
          <FaChevronRight aria-hidden="true" size={12} />
        </button>
      </div>

      <div className="calendar-grid">
        {WEEKDAYS_SHORT[lang].map((weekday) => (
          <span key={weekday} className="calendar-weekday" aria-hidden="true">
            {weekday}
          </span>
        ))}

        {Array.from({ length: blanks }).map((_, index) => (
          <span key={`blank-${index}`} className="cal-day is-empty" aria-hidden="true" />
        ))}

        {days.map((day) => (
          <span
            key={day.date}
            className={`cal-day cal-day--${day.statut}${day.date === todayStr ? " cal-day--aujourdhui" : ""}`}
            title={buildTooltip(day, t)}
          >
            {Number(day.date.slice(-2))}
          </span>
        ))}
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
