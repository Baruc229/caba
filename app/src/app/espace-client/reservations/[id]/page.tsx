import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export const metadata = { title: "Detail reservation — Caba Residence" };

const statusLabels: Record<string, { label: string; color: string; desc: string }> = {
  demande_en_attente: {
    label: "En attente",
    color: "bg-yellow-100 text-yellow-700",
    desc: "Votre demande est en cours de traitement.",
  },
  reservation_temporaire: {
    label: "Temporaire",
    color: "bg-orange-100 text-orange-700",
    desc: "Verrouillage en cours, veuillez patienter.",
  },
  en_attente_paiement: {
    label: "Paiement en attente",
    color: "bg-blue-100 text-blue-700",
    desc: "Effectuez votre paiement pour confirmer.",
  },
  confirmee: {
    label: "Confirmee",
    color: "bg-green-100 text-green-700",
    desc: "Votre reservation est confirmee !",
  },
  payee: {
    label: "Payee",
    color: "bg-green-100 text-green-700",
    desc: "Paiement recu. A bientot !",
  },
  modifiee: {
    label: "Modifiee",
    color: "bg-purple-100 text-purple-700",
    desc: "Votre reservation a ete modifiee.",
  },
  annulee: {
    label: "Annulee",
    color: "bg-red-100 text-red-700",
    desc: "Cette reservation a ete annulee.",
  },
  terminee: {
    label: "Terminee",
    color: "bg-gray-100 text-gray-600",
    desc: "Ce sejour est termine. Merci !",
  },
};

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return null;

  const booking = await prisma.booking.findUnique({
    where: { id, clientId: session.user.id },
    include: {
      property: {
        select: {
          id: true,
          nom: true,
          type: true,
          ville: true,
          pays: true,
          adresse: true,
          photos: { where: { estPrincipale: true }, take: 1 },
        },
      },
      paiements: true,
    },
  });

  if (!booking) notFound();

  const status = statusLabels[booking.statut] || {
    label: booking.statut,
    color: "bg-gray-100 text-gray-600",
    desc: "",
  };

  const nights = Math.ceil(
    (new Date(booking.dateDepart).getTime() -
      new Date(booking.dateArrivee).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div>
      <Link
        href="/espace-client/reservations"
        className="text-sm text-caba-blue hover:underline mb-4 inline-block"
      >
        &larr; Retour aux reservations
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">
            {booking.property.nom}
          </h1>
          <p className="text-gray-600 text-sm">Reservation {booking.numero}</p>
        </div>
        <span
          className={`text-sm px-3 py-1.5 rounded-full font-medium ${status.color}`}
        >
          {status.label}
        </span>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <p className="text-sm text-gray-600">{status.desc}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="font-semibold text-black mb-4">Details du sejour</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Arrivee</span>
                <span className="font-medium text-black">
                  {new Date(booking.dateArrivee).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Depart</span>
                <span className="font-medium text-black">
                  {new Date(booking.dateDepart).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Duree</span>
                <span className="font-medium text-black">
                  {nights} nuit{nights > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Voyageurs</span>
                <span className="font-medium text-black">
                  {booking.nombreAdultes} adulte
                  {booking.nombreAdultes > 1 ? "s" : ""}
                  {booking.nombreEnfants > 0
                    ? `, ${booking.nombreEnfants} enfant${
                        booking.nombreEnfants > 1 ? "s" : ""
                      }`
                    : ""}
                  {booking.nombreBebes > 0
                    ? `, ${booking.nombreBebes} bebe${
                        booking.nombreBebes > 1 ? "s" : ""
                      }`
                    : ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Logement</span>
                <Link
                  href={`/logements/${booking.property.id}`}
                  className="font-medium text-caba-blue hover:underline"
                >
                  {booking.property.nom}
                </Link>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Adresse</span>
                <span className="text-right text-black">
                  {booking.property.adresse}
                  <br />
                  {booking.property.ville}, {booking.property.pays}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="font-semibold text-black mb-4">Detail du prix</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Sejour ({nights} nuits)</span>
                <span className="text-black">
                  {Number(booking.prixSejour)} {booking.devise}
                </span>
              </div>
              {Number(booking.fraisMenage) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Frais de menage</span>
                  <span className="text-black">
                    {Number(booking.fraisMenage)} {booking.devise}
                  </span>
                </div>
              )}
              {Number(booking.taxeSejour) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Taxe de sejour</span>
                  <span className="text-black">
                    {Number(booking.taxeSejour)} {booking.devise}
                  </span>
                </div>
              )}
              {Number(booking.supplements) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Supplements</span>
                  <span className="text-black">
                    {Number(booking.supplements)} {booking.devise}
                  </span>
                </div>
              )}
              {Number(booking.reductions) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Reductions</span>
                  <span className="text-red-600">
                    -{Number(booking.reductions)} {booking.devise}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                <span className="font-semibold text-black">Total</span>
                <span className="font-bold text-lg text-black">
                  {Number(booking.prixTotal)} {booking.devise}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
            {booking.property.photos?.[0]?.url ? (
              <img
                src={booking.property.photos[0].url}
                alt={booking.property.nom}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                Pas de photo
              </div>
            )}
            <div className="p-4">
              <p className="text-sm text-gray-500">
                {booking.property.ville}, {booking.property.pays}
              </p>
            </div>
          </div>

          {booking.paiements.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h2 className="font-semibold text-black mb-4">Paiements</h2>
              <div className="space-y-3">
                {booking.paiements.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <p className="text-black font-medium">
                        {Number(p.montant)} {p.devise}
                      </p>
                      <p className="text-xs text-gray-500">
                        {p.datePaiement
                          ? new Date(p.datePaiement).toLocaleDateString("fr-FR")
                          : "En attente"}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        p.statut === "confirme"
                          ? "bg-green-100 text-green-700"
                          : p.statut === "echoue"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {p.statut === "confirme"
                        ? "Recu"
                        : p.statut === "echoue"
                        ? "Echoue"
                        : "En attente"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {["confirmee", "payee", "modifiee"].includes(booking.statut) && (
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h2 className="font-semibold text-black mb-4">Actions</h2>
              <div className="space-y-2">
                <a
                  href={`https://wa.me/221771234567?text=Bonjour, je souhaite modifier ma reservation ${booking.numero}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Modifier via WhatsApp
                </a>
                <Link
                  href={`/logements/${booking.property.id}`}
                  className="block w-full text-center py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Voir le logement
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
