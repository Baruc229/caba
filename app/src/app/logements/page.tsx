import { Suspense } from "react";
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
      />
    </Suspense>
  );
}
