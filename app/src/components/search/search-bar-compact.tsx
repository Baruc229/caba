"use client";

import { useState, useRef, useEffect } from "react";
import { FaCalendarDays, FaClock, FaUserGroup, FaChevronDown } from "react-icons/fa6";
import { Select } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Popover } from "@/components/ui/popover";
import { PROPERTY_TYPES } from "@/lib/property-types";
import { useApp } from "@/components/providers/app-provider";

const SEJOUR_ENTRIES: [string, string][] = [
  ["nuee", "sejourNuee"],
  ["journee", "sejourJournee"],
  ["vingt_quatre_heures", "sejourVingtQuatreHeures"],
  ["demi_journee", "sejourDemiJournee"],
  ["plusieurs_heures", "sejourPlusieursHeures"],
  ["heure", "sejourHeure"],
  ["semaine", "sejourSemaine"],
  ["mois", "sejourMois"],
];

const NEEDS_HOURS = new Set(["vingt_quatre_heures", "plusieurs_heures", "heure"]);

const TYPE_ENTRIES: [string, string][] = [
  ["", "allTypes"],
  ...PROPERTY_TYPES.map((pt) => [pt.value, pt.labelKey] as [string, string]),
];

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

interface SearchBarCompactProps {
  initialArrivee: string;
  initialDepart: string;
  initialAdultes: number;
  initialEnfants: number;
  initialBebes: number;
  initialType: string;
  initialTypeReservation: string;
  initialHeureArrivee?: string;
  initialHeureDepart?: string;
}

export function SearchBarCompact({
  initialArrivee,
  initialDepart,
  initialAdultes,
  initialEnfants,
  initialBebes,
  initialType,
  initialTypeReservation,
  initialHeureArrivee = "08:00",
  initialHeureDepart = "18:00",
}: SearchBarCompactProps) {
  const { t } = useApp();
  const [arrivee, setArrivee] = useState(initialArrivee);
  const [depart, setDepart] = useState(initialDepart);
  const [adultes, setAdultes] = useState(initialAdultes);
  const [enfants, setEnfants] = useState(initialEnfants);
  const [bebes, setBebes] = useState(initialBebes);
  const [type, setType] = useState(initialType);
  const [typeReservation, setTypeReservation] = useState(initialTypeReservation);
  const [heureArrivee, setHeureArrivee] = useState(initialHeureArrivee);
  const [heureDepart, setHeureDepart] = useState(initialHeureDepart);
  const [voyageursOpen, setVoyageursOpen] = useState(false);
  const voyageursRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 767px)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const needsHours = NEEDS_HOURS.has(typeReservation);
  const is24h = typeReservation === "vingt_quatre_heures";

  const heureDepartAuto = (() => {
    const [h, m] = heureArrivee.split(":").map(Number);
    const next = (h + 24) % 24;
    return `${String(next).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  })();

  const guestsSummary = [
    `${adultes} ${t(adultes > 1 ? "home.guestAdultesPlural" : "home.guestAdultesSingular")}`,
    enfants > 0 ? `${enfants} ${t(enfants > 1 ? "home.guestEnfantsPlural" : "home.guestEnfantsSingular")}` : null,
    bebes > 0 ? `${bebes} ${t(bebes > 1 ? "home.guestBebesPlural" : "home.guestBebesSingular")}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const changeGuest = (setter: (v: number) => void, min: number, delta: number, current: number) => {
    setter(Math.max(min, Math.min(9, current + delta)));
  };

  const guestFields = [
    { nameKey: "home.guestAdultesName", partitiveKey: "home.guestAdultesPartitive", min: 1, value: adultes, setter: setAdultes },
    { nameKey: "home.guestEnfantsName", partitiveKey: "home.guestEnfantsPartitive", min: 0, value: enfants, setter: setEnfants },
    { nameKey: "home.guestBebesName", partitiveKey: "home.guestBebesPartitive", min: 0, value: bebes, setter: setBebes },
  ];

  const buildUrl = () => {
    const params = new URLSearchParams();
    if (arrivee) params.set("arrivee", arrivee);
    if (depart) params.set("depart", depart);
    params.set("adultes", String(adultes));
    if (enfants > 0) params.set("enfants", String(enfants));
    if (bebes > 0) params.set("bebes", String(bebes));
    if (type) params.set("type", type);
    if (typeReservation) params.set("typeReservation", typeReservation);
    if (needsHours) {
      params.set("heureArrivee", heureArrivee);
      params.set("heureDepart", is24h ? heureDepartAuto : heureDepart);
    }
    return `/logements?${params.toString()}`;
  };

  return (
    <form className="search-bar-compact" action={buildUrl()} method="get" aria-label={t("search.formAriaLabel")}>
      <div className="search-bar-compact-fields">
        {isMobile ? (
          <>
            <div className="search-bar-compact-field">
              <label htmlFor="sb-arrivee" className="search-bar-compact-label">
                <FaCalendarDays aria-hidden="true" size={13} />
                {t("calendar.arrival")}
              </label>
              <input
                id="sb-arrivee"
                name="arrivee"
                type="date"
                value={arrivee}
                min={todayISO()}
                onChange={(e) => setArrivee(e.target.value)}
                className="search-bar-compact-input"
                placeholder=" "
              />
            </div>

            <div className="search-bar-compact-field">
              <label htmlFor="sb-depart" className="search-bar-compact-label">
                <FaCalendarDays aria-hidden="true" size={13} />
                {t("calendar.departure")}
              </label>
              <input
                id="sb-depart"
                name="depart"
                type="date"
                value={depart}
                min={arrivee || todayISO()}
                onChange={(e) => setDepart(e.target.value)}
                className="search-bar-compact-input"
                placeholder=" "
              />
            </div>
          </>
        ) : (
          <div className="search-bar-compact-field search-bar-compact-field--dates">
            <DateRangePicker
              arrivee={arrivee}
              depart={depart}
              onArriveeChange={setArrivee}
              onDepartChange={setDepart}
              minDate={todayISO()}
            />
          </div>
        )}

        {needsHours && (
          <>
            <div className="search-bar-compact-field">
              <label htmlFor="sb-heure-arrivee" className="search-bar-compact-label">
                <FaClock aria-hidden="true" size={13} />
                {t("home.arrivalTimeLabel")}
              </label>
              <input
                id="sb-heure-arrivee"
                name="heureArrivee"
                type="time"
                value={heureArrivee}
                onChange={(e) => setHeureArrivee(e.target.value)}
                className="search-bar-compact-input"
              />
            </div>
            <div className="search-bar-compact-field">
              <label htmlFor="sb-heure-depart" className="search-bar-compact-label">
                <FaClock aria-hidden="true" size={13} />
                {t("home.departureTimeLabel")}
              </label>
              {is24h ? (
                <>
                  <input type="text" readOnly tabIndex={-1} className="search-bar-compact-input" value={heureDepartAuto} />
                  <input type="hidden" name="heureDepart" value={heureDepartAuto} />
                </>
              ) : (
                <input
                  id="sb-heure-depart"
                  name="heureDepart"
                  type="time"
                  value={heureDepart}
                  onChange={(e) => setHeureDepart(e.target.value)}
                  className="search-bar-compact-input"
                />
              )}
            </div>
          </>
        )}

        <div className="search-bar-compact-field">
          <label className="search-bar-compact-label">
            <FaUserGroup aria-hidden="true" size={13} />
            {t("home.guestsLabel")}
          </label>
          <div ref={voyageursRef} className="search-bar-compact-voyageurs-wrap">
            <button
              type="button"
              className="search-bar-compact-input search-bar-compact-voyageurs-trigger"
              onClick={() => setVoyageursOpen(!voyageursOpen)}
            >
              <span>{guestsSummary}</span>
              <FaChevronDown aria-hidden="true" size={11} className={`search-bar-compact-chevron ${voyageursOpen ? "is-open" : ""}`} />
            </button>
          </div>
          <Popover
            open={voyageursOpen}
            onClose={() => setVoyageursOpen(false)}
            anchorRef={voyageursRef}
            align="end"
            width={260}
          >
            <div className="search-bar-compact-voyageurs-popover">
              {guestFields.map((g) => (
                <div key={g.nameKey} className="sb-guest-row">
                  <span className="sb-guest-label">{t(g.nameKey)}</span>
                  <div className="sb-guest-stepper">
                    <button
                      type="button"
                      className="sb-guest-btn"
                      disabled={g.value <= g.min}
                      onClick={() => changeGuest(g.setter, g.min, -1, g.value)}
                      aria-label={`${t("home.stepperReduce")} ${t(g.partitiveKey)}`}
                    >
                      −
                    </button>
                    <span className="sb-guest-value">{g.value}</span>
                    <button
                      type="button"
                      className="sb-guest-btn"
                      disabled={g.value >= 9}
                      onClick={() => changeGuest(g.setter, g.min, 1, g.value)}
                      aria-label={`${t("home.stepperIncrease")} ${t(g.partitiveKey)}`}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Popover>
          <input type="hidden" name="adultes" value={adultes} />
          <input type="hidden" name="enfants" value={enfants} />
          <input type="hidden" name="bebes" value={bebes} />
        </div>

        <div className="search-bar-compact-field">
          <label className="search-bar-compact-label">{t("home.stayTypeLabel")}</label>
          <Select
            variant="field"
            ariaLabel={t("home.stayTypeAria")}
            name="typeReservation"
            options={SEJOUR_ENTRIES.map(([value, key]) => ({ value, label: t(`home.${key}`) }))}
            value={typeReservation}
            onChange={setTypeReservation}
          />
        </div>

        <div className="search-bar-compact-field">
          <label className="search-bar-compact-label">{t("search.propertyTypeShort")}</label>
          <Select
            variant="field"
            ariaLabel={t("home.propertyTypeAria")}
            name="type"
            options={TYPE_ENTRIES.map(([value, key]) => ({ value, label: t(key) }))}
            value={type}
            onChange={setType}
          />
        </div>
      </div>

      <button type="submit" className="search-bar-compact-submit">
        {t("home.searchButton")}
      </button>
    </form>
  );
}
