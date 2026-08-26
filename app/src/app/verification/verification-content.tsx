"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FaTriangleExclamation, FaEnvelope, FaPaperPlane, FaCircleCheck } from "react-icons/fa6";
import { PhotoAside } from "@/components/auth/photo-aside";

export function VerificationContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sentVerifyUrl, setSentVerifyUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const errorMessages: Record<string, string> = {
    missing: "Aucun jeton de vérification fourni.",
    invalid: "Ce lien de vérification est invalide ou a expiré.",
    server: "Une erreur est survenue. Veuillez réessayer.",
  };

  async function handleResend() {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/resend-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      setSentVerifyUrl(data.verifyUrl ?? null);
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
                Un nouveau lien a été envoyé. Vérifiez votre boîte de réception.
                {sentVerifyUrl && (
                  <span style={{ display: "block", marginTop: 8 }}>
                    <a href={sentVerifyUrl} style={{ fontWeight: 600 }}>
                      <FaCircleCheck style={{ marginRight: 6 }} />
                      Ou cliquez ici pour activer votre compte
                    </a>
                  </span>
                )}
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
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleResend();
                    }}
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
              Retour à la connexion
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
          <h1 className="auth-display auth-display--sm">Vérification en cours…</h1>
          <p className="auth-subtitle-v2">
            Si vous n&apos;êtes pas automatiquement redirigé, votre compte est prêt.
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
