"use client";

import { useState } from "react";
import { FaXmark } from "react-icons/fa6";

const TYPE_LABELS: Record<string, string> = {
  chambre: "Chambre",
  chambre_avec_salon: "Chambre avec salon",
  studio: "Studio",
  appartement_meuble: "Appartement meublé",
  suite: "Suite",
  villa: "Villa",
  duplex: "Duplex",
  maison_entiere: "Maison entière",
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

const CHAMBRES_OPTIONS = [
  { value: 0, label: "Toutes" },
  { value: 1, label: "1+" },
  { value: 2, label: "2+" },
  { value: 3, label: "3+" },
  { value: 4, label: "4+" },
];

const LITS_OPTIONS = [
  { value: 0, label: "Tous" },
  { value: 1, label: "1+" },
  { value: 2, label: "2+" },
  { value: 3, label: "3+" },
];

export function FilterPanel({
  filters,
  onChange,
  availableTypes,
  availableEquipements,
  mobileOpen,
  onCloseMobile,
}: FilterPanelProps) {
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
        <h2 className="filter-panel-title">Filtres</h2>
        <button
          type="button"
          className="filter-panel-close-mobile"
          aria-label="Fermer les filtres"
          onClick={onCloseMobile}
        >
          <FaXmark aria-hidden="true" size={18} />
        </button>
      </div>

      <div className="filter-section">
        <h3 className="filter-section-title">Type de logement</h3>
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
              <span className="filter-check-label">{TYPE_LABELS[type] ?? type}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3 className="filter-section-title">Chambres</h3>
        <div className="filter-chips">
          {CHAMBRES_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`filter-chip ${filters.chambresMin === opt.value ? "filter-chip--active" : ""}`}
              onClick={() => update({ chambresMin: opt.value })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3 className="filter-section-title">Lits</h3>
        <div className="filter-chips">
          {LITS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`filter-chip ${filters.litsMin === opt.value ? "filter-chip--active" : ""}`}
              onClick={() => update({ litsMin: opt.value })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3 className="filter-section-title">Fourchette de prix</h3>
        <div className="filter-price-range">
          <div className="filter-price-field">
            <label className="filter-price-label" htmlFor="filter-prix-min">Min</label>
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
            <label className="filter-price-label" htmlFor="filter-prix-max">Max</label>
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
          <h3 className="filter-section-title">Équipements</h3>
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
        Réinitialiser les filtres
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="filter-panel-desktop" aria-label="Filtres">
        {panel}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <button
            type="button"
            className="filter-overlay"
            aria-label="Fermer les filtres"
            onClick={onCloseMobile}
          />
          <aside className="filter-panel-mobile" role="dialog" aria-modal="true" aria-label="Filtres">
            {panel}
          </aside>
        </>
      )}
    </>
  );
}
