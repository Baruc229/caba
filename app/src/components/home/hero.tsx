"use client";

import { useRef, useState } from "react";
import {
  FaCalendarDays,
  FaLocationDot,
  FaMinus,
  FaPlus,
  FaStar,
} from "react-icons/fa6";

const TODAY = new Date().toISOString().slice(0, 10);

const TABS = [
  { id: "logements", label: "Logements" },
  { id: "chambres", label: "Chambres" },
] as const;

type TabId = (typeof TABS)[number]["id"];

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
  const [guests, setGuests] = useState(2);

  return (
    <div className="search-field">
      <span className="search-label" id="voyageurs-label">
        Voyageurs
      </span>
      <div className="stepper" role="group" aria-labelledby="voyageurs-label">
        <button
          type="button"
          className="stepper-btn"
          aria-label="Réduire le nombre de voyageurs"
          disabled={guests <= 1}
          onClick={() => setGuests((g) => Math.max(1, g - 1))}
        >
          <FaMinus aria-hidden="true" size={10} />
        </button>
        <span className="stepper-value" aria-live="polite">
          {guests} {guests > 1 ? "voyageurs" : "voyageur"}
        </span>
        <button
          type="button"
          className="stepper-btn"
          aria-label="Augmenter le nombre de voyageurs"
          disabled={guests >= 20}
          onClick={() => setGuests((g) => Math.min(20, g + 1))}
        >
          <FaPlus aria-hidden="true" size={10} />
        </button>
        <input type="hidden" name="voyageurs" value={guests} />
      </div>
    </div>
  );
}

export function Hero() {
  const [activeTab, setActiveTab] = useState<TabId>("logements");

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
          </div>

          <div
            id="search-fields"
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            className="search-fields"
          >
            <div className="search-field">
              <label htmlFor="destination" className="search-label">
                Destination
              </label>
              <div className="search-value">
                <FaLocationDot aria-hidden="true" size={15} />
                <input
                  id="destination"
                  name="destination"
                  type="text"
                  placeholder="Cotonou, Bénin"
                  autoComplete="off"
                  className="search-input"
                />
              </div>
            </div>

            <DateField id="arrivee" name="arrivee" label="Date d'arrivée" min={TODAY} />

            <DateField id="depart" name="depart" label="Date de départ" />

            <GuestsField />

            <button type="submit" className="btn-pill btn-primary w-full lg:w-auto lg:px-10">
              Rechercher
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
