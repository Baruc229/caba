import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ConnexionForm } from "./connexion-form";
import "@/app/admin/admin.css";

export const metadata = {
  title: "Connexion — Caba Résidence",
};

export const dynamic = "force-dynamic";

export default async function ConnexionPage() {
  const staffCount = await prisma.user.count({
    where: { role: { not: "client" } },
  });

  return (
    <div className="bo-auth">
      <Suspense>
        <ConnexionForm bootstrap={staffCount === 0} />
      </Suspense>
    </div>
  );
}
