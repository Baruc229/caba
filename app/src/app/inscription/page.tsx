import { Suspense } from "react";
import { InscriptionForm } from "./inscription-form";
import "../auth-public.css";

export const metadata = {
  title: "Créer un compte — Caba Résidence",
};

export default function InscriptionPage() {
  return (
    <div className="auth-page">
      <Suspense fallback={<p className="auth-subtitle">Chargement…</p>}>
        <InscriptionForm />
      </Suspense>
    </div>
  );
}
