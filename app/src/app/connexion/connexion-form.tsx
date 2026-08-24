"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import {
  FaArrowRight,
  FaEye,
  FaEyeSlash,
  FaCircleInfo,
  FaStar,
} from "react-icons/fa6";

export function ConnexionForm({ staffExists }: { staffExists: boolean }) {
  const searchParams = useSearchParams();
  const echec = searchParams.get("echec");
  const succes = searchParams.get("succes");

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
    <div className="auth-split">
      {/* Colonne gauche : identité visuelle */}
      <aside className="auth-side">
        <div className="auth-side-shape" aria-hidden="true" />
        <Link href="/" className="auth-brand auth-brand--light">
          Caba Résidence
        </Link>
        <div className="auth-proof">
          <span className="auth-proof-stars" aria-label="Note moyenne 4,8 sur 5">
            <FaStar aria-hidden="true" />
            <FaStar aria-hidden="true" />
            <FaStar aria-hidden="true" />
            <FaStar aria-hidden="true" />
            <FaStar aria-hidden="true" />
          </span>
          <p className="auth-proof-text">
            <strong>4,8/5</strong> — Plus de 120 séjours notés
          </p>
        </div>
      </aside>

      {/* Colonne droite : formulaire */}
      <main className="auth-main">
        <div className="auth-panel">
          <p className="auth-eyebrow">Content de vous revoir</p>
          <h1 className="auth-display">Connexion</h1>

          {!staffExists && (
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
      </main>
    </div>
  );
}
