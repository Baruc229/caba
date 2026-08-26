"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { FaArrowRight, FaEye, FaEyeSlash, FaCircleInfo } from "react-icons/fa6";
import { PhotoAside } from "@/components/auth/photo-aside";

interface ConnexionFormProps {
  echec: boolean;
  succes: boolean;
  emailVerifie?: boolean;
}

function validerEmail(valeur: string): string {
  const email = valeur.trim();
  if (!email) return "Saisissez votre adresse email.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "L'adresse email doit contenir un @ suivi d'un domaine (ex : nom@exemple.com).";
  }
  return "";
}

function validerMotDePasse(valeur: string): string {
  if (!valeur) return "Saisissez votre mot de passe.";
  return "";
}

export function ConnexionForm({ echec, succes, emailVerifie }: ConnexionFormProps) {
  // Contrôle différé après le premier rendu (page instantanée)
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
    echec
      ? "Identifiants incorrects. Vérifiez votre email et votre mot de passe — ou réinitialisez-le via « Mot de passe oublié ? »."
      : ""
  );
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setEmailError("");
    setPasswordError("");

    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");

    const erreurEmail = validerEmail(email);
    const erreurMotDePasse = validerMotDePasse(password);
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
        const errorMap: Record<string, string> = {
          CredentialsSignin:
            "Email ou mot de passe incorrect. Vérifiez vos identifiants ou réinitialisez votre mot de passe.",
        };
        setError(
          errorMap[result.error] ??
            "Une erreur est survenue lors de la connexion. Veuillez réessayer."
        );
        setStatus("idle");
        return;
      }

      if (result?.url) {
        window.location.href = result.url;
      } else {
        window.location.href = "/redirection";
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Erreur inattendue : ${msg}`);
      setStatus("idle");
    }
  }

  return (
    <div className="auth-page-v2">
      <div className="auth-panel">
        <div className="auth-main">
          <p className="auth-eyebrow">Content de vous revoir</p>
          <h1 className="auth-display">Connexion</h1>

          {staffManquant && (
            <div className="auth-banner auth-banner--success" style={{ display: "flex", gap: 8 }}>
              <FaCircleInfo aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
              <span>
                Aucun compte équipe n&apos;existe encore. Le compte administrateur principal
                doit être créé via le script local (voir documentation du projet).
              </span>
            </div>
          )}

          {succes && (
            <p role="status" className="auth-banner auth-banner--success">
              Votre mot de passe a bien été modifié. Connectez-vous avec vos nouveaux
              identifiants.
            </p>
          )}

          {emailVerifie && (
            <p role="status" className="auth-banner auth-banner--success">
              Votre email a été vérifié avec succès. Vous pouvez maintenant vous connecter.
            </p>
          )}

          {error && (
            <p role="alert" className="auth-banner auth-banner--error">
              {error}
            </p>
          )}

          <form onSubmit={handleLogin} noValidate>
            <div className={`lfield${emailError ? " has-error" : ""}`}>
              <label htmlFor="login-email" className="lfield-label">
                Email
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="nom@exemple.com"
                autoFocus
                className="lfield-input"
                onInput={() => setEmailError("")}
                onBlur={(event) => setEmailError(validerEmail(event.currentTarget.value))}
              />
              {emailError && <p className="auth-error-text">{emailError}</p>}
            </div>

            <div className={`lfield${passwordError ? " has-error" : ""}`}>
              <label htmlFor="login-password" className="lfield-label">
                Mot de passe
              </label>
              <div className="lfield-box">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder={showPassword ? "Votre mot de passe" : "••••••••"}
                  className="lfield-input lfield-input--eye"
                  onInput={() => setPasswordError("")}
                  onBlur={(event) => setPasswordError(validerMotDePasse(event.currentTarget.value))}
                />
                <button
                  type="button"
                  className="auth-eye"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
                </button>
              </div>
              {passwordError && <p className="auth-error-text">{passwordError}</p>}
            </div>

            <div className="lfield-forgot">
              <Link href="/mot-de-passe-oublie">Mot de passe oublié ?</Link>
            </div>

            <button type="submit" className="auth-btn" disabled={status === "loading"}>
              {status === "loading" ? "Connexion…" : "Continuer"}
              {status !== "loading" && <FaArrowRight className="auth-btn-arrow" aria-hidden="true" />}
            </button>
          </form>

          <div className="auth-footer">
            Pas encore de profil chez nous ? <Link href="/inscription">S&apos;inscrire</Link>
          </div>
        </div>

        <PhotoAside />
      </div>
    </div>
  );
}
