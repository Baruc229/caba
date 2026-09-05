import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/config";
import { computePriceFromData } from "@/lib/services/pricing";
import { CheckoutClient } from "./checkout-client";
import "../../logement-detail.css";
import "../../checkout.css";

export const metadata = {
  title: "Réservation — Caba Résidence",
  description: "Finalisez votre réservation à Caba Résidence.",
};

interface ReserverPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    arrivee?: string;
    depart?: string;
    heureArrivee?: string;
    heureDepart?: string;
    typeReservation?: string;
    adultes?: string;
    enfants?: string;
    bebes?: string;
    lockId?: string;
  }>;
}

export default async function ReserverPage({ params, searchParams }: ReserverPageProps) {
  const [{ id }, qs, session] = await Promise.all([
    params,
    searchParams,
    auth(),
  ]);

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      photos: { orderBy: { ordre: "asc" } },
      tarifs: { where: { actif: true } },
      promotions: { where: { actif: true } },
      avis: { where: { statut: "publique" }, select: { note: true } },
    },
  });

  if (!property || property.statut !== "publie") {
    notFound();
  }

  const notes = property.avis.map((a) => a.note);
  const noteMoyenne =
    notes.length > 0
      ? Math.round((notes.reduce((s, n) => s + n, 0) / notes.length) * 10) / 10
      : null;

  const sessionUser = session?.user;

  const nominalStart = new Date();
  // eslint-disable-next-line react-hooks/purity
  const nominalEnd = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const nominalPricing = computePriceFromData({
    tarifs: property.tarifs,
    promotions: property.promotions,
    devise: property.devise,
    startDate: nominalStart,
    endDate: nominalEnd,
    typeReservation: "nuee",
    adults: 2,
    children: 0,
    babies: 0,
  });
  const tarifBase =
    Number.isFinite(nominalPricing.baseRate) && nominalPricing.baseRate > 0
      ? Number(nominalPricing.baseRate.toFixed(2))
      : property.tarifs.length > 0
        ? Number(property.tarifs[0].prix)
        : null;

  return (
    <Suspense>
      <CheckoutClient
        property={{
          id: property.id,
          nom: property.nom,
          type: property.type,
          ville: property.ville,
          pays: property.pays,
          photo: property.photos[0]?.url ?? null,
          tarifBase,
          devise: property.tarifs[0]?.devise ?? property.devise,
          noteMoyenne,
          nombreAvis: notes.length,
        }}
        defaultDates={{
          arrivee: qs.arrivee || "",
          depart: qs.depart || "",
          heureArrivee: qs.heureArrivee || "14:00",
          heureDepart: qs.heureDepart || "11:00",
          typeReservation: qs.typeReservation || "nuee",
          adultes: parseInt(qs.adultes || "2", 10) || 2,
          enfants: parseInt(qs.enfants || "0", 10) || 0,
          bebes: parseInt(qs.bebes || "0", 10) || 0,
        }}
        session={{
          id: sessionUser?.id,
          prenom: sessionUser?.prenom,
          nom: sessionUser?.nom,
          email: sessionUser?.email,
          emailConfirme: sessionUser?.emailConfirme ?? false,
        }}
        initialLockId={qs.lockId || undefined}
      />
    </Suspense>
  );
}
