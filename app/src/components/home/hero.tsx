"use client";

import { useEffect, useRef, useState } from "react";
import {
  FaCalendarDays,
  FaChevronDown,
  FaChevronUp,
  FaClock,
  FaMinus,
  FaPlus,
  FaSliders,
  FaStar,
  FaUserGroup,
} from "react-icons/fa6";

const TODAY = new Date().toISOString().slice(0, 10);

const GUEST_TYPES = [
  { key: "adultes", name: "Adultes", hint: "18 ans et plus", min: 1, partitive: "d'adultes" },
  { key: "enfants", name: "Enfants", hint: "2 à 17 ans", min: 0, partitive: "d'enfants" },
  { key: "bebes", name: "Bébés", hint: "Moins de 2 ans", min: 0, partitive: "de bébés" },
] as const;

type GuestKey = (typeof GUEST_TYPES)[number]["key"];

type GuestCounts = Record<GuestKey, number>;

const MAX_GUESTS_PER_TYPE = 9;

const TABS = [
  { id: "logements", label: "Logements" },
  { id: "chambres", label: "Chambres" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const SEJOUR_TYPES = [
  { value: "nuee", label: "Nuitée(s)" },
  { value: "journee", label: "Journée" },
  { value: "vingt_quatre_heures", label: "24 heures" },
  { value: "demi_journee", label: "Demi-journée" },
  { value: "plusieurs_heures", label: "Quelques heures" },
] as const;

const HOURLY_TYPES = new Set(["journee", "vingt_quatre_heures", "demi_journee", "plusieurs_heures"]);

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  chambre: "Chambre",
  chambre_avec_salon: "Chambre avec salon",
  studio: "Studio",
  appartement_meuble: "Appartement meublé",
  suite: "Suite",
  villa: "Villa",
  duplex: "Duplex",
  maison_entiere: "Maison entière",
};

interface FilterOptions {
  types: Array<{ type: string; count: number }>;
  equipements: Array<{ id: string; nom: string; icone: string | null; categorie: string }>;
}

const AVATARS = [
  { initials: "AK", background: "var(--color-accent-secondary)" },
  { initials: "FR", background: "var(--color-accent)" },
  { initials: "CM", background: "var(--color-accent-gold)", color: "#1a1a1a" },
];

function ProofPill({ floating = false }: { floating?: boolean }) {
  return (
    <div
      className={
        floating
          ? "proof-pill proof-pill--floating hidden lg:inline-flex"
          : "proof-pill"
      }
    >
      <div className="avatar-stack" aria-hidden="true">
        {AVATARS.map((avatar) => (
          <span
            key={avatar.initials}
            className="avatar"
            style={{ backgroundColor: avatar.background, color: avatar.color }}
          >
            {avatar.initials}
          </span>
        ))}
      </div>
      <div>
        <div className="proof-stars" aria-label="Note de 5 étoiles">
          {Array.from({ length: 5 }).map((_, index) => (
            <FaStar key={index} aria-hidden="true" size={13} />
          ))}
        </div>
        <p className="proof-note">+240 séjours notés 4.8</p>
      </div>
    </div>
  );
}

function DateField({ id, name, label, min }: { id: string; name: string; label: string; min?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="search-field search-field--date">
      <label htmlFor={id} className="search-label">
        {label}
      </label>
      <div
        className="search-value"
        onClick={() => {
          const input = inputRef.current;
          if (input && typeof input.showPicker === "function") {
            try {
              input.showPicker();
            } catch {
              input.focus();
            }
          }
        }}
      >
        <FaCalendarDays aria-hidden="true" size={15} />
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="date"
          min={min}
          className="search-input"
        />
      </div>
    </div>
  );
}

function GuestsField() {
  const [open, setOpen] = useState(false);
  const [counts, setCounts] = useState<GuestCounts>({
    adultes: 2,
    enfants: 0,
    bebes: 0,
  });
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const change = (key: GuestKey, min: number, delta: number) => {
    setCounts((current) => ({
      ...current,
      [key]: Math.max(min, Math.min(MAX_GUESTS_PER_TYPE, current[key] + delta)),
    }));
  };

  const summary = [
    `${counts.adultes} ${counts.adultes > 1 ? "adultes" : "adulte"}`,
    counts.enfants > 0 ? `${counts.enfants} ${counts.enfants > 1 ? "enfants" : "enfant"}` : null,
    counts.bebes > 0 ? `${counts.bebes} ${counts.bebes > 1 ? "bébés" : "bébé"}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="search-field guests" ref={wrapRef}>
      <span className="search-label">Voyageurs</span>
      <button
        type="button"
        className="guests-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <FaUserGroup aria-hidden="true" size={15} />
        <span className="guests-summary">{summary}</span>
        <FaChevronDown
          aria-hidden="true"
          size={11}
          className={`guests-chevron${open ? " is-open" : ""}`}
        />
      </button>

      {open && (
        <div className="guests-popover" role="dialog" aria-label="Choix des voyageurs">
          {GUEST_TYPES.map((type) => (
            <div key={type.key} className="guests-row">
              <div className="guests-type">
                <span className="guests-name">{type.name}</span>
                <span className="guests-hint">{type.hint}</span>
              </div>
              <div className="stepper">
                <button
                  type="button"
                  className="stepper-btn"
                  aria-label={`Réduire le nombre ${type.partitive}`}
                  disabled={counts[type.key] <= type.min}
                  onClick={() => change(type.key, type.min, -1)}
                >
                  <FaMinus aria-hidden="true" size={10} />
                </button>
                <span className="stepper-value stepper-value--count" aria-live="polite">
                  {counts[type.key]}
                </span>
                <button
                  type="button"
                  className="stepper-btn"
                  aria-label={`Augmenter le nombre ${type.partitive}`}
                  disabled={counts[type.key] >= MAX_GUESTS_PER_TYPE}
                  onClick={() => change(type.key, type.min, 1)}
                >
                  <FaPlus aria-hidden="true" size={10} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <input type="hidden" name="adultes" value={counts.adultes} />
      <input type="hidden" name="enfants" value={counts.enfants} />
      <input type="hidden" name="bebes" value={counts.bebes} />
    </div>
  );
}

function AdvancedFilters({ options }: { options: FilterOptions | null }) {
  return (
    <div className="filters-panel" id="filtres-avances">
      <div className="filters-group">
        <label htmlFor="filter-type" className="search-label">
          Type de logement
        </label>
        <select id="filter-type" name="type" className="filters-select" defaultValue="">
          <option value="">Tous les types</option>
          {(options?.types ?? []).map((t) => (
            <option key={t.type} value={t.type}>
              {PROPERTY_TYPE_LABELS[t.type] ?? t.type} ({t.count})
            </option>
          ))}
        </select>
      </div>

      <div className="filters-group filters-group--small">
        <label htmlFor="filter-chambres" className="search-label">
          Chambres (min)
        </label>
        <select id="filter-chambres" name="chambres" className="filters-select" defaultValue="">
          <option value="">Peu importe</option>
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>
              {n}+
            </option>
          ))}
        </select>
      </div>

      <div className="filters-group filters-group--small">
        <label htmlFor="filter-lits" className="search-label">
          Lits (min)
        </label>
        <select id="filter-lits" name="lits" className="filters-select" defaultValue="">
          <option value="">Peu importe</option>
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>
              {n}+
            </option>
          ))}
        </select>
      </div>

      <div className="filters-group filters-group--price">
        <span className="search-label">Prix par séjour (€)</span>
        <div className="filters-price-row">
          <input
            name="prixMin"
            type="number"
            min={0}
            placeholder="Min"
            aria-label="Prix minimum"
            className="filters-input"
          />
          <span aria-hidden="true" className="filters-price-sep">—</span>
          <input
            name="prixMax"
            type="number"
            min={0}
            placeholder="Max"
            aria-label="Prix maximum"
            className="filters-input"
          />
        </div>
      </div>

      <fieldset className="filters-group filters-group--full">
        <legend className="search-label">Équipements</legend>
        <div className="chip-list">
          {(options?.equipements ?? []).map((equipement) => (
            <label key={equipement.id} className="chip">
              <input type="checkbox" name="equipements" value={equipement.nom} className="sr-only" />
              <span>{equipement.nom}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

export function Hero() {
  const [activeTab, setActiveTab] = useState<TabId>("logements");
  const [sejourType, setSejourType] = useState<string>("nuee");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/search/filters")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data) setFilterOptions(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const hourly = HOURLY_TYPES.has(sejourType);

  return (
    <section
      aria-label="Recherche de logements"
      className="px-4 pt-4 sm:px-6 sm:pt-6 lg:px-0 lg:pt-16"
    >
      <div className="hero-wrap">
        <ProofPill floating />

        <div className="hero">
          <div className="hero-content">
            <span className="hero-badge">Complexe résidentiel · Bénin</span>
            <h1 className="hero-title">
              Trouvez votre{" "}
              <span className="hero-title-accent">havre de paix</span> au Bénin
            </h1>
            <p className="hero-subtitle">
              Chambres, studios, suites et villas à Cotonou — disponibilités en
              temps réel et réservation en ligne.
            </p>
            <div className="mt-4 lg:hidden">
              <ProofPill />
            </div>
          </div>
        </div>

        <form className="search-panel" action="/logements" method="get">
          <div className="search-tabs" role="tablist" aria-label="Type de recherche">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={activeTab === tab.id}
                aria-controls="search-fields"
                className="search-tab"
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}

            <button
              type="button"
              className={`filters-toggle${filtersOpen ? " is-open" : ""}`}
              aria-expanded={filtersOpen}
              aria-controls="filtres-avances"
              onClick={() => setFiltersOpen((value) => !value)}
            >
              <FaSliders aria-hidden="true" size={13} />
              Filtres avancés
              {filtersOpen ? (
                <FaChevronUp aria-hidden="true" size={10} />
              ) : (
                <FaChevronDown aria-hidden="true" size={10} />
              )}
            </button>
          </div>

          <div
            id="search-fields"
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            className="search-fields"
          >
            <div className="search-field">
              <label htmlFor="type-reservation" className="search-label">
                Type de séjour
              </label>
              <div className="search-value">
                <FaClock aria-hidden="true" size={15} />
                <select
                  id="type-reservation"
                  name="typeReservation"
                  className="search-input search-select"
                  value={sejourType}
                  onChange={(event) => setSejourType(event.target.value)}
                >
                  {SEJOUR_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <DateField id="arrivee" name="arrivee" label="Date d'arrivée" min={TODAY} />

            <DateField id="depart" name="depart" label="Date de départ" />

            <GuestsField />

            <button type="submit" className="btn-pill btn-primary w-full lg:w-auto lg:px-10">
              Rechercher
            </button>

            {hourly && (
              <div className="hours-row">
                <div className="search-field hours-field">
                  <label htmlFor="heure-arrivee" className="search-label">
                    Heure d&apos;arrivée
                  </label>
                  <input
                    id="heure-arrivee"
                    name="heureArrivee"
                    type="time"
                    defaultValue="08:00"
                    className="search-input"
                  />
                </div>
                <span aria-hidden="true" className="hours-sep">→</span>
                <div className="search-field hours-field">
                  <label htmlFor="heure-depart" className="search-label">
                    Heure de départ
                  </label>
                  <input
                    id="heure-depart"
                    name="heureDepart"
                    type="time"
                    defaultValue="18:00"
                    className="search-input"
                  />
                </div>
              </div>
            )}
          </div>

          {filtersOpen && <AdvancedFilters options={filterOptions} />}
        </form>
      </div>
    </section>
  );
}
