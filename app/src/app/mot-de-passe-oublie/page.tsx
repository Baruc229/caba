"use client";

import { useState } from "react";
import Link from "next/link";
import { FaEnvelopeOpenText } from "react-icons/fa6";

export default function MotDePasseOubliePage() {
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [fieldError, setFieldError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldError("");
    setStatus("loading");

    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    await fetch("/api/auth/mot-de-passe-oublie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    // Réponse volontairement identique que le compte existe ou non
    setSubmitted(true);
    setStatus("idle");
  }

  return (
    <div className="auth-card">
      <Link href="/" className="auth-brand">
        Caba Résidence
      </Link>

      {submitted ? (
        <>
          <div className="auth-success-icon" style={{ marginTop: 20 }}>
            <FaEnvelopeOpenText aria-hidden="true" />
          </div>
          <p
            className="auth-banner auth-banner--success"
            style={{ textAlign: "center", display: "block" }}
          >
            Si un compte existe avec cet email, un lien de réinitialisation vient d&apos;être
            envoyé. Il est valable 1 heure.
          </p>
          <Link
            href="/connexion"
            className="auth-submit"
            style={{ textAlign: "center", display: "block", textDecoration: "none" }}
          >
            Retour à la connexion
          </Link>
        </>
      ) : (
        <>
          <h1 className="auth-title">Mot de passe oublié ?</h1>
          <p className="auth-subtitle" style={{ marginBottom: 20, marginTop: -12 }}>
            Saisissez votre email : vous recevrez un lien pour choisir un nouveau mot de passe.
          </p>

          {fieldError && (
            <p role="alert" className="auth-banner auth-banner--error">
              {fieldError}
            </p>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label htmlFor="reset-email" className="auth-label">
                Email
              </label>
              <input
                id="reset-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="auth-input"
              />
            </div>
            <button type="submit" className="auth-submit" disabled={status === "loading"}>
              {status === "loading" ? "Envoi…" : "Recevoir le lien"}
            </button>
          </form>

          <div className="auth-footer">
            <Link href="/connexion">Retour à la connexion</Link>
          </div>
        </>
      )}
    </div>
  );
}
