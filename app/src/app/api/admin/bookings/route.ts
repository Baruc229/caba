import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import {
  confirmBooking,
  cancelBooking,
  markBookingPaid,
  completeBooking,
} from "@/lib/services/booking";
import {
  notifyBookingConfirmed,
  notifyCancellation,
} from "@/lib/services/notifications";

const STAFF_ROLES = ["administrateur", "gestionnaire", "reception"];

function isStaff(role?: string) {
  return !!role && STAFF_ROLES.includes(role);
}

function startOfDayUTCIso(dateStr: string): Date {
  return new Date(Date.UTC(
    Number(dateStr.slice(0, 4)),
    Number(dateStr.slice(5, 7)) - 1,
    Number(dateStr.slice(8, 10)),
    0, 0, 0,
  ));
}

function endOfDayUTCIso(dateStr: string): Date {
  return new Date(Date.UTC(
    Number(dateStr.slice(0, 4)),
    Number(dateStr.slice(5, 7)) - 1,
    Number(dateStr.slice(8, 10)) + 1,
    0, 0, 0,
  ));
}

function serializeList(booking: {
  id: string;
  numero: string;
  statut: string;
  dateArrivee: Date;
  dateDepart: Date;
  nombreVoyageursTotal: number;
  prixTotal: { toString(): string };
  devise: string;
  source: string;
  createdAt: Date;
  property: { nom: string; type: string; ville: string };
  client: { prenom: string; nom: string; email: string };
}) {
  return {
    id: booking.id,
    numero: booking.numero,
    statut: booking.statut,
    logement: booking.property.nom,
    typeLogement: booking.property.type,
    ville: booking.property.ville,
    client: `${booking.client.prenom} ${booking.client.nom}`.trim(),
    clientEmail: booking.client.email,
    arrivee: booking.dateArrivee.toISOString().slice(0, 10),
    depart: booking.dateDepart.toISOString().slice(0, 10),
    voyageurs: booking.nombreVoyageursTotal,
    montant: Number(booking.prixTotal),
    devise: booking.devise,
    source: booking.source,
    creeLe: booking.createdAt.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !isStaff(session.user.role)) {
      return NextResponse.json({ error: "Non autorise" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // ─── Détail d'une réservation ───
    if (id) {
      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          property: {
            select: { id: true, nom: true, type: true, ville: true, adresse: true, devise: true },
          },
          client: {
            select: { id: true, prenom: true, nom: true, email: true, telephone: true },
          },
          paiements: { orderBy: { createdAt: "desc" } },
          historique: { orderBy: { createdAt: "desc" }, take: 30 },
        },
      });

      if (!booking) {
        return NextResponse.json({ error: "Reservation introuvable" }, { status: 404 });
      }

      return NextResponse.json({
        booking: {
          ...serializeList(booking),
          voyageurs: booking.nombreVoyageursTotal,
          typeReservation: booking.typeReservation,
          heureArrivee: booking.heureArrivee,
          heureDepart: booking.heureDepart,
          nombreAdultes: booking.nombreAdultes,
          nombreEnfants: booking.nombreEnfants,
          nombreBebes: booking.nombreBebes,
          prixSejour: Number(booking.prixSejour),
          fraisMenage: Number(booking.fraisMenage),
          taxeSejour: Number(booking.taxeSejour),
          supplements: Number(booking.supplements),
          reductions: Number(booking.reductions),
          prixTotal: Number(booking.prixTotal),
          notesInternes: booking.notesInternes,
          motifAnnulation: booking.motifAnnulation,
          property: {
            id: booking.property.id,
            nom: booking.property.nom,
            type: booking.property.type,
            ville: booking.property.ville,
            adresse: booking.property.adresse,
          },
          client: booking.client,
          paiements: booking.paiements.map((p) => ({
            id: p.id,
            numero: p.numero,
            montant: Number(p.montant),
            devise: p.devise,
            statut: p.statut,
            moyenPaiement: p.moyenPaiement,
            datePaiement: p.datePaiement?.toISOString() ?? null,
            createdAt: p.createdAt.toISOString(),
          })),
          historique: booking.historique.map((h) => ({
            id: h.id,
            action: h.action,
            details: h.details,
            createdAt: h.createdAt.toISOString(),
          })),
        },
      });
    }

    // ─── Liste avec filtres + pagination ───
    const status = searchParams.get("status") || undefined;
    const propertyId = searchParams.get("propertyId") || undefined;
    const search = searchParams.get("search")?.trim() || undefined;
    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10) || 25));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (status) where.statut = status;
    if (propertyId) where.propertyId = propertyId;

    if (search) {
      where.OR = [
        { numero: { contains: search, mode: "insensitive" } },
        {
          client: {
            OR: [
              { prenom: { contains: search, mode: "insensitive" } },
              { nom: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          },
        },
        { property: { nom: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (from) where.dateArrivee = { ...(where.dateArrivee ?? {}), gte: startOfDayUTCIso(from) };
    if (to) where.dateDepart = { ...(where.dateDepart ?? {}), lte: endOfDayUTCIso(to) };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          property: { select: { nom: true, type: true, ville: true } },
          client: { select: { prenom: true, nom: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({
      bookings: bookings.map((b) => serializeList(b)),
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("Bookings API error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !isStaff(session.user.role)) {
      return NextResponse.json({ error: "Non autorise" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const id: string | undefined = body?.id;
    const action: string | undefined = body?.action;
    const motifAnnulation: string | undefined = body?.motifAnnulation;
    const notesInternes: string | undefined = body?.notesInternes;

    if (!id) {
      return NextResponse.json({ error: "Identifiant manquant" }, { status: 400 });
    }

    async function run(
      fn: () => Promise<{ success: boolean; error?: string; booking?: unknown }>,
      notify?: () => Promise<void>
    ) {
      const res = await fn();
      if (!res.success) {
        return NextResponse.json({ error: res.error ?? "Erreur" }, { status: 400 });
      }
      if (notify) {
        await notify().catch(() => {});
      }
      return NextResponse.json({ booking: res.booking });
    }

    switch (action) {
      case "confirmer":
        return run(() => confirmBooking(id), () => notifyBookingConfirmed(id));
      case "payer":
        return run(() => markBookingPaid(id));
      case "annuler":
        return run(() => cancelBooking(id, motifAnnulation), () => notifyCancellation(id));
      case "terminer":
        return run(() => completeBooking(id));
      case "notes": {
        await prisma.booking.update({
          where: { id },
          data: { notesInternes: notesInternes ?? null },
        });
        return NextResponse.json({ ok: true });
      }
      default:
        return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
    }
  } catch (error) {
    console.error("Bookings PATCH error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}