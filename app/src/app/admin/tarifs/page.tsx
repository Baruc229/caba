"use client";

import { useState, useEffect } from "react";

type Tarif = {
  id: string;
  typeTarif: string;
  prix: number;
  devise: string;
  jourSemaine: string;
  dateDebut: string;
  dateFin: string;
  saison: string | null;
  actif: boolean;
  property: { id: string; nom: string };
};

const pricingLabels: Record<string, string> = {
  standard: "Standard",
  horaire: "Horaire",
  demi_journee: "Demi-journee",
  journee: "Journee",
  nuee: "Nuit",
  vingt_quatre_heures: "24h",
  hebdomadaire: "Hebdomadaire",
  mensuel: "Mensuel",
};

export default function AdminTarifsPage() {
  const [tarifs, setTarifs] = useState<Tarif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/tarifs")
      .then((r) => r.json())
      .then((data) => setTarifs(data.tarifs || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-black">Tarifs</h1>
        <span className="text-sm text-gray-500">{tarifs.length} tarifs</span>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement...</div>
      ) : tarifs.length > 0 ? (
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
                    Prix
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Periode
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Jour
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {tarifs.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium text-black">
                      {t.property.nom}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {pricingLabels[t.typeTarif] || t.typeTarif}
                    </td>
                    <td className="px-6 py-4 font-medium text-black">
                      {t.prix} {t.devise}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(t.dateDebut).toLocaleDateString("fr-FR")} →{" "}
                      {new Date(t.dateFin).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4 text-gray-600 capitalize">
                      {t.jourSemaine}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          t.actif
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {t.actif ? "Actif" : "Inactif"}
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
          <p className="text-gray-500">Aucun tarif configure.</p>
        </div>
      )}
    </div>
  );
}
