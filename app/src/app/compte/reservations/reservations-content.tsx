"use client";

import { useApp } from "@/components/providers/app-provider";
import { DocumentTitle } from "@/components/seo/document-title";

export function ReservationsSection() {
  const { t } = useApp();

  return (
    <div className="container-caba py-12">
      <DocumentTitle titleKey="meta.reservationsTitle" />
      <h1 className="heading-display text-2xl mb-4">
        {t("accountResa.title")}
      </h1>
      <p className="text-text-secondary">
        {t("accountResa.comingSoon")} {t("accountResa.description")}
      </p>
    </div>
  );
}