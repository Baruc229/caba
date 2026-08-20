import { NextRequest, NextResponse } from "next/server";
import { exportICal, importICal, syncAllICalSources } from "@/lib/services/ical";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

// GET /api/ical/[propertyId] — Export iCal pour les plateformes externes
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  const { propertyId } = await params;

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true, nom: true, statut: true },
  });

  if (!property) {
    return NextResponse.json({ error: "Logement introuvable" }, { status: 404 });
  }

  const icalContent = await exportICal(propertyId);

  return new NextResponse(icalContent, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${property.nom.replace(/[^a-zA-Z0-9]/g, "_")}.ics"`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}

// POST /api/ical/[propertyId] — Ajouter une source iCal (import) ou synchroniser
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  const session = await auth();
  if (!session?.user || !["administrateur", "gestionnaire"].includes(session.user.role)) {
    return NextResponse.json({ error: "Non autorise" }, { status: 403 });
  }

  const { propertyId } = await params;
  const body = await request.json();

  const { action, url, syncId, typeSync = "import", frequence = "manuelle" } = body;

  if (action === "sync" && syncId) {
    const source = await prisma.synchronisationICal.findUnique({
      where: { id: syncId },
    });
    if (!source) {
      return NextResponse.json({ error: "Source introuvable" }, { status: 404 });
    }

    const result = await importICal(source.propertyId, source.urlSource);

    if (result.success) {
      await prisma.synchronisationICal.update({
        where: { id: syncId },
        data: {
          derniereSync: new Date(),
          statut: "active",
          messageErreur: null,
        },
      });
    } else {
      await prisma.synchronisationICal.update({
        where: { id: syncId },
        data: {
          statut: "erreur",
          messageErreur: result.error,
        },
      });
    }

    return NextResponse.json({ result, syncId });
  }

  if (action === "syncAll") {
    const result = await syncAllICalSources();
    return NextResponse.json(result);
  }

  if (!url) {
    return NextResponse.json({ error: "URL requise" }, { status: 400 });
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "URL invalide" }, { status: 400 });
  }

  const source = await prisma.synchronisationICal.create({
    data: {
      propertyId,
      urlSource: url,
      typeSync,
      frequence,
      statut: "active",
    },
  });

  if (typeSync === "import") {
    const result = await importICal(propertyId, url);

    if (result.success) {
      await prisma.synchronisationICal.update({
        where: { id: source.id },
        data: {
          derniereSync: new Date(),
          statut: "active",
          messageErreur: null,
        },
      });
    } else {
      await prisma.synchronisationICal.update({
        where: { id: source.id },
        data: {
          statut: "erreur",
          messageErreur: result.error,
        },
      });
    }

    return NextResponse.json({ source, result });
  }

  return NextResponse.json({ source });
}

// DELETE /api/ical/[propertyId] — Supprimer une source iCal
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  const session = await auth();
  if (!session?.user || !["administrateur", "gestionnaire"].includes(session.user.role)) {
    return NextResponse.json({ error: "Non autorise" }, { status: 403 });
  }

  const { propertyId } = await params;
  const { searchParams } = new URL(request.url);
  const syncId = searchParams.get("syncId");

  if (!syncId) {
    return NextResponse.json({ error: "syncId requis" }, { status: 400 });
  }

  await prisma.synchronisationICal.delete({
    where: { id: syncId },
  });

  return NextResponse.json({ success: true });
}

// PATCH /api/ical/[propertyId] — Modifier une source iCal
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  const session = await auth();
  if (!session?.user || !["administrateur", "gestionnaire"].includes(session.user.role)) {
    return NextResponse.json({ error: "Non autorise" }, { status: 403 });
  }

  const { propertyId } = await params;
  const body = await request.json();
  const { syncId, ...data } = body;

  if (!syncId) {
    return NextResponse.json({ error: "syncId requis" }, { status: 400 });
  }

  const source = await prisma.synchronisationICal.update({
    where: { id: syncId },
    data,
  });

  return NextResponse.json({ source });
}
