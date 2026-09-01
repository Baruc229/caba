import { NextRequest, NextResponse } from "next/server";
import { createCheckoutAccount } from "@/lib/services/checkout";
import type { BookingType } from "@/generated/prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      propertyId, startDate, endDate, startTime, endTime, typeReservation,
      adults, children, babies,
      email, password, prenom, nom, telephone, cgvAcceptees,
    } = body;

    if (!propertyId || !startDate || !endDate || !typeReservation || !adults ||
        !email || !password || !nom || !prenom) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    const result = await createCheckoutAccount({
      propertyId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      startTime,
      endTime,
      typeReservation: typeReservation as BookingType,
      adults,
      children: children || 0,
      babies: babies || 0,
      email,
      password,
      prenom,
      nom,
      telephone,
      cgvAcceptees: Boolean(cgvAcceptees),
      baseUrl: request.nextUrl.origin,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Compte cree. Verifiez votre email avant de finaliser.", lockId: result.lockId, needsVerification: true },
      { status: 201 }
    );
  } catch (error) {
    console.error("[CHECKOUT] Error:", error);
    return NextResponse.json({ error: "Une erreur est survenue lors de la reservation" }, { status: 500 });
  }
}
