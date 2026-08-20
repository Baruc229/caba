import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PropertyGallery } from "@/components/property/gallery";
import { BookingForm } from "@/components/property/booking-form";
import { PropertyNav } from "@/components/property/property-nav";
import { AvailabilityCalendar } from "@/components/property/availability-calendar";
import { generateMetadata } from "./metadata";

export { generateMetadata };

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

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      photos: true,
      tarifs: { where: { actif: true } },
      promotions: { where: { actif: true } },
      caracteristiques: { include: { caracteristique: true } },
      avis: {
        where: { statut: "publique" },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { client: { select: { prenom: true, nom: true } } },
      },
    },
  });

  if (!property) notFound();

  const sortedPhotos = [...property.photos].sort((a, b) => a.ordre - b.ordre);
  const nightlyTarif = property.tarifs.find(
    (t: { typeTarif: string }) => t.typeTarif === "standard" || t.typeTarif === "nuee"
  );
  const weeklyTarif = property.tarifs.find(
    (t: { typeTarif: string }) => t.typeTarif === "hebdomadaire"
  );
  const monthlyTarif = property.tarifs.find(
    (t: { typeTarif: string }) => t.typeTarif === "mensuel"
  );
  const unitLabel = "par nuit";

  const avgNote =
    property.avis.length > 0
      ? property.avis.reduce((sum: number, a: { note: number }) => sum + a.note, 0) /
        property.avis.length
      : null;

  return (
    <main className="bg-white">
      <PropertyNav />

      {/* Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <PropertyGallery photos={sortedPhotos} />
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">
              {property.nom}
            </h1>
            <p className="text-gray-600">
              {typeLabels[property.type] || property.type} &middot;{" "}
              {property.ville}, {property.pays}
            </p>
            {avgNote !== null && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex text-caba-gold">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 fill-current ${
                        i < Math.round(avgNote)
                          ? "text-caba-gold"
                          : "text-gray-200"
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {avgNote.toFixed(1)} · {property.avis.length} avis
                </span>
              </div>
            )}
          </div>
          <div className="text-right shrink-0">
            <span className="text-2xl font-bold text-black">
              {nightlyTarif
                ? `${Number(nightlyTarif.prix)} ${property.devise}`
                : "Sur demande"}
            </span>
            <p className="text-sm text-gray-500">{unitLabel}</p>
          </div>
        </div>
      </div>

      {/* Content: 2 columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-[1fr_380px] gap-8 lg:gap-12">
          {/* Left column */}
          <div className="space-y-12">
            {/* Description */}
            <section id="description" className="scroll-mt-20">
              <h2 className="text-xl font-semibold text-black mb-4">
                Description
              </h2>
              <div className="prose prose-sm max-w-none text-gray-600">
                <p className="whitespace-pre-line">
                  {property.descriptionComplete ||
                    property.descriptionCourte ||
                    "Aucune description disponible."}
                </p>
              </div>

              {property.caracteristiques.length > 0 && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.caracteristiques.map(
                    (pc: {
                      propertyId: string;
                      caracteristiqueId: string;
                      caracteristique: { nom: string };
                    }) => (
                      <div
                        key={pc.caracteristiqueId}
                        className="flex items-center gap-2 text-sm text-gray-600"
                      >
                        <span className="w-1.5 h-1.5 bg-caba-blue rounded-full" />
                        {pc.caracteristique.nom}
                      </div>
                    )
                  )}
                </div>
              )}

              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {property.nombreChambres > 0 && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="block text-lg font-semibold text-black">
                      {property.nombreChambres}
                    </span>
                    <span className="text-xs text-gray-500">Chambres</span>
                  </div>
                )}
                {property.nombreLits > 0 && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="block text-lg font-semibold text-black">
                      {property.nombreLits}
                    </span>
                    <span className="text-xs text-gray-500">Lits</span>
                  </div>
                )}
                {property.nombreSallesDeBains > 0 && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="block text-lg font-semibold text-black">
                      {property.nombreSallesDeBains}
                    </span>
                    <span className="text-xs text-gray-500">SdB</span>
                  </div>
                )}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="block text-lg font-semibold text-black">
                    {property.capaciteMaximale}
                  </span>
                  <span className="text-xs text-gray-500">Voyageurs</span>
                </div>
              </div>
            </section>

            {/* Tarifs */}
            <section id="tarifs" className="scroll-mt-20">
              <h2 className="text-xl font-semibold text-black mb-4">Tarifs</h2>
              <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                {nightlyTarif && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Prix par nuit</span>
                    <span className="font-medium text-black">
                      {Number(nightlyTarif.prix)} {property.devise}
                    </span>
                  </div>
                )}
                {weeklyTarif && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      7 nuits et plus (par nuit)
                    </span>
                    <span className="font-medium text-black">
                      {(Number(weeklyTarif.prix) / 7).toFixed(0)}{" "}
                      {property.devise}
                    </span>
                  </div>
                )}
                {monthlyTarif && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      30 nuits et plus (par nuit)
                    </span>
                    <span className="font-medium text-black">
                      {(Number(monthlyTarif.prix) / 30).toFixed(0)}{" "}
                      {property.devise}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Taxe de sejour</span>
                    <span className="text-gray-600">
                      2 {property.devise} / nuit / personne
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Disponibilite */}
            <section id="disponibilite" className="scroll-mt-20">
              <h2 className="text-xl font-semibold text-black mb-4">
                Disponibilite
              </h2>
              <AvailabilityCalendar propertyId={property.id} />
            </section>

            {/* Avis */}
            <section id="avis" className="scroll-mt-20">
              <h2 className="text-xl font-semibold text-black mb-4">
                Avis ({property.avis.length})
              </h2>
              {property.avis.length > 0 ? (
                <div className="space-y-4">
                  {property.avis.map(
                    (review: {
                      id: string;
                      note: number;
                      commentaire: string | null;
                      reponseAdmin: string | null;
                      createdAt: Date;
                      client: { prenom: string; nom: string } | null;
                    }) => (
                      <div key={review.id} className="bg-gray-50 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-caba-blue/10 rounded-full flex items-center justify-center text-caba-blue font-medium text-sm">
                            {review.client?.prenom?.[0] || "?"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-black">
                              {review.client?.prenom} {review.client?.nom?.[0]}.
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString(
                                "fr-FR",
                                { month: "long", year: "numeric" }
                              )}
                            </p>
                          </div>
                          <div className="ml-auto flex text-caba-gold">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-3.5 h-3.5 fill-current ${
                                  i < review.note
                                    ? "text-caba-gold"
                                    : "text-gray-200"
                                }`}
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          {review.commentaire}
                        </p>
                        {review.reponseAdmin && (
                          <div className="mt-3 ml-4 pl-4 border-l-2 border-caba-blue/30">
                            <p className="text-xs text-gray-500 font-medium mb-1">
                              Reponse de Caba Residence
                            </p>
                            <p className="text-sm text-gray-600">
                              {review.reponseAdmin}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  Aucun avis pour le moment.
                </p>
              )}
            </section>

            {/* Localisation */}
            <section id="localisation" className="scroll-mt-20">
              <h2 className="text-xl font-semibold text-black mb-4">
                Localisation
              </h2>
              <div className="bg-gray-100 rounded-xl h-64 flex items-center justify-center text-gray-400 text-sm">
                Carte interactive (a integrer)
              </div>
              <p className="mt-3 text-sm text-gray-600">
                {property.adresse}, {property.ville}, {property.pays}
              </p>
            </section>
          </div>

          {/* Right column - Booking form */}
          <div className="hidden lg:block">
            <BookingForm propertyId={property.id} unitLabel={unitLabel} />
          </div>
        </div>
      </div>

      {/* Mobile booking footer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-black">
              {nightlyTarif
                ? `${Number(nightlyTarif.prix)} ${property.devise}`
                : "Sur demande"}
            </span>
            <span className="text-sm text-gray-500"> {unitLabel}</span>
          </div>
          <a
            href="#disponibilite"
            className="px-6 py-3 bg-caba-blue text-white font-medium rounded-lg hover:bg-caba-blue-dark transition-colors"
          >
            Reserver
          </a>
        </div>
      </div>
    </main>
  );
}
