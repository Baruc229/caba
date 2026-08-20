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
  source: string;
  createdAt: string;
  property: { nom: string; type: string };
  client: { prenom: string; nom: string; email: string };
};

const statusLabels: Record<string, { label: string; color: string }> = {
  demande_en_attente: { label: "En attente", color: "bg-yellow-100 text-yellow-700" },
  reservation_temporaire: { label: "Temporaire", color: "bg-orange-100 text-orange-700" },
  en_attente_paiement: { label: "Paiement", color: "bg-blue-100 text-blue-700" },
  confirmee: { label: "Confirmee", color: "bg-green-100 text-green-700" },
  payee: { label: "Payee", color: "bg-green-100 text-green-700" },
  modifiee: { label: "Modifiee", color: "bg-purple-100 text-purple-700" },
  annulee: { label: "Annulee", color: "bg-red-100 text-red-700" },
  terminee: { label: "Terminee", color: "bg-gray-100 text-gray-600" },
};

type Filter = "toutes" | "demande_en_attente" | "confirmee" | "payee" | "annulee" | "terminee";

export default function AdminReservationsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<Filter>("toutes");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/bookings")
      .then((r) => r.json())
      .then((data) => setBookings(data.bookings || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "toutes"
      ? bookings
      : bookings.filter((b) => b.statut === filter);

  const filters: { key: Filter; label: string }[] = [
    { key: "toutes", label: "Toutes" },
    { key: "demande_en_attente", label: "En attente" },
    { key: "confirmee", label: "Confirmees" },
    { key: "payee", label: "Payees" },
    { key: "annulee", label: "Annulees" },
    { key: "terminee", label: "Terminees" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-black">Reservations</h1>
        <span className="text-sm text-gray-500">
          {filtered.length} reservation{filtered.length > 1 ? "s" : ""}
        </span>
      </div>

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
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Numero
                  </th>
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
                    Source
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
                {filtered.map((b) => {
                  const status = statusLabels[b.statut] || {
                    label: b.statut,
                    color: "bg-gray-100 text-gray-600",
                  };
                  return (
                    <tr
                      key={b.id}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/reservations/${b.id}`}
                          className="font-medium text-caba-blue hover:underline"
                        >
                          {b.numero}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-black">{b.client.prenom} {b.client.nom}</p>
                        <p className="text-xs text-gray-500">{b.client.email}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{b.property.nom}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(b.dateArrivee).toLocaleDateString("fr-FR")} →{" "}
                        {new Date(b.dateDepart).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                          {b.source}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-black">
                        {Number(b.prixTotal)} {b.devise}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <p className="text-gray-500">Aucune reservation dans cette categorie.</p>
        </div>
      )}
    </div>
  );
}
