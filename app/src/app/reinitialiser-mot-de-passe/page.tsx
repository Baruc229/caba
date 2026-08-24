"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FaCircleCheck, FaEye, FaEyeSlash } from "react-icons/fa6";
import {
  CriteriaList,
  StrengthMeter,
} from "@/components/auth/password-strength";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("loading");

    const data = new FormData(event.currentTarget);
    const newPassword = String(data.get("password") ?? "");
    const confirm = String(data.get("confirm") ?? "");

    if (
      newPassword.length < 8 ||
      !/[A-Z]/.test(newPassword) ||
      !/\d/.test(newPassword)
    ) {
      setError("Le mot de passe ne respecte pas les critères indiqués.");
      setStatus("idle");
      return;
    }
    if (newPassword !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      setStatus("idle");
      return;
    }

    const response = await fetch("/api/auth/reinitialiser-mot-de-passe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: newPassword }),
    });
    const body = await response.json();

    if (!response.ok) {
      setError(body.error ?? "Lien invalide ou expiré. Faites une nouvelle demande.");
      setStatus("idle");
      return;
    }

    setSuccess(true);
    setStatus("idle");
  }

  if (!token) {
    return (
      <>
        <h1 className="auth-title">Lien invalide</h1>
        <p className="auth-banner auth-banner--error">
          Ce lien de réinitialisation est incomplet. Faites une nouvelle demande.
        </p>
        <Link
          href="/mot-de-passe-oublie"
          className="auth-submit"
          style={{ textAlign: "center", display: "block", textDecoration: "none" }}
        >
          Refaire une demande
        </Link>
      </>
    );
  }

  if (success) {
    return (
      <>
        <div className="auth-success-icon" style={{ marginTop: 20 }}>
          <FaCircleCheck aria-hidden="true" />
        </div>
        <h1 className="auth-title" style={{ marginBottom: 10 }}>
          Mot de passe modifié !
        </h1>
        <p className="auth-subtitle" style={{ marginBottom: 22 }}>
          Connectez-vous avec votre nouveau mot de passe. Vous serez redirigé vers votre
          espace selon votre profil.
        </p>
        <Link
          href="/connexion"
          className="auth-submit"
          style={{ textAlign: "center", display: "block", textDecoration: "none" }}
        >
          Se connecter maintenant
        </Link>
      </>
    );
  }

  return (
    <>
      <Link href="/" className="auth-brand">
        Caba Résidence
      </Link>
      <h1 className="auth-title">Nouveau mot de passe</h1>

      {error && (
        <p role="alert" className="auth-banner auth-banner--error">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label htmlFor="reset-new-password" className="auth-label">
            Nouveau mot de passe
          </label>
          <div className="auth-input-wrap">
            <input
              id="reset-new-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="auth-input auth-input--with-eye"
            />
            <button
              type="button"
              className="auth-eye"
              aria-label={showPassword ? "Masquer" : "Afficher"}
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
            </button>
          </div>
          <StrengthMeter password={password} />
          <CriteriaList password={password} />
        </div>

        <div className="auth-field">
          <label htmlFor="reset-confirm-password" className="auth-label">
            Confirmer le mot de passe
          </label>
          <input
            id="reset-confirm-password"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            className="auth-input"
          />
        </div>

        <button type="submit" className="auth-submit" disabled={status === "loading"}>
          {status === "loading" ? "Enregistrement…" : "Enregistrer le nouveau mot de passe"}
        </button>
      </form>
    </>
  );
}

export default function ReinitialiserMotDePassePage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <Suspense fallback={<p className="auth-subtitle">Chargement…</p>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
