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

function toISO(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseISO(iso: string): { year: number; month: number; day: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
}

/* ─── Calendrier mensuel ─── */
function MonthCalendar({
  year,
  month,
  minDate,
  arrivalISO,
  departureISO,
  hoverDate,
  activePanel,
  panel,
  onSelect,
  onHover,
}: {
  year: number;
  month: number;
  minDate: string;
  arrivalISO: string;
  departureISO: string;
  hoverDate: string;
  activePanel: "arrival" | "departure";
  panel: "arrival" | "departure";
  onSelect: (iso: string) => void;
  onHover: (iso: string) => void;
}) {
  const blanks = leadingBlanks(year, month);
  const total = daysInMonth(year, month);
  const today = todayISO();
  const isActive = activePanel === panel;

  return (
    <div className={`dc-month${isActive ? " dc-month--active" : ""}`}>
      <div className="dc-month-header">
        <span className="dc-month-title">
          {MONTH_NAMES[month - 1]} {year}
        </span>
      </div>

      <div className="dc-month-grid">
        {WEEKDAYS.map((wd) => (
          <span key={wd} className="dc-weekday" aria-hidden="true">
            {wd}
          </span>
        ))}

        {Array.from({ length: blanks }).map((_, i) => (
          <span key={`b${i}`} className="dc-day dc-day--empty" aria-hidden="true" />
        ))}

        {Array.from({ length: total }, (_, i) => {
          const day = i + 1;
          const iso = toISO(year, month, day);
          const isToday = iso === today;
          const isPast = iso < minDate;
          const isArrival = iso === arrivalISO;
          const isDeparture = departureISO !== "" && iso === departureISO;
          const inRange =
            arrivalISO !== "" &&
            departureISO !== "" &&
            iso > arrivalISO &&
            iso < departureISO;
          const isHoverRange =
            departureISO === "" &&
            arrivalISO !== "" &&
            hoverDate !== "" &&
            iso > arrivalISO &&
            iso <= hoverDate;

          let cls = "dc-day";
          if (isToday) cls += " dc-day--today";
          if (isPast) cls += " dc-day--disabled";
          if (isArrival) cls += " dc-day--start";
          if (isDeparture) cls += " dc-day--end";
          if (inRange) cls += " dc-day--in-range";
          if (isHoverRange) cls += " dc-day--hover-range";

          return (
            <button
              key={iso}
              type="button"
              className={cls}
              disabled={isPast}
              aria-label={`${day} ${MONTH_NAMES[month - 1]} ${year}`}
              aria-current={isToday ? "date" : undefined}
              onClick={() => onSelect(iso)}
              onMouseEnter={() => {
                if (!isPast) onHover(iso);
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Double calendrier (dropdown) ─── */
function DoubleCalendar({
  arrivalISO,
  departureISO,
  minDate,
  onSelectArrival,
  onSelectDeparture,
  onReset,
  onComplete,
}: {
  arrivalISO: string;
  departureISO: string;
  minDate: string;
  onSelectArrival: (iso: string) => void;
  onSelectDeparture: (iso: string) => void;
  onReset: () => void;
  onComplete: () => void;
}) {
  const now = new Date();
  const [leftYear, setLeftYear] = useState(now.getFullYear());
  const [leftMonth, setLeftMonth] = useState(now.getMonth() + 1);
  const [activePanel, setActivePanel] = useState<"arrival" | "departure">(
    departureISO !== "" ? "arrival" : "departure"
  );
  const [hoverDate, setHoverDate] = useState("");

  const rightMonth = leftMonth === 12 ? 1 : leftMonth + 1;
  const rightYear = leftMonth === 12 ? leftYear + 1 : leftYear;

  const canGoPrev =
    leftYear * 12 + leftMonth > now.getFullYear() * 12 + now.getMonth() + 1;

  const goPrev = () => {
    if (canGoPrev) {
      if (leftMonth === 1) {
        setLeftMonth(12);
        setLeftYear((y) => y - 1);
      } else {
        setLeftMonth((m) => m - 1);
      }
    }
  };

  const goNext = () => {
    if (leftMonth === 12) {
      setLeftMonth(1);
      setLeftYear((y) => y + 1);
    } else {
      setLeftMonth((m) => m + 1);
    }
  };

  const handleSelect = (iso: string) => {
    if (activePanel === "arrival") {
      onSelectArrival(iso);
      setActivePanel("departure");
      setHoverDate("");
    } else {
      if (arrivalISO !== "" && iso <= arrivalISO) {
        onReset();
        onSelectArrival(iso);
        setActivePanel("departure");
      } else {
        onSelectDeparture(iso);
        setActivePanel("arrival");
        setHoverDate("");
        onComplete();
      }
    }
  };

  return (
    <div className="dc-panel">
      <div className="dc-panel-nav">
        <button
          type="button"
          className="dc-nav-btn"
          onClick={goPrev}
          disabled={canGoPrev}
          aria-label="Mois précédent"
        >
          <FaChevronLeft aria-hidden="true" size={12} />
        </button>
        <div className="dc-panel-step">
          <span
            className={`dc-step-dot${activePanel === "arrival" ? " dc-step-dot--active" : ""}`}
          />
          <span
            className={`dc-step-dot${activePanel === "departure" ? " dc-step-dot--active" : ""}`}
          />
        </div>
        <button
          type="button"
          className="dc-nav-btn"
          onClick={goNext}
          aria-label="Mois suivant"
        >
          <FaChevronRight aria-hidden="true" size={12} />
        </button>
      </div>

      <div className="dc-calendars">
        <MonthCalendar
          year={leftYear}
          month={leftMonth}
          minDate={minDate}
          arrivalISO={arrivalISO}
          departureISO={departureISO}
          hoverDate={hoverDate}
          activePanel={activePanel}
          panel="arrival"
          onSelect={handleSelect}
          onHover={setHoverDate}
        />

        <div className="dc-divider" aria-hidden="true" />

        <MonthCalendar
          year={rightYear}
          month={rightMonth}
          minDate={minDate}
          arrivalISO={arrivalISO}
          departureISO={departureISO}
          hoverDate={hoverDate}
          activePanel={activePanel}
          panel="departure"
          onSelect={handleSelect}
          onHover={setHoverDate}
        />
      </div>

      <div className="dc-panel-footer">
        <span className="dc-footer-hint">
          {activePanel === "arrival"
            ? "Choisissez votre date d'arrivée"
            : "Choisissez votre date de départ"}
        </span>
        {(arrivalISO !== "" || departureISO !== "") && (
          <button type="button" className="dc-reset-btn" onClick={onReset}>
            Effacer
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Composant intégré au hero ─── */
export function DateRangeField({ min }: { min?: string }) {
  const [open, setOpen] = useState(false);
  const [arrivalISO, setArrivalISO] = useState("");
  const [departureISO, setDepartureISO] = useState("");
  const [dropUp, setDropUp] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const minDate = min ?? todayISO();

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("click", onClick);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const toggle = () => {
    if (!open && wrapRef.current) {
      const rect = wrapRef.current.getBoundingClientRect();
      setDropUp(window.innerHeight - rect.bottom < 420 && rect.top > 420);
    }
    setOpen((v) => !v);
  };

  const formatDisplay = (iso: string): string => {
    const p = parseISO(iso);
    if (!p) return "";
    const monthShort = MONTH_NAMES[p.month - 1].slice(0, 3);
    return `${p.day} ${monthShort}. ${p.year}`;
  };

  const arrivalDisplay = arrivalISO !== "" ? formatDisplay(arrivalISO) : "";
  const departureDisplay = departureISO !== "" ? formatDisplay(departureISO) : "";

  const summary =
    arrivalISO !== ""
      ? departureISO !== ""
        ? `${arrivalDisplay} — ${departureDisplay}`
        : `${arrivalDisplay} — ?`
      : "";

  return (
    <div className="search-field search-field--range" ref={wrapRef}>
      <span className="search-label">Arrivée — Départ</span>
      <button
        type="button"
        className="range-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggle}
      >
        <FaCalendarDays aria-hidden="true" size={15} />
        <span className={`range-value${summary !== "" ? "" : " range-value--placeholder"}`}>
          {summary !== "" ? summary : "Sélectionnez vos dates"}
        </span>
      </button>

      {open && (
        <div
          className={`dc-dropdown${dropUp ? " dc-dropdown--up" : ""}`}
          role="dialog"
          aria-label="Choix des dates"
        >
          <DoubleCalendar
            arrivalISO={arrivalISO}
            departureISO={departureISO}
            minDate={minDate}
            onSelectArrival={setArrivalISO}
            onSelectDeparture={setDepartureISO}
            onReset={() => {
              setArrivalISO("");
              setDepartureISO("");
            }}
            onComplete={() => setOpen(false)}
          />
        </div>
      )}

      <input type="hidden" name="arrivee" value={arrivalISO} />
      <input type="hidden" name="depart" value={departureISO} />
    </div>
  );
}
