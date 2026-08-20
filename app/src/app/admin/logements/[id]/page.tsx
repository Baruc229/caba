import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function AdminPropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      photos: { orderBy: { ordre: "asc" } },
      tarifs: { where: { actif: true } },
      promotions: { where: { actif: true } },
      caracteristiques: { include: { caracteristique: true } },
      _count: { select: { reservations: true, avis: true } },
    },
  });

  if (!property) notFound();

  const typeLabels: Record<string, string> = {
    chambre: "Chambre",
    chambre_avec_salon: "Chambre avec salon",
    studio: "Studio",
    appartement_meuble: "Appartement meuble",
    suite: "Suite",
    villa: "Villa",
    duplex: "Duplex",
    maison_entiere: "Maison entiere",
    personnalise: "Autre",
  };

  const statusColors: Record<string, string> = {
    publie: "bg-green-100 text-green-700",
    brouillon: "bg-yellow-100 text-yellow-700",
    depublie: "bg-gray-100 text-gray-600",
    desactive: "bg-red-100 text-red-700",
    maintenance: "bg-orange-100 text-orange-700",
  };

  return (
    <div>
      <Link href="/admin/logements" className="text-sm text-caba-blue hover:underline mb-4 inline-block">
        &larr; Retour
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">{property.nom}</h1>
          <p className="text-gray-600 text-sm">
            {typeLabels[property.type] || property.type} · {property.ville}, {property.pays}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[property.statut] || ""}`}>
            {property.statut}
          </span>
          <a
            href={`/logements/${property.id}`}
            target="_blank"
            className="text-sm text-caba-blue hover:underline"
          >
            Voir public
          </a>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Infos */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="font-semibold text-black mb-4">Informations</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><p className="text-gray-500">Capacite</p><p className="font-medium">{property.capaciteMaximale} pers.</p></div>
              <div><p className="text-gray-500">Chambres</p><p className="font-medium">{property.nombreChambres}</p></div>
              <div><p className="text-gray-500">Lits</p><p className="font-medium">{property.nombreLits}</p></div>
              <div><p className="text-gray-500">SdB</p><p className="font-medium">{property.nombreSallesDeBains}</p></div>
              {property.superficieM2 && <div><p className="text-gray-500">Surface</p><p className="font-medium">{property.superficieM2} m2</p></div>}
            </div>
            {property.descriptionCourte && (
              <p className="mt-4 text-sm text-gray-600">{property.descriptionCourte}</p>
            )}
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="font-semibold text-black mb-4">Statistiques</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xl font-bold text-black">{property._count.reservations}</p>
                <p className="text-xs text-gray-500">Reservations</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xl font-bold text-black">{property._count.avis}</p>
                <p className="text-xs text-gray-500">Avis</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xl font-bold text-black">{property.photos.length}</p>
                <p className="text-xs text-gray-500">Photos</p>
              </div>
            </div>
          </div>

          {/* Photos */}
          {property.photos.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h2 className="font-semibold text-black mb-4">Photos ({property.photos.length})</h2>
              <div className="grid grid-cols-4 gap-2">
                {property.photos.slice(0, 8).map((photo) => (
                  <div key={photo.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tarifs */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="font-semibold text-black mb-4">Tarifs</h2>
            <div className="space-y-2 text-sm">
              {property.tarifs.map((t) => (
                <div key={t.id} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-gray-600 capitalize">{t.typeTarif}</span>
                  <span className="font-medium">{Number(t.prix)} {t.devise}</span>
                </div>
              ))}
              {property.tarifs.length === 0 && <p className="text-gray-400">Aucun tarif</p>}
            </div>
          </div>

          {/* Caracteristiques */}
          {property.caracteristiques.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h2 className="font-semibold text-black mb-4">Caracteristiques</h2>
              <div className="flex flex-wrap gap-2">
                {property.caracteristiques.map((pc) => (
                  <span key={pc.caracteristiqueId} className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                    {pc.caracteristique.nom}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="font-semibold text-black mb-4">Contact</h2>
            <div className="text-sm space-y-2">
              <p><span className="text-gray-500">Adresse :</span> {property.adresse}</p>
              <p><span className="text-gray-500">Ville :</span> {property.ville}, {property.pays}</p>
              <p><span className="text-gray-500">Devise :</span> {property.devise}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
