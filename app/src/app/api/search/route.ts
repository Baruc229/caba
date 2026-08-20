import { NextRequest, NextResponse } from "next/server";
import { searchAvailableProperties } from "@/lib/services/availability";
import { calculatePrice } from "@/lib/services/pricing";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");
    const guestsStr = searchParams.get("guests");
    const propertyType = searchParams.get("type") || undefined;
    const minPriceStr = searchParams.get("minPrice");
    const maxPriceStr = searchParams.get("maxPrice");
    const bedroomsStr = searchParams.get("bedrooms");
    const bedsStr = searchParams.get("beds");
    const pageStr = searchParams.get("page");
    const limitStr = searchParams.get("limit");

    if (!startDateStr || !endDateStr || !guestsStr) {
      return NextResponse.json(
        { error: "Les dates et le nombre de voyageurs sont obligatoires" },
        { status: 400 }
      );
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    const guests = parseInt(guestsStr, 10);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: "Format de date invalide" },
        { status: 400 }
      );
    }

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: "La date de depart doit etre posterieure a la date d'arrivee" },
        { status: 400 }
      );
    }

    if (isNaN(guests) || guests < 1) {
      return NextResponse.json(
        { error: "Le nombre de voyageurs doit etre au moins 1" },
        { status: 400 }
      );
    }

    const result = await searchAvailableProperties({
      startDate,
      endDate,
      guests,
      propertyType: propertyType || undefined,
      minPrice: minPriceStr ? parseFloat(minPriceStr) : undefined,
      maxPrice: maxPriceStr ? parseFloat(maxPriceStr) : undefined,
      bedrooms: bedroomsStr ? parseInt(bedroomsStr, 10) : undefined,
      beds: bedsStr ? parseInt(bedsStr, 10) : undefined,
      page: pageStr ? parseInt(pageStr, 10) : 1,
      limit: limitStr ? parseInt(limitStr, 10) : 20,
    });

    const propertiesWithPrice = await Promise.all(
      result.properties.map(async (property) => {
        const price = await calculatePrice({
          propertyId: property.id,
          startDate,
          endDate,
          typeReservation: "nuee",
          adults: guests,
          children: 0,
          babies: 0,
        });

        const avgRating =
          property.avis.length > 0
            ? property.avis.reduce((sum, a) => sum + a.note, 0) / property.avis.length
            : null;

        return {
          id: property.id,
          nom: property.nom,
          type: property.type,
          capaciteMaximale: property.capaciteMaximale,
          nombreChambres: property.nombreChambres,
          nombreLits: property.nombreLits,
          photo: property.photos[0]?.url || null,
          note: avgRating ? Math.round(avgRating * 10) / 10 : null,
          nombreAvis: property.avis.length,
          prix: price.total,
          devise: price.currency,
          breakdown: price.breakdown,
        };
      })
    );

    return NextResponse.json({
      properties: propertiesWithPrice,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error("Erreur lors de la recherche:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la recherche" },
      { status: 500 }
    );
  }
}
