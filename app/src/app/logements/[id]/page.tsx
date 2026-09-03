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
  searchParams: Promise<{ action?: string }>;
}

async function geocode(
  adresse: string | null,
  ville: string,
  pays: string
): Promise<{ lat: number; lon: number } | null> {
  const query = encodeURIComponent(
    [adresse, ville, pays].filter(Boolean).join(", ")
  );
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      {
        headers: { "Accept-Language": "fr" },
        next: { revalidate: 3600 },
      }
    );
    const data = await res.json();
    if (data?.[0]?.lat && data[0]?.lon) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
  } catch {
    // geocoding failed silently
  }
  return null;
}

export default async function LogementDetailPage({ params, searchParams }: DetailPageProps) {
  const [{ id }, qs] = await Promise.all([params, searchParams]);

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      photos: { orderBy: { ordre: "asc" } },
      caracteristiques: { include: { caracteristique: true } },
      tarifs: { where: { actif: true }, orderBy: { createdAt: "desc" }, take: 1 },
      avis: { where: { statut: "publique" }, select: { note: true } },
      regles: { where: { actif: true, typeRegle: { in: ["check_in", "check_out"] } } },
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

  const checkInRule = property.regles.find((r) => r.typeRegle === "check_in");
  const checkOutRule = property.regles.find((r) => r.typeRegle === "check_out");
  const defaultCheckIn = checkInRule?.valeur ?? "14:00";
  const defaultCheckOut = checkOutRule?.valeur ?? "11:00";

  const coords = await geocode(property.adresse, property.ville, property.pays);

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
    defaultCheckIn,
    defaultCheckOut,
    latitude: coords?.lat ?? null,
    longitude: coords?.lon ?? null,
  };

  return (
    <Suspense>
      <PropertyDetailClient property={data} action={qs.action} />
    </Suspense>
  );
}
