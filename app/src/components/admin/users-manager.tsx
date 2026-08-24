"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaUserPlus, FaXmark } from "react-icons/fa6";

interface StaffUser {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string | null;
  role: string;
  actif: boolean;
  lastLogin: string | null;
  invitationEnAttente: boolean;
}

const ROLE_OPTIONS = [
  { value: "administrateur", label: "Administrateur" },
  { value: "gestionnaire", label: "Gestionnaire" },
  { value: "reception", label: "Réception" },
  { value: "comptabilite", label: "Comptabilité" },
  { value: "editeur", label: "Éditeur" },
];

function RoleBadge({ role }: { role: string }) {
  return <span className="bo-badge bo-badge--blue">{role}</span>;
}

function StatusBadge({ user }: { user: StaffUser }) {
  if (!user.actif) {
    return <span className="bo-badge bo-badge--gray">Désactivé</span>;
  }
  if (user.invitationEnAttente) {
    return <span className="bo-badge bo-badge--orange">Invitation en attente</span>;
  }
  return <span className="bo-badge bo-badge--green">Actif</span>;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function UsersManager({ initialUsers }: { initialUsers: StaffUser[] }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [modalOpen, setModalOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function reload() {
    const response = await fetch("/api/admin/users");
    if (response.ok) {
      const data = await response.json();
      setUsers(data.users);
    }
    router.refresh();
  }

  async function invite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    const form = event.currentTarget;
    const data = new FormData(form);
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prenom: data.get("prenom"),
        nom: data.get("nom"),
        email: data.get("email"),
        telephone: data.get("telephone"),
        role: data.get("role"),
      }),
    });
    const body = await response.json();

    if (!response.ok) {
      setBanner({ type: "error", text: body.error ?? "Erreur lors de l'invitation." });
      setStatus("idle");
      return;
    }

    setModalOpen(false);
    form.reset();
    await reload();
    setBanner({
      type: body.emailEnvoye ? "success" : "error",
      text: body.message,
    });
    setStatus("idle");
  }

  async function patch(userId: string, action: string, role?: string) {
    setBanner(null);
    const response = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, action, role }),
    });
    const body = await response.json();

    if (!response.ok) {
      setBanner({ type: "error", text: body.error ?? "Erreur." });
      return;
    }
    await reload();
  }

  function changeRole(user: StaffUser, role: string) {
    if (role !== user.role) patch(user.id, "changer-role", role);
  }

  return (
    <div className="bo-card">
      <div className="bo-card-header">
        <h3 className="bo-card-title">Comptes internes ({users.length})</h3>
        <button
          type="button"
          className="bo-btn bo-btn--primary"
          onClick={() => setModalOpen(true)}
        >
          <FaUserPlus aria-hidden="true" />
          Inviter un membre
        </button>
      </div>

      {banner && (
        <p
          className={`bo-form-${banner.type === "success" ? "success" : "error"}`}
          style={{ margin: "14px 18px 0" }}
        >
          {banner.text}
        </p>
      )}

      <div className="bo-table-wrap">
        <table className="bo-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th>Dernière connexion</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <strong>
                    {user.prenom} {user.nom}
                  </strong>
                </td>
                <td>{user.email}</td>
                <td>
                  {user.actif ? (
                    <select
                      className="bo-select bo-select--inline"
                      value={user.role}
                      onChange={(event) => changeRole(user, event.target.value)}
                      aria-label={`Rôle de ${user.prenom} ${user.nom}`}
                    >
                      {ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <RoleBadge role={user.role} />
                  )}
                </td>
                <td>
                  <StatusBadge user={user} />
                </td>
                <td>{formatDate(user.lastLogin)}</td>
                <td>
                  {user.actif ? (
                    <button
                      type="button"
                      className="bo-btn bo-btn--danger"
                      onClick={() => patch(user.id, "desactiver")}
                    >
                      Désactiver
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="bo-btn bo-btn--secondary"
                      onClick={() => patch(user.id, "activer")}
                    >
                      Réactiver
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <div className="bo-empty">
                    <h3 className="bo-empty-title">Aucun compte interne</h3>
                    <p>Invitez votre premier membre d&apos;équipe.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <>
          <button
            type="button"
            className="bo-backdrop bo-modal-backdrop"
            aria-label="Fermer"
            onClick={() => setModalOpen(false)}
          />
          <div className="bo-modal" role="dialog" aria-modal="true" aria-labelledby="invite-title">
            <div className="bo-modal-header">
              <h4 id="invite-title" className="bo-card-title">
                Inviter un membre de l&apos;équipe
              </h4>
              <button
                type="button"
                className="bo-icon-btn"
                aria-label="Fermer"
                onClick={() => setModalOpen(false)}
              >
                <FaXmark aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={invite}>
              <div className="bo-modal-body">
                <div className="bo-form-grid">
                  <div className="bo-field">
                    <label htmlFor="inv-user-prenom" className="bo-label">
                      Prénom *
                    </label>
                    <input id="inv-user-prenom" name="prenom" type="text" required className="bo-input" />
                  </div>
                  <div className="bo-field">
                    <label htmlFor="inv-user-nom" className="bo-label">
                      Nom *
                    </label>
                    <input id="inv-user-nom" name="nom" type="text" required className="bo-input" />
                  </div>
                  <div className="bo-field">
                    <label htmlFor="inv-user-email" className="bo-label">
                      Email *
                    </label>
                    <input id="inv-user-email" name="email" type="email" required className="bo-input" />
                  </div>
                  <div className="bo-field">
                    <label htmlFor="inv-user-tel" className="bo-label">
                      Téléphone
                    </label>
                    <input id="inv-user-tel" name="telephone" type="tel" className="bo-input" />
                  </div>
                  <div className="bo-field" style={{ gridColumn: "1 / -1" }}>
                    <label htmlFor="inv-user-role" className="bo-label">
                      Rôle *
                    </label>
                    <select id="inv-user-role" name="role" required defaultValue="" className="bo-select">
                      <option value="" disabled>
                        Choisir un rôle…
                      </option>
                      {ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="bo-form-hint">
                  La personne recevra un email avec un lien valable 72 h pour définir
                  elle-même son mot de passe. Le reste « en attente » jusqu&apos;alors.
                </p>
              </div>

              <div className="bo-modal-footer">
                <button
                  type="button"
                  className="bo-btn bo-btn--secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Annuler
                </button>
                <button type="submit" className="bo-btn bo-btn--primary" disabled={status === "loading"}>
                  {status === "loading" ? "Envoi…" : "Envoyer l'invitation"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
