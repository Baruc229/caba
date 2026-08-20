"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Booking = {
  id: string;
  numero: string;
  statut: string;
  dateArrivee: string;
  dateDepart: string;
  nombreAdultes: number;
  nombreEnfants: number;
  prixTotal: number;
  devise: string;
  property: { nom: string; type: string; ville: string };
};

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

type Filter = "toutes" | "actives" | "a_venir" | "passees" | "annulees";

export default function ReservationsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<Filter>("toutes");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/client/bookings")
      .then((r) => r.json())
      .then((data) => setBookings(data.bookings || []))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();

  const filtered = bookings.filter((b) => {
    const start = new Date(b.dateArrivee);
    const end = new Date(b.dateDepart);
    switch (filter) {
      case "actives":
        return ["confirmee", "payee", "modifiee"].includes(b.statut);
      case "a_venir":
        return start >= now && b.statut !== "annulee";
      case "passees":
        return end < now;
      case "annulees":
        return b.statut === "annulee";
      default:
        return true;
    }
  });

  const filters: { key: Filter; label: string }[] = [
    { key: "toutes", label: "Toutes" },
    { key: "actives", label: "Actives" },
    { key: "a_venir", label: "A venir" },
    { key: "passees", label: "Passees" },
    { key: "annulees", label: "Annulees" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-black mb-6">Mes reservations</h1>

      {/* Filtres */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === f.key
                ? "bg-caba-blue text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement...</div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((booking) => {
            const status = statusLabels[booking.statut] || {
              label: booking.statut,
              color: "bg-gray-100 text-gray-600",
            };
            return (
              <Link
                key={booking.id}
                href={`/espace-client/reservations/${booking.id}`}
                className="block bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-medium text-black">
                      {booking.property.nom}
                    </p>
                    <p className="text-sm text-gray-500">
                      {booking.property.ville} · {booking.numero}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.color}`}
                  >
                    {status.label}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <p className="text-gray-600">
                    {new Date(booking.dateArrivee).toLocaleDateString("fr-FR")} →{" "}
                    {new Date(booking.dateDepart).toLocaleDateString("fr-FR")}
                  </p>
                  <p className="font-semibold text-black">
                    {Number(booking.prixTotal)} {booking.devise}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <p className="text-gray-500 mb-4">Aucune reservation dans cette categorie.</p>
          <Link
            href="/recherche"
            className="text-caba-blue font-medium hover:underline"
          >
            Trouver un logement
          </Link>
        </div>
      )}
    </div>
  );
}
