"use client";

import { useEffect, useRef, useState, type FC } from "react";
import { FaGlobe } from "react-icons/fa6";
import type { Currency } from "./currency-switcher";

interface LocaleSwitcherProps {
  lang: "fr" | "en";
  currency: Currency;
  onLangChange: (lang: "fr" | "en") => void;
  onCurrencyChange: (currency: Currency) => void;
}

export const LocaleSwitcher: FC<LocaleSwitcherProps> = ({
  lang,
  currency,
  onLangChange,
  onCurrencyChange,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="mini-switch globe-btn"
        aria-label="Langue et devise"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <FaGlobe aria-hidden="true" size={14} />
      </button>

      {open && (
        <div className="locale-popup" role="dialog" aria-label="Langue et devise">
          <div className="locale-popup-row">
            <span className="locale-popup-label">Langue</span>
            <div className="locale-popup-seg">
              <button
                type="button"
                className={`locale-seg-btn${lang === "fr" ? " is-active" : ""}`}
                onClick={() => { onLangChange("fr"); setOpen(false); }}
              >
                FR
              </button>
              <button
                type="button"
                className={`locale-seg-btn${lang === "en" ? " is-active" : ""}`}
                onClick={() => { onLangChange("en"); setOpen(false); }}
              >
                EN
              </button>
            </div>
          </div>
          <div className="locale-popup-row">
            <span className="locale-popup-label">Devise</span>
            <div className="locale-popup-seg">
              <button
                type="button"
                className={`locale-seg-btn${currency === "EUR" ? " is-active" : ""}`}
                onClick={() => { onCurrencyChange("EUR"); setOpen(false); }}
              >
                EUR
              </button>
              <button
                type="button"
                className={`locale-seg-btn${currency === "FCFA" ? " is-active" : ""}`}
                onClick={() => { onCurrencyChange("FCFA"); setOpen(false); }}
              >
                FCFA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
