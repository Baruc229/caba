"use client";

import { useState } from "react";
import {
  FaChevronDown,
  FaClock,
  FaStar,
} from "react-icons/fa6";
import { Select } from "@/components/ui/select";
import { DateRangeField } from "@/components/ui/double-calendar";
import { GuestsField } from "@/components/ui/guests-field";
import { useApp } from "@/components/providers/app-provider";
import { DocumentTitle } from "@/components/seo/document-title";

const TODAY = new Date().toISOString().slice(0, 10);

/* Types pour lesquels le client choisit réellement ses heures
   (24h, quelques heures et heure). Les autres infèrent du système. */
const NEEDS_HOURS = new Set(["vingt_quatre_heures", "plusieurs_heures", "heure"]);

const AVATARS = [
  { initials: "AK", background: "var(--color-accent-secondary)" },
  { initials: "FR", background: "var(--color-accent)" },
  { initials: "CM", background: "var(--color-accent-gold)", color: "#1a1a1a" },
];

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
  ["heure", "sejourHeure"],
  ["semaine", "sejourSemaine"],
  ["mois", "sejourMois"],
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
      <DocumentTitle titleKey="meta.accueilTitle" descKey="meta.globalDesc" />
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
