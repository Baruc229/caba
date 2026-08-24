import { Suspense } from "react";
import { ConnexionForm } from "./connexion-form";
import "../auth-public.css";

export const metadata = {
  title: "Connexion — Caba Résidence",
};

// Rendu immédiat : aucune requête base bloquante ici.
export default function ConnexionPage() {
  return (
    <Suspense>
      <ConnexionForm />
    </Suspense>
  );
}
