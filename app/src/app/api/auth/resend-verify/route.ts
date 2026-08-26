import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body.email?.toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ message: "Si cet email existe, un lien a ete envoye." }, { status: 200 });
    }

    if (user.emailConfirme) {
      return NextResponse.json({ message: "Cet email est deja verifie." }, { status: 200 });
    }

    const verifyToken = crypto.randomBytes(32).toString("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifyToken: verifyToken,
        emailVerifyExpire: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    const emailSent = await sendVerificationEmail(email, user.prenom, verifyToken);
    console.log("[RESEND] Email sent:", emailSent, "to:", email);

    return NextResponse.json({ message: "Si cet email existe, un lien a ete envoye.", emailSent });
  } catch (error) {
    console.error("[RESEND] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
