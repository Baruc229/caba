"use client";

import Link from "next/link";

type PropertyCardData = {
  id: string;
  nom: string;
  type: string;
  ville: string;
  pays: string;
  photoPrincipale: string | null;
  prixNuit: number;
  devise: string;
  noteMoyenne: number | null;
  nombreAvis: number;
  promotions?: { valeur: number; typeReduction: string }[];
};

export function PropertyCard({ property }: { property: PropertyCardData }) {
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

  const hasPromo =
    property.promotions && property.promotions.length > 0;
  const promo = hasPromo ? property.promotions![0] : null;
  const promoPrice =
    promo?.typeReduction === "pourcentage"
      ? property.prixNuit * (1 - promo.valeur / 100)
      : property.prixNuit - (promo?.valeur || 0);

  return (
    <Link href={`/logements/${property.id}`}>
      <div className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
        <div className="relative aspect-[4/3] bg-gray-100">
          {property.photoPrincipale ? (
            <img
              src={property.photoPrincipale}
              alt={property.nom}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              Pas de photo
            </div>
          )}
          {hasPromo && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
              -{promo!.valeur}%
            </span>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-medium text-sm text-black truncate">
              {property.nom}
            </h3>
            {property.noteMoyenne !== null && (
              <span className="flex items-center gap-1 text-xs text-gray-600 shrink-0">
                <svg
                  className="w-3 h-3 text-caba-gold fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {property.noteMoyenne.toFixed(1)}
                <span className="text-gray-400">
                  ({property.nombreAvis})
                </span>
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-2">
            {typeLabels[property.type] || property.type} &middot;{" "}
            {property.ville}, {property.pays}
          </p>
          <div className="flex items-baseline gap-2">
            {hasPromo ? (
              <>
                <span className="text-sm font-semibold text-red-600">
                  {promoPrice.toFixed(0)} {property.devise}
                </span>
                <span className="text-xs text-gray-400 line-through">
                  {property.prixNuit.toFixed(0)} {property.devise}
                </span>
              </>
            ) : (
              <span className="text-sm font-semibold text-black">
                {property.prixNuit} {property.devise}
              </span>
            )}
            <span className="text-xs text-gray-500">/ nuit</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
