import { useEffect, useState } from "react";

export interface AvailabilityDayInfo {
  statut: string;
  libelle?: string;
}

export interface MonthRefInput {
  year: number;
  month: number;
}

interface CacheEntry {
  days: Record<string, AvailabilityDayInfo>;
  fetchedAt: number;
}

interface AvailabilityState {
  key: string;
  loading: boolean;
  days: Record<string, AvailabilityDayInfo> | null;
}

const CACHE_TTL_MS = 5 * 60 * 1000;
const monthCache = new Map<string, CacheEntry>();

function monthKey(propertyId: string, ref: MonthRefInput): string {
  return `${propertyId}|${ref.year}|${ref.month}`;
}

function readCache(key: string): CacheEntry | null {
  const entry = monthCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) {
    monthCache.delete(key);
    return null;
  }
  return entry;
}

function normalizePayload(
  payload: unknown
): Record<string, AvailabilityDayInfo> {
  const out: Record<string, AvailabilityDayInfo> = {};
  const days = (
    payload as {
      days?: { date: string; statut: string; libelle?: string | null }[] | null;
    }
  )?.days;
  for (const day of days ?? []) {
    out[day.date] = { statut: day.statut, libelle: day.libelle ?? "" };
  }
  return out;
}

/**
 * Charge les statuts de disponibilité d'un mois via `/api/availability`,
 * avec un cache partagé : les calendriers de disponibilité et le sélecteur
 * compact de réservation lisent exactement la même source de données.
 */
export function useAvailabilityMonth(propertyId: string, ref: MonthRefInput) {
  const currentKey = monthKey(propertyId, ref);
  const initial = readCache(currentKey);

  const [state, setState] = useState<AvailabilityState>(() => ({
    key: currentKey,
    loading: initial === null,
    days: initial?.days ?? null,
  }));

  useEffect(() => {
    const key = `${propertyId}|${ref.year}|${ref.month}`;
    const cached = readCache(key);
    const controller = new AbortController();
    let cancelled = false;

    const apply = (patch: Partial<Pick<AvailabilityState, "loading" | "days">>) => {
      if (cancelled) return;
      setState((s) => ({ ...s, key, ...patch }));
    };

    if (cached) {
      queueMicrotask(() => apply({ loading: false, days: cached.days }));
      return () => {
        cancelled = true;
      };
    }

    queueMicrotask(() => apply({ loading: true }));

    fetch(
      `/api/availability?propertyId=${propertyId}&year=${ref.year}&month=${ref.month}`,
      { signal: controller.signal }
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((payload) => {
        if (cancelled) return;
        const days = normalizePayload(payload);
        monthCache.set(key, { days, fetchedAt: Date.now() });
        apply({ loading: false, days });
      })
      .catch(() => {
        if (!cancelled) apply({ loading: false });
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [propertyId, ref.year, ref.month]);

  return { loading: state.loading, days: state.days };
}