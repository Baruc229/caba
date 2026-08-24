"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { FaArrowRight, FaEye, FaEyeSlash } from "react-icons/fa6";
import {
  CriteriaList,
  StrengthMeter,
  scorePassword,
} from "@/components/auth/password-strength";

export function InscriptionForm() {
  const searchParams = useSearchParams();

  // Pré-remplissage depuis le lien WhatsApp (prenom, nom, telephone)
  const prefillPrenom = searchParams.get("prenom") ?? "";
  const prefillNom = searchParams.get("nom") ?? "";
  const prefillTelephone = searchParams.get("telephone") ?? "";

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");
  const [emailExists, setEmailExists] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validateField(name: string, value: string): string {
    switch (name) {
      case "prenom":
        return value.trim() ? "" : "Votre prénom nous est nécessaire pour vous accueillir.";
      case "nom":
        return value.trim() ? "" : "Votre nom est nécessaire pour réserver.";
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
          ? ""
          : "Entrez une adresse email valide.";
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

  // Validation "on blur" : le message apparaît en quittant le champ
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
      cgv: values.cgv ? "" : "Vous devez accepter les CGV pour continuer.",
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
      setError(body.error ?? "Erreur lors de la creation du compte.");
      setStatus("idle");
      return;
    }

    // Connexion automatique puis redirection (client -> site public)
    try {
      await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirectTo: "/",
      });
    } catch {
      setStatus("idle");
      setError(
        "Compte créé, mais la connexion automatique a échoué. Connectez-vous manuellement."
      );
    }
  }

  function fieldError(name: string) {
    return fieldErrors[name] ? (
      <p className="auth-error-text">{fieldErrors[name]}</p>
    ) : null;
  }

  if (emailExists) {
    return (
      <div className="auth-page-v2">
        <div className="auth-panel auth-panel--wide">
          <Link href="/" className="auth-brand">
            Caba Résidence
          </Link>
          <p className="auth-eyebrow">Déjà parmi nous ?</p>
          <h1 className="auth-display">Profil existant</h1>
          <p role="alert" className="auth-banner auth-banner--error">
            Un profil existe déjà avec cet email.
          </p>
          <p className="auth-subtitle-v2">
            Connectez-vous directement — ou utilisez « Mot de passe oublié ? » si besoin.
          </p>
          <Link href="/connexion" className="auth-btn auth-btn--link">
            Se connecter
            <FaArrowRight className="auth-btn-arrow" aria-hidden="true" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-v2">
      {/* Page continue : identité -> contact -> sécurité, sans étapes */}
      <div className="auth-panel auth-panel--wide">
        <Link href="/" className="auth-brand">
          Caba Résidence
        </Link>
        <p className="auth-eyebrow">Bienvenue chez nous</p>
          <h1 className="auth-display">Créez votre profil</h1>
          <p className="auth-subtitle-v2">
            Quelques informations, pour vous accueillir comme il se doit.
          </p>

          {error && (
            <p role="alert" className="auth-banner auth-banner--error">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <section className="lsection">
              <p className="lsection-title">Votre identité</p>
              <div className="lrow-2">
                <div className={`lfield${fieldErrors.prenom ? " has-error" : ""}`}>
                  <label htmlFor="ins-prenom" className="lfield-label">
                    Prénom *
                  </label>
                  <input
                    id="ins-prenom"
                    name="prenom"
                    type="text"
                    autoComplete="given-name"
                    defaultValue={prefillPrenom}
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
                    Nom *
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
              <p className="lsection-title">Comment vous joindre</p>
              <div className="lrow-2">
                <div className={`lfield${fieldErrors.email ? " has-error" : ""}`}>
                  <label htmlFor="ins-email" className="lfield-label">
                    Email *
                  </label>
                  <input
                    id="ins-email"
                    name="email"
                    type="email"
                    autoComplete="email"
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
                    Téléphone / WhatsApp
                  </label>
                  <input
                    id="ins-telephone"
                    name="telephone"
                    type="tel"
                    autoComplete="tel"
                    defaultValue={prefillTelephone}
                    placeholder="+229 …"
                    className="lfield-input"
                  />
                </div>
              </div>
            </section>

            <section className="lsection">
              <p className="lsection-title">Sécurité</p>
              <div className={`lfield${fieldErrors.password ? " has-error" : ""}`}>
                <label htmlFor="ins-password" className="lfield-label">
                  Mot de passe *
                </label>
                <div className="lfield-box">
                  <input
                    id="ins-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    onBlur={(event) => blurCheck("password", event.target.value)}
                    className="lfield-input lfield-input--eye"
                  />
                  <button
                    type="button"
                    className="auth-eye"
                    aria-label={
                      showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
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
                  Confirmer le mot de passe *
                </label>
                <input
                  id="ins-confirm"
                  name="confirm"
                  type="password"
                  autoComplete="new-password"
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
                J&apos;accepte les{" "}
                <a href="/pages/conditions-generales">conditions générales de vente</a> et la{" "}
                <a href="/pages/politique-confidentialite">politique de confidentialité</a>. *
              </span>
            </label>
            {fieldError("cgv")}

            <label className="auth-check">
              <input name="marketing" type="checkbox" />
              <span>Je souhaite recevoir les actualités et offres de Caba Résidence.</span>
            </label>

            <button type="submit" className="auth-btn" disabled={status === "loading"}>
              {status === "loading" ? "Création…" : "Créer mon profil"}
              {status !== "loading" && (
                <FaArrowRight className="auth-btn-arrow" aria-hidden="true" />
              )}
            </button>
          </form>

          <div className="auth-footer">
            Déjà un profil chez nous ? <Link href="/connexion">Se connecter</Link>
          </div>
      </div>
    </div>
  );
}
