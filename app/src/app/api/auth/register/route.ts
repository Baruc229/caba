import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, nom, prenom, telephone, cgvAcceptees, marketingOptIn } = body;

    if (!email || !password || !nom || !prenom) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent etre remplis" },
        { status: 400 }
      );
    }

    if (
      typeof password !== "string" ||
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/\d/.test(password)
    ) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caracteres, une majuscule et un chiffre" },
        { status: 400 }
      );
    }

    if (!cgvAcceptees) {
      return NextResponse.json(
        { error: "Vous devez accepter les CGV et la politique de confidentialite" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte existe deja avec cet email" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verifyToken = crypto.randomBytes(32).toString("hex");

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        nom,
        prenom,
        telephone: telephone || null,
        role: "client",
        actif: true,
        emailConfirme: false,
        emailVerifyToken: verifyToken,
        emailVerifyExpire: new Date(Date.now() + 24 * 60 * 60 * 1000),
        cgvAccepteesAt: new Date(),
        marketingOptIn: Boolean(marketingOptIn),
      },
    });

    const verifyUrl = `/verification?token=${verifyToken}&email=${encodeURIComponent(normalizedEmail)}`;

    const { sent: emailSent } = await sendVerificationEmail(
      normalizedEmail,
      prenom,
      verifyToken
    );

    console.log("[REGISTER]", normalizedEmail, "emailSent:", emailSent);

    return NextResponse.json(
      {
        message: "Compte cree. Verifiez votre email.",
        user: { id: user.id, email: user.email, nom: user.nom, prenom: user.prenom },
        verifyUrl,
        emailSent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[REGISTER] Error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'inscription" },
      { status: 500 }
    );
  }
}
