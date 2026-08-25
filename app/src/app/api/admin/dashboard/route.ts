import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoISO(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function whereBookingDay(field: string, dateStr: string): any {
  return {
    gte: new Date(Date.UTC(Number(dateStr.slice(0, 4)), Number(dateStr.slice(5, 7)) - 1, Number(dateStr.slice(8, 10)), 0, 0)),
    lt: new Date(Date.UTC(Number(dateStr.slice(0, 4)), Number(dateStr.slice(5, 7)) - 1, Number(dateStr.slice(8, 10)) + 1, 0, 0)),
  };
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || !["administrateur", "gestionnaire", "reception"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorise" }, { status: 403 });
    }

    const today = todayISO();
    const todayStart = whereBookingDay("dateArrivee", today);
    const todayDepart = whereBookingDay("dateDepart", today);
    const septJours = daysAgoISO(7);
    const trenteJours = daysAgoISO(30);

    const [
      reservationsJour,
      arriveesJour,
      departsJour,
      logements,
      whatsappEnAttente,
      revenusJour,
      revenusSemaine,
      revenusMois,
      dernieresReservations,
      notifications,
      paiementsRecents,
      // Graphiques : revenus 14 jours
      revenusGraphRaw,
      // Graphiques : occupation 14 jours
      occupationRaw,
      // Répartition par type
      repartitionType,
      // Sources
      sourcesReservation,
    ] = await Promise.all([
      // 1. Réservations du jour (confirmées ou payées)
      prisma.booking.count({
        where: {
          statut: { in: ["confirmee", "payee", "en_attente_paiement"] },
          dateArrivee: todayStart,
        },
      }),

      // 2. Arrivées du jour
      prisma.booking.count({
        where: {
          statut: { notIn: ["annulee"] },
          dateArrivee: todayStart,
        },
      }),

      // 3. Départs du jour
      prisma.booking.count({
        where: {
          statut: { notIn: ["annulee"] },
          dateDepart: todayDepart,
        },
      }),

      // 4. Logements par statut
      prisma.property.groupBy({
        by: ["statut"],
        _count: true,
      }),

      // 5. WhatsApp en attente
      prisma.notification.count({
        where: {
          type: "demande_whatsapp",
          lue: false,
        },
      }),

      // 6. Revenus du jour
      prisma.paiement.aggregate({
        where: {
          statut: "confirme",
          datePaiement: todayStart,
        },
        _sum: { montant: true },
      }),

      // 7. Revenus de la semaine
      prisma.paiement.aggregate({
        where: {
          statut: "confirme",
          datePaiement: {
            gte: new Date(Date.UTC(
              Number(septJours.slice(0, 4)), Number(septJours.slice(5, 7)) - 1, Number(septJours.slice(8, 10)), 0, 0,
            )),
          },
        },
        _sum: { montant: true },
      }),

      // 8. Revenus du mois
      prisma.paiement.aggregate({
        where: {
          statut: "confirme",
          datePaiement: {
            gte: new Date(Date.UTC(
              Number(trenteJours.slice(0, 4)), Number(trenteJours.slice(5, 7)) - 1, Number(trenteJours.slice(8, 10)), 0, 0,
            )),
          },
        },
        _sum: { montant: true },
      }),

      // 9. Dernières réservations
      prisma.booking.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          property: { select: { nom: true, type: true } },
          client: { select: { prenom: true, nom: true } },
        },
      }),

      // 10. Notifications non lues
      prisma.notification.findMany({
        where: { utilisateurId: session.user!.id, lue: false },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),

      // 11. Paiements récents
      prisma.paiement.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          reservation: {
            select: {
              numero: true,
              client: { select: { prenom: true, nom: true } },
            },
          },
        },
      }),

      // 12. Revenus par jour (14 derniers jours)
      prisma.$queryRaw<{ date: string; montant: number }[]>`
        SELECT DATE(p."datePaiement")::text as date, COALESCE(SUM(p.montant), 0)::float as montant
        FROM "Paiement" p
        WHERE p.statut = 'confirme'
          AND p."datePaiement" >= ${new Date(Date.UTC(
            Number(daysAgoISO(13).slice(0, 4)),
            Number(daysAgoISO(13).slice(5, 7)) - 1,
            Number(daysAgoISO(13).slice(8, 10)),
            0, 0,
          ))}
        GROUP BY DATE(p."datePaiement")
        ORDER BY date ASC
      `,

      // 13. Taux d'occupation (14 jours)
      prisma.$queryRaw<{ date: string; reserves: number }[]>`
        SELECT d.date::text, COUNT(*)::int as reserves
        FROM "Disponibilite" d
        WHERE d.statut = 'reserve'
          AND d.date >= ${new Date(Date.UTC(
            Number(daysAgoISO(13).slice(0, 4)),
            Number(daysAgoISO(13).slice(5, 7)) - 1,
            Number(daysAgoISO(13).slice(8, 10)),
            0, 0,
          ))}
        GROUP BY d.date
        ORDER BY d.date ASC
      `,

      // 14. Répartition par type de logement (bookings confirmés 30j)
      prisma.booking.findMany({
        where: {
          statut: { in: ["confirmee", "payee"] },
          createdAt: { gte: new Date(Date.UTC(
            Number(trenteJours.slice(0, 4)), Number(trenteJours.slice(5, 7)) - 1, Number(trenteJours.slice(8, 10)), 0, 0,
          )) },
        },
        select: { property: { select: { type: true } } },
      }),

      // 15. Sources de réservation (30 jours)
      prisma.booking.groupBy({
        by: ["source"],
        where: {
          createdAt: { gte: new Date(Date.UTC(
            Number(trenteJours.slice(0, 4)), Number(trenteJours.slice(5, 7)) - 1, Number(trenteJours.slice(8, 10)), 0, 0,
          )) },
        },
        _count: true,
      }),
    ]);

    // --- Assemblage des données ---

    const logementsDisponibles = logements.find((l) => l.statut === "publie")?._count ?? 0;
    const logementsOccupes = logements.find((l) => l.statut === "maintenance")?._count ?? 0;

    // Graphique revenus : remplir les jours manquants
    const revenusMap = new Map(revenusGraphRaw.map((r) => [r.date, r.montant]));
    const revenusGraph = Array.from({ length: 14 }, (_, i) => {
      const d = daysAgoISO(13 - i);
      return { date: d, montant: revenusMap.get(d) ?? 0 };
    });

    // Graphique occupation : total des logements publiés pour calculer le taux
    const totalLogements = logementsDisponibles + logementsOccupes || 1;
    const occupationMap = new Map(occupationRaw.map((o) => [o.date, o.reserves]));
    const occupationGraph = Array.from({ length: 14 }, (_, i) => {
      const d = daysAgoISO(13 - i);
      const reserves = occupationMap.get(d) ?? 0;
      return { date: d, taux: Math.min(100, Math.round((reserves / totalLogements) * 100)) };
    });

    // Répartition par type
    const typeCountMap = new Map<string, number>();
    for (const b of repartitionType) {
      const t = b.property.type;
      typeCountMap.set(t, (typeCountMap.get(t) ?? 0) + 1);
    }
    const repartitionTypeArr = Array.from(typeCountMap.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    // Sources
    const LABELS_SOURCE: Record<string, string> = {
      site_web: "Site web",
      whatsapp: "WhatsApp",
      manuelle: "Manuelle",
      ical: "iCal",
    };
    const sourcesArr = sourcesReservation.map((s) => ({
      source: LABELS_SOURCE[s.source] ?? s.source,
      count: s._count,
    }));

    // Dernières réservations formatées
    const dernieresReservationsFmt = dernieresReservations.map((b) => ({
      id: b.id,
      numero: b.numero,
      logement: b.property.nom,
      typeLogement: b.property.type,
      client: `${b.client.prenom} ${b.client.nom}`,
      arrivee: b.dateArrivee.toISOString().slice(0, 10),
      depart: b.dateDepart.toISOString().slice(0, 10),
      statut: b.statut,
      montant: Number(b.prixTotal),
    }));

    // Notifications formatées
    const notificationsFmt = notifications.map((n) => ({
      id: n.id,
      titre: n.titre,
      message: n.message,
      type: n.type,
      date: n.createdAt.toISOString(),
      lien: n.lien,
    }));

    // Paiements formatés
    const LABELS_PAIEMENT: Record<string, string> = {
      en_attente: "En attente",
      confirme: "Confirme",
      echoue: "Echoue",
      rembourse: "Rembourse",
    };
    const paiementsFmt = paiementsRecents.map((p) => ({
      id: p.id,
      numero: p.numero,
      montant: Number(p.montant),
      statut: LABELS_PAIEMENT[p.statut] ?? p.statut,
      statutKey: p.statut,
      date: p.datePaiement?.toISOString().slice(0, 10) ?? p.createdAt.toISOString().slice(0, 10),
      moyen: p.moyenPaiement,
      client: `${p.reservation.client.prenom} ${p.reservation.client.nom}`,
      reservationNumero: p.reservation.numero,
    }));

    return NextResponse.json({
      kpis: {
        reservationsJour,
        arriveesJour,
        departsJour,
        logementsDisponibles,
        logementsOccupes,
        whatsappEnAttente,
        revenusJour: Number(revenusJour._sum.montant ?? 0),
        revenusSemaine: Number(revenusSemaine._sum.montant ?? 0),
        revenusMois: Number(revenusMois._sum.montant ?? 0),
      },
      revenusGraph,
      occupationGraph,
      repartitionType: repartitionTypeArr,
      sourcesReservation: sourcesArr,
      dernieresReservations: dernieresReservationsFmt,
      notifications: notificationsFmt,
      paiementsRecents: paiementsFmt,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
