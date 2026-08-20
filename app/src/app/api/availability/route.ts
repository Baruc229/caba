import { NextRequest, NextResponse } from "next/server";
import { checkAvailability, getPropertyAvailability } from "@/lib/services/availability";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");
    const guestsStr = searchParams.get("guests");
    const yearStr = searchParams.get("year");
    const monthStr = searchParams.get("month");

    if (!propertyId) {
      return NextResponse.json(
        { error: "propertyId est obligatoire" },
        { status: 400 }
      );
    }

    if (yearStr && monthStr) {
      const { bookings, blockedSlots } = await getPropertyAvailability(
        propertyId,
        parseInt(yearStr, 10),
        parseInt(monthStr, 10)
      );

      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const daysInMonth = new Date(year, month, 0).getDate();
      const days = [];

      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month - 1, d);
        const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

        const isBlocked = blockedSlots.some(
          (s: { date: Date }) => new Date(s.date).toISOString().slice(0, 10) === dateStr
        );
        const isBooked = bookings.some(
          (b: { dateArrivee: Date; dateDepart: Date }) =>
            date >= new Date(b.dateArrivee) && date < new Date(b.dateDepart)
        );

        let statut = "disponible";
        if (isBlocked) statut = "bloque";
        else if (isBooked) statut = "reserve";

        days.push({ date: dateStr, disponible: statut === "disponible", statut, creneaux: [] });
      }

      return NextResponse.json({ days });
    }

    if (!startDateStr || !endDateStr || !guestsStr) {
      return NextResponse.json(
        { error: "Les dates et le nombre de voyageurs sont obligatoires" },
        { status: 400 }
      );
    }

    const result = await checkAvailability({
      propertyId,
      dates: {
        startDate: new Date(startDateStr),
        endDate: new Date(endDateStr),
      },
      guests: parseInt(guestsStr, 10),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur lors de la verification de disponibilite:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
