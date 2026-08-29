"use client";

import { useApp } from "@/components/providers/app-provider";

export function FavorisSection() {
  const { t } = useApp();

  return (
    <div className="container-caba py-12">
      <h1 className="heading-display text-2xl mb-4">
        {t("accountFav.title")}
      </h1>
      <p className="text-text-secondary">
        {t("accountFav.comingSoon")} {t("accountFav.description")}
      </p>
    </div>
  );
}