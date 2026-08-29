"use client";

import Link from "next/link";
import { PhotoAside } from "@/components/auth/photo-aside";
import { useApp } from "@/components/providers/app-provider";

export function TokenInvalide() {
  const { t } = useApp();
  return (
    <div className="auth-min">
      <div className="auth-panel">
        <div className="auth-main">
          <p className="auth-eyebrow">{t("resetpwd.tokenInvalidEyebrow")}</p>
          <h1 className="auth-display auth-display--sm">{t("resetpwd.tokenInvalidTitle")}</h1>
          <p className="auth-subtitle-v2">
            {t("resetpwd.tokenInvalidMessage")}
          </p>
          <Link href="/mot-de-passe-oublie" className="auth-btn auth-btn--link">
            {t("resetpwd.tokenInvalidAction")}
          </Link>
        </div>
        <PhotoAside />
      </div>
    </div>
  );
}
