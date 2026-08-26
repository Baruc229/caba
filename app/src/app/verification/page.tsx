import Link from "next/link";
import { FaTriangleExclamation } from "react-icons/fa6";
import "../auth-public.css";

export const metadata = {
  title: "Vérification — Caba Résidence",
};

export default async function VerificationPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; token?: string }>;
}) {
  const { error } = await searchParams;

  const errorMessages: Record<string, string> = {
    missing: "Aucun jeton de vérification fourni.",
    invalid: "Ce lien de vérification est invalide ou a expiré.",
    server: "Une erreur est survenue. Veuillez réessayer.",
  };

  if (error) {
    return (
      <div className="auth-page-v2">
        <div className="auth-panel">
          <div className="auth-main">
            <div className="auth-icon-circle">
              <FaTriangleExclamation aria-hidden="true" />
            </div>
            <h1 className="auth-display auth-display--sm">Lien invalide</h1>
            <p className="auth-subtitle-v2">
              {errorMessages[error] ?? "Une erreur inconnue est survenue."}
            </p>
            <Link href="/connexion" className="auth-btn auth-btn--link">
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-v2">
      <div className="auth-panel">
        <div className="auth-main">
          <h1 className="auth-display auth-display--sm">Vérification en cours…</h1>
          <p className="auth-subtitle-v2">
            Si vous n&apos;êtes pas automatiquement redirigé, votre compte est prêt.
          </p>
          <Link href="/connexion" className="auth-btn auth-btn--link">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
