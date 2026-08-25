"use client";

import { useEffect, useRef, useState } from "react";
import {
  FaChevronDown,
  FaClock,
  FaMinus,
  FaPlus,
  FaStar,
  FaUserGroup,
} from "react-icons/fa6";
import { Select } from "@/components/ui/select";
import { DateRangeField } from "@/components/ui/double-calendar";

const TODAY = new Date().toISOString().slice(0, 10);

const GUEST_TYPES = [
  { key: "adultes", name: "Adultes", hint: "18 ans et plus", min: 1, partitive: "d'adultes" },
  { key: "enfants", name: "Enfants", hint: "2 à 17 ans", min: 0, partitive: "d'enfants" },
  { key: "bebes", name: "Bébés", hint: "Moins de 2 ans", min: 0, partitive: "de bébés" },
] as const;

type GuestKey = (typeof GUEST_TYPES)[number]["key"];

type GuestCounts = Record<GuestKey, number>;

const MAX_GUESTS_PER_TYPE = 9;

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

/* Résidence unique : le type de logement remplace les anciens
   onglets Logements/Chambres — un seul mode de recherche */
const TYPE_OPTIONS = [
  { value: "", label: "Tous les types" },
  ...Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
];

const SEJOUR_TYPES = [
  { value: "nuee", label: "Nuitée(s)" },
  { value: "journee", label: "Journée" },
  { value: "vingt_quatre_heures", label: "24 heures" },
  { value: "demi_journee", label: "Demi-journée" },
  { value: "plusieurs_heures", label: "Quelques heures" },
] as const;

/* Types pour lesquels le client choisit réellement ses heures
   (24h et quelques heures). Les autres infèrent du système. */
const NEEDS_HOURS = new Set(["vingt_quatre_heures", "plusieurs_heures"]);

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

function GuestsField() {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [counts, setCounts] = useState<GuestCounts>({
    adultes: 2,
    enfants: 0,
    bebes: 0,
  });
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    // Fermeture au clic réel hors du popover — volontairement PAS
    // sur pointerdown : le doigt qui amorce un scroll déclenche un
    // pointerdown et fermait le menu pendant que l'utilisateur
    // cherchait à voir les options.
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("click", onClick);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const toggle = () => {
    if (!open && wrapRef.current) {
      // Pas assez de place sous le champ ? Le popover s'ouvre vers le haut
      const rect = wrapRef.current.getBoundingClientRect();
      setDropUp(window.innerHeight - rect.bottom < 260 && rect.top > 260);
    }
    setOpen((value) => !value);
  };

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
        onClick={toggle}
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
        <div
          className={`guests-popover${dropUp ? " guests-popover--up" : ""}`}
          role="dialog"
          aria-label="Choix des voyageurs"
        >
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

export function Hero() {
  const [sejourType, setSejourType] = useState<string>("nuee");
  const [heureArrivee, setHeureArrivee] = useState("08:00");

  const needsHours = NEEDS_HOURS.has(sejourType);
  const is24h = sejourType === "vingt_quatre_heures";

  /* Pour "24 heures" : le départ est l'arrivée + 24h automatiquement */
  const heureDepartAuto = (() => {
    const [h, m] = heureArrivee.split(":").map(Number);
    const next = (h + 24) % 24;
    return `${String(next).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  })();

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
          <div id="search-fields" className="search-fields">
            <div className="search-field">
              <label htmlFor="type-reservation" className="search-label">
                Type de séjour
              </label>
              <div className="search-value">
                <FaClock aria-hidden="true" size={15} />
                <Select
                  id="type-reservation"
                  variant="field"
                  ariaLabel="Type de séjour"
                  name="typeReservation"
                  options={SEJOUR_TYPES.map((type) => ({
                    value: type.value,
                    label: type.label,
                  }))}
                  value={sejourType}
                  onChange={(nextValue) => setSejourType(nextValue)}
                />
              </div>
            </div>

            <DateRangeField min={TODAY} />

            <GuestsField />

            <div className="search-field">
              <label htmlFor="type-logement" className="search-label">
                Type de logement
              </label>
              <div className="search-value">
                <Select
                  id="type-logement"
                  variant="field"
                  ariaLabel="Type de logement"
                  name="type"
                  placeholder="Tous les types"
                  defaultValue=""
                  options={TYPE_OPTIONS}
                />
              </div>
            </div>

            <button type="submit" className="btn-pill btn-primary w-full lg:w-auto lg:px-10">
              Rechercher
            </button>

            {needsHours && (
              <div className="hours-row">
                <div className="search-field hours-field">
                  <label htmlFor="heure-arrivee" className="search-label">
                    Heure d&apos;arrivée
                  </label>
                  <div className="search-value">
                    <input
                      id="heure-arrivee"
                      name="heureArrivee"
                      type="time"
                      value={heureArrivee}
                      onChange={(e) => setHeureArrivee(e.target.value)}
                      className="search-input"
                    />
                  </div>
                </div>
                <span aria-hidden="true" className="hours-sep">→</span>
                <div className="search-field hours-field">
                  <label htmlFor="heure-depart" className="search-label">
                    Heure de départ
                  </label>
                  <div className="search-value">
                    {is24h ? (
                      <>
                        <input
                          type="text"
                          readOnly
                          tabIndex={-1}
                          className="search-input"
                          value={heureDepartAuto}
                        />
                        <input type="hidden" name="heureDepart" value={heureDepartAuto} />
                      </>
                    ) : (
                      <input
                        id="heure-depart"
                        name="heureDepart"
                        type="time"
                        defaultValue="18:00"
                        className="search-input"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
