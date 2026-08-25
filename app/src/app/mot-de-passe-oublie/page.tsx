"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaArrowRight, FaEnvelopeOpenText, FaLock } from "react-icons/fa6";
import { PhotoAside } from "@/components/auth/photo-aside";

function validerEmail(valeur: string): string {
  const email = valeur.trim();
  if (!email) return "Saisissez votre adresse email.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "L'adresse email doit contenir un @ suivi d'un domaine (ex : nom@exemple.com).";
  }
  return "";
}

export default function MotDePasseOubliePage() {
  const [submitted, setSubmitted] = useState(false);
  const [lastEmail, setLastEmail] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [fieldError, setFieldError] = useState("");

  // Décompte du délai anti-spam avant un nouvel envoi
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function sendReset(email: string) {
    setStatus("loading");
    await fetch("/api/auth/mot-de-passe-oublie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    // Réponse volontairement identique que le compte existe ou non
    setSubmitted(true);
    setCooldown(60);
    setStatus("idle");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    const erreur = validerEmail(email);
    setFieldError(erreur);
    if (erreur) return;

    setLastEmail(email);
    await sendReset(email);
  }

  return (
    <div className="auth-min">
      <div className="auth-panel">
        <div className="auth-main">
          <p className="auth-eyebrow">Mot de passe oublié</p>
          <h1 className="auth-display auth-display--sm">Récupérez l&apos;accès</h1>

          {submitted ? (
            <>
              <div className="auth-icon-circle" aria-hidden="true">
                <FaEnvelopeOpenText />
              </div>
              <p role="status" className="auth-subtitle-v2">
                Si un profil existe pour cet email, un lien de réinitialisation vient
                d&apos;être envoyé. Il est valable une heure.
              </p>
              <p className="auth-resend">
                <button
                  type="button"
                  className="auth-resend-btn"
                  onClick={() => sendReset(lastEmail)}
                  disabled={cooldown > 0 || status === "loading"}
                >
                  {cooldown > 0
                    ? `Renvoyer le lien (${cooldown} s)`
                    : "Renvoyer le lien"}
                </button>
              </p>
              <Link href="/connexion" className="auth-back-link">
                Retour à la connexion
              </Link>
            </>
          ) : (
            <>
              <div className="auth-icon-circle" aria-hidden="true">
                <FaLock />
              </div>
              <p className="auth-subtitle-v2">
                Indiquez votre email : nous vous envoyons un lien pour choisir un nouveau
                mot de passe.
              </p>

              <form onSubmit={handleSubmit} noValidate>
                <div className={`lfield${fieldError ? " has-error" : ""}`}>
                  <label htmlFor="forgot-email" className="lfield-label">
                    Email
                  </label>
                  <input
                    id="forgot-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nom@exemple.com"
                    autoFocus
                    onInput={() => setFieldError("")}
                    onBlur={(event) => setFieldError(validerEmail(event.currentTarget.value))}
                    className="lfield-input"
                  />
                  {fieldError && <p className="auth-error-text">{fieldError}</p>}
                </div>

                <button type="submit" className="auth-btn" disabled={status === "loading"}>
                  {status === "loading" ? "Envoi…" : "Envoyer le lien"}
                  {status !== "loading" && (
                    <FaArrowRight className="auth-btn-arrow" aria-hidden="true" />
                  )}
                </button>
              </form>

              <Link href="/connexion" className="auth-back-link">
                Retour à la connexion
              </Link>
            </>
          )}
        </div>

        <PhotoAside />
      </div>
    </div>
  );
}
