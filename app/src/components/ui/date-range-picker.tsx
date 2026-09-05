"use client";

import {
  memo,
  useCallback,
  useRef,
  useState,
} from "react";
import { FaCalendarDays, FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { Popover } from "@/components/ui/popover";
import { useApp } from "@/components/providers/app-provider";
import { MONTH_NAMES, WEEKDAYS_SHORT } from "@/lib/i18n/dictionaries";

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

function CalendarDropdown({
  year,
  month,
  minDate,
  selected,
  onSelect,
  canPrevMonth,
  onPrev,
  onNext,
  label,
}: {
  year: number;
  month: number;
  minDate: string;
  selected: string;
  onSelect: (iso: string) => void;
  canPrevMonth: (y: number, m: number) => boolean;
  onPrev: () => void;
  onNext: () => void;
  label: string;
}) {
  const { lang, t } = useApp();
  return (
    <div className="dp-dropdown" role="dialog" aria-label={label}>
      <div className="dp-header">
        <button type="button" className="dp-nav" disabled={canPrevMonth(year, month)} onClick={onPrev} aria-label={t("calendar.prevMonth")}>
          <FaChevronLeft aria-hidden="true" size={12} />
        </button>
        <span className="dp-title">{MONTH_NAMES[lang][month - 1]} {year}</span>
        <button type="button" className="dp-nav" onClick={onNext} aria-label={t("calendar.nextMonth")}>
          <FaChevronRight aria-hidden="true" size={12} />
        </button>
      </div>
      <MonthCalendar year={year} month={month} minDate={minDate} selected={selected} onSelect={onSelect} lang={lang} />
    </div>
  );
}

interface DateRangePickerProps {
  arrivee: string;
  depart: string;
  onArriveeChange: (v: string) => void;
  onDepartChange: (v: string) => void;
  minDate?: string;
  onDatesChange?: (a: string, d: string) => void;
}

export function DateRangePicker({
  arrivee,
  depart,
  onArriveeChange,
  onDepartChange,
  minDate: minDateProp,
  onDatesChange,
}: DateRangePickerProps) {
  const { lang, t } = useApp();
  const [openArrival, setOpenArrival] = useState(false);
  const [openDeparture, setOpenDeparture] = useState(false);
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

  const arrTriggerRef = useRef<HTMLButtonElement>(null);
  const depTriggerRef = useRef<HTMLButtonElement>(null);

  const minDate = minDateProp ?? todayISO();

  const goMonth = useCallback((setY: React.Dispatch<React.SetStateAction<number>>, setM: React.Dispatch<React.SetStateAction<number>>, delta: number) => {
    setM((m) => {
      if (delta === -1 && m === 1) { setY((y) => y - 1); return 12; }
      if (delta === 1 && m === 12) { setY((y) => y + 1); return 1; }
      return m + delta;
    });
  }, []);

  const canPrevMonth = useCallback((y: number, m: number) => {
    const now = new Date();
    return y * 12 + m > now.getFullYear() * 12 + now.getMonth() + 1;
  }, []);

  const selectArrival = useCallback((iso: string) => {
    onArriveeChange(iso);
    setOpenArrival(false);
    setOpenDeparture(true);
    const p = parseISO(iso);
    if (p) {
      const d = new Date(Date.UTC(p.year, p.month - 1, p.day + 1));
      setDepYear(d.getUTCFullYear());
      setDepMonth(d.getUTCMonth() + 1);
    }
    onDatesChange?.(iso, depart);
  }, [depart, onArriveeChange, onDatesChange]);

  const selectDeparture = useCallback((iso: string) => {
    if (arrivee && iso <= arrivee) {
      onDepartChange("");
      onArriveeChange(iso);
      onDatesChange?.(iso, "");
    } else {
      onDepartChange(iso);
      onDatesChange?.(arrivee, iso);
    }
    setOpenDeparture(false);
  }, [arrivee, onArriveeChange, onDepartChange, onDatesChange]);

  return (
    <div className="sb-date-range">
      {/* Arrival trigger */}
      <button
        ref={arrTriggerRef}
        type="button"
        className="sb-date-trigger"
        aria-haspopup="dialog"
        aria-expanded={openArrival}
        onClick={() => {
          setOpenDeparture(false);
          setOpenArrival((v) => !v);
        }}
      >
        <FaCalendarDays aria-hidden="true" size={14} />
        <span className={`sb-date-trigger-text${arrivee ? "" : " is-empty"}`}>
          {arrivee ? formatShort(lang, arrivee) : t("calendar.arrival")}
        </span>
      </button>
      <Popover
        open={openArrival}
        onClose={() => setOpenArrival(false)}
        anchorRef={arrTriggerRef}
        width={294}
        align="start"
      >
        <CalendarDropdown
          year={arrYear}
          month={arrMonth}
          minDate={minDate}
          selected={arrivee}
          onSelect={selectArrival}
          canPrevMonth={canPrevMonth}
          onPrev={() => goMonth(setArrYear, setArrMonth, -1)}
          onNext={() => goMonth(setArrYear, setArrMonth, 1)}
          label={t("calendar.selectArrival")}
        />
      </Popover>

      {/* Departure trigger */}
      <button
        ref={depTriggerRef}
        type="button"
        className="sb-date-trigger"
        aria-haspopup="dialog"
        aria-expanded={openDeparture}
        onClick={() => {
          setOpenArrival(false);
          setOpenDeparture((v) => !v);
        }}
      >
        <FaCalendarDays aria-hidden="true" size={14} />
        <span className={`sb-date-trigger-text${depart ? "" : " is-empty"}`}>
          {depart ? formatShort(lang, depart) : t("calendar.departure")}
        </span>
      </button>
      <Popover
        open={openDeparture}
        onClose={() => setOpenDeparture(false)}
        anchorRef={depTriggerRef}
        width={294}
        align="start"
      >
        <CalendarDropdown
          year={depYear}
          month={depMonth}
          minDate={minDate}
          selected={depart}
          onSelect={selectDeparture}
          canPrevMonth={canPrevMonth}
          onPrev={() => goMonth(setDepYear, setDepMonth, -1)}
          onNext={() => goMonth(setDepYear, setDepMonth, 1)}
          label={t("calendar.selectDeparture")}
        />
      </Popover>
    </div>
  );
}