"use client";

import { FaSliders } from "react-icons/fa6";
import { Select } from "@/components/ui/select";

const SORT_OPTIONS = [
  { value: "pertinence", label: "Pertinence" },
  { value: "prix_croissant", label: "Prix croissant" },
  { value: "prix_decroissant", label: "Prix décroissant" },
  { value: "note", label: "Note" },
];

interface SortBarProps {
  total: number;
  tri: string;
  onTriChange: (tri: string) => void;
  onOpenFilters: () => void;
}

export function SortBar({ total, tri, onTriChange, onOpenFilters }: SortBarProps) {
  return (
    <div className="sort-bar">
      <div className="sort-bar-left">
        <button
          type="button"
          className="sort-bar-filter-btn"
          onClick={onOpenFilters}
          aria-label="Ouvrir les filtres"
        >
          <FaSliders aria-hidden="true" size={14} />
          <span>Filtres</span>
        </button>
        <p className="sort-bar-count">
          <strong>{total}</strong> résultat{total !== 1 ? "s" : ""} trouvé{total !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="sort-bar-right">
        <span className="sort-bar-tri-label">Tri :</span>
        <Select
          options={SORT_OPTIONS}
          value={tri}
          onChange={onTriChange}
          ariaLabel="Trier les résultats"
          variant="field"
          className="sort-bar-select"
        />
      </div>
    </div>
  );
}
