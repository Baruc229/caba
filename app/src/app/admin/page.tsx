"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FaCalendarCheck,
  FaArrowRightToBracket,
  FaArrowRightFromBracket,
  FaHouse,
  FaHouseCircleCheck,
  FaWhatsapp,
  FaMoneyBillWave,
  FaBell,
  FaCreditCard,
  FaEye,
  FaEyeSlash,
  FaRegFolderOpen,
} from "react-icons/fa6";

/* ─── Types ─── */
interface KPIs {
  reservationsJour: number;
  arriveesJour: number;
  departsJour: number;
  logementsDisponibles: number;
  logementsOccupes: number;
  whatsappEnAttente: number;
  revenusJour: number;
  revenusSemaine: number;
  revenusMois: number;
}

interface RevenuPoint {
  date: string;
  montant: number;
}

interface OccupationPoint {
  date: string;
  taux: number;
}

interface RepartitionItem {
  type: string;
  count: number;
}

interface SourceItem {
  source: string;
  count: number;
}

interface ReservationItem {
  id: string;
  numero: string;
  logement: string;
  typeLogement: string;
  client: string;
  arrivee: string;
  depart: string;
  statut: string;
  montant: number;
}

interface NotificationItem {
  id: string;
  titre: string;
  message: string;
  type: string;
  date: string;
  lien: string | null;
}

interface PaiementItem {
  id: string;
  numero: string;
  montant: number;
  statut: string;
  statutKey: string;
  date: string;
  moyen: string;
  client: string;
  reservationNumero: string;
}

interface DashboardData {
  kpis: KPIs;
  revenusGraph: RevenuPoint[];
  occupationGraph: OccupationPoint[];
  repartitionType: RepartitionItem[];
  sourcesReservation: SourceItem[];
  dernieresReservations: ReservationItem[];
  notifications: NotificationItem[];
  paiementsRecents: PaiementItem[];
}

type Period = "jour" | "semaine" | "mois";

/* ─── Helpers ─── */
const STATUT_BADGE: Record<string, string> = {
  demande_en_attente: "bo-badge--orange",
  reservation_temporaire: "bo-badge--orange",
  en_attente_paiement: "bo-badge--orange",
  confirmee: "bo-badge--green",
  payee: "bo-badge--green",
  modifiee: "bo-badge--blue",
  annulee: "bo-badge--red",
  terminee: "bo-badge--gray",
};

const STATUT_LABEL: Record<string, string> = {
  demande_en_attente: "En attente",
  reservation_temporaire: "Temporaire",
  en_attente_paiement: "Paiement en attente",
  confirmee: "Confirmee",
  payee: "Payee",
  modifiee: "Modifiee",
  annulee: "Annulee",
  terminee: "Terminee",
};

const PAIEMENT_BADGE: Record<string, string> = {
  en_attente: "bo-badge--orange",
  confirme: "bo-badge--green",
  echoue: "bo-badge--red",
  rembourse: "bo-badge--blue",
};

function formatCFA(n: number): string {
  return new Intl.NumberFormat("fr-FR").format(n);
}

function formatDay(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

const SHORT_MONTHS = ["jan", "fev", "mar", "avr", "mai", "jun", "jul", "aout", "sep", "oct", "nov", "dec"];

const HBAR_COLORS = ["bo-hbar-fill--blue", "bo-hbar-fill--green", "bo-hbar-fill--orange", "bo-hbar-fill--red", "bo-hbar-fill--gray"];

/* ─── Widget toggle (localStorage) ─── */
const WIDGET_KEY = "caba-dashboard-hidden";

function readHiddenWidgets(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(WIDGET_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function writeHiddenWidgets(hidden: Set<string>) {
  localStorage.setItem(WIDGET_KEY, JSON.stringify([...hidden]));
}

/* ─── Skeleton components ─── */
function KpiSkeleton() {
  return (
    <div className="bo-kpi">
      <div className="bo-skeleton bo-kpi-icon" />
      <div className="bo-kpi-body" style={{ flex: 1 }}>
        <div className="bo-skeleton bo-skeleton-text" style={{ width: "70%" }} />
        <div className="bo-skeleton bo-skeleton-value" />
        <div className="bo-skeleton bo-skeleton-text" style={{ width: "50%" }} />
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bo-chart-card">
      <div className="bo-chart-header">
        <div className="bo-skeleton bo-skeleton-text--title" />
      </div>
      <div className="bo-chart-body">
        <div className="bo-skeleton bo-skeleton-chart" />
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="bo-list-card">
      <div className="bo-list-header">
        <div className="bo-skeleton bo-skeleton-text--title" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bo-skeleton-row">
          <div className="bo-skeleton bo-skeleton-avatar" />
          <div className="bo-skeleton-lines" style={{ flex: 1 }}>
            <div className="bo-skeleton bo-skeleton-text" style={{ width: "80%" }} />
            <div className="bo-skeleton bo-skeleton-text" style={{ width: "50%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Chart: Barres verticales (revenus) ─── */
function RevenueBarChart({ data, period }: { data: RevenuPoint[]; period: Period }) {
  const max = Math.max(...data.map((d) => d.montant), 1);
  const step = period === "jour" ? 1 : period === "semaine" ? 1 : 2;
  return (
    <div className="bo-bars">
      {data.map((d, i) => {
        const h = Math.max(2, (d.montant / max) * 100);
        const dayNum = new Date(d.date + "T00:00:00Z").getUTCDate();
        const showLabel = i % step === 0 || i === data.length - 1;
        return (
          <div key={d.date} className="bo-bar-col">
            <span className="bo-bar-value" title={formatCFA(d.montant)}>
              {d.montant > 0 ? formatCFA(d.montant) : ""}
            </span>
            <div className="bo-bar" style={{ height: `${h}%` }} title={`${formatDay(d.date)} : ${formatCFA(d.montant)}`} />
            <span className="bo-bar-label">{showLabel ? dayNum : ""}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Chart: Jauge circulaire (occupation) ─── */
function OccupationGauge({ data }: { data: OccupationPoint[] }) {
  const avgTaux = data.length > 0 ? Math.round(data.reduce((s, d) => s + d.taux, 0) / data.length) : 0;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (avgTaux / 100) * circumference;

  const color = avgTaux >= 75 ? "var(--bo-green)" : avgTaux >= 40 ? "var(--bo-orange)" : "var(--bo-accent)";

  const occupe = Math.round(avgTaux);
  const libre = 100 - occupe;

  return (
    <div className="bo-gauge-wrap">
      <div className="bo-gauge">
        <svg viewBox="0 0 120 120">
          <circle className="bo-gauge-bg" cx="60" cy="60" r={radius} />
          <circle
            className="bo-gauge-fill"
            cx="60"
            cy="60"
            r={radius}
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="bo-gauge-center">
          <span className="bo-gauge-value">{avgTaux}%</span>
          <span className="bo-gauge-label">moy.</span>
        </div>
      </div>
      <div className="bo-gauge-legend">
        <div className="bo-gauge-legend-item">
          <span className="bo-gauge-legend-dot" style={{ backgroundColor: color }} />
          <span>Occupe : {occupe}%</span>
        </div>
        <div className="bo-gauge-legend-item">
          <span className="bo-gauge-legend-dot" style={{ backgroundColor: "var(--bo-bg)" }} />
          <span>Libre : {libre}%</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Chart: Barres horizontales ─── */
function HorizontalBarChart({ items, maxCount }: { items: { label: string; count: number }[]; maxCount: number }) {
  return (
    <div className="bo-hbar-list">
      {items.map((item, i) => (
        <div key={item.label} className="bo-hbar-item">
          <span className="bo-hbar-label" title={item.label}>{item.label}</span>
          <div className="bo-hbar-track">
            <div
              className={`bo-hbar-fill ${HBAR_COLORS[i % HBAR_COLORS.length]}`}
              style={{ width: `${maxCount > 0 ? (item.count / maxCount) * 100 : 0}%` }}
            />
          </div>
          <span className="bo-hbar-count">{item.count}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Dashboard page ─── */
export default function TableauDeBordPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>("mois");
  const [hiddenWidgets, setHiddenWidgets] = useState<Set<string>>(new Set());

  /* Load hidden widgets from localStorage */
  useEffect(() => {
    setHiddenWidgets(readHiddenWidgets());
  }, []);

  const toggleWidget = useCallback((id: string) => {
    setHiddenWidgets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      writeHiddenWidgets(next);
      return next;
    });
  }, []);

  const isHidden = useCallback((id: string) => hiddenWidgets.has(id), [hiddenWidgets]);

  const showAllWidgets = useCallback(() => {
    setHiddenWidgets(new Set());
    writeHiddenWidgets(new Set());
  }, []);

  const hiddenCount = hiddenWidgets.size;

  /* Fetch data */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/dashboard");
        if (!res.ok) throw new Error("Erreur de chargement");
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erreur inconnue");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* Revenue for selected period */
  const revenusValue = useMemo(() => {
    if (!data) return 0;
    return period === "jour" ? data.kpis.revenusJour : period === "semaine" ? data.kpis.revenusSemaine : data.kpis.revenusMois;
  }, [data, period]);

  const periodLabel = period === "jour" ? "Aujourd'hui" : period === "semaine" ? "7 derniers jours" : "30 derniers jours";

  /* Source max for bar chart */
  const sourceMax = useMemo(() => data ? Math.max(...data.sourcesReservation.map((s) => s.count), 1) : 1, [data]);

  /* Type max for bar chart */
  const typeMax = useMemo(() => data ? Math.max(...data.repartitionType.map((t) => t.count), 1) : 1, [data]);

  /* ─── EMPTY STATE ─── */
  if (!loading && !error && data && data.kpis.reservationsJour === 0 && data.dernieresReservations.length === 0) {
    return (
      <div>
        <div className="bo-page-head">
          <div>
            <h2 className="bo-page-title">Tableau de bord</h2>
            <p className="bo-page-desc">Vue d&apos;ensemble de l&apos;activite du complexe.</p>
          </div>
        </div>
        <div className="bo-card">
          <div className="bo-dash-empty">
            <FaRegFolderOpen aria-hidden="true" className="bo-dash-empty-icon" />
            <h3 className="bo-dash-empty-title">Bienvenue dans votre tableau de bord</h3>
            <p>
              Aucune reservation pour l&apos;instant. Les metriques, graphiques et listes
              apparaitront automatiquement des que l&apos;activite commencera.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ─── ERROR STATE ─── */
  if (error) {
    return (
      <div>
        <div className="bo-page-head">
          <div>
            <h2 className="bo-page-title">Tableau de bord</h2>
            <p className="bo-page-desc">Vue d&apos;ensemble de l&apos;activite du complexe.</p>
          </div>
        </div>
        <div className="bo-card">
          <div className="bo-empty">
            <h3 className="bo-empty-title">Erreur de chargement</h3>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  /* ─── KPI section ─── */
  const WidgetToggle = ({ id }: { id: string }) => (
    <button
      type="button"
      className={`bo-widget-toggle ${isHidden(id) ? "is-hidden" : ""}`}
      onClick={() => toggleWidget(id)}
      title={isHidden(id) ? "Afficher ce widget" : "Masquer ce widget"}
      aria-label={isHidden(id) ? `Afficher ${id}` : `Masquer ${id}`}
    >
      {isHidden(id) ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
    </button>
  );

  return (
    <div>
      <div className="bo-page-head">
        <div>
          <h2 className="bo-page-title">Tableau de bord</h2>
          <p className="bo-page-desc">Vue d&apos;ensemble de l&apos;activite du complexe.</p>
        </div>
      </div>

      {hiddenCount > 0 && (
        <div className="bo-widget-reset">
          <FaEyeSlash size={13} aria-hidden="true" />
          <span>{hiddenCount} section{hiddenCount > 1 ? "s" : ""} masquee{hiddenCount > 1 ? "s" : ""}</span>
          <button type="button" className="bo-widget-reset-btn" onClick={showAllWidgets}>
            Tout afficher
          </button>
        </div>
      )}

      {/* ─── KPI CARDS ─── */}
      {isHidden("kpis") ? null : (
        <div className="bo-kpi-grid">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <KpiSkeleton key={i} />)
          ) : (
            <>
              <div className="bo-kpi">
                <div className="bo-kpi-icon bo-kpi-icon--blue"><FaCalendarCheck /></div>
                <div className="bo-kpi-body">
                  <div className="bo-kpi-label">Reservations du jour</div>
                  <div className="bo-kpi-value">{data!.kpis.reservationsJour}</div>
                  <div className="bo-kpi-hint">activees aujourd&apos;hui</div>
                </div>
                <WidgetToggle id="kpis" />
              </div>
              <div className="bo-kpi">
                <div className="bo-kpi-icon bo-kpi-icon--green"><FaArrowRightToBracket /></div>
                <div className="bo-kpi-body">
                  <div className="bo-kpi-label">Arrivees du jour</div>
                  <div className="bo-kpi-value">{data!.kpis.arriveesJour}</div>
                  <div className="bo-kpi-hint">clients attendus</div>
                </div>
                <WidgetToggle id="kpis" />
              </div>
              <div className="bo-kpi">
                <div className="bo-kpi-icon bo-kpi-icon--orange"><FaArrowRightFromBracket /></div>
                <div className="bo-kpi-body">
                  <div className="bo-kpi-label">Departs du jour</div>
                  <div className="bo-kpi-value">{data!.kpis.departsJour}</div>
                  <div className="bo-kpi-hint">check-outs a prevoir</div>
                </div>
                <WidgetToggle id="kpis" />
              </div>
              <div className="bo-kpi">
                <div className="bo-kpi-icon bo-kpi-icon--green"><FaHouseCircleCheck /></div>
                <div className="bo-kpi-body">
                  <div className="bo-kpi-label">Logements disponibles</div>
                  <div className="bo-kpi-value">{data!.kpis.logementsDisponibles}</div>
                  <div className="bo-kpi-hint">{data!.kpis.logementsOccupes} en maintenance</div>
                </div>
                <WidgetToggle id="kpis" />
              </div>
              <div className="bo-kpi">
                <div className="bo-kpi-icon bo-kpi-icon--orange"><FaWhatsapp /></div>
                <div className="bo-kpi-body">
                  <div className="bo-kpi-label">WhatsApp en attente</div>
                  <div className="bo-kpi-value">{data!.kpis.whatsappEnAttente}</div>
                  <div className="bo-kpi-hint">demandes non traitees</div>
                </div>
                <WidgetToggle id="kpis" />
              </div>
              <div className="bo-kpi">
                <div className="bo-kpi-icon bo-kpi-icon--blue"><FaMoneyBillWave /></div>
                <div className="bo-kpi-body">
                  <div className="bo-kpi-label">Revenus</div>
                  <div className="bo-kpi-value">{formatCFA(revenusValue)} F</div>
                  <div className="bo-kpi-hint">{periodLabel}</div>
                </div>
                <div className="bo-period-selector">
                  {(["jour", "semaine", "mois"] as Period[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`bo-period-btn ${period === p ? "is-active" : ""}`}
                      onClick={() => setPeriod(p)}
                    >
                      {p === "jour" ? "Jour" : p === "semaine" ? "7j" : "30j"}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── GRAPHIQUES ─── */}
      {isHidden("charts") ? null : (
        <div className="bo-chart-grid">
          {loading ? (
            <>
              <ChartSkeleton />
              <ChartSkeleton />
            </>
          ) : (
            <>
              {/* Revenus */}
              <div className="bo-chart-card">
                <div className="bo-chart-header">
                  <h3 className="bo-chart-title">Revenus (14 jours)</h3>
                </div>
                <div className="bo-chart-body">
                  <RevenueBarChart data={data!.revenusGraph} period={period} />
                </div>
              </div>

              {/* Occupation */}
              <div className="bo-chart-card">
                <div className="bo-chart-header">
                  <h3 className="bo-chart-title">Taux d&apos;occupation</h3>
                </div>
                <div className="bo-chart-body">
                  <OccupationGauge data={data!.occupationGraph} />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── REPARTITION + SOURCES ─── */}
      {isHidden("repartition") ? null : (
        <div className="bo-chart-grid">
          {loading ? (
            <>
              <ChartSkeleton />
              <ChartSkeleton />
            </>
          ) : (
            <>
              {/* Repartition par type */}
              <div className="bo-chart-card">
                <div className="bo-chart-header">
                  <h3 className="bo-chart-title">Repartition par type</h3>
                  <WidgetToggle id="repartition" />
                </div>
                <div className="bo-chart-body">
                  {data!.repartitionType.length === 0 ? (
                    <p style={{ margin: 0, fontSize: 13, color: "var(--bo-text-2)" }}>Aucune reservation recente.</p>
                  ) : (
                    <HorizontalBarChart
                      items={data!.repartitionType.map((t) => ({ label: t.type.replace(/_/g, " "), count: t.count }))}
                      maxCount={typeMax}
                    />
                  )}
                </div>
              </div>

              {/* Sources */}
              <div className="bo-chart-card">
                <div className="bo-chart-header">
                  <h3 className="bo-chart-title">Sources de reservation</h3>
                  <WidgetToggle id="repartition" />
                </div>
                <div className="bo-chart-body">
                  {data!.sourcesReservation.length === 0 ? (
                    <p style={{ margin: 0, fontSize: 13, color: "var(--bo-text-2)" }}>Aucune source recente.</p>
                  ) : (
                    <HorizontalBarChart
                      items={data!.sourcesReservation.map((s) => ({ label: s.source, count: s.count }))}
                      maxCount={sourceMax}
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── LISTES ─── */}
      <div className="bo-list-grid">
        {/* Dernieres reservations */}
        {isHidden("reservations") ? null : (
          loading ? (
            <ListSkeleton />
          ) : (
            <div className="bo-list-card">
              <div className="bo-list-header">
                <h3 className="bo-list-title">Dernieres reservations</h3>
                <Link href="/admin/reservations" className="bo-list-link">Voir tout</Link>
              </div>
              {data!.dernieresReservations.length === 0 ? (
                <div className="bo-empty" style={{ padding: "24px 18px" }}>
                  <p style={{ margin: 0 }}>Aucune reservation.</p>
                </div>
              ) : (
                <ul className="bo-list-items">
                  {data!.dernieresReservations.map((r) => (
                    <li key={r.id}>
                      <Link href={`/admin/reservations?id=${r.id}`} className="bo-list-item" style={{ textDecoration: "none", color: "inherit" }}>
                        <div className="bo-list-item-main">
                          <div className="bo-list-item-title">{r.logement} — {r.client}</div>
                          <div className="bo-list-item-sub">{formatDay(r.arrivee)} → {formatDay(r.depart)}</div>
                        </div>
                        <div className="bo-list-item-right">
                          <span className={`bo-badge ${STATUT_BADGE[r.statut] ?? "bo-badge--gray"}`}>
                            {STATUT_LABEL[r.statut] ?? r.statut}
                          </span>
                          <span className="bo-list-item-amount">{formatCFA(r.montant)} F</span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        )}

        {/* Notifications */}
        {isHidden("notifications") ? null : (
          loading ? (
            <ListSkeleton />
          ) : (
            <div className="bo-list-card">
              <div className="bo-list-header">
                <h3 className="bo-list-title">Notifications</h3>
                <Link href="/admin/messages" className="bo-list-link">Journal</Link>
              </div>
              {data!.notifications.length === 0 ? (
                <div className="bo-empty" style={{ padding: "24px 18px" }}>
                  <FaBell aria-hidden="true" style={{ fontSize: 20, opacity: 0.3, marginBottom: 8 }} />
                  <p style={{ margin: 0 }}>Tout est a jour.</p>
                </div>
              ) : (
                <ul className="bo-list-items">
                  {data!.notifications.map((n) => (
                    <li key={n.id}>
                      <span className="bo-list-item-notif-dot" />
                      <div className="bo-list-item-main">
                        <div className="bo-list-item-title">{n.titre}</div>
                        <div className="bo-list-item-sub">{n.message}</div>
                      </div>
                      <div className="bo-list-item-right">
                        <span className="bo-list-item-date">{formatDay(n.date.slice(0, 10))}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        )}
      </div>

      {/* ─── PAIEMENTS ─── */}
      {isHidden("paiements") ? null : (
        loading ? (
          <ListSkeleton />
        ) : (
          <div className="bo-list-card" style={{ marginBottom: 20 }}>
            <div className="bo-list-header">
              <h3 className="bo-list-title">Paiements recents</h3>
              <Link href="/admin/paiements" className="bo-list-link">Voir tout</Link>
            </div>
            {data!.paiementsRecents.length === 0 ? (
              <div className="bo-empty" style={{ padding: "24px 18px" }}>
                <FaCreditCard aria-hidden="true" style={{ fontSize: 20, opacity: 0.3, marginBottom: 8 }} />
                <p style={{ margin: 0 }}>Aucun paiement recent.</p>
              </div>
            ) : (
              <ul className="bo-list-items">
                {data!.paiementsRecents.map((p) => (
                  <li key={p.id} className="bo-list-item">
                    <div className="bo-list-item-main">
                      <div className="bo-list-item-title">{p.client} — {p.reservationNumero}</div>
                      <div className="bo-list-item-sub">{p.moyen.replace(/_/g, " ")} · {p.numero}</div>
                    </div>
                    <div className="bo-list-item-right">
                      <span className="bo-list-item-amount">{formatCFA(p.montant)} F</span>
                      <span className={`bo-badge ${PAIEMENT_BADGE[p.statutKey] ?? "bo-badge--gray"}`}>
                        {p.statut}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      )}
    </div>
  );
}
