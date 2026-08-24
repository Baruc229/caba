"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { FaEye, FaEyeSlash, FaCircleCheck } from "react-icons/fa6";
import {
  CriteriaList,
  StrengthMeter,
  scorePassword,
} from "@/components/auth/password-strength";

export function InscriptionForm() {
  const router = useRouter();
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setEmailExists(false);
    setFieldErrors({});

    const form = event.currentTarget;
    const data = new FormData(form);
    const values = {
      prenom: String(data.get("prenom") ?? "").trim(),
      nom: String(data.get("nom") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      telephone: String(data.get("telephone") ?? "").trim(),
      password: String(data.get("password") ?? ""),
      confirm: String(data.get("confirm") ?? ""),
      cgv: data.get("cgv") === "on",
      marketing: data.get("marketing") === "on",
    };

    const errors: Record<string, string> = {};
    if (!values.prenom) errors.prenom = "Prénom obligatoire.";
    if (!values.nom) errors.nom = "Nom obligatoire.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = "Entrez une adresse email valide.";
    }
    if (scorePassword(values.password) < 2 || !/[A-Z]/.test(values.password)) {
      errors.password = "Le mot de passe ne respecte pas les critères.";
    }
    if (values.password !== values.confirm) {
      errors.confirm = "Les mots de passe ne correspondent pas.";
    }
    if (!values.cgv) {
      errors.cgv = "Vous devez accepter les CGV pour continuer.";
    }
    if (Object.keys(errors).length > 0) {
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
        nom: values.nom,
        prenom: values.prenom,
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
    const login = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (login?.error) {
      router.push("/connexion");
      return;
    }

    router.push("/");
    router.refresh();
  }

  function fieldError(name: string) {
    return fieldErrors[name] ? (
      <p className="auth-error-text">{fieldErrors[name]}</p>
    ) : null;
  }

  if (emailExists) {
    return (
      <div className="auth-card">
        <Link href="/" className="auth-brand">
          Caba Résidence
        </Link>
        <h1 className="auth-title">Compte déjà existant</h1>
        <p className="auth-banner auth-banner--error" style={{ display: "block" }}>
          Un compte existe déjà avec cet email.
        </p>
        <p className="auth-subtitle" style={{ marginTop: -6 }}>
          Connectez-vous directement — ou utilisez « Mot de passe oublié ? » si nécessaire.
        </p>
        <Link href="/connexion" className="auth-submit" style={{ textAlign: "center", display: "block", textDecoration: "none" }}>
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <Link href="/" className="auth-brand">
        Caba Résidence
      </Link>
      <h1 className="auth-title">Créer un compte</h1>

      {error && (
        <p role="alert" className="auth-banner auth-banner--error">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label htmlFor="ins-prenom" className="auth-label">
            Prénom *
          </label>
          <input
            id="ins-prenom"
            name="prenom"
            type="text"
            autoComplete="given-name"
            defaultValue={prefillPrenom}
            className="auth-input"
          />
          {fieldError("prenom")}
        </div>

        <div className="auth-field">
          <label htmlFor="ins-nom" className="auth-label">
            Nom *
          </label>
          <input
            id="ins-nom"
            name="nom"
            type="text"
            autoComplete="family-name"
            defaultValue={prefillNom}
            className="auth-input"
          />
          {fieldError("nom")}
        </div>

        <div className="auth-field">
          <label htmlFor="ins-email" className="auth-label">
            Email *
          </label>
          <input
            id="ins-email"
            name="email"
            type="email"
            autoComplete="email"
            className="auth-input"
          />
          {fieldError("email")}
        </div>

        <div className="auth-field">
          <label htmlFor="ins-telephone" className="auth-label">
            Téléphone
          </label>
          <input
            id="ins-telephone"
            name="telephone"
            type="tel"
            autoComplete="tel"
            defaultValue={prefillTelephone}
            placeholder="+229 …"
            className="auth-input"
          />
        </div>

        <div className="auth-field">
          <label htmlFor="ins-password" className="auth-label">
            Mot de passe *
          </label>
          <div className="auth-input-wrap">
            <input
              id="ins-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="auth-input auth-input--with-eye"
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
          <StrengthMeter password={password} />
          <CriteriaList password={password} />
          {fieldError("password")}
        </div>

        <div className="auth-field">
          <label htmlFor="ins-confirm" className="auth-label">
            Confirmer le mot de passe *
          </label>
          <input
            id="ins-confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            className="auth-input"
          />
          {fieldError("confirm")}
        </div>

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
          <span>J&apos;accepte de recevoir les actualités et offres de Caba Résidence.</span>
        </label>

        <button type="submit" className="auth-submit" disabled={status === "loading"}>
          {status === "loading" ? (
            "Création…"
          ) : (
            <>
              <FaCircleCheck aria-hidden="true" style={{ marginRight: 8 }} />
              Créer mon compte
            </>
          )}
        </button>
      </form>

      <div className="auth-footer">
        Déjà un compte ? <Link href="/connexion">Se connecter</Link>
      </div>
    </div>
  );
}
