import { prisma } from "@/lib/prisma";
import { checkAvailability } from "./availability";
import { calculatePrice } from "./pricing";
import type { BookingType, BookingSource, BookingStatus } from "@/generated/prisma/client";

function generateBookingNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");
  return `RES-${year}-${random}`;
}

export interface CreateBookingParams {
  propertyId: string;
  clientId: string;
  startDate: Date;
  endDate: Date;
  startTime?: string;
  endTime?: string;
  typeReservation: BookingType;
  adults: number;
  children?: number;
  babies?: number;
  source?: BookingSource;
  notesInternes?: string;
}

export interface BookingResult {
  success: boolean;
  booking?: {
    id: string;
    numero: string;
    statut: BookingStatus;
    prixTotal: number;
    devise: string;
  };
  error?: string;
}

export async function createBooking(params: CreateBookingParams): Promise<BookingResult> {
  const {
    propertyId,
    clientId,
    startDate,
    endDate,
    startTime,
    endTime,
    typeReservation,
    adults,
    children = 0,
    babies = 0,
    source = "site_web",
    notesInternes,
  } = params;

  const totalGuests = adults + children;

  const availability = await checkAvailability({
    propertyId,
    dates: { startDate, endDate, startTime, endTime },
    guests: totalGuests,
  });

  if (!availability.available) {
    return { success: false, error: availability.reason };
  }

  const price = await calculatePrice({
    propertyId,
    startDate,
    endDate,
    startTime,
    endTime,
    typeReservation,
    adults,
    children,
    babies,
  });

  const numero = generateBookingNumber();

  const booking = await prisma.$transaction(async (tx) => {
    const newBooking = await tx.booking.create({
      data: {
        numero,
        statut: "en_attente_paiement",
        propertyId,
        clientId,
        dateArrivee: startDate,
        dateDepart: endDate,
        heureArrivee: startTime || null,
        heureDepart: endTime || null,
        typeReservation,
        nombreAdultes: adults,
        nombreEnfants: children,
        nombreBebes: babies,
        nombreVoyageursTotal: totalGuests,
        prixSejour: price.subtotal,
        fraisMenage: price.cleaningFee,
        taxeSejour: price.cityTax,
        supplements: price.supplements,
        reductions: price.discount,
        prixTotal: price.total,
        devise: price.currency,
        source,
        notesInternes: notesInternes || null,
      },
    });

    await tx.bookingHistory.create({
      data: {
        reservationId: newBooking.id,
        action: "creation",
        details: JSON.parse(JSON.stringify({
          price,
          dates: { startDate, endDate },
          guests: { adults, children, babies },
        })),
      },
    });

    return newBooking;
  });

  return {
    success: true,
    booking: {
      id: booking.id,
      numero: booking.numero,
      statut: booking.statut,
      prixTotal: Number(booking.prixTotal),
      devise: booking.devise,
    },
  };
}

export async function confirmBooking(bookingId: string): Promise<BookingResult> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    return { success: false, error: "Reservation introuvable" };
  }

  if (booking.statut !== "en_attente_paiement" && booking.statut !== "reservation_temporaire") {
    return { success: false, error: "Cette reservation ne peut pas etre confirmee" };
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.booking.update({
      where: { id: bookingId },
      data: { statut: "confirmee" },
    });

    await tx.bookingHistory.create({
      data: {
        reservationId: bookingId,
        action: "confirmation",
      },
    });

    return result;
  });

  return {
    success: true,
    booking: {
      id: updated.id,
      numero: updated.numero,
      statut: updated.statut,
      prixTotal: Number(updated.prixTotal),
      devise: updated.devise,
    },
  };
}

export async function cancelBooking(bookingId: string, motif?: string): Promise<BookingResult> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    return { success: false, error: "Reservation introuvable" };
  }

  if (booking.statut === "annulee" || booking.statut === "terminee") {
    return { success: false, error: "Cette reservation est deja annulee ou terminee" };
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.booking.update({
      where: { id: bookingId },
      data: {
        statut: "annulee",
        motifAnnulation: motif || null,
      },
    });

    await tx.bookingHistory.create({
      data: {
        reservationId: bookingId,
        action: "annulation",
        details: JSON.parse(JSON.stringify({ motif: motif || null })),
      },
    });

    return result;
  });

  return {
    success: true,
    booking: {
      id: updated.id,
      numero: updated.numero,
      statut: updated.statut,
      prixTotal: Number(updated.prixTotal),
      devise: updated.devise,
    },
  };
}

export async function modifyBooking(
  bookingId: string,
  updates: {
    startDate?: Date;
    endDate?: Date;
    startTime?: string;
    endTime?: string;
    adults?: number;
    children?: number;
    babies?: number;
  }
): Promise<BookingResult> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    return { success: false, error: "Reservation introuvable" };
  }

  if (booking.statut === "annulee" || booking.statut === "terminee") {
    return { success: false, error: "Impossible de modifier une reservation annulee ou terminee" };
  }

  const newStartDate = updates.startDate || booking.dateArrivee;
  const newEndDate = updates.endDate || booking.dateDepart;
  const newAdults = updates.adults ?? booking.nombreAdultes;
  const newChildren = updates.children ?? booking.nombreEnfants;
  const newBabies = updates.babies ?? booking.nombreBebes;
  const newTotalGuests = newAdults + newChildren;

  const availability = await checkAvailability({
    propertyId: booking.propertyId,
    dates: {
      startDate: newStartDate,
      endDate: newEndDate,
      startTime: updates.startTime || booking.heureArrivee || undefined,
      endTime: updates.endTime || booking.heureDepart || undefined,
    },
    guests: newTotalGuests,
  });

  if (!availability.available) {
    return { success: false, error: availability.reason };
  }

  const price = await calculatePrice({
    propertyId: booking.propertyId,
    startDate: newStartDate,
    endDate: newEndDate,
    startTime: updates.startTime || booking.heureArrivee || undefined,
    endTime: updates.endTime || booking.heureDepart || undefined,
    typeReservation: booking.typeReservation as BookingType,
    adults: newAdults,
    children: newChildren,
    babies: newBabies,
  });

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.booking.update({
      where: { id: bookingId },
      data: {
        dateArrivee: newStartDate,
        dateDepart: newEndDate,
        heureArrivee: updates.startTime || booking.heureArrivee,
        heureDepart: updates.endTime || booking.heureDepart,
        nombreAdultes: newAdults,
        nombreEnfants: newChildren,
        nombreBebes: newBabies,
        nombreVoyageursTotal: newTotalGuests,
        prixSejour: price.subtotal,
        fraisMenage: price.cleaningFee,
        taxeSejour: price.cityTax,
        supplements: price.supplements,
        reductions: price.discount,
        prixTotal: price.total,
        statut: "modifiee",
      },
    });

    await tx.bookingHistory.create({
      data: {
        reservationId: bookingId,
        action: "modification",
        details: JSON.parse(JSON.stringify({
          previous: {
            startDate: booking.dateArrivee,
            endDate: booking.dateDepart,
            adults: booking.nombreAdultes,
            children: booking.nombreEnfants,
            price: Number(booking.prixTotal),
          },
          next: {
            startDate: newStartDate,
            endDate: newEndDate,
            adults: newAdults,
            children: newChildren,
            price: price.total,
          },
        })),
      },
    });

    return result;
  });

  return {
    success: true,
    booking: {
      id: updated.id,
      numero: updated.numero,
      statut: updated.statut,
      prixTotal: Number(updated.prixTotal),
      devise: updated.devise,
    },
  };
}
