import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";

export const metadata = {
  title: "Mes réservations — Caba Résidence",
};

export default async function ReservationsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/connexion");
  }
  if (session.user.role !== "client") {
    redirect("/admin");
  }

  return (
    <div className="container-caba py-12">
      <h1 className="heading-display text-2xl mb-4">Mes réservations</h1>
      <p className="text-text-secondary">
        Cette section sera bientôt disponible. Vous pourrez y consulter et gérer
        toutes vos réservations.
      </p>
    </div>
  );
}
