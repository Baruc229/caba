"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Client = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  createdAt: string;
  actif: boolean;
  _count: { bookings: number };
  bookings: { dateDepart: string }[];
};

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/clients")
      .then((r) => r.json())
      .then((data) => setClients(data.clients || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-black">Clients</h1>
        <span className="text-sm text-gray-500">{clients.length} clients</span>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement...</div>
      ) : clients.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Nom
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Telephone
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Reservations
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Inscription
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/clients/${c.id}`}
                        className="flex items-center gap-3"
                      >
                        <div className="w-8 h-8 bg-caba-blue/10 rounded-full flex items-center justify-center text-caba-blue text-xs font-bold shrink-0">
                          {c.prenom[0]}{c.nom[0]}
                        </div>
                        <span className="font-medium text-black">
                          {c.prenom} {c.nom}
                        </span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{c.email}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {c.telephone || "-"}
                    </td>
                    <td className="px-6 py-4 font-medium text-black">
                      {c._count.bookings}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          c.actif
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {c.actif ? "Actif" : "Inactif"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <p className="text-gray-500">Aucun client.</p>
        </div>
      )}
    </div>
  );
}
