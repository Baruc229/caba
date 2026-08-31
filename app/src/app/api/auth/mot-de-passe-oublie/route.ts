import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendResetPasswordEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (typeof email === "string" && email.includes("@")) {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (user && user.actif) {
        const token = randomBytes(32).toString("hex");
        const tokenHash = createHash("sha256").update(token).digest("hex");

        await prisma.user.update({
          where: { id: user.id },
          data: {
            resetTokenHash: tokenHash,
            resetExpire: new Date(Date.now() + 60 * 60 * 1000),
          },
        });

        const origin = request.nextUrl.origin;
        await sendResetPasswordEmail({
          to: user.email,
          prenom: user.prenom,
          lien: `${origin}/reinitialiser-mot-de-passe?token=${token}`,
        });
      }
    }

    return NextResponse.json({ message: "Demande traitée." });
  } catch (error) {
    console.error("Erreur mot de passe oublie:", error);
    // Réponse générique même en cas d'erreur interne
    return NextResponse.json({ message: "Demande traitée." });
  }
}
