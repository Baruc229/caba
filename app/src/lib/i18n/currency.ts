import { rates, type Lang } from "./dictionaries";

export type Currency = "EUR" | "FCFA";

export const CURRENCIES: Currency[] = ["EUR", "FCFA"];

const ROUND = (n: number) => Math.round(n);

/**
 * Convertit un montant depuis sa devise native vers la devise cible.
 * Le taux CFA est fixe (1 EUR = 655.957 FCFA). Le résultat est arrondi
 * à l'unité (pas de décimales, comme demandé).
 */
export function convertAmount(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  if (!fromCurrency || !toCurrency) return ROUND(amount);
  if (fromCurrency === toCurrency) return ROUND(amount);
  const amt = Number(amount);
  if (!Number.isFinite(amt) || amt <= 0) return amt;

  // Ramène tout en EUR d'abord
  let eur = amt;
  if (fromCurrency.toUpperCase() === "FCFA") {
    eur = amt * rates.FCFA_TO_EUR;
  } else if (fromCurrency.toUpperCase() !== "EUR") {
    // Devise inconnue : on suppose qu'elle est déjà la cible
    return ROUND(amt);
  }

  if (toCurrency.toUpperCase() === "FCFA") {
    return ROUND(eur * rates.EUR_TO_FCFA);
  }
  return ROUND(eur);
}

/**
 * Formate un montant (déjà converti) dans la langue choisie, sans décimales.
 */
export function formatAmount(amount: number, lang: Lang): string {
  return new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-US", {
    maximumFractionDigits: 0,
  }).format(ROUND(amount));
}

/**
 * Nombre de chiffres significatifs pour les FCFA (montants élevés).
 * Retourne le montant arrondi à une valeur "propre" si demandé.
 */
