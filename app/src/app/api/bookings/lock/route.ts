import { NextRequest, NextResponse } from "next/server";
import { beninDateTime } from "@/lib/datetime-benin";
import { prisma } from "@/lib/prisma";
import { acquireTemporaryLock, promoteTemporaryLock, releaseTemporaryLock } from "@/lib/services/availability";

interface LockBody {
  propertyId?: unknown;
  clientId?: unknown;
  arrivee?: unknown;
  depart?: unknown;
  heureArrivee?: unknown;
  heureDepart?: unknown;
  typeReservation?: string;
  adultes?: number;
  enfants?: number;
  bebes?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as LockBody | null;
    if (!body) {
      return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
    }

    const {
      propertyId,
      clientId,
      arrivee,
      depart,
      heureArrivee,
      heureDepart,
      typeReservation = "nuee",
      adultes,
      enfants = 0,
      bebes = 0,
    } = body;

    if (
      typeof propertyId !== "string" ||
      typeof clientId !== "string" ||
      typeof arrivee !== "string" ||
      typeof depart !== "string" ||
      typeof adultes !== "number"
    ) {
      return NextResponse.json(
        { error: "propertyId, clientId, arrivee, depart et adultes sont obligatoires" },
        { status: 400 }
      );
    }

    const startDate = beninDateTime(
      arrivee,
      typeof heureArrivee === "string" ? heureArrivee : "14:00"
    );
    const endDate = beninDateTime(depart, typeof heureDepart === "string" ? heureDepart : "11:00");

    const client = await prisma.user.findFirst({
      where: { OR: [{ id: clientId }, { email: clientId }], actif: true },
      select: { id: true },
    });
    if (!client) {
      return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
    }

    const result = await acquireTemporaryLock({
      propertyId,
      clientId: client.id,
      startDate,
      endDate,
      startTime: typeof heureArrivee === "string" ? heureArrivee : undefined,
      endTime: typeof heureDepart === "string" ? heureDepart : undefined,
      typeReservation,
      adults: adultes,
      children: enfants,
      babies: bebes,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 409 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur lors de l'acquisition du verrou:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as { lockId?: string; action?: string } | null;
    if (!body || typeof body.lockId !== "string") {
      return NextResponse.json({ error: "lockId est obligatoire" }, { status: 400 });
    }

    if (body.action === "promouvoir") {
      const promoted = await promoteTemporaryLock(body.lockId);
      if (!promoted) {
        return NextResponse.json({ success: false, error: "Verrou introuvable ou deja converti" }, { status: 409 });
      }
      return NextResponse.json({ success: true });
    }

    const released = await releaseTemporaryLock(body.lockId);
    if (!released) {
      return NextResponse.json({ success: false, error: "Verrou introuvable ou deja libere" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la manipulation du verrou:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
