import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/generated/prisma/client";

const STAFF_ROLES: readonly UserRole[] = [
  "administrateur",
  "gestionnaire",
  "reception",
  "comptabilite",
  "editeur",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, nom, prenom, role } = body;

    if (!email || !password || !nom || !prenom) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent etre remplis" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caracteres" },
        { status: 400 }
      );
    }

    const staffCount = await prisma.user.count({
      where: { role: { not: "client" } },
    });

    const requestedRole = typeof role === "string" ? (role as UserRole) : null;
    let targetRole: UserRole = "administrateur";

    if (staffCount === 0) {
      // Bootstrap : aucun compte equipe existant -> creation du premier administrateur
      if (requestedRole && requestedRole !== "administrateur") {
        return NextResponse.json(
          { error: "Le premier compte doit etre administrateur" },
          { status: 403 }
        );
      }
      targetRole = "administrateur";
    } else {
      const session = await auth();
      if (session?.user?.role !== "administrateur") {
        return NextResponse.json(
          { error: "Seul un administrateur peut creer des comptes equipe" },
          { status: 403 }
        );
      }
      if (!requestedRole || !STAFF_ROLES.includes(requestedRole)) {
        return NextResponse.json({ error: "Role invalide" }, { status: 400 });
      }
      targetRole = requestedRole;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte avec cet email existe deja" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nom,
        prenom,
        role: targetRole,
      },
    });

    return NextResponse.json(
      {
        message: "Compte cree avec succes",
        user: {
          id: user.id,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de la creation du compte:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
