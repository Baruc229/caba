"use client";

import { useApp } from "@/components/providers/app-provider";
import { DocumentTitle } from "@/components/seo/document-title";

export function ProfilSection() {
  const { t } = useApp();

  return (
    <div className="container-caba py-12">
      <DocumentTitle titleKey="meta.profilTitle" />
      <h1 className="heading-display text-2xl mb-4">
        {t("accountProfil.title")}
      </h1>
      <p className="text-text-secondary">
        {t("accountProfil.comingSoon")} {t("accountProfil.description")}
      </p>
    </div>
  );
}