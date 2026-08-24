import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";

export const metadata = {
  title: "Redirection…",
};

export default async function RedirectionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  if (error) {
    redirect("/connexion?echec=1");
  }

  const session = await auth();

  if (!session?.user) {
    redirect("/connexion");
  }

  if (session.user.role !== "client") {
    redirect("/admin");
  }

  redirect("/");
}
