import { NextRequest, NextResponse } from "next/server";
import { createBooking, confirmBooking, cancelBooking, modifyBooking } from "@/lib/services/booking";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");
    const clientId = searchParams.get("clientId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const { prisma } = await import("@/lib/prisma");

    const where: Record<string, unknown> = {};
    if (propertyId) where.propertyId = propertyId;
    if (clientId) where.clientId = clientId;
    if (status) where.statut = status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          property: { select: { nom: true, type: true } },
          client: { select: { nom: true, prenom: true, email: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({
      bookings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Erreur lors de la recuperation des reservations:", error);
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
      propertyId,
      clientId,
      startDate,
      endDate,
      startTime,
      endTime,
      typeReservation,
      adults,
      children,
      babies,
      source,
    } = body;

    if (!propertyId || !clientId || !startDate || !endDate || !typeReservation || !adults) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants" },
        { status: 400 }
      );
    }

    const result = await createBooking({
      propertyId,
      clientId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      startTime,
      endTime,
      typeReservation,
      adults,
      children: children || 0,
      babies: babies || 0,
      source: source || "site_web",
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.booking, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la creation de la reservation:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la creation" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, action, ...updates } = body;

    if (!bookingId || !action) {
      return NextResponse.json(
        { error: "bookingId et action sont obligatoires" },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case "confirm":
        result = await confirmBooking(bookingId);
        break;
      case "cancel":
        result = await cancelBooking(bookingId, updates.motif);
        break;
      case "modify":
        result = await modifyBooking(bookingId, {
          startDate: updates.startDate ? new Date(updates.startDate) : undefined,
          endDate: updates.endDate ? new Date(updates.endDate) : undefined,
          startTime: updates.startTime,
          endTime: updates.endTime,
          adults: updates.adults,
          children: updates.children,
          babies: updates.babies,
        });
        break;
      default:
        return NextResponse.json(
          { error: "Action inconnue" },
          { status: 400 }
        );
    }

    if (!result?.success) {
      return NextResponse.json({ error: result?.error }, { status: 400 });
    }

    return NextResponse.json(result.booking);
  } catch (error) {
    console.error("Erreur lors de la modification de la reservation:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
