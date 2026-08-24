import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createHash } from "crypto";
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
        { error: "Le mot de passe ne respecte pas les criteres de securite." },
        { status: 400 }
      );
    }

    const tokenHash = createHash("sha256").update(token).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        invitationToken: tokenHash,
        invitationExpire: { gt: new Date() },
        actif: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invitation invalide ou expiree. Demandez une nouvelle invitation." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        invitationToken: null,
        invitationExpire: null,
      },
    });

    return NextResponse.json({ message: "Mot de passe defini, compte active." });
  } catch (error) {
    console.error("Erreur acceptance invitation:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
