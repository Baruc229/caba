"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaArrowRight, FaEnvelopeOpenText, FaLock } from "react-icons/fa6";
import { PhotoAside } from "@/components/auth/photo-aside";
import { useApp } from "@/components/providers/app-provider";
import { DocumentTitle } from "@/components/seo/document-title";

export default function MotDePasseOubliePage() {
  const { t } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [lastEmail, setLastEmail] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [fieldError, setFieldError] = useState("");

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  function validerEmail(valeur: string): string {
    const email = valeur.trim();
    if (!email) return t("resetpwd.emailEmpty");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return t("resetpwd.emailInvalid");
    }
    return "";
  }

  async function sendReset(email: string) {
    setStatus("loading");
    await fetch("/api/auth/mot-de-passe-oublie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

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
      <DocumentTitle titleKey="meta.motDePasseOublieTitle" />
      <div className="auth-panel">
        <div className="auth-main">
          <p className="auth-eyebrow">{t("resetpwd.forgotEyebrow")}</p>
          <h1 className="auth-display auth-display--sm">{t("resetpwd.forgotTitle")}</h1>

          {submitted ? (
            <>
              <div className="auth-icon-circle" aria-hidden="true">
                <FaEnvelopeOpenText />
              </div>
              <p role="status" className="auth-subtitle-v2">
                {t("resetpwd.successMessage")}
              </p>
              <p className="auth-resend">
                <button
                  type="button"
                  className="auth-resend-btn"
                  onClick={() => sendReset(lastEmail)}
                  disabled={cooldown > 0 || status === "loading"}
                >
                  {cooldown > 0
                    ? t("resetpwd.resendCooldown").replace("{n}", String(cooldown))
                    : t("resetpwd.resendBtn")}
                </button>
              </p>
              <Link href="/connexion" className="auth-back-link">
                {t("resetpwd.backToLogin")}
              </Link>
            </>
          ) : (
            <>
              <div className="auth-icon-circle" aria-hidden="true">
                <FaLock />
              </div>
              <p className="auth-subtitle-v2">
                {t("resetpwd.forgotInstructions")}
              </p>

              <form onSubmit={handleSubmit} noValidate>
                <div className={`lfield${fieldError ? " has-error" : ""}`}>
                  <label htmlFor="forgot-email" className="lfield-label">
                    {t("resetpwd.emailLabel")}
                  </label>
                  <input
                    id="forgot-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder={t("resetpwd.emailPlaceholder")}
                    autoFocus
                    onInput={() => setFieldError("")}
                    onBlur={(event) => setFieldError(validerEmail(event.currentTarget.value))}
                    className="lfield-input"
                  />
                  {fieldError && <p className="auth-error-text">{fieldError}</p>}
                </div>

                <button type="submit" className="auth-btn" disabled={status === "loading"}>
                  {status === "loading" ? t("resetpwd.sendingBtn") : t("resetpwd.sendBtn")}
                  {status !== "loading" && (
                    <FaArrowRight className="auth-btn-arrow" aria-hidden="true" />
                  )}
                </button>
              </form>

              <Link href="/connexion" className="auth-back-link">
                {t("resetpwd.backToLogin")}
              </Link>
            </>
          )}
        </div>

        <PhotoAside />
      </div>
    </div>
  );
}
