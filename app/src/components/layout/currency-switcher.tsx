"use client";

import { useSyncExternalStore } from "react";
import { Segmented } from "@/components/ui/segmented";

export const CURRENCIES = ["EUR", "FCFA"] as const;

export type Currency = (typeof CURRENCIES)[number];

const STORAGE_KEY = "caba-devise";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function getSnapshot(): Currency {
  return window.localStorage.getItem(STORAGE_KEY) === "FCFA" ? "FCFA" : "EUR";
}

function getServerSnapshot(): Currency {
  return "EUR";
}

export function useCurrency() {
  const currency = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setCurrency = (value: Currency) => {
    if (value !== getSnapshot()) {
      window.localStorage.setItem(STORAGE_KEY, value);
      listeners.forEach((listener) => listener());
    }
  };

  return [currency, setCurrency] as const;
}

export function CurrencySwitcher({
  currency,
  onChange,
  className = "",
}: {
  currency: Currency;
  onChange: (currency: Currency) => void;
  className?: string;
}) {
  return (
    <Segmented
      ariaLabel="Choix de la devise"
      className={className}
      options={[
        { value: "EUR", label: "EUR" },
        { value: "FCFA", label: "FCFA" },
      ]}
      value={currency}
      onChange={onChange}
    />
  );
}
