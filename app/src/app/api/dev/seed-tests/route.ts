import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { beninDateTime } from "@/lib/datetime-benin";

function d(dateStr: string, time = "00:00"): Date {
  return beninDateTime(dateStr, time);
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const force = searchParams.get("force") === "1";
  const expectedSecret = process.env.CRON_SECRET || "caba-cron-secret-change-me";

  if (secret !== expectedSecret) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  try {
    const existingProperties = await prisma.property.count();
    if (existingProperties > 0 && !force) {
      return NextResponse.json({ message: "Donnees deja presentent. Utilisez force=1 pour reinitialiser.", properties: existingProperties });
    }

    if (force) {
      await prisma.$transaction([
        prisma.disponibilite.deleteMany(),
        prisma.bookingHistory.deleteMany(),
        prisma.paiement.deleteMany(),
        prisma.review.deleteMany(),
        prisma.message.deleteMany(),
        prisma.favorite.deleteMany(),
        prisma.notification.deleteMany(),
        prisma.synchronisationICal.deleteMany(),
        prisma.propertyCaracteristique.deleteMany(),
        prisma.regle.deleteMany(),
        prisma.propertyContact.deleteMany(),
        prisma.promotion.deleteMany(),
        prisma.tarif.deleteMany(),
        prisma.propertyPhoto.deleteMany(),
        prisma.booking.deleteMany(),
        prisma.property.deleteMany(),
        prisma.caracteristique.deleteMany(),
      ]);
    }

    const admin =
      (await prisma.user.findUnique({ where: { email: "admin@caba-residence.com" } })) ??
      await prisma.user.create({
        data: {
          email: "admin@caba-residence.com",
          password: "$2a$10$placeholderhashplaceholderhashplaceholder",
          nom: "Caba",
          prenom: "Admin",
          role: "administrateur",
          emailConfirme: true,
        },
      });

    const client =
      (await prisma.user.findUnique({ where: { email: "client.test@example.com" } })) ??
      await prisma.user.create({
        data: {
          email: "client.test@example.com",
          password: "$2a$10$placeholderhashplaceholderhashplaceholder",
          nom: "Test",
          prenom: "Client",
          role: "client",
          emailConfirme: true,
        },
      });

    const caracData = [
      { nom: "Wifi", categorie: "equipements" as const, icone: "FaWifi", ordre: 1 },
      { nom: "Climatisation", categorie: "equipements" as const, icone: "FaSnowflake", ordre: 2 },
      { nom: "Cuisine équipée", categorie: "equipements" as const, icone: "FaUtensils", ordre: 3 },
      { nom: "Parking", categorie: "installations" as const, icone: "FaCar", ordre: 4 },
      { nom: "Piscine", categorie: "installations" as const, icone: "FaWater", ordre: 5 },
      { nom: "Groupe électrogène", categorie: "installations" as const, icone: "FaBolt", ordre: 6 },
    ];
    const caracs: Record<string, string> = {};
    for (const c of caracData) {
      const existing = await prisma.caracteristique.findFirst({ where: { nom: c.nom } });
      const row = existing ?? (await prisma.caracteristique.create({ data: c }));
      caracs[c.nom] = row.id;
    }

    const tarifWindow = { dateDebut: d("2026-01-01"), dateFin: d("2027-12-31") };

    const studio = await prisma.property.create({
      data: {
        nom: "Studio Jardin Caba",
        type: "studio",
        descriptionCourte: "Studio cosy avec acces jardin dans la residence Caba.",
        statut: "publie",
        proprietaireId: admin.id,
        capaciteMaximale: 2,
        adultesMax: 2,
        enfantsMax: 1,
        bebesMax: 1,
        nombreChambres: 1,
        nombreLits: 1,
        nombreSallesDeBains: 1,
        superficieM2: 28,
        adresse: "Caba Residence, Batiment A",
        ville: "Cotonou",
        pays: "Benin",
        devise: "EUR",
        photos: {
          create: { url: "/images/propriete-studio-jardin.jpg", ordre: 0, estPrincipale: true },
        },
        tarifs: {
          create: [
            { typeTarif: "nuee", prix: 45, ...tarifWindow },
            { typeTarif: "horaire", prix: 8, ...tarifWindow },
            { typeTarif: "demi_journee", prix: 30, ...tarifWindow },
            { typeTarif: "journee", prix: 55, ...tarifWindow },
            { typeTarif: "vingt_quatre_heures", prix: 70, ...tarifWindow },
          ],
        },
        regles: {
          create: [
            { typeRegle: "sejour", description: "Duree de sejour", valeur: JSON.stringify({ minNuits: 1, maxNuits: 30 }) },
            { typeRegle: "check_in", description: "Heure d'arrivee", valeur: "14:00" },
            { typeRegle: "check_out", description: "Heure de depart", valeur: "11:00" },
          ],
        },
        caracteristiques: {
          create: [
            { caracteristiqueId: caracs["Wifi"] },
            { caracteristiqueId: caracs["Climatisation"] },
            { caracteristiqueId: caracs["Cuisine équipée"] },
          ],
        },
        avis: {
          create: [
            { clientId: client.id, note: 5, commentaire: "Parfait pour un sejour court.", statut: "publique" },
            { clientId: admin.id, note: 4, commentaire: "Tres propre et bien situe.", statut: "publique" },
          ],
        },
      },
    });

    const appartement = await prisma.property.create({
      data: {
        nom: "Appartement Marina Caba",
        type: "appartement_meuble",
        descriptionCourte: "Appartement 2 chambres meuble, vue sur la marina.",
        statut: "publie",
        proprietaireId: admin.id,
        capaciteMaximale: 4,
        adultesMax: 3,
        enfantsMax: 2,
        bebesMax: 1,
        nombreChambres: 2,
        nombreLits: 3,
        nombreSallesDeBains: 2,
        superficieM2: 75,
        adresse: "Caba Residence, Batiment B",
        ville: "Cotonou",
        pays: "Benin",
        devise: "EUR",
        photos: {
          create: { url: "/images/propriete-appartement-marina.jpg", ordre: 0, estPrincipale: true },
        },
        tarifs: {
          create: [
            { typeTarif: "nuee", prix: 80, ...tarifWindow },
            { typeTarif: "hebdomadaire", prix: 480, ...tarifWindow },
            { typeTarif: "mensuel", prix: 1800, ...tarifWindow },
          ],
        },
        promotions: {
          create: [
            {
              nom: "Long sejour -10%",
              typeReduction: "pourcentage",
              valeur: 10,
              dateDebut: d("2026-01-01"),
              dateFin: d("2027-12-31"),
              dureeMinimaleNuits: 5,
              actif: true,
            },
          ],
        },
        regles: {
          create: [
            { typeRegle: "sejour", description: "Duree de sejour", valeur: JSON.stringify({ minNuits: 2, maxNuits: 60 }) },
            { typeRegle: "check_in", description: "Heure d'arrivee", valeur: "15:00" },
            { typeRegle: "check_out", description: "Heure de depart", valeur: "11:00" },
          ],
        },
        caracteristiques: {
          create: [
            { caracteristiqueId: caracs["Wifi"] },
            { caracteristiqueId: caracs["Climatisation"] },
            { caracteristiqueId: caracs["Parking"] },
            { caracteristiqueId: caracs["Groupe électrogène"] },
          ],
        },
      },
    });

    const suite = await prisma.property.create({
      data: {
        nom: "Suite Executive Caba",
        type: "suite",
        descriptionCourte: "Suite spacieuse avec salon prive et services inclus.",
        statut: "publie",
        proprietaireId: admin.id,
        capaciteMaximale: 3,
        adultesMax: 2,
        enfantsMax: 2,
        bebesMax: 1,
        nombreChambres: 1,
        nombreLits: 2,
        nombreSallesDeBains: 1,
        superficieM2: 45,
        adresse: "Caba Residence, Batiment C",
        ville: "Cotonou",
        pays: "Benin",
        devise: "EUR",
        photos: {
          create: { url: "/images/propriete-suite-executive.jpg", ordre: 0, estPrincipale: true },
        },
        tarifs: {
          create: [
            { typeTarif: "nuee", prix: 120, ...tarifWindow },
            { typeTarif: "journee", prix: 150, ...tarifWindow },
          ],
        },
        regles: {
          create: [
            { typeRegle: "sejour", description: "Duree de sejour", valeur: JSON.stringify({ minNuits: 1, maxNuits: 30 }) },
          ],
        },
        caracteristiques: {
          create: [
            { caracteristiqueId: caracs["Wifi"] },
            { caracteristiqueId: caracs["Climatisation"] },
            { caracteristiqueId: caracs["Piscine"] },
          ],
        },
      },
    });

    const booking1 = await prisma.booking.create({
      data: {
        numero: "SEED-001",
        statut: "confirmee",
        propertyId: studio.id,
        clientId: client.id,
        dateArrivee: d("2026-09-17"),
        dateDepart: d("2026-09-20"),
        heureArrivee: "14:00",
        heureDepart: "11:00",
        typeReservation: "nuee",
        nombreAdultes: 2,
        nombreEnfants: 0,
        nombreBebes: 0,
        nombreVoyageursTotal: 2,
        prixSejour: 135,
        prixTotal: 147,
        devise: "EUR",
        source: "site_web",
      },
    });

    const booking2 = await prisma.booking.create({
      data: {
        numero: "SEED-002",
        statut: "demande_en_attente",
        propertyId: appartement.id,
        clientId: client.id,
        dateArrivee: d("2026-09-24"),
        dateDepart: d("2026-09-26"),
        heureArrivee: "15:00",
        heureDepart: "11:00",
        typeReservation: "nuee",
        nombreAdultes: 2,
        nombreEnfants: 1,
        nombreBebes: 0,
        nombreVoyageursTotal: 3,
        prixSejour: 160,
        prixTotal: 172,
        devise: "EUR",
        source: "whatsapp",
      },
    });

    const booking3 = await prisma.booking.create({
      data: {
        numero: "SEED-003",
        statut: "confirmee",
        propertyId: suite.id,
        clientId: client.id,
        dateArrivee: d("2026-09-17"),
        dateDepart: d("2026-09-18"),
        heureArrivee: "14:00",
        heureDepart: "11:00",
        typeReservation: "nuee",
        nombreAdultes: 2,
        nombreBebes: 1,
        nombreVoyageursTotal: 2,
        prixSejour: 120,
        prixTotal: 128,
        devise: "EUR",
        source: "manuelle",
      },
    });

    await prisma.disponibilite.createMany({
      data: [
        {
          propertyId: appartement.id,
          date: d("2026-09-10"),
          statut: "bloque",
          source: "manuelle",
        },
        {
          propertyId: suite.id,
          date: d("2026-09-28"),
          heureDebut: "08:00",
          heureFin: "13:00",
          statut: "maintenance",
          source: "maintenance",
        },
        {
          propertyId: studio.id,
          date: d("2026-09-25"),
          statut: "reserve",
          source: "ical",
        },
      ],
    });

    return NextResponse.json({
      message: "Donnees de test creees",
      properties: { studio: studio.id, appartement: appartement.id, suite: suite.id },
      bookings: [booking1.id, booking2.id, booking3.id],
    });
  } catch (error) {
    console.error("Erreur seed:", error);
    return NextResponse.json({ error: "Erreur lors du seed" }, { status: 500 });
  }
}
