"use client";

import { useEffect, useRef, useState } from "react";
import {
  FaCalendarDays,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa6";

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

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function leadingBlanks(year: number, month: number): number {
  const jsDay = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  return (jsDay + 6) % 7;
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function toISO(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function parseISO(iso: string): { year: number; month: number; day: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
}

function formatShort(iso: string): string {
  const p = parseISO(iso);
  if (!p) return "";
  return `${p.day} ${MONTH_NAMES[p.month - 1].slice(0, 3)}. ${p.year}`;
}

/* ─── Calendrier mensuel compact ─── */
function MonthCalendar({
  year,
  month,
  minDate,
  selected,
  onSelect,
}: {
  year: number;
  month: number;
  minDate: string;
  selected: string;
  onSelect: (iso: string) => void;
}) {
  const blanks = leadingBlanks(year, month);
  const total = daysInMonth(year, month);
  const today = todayISO();

  return (
    <div className="dp-month">
      <div className="dp-month-grid">
        {WEEKDAYS.map((wd) => (
          <span key={wd} className="dp-weekday" aria-hidden="true">
            {wd}
          </span>
        ))}

        {Array.from({ length: blanks }).map((_, i) => (
          <span key={`b${i}`} className="dp-day dp-day--empty" aria-hidden="true" />
        ))}

        {Array.from({ length: total }, (_, i) => {
          const day = i + 1;
          const iso = toISO(year, month, day);
          const isToday = iso === today;
          const isPast = iso < minDate;
          const isSelected = iso === selected;

          let cls = "dp-day";
          if (isToday) cls += " dp-day--today";
          if (isPast) cls += " dp-day--disabled";
          if (isSelected) cls += " dp-day--selected";

          return (
            <button
              key={iso}
              type="button"
              className={cls}
              disabled={isPast}
              aria-label={`${day} ${MONTH_NAMES[month - 1]} ${year}`}
              aria-current={isToday ? "date" : undefined}
              onClick={() => onSelect(iso)}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── DateRangeField : deux champs date côte à côte dans le hero ─── */
export function DateRangeField({ min }: { min?: string }) {
  const [openArrival, setOpenArrival] = useState(false);
  const [openDeparture, setOpenDeparture] = useState(false);
  const [arrivalISO, setArrivalISO] = useState("");
  const [departureISO, setDepartureISO] = useState("");
  const [arrYear, setArrYear] = useState(() => new Date().getFullYear());
  const [arrMonth, setArrMonth] = useState(() => new Date().getMonth() + 1);
  const [depYear, setDepYear] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.getFullYear();
  });
  const [depMonth, setDepMonth] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.getMonth() + 1;
  });

  const arrivalRef = useRef<HTMLDivElement>(null);
  const departureRef = useRef<HTMLDivElement>(null);

  const minDate = min ?? todayISO();

  /* Fermeture click-outside */
  useEffect(() => {
    if (!openArrival && !openDeparture) return;
    const onClick = (e: MouseEvent) => {
      if (
        arrivalRef.current && !arrivalRef.current.contains(e.target as Node) &&
        departureRef.current && !departureRef.current.contains(e.target as Node)
      ) {
        setOpenArrival(false);
        setOpenDeparture(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenArrival(false);
        setOpenDeparture(false);
      }
    };
    window.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [openArrival, openDeparture]);

  const goMonth = (
    setY: React.Dispatch<React.SetStateAction<number>>,
    setM: React.Dispatch<React.SetStateAction<number>>,
    delta: number
  ) => {
    setM((m) => {
      if (delta === -1 && m === 1) {
        setY((y) => y - 1);
        return 12;
      }
      if (delta === 1 && m === 12) {
        setY((y) => y + 1);
        return 1;
      }
      return m + delta;
    });
  };

  const selectArrival = (iso: string) => {
    setArrivalISO(iso);
    setOpenArrival(false);
    setOpenDeparture(true);
    const p = parseISO(iso);
    if (p) {
      const d = new Date(Date.UTC(p.year, p.month - 1, p.day + 1));
      setDepYear(d.getUTCFullYear());
      setDepMonth(d.getUTCMonth() + 1);
    }
  };

  const selectDeparture = (iso: string) => {
    if (arrivalISO !== "" && iso <= arrivalISO) {
      setArrivalISO(iso);
      setDepartureISO("");
      setOpenDeparture(false);
      return;
    }
    setDepartureISO(iso);
    setOpenDeparture(false);
  };

  const canPrevMonth = (
    y: number,
    m: number,
  ) => {
    const now = new Date();
    return y * 12 + m > now.getFullYear() * 12 + now.getMonth() + 1;
  };

  const renderCalendar = (
    year: number,
    month: number,
    setY: React.Dispatch<React.SetStateAction<number>>,
    setM: React.Dispatch<React.SetStateAction<number>>,
    selected: string,
    onSelect: (iso: string) => void,
  ) => (
    <div className="dp-dropdown" role="dialog" aria-label="Choix de la date">
      <div className="dp-header">
        <button
          type="button"
          className="dp-nav"
          disabled={canPrevMonth(year, month)}
          onClick={(e) => {
            e.stopPropagation();
            goMonth(setY, setM, -1);
          }}
          aria-label="Mois précédent"
        >
          <FaChevronLeft aria-hidden="true" size={12} />
        </button>
        <span className="dp-title">
          {MONTH_NAMES[month - 1]} {year}
        </span>
        <button
          type="button"
          className="dp-nav"
          onClick={(e) => {
            e.stopPropagation();
            goMonth(setY, setM, 1);
          }}
          aria-label="Mois suivant"
        >
          <FaChevronRight aria-hidden="true" size={12} />
        </button>
      </div>
      <MonthCalendar
        year={year}
        month={month}
        minDate={minDate}
        selected={selected}
        onSelect={onSelect}
      />
    </div>
  );

  return (
    <>
      {/* Champ arrivée */}
      <div className="search-field" ref={arrivalRef}>
        <span className="search-label">Arrivée</span>
        <button
          type="button"
          className="dp-trigger"
          aria-haspopup="dialog"
          aria-expanded={openArrival}
          onClick={(e) => {
            e.stopPropagation();
            setOpenArrival((v) => !v);
            setOpenDeparture(false);
          }}
        >
          <FaCalendarDays aria-hidden="true" size={15} />
          <span className={`dp-trigger-text${arrivalISO ? "" : " dp-trigger-text--empty"}`}>
            {arrivalISO ? formatShort(arrivalISO) : "Choisir"}
          </span>
        </button>
        {openArrival &&
          renderCalendar(arrYear, arrMonth, setArrYear, setArrMonth, arrivalISO, selectArrival)}
        <input type="hidden" name="arrivee" value={arrivalISO} />
      </div>

      {/* Champ départ */}
      <div className="search-field" ref={departureRef}>
        <span className="search-label">Départ</span>
        <button
          type="button"
          className="dp-trigger"
          aria-haspopup="dialog"
          aria-expanded={openDeparture}
          onClick={(e) => {
            e.stopPropagation();
            setOpenDeparture((v) => !v);
            setOpenArrival(false);
          }}
        >
          <FaCalendarDays aria-hidden="true" size={15} />
          <span className={`dp-trigger-text${departureISO ? "" : " dp-trigger-text--empty"}`}>
            {departureISO ? formatShort(departureISO) : "Choisir"}
          </span>
        </button>
        {openDeparture &&
          renderCalendar(depYear, depMonth, setDepYear, setDepMonth, departureISO, selectDeparture)}
        <input type="hidden" name="depart" value={departureISO} />
      </div>
    </>
  );
}
