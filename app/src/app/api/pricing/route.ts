import { NextRequest, NextResponse } from "next/server";
import { calculatePrice } from "@/lib/services/pricing";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      propertyId,
      startDate,
      endDate,
      startTime,
      endTime,
      typeReservation,
      adults,
      children,
      babies,
    } = body;

    if (!propertyId || !startDate || !endDate || !typeReservation || adults === undefined) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants" },
        { status: 400 }
      );
    }

    const price = await calculatePrice({
      propertyId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      startTime,
      endTime,
      typeReservation,
      adults,
      children: children || 0,
      babies: babies || 0,
    });

    return NextResponse.json(price);
  } catch (error) {
    console.error("Erreur lors du calcul du prix:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors du calcul" },
      { status: 500 }
    );
  }
}
