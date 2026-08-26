import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "administrateur") {
      return NextResponse.json({ error: "Non autorise" }, { status: 403 });
    }

    // Supprimer dans l'ordre (FK dependencies)
    const [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12] = await Promise.all([
      prisma.bookingHistory.deleteMany(),
      prisma.paiement.deleteMany(),
      prisma.review.deleteMany(),
      prisma.notification.deleteMany(),
      prisma.message.deleteMany(),
      prisma.booking.deleteMany(),
      prisma.disponibilite.deleteMany(),
      prisma.promotion.deleteMany(),
      prisma.tarif.deleteMany(),
      prisma.propertyCaracteristique.deleteMany(),
      prisma.propertyPhoto.deleteMany(),
      prisma.propertyContact.deleteMany(),
    ]);

    // Propriétés ensuite (après toutes les FK)
    const aProp = await prisma.property.deleteMany();

    // Supprimer les favoris des clients
    const aFav = await prisma.favorite.deleteMany();

    return NextResponse.json({
      ok: true,
      deleted: {
        bookingHistory: a1.count,
        paiements: a2.count,
        reviews: a3.count,
        notifications: a4.count,
        messages: a5.count,
        bookings: a6.count,
        disponibilites: a7.count,
        promotions: a8.count,
        tarifs: a9.count,
        propertyCaracteristiques: a10.count,
        propertyPhotos: a11.count,
        propertyContacts: a12.count,
        properties: aProp.count,
        favoris: aFav.count,
      },
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
