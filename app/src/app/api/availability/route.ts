import { NextRequest, NextResponse } from "next/server";
import { beninDateTime } from "@/lib/datetime-benin";
import { checkAvailability, getMonthlyCalendar, suggestAlternativePeriods } from "@/lib/services/availability";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");

    if (!propertyId) {
      return NextResponse.json({ error: "propertyId est obligatoire" }, { status: 400 });
    }

    const yearStr = searchParams.get("year");
    const monthStr = searchParams.get("month");

    if (yearStr && monthStr) {
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        return NextResponse.json({ error: "year/month invalides" }, { status: 400 });
      }
      const calendar = await getMonthlyCalendar(propertyId, year, month);
      return NextResponse.json(calendar);
    }

    const arrivee = searchParams.get("arrivee");
    const depart = searchParams.get("depart");
    const heureArrivee = searchParams.get("heureArrivee") || undefined;
    const heureDepart = searchParams.get("heureDepart") || undefined;
    const typeReservation = searchParams.get("typeReservation") || "nuee";
    const adults = parseInt(searchParams.get("adultes") ?? "", 10);
    const children = parseInt(searchParams.get("enfants") ?? "0", 10) || 0;
    const babies = parseInt(searchParams.get("bebes") ?? "0", 10) || 0;
    const withSuggestions = searchParams.get("suggestions") === "1";

    if (!arrivee || !depart || isNaN(adults)) {
      return NextResponse.json(
        { error: "arrivee, depart et adultes sont obligatoires" },
        { status: 400 }
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(arrivee) || !/^\d{4}-\d{2}-\d{2}$/.test(depart)) {
      return NextResponse.json({ error: "Format de date invalide (attendu: YYYY-MM-DD)" }, { status: 400 });
    }

    const startDate = beninDateTime(arrivee, heureArrivee || "14:00");
    const endDate = beninDateTime(depart, heureDepart || "11:00");

    const result = await checkAvailability({
      propertyId,
      startDate,
      endDate,
      startTime: heureArrivee,
      endTime: heureDepart,
      typeReservation,
      adults,
      children,
      babies,
    });

    if (!result.available && withSuggestions) {
      const alternatives = await suggestAlternativePeriods({
        propertyId,
        startDate,
        endDate,
      });
      return NextResponse.json({ ...result, suggestions: alternatives });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur lors de la verification de disponibilite:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
