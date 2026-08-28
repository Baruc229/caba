"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { dictionaries, type Lang } from "@/lib/i18n/dictionaries";
import type { Currency } from "@/lib/i18n/currency";
import { useCurrency } from "@/components/layout/currency-switcher";

interface AppContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  t: (path: string) => string;
}

const AppContext = createContext<AppContextValue | null>(null);

function resolvePath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function getInitialLang(): Lang {
  if (typeof window === "undefined") return "fr";
  const stored = window.localStorage.getItem("caba-lang");
  return stored === "en" || stored === "fr" ? stored : "fr";
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useCurrency();
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  const value = useMemo<AppContextValue>(() => {
    const setLang = (next: Lang) => {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("caba-lang", next);
      }
      setLangState(next);
    };

    return {
      lang,
      currency,
      setCurrency,
      setLang,
      t: (path: string) => {
        const val = resolvePath(dictionaries[lang], path);
        return typeof val === "string" ? val : path;
      },
    };
  }, [lang, currency, setCurrency]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within AppProvider");
  }
  return ctx;
}
