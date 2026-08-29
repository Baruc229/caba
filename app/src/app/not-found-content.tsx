"use client";

import Link from "next/link";
import { FaArrowRight, FaHouse } from "react-icons/fa6";
import { useApp } from "@/components/providers/app-provider";

export function NotFoundContent() {
  const { t } = useApp();

  return (
    <section
      aria-label={t("notfound.ariaLabel")}
      className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:py-24"
    >
      <div className="w-full max-w-[640px] rounded-2xl border-[0.5px] border-border-subtle bg-bg-card p-8 text-center shadow-card sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent-secondary">
          {t("notfound.error404")}
        </p>
        <h1 className="heading-display mt-4 text-5xl sm:text-7xl">
          {t("notfound.title")}{" "}
          <span className="text-accent-gold">{t("notfound.notFound")}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-md">{t("notfound.message")}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn-pill btn-primary px-8">
            <FaHouse aria-hidden="true" />
            {t("notfound.backHome")}
          </Link>
          <Link
            href="/logements"
            className="btn-pill border border-border-input bg-bg-card px-8 text-text-primary transition-colors duration-200 hover:text-accent-secondary"
          >
            {t("notfound.viewProperties")}
            <FaArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}