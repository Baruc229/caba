"use client";

import { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

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

const WEEKDAYS = ["lu", "ma", "me", "je", "ve", "sa", "di"];

const MONTH_NAMES = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

const LEGEND = [
  { statut: "disponible", label: "Disponible" },
  { statut: "reserve", label: "Réservé" },
  { statut: "en_attente", label: "En attente" },
  { statut: "bloque", label: "Bloqué" },
  { statut: "maintenance", label: "Maintenance" },
] as const;

function buildTooltip(day: CalendarDay): string {
  const base = `${day.date} — ${day.libelle}`;
  if (day.creneaux.length === 0) return base;
  const slots = day.creneaux
    .map((c) => {
      const source =
        c.source === "ical"
          ? "plateforme externe"
          : c.source === "maintenance"
            ? "maintenance"
            : c.source === "whatsapp"
              ? "WhatsApp"
              : c.source === "booking"
                ? "réservation"
                : "administration";
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
    <div className="calendar" role="group" aria-label="Calendrier de disponibilité">
      <div className="calendar-header">
        <button
          type="button"
          className="calendar-nav"
          onClick={goPrevious}
          disabled={minPeriod || loading}
          aria-label="Mois précédent"
        >
          <FaChevronLeft aria-hidden="true" size={12} />
        </button>
        <span className="calendar-title" aria-live="polite">
          {MONTH_NAMES[month - 1]} {year}
        </span>
        <button type="button" className="calendar-nav" onClick={goNext} aria-label="Mois suivant">
          <FaChevronRight aria-hidden="true" size={12} />
        </button>
      </div>

      <div className="calendar-grid">
        {WEEKDAYS.map((weekday) => (
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
            title={buildTooltip(day)}
          >
            {Number(day.date.slice(-2))}
          </span>
        ))}
      </div>

      <div className="calendar-legend">
        {LEGEND.map((item) => (
          <span key={item.statut} className="legend-item">
            <span className={`legend-dot legend-dot--${item.statut}`} aria-hidden="true" />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
