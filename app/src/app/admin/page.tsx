import { FaRegFolderOpen } from "react-icons/fa6";

export default function TableauDeBordPage() {
  return (
    <div>
      <div className="bo-page-head">
        <div>
          <h2 className="bo-page-title">Tableau de bord</h2>
          <p className="bo-page-desc">Vue d&apos;ensemble de l&apos;activité du complexe.</p>
        </div>
        <span className="bo-phase-tag">Phase 2</span>
      </div>

      <div className="bo-stat-grid">
        <div className="bo-stat">
          <div className="bo-stat-label">Réservations du jour</div>
          <div className="bo-stat-value">—</div>
          <div className="bo-stat-hint">Disponible en Phase 2</div>
        </div>
        <div className="bo-stat">
          <div className="bo-stat-label">Arrivées / Départs</div>
          <div className="bo-stat-value">—</div>
          <div className="bo-stat-hint">Disponible en Phase 2</div>
        </div>
        <div className="bo-stat">
          <div className="bo-stat-label">Taux d&apos;occupation</div>
          <div className="bo-stat-value">—</div>
          <div className="bo-stat-hint">Disponible en Phase 2</div>
        </div>
        <div className="bo-stat">
          <div className="bo-stat-label">Revenus du mois</div>
          <div className="bo-stat-value">—</div>
          <div className="bo-stat-hint">Disponible en Phase 2</div>
        </div>
      </div>

      <div className="bo-card">
        <div className="bo-empty">
          <FaRegFolderOpen aria-hidden="true" className="bo-empty-icon" />
          <h3 className="bo-empty-title">Widgets et graphiques à venir</h3>
          <p>
            Arrivées/départs du jour, demandes WhatsApp en attente, paiements récents,
            évolution des revenus, taux d&apos;occupation, sources de réservation — livrés
            en Phase 2.
          </p>
        </div>
      </div>
    </div>
  );
}
