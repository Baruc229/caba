import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/config";
import { ConfirmationClient } from "./confirmation-client";
import "../../logements/checkout.css";

export const metadata = {
  title: "Confirmation — Caba Résidence",
  description: "Votre réservation est confirmée.",
};

interface ConfirmationPageProps {
  params: Promise<{ numero: string }>;
}

export default async function ConfirmationPage({ params }: ConfirmationPageProps) {
  const numero = (await params).numero;
  const session = await auth();
  if (!session?.user) {
    notFound();
  }

  const booking = await prisma.booking.findUnique({
    where: { numero },
    include: {
      property: {
        select: {
          nom: true,
          type: true,
          ville: true,
          pays: true,
          photos: { orderBy: { ordre: "asc" }, take: 1 },
        },
      },
      paiements: { select: { montant: true, devise: true, statut: true, referenceExterne: true } },
    },
  });

  if (!booking || booking.clientId !== session.user.id) {
    notFound();
  }

  return (
    <ConfirmationClient
      booking={{
        numero: booking.numero,
        statut: booking.statut,
        propertyNom: booking.property.nom,
        propertyType: booking.property.type,
        ville: booking.property.ville,
        pays: booking.property.pays,
        photo: booking.property.photos[0]?.url ?? null,
        dateArrivee: booking.dateArrivee.toISOString(),
        dateDepart: booking.dateDepart.toISOString(),
        nombreAdultes: booking.nombreAdultes,
        nombreEnfants: booking.nombreEnfants,
        nombreBebes: booking.nombreBebes,
        prixSejour: Number(booking.prixSejour),
        fraisMenage: Number(booking.fraisMenage),
        taxeSejour: Number(booking.taxeSejour),
        supplements: Number(booking.supplements),
        reductions: Number(booking.reductions),
        prixTotal: Number(booking.prixTotal),
        devise: booking.devise,
      }}
    />
  );
}
