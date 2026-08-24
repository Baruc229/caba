import { AddUserForm } from "@/components/admin/add-user-form";

export default function RolesPage() {
  return (
    <div>
      <div className="bo-page-head">
        <div>
          <h2 className="bo-page-title">Rôles &amp; Permissions</h2>
          <p className="bo-page-desc">
            Création des comptes équipe. La gestion fine des permissions arrive en Phase 8.
          </p>
        </div>
        <span className="bo-phase-tag">Phase 8</span>
      </div>

      <AddUserForm />

      <div className="bo-card">
        <div className="bo-empty">
          <h3 className="bo-empty-title">Matrice de permissions</h3>
          <p>Attribution détaillée par section, activation/désactivation de comptes : Phase 8.</p>
        </div>
      </div>
    </div>
  );
}
