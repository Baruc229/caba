import { ConnexionForm } from "./connexion-form";
import "../auth-public.css";

export const metadata = {
  title: "Connexion — Caba Résidence",
};

// Paramètres lus côté serveur : le HTML complet est envoyé
// immédiatement (formulaire visible avant même l'hydratation).
export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ echec?: string; succes?: string; verifie?: string; next?: string }>;
}) {
  const { echec, succes, verifie, next } = await searchParams;

  return (
    <ConnexionForm
      echec={echec === "1"}
      succes={succes === "1"}
      emailVerifie={verifie === "1"}
      next={next}
    />
  );
}
