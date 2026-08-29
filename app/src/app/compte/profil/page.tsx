import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { ProfilSection } from "./profil-content";

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

  return <ProfilSection />;
}