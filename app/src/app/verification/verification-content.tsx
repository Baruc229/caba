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
import { useApp } from "@/components/providers/app-provider";
import { DocumentTitle } from "@/components/seo/document-title";

export function VerificationContent() {
  const { t } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email");
  const error = searchParams.get("error");

  const activateUrl = token ? `/api/auth/verify?token=${encodeURIComponent(token)}` : null;

  const [email, setEmail] = useState(emailParam ?? "");
  const [sent, setSent] = useState(false);
  const [sentVerifyUrl, setSentVerifyUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [success, setSuccess] = useState(false);
  const redirected = useRef(false);

  const errorMessages: Record<string, string> = {
    missing: t("verify.errMissing"),
    invalid: t("verify.errInvalid"),
    server: t("verify.errServer"),
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
        <DocumentTitle titleKey="meta.verificationTitle" />
        <div className="auth-panel">
          <div className="auth-main">
            <div className="auth-success-icon">
              <FaCircleCheck aria-hidden="true" />
            </div>
            <p className="auth-eyebrow">{t("verify.compteActive")}</p>
            <h1 className="auth-display auth-display--sm">{t("verify.cEstFait")}</h1>
            <p className="auth-subtitle-v2">{t("verify.emailVerifie")}</p>
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
        <DocumentTitle titleKey="meta.verificationTitle" />
        <div className="auth-panel">
          <div className="auth-main">
            <div className="auth-success-icon">
              <FaEnvelope aria-hidden="true" />
            </div>
            <p className="auth-eyebrow">{t("verify.eyebrow")}</p>
            <h1 className="auth-display auth-display--sm">{t("verify.titre")}</h1>

            {sent ? (
              <div className="auth-banner auth-banner--success">
                {t("verify.nouveauLienEnvoye")}
                {sentVerifyUrl && (
                  <span style={{ display: "block", marginTop: 10 }}>
                    <a href={sentVerifyUrl} className="auth-btn" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <FaCircleCheck aria-hidden="true" />
                      {t("verify.activerMonCompte")}
                    </a>
                  </span>
                )}
              </div>
            ) : (
              <>
                {email && (
                  <p className="auth-subtitle-v2">
                    {t("verify.emailSentPrefix")}{" "}
                    <strong style={{ color: "var(--color-text-primary)" }}>{email}</strong>.
                    {t("verify.emailSentSuffix")}
                  </p>
                )}
                {activateUrl && (
                  <a href={activateUrl} className="auth-btn" style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <FaCircleCheck aria-hidden="true" />
                    {t("verify.activerMonCompte")}
                  </a>
                )}
                <p className="auth-subtitle-v2" style={{ marginTop: 16, fontSize: 13 }}>
                  <button
                    type="button"
                    className="auth-resend-btn"
                    onClick={handleResend}
                    disabled={loading || cooldown > 0}
                  >
                    {loading
                      ? t("verify.envoi")
                      : cooldown > 0
                        ? `${t("verify.renvoyerLien")} (${cooldown} s)`
                        : t("verify.renvoyerLien")}
                  </button>
                </p>
                <p className="auth-resend" style={{ marginTop: 8 }}>
                  {t("verify.mauvaiseAdresse")}{" "}
                  <Link href="/inscription">{t("common.changerAdresse")}</Link>
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
      <DocumentTitle titleKey="meta.verificationTitle" />
      <div className="auth-panel">
        <div className="auth-main">
          <div className="auth-icon-circle">
            <FaTriangleExclamation aria-hidden="true" />
          </div>
          <h1 className="auth-display auth-display--sm">{t("verify.lienInvalide")}</h1>
          <p className="auth-subtitle-v2">
            {errorMessages[error ?? ""] ?? t("verify.erreurInconnue")}
          </p>

          {sent ? (
            <div className="auth-banner auth-banner--success" style={{ marginTop: 8 }}>
              {t("verify.nouveauLienEnvoyeBoite")}
              {sentVerifyUrl && (
                <span style={{ display: "block", marginTop: 8 }}>
                  <a href={sentVerifyUrl} style={{ fontWeight: 600 }}>
                    <FaCircleCheck style={{ marginRight: 6 }} />
                    {t("verify.ouCliquezIci")}
                  </a>
                </span>
              )}
            </div>
          ) : (
            <>
              <p className="auth-subtitle-v2" style={{ fontSize: 14 }}>
                {t("verify.demanderNouveauLien")}
              </p>
              <div className="lfield" style={{ marginTop: 12 }}>
                <label htmlFor="resend-email" className="lfield-label">
                  {t("verify.votreEmail")}
                </label>
                <input
                  id="resend-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("verify.emailPlaceholder")}
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
                {loading
                  ? t("verify.envoi")
                  : cooldown > 0
                    ? `${t("verify.renvoyer")} (${cooldown} s)`
                    : t("verify.renvoyerLien")}
              </button>
            </>
          )}

          <Link href="/connexion" className="auth-btn auth-btn--link" style={{ marginTop: 16 }}>
            <FaArrowRight className="auth-btn-arrow" aria-hidden="true" />
            {t("verify.retourConnexion")}
          </Link>
        </div>
        <PhotoAside />
      </div>
    </div>
  );
}