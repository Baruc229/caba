"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { FaArrowRight, FaEye, FaEyeSlash, FaCircleInfo } from "react-icons/fa6";

interface ConnexionFormProps {
  echec: boolean;
  succes: boolean;
}

export function ConnexionForm({ echec, succes }: ConnexionFormProps) {
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

    let valid = true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Entrez une adresse email valide.");
      valid = false;
    }
    if (!password) {
      setPasswordError("Saisissez votre mot de passe.");
      valid = false;
    }
    if (!valid) return;

    setStatus("loading");
    try {
      // Flux natuel NextAuth v5 : il redirige lui-même vers /redirection,
      // qui envoie vers /admin (équipe) ou / (client).
      // Identifiants invalides -> retour ici avec ?echec=1.
      await signIn("credentials", { email, password, redirectTo: "/redirection" });
    } catch {
      setError("Une erreur est survenue. Réessayez dans un instant.");
      setStatus("idle");
    }
  }

  return (
    <div className="auth-page-v2">
      <div className="auth-panel">
        <div className="auth-form-col">
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
                className="lfield-input"
                onInput={() => setEmailError("")}
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
                  className="lfield-input lfield-input--eye"
                  onInput={() => setPasswordError("")}
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

        <div className="auth-stats">
          <div className="auth-stat">
            <strong>4.8/5</strong>
            <span>Note moyenne des séjours</span>
          </div>
          <div className="auth-stat">
            <strong>240+</strong>
            <span>Séjours accueillis</span>
          </div>
          <div className="auth-stat">
            <strong>7</strong>
            <span>Types de logements</span>
          </div>
        </div>
      </div>
    </div>
  );
}
