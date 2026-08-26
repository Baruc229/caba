"use client";

import { useState } from "react";
import Link from "next/link";
import { FaTriangleExclamation, FaEnvelope, FaPaperPlane } from "react-icons/fa6";
import { PhotoAside } from "@/components/auth/photo-aside";

export default function VerificationPage() {
  const params = new URLSearchParams(window.location.search);
  const error = params.get("error");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const errorMessages: Record<string, string> = {
    missing: "Aucun jeton de verification fourni.",
    invalid: "Ce lien de verification est invalide ou a expire.",
    server: "Une erreur est survenue. Veuillez reessayer.",
  };

  async function handleResend() {
    if (!email.trim()) return;
    setLoading(true);
    try {
      await fetch("/api/auth/resend-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      setSent(true);
    } catch {
      setSent(true);
    }
    setLoading(false);
  }

  if (error) {
    return (
      <div className="auth-page-v2">
        <div className="auth-panel">
          <div className="auth-main">
            <div className="auth-icon-circle">
              <FaTriangleExclamation aria-hidden="true" />
            </div>
            <h1 className="auth-display auth-display--sm">Lien invalide</h1>
            <p className="auth-subtitle-v2">
              {errorMessages[error] ?? "Une erreur inconnue est survenue."}
            </p>

            {sent ? (
              <div className="auth-banner auth-banner--success">
                Un nouveau lien a ete envoye. Verifiez votre boite de reception.
              </div>
            ) : (
              <>
                <p className="auth-subtitle-v2" style={{ fontSize: 14 }}>
                  Vous pouvez demander un nouveau lien ci-dessous :
                </p>
                <div className="lfield" style={{ marginTop: 12 }}>
                  <label htmlFor="resend-email" className="lfield-label">
                    Votre email
                  </label>
                  <input
                    id="resend-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nom@exemple.com"
                    className="lfield-input"
                  />
                </div>
                <button
                  className="auth-btn"
                  style={{ marginTop: 16 }}
                  onClick={handleResend}
                  disabled={loading || !email.trim()}
                >
                  <FaPaperPlane aria-hidden="true" />
                  {loading ? "Envoi..." : "Renvoyer le lien"}
                </button>
              </>
            )}

            <Link href="/connexion" className="auth-btn auth-btn--link" style={{ marginTop: 16 }}>
              Retour a la connexion
            </Link>
          </div>
          <PhotoAside />
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-v2">
      <div className="auth-panel">
        <div className="auth-main">
          <div className="auth-success-icon">
            <FaEnvelope aria-hidden="true" />
          </div>
          <h1 className="auth-display auth-display--sm">Verification en cours...</h1>
          <p className="auth-subtitle-v2">
            Si vous n&apos;etes pas automatiquement redirige, votre compte est pret.
          </p>
          <Link href="/connexion" className="auth-btn auth-btn--link">
            Se connecter
          </Link>
        </div>
        <PhotoAside />
      </div>
    </div>
  );
}
