"use client";

import { useState } from "react";
import Link from "next/link";
import { FaArrowRight, FaEye, FaEyeSlash, FaCircleCheck, FaEnvelope } from "react-icons/fa6";
import { PhotoAside } from "@/components/auth/photo-aside";
import {
  CriteriaList,
  StrengthMeter,
  scorePassword,
} from "@/components/auth/password-strength";
import { useApp } from "@/components/providers/app-provider";
import { DocumentTitle } from "@/components/seo/document-title";

interface InscriptionFormProps {
  prefillPrenom: string;
  prefillNom: string;
  prefillTelephone: string;
}

export function InscriptionForm({
  prefillPrenom,
  prefillNom,
  prefillTelephone,
}: InscriptionFormProps) {
  const { t } = useApp();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");
  const [emailExists, setEmailExists] = useState(false);
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validateField(name: string, value: string): string {
    switch (name) {
      case "prenom":
        return value.trim() ? "" : t("auth.err.prenom");
      case "nom":
        return value.trim() ? "" : t("auth.err.nom");
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
          ? ""
          : t("auth.err.emailFormat");
      case "password":
        if (scorePassword(value) < 2 || !/[A-Z]/.test(value)) {
          return t("auth.err.password");
        }
        return "";
      case "confirm":
        return value === password ? "" : t("auth.err.confirm");
      default:
        return "";
    }
  }

  function blurCheck(name: string, value: string) {
    setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setEmailExists(false);

    const form = event.currentTarget;
    const data = new FormData(form);
    const values = {
      prenom: String(data.get("prenom") ?? ""),
      nom: String(data.get("nom") ?? ""),
      email: String(data.get("email") ?? "").trim(),
      telephone: String(data.get("telephone") ?? "").trim(),
      password: String(data.get("password") ?? ""),
      confirm: String(data.get("confirm") ?? ""),
      cgv: data.get("cgv") === "on",
      marketing: data.get("marketing") === "on",
    };

    const errors: Record<string, string> = {
      prenom: validateField("prenom", values.prenom),
      nom: validateField("nom", values.nom),
      email: validateField("email", values.email),
      password: validateField("password", values.password),
      confirm: validateField("confirm", values.confirm),
      cgv: values.cgv ? "" : t("auth.err.cgv"),
    };

    if (Object.values(errors).some(Boolean)) {
      setFieldErrors(errors);
      return;
    }

    setStatus("loading");
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: values.email,
        password: values.password,
        nom: values.nom.trim(),
        prenom: values.prenom.trim(),
        telephone: values.telephone || undefined,
        cgvAcceptees: true,
        marketingOptIn: values.marketing,
      }),
    });

    if (response.status === 409) {
      setEmailExists(true);
      setStatus("idle");
      return;
    }

    if (!response.ok) {
      const body = await response.json();
      setError(body.error ?? t("auth.err.apiCreate"));
      setStatus("idle");
      return;
    }

    const result = await response.json();
    setVerifyUrl(result.verifyUrl ?? null);
    setEmailSent(result.emailSent !== false);
    setStatus("idle");
  }

  function fieldError(name: string) {
    return fieldErrors[name] ? (
      <p className="auth-error-text">{fieldErrors[name]}</p>
    ) : null;
  }

  if (emailExists) {
    return (
      <div className="auth-page-v2">
        <DocumentTitle titleKey="meta.inscriptionTitle" />
        <div className="auth-panel">
          <div className="auth-main">
            <p className="auth-eyebrow">{t("auth.exists.eyebrow")}</p>
            <h1 className="auth-display">{t("auth.exists.title")}</h1>
            <p role="alert" className="auth-banner auth-banner--error">
              {t("auth.exists.message")}
            </p>
            <p className="auth-subtitle-v2">
              {t("auth.exists.subtitle")}
            </p>
            <Link href="/connexion" className="auth-btn auth-btn--link">
              {t("auth.exists.link")}
              <FaArrowRight className="auth-btn-arrow" aria-hidden="true" />
            </Link>
          </div>
          <PhotoAside />
        </div>
      </div>
    );
  }

  if (verifyUrl) {
    return (
      <div className="auth-page-v2">
        <DocumentTitle titleKey="meta.inscriptionTitle" />
        <div className="auth-panel">
          <div className="auth-main">
            <div className="auth-success-icon">
              <FaEnvelope aria-hidden="true" />
            </div>
            <p className="auth-eyebrow">{t("auth.verify.eyebrow")}</p>
            <h1 className="auth-display auth-display--sm">{t("auth.verify.title")}</h1>

            {emailSent ? (
              <>
                <p className="auth-subtitle-v2">
                  {t("auth.verify.sent")}
                </p>
                <p className="auth-subtitle-v2" style={{ marginTop: 12, fontSize: 13 }}>
                  {t("auth.verify.notReceived")}{" "}
                  <Link href={`/verification?resend=${encodeURIComponent(verifyUrl.split("token=")[1] || "")}`}>
                    {t("auth.verify.resend")}
                  </Link>
                </p>
              </>
            ) : (
              <>
                <p className="auth-subtitle-v2">
                  {t("auth.verify.notSent")}
                </p>
                <a href={verifyUrl} className="auth-btn" style={{ marginTop: 16 }}>
                  <FaCircleCheck aria-hidden="true" />
                  {t("auth.verify.activate")}
                </a>
                <p className="auth-subtitle-v2" style={{ marginTop: 12, fontSize: 13 }}>
                  {t("auth.verify.valid24")}
                </p>
              </>
            )}

            <Link href="/connexion" className="auth-btn auth-btn--link" style={{ marginTop: 16 }}>
              {t("auth.verify.back")}
            </Link>
          </div>
          <PhotoAside />
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-v2">
      <DocumentTitle titleKey="meta.inscriptionTitle" />
      <div className="auth-panel">
        <div className="auth-main">
          <p className="auth-eyebrow">{t("auth.inscription.eyebrow")}</p>
          <h1 className="auth-display">{t("auth.inscription.title")}</h1>
          <p className="auth-subtitle-v2">
            {t("auth.inscription.subtitle")}
          </p>

          {error && (
            <p role="alert" className="auth-banner auth-banner--error">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <section className="lsection">
              <p className="lsection-title">{t("auth.inscription.identite")}</p>
              <div className="lrow-2">
                <div className={`lfield${fieldErrors.prenom ? " has-error" : ""}`}>
                  <label htmlFor="ins-prenom" className="lfield-label">
                    {t("auth.inscription.prenomLabel")}
                  </label>
                  <input
                    id="ins-prenom"
                    name="prenom"
                    type="text"
                    autoComplete="given-name"
                    defaultValue={prefillPrenom}
                    autoFocus
                    onBlur={(event) => blurCheck("prenom", event.target.value)}
                    onInput={() => {
                      if (fieldErrors.prenom) blurCheck("prenom", "");
                    }}
                    className="lfield-input"
                  />
                  {fieldError("prenom")}
                </div>

                <div className={`lfield${fieldErrors.nom ? " has-error" : ""}`}>
                  <label htmlFor="ins-nom" className="lfield-label">
                    {t("auth.inscription.nomLabel")}
                  </label>
                  <input
                    id="ins-nom"
                    name="nom"
                    type="text"
                    autoComplete="family-name"
                    defaultValue={prefillNom}
                    onBlur={(event) => blurCheck("nom", event.target.value)}
                    onInput={() => {
                      if (fieldErrors.nom) blurCheck("nom", "");
                    }}
                    className="lfield-input"
                  />
                  {fieldError("nom")}
                </div>
              </div>
            </section>

            <section className="lsection">
              <p className="lsection-title">{t("auth.inscription.joindre")}</p>
              <div className="lrow-2">
                <div className={`lfield${fieldErrors.email ? " has-error" : ""}`}>
                  <label htmlFor="ins-email" className="lfield-label">
                    {t("auth.inscription.emailLabel")}
                  </label>
                  <input
                    id="ins-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder={t("auth.inscription.emailPlaceholder")}
                    onBlur={(event) => blurCheck("email", event.target.value)}
                    onInput={() => {
                      if (fieldErrors.email) blurCheck("email", "");
                    }}
                    className="lfield-input"
                  />
                  {fieldError("email")}
                </div>

                <div className="lfield">
                  <label htmlFor="ins-telephone" className="lfield-label">
                    {t("auth.inscription.telephoneLabel")}
                  </label>
                  <input
                    id="ins-telephone"
                    name="telephone"
                    type="tel"
                    autoComplete="tel"
                    defaultValue={prefillTelephone}
                    placeholder={t("auth.inscription.telephonePlaceholder")}
                    className="lfield-input"
                  />
                </div>
              </div>
            </section>

            <section className="lsection">
              <p className="lsection-title">{t("auth.inscription.securite")}</p>
              <div className={`lfield${fieldErrors.password ? " has-error" : ""}`}>
                <label htmlFor="ins-password" className="lfield-label">
                  {t("auth.inscription.passwordLabel")}
                </label>
                <div className="lfield-box">
                  <input
                    id="ins-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder={showPassword ? t("auth.inscription.passwordPlaceholder") : "••••••••"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    onBlur={(event) => blurCheck("password", event.target.value)}
                    className="lfield-input lfield-input--eye"
                  />
                  <button
                    type="button"
                    className="auth-eye"
                    aria-label={
                      showPassword ? t("auth.eyeHide") : t("auth.eyeShow")
                    }
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? (
                      <FaEyeSlash aria-hidden="true" />
                    ) : (
                      <FaEye aria-hidden="true" />
                    )}
                  </button>
                </div>
                <StrengthMeter password={password} />
                <CriteriaList password={password} />
                {fieldError("password")}
              </div>

              <div className={`lfield${fieldErrors.confirm ? " has-error" : ""}`}>
                <label htmlFor="ins-confirm" className="lfield-label">
                  {t("auth.inscription.confirmLabel")}
                </label>
                <input
                  id="ins-confirm"
                  name="confirm"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  onBlur={(event) => blurCheck("confirm", event.target.value)}
                  onInput={() => {
                    if (fieldErrors.confirm) blurCheck("confirm", "");
                  }}
                  className="lfield-input"
                />
                {fieldError("confirm")}
              </div>
            </section>

            <label className={`auth-check${fieldErrors.cgv ? " has-error" : ""}`}>
              <input id="ins-cgv" name="cgv" type="checkbox" />
              <span>
                {t("auth.inscription.cgvPre")}{" "}
                <a href="/pages/conditions-generales">{t("auth.inscription.cgvLink")}</a>{" "}
                {t("auth.inscription.cgvMiddle")}{" "}
                <a href="/pages/politique-confidentialite">{t("auth.inscription.cgvConfLink")}</a>
                {t("auth.inscription.cgvPost")}
              </span>
            </label>
            {fieldError("cgv")}

            <label className="auth-check">
              <input name="marketing" type="checkbox" />
              <span>{t("auth.inscription.marketing")}</span>
            </label>

            <button type="submit" className="auth-btn" disabled={status === "loading"}>
              {status === "loading" ? t("auth.inscription.submitting") : t("auth.inscription.submit")}
              {status !== "loading" && (
                <FaArrowRight className="auth-btn-arrow" aria-hidden="true" />
              )}
            </button>
          </form>

          <div className="auth-footer">
            {t("auth.inscription.footer")}{" "}
            <Link
              href="/connexion"
              onMouseDown={(e) => e.preventDefault()}
            >
              {t("auth.inscription.footerLink")}
            </Link>
          </div>
        </div>

        <PhotoAside />
      </div>
    </div>
  );
}
