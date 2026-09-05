import { prisma } from "@/lib/prisma";
import type { PropertyType } from "@/generated/prisma/client";
import {
  addDaysBenin,
  beninDateTime,
  beninDayStart,
  beninDateString,
  beninTimeString,
  minutesFromHHmm,
  nightsBetween,
  overlaps,
} from "@/lib/datetime-benin";
import { computePriceFromData } from "@/lib/services/pricing";

const CACHE_AVAILABILITY_TTL_MS = 5_000;
const CACHE_STATIC_TTL_MS = 60_000;

const DEFAULT_CHECK_IN = "14:00";
const DEFAULT_CHECK_OUT = "11:00";

export type UnavailabilityReason =
  | "logement_indisponible"
  | "reservation_existante"
  | "reservation_whatsapp"
  | "blocage_administratif"
  | "maintenance"
  | "sync_externe"
  | "duree_insuffisante"
  | "duree_excessive"
  | "capacite_depasse"
  | "horaires_invalides";

export const REASON_LABELS: Record<UnavailabilityReason, string> = {
  logement_indisponible: "Logement indisponible",
  reservation_existante: "Déjà réservé sur cette période",
  reservation_whatsapp: "Réservation WhatsApp en cours de validation",
  blocage_administratif: "Bloqué par l'administration",
  maintenance: "En maintenance",
  sync_externe: "Réservé via une plateforme externe",
  duree_insuffisante: "Durée de séjour insuffisante",
  duree_excessive: "Durée de séjour excessive",
  capacite_depasse: "Capacité maximale dépassée",
  horaires_invalides: "Horaires d'arrivée/départ invalides",
};

export interface AvailabilityQuery {
  propertyId: string;
  startDate: Date;
  endDate: Date;
  startTime?: string;
  endTime?: string;
  typeReservation?: string;
  adults: number;
  children: number;
  babies: number;
  excludeBookingId?: string;
}

export interface AvailabilityCheckResult {
  available: boolean;
  reasonCode?: UnavailabilityReason;
  reason?: string;
}

export interface BusyInterval {
  start: Date;
  end: Date;
  source: "booking" | "whatsapp" | "blocage" | "maintenance" | "ical";
  pending: boolean;
}

interface SejourRules {
  minNuits?: number;
  maxNuits?: number;
  minSemaines?: number;
  maxSemaines?: number;
  minMois?: number;
  maxMois?: number;
}

function parseSejourRules(regles: { typeRegle: string; valeur: string | null }[]): SejourRules {
  const rule = regles.find((r) => r.typeRegle === "sejour");
  if (!rule?.valeur) return {};
  try {
    const parsed = JSON.parse(rule.valeur);
    if (typeof parsed === "object" && parsed !== null) {
      return {
        minNuits: typeof parsed.minNuits === "number" ? parsed.minNuits : undefined,
        maxNuits: typeof parsed.maxNuits === "number" ? parsed.maxNuits : undefined,
        minSemaines: typeof parsed.minSemaines === "number" ? parsed.minSemaines : undefined,
        maxSemaines: typeof parsed.maxSemaines === "number" ? parsed.maxSemaines : undefined,
        minMois: typeof parsed.minMois === "number" ? parsed.minMois : undefined,
        maxMois: typeof parsed.maxMois === "number" ? parsed.maxMois : undefined,
      };
    }
    if (typeof parsed === "number") return { minNuits: parsed };
  } catch {
    const n = parseInt(rule.valeur, 10);
    if (!isNaN(n)) return { minNuits: n };
  }
  return {};
}

function isHourlyType(typeReservation?: string): boolean {
  return ["heure", "plusieurs_heures", "vingt_quatre_heures"].includes(
    typeReservation ?? ""
  );
}

export function resolveBookingInterval(
  booking: {
    dateArrivee: Date;
    dateDepart: Date;
    heureArrivee: string | null;
    heureDepart: string | null;
    typeReservation: string;
  },
  checkIn = DEFAULT_CHECK_IN,
  checkOut = DEFAULT_CHECK_OUT
): BusyInterval["start"] extends never ? never : { start: Date; end: Date } {
  const arriveeDay = beninDateString(booking.dateArrivee);
  const departDay = beninDateString(booking.dateDepart);
  const start = beninDateTime(arriveeDay, booking.heureArrivee || checkIn);
  let end = beninDateTime(departDay, booking.heureDepart || checkOut);
  if (end <= start) end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

export function resolveSlotInterval(slot: {
  date: Date;
  heureDebut: string | null;
  heureFin: string | null;
}): { start: Date; end: Date } {
  const day = beninDateString(new Date(slot.date));
  const startMin = minutesFromHHmm(slot.heureDebut);
  const endMin = minutesFromHHmm(slot.heureFin);
  if (startMin === null && endMin === null) {
    const start = beninDayStart(day);
    return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
  }
  return {
    start: beninDateTime(day, slot.heureDebut ?? "00:00"),
    end: beninDateTime(day, slot.heureFin ?? "23:59"),
  };
}

export async function fetchBusyIntervals(
  propertyIds: string[],
  windowStart: Date,
  windowEnd: Date,
  excludeBookingId?: string
): Promise<Map<string, BusyInterval[]>> {
  const map = new Map<string, BusyInterval[]>();
  for (const id of propertyIds) map.set(id, []);
  if (propertyIds.length === 0) return map;

  const [bookings, slots] = await Promise.all([
    prisma.booking.findMany({
      where: {
        propertyId: { in: propertyIds },
        ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
        statut: {
          in: [
            "confirmee",
            "payee",
            "modifiee",
            "en_attente_paiement",
            "reservation_temporaire",
            "demande_en_attente",
          ],
        },
        dateArrivee: { lt: windowEnd },
        dateDepart: { gt: windowStart },
      },
      select: {
        propertyId: true,
        dateArrivee: true,
        dateDepart: true,
        heureArrivee: true,
        heureDepart: true,
        typeReservation: true,
        statut: true,
        source: true,
      },
    }),
    prisma.disponibilite.findMany({
      where: {
        propertyId: { in: propertyIds },
        statut: { in: ["reserve", "bloque", "maintenance"] },
        date: {
          gte: new Date(`${beninDateString(windowStart)}T00:00:00.000Z`),
          lte: new Date(`${beninDateString(windowEnd)}T00:00:00.000Z`),
        },
      },
      select: {
        propertyId: true,
        date: true,
        heureDebut: true,
        heureFin: true,
        statut: true,
        source: true,
      },
    }),
  ]);

  const checkInCache = new Map<string, string>();
  const checkOutCache = new Map<string, string>();
  const propertyIdsWithRules = [...new Set(bookings.map((b) => b.propertyId))];
  if (propertyIdsWithRules.length > 0) {
    const rules = await prisma.regle.findMany({
      where: { propertyId: { in: propertyIdsWithRules }, typeRegle: { in: ["check_in", "check_out"] }, actif: true },
    });
    for (const rule of rules) {
      if (rule.typeRegle === "check_in") checkInCache.set(rule.propertyId, rule.valeur || DEFAULT_CHECK_IN);
      if (rule.typeRegle === "check_out") checkOutCache.set(rule.propertyId, rule.valeur || DEFAULT_CHECK_OUT);
    }
  }

  for (const b of bookings) {
    const interval = resolveBookingInterval(
      b,
      checkInCache.get(b.propertyId) || DEFAULT_CHECK_IN,
      checkOutCache.get(b.propertyId) || DEFAULT_CHECK_OUT
    );
    const pending = b.statut === "demande_en_attente" || b.statut === "reservation_temporaire";
    const source: BusyInterval["source"] =
      b.source === "whatsapp" && b.statut === "demande_en_attente"
        ? "whatsapp"
        : b.statut === "demande_en_attente"
          ? "whatsapp"
          : "booking";
    map.get(b.propertyId)?.push({ ...interval, source, pending });
  }

  for (const s of slots) {
    const interval = resolveSlotInterval(s);
    const source: BusyInterval["source"] =
      s.source === "ical" ? "ical" : s.statut === "maintenance" ? "maintenance" : "blocage";
    map.get(s.propertyId)?.push({ ...interval, source, pending: false });
  }

  return map;
}

export function evaluateAvailability(params: {
  propertyStatut: string;
  busyIntervals: BusyInterval[];
  sejourRules: SejourRules;
  capaciteMaximale: number;
  adultesMax: number;
  enfantsMax: number;
  bebesMax: number;
  query: {
    startDate: Date;
    endDate: Date;
    startTime?: string;
    endTime?: string;
    typeReservation?: string;
    adults: number;
    children: number;
    babies: number;
  };
}): AvailabilityCheckResult {
  const { propertyStatut, busyIntervals, sejourRules, capaciteMaximale, adultesMax, enfantsMax, bebesMax, query } =
    params;

  if (propertyStatut === "maintenance") {
    return { available: false, reasonCode: "maintenance", reason: REASON_LABELS.maintenance };
  }
  if (propertyStatut !== "publie") {
    return { available: false, reasonCode: "logement_indisponible", reason: REASON_LABELS.logement_indisponible };
  }

  if (query.endDate <= query.startDate) {
    return { available: false, reasonCode: "horaires_invalides", reason: REASON_LABELS.horaires_invalides };
  }

  const conflict = busyIntervals.find((interval) =>
    overlaps(interval.start, interval.end, query.startDate, query.endDate)
  );
  if (conflict) {
    const code: UnavailabilityReason =
      conflict.source === "ical"
        ? "sync_externe"
        : conflict.source === "blocage"
          ? "blocage_administratif"
          : conflict.source === "maintenance"
            ? "maintenance"
            : conflict.source === "whatsapp"
              ? "reservation_whatsapp"
              : "reservation_existante";
    return { available: false, reasonCode: code, reason: REASON_LABELS[code] };
  }

  const totalNights = Math.max(1, Math.ceil(nightsBetween(query.startDate, query.endDate)));
  if (!isHourlyType(query.typeReservation)) {
    if (query.typeReservation === "semaine") {
      const totalSemaines = Math.floor(totalNights / 7);
      if (sejourRules.minSemaines !== undefined && totalSemaines < sejourRules.minSemaines) {
        return { available: false, reasonCode: "duree_insuffisante", reason: REASON_LABELS.duree_insuffisante };
      }
      if (sejourRules.maxSemaines !== undefined && totalSemaines > sejourRules.maxSemaines) {
        return { available: false, reasonCode: "duree_excessive", reason: REASON_LABELS.duree_excessive };
      }
    } else if (query.typeReservation === "mois") {
      const totalMois = Math.floor(totalNights / 30);
      if (sejourRules.minMois !== undefined && totalMois < sejourRules.minMois) {
        return { available: false, reasonCode: "duree_insuffisante", reason: REASON_LABELS.duree_insuffisante };
      }
      if (sejourRules.maxMois !== undefined && totalMois > sejourRules.maxMois) {
        return { available: false, reasonCode: "duree_excessive", reason: REASON_LABELS.duree_excessive };
      }
    } else {
      if (sejourRules.minNuits !== undefined && totalNights < sejourRules.minNuits) {
        return { available: false, reasonCode: "duree_insuffisante", reason: REASON_LABELS.duree_insuffisante };
      }
      if (sejourRules.maxNuits !== undefined && totalNights > sejourRules.maxNuits) {
        return { available: false, reasonCode: "duree_excessive", reason: REASON_LABELS.duree_excessive };
      }
    }
  }

  if (
    query.adults > adultesMax ||
    query.children > enfantsMax ||
    query.babies > bebesMax ||
    query.adults + query.children > capaciteMaximale
  ) {
    return { available: false, reasonCode: "capacite_depasse", reason: REASON_LABELS.capacite_depasse };
  }

  return { available: true };
}

export async function loadPropertyEngineData(propertyId: string) {
  return prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      tarifs: { where: { actif: true } },
      promotions: { where: { actif: true } },
      regles: { where: { actif: true } },
    },
  });
}

export async function checkAvailability(query: AvailabilityQuery): Promise<AvailabilityCheckResult> {
  const cacheKey = `check:${JSON.stringify([query.propertyId, query.startDate.toISOString(), query.endDate.toISOString(), query.startTime, query.endTime, query.typeReservation, query.adults, query.children, query.babies])}`;
  return cached(cacheKey, CACHE_AVAILABILITY_TTL_MS, async () => {
    const property = await loadPropertyEngineData(query.propertyId);
    if (!property) {
      return { available: false, reasonCode: "logement_indisponible" as const, reason: "Logement introuvable" };
    }
    const busyMap = await fetchBusyIntervals([property.id], query.startDate, query.endDate, query.excludeBookingId);
    return evaluateAvailability({
      propertyStatut: property.statut,
      busyIntervals: busyMap.get(property.id) ?? [],
      sejourRules: parseSejourRules(property.regles),
      capaciteMaximale: property.capaciteMaximale,
      adultesMax: property.adultesMax,
      enfantsMax: property.enfantsMax,
      bebesMax: property.bebesMax,
      query,
    });
  });
}

// ─── Calendrier mensuel (code couleur) ───────────────

export interface CalendarSlot {
  debut: string;
  fin: string;
  statut: "reserve" | "bloque" | "maintenance";
  source: string;
}

export interface CalendarDay {
  date: string;
  statut: "disponible" | "reserve" | "bloque" | "maintenance" | "en_attente";
  creneaux: CalendarSlot[];
  libelle: string;
}

export async function getMonthlyCalendar(propertyId: string, year: number, month: number): Promise<{ days: CalendarDay[] }> {
  const cacheKey = `cal:${propertyId}:${year}:${month}`;
  return cached(cacheKey, CACHE_AVAILABILITY_TTL_MS, async () => {
    const monthStart = beninDayStart(`${year}-${String(month).padStart(2, "0")}-01`);
    const nextMonth = month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const monthEnd = beninDayStart(nextMonth);

    const [property, busyMap] = await Promise.all([
      prisma.property.findUnique({ where: { id: propertyId }, select: { statut: true } }),
      fetchBusyIntervals([propertyId], monthStart, monthEnd),
    ]);
    const intervals = busyMap.get(propertyId) ?? [];

    const days: CalendarDay[] = [];
    let cursor = `${year}-${String(month).padStart(2, "0")}-01`;
    while (cursor < nextMonth) {
      const dayStart = beninDayStart(cursor);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      const dayIntervals = intervals.filter((i) => i.start < dayEnd && i.end > dayStart);

      let statut: CalendarDay["statut"] = "disponible";
      let libelle = "Disponible";
      if (property?.statut === "maintenance") {
        statut = "maintenance";
        libelle = "Maintenance du logement";
      } else if (dayIntervals.some((i) => i.source === "maintenance")) {
        statut = "maintenance";
        libelle = "Maintenance";
      } else if (dayIntervals.some((i) => i.source === "booking" && !i.pending)) {
        statut = "reserve";
        libelle = "Réservé";
      } else if (dayIntervals.some((i) => i.source === "ical")) {
        statut = "reserve";
        libelle = "Réservé (plateforme externe)";
      } else if (dayIntervals.some((i) => i.source === "blocage")) {
        statut = "bloque";
        libelle = "Indisponible";
      } else if (dayIntervals.length > 0) {
        statut = "en_attente";
        libelle = "En attente de confirmation";
      }

      const creneaux: CalendarSlot[] = dayIntervals.map((i) => ({
        debut: beninTimeString(i.start),
        fin: beninTimeString(i.end),
        statut:
          i.source === "maintenance"
            ? "maintenance"
            : i.source === "blocage"
              ? "bloque"
              : ("reserve" as const),
        source: i.source,
      }));

      days.push({ date: cursor, statut, creneaux, libelle });
      cursor = addDaysBenin(cursor, 1);
    }

    return { days };
  });
}

// ─── Périodes alternatives (Test 3) ──────────────────

export async function suggestAlternativePeriods(params: {
  propertyId: string;
  startDate: Date;
  endDate: Date;
  daysAround?: number;
  maxSuggestions?: number;
}): Promise<Array<{ startDate: string; endDate: string }>> {
  const { propertyId, startDate, endDate, daysAround = 7, maxSuggestions = 2 } = params;
  const durationMs = endDate.getTime() - startDate.getTime();
  if (durationMs <= 0) return [];

  const searchWindowStart = new Date(startDate.getTime() - daysAround * 24 * 60 * 60 * 1000);
  const searchWindowEnd = new Date(endDate.getTime() + daysAround * 24 * 60 * 60 * 1000);

  const property = await prisma.property.findUnique({ where: { id: propertyId }, select: { statut: true } });
  if (!property || property.statut !== "publie") return [];

  const busyMap = await fetchBusyIntervals([propertyId], searchWindowStart, searchWindowEnd);
  const busy = (busyMap.get(propertyId) ?? []).sort((a, b) => a.start.getTime() - b.start.getTime());

  const suggestions: Array<{ startDate: string; endDate: string }> = [];
  const candidates: Array<{ start: Date; end: Date }> = [];

  let cursor = searchWindowStart;
  for (const interval of busy) {
    if (interval.start >= cursor && interval.start.getTime() - cursor.getTime() >= durationMs) {
      candidates.push({ start: new Date(cursor), end: new Date(cursor.getTime() + durationMs) });
    }
    if (interval.end > cursor) cursor = interval.end;
  }
  if (searchWindowEnd.getTime() - cursor.getTime() >= durationMs) {
    candidates.push({ start: new Date(cursor), end: new Date(cursor.getTime() + durationMs) });
  }

  for (const candidate of candidates) {
    if (candidate.end > new Date(Date.now() + 60 * 60 * 1000)) {
      suggestions.push({
        startDate: beninDateString(candidate.start),
        endDate: beninDateString(candidate.end),
      });
    }
    if (suggestions.length >= maxSuggestions) break;
  }

  return suggestions;
}

// ─── Verrouillage temporaire (anti double réservation) ──

export function getLockTtlMinutes(): number {
  const n = parseInt(process.env.BOOKING_LOCK_TTL_MINUTES ?? "20", 10);
  return isNaN(n) || n < 5 || n > 30 ? 20 : n;
}

export async function acquireTemporaryLock(params: {
  propertyId: string;
  clientId: string;
  startDate: Date;
  endDate: Date;
  startTime?: string;
  endTime?: string;
  typeReservation: string;
  adults: number;
  children: number;
  babies: number;
}): Promise<{ success: boolean; lockId?: string; expiresAt?: Date; error?: string }> {
  const availability = await checkAvailability({
    propertyId: params.propertyId,
    startDate: params.startDate,
    endDate: params.endDate,
    startTime: params.startTime,
    endTime: params.endTime,
    typeReservation: params.typeReservation,
    adults: params.adults,
    children: params.children,
    babies: params.babies,
  });

  if (!availability.available) {
    return { success: false, error: availability.reason };
  }

  const ttlMinutes = getLockTtlMinutes();
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
  const numero = `RES-TMP-${Date.now().toString(36).toUpperCase()}`;

  try {
    const lock = await prisma.$transaction(async (tx) => {
      const conflicting = await tx.booking.count({
        where: {
          propertyId: params.propertyId,
          statut: { in: ["confirmee", "payee", "modifiee", "en_attente_paiement", "reservation_temporaire"] },
          dateArrivee: { lt: params.endDate },
          dateDepart: { gt: params.startDate },
        },
      });
      if (conflicting > 0) throw new Error("CONFLIT");

      return tx.booking.create({
        data: {
          numero,
          statut: "reservation_temporaire",
          propertyId: params.propertyId,
          clientId: params.clientId,
          dateArrivee: params.startDate,
          dateDepart: params.endDate,
          heureArrivee: params.startTime || null,
          heureDepart: params.endTime || null,
          typeReservation: params.typeReservation as never,
          nombreAdultes: params.adults,
          nombreEnfants: params.children,
          nombreBebes: params.babies,
          nombreVoyageursTotal: params.adults + params.children,
          prixSejour: 0,
          prixTotal: 0,
          devise: "EUR",
          source: "site_web",
        },
      });
    });

    clearAvailabilityCache();
    return { success: true, lockId: lock.id, expiresAt };
  } catch {
    return { success: false, error: "Le créneau vient d'être pris par une autre réservation" };
  }
}

export async function releaseTemporaryLock(bookingId: string): Promise<boolean> {
  const result = await prisma.booking.updateMany({
    where: { id: bookingId, statut: "reservation_temporaire" },
    data: { statut: "annulee", motifAnnulation: "verrou_libere" },
  });
  clearAvailabilityCache();
  return result.count > 0;
}

export async function promoteTemporaryLock(bookingId: string): Promise<boolean> {
  const result = await prisma.booking.updateMany({
    where: { id: bookingId, statut: "reservation_temporaire" },
    data: { statut: "en_attente_paiement" },
  });
  clearAvailabilityCache();
  return result.count > 0;
}

export async function expireStaleLocks(): Promise<number> {
  const ttlMinutes = getLockTtlMinutes();
  const deadline = new Date(Date.now() - ttlMinutes * 60 * 1000);

  const stale = await prisma.booking.findMany({
    where: { statut: "reservation_temporaire", createdAt: { lt: deadline } },
    select: { id: true },
  });

  if (stale.length === 0) return 0;

  const result = await prisma.booking.updateMany({
    where: { id: { in: stale.map((s) => s.id) } },
    data: { statut: "annulee", motifAnnulation: "verrou_expire" },
  });

  clearAvailabilityCache();
  return result.count;
}

// ─── Cache interne ───────────────────────────────────

const cacheStore = new Map<string, { expires: number; value: unknown }>();

async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = cacheStore.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as T;
  const value = await fn();
  cacheStore.set(key, { expires: Date.now() + ttlMs, value });
  return value;
}

export function clearAvailabilityCache(): void {
  cacheStore.clear();
}

// ─── Moteur de recherche (requêtes groupées, zéro N+1) ──

export interface SearchEngineParams {
  arrivee: string;
  depart: string;
  heureArrivee?: string;
  heureDepart?: string;
  typeReservation?: string;
  adults: number;
  children: number;
  babies: number;
  type?: string;
  chambresMin?: number;
  litsMin?: number;
  equipements?: string[];
  prixMin?: number;
  prixMax?: number;
  tri?: "pertinence" | "prix_croissant" | "prix_decroissant" | "note" | "newest";
  page?: number;
  limit?: number;
}

export interface SearchResultItem {
  id: string;
  nom: string;
  type: string;
  capaciteMaximale: number;
  adultesMax: number;
  enfantsMax: number;
  bebesMax: number;
  nombreChambres: number;
  nombreLits: number;
  photo: string | null;
  noteMoyenne: number | null;
  nombreAvis: number;
  equipements: string[];
  prixTotal: number;
  prixBase: number;
  prixParNuit: number;
  nuitsOuUnites: number;
  devise: string;
  promotionAppliquee: string | null;
}

export interface SearchResult {
  results: SearchResultItem[];
  total: number;
  page: number;
  totalPages: number;
}

export async function searchAvailableProperties(params: SearchEngineParams): Promise<SearchResult> {
  const cacheKey = `search:${JSON.stringify(params)}`;
  return cached(cacheKey, CACHE_AVAILABILITY_TTL_MS, () => runSearch(params));
}

async function runSearch(params: SearchEngineParams): Promise<SearchResult> {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(50, Math.max(1, params.limit ?? 20));
  const typeReservation = params.typeReservation || "nuee";

  const startDate = beninDateTime(
    params.arrivee,
    isHourlyType(typeReservation) ? params.heureArrivee || "08:00" : undefined
  );
  const endDate = beninDateTime(
    params.depart,
    isHourlyType(typeReservation) ? params.heureDepart || "18:00" : undefined
  );

  const properties = await prisma.property.findMany({
    where: {
      statut: "publie",
      ...(params.type ? { type: params.type as PropertyType } : {}),
      ...(params.chambresMin ? { nombreChambres: { gte: params.chambresMin } } : {}),
      ...(params.litsMin ? { nombreLits: { gte: params.litsMin } } : {}),
      ...(params.adults ? { adultesMax: { gte: params.adults } } : {}),
      ...(params.children ? { enfantsMax: { gte: params.children } } : {}),
      ...(params.babies ? { bebesMax: { gte: params.babies } } : {}),
    },
    include: {
      photos: { orderBy: { ordre: "asc" }, take: 1 },
      tarifs: { where: { actif: true } },
      promotions: { where: { actif: true } },
      regles: { where: { actif: true } },
      caracteristiques: { include: { caracteristique: true } },
      avis: { where: { statut: "publique" }, select: { note: true } },
    },
  });

  let candidates = properties;

  if (params.equipements && params.equipements.length > 0) {
    const caracteristiques = await prisma.caracteristique.findMany({
      where: {
        OR: [{ id: { in: params.equipements } }, { nom: { in: params.equipements } }],
      },
      select: { id: true },
    });
    const requiredIds = new Set(caracteristiques.map((c) => c.id));
    if (requiredIds.size > 0) {
      candidates = candidates.filter((p) => {
        const owned = new Set(p.caracteristiques.map((e) => e.caracteristiqueId));
        for (const id of requiredIds) {
          if (!owned.has(id)) return false;
        }
        return true;
      });
    }
  }

  const busyMap = await fetchBusyIntervals(
    candidates.map((p) => p.id),
    startDate,
    endDate
  );

  type Scored = { item: SearchResultItem; sortPrice: number; sortNote: number; sortDate: number };
  const available: Scored[] = [];

  for (const property of candidates) {
    const query = {
      startDate,
      endDate,
      startTime: params.heureArrivee,
      endTime: params.heureDepart,
      typeReservation,
      adults: params.adults,
      children: params.children,
      babies: params.babies,
    };

    const check = evaluateAvailability({
      propertyStatut: property.statut,
      busyIntervals: busyMap.get(property.id) ?? [],
      sejourRules: parseSejourRules(property.regles),
      capaciteMaximale: property.capaciteMaximale,
      adultesMax: property.adultesMax,
      enfantsMax: property.enfantsMax,
      bebesMax: property.bebesMax,
      query,
    });

    if (!check.available) continue;

    const price = computePriceFromData({
      tarifs: property.tarifs,
      promotions: property.promotions,
      devise: property.devise,
      ...query,
    });

    if (params.prixMin !== undefined && price.total < params.prixMin) continue;
    if (params.prixMax !== undefined && price.total > params.prixMax) continue;

    const notes = property.avis.map((a) => a.note);
    const noteMoyenne = notes.length > 0 ? Math.round((notes.reduce((s, n) => s + n, 0) / notes.length) * 10) / 10 : null;

    const item: SearchResultItem = {
      id: property.id,
      nom: property.nom,
      type: property.type,
      capaciteMaximale: property.capaciteMaximale,
      adultesMax: property.adultesMax,
      enfantsMax: property.enfantsMax,
      bebesMax: property.bebesMax,
      nombreChambres: property.nombreChambres,
      nombreLits: property.nombreLits,
      photo: property.photos[0]?.url ?? null,
      noteMoyenne,
      nombreAvis: notes.length,
      equipements: property.caracteristiques.slice(0, 6).map((e) => e.caracteristique.nom),
      prixTotal: price.total,
      prixBase: price.baseRate,
      prixParNuit: price.baseRate,
      nuitsOuUnites: price.nightsOrUnits,
      devise: price.currency,
      promotionAppliquee: price.promotionAppliquee,
    };

    available.push({ item, sortPrice: price.total, sortNote: noteMoyenne ?? 0, sortDate: new Date(property.createdAt).getTime() });
  }

  switch (params.tri) {
    case "prix_croissant":
      available.sort((a, b) => a.sortPrice - b.sortPrice);
      break;
    case "prix_decroissant":
      available.sort((a, b) => b.sortPrice - a.sortPrice);
      break;
    case "note":
      available.sort((a, b) => b.sortNote - a.sortNote);
      break;
    case "newest":
      available.sort((a, b) => b.sortDate - a.sortDate);
      break;
    default:
      break;
  }

  const total = available.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const results = available.slice((page - 1) * limit, page * limit).map((scored) => scored.item);

  return { results, total, page, totalPages };
}

export async function getSearchFilterOptions() {
  return cached("filter-options", CACHE_STATIC_TTL_MS, async () => {
    const [typeCounts, caracteristiques] = await Promise.all([
      prisma.property.groupBy({
        by: ["type"],
        where: { statut: "publie" },
        _count: { _all: true },
      }),
      prisma.caracteristique.findMany({
        where: { actif: true },
        orderBy: { ordre: "asc" },
        select: { id: true, nom: true, icone: true, categorie: true },
      }),
    ]);

    return {
      types: typeCounts.map((t) => ({ type: t.type, count: t._count._all })),
      equipements: caracteristiques,
    };
  });
}
