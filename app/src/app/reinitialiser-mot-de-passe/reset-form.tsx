"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CriteriaList,
  StrengthMeter,
  scorePassword,
} from "@/components/auth/password-strength";

export function ResetForm({ token }: { token: string }) {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");

  function validateField(name: string, value: string): string {
    switch (name) {
      case "password":
        if (scorePassword(value) < 2 || !/[A-Z]/.test(value)) {
          return "Le mot de passe ne respecte pas encore les critères.";
        }
        return "";
      case "confirm":
        return value === password ? "" : "Les mots de passe ne correspondent pas.";
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
      setError(body.error ?? "Lien invalide ou expiré. Faites une nouvelle demande.");
      setStatus("idle");
      return;
    }

    // Redirection vers la connexion avec confirmation — sans connexion
    // automatique : l'utilisateur vérifie lui-même son nouveau mot de passe.
    router.replace("/connexion?succes=1");
  }

  function fieldError(name: string) {
    return fieldErrors[name] ? (
      <p className="auth-error-text">{fieldErrors[name]}</p>
    ) : null;
  }

  return (
    <>
      <p className="auth-eyebrow">Dernière étape</p>
      <h1 className="auth-display auth-display--sm">Nouveau mot de passe</h1>
      <p className="auth-subtitle-v2">
        Choisissez un nouveau mot de passe — vous vous connecterez ensuite avec celui-ci.
      </p>

      {error && (
        <p role="alert" className="auth-banner auth-banner--error">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className={`lfield${fieldErrors.password ? " has-error" : ""}`}>
          <label htmlFor="reset-new-password" className="lfield-label">
            Nouveau mot de passe
          </label>
          <input
            id="reset-new-password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onBlur={(event) => blurCheck("password", event.target.value)}
            required
            className="lfield-input"
          />
          <StrengthMeter password={password} />
          <CriteriaList password={password} />
          {fieldError("password")}
        </div>

        <div className={`lfield${fieldErrors.confirm ? " has-error" : ""}`}>
          <label htmlFor="reset-confirm-password" className="lfield-label">
            Confirmer le mot de passe
          </label>
          <input
            id="reset-confirm-password"
            name="confirm"
            type="password"
            autoComplete="new-password"
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
          {status === "loading" ? "Enregistrement…" : "Réinitialiser le mot de passe"}
        </button>
      </form>

      <div className="auth-footer">
        <Link href="/connexion">Retour à la connexion</Link>
      </div>
    </>
  );
}
