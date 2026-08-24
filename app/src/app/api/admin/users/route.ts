import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/generated/prisma/client";
import { sendEmail, templateInvitationInterne } from "@/lib/services/email/brevo";

const STAFF_ROLES: readonly UserRole[] = [
  "administrateur",
  "gestionnaire",
  "reception",
  "comptabilite",
  "editeur",
];

const ROLE_LABELS: Record<UserRole, string> = {
  client: "Client",
  administrateur: "Administrateur",
  gestionnaire: "Gestionnaire",
  reception: "Réception",
  comptabilite: "Comptabilité",
  editeur: "Éditeur",
};

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "administrateur" ? session : null;
}

// ─── Liste des comptes internes ───
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Non autorise" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: { role: { not: "client" } },
    select: {
      id: true,
      prenom: true,
      nom: true,
      email: true,
      telephone: true,
      role: true,
      actif: true,
      lastLogin: true,
      invitationExpire: true,
    },
    orderBy: [{ actif: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({
    users: users.map((user) => ({
      ...user,
      invitationEnAttente: Boolean(user.invitationExpire),
    })),
  });
}

// ─── Inviter un membre de l'equipe ───
export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Non autorise" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { email, prenom, nom, telephone, role } = body;

    if (!email || !prenom || !nom || !role) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent etre remplis" },
        { status: 400 }
      );
    }
    if (!STAFF_ROLES.includes(role as UserRole)) {
      return NextResponse.json({ error: "Role invalide" }, { status: 400 });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json(
        { error: "Un compte existe deja avec cet email" },
        { status: 409 }
      );
    }

    // Mot de passe inutilisable : valeur aleatoire que personne ne connait
    const motDePasseProvisoire = await bcrypt.hash(randomBytes(24).toString("hex"), 12);

    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: motDePasseProvisoire,
        prenom,
        nom,
        telephone: telephone || null,
        role,
        invitationToken: tokenHash,
        invitationExpire: new Date(Date.now() + 72 * 60 * 60 * 1000),
      },
    });

    const origin = request.nextUrl.origin;
    const emailEnvoye = await sendEmail({
      to: [{ email: user.email, name: `${prenom} ${nom}` }],
      subject: "Votre acces au back-office Caba Résidence",
      htmlContent: templateInvitationInterne({
        prenom,
        role: ROLE_LABELS[role as UserRole],
        lien: `${origin}/invitation/${token}`,
      }),
    });

    return NextResponse.json(
      {
        message: emailEnvoye
          ? "Invitation envoyee par email"
          : "Compte cree mais l'email n'a pas pu etre envoye (Brevo non configure)",
        user: { id: user.id, email: user.email, role: user.role },
        emailEnvoye,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur invitation:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ─── Changer le role / activer / desactiver ───
export async function PATCH(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Non autorise" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, action, role } = body;

    if (!id || !action) {
      return NextResponse.json({ error: "Parametres manquants" }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id } });

    if (!target || target.role === "client") {
      return NextResponse.json(
        { error: "Compte interne introuvable" },
        { status: 404 }
      );
    }

    if (action === "changer-role") {
      if (!STAFF_ROLES.includes(role as UserRole)) {
        return NextResponse.json({ error: "Role invalide" }, { status: 400 });
      }

      // Si on retire le role administrateur a un admin actif, verifier qu'il
      // n'est pas le dernier
      if (
        target.role === "administrateur" &&
        target.actif &&
        role !== "administrateur"
      ) {
        const adminsActifs = await prisma.user.count({
          where: { role: "administrateur", actif: true },
        });
        if (adminsActifs <= 1) {
          return NextResponse.json(
            { error: "Impossible de retirer le dernier administrateur actif" },
            { status: 400 }
          );
        }
      }

      await prisma.user.update({ where: { id }, data: { role } });
      return NextResponse.json({ message: "Role modifie" });
    }

    if (action === "desactiver") {
      if (!target.actif) {
        return NextResponse.json({ error: "Compte deja desactive" }, { status: 400 });
      }
      if (target.role === "administrateur") {
        const adminsActifs = await prisma.user.count({
          where: { role: "administrateur", actif: true },
        });
        if (adminsActifs <= 1) {
          return NextResponse.json(
            { error: "Impossible de desactiver le dernier administrateur actif" },
            { status: 400 }
          );
        }
      }

      await prisma.user.update({ where: { id }, data: { actif: false } });
      return NextResponse.json({ message: "Compte desactive" });
    }

    if (action === "activer") {
      if (target.actif) {
        return NextResponse.json({ error: "Compte deja actif" }, { status: 400 });
      }
      await prisma.user.update({ where: { id }, data: { actif: true } });
      return NextResponse.json({ message: "Compte active" });
    }

    return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  } catch (error) {
    console.error("Erreur modification compte:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
