"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { FaArrowRight, FaEye, FaEyeSlash, FaCircleInfo } from "react-icons/fa6";
import { PhotoAside } from "@/components/auth/photo-aside";
import { useApp } from "@/components/providers/app-provider";
import { DocumentTitle } from "@/components/seo/document-title";

interface ConnexionFormProps {
  echec: boolean;
  succes: boolean;
  emailVerifie?: boolean;
}

function validerEmail(valeur: string, t: (path: string) => string): string {
  const email = valeur.trim();
  if (!email) return t("auth.err.emailRequired");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return t("auth.err.emailFormat");
  }
  return "";
}

function validerMotDePasse(valeur: string, t: (path: string) => string): string {
  if (!valeur) return t("auth.err.passwordRequired");
  return "";
}

export function ConnexionForm({ echec, succes, emailVerifie }: ConnexionFormProps) {
  const { t } = useApp();
  const [staffManquant, setStaffManquant] = useState(false);

  useEffect(() => {
    let actif = true;
    fetch("/api/auth/staff-exists")
      .then((response) => response.json())
      .then((data) => {
        if (actif && data.staffExists === false) setStaffManquant(true);
      })
      .catch(() => {});
    return () => {
      actif = false;
    };
  }, []);

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(
    echec ? t("auth.err.echec") : ""
  );
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [lastEmail, setLastEmail] = useState("");

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setEmailError("");
    setPasswordError("");

    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");

    const erreurEmail = validerEmail(email, t);
    const erreurMotDePasse = validerMotDePasse(password, t);
    setEmailError(erreurEmail);
    setPasswordError(erreurMotDePasse);
    if (erreurEmail || erreurMotDePasse) return;

    setStatus("loading");
    try {
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/redirection",
        redirect: false,
      });

      if (result?.error) {
        setNeedsVerification(false);
        setResendStatus("idle");
        setLastEmail(email);
        try {
          const stateRes = await fetch("/api/auth/connexion-state", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          const state = await stateRes.json();
          if (state.exists && state.emailConfirme === false) {
            setNeedsVerification(true);
            setStatus("idle");
            return;
          }
        } catch {
          // ignore : on garde le message générique
        }
        setError(
          result.error === "CredentialsSignin"
            ? t("auth.err.credentials")
            : t("auth.err.loginGeneric")
        );
        setStatus("idle");
        return;
      }

      if (result?.url) {
        window.location.href = result.url;
      } else {
        window.location.href = "/redirection";
      }
    } catch {
      setError(t("auth.err.generic"));
      setStatus("idle");
    }
  }

  async function handleResend() {
    if (!lastEmail) return;
    setResendStatus("loading");
    try {
      await fetch("/api/auth/resend-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: lastEmail }),
      });
      setResendStatus("sent");
    } catch {
      setResendStatus("idle");
    }
  }

  return (
    <div className="auth-page-v2">
      <DocumentTitle titleKey="meta.connexionTitle" />
      <div className="auth-panel">
        <div className="auth-main">
          <p className="auth-eyebrow">{t("auth.connexion.eyebrow")}</p>
          <h1 className="auth-display">{t("auth.connexion.title")}</h1>

          {staffManquant && (
            <div className="auth-banner auth-banner--success" style={{ display: "flex", gap: 8 }}>
              <FaCircleInfo aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
              <span>
                {t("auth.connexion.staffMissing")}
              </span>
            </div>
          )}

          {succes && (
            <p role="status" className="auth-banner auth-banner--success">
              {t("auth.connexion.succes")}
            </p>
          )}

          {emailVerifie && (
            <p role="status" className="auth-banner auth-banner--success">
              {t("auth.connexion.emailVerifie")}
            </p>
          )}

          {error && (
            <p role="alert" className="auth-banner auth-banner--error">
              {error}
            </p>
          )}

          {needsVerification && (
            <div role="alert" className="auth-banner auth-banner--error">
              <p style={{ margin: 0 }}>{t("auth.err.needsVerification")}</p>
              {resendStatus === "sent" ? (
                <p role="status" style={{ margin: "8px 0 0", fontWeight: 600 }}>
                  {t("auth.err.resendVerifySent")}
                </p>
              ) : (
                <button
                  type="button"
                  className="auth-btn--link"
                  style={{ marginTop: 10, background: "none", border: "none", padding: 0, color: "var(--color-accent)", textDecoration: "underline", cursor: "pointer" }}
                  onClick={handleResend}
                  disabled={resendStatus === "loading"}
                >
                  {resendStatus === "loading"
                    ? t("auth.err.resendVerifyBtn") + "…"
                    : t("auth.err.resendVerifyBtn")}
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleLogin} noValidate>
            <div className={`lfield${emailError ? " has-error" : ""}`}>
              <label htmlFor="login-email" className="lfield-label">
                {t("auth.connexion.emailLabel")}
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder={t("auth.connexion.emailPlaceholder")}
                autoFocus
                className="lfield-input"
                onInput={() => setEmailError("")}
                onBlur={(event) => setEmailError(validerEmail(event.currentTarget.value, t))}
              />
              {emailError && <p className="auth-error-text">{emailError}</p>}
            </div>

            <div className={`lfield${passwordError ? " has-error" : ""}`}>
              <label htmlFor="login-password" className="lfield-label">
                {t("auth.connexion.passwordLabel")}
              </label>
              <div className="lfield-box">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder={showPassword ? t("auth.connexion.passwordPlaceholder") : "••••••••"}
                  className="lfield-input lfield-input--eye"
                  onInput={() => setPasswordError("")}
                  onBlur={(event) => setPasswordError(validerMotDePasse(event.currentTarget.value, t))}
                />
                <button
                  type="button"
                  className="auth-eye"
                  aria-label={showPassword ? t("auth.eyeHide") : t("auth.eyeShow")}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
                </button>
              </div>
              {passwordError && <p className="auth-error-text">{passwordError}</p>}
            </div>

            <div className="lfield-forgot">
              <Link href="/mot-de-passe-oublie">{t("auth.connexion.forgot")}</Link>
            </div>

            <button type="submit" className="auth-btn" disabled={status === "loading"}>
              {status === "loading" ? t("auth.connexion.submitting") : t("auth.connexion.submit")}
              {status !== "loading" && <FaArrowRight className="auth-btn-arrow" aria-hidden="true" />}
            </button>
          </form>

          <div className="auth-footer">
            {t("auth.connexion.footer")}{" "}
            <Link
              href="/inscription"
              onMouseDown={(e) => e.preventDefault()}
            >
              {t("auth.connexion.footerLink")}
            </Link>
          </div>
        </div>

        <PhotoAside />
      </div>
    </div>
  );
}
