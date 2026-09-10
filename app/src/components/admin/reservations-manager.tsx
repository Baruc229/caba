"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaFlagCheckered,
  FaMagnifyingGlass,
  FaXmark,
  FaRotate,
  FaBan,
} from "react-icons/fa6";

/* ─── Libellés / badges ─── */

export const STATUT_BADGE: Record<string, string> = {
  demande_en_attente: "bo-badge--orange",
  reservation_temporaire: "bo-badge--orange",
  en_attente_paiement: "bo-badge--orange",
  confirmee: "bo-badge--green",
  payee: "bo-badge--green",
  modifiee: "bo-badge--blue",
  annulee: "bo-badge--red",
  terminee: "bo-badge--gray",
};

export const STATUT_LABEL: Record<string, string> = {
  demande_en_attente: "En attente",
  reservation_temporaire: "Temporaire",
  en_attente_paiement: "Paiement en attente",
  confirmee: "Confirmée",
  payee: "Payée",
  modifiee: "Modifiée",
  annulee: "Annulée",
  terminee: "Terminée",
};

const SOURCE_LABEL: Record<string, string> = {
  site_web: "Site web",
  whatsapp: "WhatsApp",
  manuelle: "Manuelle",
  ical: "iCal",
};

const TYPE_LABEL: Record<string, string> = {
  heure: "Heure",
  plusieurs_heures: "Plusieurs heures",
  demi_journee: "Demi-journée",
  journee: "Journée",
  nuee: "Nuitée",
  vingt_quatre_heures: "24 heures",
  semaine: "Semaine",
  mois: "Mois",
};

const PAIEMENT_BADGE: Record<string, string> = {
  en_attente: "bo-badge--orange",
  confirme: "bo-badge--green",
  echoue: "bo-badge--red",
  rembourse: "bo-badge--blue",
};

const PAIEMENT_LABEL: Record<string, string> = {
  en_attente: "En attente",
  confirme: "Confirmé",
  echoue: "Échoué",
  rembourse: "Remboursé",
};

const MOYEN_LABEL: Record<string, string> = {
  carte_bancaire: "Carte bancaire",
  paypal: "PayPal",
  virement_bancaire: "Virement",
  autre: "Autre",
};

const HIST_LABEL: Record<string, string> = {
  creation: "Création",
  modification: "Modification",
  annulation: "Annulation",
  confirmation: "Confirmation",
  paiement: "Paiement",
};

/* ─── Types ─── */

interface BookingRow {
  id: string;
  numero: string;
  statut: string;
  logement: string;
  typeLogement: string;
  ville: string;
  client: string;
  clientEmail: string;
  arrivee: string;
  depart: string;
  voyageurs: number;
  montant: number;
  devise: string;
  source: string;
  creeLe: string;
}

interface BookingDetail extends Omit<BookingRow, "client"> {
  typeReservation: string;
  heureArrivee: string | null;
  heureDepart: string | null;
  nombreAdultes: number;
  nombreEnfants: number;
  nombreBebes: number;
  prixSejour: number;
  fraisMenage: number;
  taxeSejour: number;
  supplements: number;
  reductions: number;
  prixTotal: number;
  notesInternes: string | null;
  motifAnnulation: string | null;
  property: { id: string; nom: string; type: string; ville: string; adresse: string };
  client: { id: string; prenom: string; nom: string; email: string; telephone: string | null };
  paiements: {
    id: string;
    numero: string;
    montant: number;
    devise: string;
    statut: string;
    moyenPaiement: string;
    datePaiement: string | null;
    createdAt: string;
  }[];
  historique: { id: string; action: string; details: unknown; createdAt: string }[];
}

interface PropertyOption {
  id: string;
  nom: string;
}

/* ─── Helpers ─── */

function fmtMoney(n: number): string {
  return new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n);
}

function fmtDate(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })} ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
}

const EMPTY_FILTERS = { status: "", propertyId: "", search: "", from: "", to: "" };

function trapTabFocus(event: KeyboardEvent, container: HTMLElement | null) {
  if (event.key !== "Tab" || !container) return;
  const focusables = Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => el.offsetParent !== null || el === document.activeElement);
  if (focusables.length === 0) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: 7 }).map((__, j) => (
            <td key={j}>
              <div
                className="bo-skeleton bo-skeleton-text"
                style={{ width: j === 0 || j === 1 ? "70%" : "40%" }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/* ─── Composant ─── */

export function ReservationsManager() {
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [properties, setProperties] = useState<PropertyOption[]>([]);

  const [detail, setDetail] = useState<BookingDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const [cancelTarget, setCancelTarget] = useState<{ id: string; numero: string } | null>(null);
  const [motif, setMotif] = useState("");

  const pageSize = 25;
  const detailModalRef = useRef<HTMLDivElement>(null);
  const cancelModalRef = useRef<HTMLDivElement>(null);
  const detailTriggerRef = useRef<HTMLButtonElement | null>(null);
  const cancelTriggerRef = useRef<HTMLButtonElement | null>(null);

  const pageSizeRef = useRef(pageSize);
  pageSizeRef.current = pageSize;

  /* ─── Chargement liste ─── */
  const fetchList = useCallback(
    (pageNum: number, filtersToApply: typeof EMPTY_FILTERS) => {
      const params = new URLSearchParams();
      params.set("page", String(pageNum));
      params.set("limit", String(pageSizeRef.current));
      if (filtersToApply.status) params.set("status", filtersToApply.status);
      if (filtersToApply.propertyId) params.set("propertyId", filtersToApply.propertyId);
      if (filtersToApply.search) params.set("search", filtersToApply.search);
      if (filtersToApply.from) params.set("from", filtersToApply.from);
      if (filtersToApply.to) params.set("to", filtersToApply.to);

      fetch(`/api/admin/bookings?${params.toString()}`)
        .then((res) => {
          if (!res.ok) throw new Error("Erreur de chargement");
          return res.json();
        })
        .then((data) => {
          setRows(data.bookings);
          setTotal(data.total);
          setPage(data.page);
          setError(null);
          setLoading(false);
        })
        .catch((e) => {
          setError(e instanceof Error ? e.message : "Erreur inconnue");
          setLoading(false);
        });
    },
    []
  );

  const load = useCallback(
    (pageNum: number, filtersToApply: typeof EMPTY_FILTERS) => {
      setLoading(true);
      setBanner(null);
      fetchList(pageNum, filtersToApply);
    },
    [fetchList]
  );

  const closeDetail = useCallback(() => {
    setDetail(null);
    const trigger = detailTriggerRef.current;
    detailTriggerRef.current = null;
    if (trigger && document.contains(trigger)) trigger.focus();
  }, []);

  const closeCancel = useCallback(() => {
    setCancelTarget(null);
    const trigger = cancelTriggerRef.current;
    cancelTriggerRef.current = null;
    if (trigger && document.contains(trigger)) trigger.focus();
  }, []);

  /* Chargement initial de la liste (filtre statut possible via l'URL) */
  useEffect(() => {
    const statut = new URLSearchParams(window.location.search).get("statut");
    if (statut && statut in STATUT_LABEL) {
      const init = { ...EMPTY_FILTERS, status: statut };
      Promise.resolve().then(() => {
        setFilters(init);
        setAppliedFilters(init);
      });
      fetchList(1, init);
      history.replaceState(null, "", window.location.pathname);
    } else {
      fetchList(1, EMPTY_FILTERS);
    }
  }, [fetchList]);

  /* ─── Chargement des logements pour le filtre ─── */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/properties?limit=200");
        if (res.ok) {
          const data = await res.json();
          setProperties(data.properties);
        }
      } catch {
        // filtre logement indisponible : ignoré
      }
    })();
  }, []);

  /* ─── Ouverture détail via ?id= dans l'URL (liens depuis le dashboard) ─── */
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (id) {
      openDetail(id);
      history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  /* ─── Focus modale ─── */
  useEffect(() => {
    if (detail) {
      detailModalRef.current?.querySelector<HTMLElement>(".bo-icon-btn")?.focus();
    }
  }, [detail]);

  useEffect(() => {
    if (cancelTarget) {
      cancelModalRef.current?.querySelector<HTMLButtonElement>(".bo-btn--secondary")?.focus();
    }
  }, [cancelTarget]);

  /* Escape + trap de focus au niveau document : fonctionne quel que soit le focus */
  useEffect(() => {
    if (!detail || cancelTarget) return;
    const container = detailModalRef.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeDetail();
      } else {
        trapTabFocus(e, container);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [detail, cancelTarget, closeDetail]);

  useEffect(() => {
    if (!cancelTarget) return;
    const container = cancelModalRef.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeCancel();
      } else {
        trapTabFocus(e, container);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [cancelTarget, closeCancel]);

  async function openDetail(id: string) {
    setDetailLoading(true);
    setDetail(null);
    try {
      const res = await fetch(`/api/admin/bookings?id=${id}`);
      if (!res.ok) throw new Error("Impossible de charger la réservation");
      const data = await res.json();
      setNotes(data.booking.notesInternes ?? "");
      setDetail(data.booking);
    } catch (e) {
      setBanner({ type: "error", text: e instanceof Error ? e.message : "Erreur inconnue" });
    } finally {
      setDetailLoading(false);
    }
  }

  async function runAction(id: string, action: "confirmer" | "payer" | "terminer", label: string) {
    setBusy(id);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setBanner({ type: "error", text: body.error ?? "Action impossible" });
        return;
      }
      await Promise.all([load(page, appliedFilters), detail ? openDetail(id) : Promise.resolve()]);
      const numero = body.booking?.numero ? ` : ${body.booking.numero}` : "";
      setBanner({ type: "success", text: `${label}${numero}` });
    } catch {
      setBanner({ type: "error", text: "Erreur réseau." });
    } finally {
      setBusy(null);
    }
  }

  async function confirmCancel() {
    if (!cancelTarget) return;
    const numero = cancelTarget.numero;
    setBusy(cancelTarget.id);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cancelTarget.id, action: "annuler", motifAnnulation: motif.trim() || undefined }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setBanner({ type: "error", text: body.error ?? "Annulation impossible" });
        return;
      }
      await Promise.all([load(page, appliedFilters), detail ? openDetail(cancelTarget.id) : Promise.resolve()]);
      setBanner({ type: "success", text: `${numero} annulée.` });
      setCancelTarget(null);
      setMotif("");
    } catch {
      setBanner({ type: "error", text: "Erreur réseau." });
    } finally {
      setBusy(null);
    }
  }

  async function saveNotes() {
    if (!detail) return;
    setBusy("notes");
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: detail.id, action: "notes", notesInternes: notes.trim() || null }),
      });
      if (!res.ok) throw new Error("Erreur");
      setBanner({ type: "success", text: "Notes internes enregistrées." });
      setDetail((d) => (d ? { ...d, notesInternes: notes.trim() || null } : d));
    } catch {
      setBanner({ type: "error", text: "Impossible d'enregistrer les notes." });
    } finally {
      setBusy(null);
    }
  }

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setAppliedFilters(filters);
    load(1, filters);
  }

  function resetFilters() {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setPage(1);
    load(1, EMPTY_FILTERS);
  }

  const hasAppliedFilters =
    appliedFilters.status !== "" ||
    appliedFilters.propertyId !== "" ||
    appliedFilters.search !== "" ||
    appliedFilters.from !== "" ||
    appliedFilters.to !== "";

  const canOffer = (statut: string) => ["demande_en_attente", "reservation_temporaire", "en_attente_paiement"].includes(statut);
  const canPay = (statut: string) => ["confirmee", "modifiee"].includes(statut);
  const canFinish = (statut: string) => ["confirmee", "payee"].includes(statut);
  const canCancel = (statut: string) => !["annulee", "terminee"].includes(statut);

  return (
    <div>
      <div className="bo-page-head">
        <div>
          <h2 className="bo-page-title">Réservations</h2>
          <p className="bo-page-desc">
            Suivez, confirmez et annulez les réservations du complexe.
          </p>
        </div>
      </div>

      {/* ─── Filtres ─── */}
      <form className="bo-card bo-filters-bar" onSubmit={applyFilters}>
        <div className="bo-filters-row">
          <label className="bo-filter-field">
            <span className="bo-label">Recherche</span>
            <div className="bo-filter-search">
              <FaMagnifyingGlass size={13} aria-hidden="true" />
              <input
                type="text"
                className="bo-input"
                placeholder="Client, numéro, logement…"
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              />
            </div>
          </label>

          <label className="bo-filter-field">
            <span className="bo-label">Statut</span>
            <select
              className="bo-select"
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="">Tous</option>
              {Object.entries(STATUT_LABEL).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>

          <label className="bo-filter-field">
            <span className="bo-label">Logement</span>
            <select
              className="bo-select"
              value={filters.propertyId}
              onChange={(e) => setFilters((f) => ({ ...f, propertyId: e.target.value }))}
            >
              <option value="">Tous</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.nom}</option>
              ))}
            </select>
          </label>

          <label className="bo-filter-field">
            <span className="bo-label">Arrivée dès le</span>
            <input
              type="date"
              className="bo-input"
              value={filters.from}
              onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
            />
          </label>

          <label className="bo-filter-field">
            <span className="bo-label">Départ jusqu&apos;au</span>
            <input
              type="date"
              className="bo-input"
              value={filters.to}
              onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
            />
          </label>

          <div className="bo-filters-actions">
            <button type="submit" className="bo-btn bo-btn--primary">
              <FaMagnifyingGlass aria-hidden="true" />
              Filtrer
            </button>
            <button type="button" className="bo-btn bo-btn--secondary" onClick={resetFilters}>
              <FaRotate aria-hidden="true" />
              Réinitialiser
            </button>
          </div>
        </div>
      </form>

      {banner && (
        <p
          className={`bo-form-${banner.type === "success" ? "success" : "error"}`}
          style={{ margin: "14px 18px 0", gridArea: "unset" }}
          role={banner.type === "success" ? "status" : "alert"}
        >
          {banner.text}
        </p>
      )}

      {error && (
        <p className="bo-form-error" style={{ margin: "14px 18px 0" }} role="alert">
          {error}
        </p>
      )}

      {/* ─── Tableau ─── */}
      <div className="bo-card" style={{ marginTop: 14 }}>
        <div className="bo-card-header">
          <h3 className="bo-card-title">
            {total} réservation{total > 1 ? "s" : ""}
          </h3>
          {loading && rows.length > 0 && (
            <span className="bo-loading-hint" role="status">
              Mise à jour…
            </span>
          )}
        </div>

        <div className="bo-table-wrap" aria-busy={loading && rows.length === 0}>
          <table className="bo-table">
            <thead>
              <tr>
                <th scope="col">Réservation</th>
                <th scope="col">Client</th>
                <th scope="col">Séjour</th>
                <th scope="col">Voy.</th>
                <th scope="col">Total</th>
                <th scope="col">Statut</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && rows.length === 0 ? (
                <SkeletonRows />
              ) : error && rows.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="bo-empty">
                      <h3 className="bo-empty-title">Chargement impossible</h3>
                      <p>{error}</p>
                      <button
                        type="button"
                        className="bo-btn bo-btn--secondary"
                        style={{ marginTop: 14 }}
                        onClick={() => load(page, appliedFilters)}
                      >
                        <FaRotate aria-hidden="true" />
                        Réessayer
                      </button>
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="bo-empty">
                      <h3 className="bo-empty-title">Aucune réservation</h3>
                      <p>
                        {hasAppliedFilters
                          ? "Aucune réservation ne correspond à vos filtres."
                          : "Ajustez vos filtres ou créez une nouvelle réservation."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong className="bo-table-property-name">{row.numero}</strong>
                      <div className="bo-table-sub">{row.logement}</div>
                    </td>
                    <td>
                      {row.client}
                      <div className="bo-table-sub">{row.clientEmail}</div>
                    </td>
                    <td>
                      {fmtDate(row.arrivee)} → {fmtDate(row.depart)}
                    </td>
                    <td>{row.voyageurs}</td>
                    <td>
                      {fmtMoney(row.montant)} {row.devise}
                    </td>
                    <td>
                      <span className={`bo-badge ${STATUT_BADGE[row.statut] ?? "bo-badge--gray"}`}>
                        {STATUT_LABEL[row.statut] ?? row.statut}
                      </span>
                    </td>
                    <td>
                      <div className="bo-table-actions">
                        <button
                          type="button"
                          className="bo-btn bo-btn--secondary"
                          onClick={(e) => {
                            detailTriggerRef.current = e.currentTarget;
                            openDetail(row.id);
                          }}
                        >
                          Détails
                        </button>
                        {canOffer(row.statut) && (
                          <button
                            type="button"
                            className="bo-btn bo-btn--green"
                            onClick={() => runAction(row.id, "confirmer", "Réservation confirmée")}
                            disabled={busy === row.id}
                            title="Confirmer la réservation"
                            aria-label="Confirmer la réservation"
                          >
                            <FaCheck aria-hidden="true" />
                            <span className="bo-btn-label">Confirmer</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Pagination ─── */}
        {!loading && total > pageSize && (
          <div className="bo-pagination">
            <button
              type="button"
              className="bo-btn bo-btn--secondary"
              disabled={page <= 1}
              onClick={() => load(page - 1, appliedFilters)}
            >
              <FaArrowLeft aria-hidden="true" />
              Précédent
            </button>
            <span className="bo-pagination-info">
              Page {page} · {Math.ceil(total / pageSize) || 1}
            </span>
            <button
              type="button"
              className="bo-btn bo-btn--secondary"
              disabled={page >= Math.ceil(total / pageSize)}
              onClick={() => load(page + 1, appliedFilters)}
            >
              Suivant
              <FaArrowRight aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* ─── Modale détail ─── */}
      {(detail || detailLoading) && (
        <>
          <button
            type="button"
            className="bo-backdrop bo-modal-backdrop"
            aria-label="Fermer"
            tabIndex={-1}
            aria-hidden={cancelTarget ? "true" : undefined}
            style={cancelTarget ? { pointerEvents: "none", opacity: 0.4 } : undefined}
            onClick={closeDetail}
          />
          <div
            ref={detailModalRef}
            className="bo-modal bo-modal--wide"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reservation-detail-title"
            aria-busy={detailLoading || undefined}
            inert={!!cancelTarget}
          >
            <div className="bo-modal-header">
              <h4 id="reservation-detail-title" className="bo-card-title">
                Réservation {detail?.numero ?? "…"}
              </h4>
              <button type="button" className="bo-icon-btn" aria-label="Fermer" onClick={closeDetail}>
                <FaXmark aria-hidden="true" />
              </button>
            </div>

            {detailLoading || !detail ? (
              <div className="bo-modal-body">
                <div className="bo-skeleton bo-skeleton-chart" />
              </div>
            ) : (
              <>
                <div className="bo-modal-body">
                  <div className="bo-res-detail-grid">
                    {/* Colonne gauche : client + séjour */}
                    <div>
                      <div className="bo-res-detail-block">
                        <span className="bo-label">Client</span>
                        <p className="bo-res-detail-strong">
                          {detail.client.prenom} {detail.client.nom}
                        </p>
                        <p className="bo-res-detail-sub">{detail.client.email}</p>
                        {detail.client.telephone && (
                          <p className="bo-res-detail-sub">{detail.client.telephone}</p>
                        )}
                      </div>

                      <div className="bo-res-detail-block">
                        <span className="bo-label">Logement</span>
                        <p className="bo-res-detail-strong">{detail.property.nom}</p>
                        <p className="bo-res-detail-sub">
                          {detail.property.adresse} · {detail.property.ville}
                        </p>
                        <p className="bo-res-detail-sub">
                          Type : {TYPE_LABEL[detail.typeReservation] ?? detail.typeReservation} · Source : {SOURCE_LABEL[detail.source] ?? detail.source}
                        </p>
                      </div>

                      <div className="bo-res-detail-block">
                        <span className="bo-label">Séjour</span>
                        <p className="bo-res-detail-strong">
                          {fmtDate(detail.arrivee)} → {fmtDate(detail.depart)}
                        </p>
                        <p className="bo-res-detail-sub">
                          {detail.heureArrivee ? `Arrivée ${detail.heureArrivee}` : ""}
                          {detail.heureDepart ? ` · Départ ${detail.heureDepart}` : ""}
                        </p>
                        <p className="bo-res-detail-sub">
                          {detail.nombreAdultes} adulte{detail.nombreAdultes > 1 ? "s" : ""}
                          {detail.nombreEnfants > 0 ? ` · ${detail.nombreEnfants} enfant(s)` : ""}
                          {detail.nombreBebes > 0 ? ` · ${detail.nombreBebes} bébé(s)` : ""}
                        </p>
                        <p className="bo-res-detail-sub">Créée le {fmtDateTime(detail.creeLe)}</p>
                      </div>

                      {detail.motifAnnulation && (
                        <div className="bo-res-detail-block">
                          <span className="bo-label">Motif d&apos;annulation</span>
                          <p className="bo-res-detail-sub">{detail.motifAnnulation}</p>
                        </div>
                      )}
                    </div>

                    {/* Colonne droite : prix + actions */}
                    <div>
                      <div className="bo-res-detail-block">
                        <span className="bo-label">Montants ({detail.devise})</span>
                        <div className="bo-res-price-line">
                          <span>Séjour</span>
                          <span>{fmtMoney(detail.prixSejour)}</span>
                        </div>
                        {detail.fraisMenage > 0 && (
                          <div className="bo-res-price-line">
                            <span>Ménage</span>
                            <span>{fmtMoney(detail.fraisMenage)}</span>
                          </div>
                        )}
                        {detail.taxeSejour > 0 && (
                          <div className="bo-res-price-line">
                            <span>Taxe de séjour</span>
                            <span>{fmtMoney(detail.taxeSejour)}</span>
                          </div>
                        )}
                        {detail.supplements > 0 && (
                          <div className="bo-res-price-line">
                            <span>Suppléments</span>
                            <span>{fmtMoney(detail.supplements)}</span>
                          </div>
                        )}
                        {detail.reductions > 0 && (
                          <div className="bo-res-price-line bo-res-price-line--discount">
                            <span>Réductions</span>
                            <span>−{fmtMoney(detail.reductions)}</span>
                          </div>
                        )}
                        <div className="bo-res-price-total">
                          <span>Total</span>
                          <strong>{fmtMoney(detail.prixTotal)} {detail.devise}</strong>
                        </div>
                      </div>

                      <div className="bo-res-detail-block">
                        <span className="bo-label">Actions rapides</span>
                        <div className="bo-res-detail-actions">
                          {canOffer(detail.statut) && (
                            <button
                              type="button"
                              className="bo-btn bo-btn--green"
                              onClick={() => runAction(detail.id, "confirmer", "Réservation confirmée")}
                              disabled={busy === detail.id}
                            >
                              <FaCheck aria-hidden="true" />
                              Confirmer
                            </button>
                          )}
                          {canPay(detail.statut) && (
                            <button
                              type="button"
                              className="bo-btn bo-btn--primary"
                              onClick={() => runAction(detail.id, "payer", "Paiement enregistré")}
                              disabled={busy === detail.id}
                            >
                              Marquer payée
                            </button>
                          )}
                          {canFinish(detail.statut) && (
                            <button
                              type="button"
                              className="bo-btn bo-btn--secondary"
                              onClick={() => runAction(detail.id, "terminer", "Réservation terminée")}
                              disabled={busy === detail.id}
                            >
                              <FaFlagCheckered aria-hidden="true" />
                              Terminer
                            </button>
                          )}
                          {canCancel(detail.statut) && (
                            <button
                              type="button"
                              className="bo-btn bo-btn--danger"
                              onClick={() => {
                                cancelTriggerRef.current = document.activeElement as HTMLButtonElement | null;
                                setMotif("");
                                setCancelTarget({ id: detail.id, numero: detail.numero });
                              }}
                              disabled={busy === detail.id}
                            >
                              <FaBan aria-hidden="true" />
                              Annuler
                            </button>
                          )}
                        </div>
                        <span className={`bo-badge ${STATUT_BADGE[detail.statut] ?? "bo-badge--gray"}`}>
                          {STATUT_LABEL[detail.statut] ?? detail.statut}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes internes */}
                  <div className="bo-field" style={{ marginTop: 14 }}>
                    <label htmlFor="bo-notes" className="bo-label">
                      Notes internes
                    </label>
                    <textarea
                      id="bo-notes"
                      className="bo-textarea"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Observations visibles uniquement par l'équipe…"
                    />
                    <div style={{ marginTop: 8 }}>
                      <button
                        type="button"
                        className="bo-btn bo-btn--secondary"
                        onClick={saveNotes}
                        disabled={busy === "notes"}
                      >
                        Enregistrer
                      </button>
                    </div>
                  </div>

                  {/* Paiements */}
                  <div className="bo-res-detail-block" style={{ marginTop: 14 }}>
                    <span className="bo-label">Paiements ({detail.paiements.length})</span>
                    {detail.paiements.length === 0 ? (
                      <p className="bo-res-detail-sub">Aucun paiement enregistré.</p>
                    ) : (
                      <ul className="bo-res-payments">
                        {detail.paiements.map((p) => (
                          <li key={p.id} className="bo-res-payment">
                            <div>
                              <strong>{p.numero}</strong>
                              <div className="bo-res-detail-sub">
                                {MOYEN_LABEL[p.moyenPaiement] ?? p.moyenPaiement} · {p.datePaiement ? fmtDate(p.datePaiement) : fmtDateTime(p.createdAt)}
                              </div>
                            </div>
                            <div className="bo-res-payment-right">
                              <span className="bo-list-item-amount">{fmtMoney(p.montant)} {p.devise}</span>
                              <span className={`bo-badge ${PAIEMENT_BADGE[p.statut] ?? "bo-badge--gray"}`}>
                                {PAIEMENT_LABEL[p.statut] ?? p.statut}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Historique */}
                  {detail.historique.length > 0 && (
                    <div className="bo-res-detail-block" style={{ marginTop: 14 }}>
                      <span className="bo-label">Historique</span>
                      <ul className="bo-res-timeline">
                        {detail.historique.map((h) => (
                          <li key={h.id} className="bo-res-timeline-item">
                            <span className="bo-res-timeline-dot" aria-hidden="true" />
                            <div>
                              <strong>{HIST_LABEL[h.action] ?? h.action}</strong>
                              <div className="bo-res-detail-sub">{fmtDateTime(h.createdAt)}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="bo-modal-footer">
                  <button type="button" className="bo-btn bo-btn--secondary" onClick={closeDetail}>
                    Fermer
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* ─── Modale annulation ─── */}
      {cancelTarget && (
        <>
          <button
            type="button"
            className="bo-backdrop bo-modal-backdrop"
            aria-label="Fermer"
            onClick={closeCancel}
          />
          <div
            ref={cancelModalRef}
            className="bo-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-booking-title"
            aria-describedby="cancel-booking-desc"
          >
            <div className="bo-modal-header">
              <h4 id="cancel-booking-title" className="bo-card-title">
                Annuler {cancelTarget.numero} ?
              </h4>
              <button type="button" className="bo-icon-btn" aria-label="Fermer" onClick={closeCancel}>
                <FaXmark aria-hidden="true" />
              </button>
            </div>
            <div className="bo-modal-body">
              <p id="cancel-booking-desc">
                La réservation sera annulée et les disponibilités libérées. Cette action est
                définitive.
              </p>
              <label htmlFor="bo-motif" className="bo-label" style={{ marginTop: 12, display: "block" }}>
                Motif (optionnel)
              </label>
              <textarea
                id="bo-motif"
                className="bo-textarea"
                rows={3}
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="Ex : annulation à la demande du client…"
              />
            </div>
            <div className="bo-modal-footer">
              <button type="button" className="bo-btn bo-btn--secondary" onClick={closeCancel}>
                Retour
              </button>
              <button
                type="button"
                className="bo-btn bo-btn--danger"
                onClick={confirmCancel}
                disabled={busy === cancelTarget.id}
              >
                {busy === cancelTarget.id ? "Annulation…" : "Confirmer l'annulation"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}