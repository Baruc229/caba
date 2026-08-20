import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "Dashboard — Caba Admin" };

const statusLabels: Record<string, string> = {
  demande_en_attente: "En attente",
  confirmee: "Confirmee",
  payee: "Payee",
  annulee: "Annulee",
  terminee: "Terminee",
};

export default async function AdminDashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalProperties,
    totalBookings,
    todayArrivals,
    todayDepartures,
    activeBookings,
    recentBookings,
    totalRevenue,
    monthRevenue,
    totalClients,
  ] = await Promise.all([
    prisma.property.count({ where: { statut: "publie" } }),
    prisma.booking.count(),
    prisma.booking.count({
      where: { dateArrivee: { gte: today, lt: tomorrow }, statut: { notIn: ["annulee"] } },
    }),
    prisma.booking.count({
      where: { dateDepart: { gte: today, lt: tomorrow }, statut: { notIn: ["annulee"] } },
    }),
    prisma.booking.findMany({
      where: {
        dateArrivee: { lte: today },
        dateDepart: { gte: today },
        statut: { in: ["confirmee", "payee"] },
      },
      select: { property: { select: { nom: true } } },
    }),
    prisma.booking.findMany({
      include: {
        property: { select: { nom: true } },
        client: { select: { prenom: true, nom: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.booking.aggregate({
      where: { statut: { in: ["confirmee", "payee", "terminee"] } },
      _sum: { prixTotal: true },
    }),
    prisma.booking.aggregate({
      where: {
        statut: { in: ["confirmee", "payee", "terminee"] },
        createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
      _sum: { prixTotal: true },
    }),
    prisma.user.count({ where: { role: "client" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-black mb-8">Dashboard</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-sm text-gray-500">Arrivees aujourd&apos;hui</p>
          <p className="text-3xl font-bold text-black mt-1">{todayArrivals}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-sm text-gray-500">Departs aujourd&apos;hui</p>
          <p className="text-3xl font-bold text-black mt-1">{todayDepartures}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-sm text-gray-500">Occupes</p>
          <p className="text-3xl font-bold text-black mt-1">{activeBookings.length}</p>
          <p className="text-xs text-gray-400 mt-1">
            / {totalProperties} logements
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-sm text-gray-500">Clients</p>
          <p className="text-3xl font-bold text-black mt-1">{totalClients}</p>
        </div>
      </div>

      {/* Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Revenus du mois</p>
          <p className="text-2xl font-bold text-black mt-1">
            {Number(monthRevenue._sum.prixTotal || 0)} EUR
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Revenus totaux</p>
          <p className="text-2xl font-bold text-black mt-1">
            {Number(totalRevenue._sum.prixTotal || 0)} EUR
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Reservations totales</p>
          <p className="text-2xl font-bold text-black mt-1">{totalBookings}</p>
        </div>
      </div>

      {/* Logements occupes */}
      {activeBookings.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-100 mb-8">
          <h2 className="font-semibold text-black mb-4">Logements occupes</h2>
          <div className="flex flex-wrap gap-2">
            {activeBookings.map((b, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium"
              >
                {b.property.nom}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Dernieres reservations */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-semibold text-black">Dernieres reservations</h2>
          <Link
            href="/admin/reservations"
            className="text-sm text-caba-blue hover:underline"
          >
            Voir tout
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Client
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Logement
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Dates
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Statut
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Montant
                </th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-black">
                      {b.client.prenom} {b.client.nom}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{b.property.nom}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(b.dateArrivee).toLocaleDateString("fr-FR")} →{" "}
                    {new Date(b.dateDepart).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-600">
                      {statusLabels[b.statut] || b.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-black">
                    {Number(b.prixTotal)} {b.devise}
                  </td>
                </tr>
              ))}
              {recentBookings.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    Aucune reservation
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
