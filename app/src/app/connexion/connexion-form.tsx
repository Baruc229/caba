"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export function ConnexionForm({ bootstrap }: { bootstrap: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") ?? "/admin";

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [showBootstrap, setShowBootstrap] = useState(bootstrap);

  async function afterAuth() {
    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();
    const role = session?.user?.role;
    if (!role || role === "client") {
      router.push("/");
      return;
    }
    router.push(nextUrl.startsWith("/admin") ? nextUrl : "/admin");
    router.refresh();
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("loading");

    const form = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setError("Email ou mot de passe incorrect.");
      setStatus("idle");
      return;
    }

    await afterAuth();
  }

  async function handleBootstrap(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setStatus("loading");

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      email: data.get("email"),
      password: data.get("password"),
      nom: data.get("nom"),
      prenom: data.get("prenom"),
      role: "administrateur",
    };

    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.json();
      setError(body.error ?? "Erreur lors de la creation du compte");
      setStatus("idle");
      return;
    }

    setSuccess("Compte administrateur créé. Connexion en cours…");
    form.reset();

    const login = await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirect: false,
    });

    if (login?.error) {
      setError("Compte créé mais connexion impossible. Connectez-vous manuellement.");
      setShowBootstrap(false);
      setStatus("idle");
      return;
    }

    await afterAuth();
  }

  return (
    <div className="bo-auth-card">
      <div className="bo-auth-brand">
        <strong>Caba Résidence</strong>
        <span>Back-office</span>
      </div>

      {error && <p className="bo-form-error">{error}</p>}
      {success && <p className="bo-form-success">{success}</p>}

      <form onSubmit={handleLogin}>
        <div className="bo-field">
          <label htmlFor="login-email" className="bo-label">
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="bo-input"
          />
        </div>
        <div className="bo-field">
          <label htmlFor="login-password" className="bo-label">
            Mot de passe
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="bo-input"
          />
        </div>
        <button type="submit" className="bo-btn bo-btn--primary" disabled={status === "loading"}>
          {status === "loading" ? "Connexion…" : "Se connecter"}
        </button>
      </form>

      {bootstrap && showBootstrap && (
        <>
          <div className="bo-auth-divider">Premier accès</div>

          <form onSubmit={handleBootstrap}>
            <p className="bo-form-hint" style={{ marginBottom: 14 }}>
              Aucun compte équipe n&apos;existe encore. Créez le compte administrateur
              principal — il pourra ensuite ajouter d&apos;autres membres depuis
              « Rôles &amp; Permissions ».
            </p>
            <div className="bo-form-grid">
              <div className="bo-field">
                <label htmlFor="boot-prenom" className="bo-label">
                  Prénom
                </label>
                <input id="boot-prenom" name="prenom" type="text" required className="bo-input" />
              </div>
              <div className="bo-field">
                <label htmlFor="boot-nom" className="bo-label">
                  Nom
                </label>
                <input id="boot-nom" name="nom" type="text" required className="bo-input" />
              </div>
            </div>
            <div className="bo-field">
              <label htmlFor="boot-email" className="bo-label">
                Email
              </label>
              <input
                id="boot-email"
                name="email"
                type="email"
                required
                autoComplete="off"
                defaultValue="schallom229@gmail.com"
                className="bo-input"
              />
            </div>
            <div className="bo-field">
              <label htmlFor="boot-password" className="bo-label">
                Mot de passe
              </label>
              <input
                id="boot-password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="bo-input"
              />
              <p className="bo-form-hint">8 caractères minimum.</p>
            </div>
            <button
              type="submit"
              className="bo-btn bo-btn--primary"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Création…" : "Créer le compte administrateur"}
            </button>
          </form>
        </>
      )}

      {!showBootstrap && bootstrap && (
        <button
          type="button"
          className="bo-btn bo-btn--ghost"
          style={{ width: "100%", marginTop: 12 }}
          onClick={() => setShowBootstrap(true)}
        >
          Créer le premier compte administrateur
        </button>
      )}
    </div>
  );
}
