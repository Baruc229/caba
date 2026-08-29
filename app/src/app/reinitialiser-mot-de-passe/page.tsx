import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { PhotoAside } from "@/components/auth/photo-aside";
import { ResetForm } from "./reset-form";
import { TokenInvalide } from "./token-invalide";
import "../auth-public.css";

export const metadata = {
  title: "Nouveau mot de passe — Caba Résidence",
};

export default async function ReinitialiserMotDePassePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return <TokenInvalide />;
  }

  // Validation côté serveur AVANT d'afficher le formulaire
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const user = await prisma.user.findFirst({
    where: { resetTokenHash: tokenHash, resetExpire: { gt: new Date() } },
    select: { id: true },
  });

  if (!user) {
    return <TokenInvalide />;
  }

  return (
    <div className="auth-min">
      <div className="auth-panel">
        <div className="auth-main">
          <ResetForm token={token} />
        </div>
        <PhotoAside />
      </div>
    </div>
  );
}
