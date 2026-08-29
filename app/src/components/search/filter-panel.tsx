"use client";

import { useState } from "react";
import { FaXmark } from "react-icons/fa6";
import { useApp } from "@/components/providers/app-provider";

const TYPE_LABEL_KEYS: Record<string, string> = {
  chambre: "home.typeChambre",
  chambre_avec_salon: "home.typeChambreAvecSalon",
  studio: "home.typeStudio",
  appartement_meuble: "home.typeAppartementMeuble",
  suite: "home.typeSuite",
  villa: "home.typeVilla",
  duplex: "home.typeDuplex",
  maison_entiere: "home.typeMaisonEntiere",
};

export interface FilterState {
  types: string[];
  chambresMin: number;
  litsMin: number;
  prixMin: number;
  prixMax: number;
  equipements: string[];
}

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  availableTypes: string[];
  availableEquipements: Array<{ id: string; nom: string }>;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const CHAMBRES_VALUES = [0, 1, 2, 3, 4];

const LITS_VALUES = [0, 1, 2, 3];

export function FilterPanel({
  filters,
  onChange,
  availableTypes,
  availableEquipements,
  mobileOpen,
  onCloseMobile,
}: FilterPanelProps) {
  const { t } = useApp();
  const [localPrixMin, setLocalPrixMin] = useState(filters.prixMin || "");
  const [localPrixMax, setLocalPrixMax] = useState(filters.prixMax || "");

  const update = (patch: Partial<FilterState>) => {
    onChange({ ...filters, ...patch });
  };

  const toggleType = (type: string) => {
    const types = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];
    update({ types });
  };

  const toggleEquipement = (id: string) => {
    const equipements = filters.equipements.includes(id)
      ? filters.equipements.filter((e) => e !== id)
      : [...filters.equipements, id];
    update({ equipements });
  };

  const reset = () => {
    setLocalPrixMin("");
    setLocalPrixMax("");
    onChange({
      types: [],
      chambresMin: 0,
      litsMin: 0,
      prixMin: 0,
      prixMax: 0,
      equipements: [],
    });
  };

  const applyPrix = () => {
    update({
      prixMin: localPrixMin ? Number(localPrixMin) : 0,
      prixMax: localPrixMax ? Number(localPrixMax) : 0,
    });
  };

  const panel = (
    <div className="filter-panel">
      <div className="filter-panel-header">
        <h2 className="filter-panel-title">{t("logements.filters")}</h2>
        <button
          type="button"
          className="filter-panel-close-mobile"
          aria-label={t("logements.closeFilters")}
          onClick={onCloseMobile}
        >
          <FaXmark aria-hidden="true" size={18} />
        </button>
      </div>

      <div className="filter-section">
        <h3 className="filter-section-title">{t("home.propertyTypeLabel")}</h3>
        <div className="filter-checks">
          {availableTypes.map((type) => (
            <label key={type} className="filter-check">
              <input
                type="checkbox"
                checked={filters.types.includes(type)}
                onChange={() => toggleType(type)}
                className="filter-check-input"
              />
              <span className="filter-check-box" />
              <span className="filter-check-label">
                {TYPE_LABEL_KEYS[type] ? t(TYPE_LABEL_KEYS[type]) : type}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3 className="filter-section-title">{t("logements.bedroomLabel")}</h3>
        <div className="filter-chips">
          {CHAMBRES_VALUES.map((value) => (
            <button
              key={value}
              type="button"
              className={`filter-chip ${filters.chambresMin === value ? "filter-chip--active" : ""}`}
              onClick={() => update({ chambresMin: value })}
            >
              {value === 0 ? t("logements.bedroomAll") : `${value}+`}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3 className="filter-section-title">{t("logements.bedLabel")}</h3>
        <div className="filter-chips">
          {LITS_VALUES.map((value) => (
            <button
              key={value}
              type="button"
              className={`filter-chip ${filters.litsMin === value ? "filter-chip--active" : ""}`}
              onClick={() => update({ litsMin: value })}
            >
              {value === 0 ? t("logements.bedAll") : `${value}+`}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3 className="filter-section-title">{t("logements.priceRange")}</h3>
        <div className="filter-price-range">
          <div className="filter-price-field">
            <label className="filter-price-label" htmlFor="filter-prix-min">{t("logements.priceMin")}</label>
            <input
              id="filter-prix-min"
              type="number"
              min={0}
              step={1000}
              placeholder="0"
              value={localPrixMin}
              onChange={(e) => setLocalPrixMin(e.target.value)}
              onBlur={applyPrix}
              className="filter-price-input"
            />
          </div>
          <span className="filter-price-sep">—</span>
          <div className="filter-price-field">
            <label className="filter-price-label" htmlFor="filter-prix-max">{t("logements.priceMax")}</label>
            <input
              id="filter-prix-max"
              type="number"
              min={0}
              step={1000}
              placeholder="∞"
              value={localPrixMax}
              onChange={(e) => setLocalPrixMax(e.target.value)}
              onBlur={applyPrix}
              className="filter-price-input"
            />
          </div>
        </div>
      </div>

      {availableEquipements.length > 0 && (
        <div className="filter-section">
          <h3 className="filter-section-title">{t("logements.amenities")}</h3>
          <div className="filter-checks">
            {availableEquipements.map((eq) => (
              <label key={eq.id} className="filter-check">
                <input
                  type="checkbox"
                  checked={filters.equipements.includes(eq.id)}
                  onChange={() => toggleEquipement(eq.id)}
                  className="filter-check-input"
                />
                <span className="filter-check-box" />
                <span className="filter-check-label">{eq.nom}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <button type="button" className="filter-reset" onClick={reset}>
        {t("logements.resetFilters")}
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="filter-panel-desktop" aria-label={t("logements.filters")}>
        {panel}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <button
            type="button"
            className="filter-overlay"
            aria-label={t("logements.closeFilters")}
            onClick={onCloseMobile}
          />
          <aside className="filter-panel-mobile" role="dialog" aria-modal="true" aria-label={t("logements.filters")}>
            {panel}
          </aside>
        </>
      )}
    </>
  );
}
