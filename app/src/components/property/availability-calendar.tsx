"use client";

import { useEffect, useState } from "react";

type CalendarDay = {
  date: string;
  disponible: boolean;
  statut: string;
  creneaux: string[];
};

export function AvailabilityCalendar({ propertyId }: { propertyId: string }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [nextMonth, setNextMonth] = useState(
    month === 12 ? 1 : month + 1
  );
  const [nextYear, setNextYear] = useState(month === 12 ? year + 1 : year);
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(
      `/api/availability?propertyId=${propertyId}&year=${year}&month=${month}`
    )
      .then((r) => r.json())
      .then((data) => setDays(data.days || []))
      .finally(() => setLoading(false));
  }, [propertyId, year, month]);

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const nextM = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const monthNames = [
    "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre",
  ];

  const renderMonth = (y: number, m: number) => {
    const firstDay = new Date(y, m - 1, 1).getDay();
    const daysInMonth = new Date(y, m, 0).getDate();
    const cells: (CalendarDay | null)[] = [];

    for (let i = 0; i < (firstDay + 6) % 7; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayData = days.find((dd) => dd.date === dateStr);
      cells.push(
        dayData || {
          date: dateStr,
          disponible: true,
          statut: "disponible",
          creneaux: [],
        }
      );
    }
    while (cells.length % 7 !== 0) cells.push(null);

    return cells;
  };

  const statutColors: Record<string, string> = {
    disponible: "bg-green-50 text-green-700",
    reserve: "bg-red-50 text-red-700",
    bloque: "bg-gray-100 text-gray-500",
    maintenance: "bg-yellow-50 text-yellow-700",
  };

  const currentCells = renderMonth(year, month);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          ←
        </button>
        <h3 className="font-semibold text-black">
          {monthNames[month - 1]} {year}
        </h3>
        <button
          onClick={nextM}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
          <div key={i} className="text-center text-xs text-gray-500 py-1">
            {d}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          Chargement...
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {currentCells.map((cell, i) => {
            if (!cell) return <div key={i} />;
            const color =
              statutColors[cell.statut] || statutColors.disponible;
            return (
              <div
                key={i}
                className={`text-center text-xs py-2 rounded-lg ${color}`}
                title={cell.statut}
              >
                {new Date(cell.date + "T12:00:00").getDate()}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
        {Object.entries(statutColors).map(([statut, cls]) => (
          <div key={statut} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded ${cls}`} />
            <span className="text-xs text-gray-500 capitalize">{statut}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
