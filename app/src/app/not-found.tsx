import type { Metadata } from "next";
import { NotFoundContent } from "./not-found-content";

export const metadata: Metadata = {
  title: "Page introuvable (404) — Caba Résidence",
  description:
    "La page que vous recherchez n'existe pas ou a été déplacée. Retrouvez nos logements à louer à Cotonou, Bénin.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <NotFoundContent />;
}