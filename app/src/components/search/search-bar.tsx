"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SearchBar({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [type, setType] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    params.set("adults", String(adults));
    params.set("children", String(children));
    if (type) params.set("type", type);
    router.push(`/recherche?${params.toString()}`);
  };

  const GuestSelector = ({
    label,
    sublabel,
    count,
    set,
  }: {
    label: string;
    sublabel: string;
    count: number;
    set: (n: number) => void;
  }) => (
    <div className="flex flex-col">
      <span className="text-sm font-medium text-black">{label}</span>
      <span className="text-xs text-gray-500 mb-1">{sublabel}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => set(Math.max(0, count - 1))}
          className="h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-black transition-colors"
        >
          −
        </button>
        <span className="w-6 text-center text-sm font-medium">{count}</span>
        <button
          type="button"
          onClick={() => set(count + 1)}
          className="h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-black transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <div
      className={`bg-white rounded-xl shadow-lg border border-gray-100 ${
        compact ? "p-4" : "p-6"
      }`}
    >
      {compact ? (
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Arrivee
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-caba-blue"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Depart
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-caba-blue"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Voyageurs
            </label>
            <select
              value={adults + children}
              onChange={(e) => {
                const v = parseInt(e.target.value);
                setAdults(v);
                setChildren(0);
              }}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-caba-blue"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>
                  {n} voyageur{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-caba-blue text-white rounded-lg text-sm font-medium hover:bg-caba-blue-dark transition-colors"
          >
            Rechercher
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date d&apos;arrivee
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-caba-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de depart
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-caba-blue"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voyageurs
              </label>
              <div className="flex items-center gap-6 border border-gray-200 rounded-lg px-4 py-3">
                <GuestSelector
                  label="Adultes"
                  sublabel="13+ ans"
                  count={adults}
                  set={setAdults}
                />
                <GuestSelector
                  label="Enfants"
                  sublabel="2 - 12 ans"
                  count={children}
                  set={setChildren}
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="w-full px-6 py-3 bg-caba-blue text-white rounded-lg text-sm font-medium hover:bg-caba-blue-dark transition-colors"
              >
                Rechercher
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de logement
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-caba-blue"
            >
              <option value="">Tous les types</option>
              <option value="chambre">Chambre</option>
              <option value="chambre_salon">Chambre avec salon</option>
              <option value="studio">Studio</option>
              <option value="appartement_meuble">Appartement meuble</option>
              <option value="suite">Suite</option>
              <option value="villa">Villa</option>
              <option value="duplex">Duplex</option>
              <option value="maison">Maison entiere</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
}
