"use client";

import { useState } from "react";
import { FaUserPlus } from "react-icons/fa6";

const STAFF_ROLES = [
  { value: "administrateur", label: "Administrateur (accès complet)" },
  { value: "gestionnaire", label: "Gestionnaire (logements, réservations, clients)" },
  { value: "reception", label: "Réception (réservations, arrivées-départs)" },
  { value: "comptabilite", label: "Comptabilité (paiements, rapports)" },
  { value: "editeur", label: "Éditeur (pages, contenu, blog)" },
];

export function AddUserForm() {
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setStatus("loading");

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
        nom: form.get("nom"),
        prenom: form.get("prenom"),
        role: form.get("role"),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Erreur lors de la creation du compte");
      setStatus("idle");
      return;
    }

    setSuccess(`Compte cree : ${data.user.prenom} ${data.user.nom} (${data.user.role})`);
    event.currentTarget.reset();
    setStatus("idle");
  }

  return (
    <div className="bo-card">
      <div className="bo-card-header">
        <h3 className="bo-card-title">
          <FaUserPlus aria-hidden="true" style={{ marginRight: 8, color: "#001489" }} />
          Ajouter un membre de l&apos;équipe
        </h3>
        <span className="bo-phase-tag">Phase 1 — socle</span>
      </div>
      <div className="bo-card-body">
        {error && <p className="bo-form-error">{error}</p>}
        {success && <p className="bo-form-success">{success}</p>}

        <form onSubmit={handleSubmit}>
          <div className="bo-form-grid">
            <div className="bo-field">
              <label htmlFor="new-user-prenom" className="bo-label">
                Prénom
              </label>
              <input id="new-user-prenom" name="prenom" type="text" required className="bo-input" />
            </div>
            <div className="bo-field">
              <label htmlFor="new-user-nom" className="bo-label">
                Nom
              </label>
              <input id="new-user-nom" name="nom" type="text" required className="bo-input" />
            </div>
            <div className="bo-field">
              <label htmlFor="new-user-email" className="bo-label">
                Email
              </label>
              <input id="new-user-email" name="email" type="email" required className="bo-input" />
            </div>
            <div className="bo-field">
              <label htmlFor="new-user-password" className="bo-label">
                Mot de passe
              </label>
              <input
                id="new-user-password"
                name="password"
                type="password"
                required
                minLength={8}
                className="bo-input"
              />
              <p className="bo-form-hint">8 caractères minimum.</p>
            </div>
            <div className="bo-field" style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="new-user-role" className="bo-label">
                Rôle
              </label>
              <select id="new-user-role" name="role" className="bo-select" defaultValue="">
                <option value="" disabled>
                  Choisir un rôle…
                </option>
                {STAFF_ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="bo-btn bo-btn--primary" disabled={status === "loading"}>
            {status === "loading" ? "Création…" : "Créer le compte"}
          </button>
        </form>
      </div>
    </div>
  );
}
