"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaXmark,
  FaCalendarDays,
  FaTriangleExclamation,
} from "react-icons/fa6";

/* ─── Types ─── */

interface CalProperty {
  id: string;
  nom: string;
  type: string;
  ville: string;
}

interface CalBooking {
  id: string;
  numero: string;
  propertyId: string;
  arrivee: string;
  depart: string;
  statut: string;
  client: string;
  montant: number;
  devise: string;
}

interface CalDispo {
  propertyId: string;
  date: string;
  statut: string;
}

interface DayCell {
  iso: string;
  day: number;
  weekday: number;
  isToday: boolean;
}

type CellEvent =
  | { kind: "booking"; booking: CalBooking }
  | { kind: "dispo"; dispo: CalDispo };

/* ─── Libellés ─── */

const MONTHS_FR = [
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

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

const STATUT_CELL_LABEL: Record<string, string> = {
  demande_en_attente: "Réservé (en attente)",
  reservation_temporaire: "Réservé (temporaire)",
  en_attente_paiement: "Réservé (paiement en attente)",
  confirmee: "Réservé",
  payee: "Réservé",
  modifiee: "Réservé (modifiée)",
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toISODate(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function todayISOLocal(): string {
  const d = new Date();
  return toISODate(d.getFullYear(), d.getMonth(), d.getDate());
}

function fmtCompactMoney(n: number): string {
  if (n === 0) return "0";
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return String(n);
}

/* ─── Composant ─── */

export function CalendarManager() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const [properties, setProperties] = useState<CalProperty[]>([]);
  const [bookings, setBookings] = useState<CalBooking[]>([]);
  const [disponibilites, setDisponibilites] = useState<CalDispo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<{ propertyId: string; iso: string } | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  /* ─── Chargement ─── */
  const load = useCallback((y: number, m: number) => {
    fetch(`/api/admin/calendar?month=${y}-${pad(m + 1)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Erreur de chargement");
        return res.json();
      })
      .then((data) => {
        setProperties(data.properties);
        setBookings(data.bookings);
        setDisponibilites(data.disponibilites);
        setError(null);
        setLoading(false);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Erreur inconnue");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    load(year, month);
  }, [year, month, load]);

  useEffect(() => {
    if (selected) {
      modalRef.current?.querySelector<HTMLButtonElement>(".bo-icon-btn")?.focus();
    }
  }, [selected]);

  /* ─── Jours du mois ─── */
  const days = useMemo<DayCell[]>(() => {
    const count = new Date(year, month + 1, 0).getDate();
    const today = todayISOLocal();
    const cells: DayCell[] = [];
    for (let d = 1; d <= count; d++) {
      const date = new Date(year, month, d);
      cells.push({
        iso: toISODate(year, month, d),
        day: d,
        weekday: date.getDay(),
        isToday: toISODate(year, month, d) === today,
      });
    }
    return cells;
  }, [year, month]);

  /* ─── Type de cellule ─── */
  function cellEvents(propertyId: string, iso: string): CellEvent[] {
    const list: CellEvent[] = [];
    for (const b of bookings) {
      if (b.propertyId !== propertyId) continue;
      if (b.arrivee <= iso && iso <= b.depart) {
        list.push({ kind: "booking", booking: b });
      }
    }
    for (const d of disponibilites) {
      if (d.propertyId === propertyId && d.date === iso) {
        list.push({ kind: "dispo", dispo: d });
      }
    }
    return list;
  }

  function cellMode(events: CellEvent[]): string {
    if (events.some((e) => e.kind === "dispo" && e.dispo.statut === "maintenance")) {
      return "maintenance";
    }
    if (events.some((e) => e.kind === "dispo" && e.dispo.statut === "bloque")) {
      return "bloque";
    }
    const bookings = events.filter((e) => e.kind === "booking").map((e) => (e as { kind: "booking"; booking: CalBooking }).booking);
    if (bookings.some((b) => b.statut === "confirmee" || b.statut === "payee")) return "booked";
    if (bookings.some((b) => b.statut === "modifiee")) return "modified";
    if (bookings.length > 0) return "pending";
    return "available";
  }

  function cellLabel(propertyId: string, iso: string): string {
    const events = cellEvents(propertyId, iso);
    if (events.length === 0) return "Disponible";
    return events
      .map((e) =>
        e.kind === "booking"
          ? `${e.booking.numero} · ${STATUT_CELL_LABEL[e.booking.statut] ?? e.booking.statut}`
          : e.dispo.statut === "maintenance"
            ? "Maintenance"
            : "Bloqué"
      )
      .join(" · ");
  }

  function moveMonth(delta: number) {
    const d = new Date(year, month + delta, 1);
    setLoading(true);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }

  function goToday() {
    const d = new Date();
    setLoading(true);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }

  /* ─── Événements d'une cellule sélectionnée ─── */
  const selectedEvents = useMemo<CellEvent[]>(() => {
    if (!selected) return [];
    return cellEvents(selected.propertyId, selected.iso);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, bookings, disponibilites]);

  const selectedProperty = selected
    ? properties.find((p) => p.id === selected.propertyId)
    : null;

  const gridCols = `180px repeat(${days.length}, 34px)`;

  return (
    <div>
      <div className="bo-page-head">
        <div>
          <h2 className="bo-page-title">Calendrier</h2>
          <p className="bo-page-desc">
            Vue mensuelle des occupations par logement.
          </p>
        </div>
      </div>

      <div className="bo-card bo-cal-toolbar">
        <div className="bo-cal-nav">
          <button type="button" className="bo-btn bo-btn--secondary" onClick={() => moveMonth(-1)} aria-label="Mois précédent">
            <FaArrowLeft aria-hidden="true" />
          </button>
          <button type="button" className="bo-btn bo-btn--secondary" onClick={() => moveMonth(1)} aria-label="Mois suivant">
            <FaArrowRight aria-hidden="true" />
          </button>
          <h3 className="bo-cal-title">
            {MONTHS_FR[month]} {year}
          </h3>
          <button type="button" className="bo-btn bo-btn--ghost" onClick={goToday}>
            Aujourd&apos;hui
          </button>
        </div>

        <ul className="bo-cal-legend" aria-label="Légende">
          <li><span className="bo-cal-legend-dot bo-cal-dot--available" /> Disponible</li>
          <li><span className="bo-cal-legend-dot bo-cal-dot--booked" /> Réservé</li>
          <li><span className="bo-cal-legend-dot bo-cal-dot--pending" /> En attente</li>
          <li><span className="bo-cal-legend-dot bo-cal-dot--bloque" /> Bloqué</li>
          <li><span className="bo-cal-legend-dot bo-cal-dot--maintenance" /> Maintenance</li>
        </ul>
      </div>

      {error && (
        <p className="bo-form-error" role="alert">
          {error}
        </p>
      )}

      <div className="bo-card" style={{ marginTop: 14 }}>
        <div className="bo-cal-wrap">
          <div className="bo-cal" style={{ gridTemplateColumns: gridCols }}>
            {/* En-tête : coin + jours */}
            <div className="bo-cal-corner" aria-hidden="true" />
            {days.map((d) => (
              <div
                key={d.iso}
                className={`bo-cal-day-head${d.isToday ? " is-today" : ""}${d.weekday === 0 || d.weekday === 6 ? " is-weekend" : ""}`}
                aria-hidden="true"
              >
                <span className="bo-cal-weekday">{WEEKDAYS[d.weekday]}</span>
                <strong className="bo-cal-daynum">{d.day}</strong>
              </div>
            ))}

            {/* Lignes logements */}
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bo-cal-row bo-cal-row--skeleton">
                  <div className="bo-cal-propcell">
                    <div className="bo-skeleton bo-skeleton-text" style={{ width: "70%" }} />
                  </div>
                  {days.map((d) => (
                    <div key={d.iso} className="bo-cal-scell">
                      <div className="bo-skeleton" style={{ width: "100%", height: 16 }} />
                    </div>
                  ))}
                </div>
              ))
            ) : properties.length === 0 ? (
              <div className="bo-cal-empty" style={{ gridColumn: "1 / -1" }}>
                <FaCalendarDays className="bo-empty-icon" aria-hidden="true" />
                <h3 className="bo-empty-title">Aucun logement publié</h3>
                <p>Ajoutez un logement pour voir son calendrier.</p>
              </div>
            ) : (
              properties.map((p) => {
                const cells = days.map((d) => ({ day: d, events: cellEvents(p.id, d.iso), mode: cellMode(cellEvents(p.id, d.iso)) }));
                return (
                  <div key={p.id} className="bo-cal-row">
                    <div className="bo-cal-propcell">
                      <strong className="bo-cal-propname">{p.nom}</strong>
                      <span className="bo-cal-propmeta">{p.ville}</span>
                    </div>
                    {cells.map(({ day, events, mode }) =>
                      events.length === 0 ? (
                        <div
                          key={day.iso}
                          className={`bo-cal-cell bo-cal-cell--${mode}${day.isToday ? " is-today" : ""}`}
                          title="Disponible"
                          aria-hidden="true"
                        />
                      ) : (
                        <button
                          key={day.iso}
                          type="button"
                          className={`bo-cal-cell bo-cal-cell--${mode}${day.isToday ? " is-today" : ""}`}
                          title={cellLabel(p.id, day.iso)}
                          aria-label={`${p.nom}, ${day.day} ${MONTHS_FR[month]} : ${cellLabel(p.id, day.iso)}`}
                          onClick={() => setSelected({ propertyId: p.id, iso: day.iso })}
                        />
                      )
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ─── Détail d'une journée ─── */}
      {selected && (
        <>
          <button
            type="button"
            className="bo-backdrop bo-modal-backdrop"
            aria-label="Fermer"
            onClick={() => setSelected(null)}
          />
          <div
            ref={modalRef}
            className="bo-modal bo-modal--wide"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cal-day-title"
            onKeyDown={(e) => {
              if (e.key === "Escape") setSelected(null);
            }}
          >
            <div className="bo-modal-header">
              <h4 id="cal-day-title" className="bo-card-title">
                {selectedProperty?.nom} · {Number(selected.iso.slice(8))}{" "}
                {MONTHS_FR[month].slice(0, 3) || ""} {selected.iso.slice(0, 4)}
              </h4>
              <button type="button" className="bo-icon-btn" aria-label="Fermer" onClick={() => setSelected(null)}>
                <FaXmark aria-hidden="true" />
              </button>
            </div>
            <div className="bo-modal-body">
              {selectedEvents.length === 0 ? (
                <p className="bo-res-detail-sub">Logement disponible ce jour.</p>
              ) : (
                <ul className="bo-cal-day-list">
                  {selectedEvents.map((e, i) =>
                    e.kind === "dispo" ? (
                      <li key={`d-${i}`} className="bo-cal-day-item">
                        <span
                          className={`bo-cal-day-icon bo-cal-cell--${e.dispo.statut === "maintenance" ? "maintenance" : "bloque"}`}
                          aria-hidden="true"
                        >
                          <FaTriangleExclamation size={13} />
                        </span>
                        <div>
                          <strong>
                            {e.dispo.statut === "maintenance" ? "Maintenance" : "Logement bloqué"}
                          </strong>
                          <div className="bo-res-detail-sub">Indisponibilité fixée manuellement.</div>
                        </div>
                      </li>
                    ) : (
                      <li key={e.booking.id} className="bo-cal-day-item">
                        <span className="bo-cal-day-icon bo-cal-cell--booked" aria-hidden="true">
                          <FaCalendarDays size={13} />
                        </span>
                        <div style={{ flex: 1 }}>
                          <strong>
                            {e.booking.numero} · {e.booking.client}
                          </strong>
                          <div className="bo-res-detail-sub">
                            {e.booking.arrivee.slice(8, 10)}/{e.booking.arrivee.slice(5, 7)} →{" "}
                            {e.booking.depart.slice(8, 10)}/{e.booking.depart.slice(5, 7)} ·{" "}
                            {fmtCompactMoney(e.booking.montant)} {e.booking.devise} ·{" "}
                            {(STATUT_CELL_LABEL[e.booking.statut] ?? e.booking.statut).toLowerCase()}
                          </div>
                        </div>
                        <a className="bo-btn bo-btn--secondary" href={`/admin/reservations?id=${e.booking.id}`}>
                          Ouvrir
                        </a>
                      </li>
                    )
                  )}
                </ul>
              )}
            </div>
            <div className="bo-modal-footer">
              <button type="button" className="bo-btn bo-btn--secondary" onClick={() => setSelected(null)}>
                Fermer
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}