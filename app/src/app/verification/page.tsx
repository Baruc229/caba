import { Suspense } from "react";
import { VerificationContent } from "./verification-content";
import "../auth-public.css";

export const metadata = {
  title: "Vérification — Caba Résidence",
};

export default function VerificationPage() {
  return (
    <Suspense>
      <VerificationContent />
    </Suspense>
  );
}
