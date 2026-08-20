import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

const statusLabels: Record<string, { label: string; color: string }> = {
  demande_en_attente: { label: "En attente", color: "bg-yellow-100 text-yellow-700" },
  confirmee: { label: "Confirmee", color: "bg-green-100 text-green-700" },
  payee: { label: "Payee", color: "bg-green-100 text-green-700" },
  modifiee: { label: "Modifiee", color: "bg-purple-100 text-purple-700" },
  annulee: { label: "Annulee", color: "bg-red-100 text-red-700" },
  terminee: { label: "Terminee", color: "bg-gray-100 text-gray-600" },
};

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      property: { select: { id: true, nom: true, type: true, ville: true, pays: true, photos: { where: { estPrincipale: true }, take: 1 } } },
      client: { select: { prenom: true, nom: true, email: true, telephone: true } },
      paiements: true,
      historique: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!booking) notFound();

  const status = statusLabels[booking.statut] || { label: booking.statut, color: "bg-gray-100 text-gray-600" };
  const nights = Math.ceil(
    (new Date(booking.dateDepart).getTime() - new Date(booking.dateArrivee).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div>
      <Link href="/admin/reservations" className="text-sm text-caba-blue hover:underline mb-4 inline-block">
        &larr; Retour
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">Reservation {booking.numero}</h1>
          <p className="text-gray-600 text-sm">
            {booking.client.prenom} {booking.client.nom} · {booking.client.email}
          </p>
        </div>
        <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${status.color}`}>{status.label}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Details sejour */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="font-semibold text-black mb-4">Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Logement</p>
                <Link href={`/admin/logements/${booking.property.id}`} className="font-medium text-caba-blue hover:underline">
                  {booking.property.nom}
                </Link>
              </div>
              <div>
                <p className="text-gray-500">Source</p>
                <p className="font-medium text-black">{booking.source}</p>
              </div>
              <div>
                <p className="text-gray-500">Arrivee</p>
                <p className="font-medium text-black">{new Date(booking.dateArrivee).toLocaleDateString("fr-FR")}</p>
              </div>
              <div>
                <p className="text-gray-500">Depart</p>
                <p className="font-medium text-black">{new Date(booking.dateDepart).toLocaleDateString("fr-FR")}</p>
              </div>
              <div>
                <p className="text-gray-500">Duree</p>
                <p className="font-medium text-black">{nights} nuits</p>
              </div>
              <div>
                <p className="text-gray-500">Voyageurs</p>
                <p className="font-medium text-black">
                  {booking.nombreAdultes}A {booking.nombreEnfants > 0 ? `+ ${booking.nombreEnfants}E` : ""} {booking.nombreBebes > 0 ? `+ ${booking.nombreBebes}B` : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Prix */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="font-semibold text-black mb-4">Prix</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Sejour</span><span>{Number(booking.prixSejour)} {booking.devise}</span></div>
              {Number(booking.fraisMenage) > 0 && <div className="flex justify-between"><span className="text-gray-500">Menage</span><span>{Number(booking.fraisMenage)} {booking.devise}</span></div>}
              {Number(booking.taxeSejour) > 0 && <div className="flex justify-between"><span className="text-gray-500">Taxe</span><span>{Number(booking.taxeSejour)} {booking.devise}</span></div>}
              {Number(booking.reductions) > 0 && <div className="flex justify-between"><span className="text-gray-500">Reductions</span><span className="text-red-600">-{Number(booking.reductions)} {booking.devise}</span></div>}
              <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                <span>Total</span><span>{Number(booking.prixTotal)} {booking.devise}</span>
              </div>
            </div>
          </div>

          {/* Historique */}
          {booking.historique.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h2 className="font-semibold text-black mb-4">Historique</h2>
              <div className="space-y-3">
                {booking.historique.map((h) => (
                  <div key={h.id} className="flex items-start gap-3 text-sm">
                    <span className="w-2 h-2 bg-caba-blue rounded-full mt-1.5 shrink-0" />
                    <div>
                      <p className="font-medium text-black capitalize">{h.action}</p>
                      <p className="text-xs text-gray-500">{new Date(h.createdAt).toLocaleString("fr-FR")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="font-semibold text-black mb-4">Actions rapides</h2>
            <div className="space-y-2">
              {booking.statut === "demande_en_attente" && (
                <button className="w-full py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                  Confirmer
                </button>
              )}
              {["confirmee", "payee", "modifiee"].includes(booking.statut) && (
                <button className="w-full py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
                  Annuler
                </button>
              )}
              <Link
                href={`/admin/logements/${booking.property.id}`}
                className="block w-full text-center py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Voir le logement
              </Link>
            </div>
          </div>

          {booking.paiements.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h2 className="font-semibold text-black mb-4">Paiements</h2>
              {booking.paiements.map((p) => (
                <div key={p.id} className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium">{Number(p.montant)} {p.devise}</p>
                    <p className="text-xs text-gray-500">{p.moyenPaiement}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.statut === "confirme" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {p.statut}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Notes internes */}
          {booking.notesInternes && (
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h2 className="font-semibold text-black mb-4">Notes internes</h2>
              <p className="text-sm text-gray-600">{booking.notesInternes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
