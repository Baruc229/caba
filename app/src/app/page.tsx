import { prisma } from "@/lib/prisma";
import { SearchBar } from "@/components/search/search-bar";
import { PropertyCard } from "@/components/property/property-card";
import Link from "next/link";

const typeLabels: Record<string, string> = {
  chambre: "Chambres",
  chambre_avec_salon: "Chambres avec salon",
  studio: "Studios",
  appartement_meuble: "Appartements meubles",
  suite: "Suites",
  villa: "Villas",
  duplex: "Duplex",
  maison_entiere: "Maisons entieres",
};

const typeIcons: Record<string, string> = {
  chambre: "\uD83D\uDECF",
  chambre_avec_salon: "\uD83D\uDECB",
  studio: "\uD83C\uDFE0",
  appartement_meuble: "\uD83C\uDFE2",
  suite: "\u2B50",
  villa: "\uD83C\uDFE1",
  duplex: "\uD83C\uDFDB",
  maison_entiere: "\uD83C\uDFD8",
};

export default async function HomePage() {
  let featuredProperties: Awaited<ReturnType<typeof getFeaturedProperties>> = [];
  let promoProperties: Awaited<ReturnType<typeof getPromoProperties>> = [];

  try {
    [featuredProperties, promoProperties] = await Promise.all([
      getFeaturedProperties(),
      getPromoProperties(),
    ]);
  } catch {
    // DB not ready - show homepage without data
  }

  return (
    <main>
      {/* Hero */}
      <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-caba-blue/20 via-white to-gray-50" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
          <div className="max-w-3xl mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6 leading-tight">
              Votre sejour de{" "}
              <span className="text-caba-blue">confort</span>{" "}
              commence ici
            </h1>
            <p className="text-lg text-gray-600 max-w-xl">
              Caba Residence vous accueille dans des logements soigneusement
              selectionnes. Reservez en quelques clics, profitez d&apos;un service
              personnalise.
            </p>
          </div>
          <div className="max-w-4xl">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Types de logements */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">
              Nos types de logements
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Du studio a la villa, trouvez le logement qui correspond a vos
              besoins.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.keys(typeLabels).map((type) => (
              <Link
                key={type}
                href={`/recherche?type=${type}`}
                className="group p-6 bg-gray-50 rounded-xl text-center hover:bg-caba-blue hover:text-white transition-all duration-300"
              >
                <span className="text-3xl block mb-3">
                  {typeIcons[type]}
                </span>
                <span className="text-sm font-medium group-hover:text-white text-black">
                  {typeLabels[type]}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Logements populaires */}
      {featuredProperties.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-black mb-2">
                  Logements populaires
                </h2>
                <p className="text-gray-600">
                  Les logements les mieux notes par nos voyageurs.
                </p>
              </div>
              <Link
                href="/recherche"
                className="text-sm text-caba-blue font-medium hover:underline hidden md:block"
              >
                Voir tous les logements
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.map((p) => (
                <PropertyCard
                  key={p.id}
                  property={{
                    id: p.id,
                    nom: p.nom,
                    type: p.type,
                    ville: p.ville,
                    pays: p.pays,
                    photoPrincipale: p.photos?.[0]?.url || null,
                    prixNuit: Number(p.tarifs?.[0]?.prix || 0),
                    devise: p.devise,
                    noteMoyenne: null,
                    nombreAvis: p.avis?.length || 0,
                  }}
                />
              ))}
            </div>
            <div className="mt-8 text-center md:hidden">
              <Link
                href="/recherche"
                className="text-sm text-caba-blue font-medium hover:underline"
              >
                Voir tous les logements
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Promotions */}
      {promoProperties.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-black mb-4">
                Offres et promotions
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Profitez de reductions exclusives sur des logements selectionnes.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promoProperties.map((p) => {
                const promo = p.promotions[0];
                const nightlyTarif = p.tarifs.find(
                  (t) => t.typeTarif === "standard" || t.typeTarif === "nuee"
                );
                const basePrice = Number(nightlyTarif?.prix || 0);
                const promoPrice =
                  promo.typeReduction === "pourcentage"
                    ? basePrice * (1 - Number(promo.valeur) / 100)
                    : basePrice - Number(promo.valeur);
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
                      prixNuit: promoPrice,
                      devise: p.devise,
                      noteMoyenne: null,
                      nombreAvis: 0,
                      promotions: [
                        {
                          valeur: Number(promo.valeur),
                          typeReduction: promo.typeReduction,
                        },
                      ],
                    }}
                  />
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Sejours longue duree */}
      <section className="py-20 bg-caba-blue text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Sejours longue duree
              </h2>
              <p className="text-blue-100 mb-6">
                Profitez de tarifs preferentiels pour vos sejours de 7 nuits et
                plus. Plus vous restez, plus vous economisez.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-blue-100">
                  <span className="w-1.5 h-1.5 bg-white rounded-full shrink-0" />
                  Tarifs hebdomadaires reduits
                </li>
                <li className="flex items-center gap-3 text-blue-100">
                  <span className="w-1.5 h-1.5 bg-white rounded-full shrink-0" />
                  Tarifs mensuels avantageux
                </li>
                <li className="flex items-center gap-3 text-blue-100">
                  <span className="w-1.5 h-1.5 bg-white rounded-full shrink-0" />
                  Menage inclus
                </li>
                <li className="flex items-center gap-3 text-blue-100">
                  <span className="w-1.5 h-1.5 bg-white rounded-full shrink-0" />
                  Service personnalise
                </li>
              </ul>
              <Link
                href="/recherche?sejour=long"
                className="inline-block px-6 py-3 bg-white text-caba-blue font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Voir les tarifs
              </Link>
            </div>
            <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm">
              <div className="text-center mb-6">
                <span className="text-5xl font-bold">-20%</span>
                <p className="text-blue-100 mt-2">
                  sur les sejours de 7 nuits et plus
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white/10 rounded-xl p-4">
                  <span className="text-2xl font-bold">30+</span>
                  <p className="text-blue-100 text-sm">nuits = -30%</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <span className="text-2xl font-bold">7+</span>
                  <p className="text-blue-100 text-sm">nuits = -20%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Avantages Caba Residence */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">
              L&apos;experience Caba Residence
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Tout est pense pour rendre votre sejour inoubliable.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Emplacement",
                desc: "Au coeur de la ville, a proximite des commodites et des sites touristiques.",
                icon: "\uD83D\uDCCD",
              },
              {
                title: "Service",
                desc: "Une equipe dediee disponible 24h/24 pour repondre a vos besoins.",
                icon: "\uD83C\uDFAE",
              },
              {
                title: "Confort",
                desc: "Des logements spacieux, lumineux et decor\u00e9s avec soin.",
                icon: "\u2728",
              },
              {
                title: "Equipements",
                desc: "Tout le confort necessaire : wifi, climatisation, kitchenette, et plus.",
                icon: "\uD83D\uDD27",
              },
            ].map((adv) => (
              <div key={adv.title} className="text-center p-6">
                <span className="text-4xl block mb-4">{adv.icon}</span>
                <h3 className="font-semibold text-black mb-2">{adv.title}</h3>
                <p className="text-sm text-gray-600">{adv.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Avis */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">
              Ce que disent nos voyageurs
            </h2>
            <div className="flex items-center justify-center gap-2">
              <div className="flex text-caba-gold">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-gray-600 text-sm">4.8 / 5</span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Amina B.",
                date: "Juillet 2026",
                text: "Excellent sejour ! Le logement etait propre, bien equipe et tres bien situe. L equipe etait tres reactive.",
              },
              {
                name: "Jean-Pierre L.",
                date: "Juin 2026",
                text: "Rapport qualite-prix imbattable. Je recommande vivement pour un sejour a Dakar.",
              },
              {
                name: "Fatima S.",
                date: "Mai 2026",
                text: "Tout etait parfait. La resistance etait moderne et le service impeccable. On reviendra !",
              },
            ].map((review) => (
              <div
                key={review.name}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 bg-caba-blue/10 rounded-full flex items-center justify-center text-caba-blue font-medium text-sm">
                    {review.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-black">
                      {review.name}
                    </p>
                    <p className="text-xs text-gray-500">{review.date}</p>
                  </div>
                </div>
                <div className="flex text-caba-gold mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-3.5 h-3.5 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-600">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-black mb-4">
            Pret a reserver ?
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto mb-8">
            Verifiez les disponibilites et reservez votre logement en quelques
            clics.
          </p>
          <Link
            href="/recherche"
            className="inline-block px-8 py-3 bg-caba-blue text-white font-medium rounded-lg hover:bg-caba-blue-dark transition-colors"
          >
            Voir les disponibilites
          </Link>
        </div>
      </section>
    </main>
  );
}

async function getFeaturedProperties() {
  return prisma.property.findMany({
    where: { statut: "publie" },
    include: {
      photos: { where: { estPrincipale: true }, take: 1 },
      tarifs: {
        where: { actif: true },
        orderBy: { typeTarif: "asc" },
        take: 3,
      },
      avis: { select: { note: true } },
    },
    take: 6,
  });
}

async function getPromoProperties() {
  return prisma.property.findMany({
    where: { statut: "publie", promotions: { some: { actif: true } } },
    include: {
      photos: { where: { estPrincipale: true }, take: 1 },
      tarifs: {
        where: { actif: true },
        take: 3,
      },
      promotions: { where: { actif: true }, take: 1 },
    },
    take: 3,
  });
}
