"use client";

import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  FaCalendarDays,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa6";
import { useApp } from "@/components/providers/app-provider";
import {
  MONTH_NAMES,
  WEEKDAYS_SHORT,
} from "@/lib/i18n/dictionaries";

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

function formatShort(lang: "fr" | "en", iso: string): string {
  const p = parseISO(iso);
  if (!p) return "";
  return `${p.day} ${MONTH_NAMES[lang][p.month - 1].slice(0, 3)}. ${p.year}`;
}

/* ─── Calendrier mensuel (memo pour éviter re-render inutile) ─── */
const MonthCalendar = memo(function MonthCalendar({
  year,
  month,
  minDate,
  selected,
  onSelect,
  lang,
}: {
  year: number;
  month: number;
  minDate: string;
  selected: string;
  onSelect: (iso: string) => void;
  lang: "fr" | "en";
}) {
  const blanks = leadingBlanks(year, month);
  const total = daysInMonth(year, month);
  const today = todayISO();

  return (
    <div className="dp-month">
      <div className="dp-month-grid">
        {WEEKDAYS_SHORT[lang].map((wd) => (
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
              aria-label={`${day} ${MONTH_NAMES[lang][month - 1]} ${year}`}
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
});

/* ─── Dropdown calendrier avec forwardRef pour flip + scroll ─── */
const CalendarDropdown = forwardRef<HTMLDivElement, {
  year: number;
  month: number;
  minDate: string;
  selected: string;
  onSelect: (iso: string) => void;
  canPrevMonth: (y: number, m: number) => boolean;
  onPrev: () => void;
  onNext: () => void;
  label: string;
}>(function CalendarDropdown(
  { year, month, minDate, selected, onSelect, canPrevMonth, onPrev, onNext, label },
  ref,
) {
  const { lang, t } = useApp();
  return (
    <div className="dp-dropdown" role="dialog" aria-label={label} ref={ref}>
      <div className="dp-header">
        <button
          type="button"
          className="dp-nav"
          disabled={canPrevMonth(year, month)}
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          aria-label={t("calendar.prevMonth")}
        >
          <FaChevronLeft aria-hidden="true" size={12} />
        </button>
        <span className="dp-title">
          {MONTH_NAMES[lang][month - 1]} {year}
        </span>
        <button
          type="button"
          className="dp-nav"
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          aria-label={t("calendar.nextMonth")}
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
        lang={lang}
      />
    </div>
  );
});

/* ─── DateRangeField : deux champs date dans le hero ─── */
export function DateRangeField({ min }: { min?: string }) {
  const { lang, t } = useApp();
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

  const containerRef = useRef<HTMLDivElement>(null);
  const arrDropRef = useRef<HTMLDivElement>(null);
  const depDropRef = useRef<HTMLDivElement>(null);

  const minDate = min ?? todayISO();

  /* Flip dropdown si ça dépasse le bas du viewport */
  useLayoutEffect(() => {
    const ref = openArrival ? arrDropRef : openDeparture ? depDropRef : null;
    if (!ref?.current) return;
    ref.current.classList.remove("dp-dropdown--above");
    const rect = ref.current.getBoundingClientRect();
    if (rect.bottom > window.innerHeight - 8) {
      ref.current.classList.add("dp-dropdown--above");
    }
  }, [openArrival, openDeparture]);

  /* Scroll-into-view à l'ouverture */
  useEffect(() => {
    const ref = openArrival ? arrDropRef : openDeparture ? depDropRef : null;
    if (!ref?.current) return;
    ref.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [openArrival, openDeparture]);

  /* Click-outside robuste */
  useEffect(() => {
    if (!openArrival && !openDeparture) return;

    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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

    const id = setTimeout(() => {
      window.addEventListener("click", onClick);
      window.addEventListener("keydown", onKey);
    }, 0);
    return () => {
      clearTimeout(id);
      window.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [openArrival, openDeparture]);

  const goMonth = useCallback(
    (
      setY: React.Dispatch<React.SetStateAction<number>>,
      setM: React.Dispatch<React.SetStateAction<number>>,
      delta: number,
    ) => {
      setM((m) => {
        if (delta === -1 && m === 1) { setY((y) => y - 1); return 12; }
        if (delta === 1 && m === 12) { setY((y) => y + 1); return 1; }
        return m + delta;
      });
    },
    [],
  );

  const canPrevMonth = useCallback((y: number, m: number) => {
    const now = new Date();
    return y * 12 + m > now.getFullYear() * 12 + now.getMonth() + 1;
  }, []);

  const selectArrival = useCallback((iso: string) => {
    setArrivalISO(iso);
    setOpenArrival(false);
    setOpenDeparture(true);
    const p = parseISO(iso);
    if (p) {
      const d = new Date(Date.UTC(p.year, p.month - 1, p.day + 1));
      setDepYear(d.getUTCFullYear());
      setDepMonth(d.getUTCMonth() + 1);
    }
  }, []);

  const selectDeparture = useCallback((iso: string) => {
    setArrivalISO((prev) => {
      if (prev !== "" && iso <= prev) {
        setDepartureISO("");
        setOpenDeparture(false);
        return iso;
      }
      setDepartureISO(iso);
      setOpenDeparture(false);
      return prev;
    });
  }, []);

  return (
    <div ref={containerRef} style={{ display: "contents" }}>
      {/* Champ arrivée */}
      <div className="search-field">
        <span className="search-label">{t("calendar.arrival")}</span>
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
            {arrivalISO ? formatShort(lang, arrivalISO) : t("calendar.pickArrival")}
          </span>
        </button>
        {openArrival && (
          <CalendarDropdown
            ref={arrDropRef}
            year={arrYear}
            month={arrMonth}
            minDate={minDate}
            selected={arrivalISO}
            onSelect={selectArrival}
            canPrevMonth={canPrevMonth}
            onPrev={() => goMonth(setArrYear, setArrMonth, -1)}
            onNext={() => goMonth(setArrYear, setArrMonth, 1)}
            label={t("calendar.selectArrival")}
          />
        )}
        <input type="hidden" name="arrivee" value={arrivalISO} />
      </div>

      {/* Champ départ */}
      <div className="search-field">
        <span className="search-label">{t("calendar.departure")}</span>
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
            {departureISO ? formatShort(lang, departureISO) : t("calendar.pickDeparture")}
          </span>
        </button>
        {openDeparture && (
          <CalendarDropdown
            ref={depDropRef}
            year={depYear}
            month={depMonth}
            minDate={minDate}
            selected={departureISO}
            onSelect={selectDeparture}
            canPrevMonth={canPrevMonth}
            onPrev={() => goMonth(setDepYear, setDepMonth, -1)}
            onNext={() => goMonth(setDepYear, setDepMonth, 1)}
            label={t("calendar.selectDeparture")}
          />
        )}
        <input type="hidden" name="depart" value={departureISO} />
      </div>
    </div>
  );
}
