import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import type { SearchResultItem } from "@/lib/services/availability";
import { LogementsClient } from "./logements-client";
import "./logements.css";

export const metadata = {
  title: "Caba Résidence — Recherche de logements",
  description:
    "Recherchez parmi nos chambres, studios, suites et villas. Disponibilités en temps réel et réservation en ligne.",
};

interface LogementsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function loadPublishedProperties(): Promise<SearchResultItem[]> {
  const properties = await prisma.property.findMany({
    where: { statut: "publie" },
    orderBy: { createdAt: "desc" },
    include: {
      photos: { orderBy: { ordre: "asc" }, take: 1 },
      tarifs: { where: { actif: true }, take: 1 },
      avis: { where: { statut: "publique" }, select: { note: true } },
      caracteristiques: { include: { caracteristique: true } },
    },
  });

  return properties.map((p) => {
    const notes = p.avis.map((a) => a.note);
    const noteMoyenne =
      notes.length > 0
        ? Math.round((notes.reduce((s, n) => s + n, 0) / notes.length) * 10) / 10
        : null;
    return {
      id: p.id,
      nom: p.nom,
      type: p.type,
      capaciteMaximale: p.capaciteMaximale,
      adultesMax: p.adultesMax,
      enfantsMax: p.enfantsMax,
      bebesMax: p.bebesMax,
      nombreChambres: p.nombreChambres,
      nombreLits: p.nombreLits,
      photo: p.photos[0]?.url ?? null,
      noteMoyenne,
      nombreAvis: notes.length,
      equipements: p.caracteristiques.slice(0, 4).map((e) => e.caracteristique.nom),
      prixTotal: p.tarifs[0] ? Number(p.tarifs[0].prix) : 0,
      prixBase: p.tarifs[0] ? Number(p.tarifs[0].prix) : 0,
      nuitsOuUnites: 1,
      devise: p.tarifs[0]?.devise ?? p.devise,
      promotionAppliquee: null,
    };
  });
}

export default async function LogementsPage({ searchParams }: LogementsPageProps) {
  const params = await searchParams;

  const get = (key: string, fallback: string): string => {
    const v = params[key];
    return typeof v === "string" ? v : fallback;
  };

  const arrivee = get("arrivee", "");
  const depart = get("depart", "");
  const adultes = parseInt(get("adultes", "2"), 10) || 2;
  const enfants = parseInt(get("enfants", "0"), 10) || 0;
  const bebes = parseInt(get("bebes", "0"), 10) || 0;
  const type = get("type", "");
  const typeReservation = get("typeReservation", "nuee");
  const heureArrivee = get("heureArrivee", "08:00");
  const heureDepart = get("heureDepart", "18:00");
  const tri = get("tri", "pertinence");
  const page = parseInt(get("page", "1"), 10) || 1;

  const hasSearch = Boolean(arrivee && depart);
  const initialPublished = hasSearch ? [] : await loadPublishedProperties();

  return (
    <Suspense>
      <LogementsClient
        initialArrivee={arrivee}
        initialDepart={depart}
        initialAdultes={adultes}
        initialEnfants={enfants}
        initialBebes={bebes}
        initialType={type}
        initialTypeReservation={typeReservation}
        initialHeureArrivee={heureArrivee}
        initialHeureDepart={heureDepart}
        initialTri={tri}
        initialPage={page}
        initialPublished={initialPublished}
      />
    </Suspense>
  );
}
