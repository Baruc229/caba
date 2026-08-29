import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

const STAFF_ROLES = ["administrateur", "gestionnaire"];

function isStaff(role?: string) {
  return !!role && STAFF_ROLES.includes(role);
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !isStaff(session.user.role)) {
      return NextResponse.json({ error: "Non autorise" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const page = parseInt(searchParams.get("page") || "1", 10);

    if (id) {
      const property = await prisma.property.findUnique({
        where: { id },
        include: {
          photos: { orderBy: { ordre: "asc" } },
          tarifs: { where: { actif: true }, orderBy: { createdAt: "desc" }, take: 1 },
          caracteristiques: true,
          contact: true,
        },
      });
      if (!property) {
        return NextResponse.json({ error: "Logement introuvable" }, { status: 404 });
      }
      return NextResponse.json({
        property: {
          ...property,
          tarifBase: property.tarifs[0]?.prix ?? null,
          typeTarif: property.tarifs[0]?.typeTarif ?? "nuee",
          photoPrincipale: property.photos.find((ph) => ph.estPrincipale)?.url ?? property.photos[0]?.url ?? null,
        },
      });
    }

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
      tarifBase: p.tarifs[0]?.prix ?? null,
      devise: p.tarifs[0]?.devise ?? p.devise,
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

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !isStaff(session.user.role)) {
      return NextResponse.json({ error: "Non autorise" }, { status: 403 });
    }

    const body = await request.json();

    const required = ["nom", "type", "capaciteMaximale", "adresse", "ville"];
    const missing = required.filter((r) => body[r] === undefined || body[r] === "" || body[r] === null);
    if (missing.length > 0) {
      return NextResponse.json({ error: `Champs requis manquants : ${missing.join(", ")}` }, { status: 400 });
    }

    const data = {
      nom: body.nom,
      type: body.type,
      statut: body.statut || "brouillon",
      superCategorie: body.superCategorie || "logement_entier",
      descriptionCourte: body.descriptionCourte || null,
      descriptionComplete: body.descriptionComplete || null,
      proprietaireId: session.user.id,
      capaciteMaximale: Number(body.capaciteMaximale) || 1,
      adultesMax: Number(body.adultesMax) || Number(body.capaciteMaximale) || 1,
      enfantsMax: Number(body.enfantsMax) || 0,
      bebesMax: Number(body.bebesMax) || 0,
      nombreChambres: Number(body.nombreChambres) || 0,
      nombreLits: Number(body.nombreLits) || 0,
      nombreSallesDeBains: Number(body.nombreSallesDeBains) || 0,
      superficieM2: body.superficieM2 ? Number(body.superficieM2) : null,
      adresse: body.adresse,
      ville: body.ville,
      pays: body.pays || "Bénin",
      codePostal: body.codePostal || null,
      devise: body.devise || "EUR",
    };

    const property = await prisma.property.create({ data });

    if (body.tarifPrix && Number(body.tarifPrix) > 0) {
      await prisma.tarif.create({
        data: {
          propertyId: property.id,
          typeTarif: body.typeTarif || "nuee",
          prix: Number(body.tarifPrix),
          devise: body.devise || "EUR",
          jourSemaine: "tous",
          dateDebut: new Date(),
          dateFin: new Date(new Date().getFullYear() + 5, 11, 31),
          actif: true,
        },
      });
    }

    if (body.photoUrl) {
      await prisma.propertyPhoto.create({
        data: { propertyId: property.id, url: body.photoUrl, ordre: 0, estPrincipale: true },
      });
    }

    return NextResponse.json({ property: { id: property.id } }, { status: 201 });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !isStaff(session.user.role)) {
      return NextResponse.json({ error: "Non autorise" }, { status: 403 });
    }

    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    const existing = await prisma.property.findUnique({ where: { id: body.id } });
    if (!existing) {
      return NextResponse.json({ error: "Logement introuvable" }, { status: 404 });
    }

    const data = {
      nom: body.nom ?? existing.nom,
      type: body.type ?? existing.type,
      statut: body.statut ?? existing.statut,
      superCategorie: body.superCategorie ?? existing.superCategorie,
      descriptionCourte: body.descriptionCourte ?? existing.descriptionCourte,
      descriptionComplete: body.descriptionComplete ?? existing.descriptionComplete,
      capaciteMaximale: body.capaciteMaximale !== undefined ? Number(body.capaciteMaximale) : existing.capaciteMaximale,
      adultesMax: body.adultesMax !== undefined ? Number(body.adultesMax) : existing.adultesMax,
      enfantsMax: body.enfantsMax !== undefined ? Number(body.enfantsMax) : existing.enfantsMax,
      bebesMax: body.bebesMax !== undefined ? Number(body.bebesMax) : existing.bebesMax,
      nombreChambres: body.nombreChambres !== undefined ? Number(body.nombreChambres) : existing.nombreChambres,
      nombreLits: body.nombreLits !== undefined ? Number(body.nombreLits) : existing.nombreLits,
      nombreSallesDeBains: body.nombreSallesDeBains !== undefined ? Number(body.nombreSallesDeBains) : existing.nombreSallesDeBains,
      superficieM2: body.superficieM2 !== undefined ? (body.superficieM2 ? Number(body.superficieM2) : null) : existing.superficieM2,
      adresse: body.adresse ?? existing.adresse,
      ville: body.ville ?? existing.ville,
      pays: body.pays ?? existing.pays,
      codePostal: body.codePostal ?? existing.codePostal,
      devise: body.devise ?? existing.devise,
    };

    const property = await prisma.property.update({ where: { id: body.id }, data });

    if (body.tarifPrix && Number(body.tarifPrix) > 0) {
      const activeTarif = await prisma.tarif.findFirst({
        where: { propertyId: body.id, actif: true },
        orderBy: { createdAt: "desc" },
      });
      if (activeTarif) {
        await prisma.tarif.update({
          where: { id: activeTarif.id },
          data: { prix: Number(body.tarifPrix), typeTarif: body.typeTarif || activeTarif.typeTarif },
        });
      } else {
        await prisma.tarif.create({
          data: {
            propertyId: body.id,
            typeTarif: body.typeTarif || "nuee",
            prix: Number(body.tarifPrix),
            devise: body.devise || "EUR",
            jourSemaine: "tous",
            dateDebut: new Date(),
            dateFin: new Date(new Date().getFullYear() + 5, 11, 31),
            actif: true,
          },
        });
      }
    }

    if (body.photoUrl) {
      const existingPhoto = await prisma.propertyPhoto.findFirst({
        where: { propertyId: body.id, estPrincipale: true },
      });
      if (existingPhoto) {
        await prisma.propertyPhoto.update({
          where: { id: existingPhoto.id },
          data: { url: body.photoUrl },
        });
      } else {
        await prisma.propertyPhoto.create({
          data: { propertyId: body.id, url: body.photoUrl, ordre: 0, estPrincipale: true },
        });
      }
    }

    return NextResponse.json({ property: { id: property.id } });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !isStaff(session.user.role)) {
      return NextResponse.json({ error: "Non autorise" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Logement introuvable" }, { status: 404 });
    }

    await prisma.property.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
