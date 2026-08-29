import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { ReservationsSection } from "./reservations-content";

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

  return <ReservationsSection />;
}