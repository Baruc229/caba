import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  PropertyDetailClient,
  type PropertyDetailData,
} from "@/components/logements/property-detail-client";
import "../logement-detail.css";

export const metadata = {
  title: "Caba Résidence — Logement",
  description: "Détail d'un logement de la résidence.",
};

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function LogementDetailPage({ params }: DetailPageProps) {
  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      photos: { orderBy: { ordre: "asc" } },
      caracteristiques: { include: { caracteristique: true } },
      tarifs: { where: { actif: true }, orderBy: { createdAt: "desc" }, take: 1 },
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

  const data: PropertyDetailData = {
    id: property.id,
    nom: property.nom,
    type: property.type,
    descriptionCourte: property.descriptionCourte,
    descriptionComplete: property.descriptionComplete,
    capaciteMaximale: property.capaciteMaximale,
    adultesMax: property.adultesMax,
    enfantsMax: property.enfantsMax,
    bebesMax: property.bebesMax,
    nombreChambres: property.nombreChambres,
    nombreLits: property.nombreLits,
    nombreSallesDeBains: property.nombreSallesDeBains,
    superficieM2: property.superficieM2,
    adresse: property.adresse,
    ville: property.ville,
    pays: property.pays,
    photos: property.photos.map((p) => ({
      id: p.id,
      url: p.url,
      legende: p.legende,
    })),
    caracteristiques: property.caracteristiques.map((e) => ({
      nom: e.caracteristique.nom,
    })),
    tarifBase: property.tarifs[0] ? Number(property.tarifs[0].prix) : null,
    devise: property.tarifs[0]?.devise ?? property.devise,
    noteMoyenne,
    nombreAvis: notes.length,
  };

  return (
    <Suspense>
      <PropertyDetailClient property={data} />
    </Suspense>
  );
}
