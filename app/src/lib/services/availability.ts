import { prisma } from "@/lib/prisma";

export interface AvailabilityCheckResult {
  available: boolean;
  reason?: string;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
  startTime?: string;
  endTime?: string;
}

export interface AvailabilityQuery {
  propertyId: string;
  dates: DateRange;
  guests: number;
}

function hasOverlap(existingStart: Date, existingEnd: Date, queryStart: Date, queryEnd: Date): boolean {
  return existingStart < queryEnd && existingEnd > queryStart;
}

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((b.getTime() - a.getTime()) / msPerDay);
}

export async function checkAvailability(query: AvailabilityQuery): Promise<AvailabilityCheckResult> {
  const { propertyId, dates, guests } = query;

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      tarifs: { where: { actif: true } },
    },
  });

  if (!property) {
    return { available: false, reason: "Logement introuvable" };
  }

  if (property.statut === "maintenance" || property.statut === "desactive") {
    return { available: false, reason: "Logement indisponible" };
  }

  if (property.statut !== "publie") {
    return { available: false, reason: "Logement non publie" };
  }

  if (guests > property.capaciteMaximale) {
    return {
      available: false,
      reason: `Le nombre de voyageurs (${guests}) depasse la capacite maximale (${property.capaciteMaximale})`,
    };
  }

  const stayNights = daysBetween(dates.startDate, dates.endDate);
  if (stayNights < 0) {
    return { available: false, reason: "La date de depart doit etre posterieure a la date d'arrivee" };
  }

  const existingBookings = await prisma.booking.findMany({
    where: {
      propertyId,
      statut: {
        in: ["confirmee", "payee", "en_attente_paiement", "reservation_temporaire"],
      },
      dateArrivee: { lt: dates.endDate },
      dateDepart: { gt: dates.startDate },
    },
  });

  if (existingBookings.length > 0) {
    return { available: false, reason: "Le logement est deja reserve pour cette periode" };
  }

  const blockedSlots = await prisma.disponibilite.findMany({
    where: {
      propertyId,
      date: {
        gte: dates.startDate,
        lt: dates.endDate,
      },
      statut: { in: ["reserve", "bloque", "maintenance"] },
    },
  });

  if (blockedSlots.length > 0) {
    return { available: false, reason: "Des creneaux sont bloques pour cette periode" };
  }

  return { available: true };
}

export async function getPropertyAvailability(propertyId: string, year: number, month: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month + 1, 0);

  const bookings = await prisma.booking.findMany({
    where: {
      propertyId,
      statut: { in: ["confirmee", "payee", "en_attente_paiement", "reservation_temporaire"] },
      dateArrivee: { lt: endDate },
      dateDepart: { gt: startDate },
    },
    select: {
      dateArrivee: true,
      dateDepart: true,
      statut: true,
      numero: true,
    },
  });

  const blockedSlots = await prisma.disponibilite.findMany({
    where: {
      propertyId,
      date: { gte: startDate, lte: endDate },
      statut: { in: ["reserve", "bloque", "maintenance"] },
    },
    select: {
      date: true,
      statut: true,
    },
  });

  return { bookings, blockedSlots };
}

export async function searchAvailableProperties(params: {
  startDate: Date;
  endDate: Date;
  guests: number;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  beds?: number;
  page?: number;
  limit?: number;
}) {
  const {
    startDate,
    endDate,
    guests,
    propertyType,
    minPrice,
    maxPrice,
    bedrooms,
    beds,
    page = 1,
    limit = 20,
  } = params;

  const propertyWhere: Record<string, unknown> = {
    statut: "publie",
    capaciteMaximale: { gte: guests },
  };

  if (propertyType) {
    propertyWhere.type = propertyType;
  }
  if (bedrooms !== undefined) {
    propertyWhere.nombreChambres = { gte: bedrooms };
  }
  if (beds !== undefined) {
    propertyWhere.nombreLits = { gte: beds };
  }

  const allProperties = await prisma.property.findMany({
    where: propertyWhere,
    include: {
      photos: { where: { estPrincipale: true }, take: 1 },
      tarifs: { where: { actif: true } },
      avis: { select: { note: true } },
    },
  });

  const availableProperties: typeof allProperties = [];

  for (const property of allProperties) {
    const result = await checkAvailability({
      propertyId: property.id,
      dates: { startDate, endDate },
      guests,
    });
    if (result.available) {
      availableProperties.push(property);
    }
  }

  const skip = (page - 1) * limit;
  const paginated = availableProperties.slice(skip, skip + limit);

  return {
    properties: paginated,
    total: availableProperties.length,
    page,
    limit,
    totalPages: Math.ceil(availableProperties.length / limit),
  };
}
