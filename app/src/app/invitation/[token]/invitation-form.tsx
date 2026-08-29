"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaCircleCheck, FaEye, FaEyeSlash } from "react-icons/fa6";
import {
  CriteriaList,
  StrengthMeter,
} from "@/components/auth/password-strength";
import { useApp } from "@/components/providers/app-provider";

export function AccepterInvitationForm({ token }: { token: string }) {
  const router = useRouter();
  const { t } = useApp();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("loading");

    const data = new FormData(event.currentTarget);
    const newPassword = String(data.get("password") ?? "");
    const confirm = String(data.get("confirm") ?? "");

    if (
      newPassword.length < 8 ||
      !/[A-Z]/.test(newPassword) ||
      !/\d/.test(newPassword)
    ) {
      setError(t("invite.errMdpCriteria"));
      setStatus("idle");
      return;
    }
    if (newPassword !== confirm) {
      setError(t("invite.errMdpIdentiques"));
      setStatus("idle");
      return;
    }

    const response = await fetch("/api/admin/users/accepter-invitation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: newPassword }),
    });
    const body = await response.json();

    if (!response.ok) {
      setError(body.error ?? t("invite.errInviteDefaut"));
      setStatus("idle");
      return;
    }

    setSuccess(true);
    setStatus("idle");
  }

  if (success) {
    return (
      <>
        <div className="auth-success-icon" style={{ marginTop: 20 }}>
          <FaCircleCheck aria-hidden="true" />
        </div>
        <h1 className="auth-title" style={{ marginBottom: 10 }}>
          {t("invite.accesActive")}
        </h1>
        <p className="auth-subtitle" style={{ marginBottom: 22 }}>
          {t("invite.connectezVousBackOffice")}
        </p>
        <button
          type="button"
          className="auth-submit"
          onClick={() => router.push("/connexion?next=/admin")}
        >
          {t("invite.seConnecterBackOffice")}
        </button>
        <div className="auth-footer">
          <Link href="/">{t("invite.allerSitePublic")}</Link>
        </div>
      </>
    );
  }

  if (!token) {
    return (
      <>
        <h1 className="auth-title">{t("invite.lienInvalide")}</h1>
        <p className="auth-banner auth-banner--error">
          {t("invite.lienIncomplet")}
        </p>
      </>
    );
  }

  return (
    <>
      <p className="auth-brand" style={{ cursor: "default" }}>
        Caba Résidence
      </p>
      <h1 className="auth-title">{t("invite.definirMotDePasse")}</h1>
      <p className="auth-subtitle" style={{ marginTop: -12, marginBottom: 20 }}>
        {t("invite.bienvenueEquipe")}
      </p>

      {error && (
        <p role="alert" className="auth-banner auth-banner--error">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label htmlFor="inv-password" className="auth-label">
            {t("invite.motDePasse")}
          </label>
          <div className="auth-input-wrap">
            <input
              id="inv-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="auth-input auth-input--with-eye"
            />
            <button
              type="button"
              className="auth-eye"
              aria-label={showPassword ? t("invite.masquer") : t("invite.afficher")}
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
            </button>
          </div>
          <StrengthMeter password={password} />
          <CriteriaList password={password} />
        </div>

        <div className="auth-field">
          <label htmlFor="inv-confirm" className="auth-label">
            {t("invite.confirmerMotDePasse")}
          </label>
          <input
            id="inv-confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            className="auth-input"
          />
        </div>

        <button type="submit" className="auth-submit" disabled={status === "loading"}>
          {status === "loading" ? t("invite.activation") : t("invite.activerAcces")}
        </button>
      </form>
    </>
  );
}
