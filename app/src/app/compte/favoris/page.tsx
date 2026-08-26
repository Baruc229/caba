import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";

export const metadata = {
  title: "Mes favoris — Caba Résidence",
};

export default async function FavorisPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/connexion");
  }
  if (session.user.role !== "client") {
    redirect("/admin");
  }

  return (
    <div className="container-caba py-12">
      <h1 className="heading-display text-2xl mb-4">Mes favoris</h1>
      <p className="text-text-secondary">
        Cette section sera bientôt disponible. Vous pourrez y consulter les
        logements que vous avez ajoutés à vos favoris.
      </p>
    </div>
  );
}
