import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const type = searchParams.get("type") || undefined;
    const status = searchParams.get("status") || undefined;

    const where: Record<string, unknown> = {};

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

    const propertiesWithDetails = properties.map((p) => ({
      id: p.id,
      nom: p.nom,
      type: p.type,
      statut: p.statut,
      capaciteMaximale: p.capaciteMaximale,
      nombreChambres: p.nombreChambres,
      nombreLits: p.nombreLits,
      adresse: p.adresse,
      ville: p.ville,
      photo: p.photos[0]?.url || null,
      note: p.avis.length > 0
        ? Math.round((p.avis.reduce((s, a) => s + a.note, 0) / p.avis.length) * 10) / 10
        : null,
      nombreAvis: p.avis.length,
      tarifBase: p.tarifs[0]?.prix || null,
      devise: p.devise,
      creeLe: p.createdAt,
    }));

    return NextResponse.json({
      properties: propertiesWithDetails,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Erreur lors de la recuperation des logements:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nom,
      type,
      descriptionCourte,
      descriptionComplete,
      proprietaireId,
      superCategorie,
      capaciteMaximale,
      adultesMax,
      enfantsMax,
      bebesMax,
      nombreChambres,
      nombreLits,
      nombreSallesDeBains,
      superficieM2,
      adresse,
      ville,
      pays,
      codePostal,
      latitude,
      longitude,
    } = body;

    if (!nom || !type || !proprietaireId || !capaciteMaximale || !adresse || !ville || !pays) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants" },
        { status: 400 }
      );
    }

    const property = await prisma.property.create({
      data: {
        nom,
        type,
        descriptionCourte: descriptionCourte || null,
        descriptionComplete: descriptionComplete || null,
        proprietaireId,
        superCategorie: superCategorie || "logement_entier",
        capaciteMaximale,
        adultesMax: adultesMax || capaciteMaximale,
        enfantsMax: enfantsMax || 0,
        bebesMax: bebesMax || 0,
        nombreChambres: nombreChambres || 1,
        nombreLits: nombreLits || 1,
        nombreSallesDeBains: nombreSallesDeBains || 1,
        superficieM2: superficieM2 || null,
        adresse,
        ville,
        pays,
        codePostal: codePostal || null,
        latitude: latitude || null,
        longitude: longitude || null,
      },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la creation du logement:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la creation" },
      { status: 500 }
    );
  }
}
