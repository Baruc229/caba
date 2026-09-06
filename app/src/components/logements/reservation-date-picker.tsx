"use client";

import { useEffect, useRef, useState } from "react";
import {
  FaCalendarDays,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa6";
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
import { useAvailabilityMonth } from "@/hooks/use-availability-month";

function monthOf(iso: string): MonthRef {
  const [year, month] = iso.split("-").map(Number);
  return { year, month };
}

function formatFieldDate(iso: string, lang: string): string {
  const date = new Date(`${iso}T12:00:00Z`);
  return date.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface ReservationDatePickerProps {
  propertyId: string;
  arrivee: string;
  depart: string;
  onChange: (arrivee: string, depart: string) => void;
}

type FieldName = "arrivee" | "depart";

/**
 * Sélecteur compact de dates de la carte de réservation : un popover
 * calendrier s'ouvre au clic sur un champ (icône calendrier). Il partage la
 * même source de données (`/api/availability`) et la même machine à états
 * (`nextSelection`/`rangeRole`) que les calendriers de disponibilité : un
 * jour réservé est bloqué ici aussi, et la plage choisie se reflète en bleu
 * dans les deux grands calendriers.
 */
export function ReservationDatePicker({
  propertyId,
  arrivee,
  depart,
  onChange,
}: ReservationDatePickerProps) {
  const { lang, t } = useApp();
  const rootRef = useRef<HTMLDivElement>(null);
  const [openFor, setOpenFor] = useState<FieldName | null>(null);

  const today = new Date();
  const todayStr = toISO(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const [anchor, setAnchor] = useState<MonthRef>({
    year: today.getFullYear(),
    month: today.getMonth() + 1,
  });

  const openField = (field: FieldName) => {
    const targetIso = field === "arrivee" ? arrivee : depart || arrivee;
    if (targetIso) setAnchor(monthOf(targetIso));
    setOpenFor(field);
  };

  useEffect(() => {
    if (!openFor) return;
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpenFor(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenFor(null);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [openFor]);

  const { loading, days } = useAvailabilityMonth(propertyId, anchor);

  const handleDay = (iso: string) => {
    const selection = nextSelection(arrivee, depart, iso);
    onChange(selection.arrivee, selection.depart);
    if (selection.arrivee && selection.depart) setOpenFor(null);
  };

  const canGoPrev =
    anchor.year > today.getFullYear() ||
    (anchor.year === today.getFullYear() && anchor.month > today.getMonth() + 1);

  const blanks = leadingBlanks(anchor.year, anchor.month);
  const total = daysInMonth(anchor.year, anchor.month);

  const renderField = (
    field: FieldName,
    label: string,
    value: string,
    filled: boolean
  ) => (
    <button
      type="button"
      className={`reserv-date-field${filled ? " reserv-date-field--filled" : ""}`}
      onClick={() => openField(field)}
      aria-haspopup="dialog"
      aria-expanded={openFor === field}
      aria-label={label}
    >
      <span className="reserv-date-field-label">{label}</span>
      <span className="reserv-date-field-value">
        <FaCalendarDays aria-hidden="true" size={12} />
        {value}
      </span>
    </button>
  );

  return (
    <div className="reserv-picker" id="reservation-dates" ref={rootRef}>
      <div className="reserv-date-fields">
        {renderField(
          "arrivee",
          t("logementDetail.arrivee"),
          arrivee ? formatFieldDate(arrivee, lang) : t("logementDetail.choisirDates"),
          Boolean(arrivee)
        )}
        {renderField(
          "depart",
          t("logementDetail.depart"),
          depart ? formatFieldDate(depart, lang) : t("logementDetail.choisirDates"),
          Boolean(depart)
        )}
      </div>

      {openFor && (
        <div
          className="reserv-date-popover"
          role="dialog"
          aria-label={t("calendar.availabilityCalendar")}
        >
          <div className="reserv-popover-header">
            <button
              type="button"
              className="calendar-nav"
              onClick={() => setAnchor((ref: MonthRef) => addMonths(ref, -1))}
              disabled={!canGoPrev || loading}
              aria-label={t("calendar.prevMonth")}
            >
              <FaChevronLeft aria-hidden="true" size={11} />
            </button>
            <span className="reserv-popover-title" aria-hidden="true">
              {MONTH_NAMES[lang][anchor.month - 1]} {anchor.year}
            </span>
            <button
              type="button"
              className="calendar-nav"
              onClick={() => setAnchor((ref: MonthRef) => addMonths(ref, 1))}
              disabled={loading}
              aria-label={t("calendar.nextMonth")}
            >
              <FaChevronRight aria-hidden="true" size={11} />
            </button>
          </div>

          <div className="cal-panel-grid">
            {WEEKDAYS_SHORT[lang].map((weekday) => (
              <span key={weekday} className="cal-panel-weekday" aria-hidden="true">
                {weekday}
              </span>
            ))}

            {loading
              ? Array.from({ length: 35 }, (_, i) => (
                  <span
                    key={`skeleton-${i}`}
                    className="cal-day cal-day--skeleton"
                    aria-hidden="true"
                  />
                ))
              : Array.from({ length: blanks }, (_, i) => (
                  <span key={`blank-${i}`} className="cal-day is-empty" aria-hidden="true" />
                ))}

            {!loading &&
              Array.from({ length: total }, (_, i) => {
                const d = i + 1;
                const iso = toISO(anchor.year, anchor.month, d);
                const info = days?.[iso];
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

                return (
                  <button
                    key={iso}
                    type="button"
                    className={classes.join(" ")}
                    disabled={!available || past}
                    onClick={() => handleDay(iso)}
                    aria-label={`${iso}${info?.libelle ? ` — ${info.libelle}` : ""}`}
                    title={`${iso}${info?.libelle ? ` — ${info.libelle}` : ""}`}
                  >
                    {d}
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}