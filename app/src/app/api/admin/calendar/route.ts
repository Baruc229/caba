import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const STAFF_ROLES = ["administrateur", "gestionnaire", "reception"];

function isStaff(role?: string) {
  return !!role && STAFF_ROLES.includes(role);
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !isStaff(session.user.role)) {
      return NextResponse.json({ error: "Non autorise" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const requested = searchParams.get("month") || "";

    let year: number;
    let monthIndex: number;
    if (/^\d{4}-(0[1-9]|1[0-2])$/.test(requested)) {
      year = Number(requested.slice(0, 4));
      monthIndex = Number(requested.slice(5, 7)) - 1;
    } else {
      const now = new Date();
      year = now.getUTCFullYear();
      monthIndex = now.getUTCMonth();
    }

    const start = new Date(Date.UTC(year, monthIndex, 1));
    const end = new Date(Date.UTC(year, monthIndex + 1, 1));

    const [properties, bookings, disponibilites] = await Promise.all([
      prisma.property.findMany({
        where: { statut: { in: ["publie", "maintenance"] } },
        orderBy: { nom: "asc" },
        select: { id: true, nom: true, type: true, ville: true },
      }),
      prisma.booking.findMany({
        where: {
          statut: { notIn: ["annulee", "terminee"] },
          dateArrivee: { lt: end },
          dateDepart: { gte: start },
        },
        select: {
          id: true,
          numero: true,
          propertyId: true,
          dateArrivee: true,
          dateDepart: true,
          statut: true,
          prixTotal: true,
          devise: true,
          client: { select: { prenom: true, nom: true } },
        },
      }),
      prisma.disponibilite.findMany({
        where: {
          date: { gte: start, lt: end },
          statut: { in: ["bloque", "maintenance"] },
        },
        select: { propertyId: true, date: true, statut: true },
      }),
    ]);

    return NextResponse.json({
      month: `${year}-${String(monthIndex + 1).padStart(2, "0")}`,
      properties: properties.map((p) => ({
        id: p.id,
        nom: p.nom,
        type: p.type,
        ville: p.ville,
      })),
      bookings: bookings.map((b) => ({
        id: b.id,
        numero: b.numero,
        propertyId: b.propertyId,
        arrivee: b.dateArrivee.toISOString().slice(0, 10),
        depart: b.dateDepart.toISOString().slice(0, 10),
        statut: b.statut,
        client: `${b.client.prenom} ${b.client.nom}`.trim(),
        montant: Number(b.prixTotal),
        devise: b.devise,
      })),
      disponibilites: disponibilites.map((d) => ({
        propertyId: d.propertyId,
        date: d.date.toISOString().slice(0, 10),
        statut: d.statut,
      })),
    });
  } catch (error) {
    console.error("Calendar API error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}