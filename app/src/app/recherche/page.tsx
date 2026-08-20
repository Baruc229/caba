import { prisma } from "@/lib/prisma";
import { PropertyCard } from "@/components/property/property-card";
import { SearchBar } from "@/components/search/search-bar";

export const metadata = { title: "Recherche de logements" };

type SearchParams = Promise<{
  startDate?: string;
  endDate?: string;
  adults?: string;
  children?: string;
  type?: string;
}>;

const typeLabels: Record<string, string> = {
  chambre: "Chambre",
  chambre_avec_salon: "Chambre avec salon",
  studio: "Studio",
  appartement_meuble: "Appartement meuble",
  suite: "Suite",
  villa: "Villa",
  duplex: "Duplex",
  maison_entiere: "Maison entiere",
};

const allowedTypes = Object.keys(typeLabels);

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const where: {
    statut: "publie";
    type?: string;
    reservations?: { some: { statut: string; dateDepart: Date; dateArrivee: Date } };
  } = {
    statut: "publie",
  };

  if (params.type && allowedTypes.includes(params.type)) {
    where.type = params.type;
  }

  let properties = await prisma.property.findMany({
    where: where as never,
    include: {
      photos: { where: { estPrincipale: true }, take: 1 },
      tarifs: {
        where: { actif: true },
        orderBy: { typeTarif: "asc" },
        take: 3,
      },
      avis: { select: { note: true } },
      reservations: {
        select: { statut: true, dateArrivee: true, dateDepart: true },
      },
    },
  });

  if (params.startDate && params.endDate) {
    const start = new Date(params.startDate);
    const end = new Date(params.endDate);
    properties = properties.filter((p) => {
      const hasConflict = p.reservations?.some(
        (r: { statut: string; dateDepart: Date; dateArrivee: Date }) =>
          r.statut !== "annulee" &&
          start < r.dateDepart &&
          end > r.dateArrivee
      );
      return !hasConflict;
    });
  }

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <SearchBar compact />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-black">
            {properties.length} logement{properties.length > 1 ? "s" : ""}{" "}
            disponible{properties.length > 1 ? "s" : ""}
          </h1>
          {(params.startDate || params.type) && (
            <p className="text-sm text-gray-500 mt-1">
              {params.startDate && params.endDate
                ? `Du ${params.startDate} au ${params.endDate}`
                : ""}
              {params.type ? ` · ${typeLabels[params.type] || params.type}` : ""}
            </p>
          )}
        </div>

        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p) => {
              const nightlyTarif = p.tarifs.find(
                (t: { typeTarif: string }) => t.typeTarif === "standard" || t.typeTarif === "nuee"
              );
              const avgNote = p.avis.length > 0
                ? p.avis.reduce((sum: number, a: { note: number }) => sum + a.note, 0) / p.avis.length
                : null;
              return (
                <PropertyCard
                  key={p.id}
                  property={{
                    id: p.id,
                    nom: p.nom,
                    type: p.type,
                    ville: p.ville,
                    pays: p.pays,
                    photoPrincipale: p.photos?.[0]?.url || null,
                    prixNuit: Number(nightlyTarif?.prix || 0),
                    devise: p.devise,
                    noteMoyenne: avgNote,
                    nombreAvis: p.avis.length,
                  }}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-4">
              Aucun logement disponible pour ces criteres.
            </p>
            <a
              href="/recherche"
              className="text-caba-blue font-medium hover:underline"
            >
              Reinitialiser la recherche
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
