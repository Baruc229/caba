import { InscriptionForm } from "./inscription-form";
import "../auth-public.css";

export const metadata = {
  title: "Créer un compte — Caba Résidence",
};

// Paramètres lus côté serveur : le HTML complet est envoyé
// immédiatement (formulaire visible avant même l'hydratation).
export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ prenom?: string; nom?: string; telephone?: string }>;
}) {
  const { prenom = "", nom = "", telephone = "" } = await searchParams;

  return (
    <InscriptionForm
      prefillPrenom={prenom}
      prefillNom={nom}
      prefillTelephone={telephone}
    />
  );
}
