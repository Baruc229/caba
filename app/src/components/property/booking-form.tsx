"use client";

import { useState } from "react";

type GuestType = "adultes" | "enfants" | "bebes";

const GUEST_INFO: Record<GuestType, { label: string; age: string }> = {
  adultes: { label: "Adultes", age: "13+ ans" },
  enfants: { label: "Enfants", age: "2 - 12 ans" },
  bebes: { label: "Bebe", age: "0 - 2 ans" },
};

function GuestSelector({
  type,
  count,
  set,
}: {
  type: GuestType;
  count: number;
  set: (n: number) => void;
}) {
  const info = GUEST_INFO[type];
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-black">{info.label}</p>
        <p className="text-xs text-gray-500">{info.age}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => set(Math.max(0, count - 1))}
          className="h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-black transition-colors disabled:opacity-30"
          disabled={count === 0}
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
}

export function BookingForm({
  propertyId,
  unitLabel,
}: {
  propertyId: string;
  unitLabel: string;
}) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [babies, setBabies] = useState(0);
  const [pricing, setPricing] = useState<null | {
    subtotal: number;
    cleaningFee: number;
    cityTax: number;
    discount: number;
    total: number;
    currency: string;
    nightsOrUnits: number;
    unitPrice: number;
    breakdown: string[];
  }>(null);
  const [loading, setLoading] = useState(false);

  const calcPrice = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      const res = await fetch("/api/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          startDate,
          endDate,
          typeReservation: "standard",
          adults,
          children,
          babies,
        }),
      });
      if (res.ok) setPricing(await res.json());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-24">
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Arrivee
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPricing(null);
            }}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-caba-blue"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Depart
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPricing(null);
            }}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-caba-blue"
          />
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-2">Voyageurs</p>
        <GuestSelector
          type="adultes"
          count={adults}
          set={(n) => {
            setAdults(n);
            setPricing(null);
          }}
        />
        <GuestSelector
          type="enfants"
          count={children}
          set={(n) => {
            setChildren(n);
            setPricing(null);
          }}
        />
        <GuestSelector
          type="bebes"
          count={babies}
          set={(n) => {
            setBabies(n);
            setPricing(null);
          }}
        />
      </div>

      <button
        onClick={calcPrice}
        disabled={!startDate || !endDate || loading}
        className="w-full py-3 bg-caba-blue text-white font-medium rounded-lg hover:bg-caba-blue-dark transition-colors disabled:opacity-50 mb-4"
      >
        {loading ? "Calcul..." : "Verifier le prix"}
      </button>

      {pricing && (
        <div className="border-t border-gray-100 pt-4 space-y-2">
          {pricing.breakdown.map((line, i) => (
            <p key={i} className="text-sm text-gray-600">
              {line}
            </p>
          ))}
          {pricing.cleaningFee > 0 && (
            <p className="text-sm text-gray-600">
              Frais de menage : {pricing.cleaningFee} {pricing.currency}
            </p>
          )}
          {pricing.cityTax > 0 && (
            <p className="text-sm text-gray-600">
              Taxe de sejour : {pricing.cityTax} {pricing.currency}
            </p>
          )}
          {pricing.discount > 0 && (
            <p className="text-sm text-red-600">
              Reduction : -{pricing.discount} {pricing.currency}
            </p>
          )}
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-black">Total</span>
              <span className="font-bold text-lg text-black">
                {pricing.total} {pricing.currency}
              </span>
            </div>
            <p className="text-xs text-gray-500 text-right">
              {pricing.nightsOrUnits} {unitLabel}
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
        <a
          href={`https://wa.me/221771234567?text=Bonjour, je souhaite reserver ce logement`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 text-center border border-green-500 text-green-600 font-medium rounded-lg hover:bg-green-50 transition-colors text-sm"
        >
          Demander via WhatsApp
        </a>
      </div>
    </div>
  );
}
