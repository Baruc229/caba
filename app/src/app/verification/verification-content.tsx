"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FaTriangleExclamation,
  FaEnvelope,
  FaPaperPlane,
  FaCircleCheck,
  FaArrowRight,
} from "react-icons/fa6";
import { PhotoAside } from "@/components/auth/photo-aside";

export function VerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email");
  const error = searchParams.get("error");

  const [email, setEmail] = useState(emailParam ?? "");
  const [sent, setSent] = useState(false);
  const [sentVerifyUrl, setSentVerifyUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [success, setSuccess] = useState(false);
  const redirected = useRef(false);

  const errorMessages: Record<string, string> = {
    missing: "Aucun jeton de vérification fourni.",
    invalid: "Ce lien de vérification est invalide ou a expiré.",
    server: "Une erreur est survenue. Veuillez réessayer.",
  };

  // Décompte du délai anti-spam avant un nouvel envoi
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Après un clic réussi sur le lien de vérification → écran succès + auto-redirect
  useEffect(() => {
    if (!success || redirected.current) return;
    redirected.current = true;
    const timer = setTimeout(() => router.replace("/"), 1800);
    return () => clearTimeout(timer);
  }, [success, router]);

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
      setCooldown(60);
      setSuccess(false);
    } catch {
      setSent(true);
      setCooldown(60);
    }
    setLoading(false);
  }

  // État succès : l'utilisateur vient d'activer son compte → auto-redirect
  if (success) {
    return (
      <div className="auth-page-v2">
        <div className="auth-panel">
          <div className="auth-main">
            <div className="auth-success-icon">
              <FaCircleCheck aria-hidden="true" />
            </div>
            <p className="auth-eyebrow">Compte activé</p>
            <h1 className="auth-display auth-display--sm">C&apos;est fait !</h1>
            <p className="auth-subtitle-v2">
              Votre email est vérifié. Vous êtes redirigé vers votre espace…
            </p>
          </div>
          <PhotoAside />
        </div>
      </div>
    );
  }

  // État d'attente : token présent mais pas encore cliqué / cliqué via lien direct
  if (token && !error) {
    return (
      <div className="auth-page-v2">
        <div className="auth-panel">
          <div className="auth-main">
            <div className="auth-success-icon">
              <FaEnvelope aria-hidden="true" />
            </div>
            <p className="auth-eyebrow">Vérification</p>
            <h1 className="auth-display auth-display--sm">Vérifiez votre email</h1>

            {sent ? (
              <div className="auth-banner auth-banner--success">
                Un nouveau lien a été envoyé.
                {sentVerifyUrl && (
                  <span style={{ display: "block", marginTop: 10 }}>
                    <a href={sentVerifyUrl} className="auth-btn" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <FaCircleCheck aria-hidden="true" />
                      Activer mon compte
                    </a>
                  </span>
                )}
              </div>
            ) : (
              <>
                {email && (
                  <p className="auth-subtitle-v2">
                    Nous avons envoyé un lien de confirmation à{" "}
                    <strong style={{ color: "var(--color-text-primary)" }}>{email}</strong>.
                    Cliquez sur le lien pour activer votre compte.
                  </p>
                )}
                <p className="auth-subtitle-v2" style={{ marginTop: 16, fontSize: 13 }}>
                  <button
                    type="button"
                    className="auth-resend-btn"
                    onClick={handleResend}
                    disabled={loading || cooldown > 0}
                  >
                    {loading ? "Envoi…" : cooldown > 0 ? `Renvoyer le lien (${cooldown} s)` : "Renvoyer le lien"}
                  </button>
                </p>
                <p className="auth-resend" style={{ marginTop: 8 }}>
                  Vous avez saisi une mauvaise adresse ?{" "}
                  <Link href="/inscription">Changer d&apos;adresse email</Link>
                </p>
              </>
            )}
          </div>
          <PhotoAside />
        </div>
      </div>
    );
  }

  // État d'erreur : lien invalide/expiré
  return (
    <div className="auth-page-v2">
      <div className="auth-panel">
        <div className="auth-main">
          <div className="auth-icon-circle">
            <FaTriangleExclamation aria-hidden="true" />
          </div>
          <h1 className="auth-display auth-display--sm">Lien invalide</h1>
          <p className="auth-subtitle-v2">
            {errorMessages[error ?? ""] ?? "Une erreur inconnue est survenue."}
          </p>

          {sent ? (
            <div className="auth-banner auth-banner--success" style={{ marginTop: 8 }}>
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
                disabled={loading || cooldown > 0 || !email.trim()}
              >
                <FaPaperPlane aria-hidden="true" />
                {loading ? "Envoi..." : cooldown > 0 ? `Renvoyer (${cooldown} s)` : "Renvoyer le lien"}
              </button>
            </>
          )}

          <Link href="/connexion" className="auth-btn auth-btn--link" style={{ marginTop: 16 }}>
            <FaArrowRight className="auth-btn-arrow" aria-hidden="true" />
            Retour à la connexion
          </Link>
        </div>
        <PhotoAside />
      </div>
    </div>
  );
}
