export interface MonthRef {
  year: number;
  month: number;
}

export function leadingBlanks(year: number, month: number): number {
  const jsDay = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  return (jsDay + 6) % 7;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function toISO(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function addMonths(ref: MonthRef, delta: number): MonthRef {
  const total = ref.year * 12 + (ref.month - 1) + delta;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}

export function nightsBetween(arrivee: string, depart: string): number {
  const a = new Date(`${arrivee}T00:00:00Z`).getTime();
  const d = new Date(`${depart}T00:00:00Z`).getTime();
  return Math.max(0, Math.round((d - a) / 86_400_000));
}

/**
 * Machine à états de sélection : clic arrivée puis clic départ.
 * Les deux déjà choisis → on recommence sur la date cliquée.
 */
export function nextSelection(
  arrivee: string,
  depart: string,
  clicked: string
): { arrivee: string; depart: string } {
  if (!arrivee) return { arrivee: clicked, depart: "" };
  if (!depart) {
    return clicked <= arrivee
      ? { arrivee: clicked, depart: "" }
      : { arrivee, depart: clicked };
  }
  return { arrivee: clicked, depart: "" };
}

export type RangeRole = "start" | "between" | "end" | null;

export function rangeRole(
  arrivee: string,
  depart: string,
  date: string
): RangeRole {
  if (arrivee && depart && arrivee <= date && date <= depart) {
    if (date === arrivee) return "start";
    if (date === depart) return "end";
    return "between";
  }
  if (arrivee && !depart && date === arrivee) return "start";
  return null;
}