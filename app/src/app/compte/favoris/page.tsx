import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { FavorisSection } from "./favoris-content";

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

  return <FavorisSection />;
}