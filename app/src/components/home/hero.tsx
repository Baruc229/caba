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
import { useApp } from "@/components/providers/app-provider";

const TODAY = new Date().toISOString().slice(0, 10);

const GUEST_TYPES = [
  { key: "adultes" as const, min: 1 },
  { key: "enfants" as const, min: 0 },
  { key: "bebes" as const, min: 0 },
];

type GuestKey = (typeof GUEST_TYPES)[number]["key"];

type GuestCounts = Record<GuestKey, number>;

const MAX_GUESTS_PER_TYPE = 9;

/* Types pour lesquels le client choisit réellement ses heures
   (24h et quelques heures). Les autres infèrent du système. */
const NEEDS_HOURS = new Set(["vingt_quatre_heures", "plusieurs_heures"]);

const AVATARS = [
  { initials: "AK", background: "var(--color-accent-secondary)" },
  { initials: "FR", background: "var(--color-accent)" },
  { initials: "CM", background: "var(--color-accent-gold)", color: "#1a1a1a" },
];

function guestT(t: (p: string) => string, key: GuestKey, field: string): string {
  const cap = key.charAt(0).toUpperCase() + key.slice(1);
  return t(`home.guest${cap}${field}`);
}

function ProofPill({ floating = false }: { floating?: boolean }) {
  const { t } = useApp();
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
        <div className="proof-stars" aria-label={t("home.proofPillAria")}>
          {Array.from({ length: 5 }).map((_, index) => (
            <FaStar key={index} aria-hidden="true" size={13} />
          ))}
        </div>
        <p className="proof-note">{t("home.proofPillText")}</p>
      </div>
    </div>
  );
}

function GuestsField() {
  const { t } = useApp();
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

  const summary = GUEST_TYPES.map(({ key, min }) => {
    const n = counts[key];
    if (n === 0) return null;
    const word = n > 1
      ? guestT(t, key, "Plural")
      : guestT(t, key, "Singular");
    return `${n} ${word}`;
  })
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="search-field guests" ref={wrapRef}>
      <span className="search-label">{t("home.guestsLabel")}</span>
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
          aria-label={t("home.guestsAria")}
        >
          {GUEST_TYPES.map(({ key, min }) => (
            <div key={key} className="guests-row">
              <div className="guests-type">
                <span className="guests-name">{guestT(t, key, "Name")}</span>
                <span className="guests-hint">{guestT(t, key, "Hint")}</span>
              </div>
              <div className="stepper">
                <button
                  type="button"
                  className="stepper-btn"
                  aria-label={`${t("home.stepperReduce")} ${guestT(t, key, "Partitive")}`}
                  disabled={counts[key] <= min}
                  onClick={() => change(key, min, -1)}
                >
                  <FaMinus aria-hidden="true" size={10} />
                </button>
                <span className="stepper-value stepper-value--count" aria-live="polite">
                  {counts[key]}
                </span>
                <button
                  type="button"
                  className="stepper-btn"
                  aria-label={`${t("home.stepperIncrease")} ${guestT(t, key, "Partitive")}`}
                  disabled={counts[key] >= MAX_GUESTS_PER_TYPE}
                  onClick={() => change(key, min, 1)}
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

const PROPERTY_TYPE_ENTRIES: [string, string][] = [
  ["chambre", "typeChambre"],
  ["chambre_avec_salon", "typeChambreAvecSalon"],
  ["studio", "typeStudio"],
  ["appartement_meuble", "typeAppartementMeuble"],
  ["suite", "typeSuite"],
  ["villa", "typeVilla"],
  ["duplex", "typeDuplex"],
  ["maison_entiere", "typeMaisonEntiere"],
];

const SEJOUR_ENTRIES: [string, string][] = [
  ["nuee", "sejourNuee"],
  ["journee", "sejourJournee"],
  ["vingt_quatre_heures", "sejourVingtQuatreHeures"],
  ["demi_journee", "sejourDemiJournee"],
  ["plusieurs_heures", "sejourPlusieursHeures"],
];

export function Hero() {
  const { t } = useApp();
  const [sejourType, setSejourType] = useState<string>("nuee");
  const [heureArrivee, setHeureArrivee] = useState("08:00");

  const needsHours = NEEDS_HOURS.has(sejourType);
  const is24h = sejourType === "vingt_quatre_heures";

  const heureDepartAuto = (() => {
    const [h, m] = heureArrivee.split(":").map(Number);
    const next = (h + 24) % 24;
    return `${String(next).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  })();

  return (
    <section
      aria-label={t("home.searchLabel")}
      className="px-4 pt-4 sm:px-6 sm:pt-6 lg:px-0 lg:pt-16"
    >
      <div className="hero-wrap">
        <ProofPill floating />

        <div className="hero">
          <div className="hero-content">
            <span className="hero-badge">{t("home.badge")}</span>
            <h1 className="hero-title">
              {t("home.heroTitle")}{" "}
              <span className="hero-title-accent">{t("home.heroTitleAccent")}</span>{" "}
              {t("home.heroTitleSuffix")}
            </h1>
            <p className="hero-subtitle">
              {t("home.heroSubtitle")}
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
                {t("home.stayTypeLabel")}
              </label>
              <div className="search-value">
                <FaClock aria-hidden="true" size={15} />
                <Select
                  id="type-reservation"
                  variant="field"
                  ariaLabel={t("home.stayTypeAria")}
                  name="typeReservation"
                  options={SEJOUR_ENTRIES.map(([value, key]) => ({
                    value,
                    label: t(`home.${key}`),
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
                {t("home.propertyTypeLabel")}
              </label>
              <div className="search-value">
                <Select
                  id="type-logement"
                  variant="field"
                  ariaLabel={t("home.propertyTypeAria")}
                  name="type"
                  placeholder={t("home.allTypes")}
                  defaultValue=""
                  options={[
                    { value: "", label: t("home.allTypes") },
                    ...PROPERTY_TYPE_ENTRIES.map(([value, key]) => ({
                      value,
                      label: t(`home.${key}`),
                    })),
                  ]}
                />
              </div>
            </div>

            <button type="submit" className="btn-pill btn-primary w-full lg:w-auto lg:px-10">
              {t("home.searchButton")}
            </button>

            {needsHours && (
              <div className="hours-row">
                <div className="search-field hours-field">
                  <label htmlFor="heure-arrivee" className="search-label">
                    {t("home.arrivalTimeLabel")}
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
                    {t("home.departureTimeLabel")}
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
