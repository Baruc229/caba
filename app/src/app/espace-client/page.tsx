import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "Tableau de bord — Caba Residence" };

const statusLabels: Record<string, { label: string; color: string }> = {
  demande_en_attente: { label: "En attente", color: "bg-yellow-100 text-yellow-700" },
  reservation_temporaire: { label: "Temporaire", color: "bg-orange-100 text-orange-700" },
  en_attente_paiement: { label: "Paiement en attente", color: "bg-blue-100 text-blue-700" },
  confirmee: { label: "Confirmee", color: "bg-green-100 text-green-700" },
  payee: { label: "Payee", color: "bg-green-100 text-green-700" },
  modifiee: { label: "Modifiee", color: "bg-purple-100 text-purple-700" },
  annulee: { label: "Annulee", color: "bg-red-100 text-red-700" },
  terminee: { label: "Terminee", color: "bg-gray-100 text-gray-600" },
};

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  const [upcomingBookings, pastBookings, totalBookings] = await Promise.all([
    prisma.booking.findMany({
      where: {
        clientId: userId,
        dateDepart: { gte: new Date() },
        statut: { notIn: ["annulee"] },
      },
      include: {
        property: {
          select: {
            nom: true,
            type: true,
            ville: true,
            photos: { where: { estPrincipale: true }, take: 1 },
          },
        },
      },
      orderBy: { dateArrivee: "asc" },
      take: 3,
    }),
    prisma.booking.findMany({
      where: {
        clientId: userId,
        dateDepart: { lt: new Date() },
      },
      include: {
        property: { select: { nom: true, type: true } },
      },
      orderBy: { dateDepart: "desc" },
      take: 3,
    }),
    prisma.booking.count({ where: { clientId: userId } }),
  ]);

  const totalSpent = await prisma.booking.aggregate({
    where: {
      clientId: userId,
      statut: { in: ["confirmee", "payee", "terminee"] },
    },
    _sum: { prixTotal: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-black mb-2">
        Bonjour, {session?.user?.prenom || "Client"}
      </h1>
      <p className="text-gray-600 mb-8">
        Voici un apercu de votre espace.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-sm text-gray-500">Reservations</p>
          <p className="text-2xl font-bold text-black mt-1">{totalBookings}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-sm text-gray-500">A venir</p>
          <p className="text-2xl font-bold text-black mt-1">
            {upcomingBookings.length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-sm text-gray-500">Total depense</p>
          <p className="text-2xl font-bold text-black mt-1">
            {totalSpent._sum.prixTotal
              ? `${Number(totalSpent._sum.prixTotal)} EUR`
              : "0 EUR"}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-sm text-gray-500">Terminees</p>
          <p className="text-2xl font-bold text-black mt-1">
            {pastBookings.length}
          </p>
        </div>
      </div>

      {/* Prochaines reservations */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-black">
            Prochaines reservations
          </h2>
          <Link
            href="/espace-client/reservations"
            className="text-sm text-caba-blue hover:underline"
          >
            Voir tout
          </Link>
        </div>
        {upcomingBookings.length > 0 ? (
          <div className="space-y-3">
            {upcomingBookings.map((booking) => {
              const status =
                statusLabels[booking.statut] || {
                  label: booking.statut,
                  color: "bg-gray-100 text-gray-600",
                };
              return (
                <Link
                  key={booking.id}
                  href={`/espace-client/reservations/${booking.id}`}
                  className="flex items-center gap-4 bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    {booking.property.photos?.[0]?.url ? (
                      <img
                        src={booking.property.photos[0].url}
                        alt={booking.property.nom}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        Photo
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-black truncate">
                      {booking.property.nom}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(booking.dateArrivee).toLocaleDateString("fr-FR")}{" "}
                      &rarr;{" "}
                      {new Date(booking.dateDepart).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${status.color}`}
                    >
                      {status.label}
                    </span>
                    <p className="text-sm font-semibold text-black mt-1">
                      {Number(booking.prixTotal)} {booking.devise}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
            <p className="text-gray-500 mb-4">Aucune reservation a venir.</p>
            <Link
              href="/recherche"
              className="inline-block px-6 py-2 bg-caba-blue text-white rounded-lg text-sm font-medium hover:bg-caba-blue-dark transition-colors"
            >
              Trouver un logement
            </Link>
          </div>
        )}
      </section>

      {/* Derniers sejours */}
      {pastBookings.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-black mb-4">
            Derniers sejours
          </h2>
          <div className="space-y-3">
            {pastBookings.map((booking) => {
              const status =
                statusLabels[booking.statut] || {
                  label: booking.statut,
                  color: "bg-gray-100 text-gray-600",
                };
              return (
                <Link
                  key={booking.id}
                  href={`/espace-client/reservations/${booking.id}`}
                  className="flex items-center gap-4 bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-black truncate">
                      {booking.property.nom}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(booking.dateArrivee).toLocaleDateString("fr-FR")}{" "}
                      &rarr;{" "}
                      {new Date(booking.dateDepart).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${status.color}`}
                    >
                      {status.label}
                    </span>
                    <p className="text-sm font-semibold text-black mt-1">
                      {Number(booking.prixTotal)} {booking.devise}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
