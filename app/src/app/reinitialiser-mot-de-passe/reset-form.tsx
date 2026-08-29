"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaArrowRight, FaEye, FaEyeSlash } from "react-icons/fa6";
import {
  CriteriaList,
  StrengthMeter,
  scorePassword,
} from "@/components/auth/password-strength";
import { useApp } from "@/components/providers/app-provider";
import { DocumentTitle } from "@/components/seo/document-title";

export function ResetForm({ token }: { token: string }) {
  const router = useRouter();
  const { t } = useApp();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");

  function validateField(name: string, value: string): string {
    switch (name) {
      case "password":
        if (scorePassword(value) < 2 || !/[A-Z]/.test(value)) {
          return t("resetpwd.passwordTooShort");
        }
        return "";
      case "confirm":
        return value === password ? "" : t("resetpwd.passwordMismatch");
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

    const data = new FormData(event.currentTarget);
    const newPassword = String(data.get("password") ?? "");
    const confirm = String(data.get("confirm") ?? "");

    const errors: Record<string, string> = {
      password: validateField("password", newPassword),
      confirm: validateField("confirm", confirm),
    };
    if (Object.values(errors).some(Boolean)) {
      setFieldErrors(errors);
      return;
    }

    setStatus("loading");
    const response = await fetch("/api/auth/reinitialiser-mot-de-passe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: newPassword }),
    });

    if (!response.ok) {
      const body = await response.json();
      setError(body.error ?? t("resetpwd.apiErrorDefault"));
      setStatus("idle");
      return;
    }

    router.replace("/connexion?succes=1");
  }

  function fieldError(name: string) {
    return fieldErrors[name] ? (
      <p className="auth-error-text">{fieldErrors[name]}</p>
    ) : null;
  }

  return (
    <>
      <DocumentTitle titleKey="meta.resetTitle" />
      <p className="auth-eyebrow">{t("resetpwd.resetEyebrow")}</p>
      <h1 className="auth-display auth-display--sm">{t("resetpwd.resetTitle")}</h1>
      <p className="auth-subtitle-v2">
        {t("resetpwd.resetInstructions")}
      </p>

      {error && (
        <p role="alert" className="auth-banner auth-banner--error">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className={`lfield${fieldErrors.password ? " has-error" : ""}`}>
          <label htmlFor="reset-new-password" className="lfield-label">
            {t("resetpwd.newPasswordLabel")}
          </label>
          <div className="lfield-box">
            <input
              id="reset-new-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder={showPassword ? t("resetpwd.newPasswordPlaceholder") : "••••••••"}
              autoFocus
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onBlur={(event) => blurCheck("password", event.target.value)}
              required
              className="lfield-input lfield-input--eye"
            />
            <button
              type="button"
              className="auth-eye"
              aria-label={
                showPassword ? t("resetpwd.hidePassword") : t("resetpwd.showPassword")
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
          <label htmlFor="reset-confirm-password" className="lfield-label">
            {t("resetpwd.confirmPasswordLabel")}
          </label>
          <input
            id="reset-confirm-password"
            name="confirm"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            onBlur={(event) => blurCheck("confirm", event.target.value)}
            onInput={() => {
              if (fieldErrors.confirm) blurCheck("confirm", "");
            }}
            required
            className="lfield-input"
          />
          {fieldError("confirm")}
        </div>

        <button type="submit" className="auth-btn" disabled={status === "loading"}>
          {status === "loading" ? t("resetpwd.savingBtn") : t("resetpwd.resetBtn")}
          {status !== "loading" && (
            <FaArrowRight className="auth-btn-arrow" aria-hidden="true" />
          )}
        </button>
      </form>

      <div className="auth-footer">
        <Link href="/connexion">{t("resetpwd.backToLogin")}</Link>
      </div>
    </>
  );
}
