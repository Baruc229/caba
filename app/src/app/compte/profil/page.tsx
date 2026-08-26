import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";

export const metadata = {
  title: "Mon profil — Caba Résidence",
};

export default async function ProfilPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/connexion");
  }
  if (session.user.role !== "client") {
    redirect("/admin");
  }

  return (
    <div className="container-caba py-12">
      <h1 className="heading-display text-2xl mb-4">Mon profil</h1>
      <p className="text-text-secondary">
        Cette section sera bientôt disponible. Vous pourrez y gérer vos
        informations personnelles, changer votre mot de passe et vos
        préférences de notification.
      </p>
    </div>
  );
}
