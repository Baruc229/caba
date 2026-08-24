import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { AdminShell } from "@/components/admin/admin-shell";
import "./admin.css";

export const metadata = {
  title: "Back-office — Caba Résidence",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/connexion");
  }
  if (session.user.role === "client") {
    redirect("/");
  }

  return (
    <AdminShell
      user={{
        prenom: session.user.prenom,
        nom: session.user.nom,
        role: session.user.role,
      }}
    >
      {children}
    </AdminShell>
  );
}
