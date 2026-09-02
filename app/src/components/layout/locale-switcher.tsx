"use client";

import type { FC } from "react";
import { Segmented } from "@/components/ui/segmented";
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
  return (
    <div className="flex items-center gap-2">
      <Segmented
        ariaLabel="Choix de la langue"
        options={[
          { value: "fr", label: "FR" },
          { value: "en", label: "EN" },
        ]}
        value={lang}
        onChange={onLangChange}
      />
      <Segmented
        ariaLabel="Choix de la devise"
        options={[
          { value: "EUR", label: "EUR" },
          { value: "FCFA", label: "FCFA" },
        ]}
        value={currency}
        onChange={onCurrencyChange}
      />
    </div>
  );
};
