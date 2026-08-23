"use client";

import { Fragment, useSyncExternalStore } from "react";

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
    <div
      className={`flex items-center gap-1 text-sm ${className}`}
      role="group"
      aria-label="Choix de la devise"
    >
      {CURRENCIES.map((item, index) => (
        <Fragment key={item}>
          {index > 0 && (
            <span className="text-border-subtle" aria-hidden="true">
              |
            </span>
          )}
          <button
            type="button"
            onClick={() => onChange(item)}
            aria-pressed={currency === item}
            className={`px-1 transition-colors ${
              currency === item
                ? "font-semibold text-text-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {item}
          </button>
        </Fragment>
      ))}
    </div>
  );
}
