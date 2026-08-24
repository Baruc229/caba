// Convention stockage: les colonnes timestamp (sans timezone) contiennent
// l'heure murale du Bénin (Africa/Porto-Novo, UTC+3 toute l'année) encodée
// en composantes UTC. Indépendant du fuseau du serveur.

export function beninDayStart(dateStr: string): Date {
  return beninDateTime(dateStr, "00:00");
}

export function beninDateTime(dateStr: string, timeStr?: string | null): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = (timeStr && /^\d{1,2}:\d{2}/.test(timeStr) ? timeStr : "00:00")
    .split(":")
    .map(Number);
  return new Date(Date.UTC(y, m - 1, d, hh, mm));
}

export function beninDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function beninTimeString(date: Date): string {
  return date.toISOString().slice(11, 16);
}

export function addDaysBenin(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

export function nightsBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000));
}

export function hoursBetween(a: Date, b: Date): number {
  return Math.round(((b.getTime() - a.getTime()) / (60 * 60 * 1000)) * 100) / 100;
}

export function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart;
}

export function minutesFromHHmm(value: string | null | undefined): number | null {
  if (!value || !/^\d{1,2}:\d{2}$/.test(value)) return null;
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}
