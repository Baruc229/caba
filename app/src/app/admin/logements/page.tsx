"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Property = {
  id: string;
  nom: string;
  type: string;
  statut: string;
  ville: string;
  capaciteMaximale: number;
  nombreChambres: number;
  photo: string | null;
  tarifBase: number | null;
  devise: string;
  nombreAvis: number;
  note: number | null;
};

const statusColors: Record<string, string> = {
  publie: "bg-green-100 text-green-700",
  brouillon: "bg-yellow-100 text-yellow-700",
  depublie: "bg-gray-100 text-gray-600",
  desactive: "bg-red-100 text-red-700",
  maintenance: "bg-orange-100 text-orange-700",
};

const typeLabels: Record<string, string> = {
  chambre: "Chambre",
  chambre_avec_salon: "Chambre salon",
  studio: "Studio",
  appartement_meuble: "Appartement",
  suite: "Suite",
  villa: "Villa",
  duplex: "Duplex",
  maison_entiere: "Maison",
  personnalise: "Autre",
};

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/properties")
      .then((r) => r.json())
      .then((data) => setProperties(data.properties || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-black">Logements</h1>
        <span className="text-sm text-gray-500">{properties.length} logements</span>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement...</div>
      ) : properties.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Logement
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Ville
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Statut
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Tarif
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Note
                  </th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/logements/${p.id}`}
                        className="flex items-center gap-3"
                      >
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                          {p.photo ? (
                            <img
                              src={p.photo}
                              alt={p.nom}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              -
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-black">{p.nom}</p>
                          <p className="text-xs text-gray-500">
                            {p.nombreChambres} ch. · {p.capaciteMaximale} pers.
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {typeLabels[p.type] || p.type}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{p.ville}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          statusColors[p.statut] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {p.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-black">
                      {p.tarifBase ? `${Number(p.tarifBase)} ${p.devise}` : "-"}
                    </td>
                    <td className="px-6 py-4">
                      {p.note !== null ? (
                        <span className="text-caba-gold">
                          {p.note.toFixed(1)} ({p.nombreAvis})
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <p className="text-gray-500">Aucun logement.</p>
        </div>
      )}
    </div>
  );
}
