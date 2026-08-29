"use client";

import { useEffect } from "react";
import { useApp } from "@/components/providers/app-provider";

/**
 * Met à jour dynamiquement le titre de l'onglet, la meta description
 * et l'attribut lang du <html> selon la langue choisie (localStorage).
 * Le SSR affiche d'abord le titre français par défaut ; dès l'hydratation,
 * le titre bascule dans la langue active.
 */
export function DocumentTitle({
  titleKey,
  descKey,
}: {
  titleKey: string;
  descKey?: string;
}) {
  const { t, lang } = useApp();

  useEffect(() => {
    const title = t(titleKey);
    document.title = title;

    if (descKey) {
      const desc = t(descKey);
      let meta = document.querySelector<HTMLMetaElement>(
        'meta[name="description"]'
      );
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "description";
        document.head.appendChild(meta);
      }
      meta.content = desc;
    }

    document.documentElement.lang = lang === "fr" ? "fr" : "en";
  }, [titleKey, descKey, lang, t]);

  return null;
}
