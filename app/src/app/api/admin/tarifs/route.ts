import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !["administrateur", "gestionnaire"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorise" }, { status: 403 });
    }

    const tarifs = await prisma.tarif.findMany({
      include: { property: { select: { id: true, nom: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tarifs });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
