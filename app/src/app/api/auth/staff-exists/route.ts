import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Contrôle léger appelé après le premier rendu de /connexion :
// sert uniquement à afficher la bannière "aucun compte équipe"
// tant que le premier administrateur n'a pas été créé.
export async function GET() {
  try {
    const count = await prisma.user.count({
      where: { role: { not: "client" } },
    });
    return NextResponse.json({ staffExists: count > 0 });
  } catch {
    // En cas d'échec, on n'affiche pas la bannière
    return NextResponse.json({ staffExists: true });
  }
}
