"use client";

import type { Currency } from "./currency-switcher";

export function MiniLangSwitcher({
  lang,
  onChange,
}: {
  lang: "fr" | "en";
  onChange: (lang: "fr" | "en") => void;
}) {
  return (
    <button
      type="button"
      className="mini-switch"
      aria-label={`Langue : ${lang === "fr" ? "français" : "anglais"} (basculer)`}
      onClick={() => onChange(lang === "fr" ? "en" : "fr")}
    >
      {lang === "fr" ? "FR" : "EN"}
    </button>
  );
}

export function MiniCurrencySwitcher({
  currency,
  onChange,
}: {
  currency: Currency;
  onChange: (currency: Currency) => void;
}) {
  return (
    <button
      type="button"
      className="mini-switch"
      aria-label={`Devise : ${currency} (basculer)`}
      onClick={() => onChange(currency === "EUR" ? "FCFA" : "EUR")}
    >
      {currency === "EUR" ? "€" : "FCFA"}
    </button>
  );
}
