"use client";

import { useEffect, useRef, useState } from "react";
import { FaCalendarDays, FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { useApp } from "@/components/providers/app-provider";
import { MONTH_NAMES } from "@/lib/i18n/dictionaries";
import {
  addMonths,
  formatISODate,
  nextSelection,
  toISO,
  type MonthRef,
} from "@/lib/calendar-utils";
import { useAvailabilityMonth } from "@/hooks/use-availability-month";
import { AvailabilityMonthGrid } from "./availability-month-grid";

interface ReservationDatePickerProps {
  propertyId: string;
  arrivee: string;
  depart: string;
  onChange: (arrivee: string, depart: string) => void;
}

type FieldName = "arrivee" | "depart";

function monthOf(iso: string): MonthRef {
  const [year, month] = iso.split("-").map(Number);
  return { year, month };
}

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

  return (
    <div className="reserv-picker" id="reservation-dates" ref={rootRef}>
      <div className="reserv-date-fields">
        <button
          type="button"
          className={`reserv-date-field${arrivee ? " reserv-date-field--filled" : ""}`}
          onClick={() => openField("arrivee")}
          aria-haspopup="dialog"
          aria-expanded={openFor === "arrivee"}
        >
          <span className="reserv-date-field-label">{t("logementDetail.arrivee")}</span>
          <span className="reserv-date-field-value">
            <FaCalendarDays aria-hidden="true" size={12} />
            {arrivee ? formatISODate(arrivee, lang) : t("logementDetail.choisirDates")}
          </span>
        </button>
        <button
          type="button"
          className={`reserv-date-field${depart ? " reserv-date-field--filled" : ""}`}
          onClick={() => openField("depart")}
          aria-haspopup="dialog"
          aria-expanded={openFor === "depart"}
        >
          <span className="reserv-date-field-label">{t("logementDetail.depart")}</span>
          <span className="reserv-date-field-value">
            <FaCalendarDays aria-hidden="true" size={12} />
            {depart ? formatISODate(depart, lang) : t("logementDetail.choisirDates")}
          </span>
        </button>
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

          <AvailabilityMonthGrid
            month={anchor}
            todayStr={todayStr}
            days={days}
            loading={loading}
            arrivee={arrivee}
            depart={depart}
            onSelect={handleDay}
          />
        </div>
      )}
    </div>
  );
}