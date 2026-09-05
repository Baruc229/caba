"use client";

import { FaSliders } from "react-icons/fa6";
import { Select } from "@/components/ui/select";
import { useApp } from "@/components/providers/app-provider";

const SORT_VALUES = ["pertinence", "prix_croissant", "prix_decroissant", "note", "newest"];

const SORT_LABEL_KEYS: Record<string, string> = {
  pertinence: "logements.sortRelevance",
  prix_croissant: "logements.sortPriceAsc",
  prix_decroissant: "logements.sortPriceDesc",
  note: "logements.sortRating",
  newest: "logements.sortNewest",
};

interface SortBarProps {
  total: number;
  tri: string;
  onTriChange: (tri: string) => void;
  onOpenFilters: () => void;
}

export function SortBar({ total, tri, onTriChange, onOpenFilters }: SortBarProps) {
  const { t } = useApp();
  return (
    <div className="sort-bar">
      <div className="sort-bar-left">
        <button
          type="button"
          className="sort-bar-filter-btn"
          onClick={onOpenFilters}
          aria-label={t("logements.openFilters")}
        >
          <FaSliders aria-hidden="true" size={14} />
          <span>{t("logements.filters")}</span>
        </button>
        <p className="sort-bar-count">
          <strong>{total}</strong>{" "}
          {t("logements.resultsCount")
            .replace("{n}", String(total))
            .replace(/\{s\}/g, total !== 1 ? "s" : "")}
        </p>
      </div>
      <div className="sort-bar-right">
        <span className="sort-bar-tri-label">{t("logements.sortLabel")}</span>
        <Select
          options={SORT_VALUES.map((value) => ({
            value,
            label: t(SORT_LABEL_KEYS[value]),
          }))}
          value={tri}
          onChange={onTriChange}
          ariaLabel={t("logements.sortAria")}
          variant="field"
          className="sort-bar-select"
        />
      </div>
    </div>
  );
}
