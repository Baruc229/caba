import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { acquireTemporaryLock } from "@/lib/services/availability";
import { finalizeCheckoutPayment } from "@/lib/services/checkout";
import type { BookingType } from "@/generated/prisma/client";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }
  if (session.user.emailConfirme !== true) {
    return NextResponse.json({ error: "Veuillez verifier votre email avant de payer" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const clientId = session.user.id;

    let lockId = body.lockId as string | undefined;

    if (!lockId) {
      const {
        propertyId, startDate, endDate, startTime, endTime, typeReservation,
        adults, children, babies,
      } = body;

      if (!propertyId || !startDate || !endDate || !typeReservation || !adults) {
        return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
      }

      const lock = await acquireTemporaryLock({
        propertyId,
        clientId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        startTime,
        endTime,
        typeReservation: typeReservation as BookingType,
        adults,
        children: children || 0,
        babies: babies || 0,
      });

      if (!lock.success || !lock.lockId) {
        return NextResponse.json({ error: lock.error || "Creneau indisponible" }, { status: 409 });
      }
      lockId = lock.lockId;
    }

    const result = await finalizeCheckoutPayment({ lockId, clientId });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.booking, { status: 201 });
  } catch (error) {
    console.error("[CHECKOUT PAY] Error:", error);
    return NextResponse.json({ error: "Une erreur est survenue lors du paiement" }, { status: 500 });
  }
}
