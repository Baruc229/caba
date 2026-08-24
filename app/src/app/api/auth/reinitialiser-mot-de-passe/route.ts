import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (typeof token !== "string" || !token) {
      return NextResponse.json({ error: "Lien invalide." }, { status: 400 });
    }
    if (
      typeof password !== "string" ||
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/\d/.test(password)
    ) {
      return NextResponse.json(
        { error: "Le mot de passe ne respecte pas les critères de sécurité." },
        { status: 400 }
      );
    }

    const tokenHash = createHash("sha256").update(token).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        resetTokenHash: tokenHash,
        resetExpire: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Lien invalide ou expiré. Faites une nouvelle demande." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetTokenHash: null,
        resetExpire: null,
        tentativesEchouees: 0,
        verrouilleJusqua: null,
      },
    });

    return NextResponse.json({ message: "Mot de passe mis à jour." });
  } catch (error) {
    console.error("Erreur reinitialisation mot de passe:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
