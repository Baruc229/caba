import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !["administrateur", "gestionnaire"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorise" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const type = searchParams.get("type") || undefined;
    const status = searchParams.get("status") || undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (type) where.type = type;
    if (status) where.statut = status;

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          photos: { where: { estPrincipale: true }, take: 1 },
          avis: { select: { note: true } },
          tarifs: { where: { actif: true }, take: 1 },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.property.count({ where }),
    ]);

    const data = properties.map((p) => ({
      id: p.id,
      nom: p.nom,
      type: p.type,
      statut: p.statut,
      capaciteMaximale: p.capaciteMaximale,
      nombreChambres: p.nombreChambres,
      ville: p.ville,
      photo: p.photos[0]?.url || null,
      tarifBase: p.tarifs[0]?.prix || null,
      devise: p.devise,
      nombreAvis: p.avis.length,
      note: p.avis.length > 0
        ? Math.round((p.avis.reduce((s, a) => s + a.note, 0) / p.avis.length) * 10) / 10
        : null,
    }));

    return NextResponse.json({ properties: data, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
