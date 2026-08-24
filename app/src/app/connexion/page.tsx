import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ConnexionForm } from "./connexion-form";
import "../auth-public.css";

export const metadata = {
  title: "Connexion — Caba Résidence",
};

export const dynamic = "force-dynamic";

export default async function ConnexionPage() {
  // La page sert au site public ET au back-office : on garde la session
  // existante si présente pour éviter une double connexion inutile.
  const staffCount = await prisma.user.count({
    where: { role: { not: "client" } },
  });

  return (
    <div className="auth-page">
      <Suspense>
        <ConnexionForm staffExists={staffCount > 0} />
      </Suspense>
    </div>
  );
}
