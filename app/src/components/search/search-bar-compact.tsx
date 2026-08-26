"use client";

import { useState, useRef, useEffect } from "react";
import { FaCalendarDays, FaClock, FaUserGroup, FaChevronDown } from "react-icons/fa6";
import { Select } from "@/components/ui/select";

const SEJOUR_TYPES = [
  { value: "nuee", label: "Nuitée(s)" },
  { value: "journee", label: "Journée" },
  { value: "vingt_quatre_heures", label: "24 heures" },
  { value: "demi_journee", label: "Demi-journée" },
  { value: "plusieurs_heures", label: "Quelques heures" },
];

const NEEDS_HOURS = new Set(["vingt_quatre_heures", "plusieurs_heures"]);

const TYPE_OPTIONS = [
  { value: "", label: "Tous les types" },
  { value: "chambre", label: "Chambre" },
  { value: "chambre_avec_salon", label: "Chambre avec salon" },
  { value: "studio", label: "Studio" },
  { value: "appartement_meuble", label: "Appartement meublé" },
  { value: "suite", label: "Suite" },
  { value: "villa", label: "Villa" },
  { value: "duplex", label: "Duplex" },
  { value: "maison_entiere", label: "Maison entière" },
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

  const needsHours = NEEDS_HOURS.has(typeReservation);
  const is24h = typeReservation === "vingt_quatre_heures";

  const heureDepartAuto = (() => {
    const [h, m] = heureArrivee.split(":").map(Number);
    const next = (h + 24) % 24;
    return `${String(next).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  })();

  useEffect(() => {
    if (!voyageursOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!voyageursRef.current?.contains(e.target as Node)) setVoyageursOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVoyageursOpen(false);
    };
    window.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [voyageursOpen]);

  const guestsSummary = [
    `${adultes} ${adultes > 1 ? "adultes" : "adulte"}`,
    enfants > 0 ? `${enfants} ${enfants > 1 ? "enfants" : "enfant"}` : null,
    bebes > 0 ? `${bebes} ${bebes > 1 ? "bébés" : "bébé"}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const changeGuest = (setter: (v: number) => void, min: number, delta: number, current: number) => {
    setter(Math.max(min, Math.min(9, current + delta)));
  };

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
    <form className="search-bar-compact" action={buildUrl()} method="get">
      <div className="search-bar-compact-fields">
        <div className="search-bar-compact-field">
          <label htmlFor="sb-arrivee" className="search-bar-compact-label">
            <FaCalendarDays aria-hidden="true" size={13} />
            Arrivée
          </label>
          <input
            id="sb-arrivee"
            name="arrivee"
            type="date"
            value={arrivee}
            min={todayISO()}
            onChange={(e) => setArrivee(e.target.value)}
            className="search-bar-compact-input"
          />
        </div>

        <div className="search-bar-compact-field">
          <label htmlFor="sb-depart" className="search-bar-compact-label">
            <FaCalendarDays aria-hidden="true" size={13} />
            Départ
          </label>
          <input
            id="sb-depart"
            name="depart"
            type="date"
            value={depart}
            min={arrivee || todayISO()}
            onChange={(e) => setDepart(e.target.value)}
            className="search-bar-compact-input"
          />
        </div>

        {needsHours && (
          <>
            <div className="search-bar-compact-field">
              <label htmlFor="sb-heure-arrivee" className="search-bar-compact-label">
                <FaClock aria-hidden="true" size={13} />
                Heure arrivée
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
                Heure départ
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
            Voyageurs
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
            {voyageursOpen && (
              <div className="search-bar-compact-voyageurs-popover">
                {[
                  { label: "Adultes", min: 1, value: adultes, setter: setAdultes },
                  { label: "Enfants", min: 0, value: enfants, setter: setEnfants },
                  { label: "Bébés", min: 0, value: bebes, setter: setBebes },
                ].map((g) => (
                  <div key={g.label} className="sb-guest-row">
                    <span className="sb-guest-label">{g.label}</span>
                    <div className="sb-guest-stepper">
                      <button
                        type="button"
                        className="sb-guest-btn"
                        disabled={g.value <= g.min}
                        onClick={() => changeGuest(g.setter, g.min, -1, g.value)}
                        aria-label={`Moins de ${g.label.toLowerCase()}`}
                      >
                        −
                      </button>
                      <span className="sb-guest-value">{g.value}</span>
                      <button
                        type="button"
                        className="sb-guest-btn"
                        disabled={g.value >= 9}
                        onClick={() => changeGuest(g.setter, g.min, 1, g.value)}
                        aria-label={`Plus de ${g.label.toLowerCase()}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <input type="hidden" name="adultes" value={adultes} />
          <input type="hidden" name="enfants" value={enfants} />
          <input type="hidden" name="bebes" value={bebes} />
        </div>

        <div className="search-bar-compact-field">
          <label className="search-bar-compact-label">Séjour</label>
          <Select
            variant="field"
            ariaLabel="Type de séjour"
            name="typeReservation"
            options={SEJOUR_TYPES}
            value={typeReservation}
            onChange={setTypeReservation}
          />
        </div>

        <div className="search-bar-compact-field">
          <label className="search-bar-compact-label">Type</label>
          <Select
            variant="field"
            ariaLabel="Type de logement"
            name="type"
            options={TYPE_OPTIONS}
            value={type}
            onChange={setType}
          />
        </div>
      </div>

      <button type="submit" className="search-bar-compact-submit">
        Rechercher
      </button>
    </form>
  );
}
