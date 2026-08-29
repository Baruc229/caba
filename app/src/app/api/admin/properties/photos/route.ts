import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

const STAFF_ROLES = ["administrateur", "gestionnaire"];

function isStaff(role?: string) {
  return !!role && STAFF_ROLES.includes(role);
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !isStaff(session.user.role)) {
      return NextResponse.json({ error: "Non autorise" }, { status: 403 });
    }

    const body = await request.json();
    if (!body.propertyId || !body.url) {
      return NextResponse.json({ error: "propertyId et url requis." }, { status: 400 });
    }

    const property = await prisma.property.findUnique({ where: { id: body.propertyId } });
    if (!property) {
      return NextResponse.json({ error: "Logement introuvable." }, { status: 404 });
    }

    const count = await prisma.propertyPhoto.count({ where: { propertyId: body.propertyId } });
    const photo = await prisma.propertyPhoto.create({
      data: {
        propertyId: body.propertyId,
        url: body.url,
        legende: body.legende ?? null,
        ordre: count,
        estPrincipale: count === 0,
      },
    });

    return NextResponse.json({ photo }, { status: 201 });
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
    const photoId = searchParams.get("photoId");
    if (!photoId) {
      return NextResponse.json({ error: "photoId manquant." }, { status: 400 });
    }

    const photo = await prisma.propertyPhoto.findUnique({ where: { id: photoId } });
    if (!photo) {
      return NextResponse.json({ error: "Photo introuvable." }, { status: 404 });
    }
    if (photo.estPrincipale) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas supprimer la photo principale. Définissez d'abord une autre photo principale." },
        { status: 400 }
      );
    }

    await prisma.propertyPhoto.delete({ where: { id: photoId } });

    // Réordonne les photos restantes
    const remaining = await prisma.propertyPhoto.findMany({
      where: { propertyId: photo.propertyId },
      orderBy: { ordre: "asc" },
    });
    await Promise.all(
      remaining.map((p, i) =>
        prisma.propertyPhoto.update({ where: { id: p.id }, data: { ordre: i } })
      )
    );

    return NextResponse.json({ ok: true });
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
    const { action } = body;

    if (action === "setPrincipal") {
      if (!body.photoId) {
        return NextResponse.json({ error: "photoId manquant." }, { status: 400 });
      }
      const photo = await prisma.propertyPhoto.findUnique({ where: { id: body.photoId } });
      if (!photo) {
        return NextResponse.json({ error: "Photo introuvable." }, { status: 404 });
      }
      // Retire la principale courante puis définit la nouvelle
      await prisma.propertyPhoto.updateMany({
        where: { propertyId: photo.propertyId, estPrincipale: true },
        data: { estPrincipale: false },
      });
      await prisma.propertyPhoto.update({
        where: { id: photo.id },
        data: { estPrincipale: true },
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "reorder") {
      if (!body.propertyId || !Array.isArray(body.orderedIds)) {
        return NextResponse.json({ error: "propertyId et orderedIds requis." }, { status: 400 });
      }
      await Promise.all(
        body.orderedIds.map((id: string, index: number) =>
          prisma.propertyPhoto.update({ where: { id }, data: { ordre: index } })
        )
      );
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Action inconnue." }, { status: 400 });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
