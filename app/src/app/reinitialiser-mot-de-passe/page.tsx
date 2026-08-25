import Link from "next/link";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { PhotoAside } from "@/components/auth/photo-aside";
import { ResetForm } from "./reset-form";
import "../auth-public.css";

export const metadata = {
  title: "Nouveau mot de passe — Caba Résidence",
};

function TokenInvalide() {
  return (
    <div className="auth-min">
      <div className="auth-panel">
        <div className="auth-main">
          <p className="auth-eyebrow">Pas d&apos;inquiétude</p>
          <h1 className="auth-display auth-display--sm">Lien expiré</h1>
          <p className="auth-subtitle-v2">
            Ce lien de réinitialisation est invalide ou a expiré — pour votre sécurité, il
            n&apos;est valable qu&apos;une heure et une seule utilisation.
          </p>
          <Link href="/mot-de-passe-oublie" className="auth-btn auth-btn--link">
            Demander un nouveau lien
          </Link>
        </div>
        <PhotoAside />
      </div>
    </div>
  );
}

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
