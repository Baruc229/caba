import type { Metadata } from "next";
import Link from "next/link";
import { FaArrowRight, FaHouse } from "react-icons/fa6";

export const metadata: Metadata = {
  title: "Page introuvable (404) — Caba Résidence",
  description:
    "La page que vous recherchez n'existe pas ou a été déplacée. Retrouvez nos logements à louer à Cotonou, Bénin.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section
      aria-label="Page introuvable"
      className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:py-24"
    >
      <div className="w-full max-w-[640px] rounded-2xl border-[0.5px] border-border-subtle bg-bg-card p-8 text-center shadow-card sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent-secondary">
          Erreur 404
        </p>
        <h1 className="heading-display mt-4 text-5xl sm:text-7xl">
          Page <span className="text-accent-gold">introuvable</span>
        </h1>
        <p className="mx-auto mt-6 max-w-md">
          La page que vous cherchez n&apos;existe plus ou a été déplacée.
          Pas d&apos;inquiétude : vos prochaines nuits vous attendent toujours
          quelque part.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn-pill btn-primary px-8">
            <FaHouse aria-hidden="true" />
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/logements"
            className="btn-pill border border-border-input bg-bg-card px-8 text-text-primary transition-colors duration-200 hover:text-accent-secondary"
          >
            Voir les logements
            <FaArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
