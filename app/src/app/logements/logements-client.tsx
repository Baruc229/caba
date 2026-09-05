"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { SearchResult, SearchResultItem } from "@/lib/services/availability";
import { SearchSummaryBar } from "@/components/search/search-summary-bar";
import { PropertyCard } from "@/components/search/property-card";
import { FilterPanel, type FilterState } from "@/components/search/filter-panel";
import { SortBar } from "@/components/search/sort-bar";
import { Pagination } from "@/components/search/pagination";
import { SkeletonCard } from "@/components/search/skeleton-card";
import { useApp } from "@/components/providers/app-provider";
import { DocumentTitle } from "@/components/seo/document-title";

const LIMIT = 12;

const SORT_VALUES = ["pertinence", "prix_croissant", "prix_decroissant", "note", "newest"];

interface LogementsClientProps {
  initialAdultes: number;
  initialEnfants: number;
  initialBebes: number;
  initialTypeReservation: string;
  initialHeureArrivee: string;
  initialHeureDepart: string;
  initialTri: string;
  initialPage: number;
  initialPublished: SearchResultItem[];
}

function intParam(value: string | string[] | null | undefined, fallback: number): number {
  if (typeof value !== "string") return fallback;
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

export function LogementsClient({
  initialAdultes,
  initialEnfants,
  initialBebes,
  initialTypeReservation,
  initialHeureArrivee,
  initialHeureDepart,
  initialTri,
  initialPage,
  initialPublished,
}: LogementsClientProps) {
  const { t } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /* ── L'URL est la source de vérité ─────────────────────────── */
  const arrivee = searchParams.get("arrivee") ?? "";
  const depart = searchParams.get("depart") ?? "";
  const adultes = intParam(searchParams.get("adultes"), initialAdultes);
  const enfants = intParam(searchParams.get("enfants"), initialEnfants);
  const bebes = intParam(searchParams.get("bebes"), initialBebes);
  const type = searchParams.get("type") ?? "";
  const typeReservation = searchParams.get("typeReservation") ?? initialTypeReservation;
  const heureArrivee = searchParams.get("heureArrivee") ?? initialHeureArrivee;
  const heureDepart = searchParams.get("heureDepart") ?? initialHeureDepart;
  const tri = searchParams.get("tri") ?? initialTri;
  const page = Math.max(1, intParam(searchParams.get("page"), initialPage));

  const hasSearch = Boolean(arrivee && depart);

  const filters = useMemo<FilterState>(() => {
    const typesParam = searchParams.get("type");
    const types =
      typesParam && typesParam !== "" ? typesParam.split(",").filter(Boolean) : [];
    const equipementsParam = searchParams.get("equipements");
    const equipements = equipementsParam
      ? equipementsParam.split(",").filter(Boolean)
      : [];
    return {
      types,
      chambresMin: intParam(searchParams.get("chambres"), 0),
      litsMin: intParam(searchParams.get("lits"), 0),
      prixMin: intParam(searchParams.get("prixMin"), 0),
      prixMax: intParam(searchParams.get("prixMax"), 0),
      equipements,
    };
  }, [searchParams]);

  /* ── Résultats (état local piloté par l'URL) ───────────────── */
  const [results, setResults] = useState<SearchResultItem[]>(initialPublished ?? []);
  const [total, setTotal] = useState(initialPublished?.length ?? 0);
  const [totalPages, setTotalPages] = useState(
    Math.max(1, Math.ceil((initialPublished?.length ?? 0) / LIMIT))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ── Options de filtres (types / équipements) ──────────────── */
  const [filterOptions, setFilterOptions] = useState<{
    types: Array<{ type: string; count: number }>;
    equipements: Array<{ id: string; nom: string }>;
  }>({ types: [], equipements: [] });

  useEffect(() => {
    fetch("/api/search/filters")
      .then((r) => r.json())
      .then((data) => {
        if (data.types && data.equipements) setFilterOptions(data);
      })
      .catch(() => {});
  }, []);

  /* ── Mise à jour de l'URL ──────────────────────────────────── */
  const syncParams = useCallback(
    (patch: Record<string, string | number | null>, resetPage = false) => {
      const params = new URLSearchParams(searchParams.toString());
      const preset = Object.entries(patch);
      for (const [key, value] of preset) {
        if (value === null || value === "" || value === 0 || value === "0") params.delete(key);
        else params.set(key, String(value));
      }
      if (resetPage) params.delete("page");
      // Garde un tri valide
      if (!SORT_VALUES.includes(params.get("tri") ?? "")) params.delete("tri");
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  /* ── Requête serveur ───────────────────────────────────────── */
  const searchKey = useMemo(
    () =>
      JSON.stringify([
        hasSearch,
        arrivee,
        depart,
        adultes,
        enfants,
        bebes,
        type,
        typeReservation,
        heureArrivee,
        heureDepart,
        tri,
        page,
        filters.types,
        filters.chambresMin,
        filters.litsMin,
        filters.prixMin,
        filters.prixMax,
        filters.equipements,
      ]),
    [
      hasSearch,
      arrivee,
      depart,
      adultes,
      enfants,
      bebes,
      type,
      typeReservation,
      heureArrivee,
      heureDepart,
      tri,
      page,
      filters,
    ]
  );

  useEffect(() => {
    if (!hasSearch) return;

    let cancelled = false;
    // Chargement transitoire avant requête : pattern de fetch accepté par React.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.set("arrivee", arrivee);
    params.set("depart", depart);
    params.set("adultes", String(Math.max(1, adultes)));
    if (enfants > 0) params.set("enfants", String(enfants));
    if (bebes > 0) params.set("bebes", String(bebes));
    if (typeReservation) params.set("typeReservation", typeReservation);
    if (heureArrivee) params.set("heureArrivee", heureArrivee);
    if (heureDepart) params.set("heureDepart", heureDepart);
    if (type) params.set("type", type);
    params.set("chambres", String(filters.chambresMin));
    params.set("lits", String(filters.litsMin));
    if (filters.prixMin > 0) params.set("prixMin", String(filters.prixMin));
    if (filters.prixMax > 0) params.set("prixMax", String(filters.prixMax));
    if (filters.equipements.length > 0) params.set("equipements", filters.equipements.join(","));
    params.set("tri", tri);
    params.set("page", String(page));
    params.set("limit", String(LIMIT));

    fetch(`/api/search?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("bad status");
        return res.json() as Promise<SearchResult>;
      })
      .then((data) => {
        if (cancelled) return;
        setResults(data.results);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      })
      .catch(() => {
        if (!cancelled) setError(t("logements.error"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKey]);

  /* ── Sans recherche : filtre + tri côté client (SEO/entrée directe) ── */
  const clientResult = useMemo(() => {
    if (hasSearch) return null;
    let filtered = initialPublished;
    if (filters.types.length > 0) filtered = filtered.filter((i) => filters.types.includes(i.type));
    if (filters.chambresMin > 0) filtered = filtered.filter((i) => i.nombreChambres >= filters.chambresMin);
    if (filters.litsMin > 0) filtered = filtered.filter((i) => i.nombreLits >= filters.litsMin);
    if (filters.equipements.length > 0) {
      const names = new Set(
        filterOptions.equipements
          .filter((e) => filters.equipements.includes(e.id))
          .map((e) => e.nom)
      );
      if (names.size > 0) {
        filtered = filtered.filter((i) => i.equipements.some((eq) => names.has(eq)));
      }
    }
    if (filters.prixMin > 0) filtered = filtered.filter((i) => (i.prixParNuit || 0) >= filters.prixMin);
    if (filters.prixMax > 0) filtered = filtered.filter((i) => (i.prixParNuit || 0) <= filters.prixMax);

    switch (tri) {
      case "prix_croissant":
        filtered = [...filtered].sort((a, b) => (a.prixParNuit || 0) - (b.prixParNuit || 0));
        break;
      case "prix_decroissant":
        filtered = [...filtered].sort((a, b) => (b.prixParNuit || 0) - (a.prixParNuit || 0));
        break;
      case "note":
        filtered = [...filtered].sort((a, b) => (b.noteMoyenne ?? 0) - (a.noteMoyenne ?? 0));
        break;
    }

    const totalCount = filtered.length;
    return {
      items: filtered.slice((page - 1) * LIMIT, page * LIMIT),
      total: totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / LIMIT)),
    };
  }, [hasSearch, initialPublished, filters, tri, page, filterOptions]);

  const shownResults = hasSearch ? results : (clientResult?.items ?? []);
  const shownTotal = hasSearch ? total : (clientResult?.total ?? 0);
  const shownTotalPages = hasSearch ? totalPages : (clientResult?.totalPages ?? 1);
  const shownLoading = hasSearch && loading;

  /* ── Handlers ──────────────────────────────────────────────── */
  const handleFiltersChange = (next: FilterState) => {
    syncParams(
      {
        type: next.types.length > 0 ? next.types.join(",") : null,
        chambres: next.chambresMin,
        lits: next.litsMin,
        prixMin: next.prixMin,
        prixMax: next.prixMax,
        equipements: next.equipements.length > 0 ? next.equipements.join(",") : null,
      },
      true
    );
  };

  const handleTriChange = (nextTri: string) => {
    if (nextTri === tri) return;
    syncParams({ tri: nextTri }, true);
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage === page) return;
    syncParams({ page: nextPage });
  };

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const gridId = "logements-grid";

  return (
    <section className="logements-page" aria-label={t("search.formAriaLabel")}>
      <DocumentTitle titleKey="meta.logementsTitle" descKey="meta.logementsDesc" />

      <div className="logements-search-wrap">
        <SearchSummaryBar
          initialArrivee={arrivee}
          initialDepart={depart}
          initialAdultes={adultes}
          initialEnfants={enfants}
          initialBebes={bebes}
          initialType={type}
          initialTypeReservation={typeReservation}
          initialHeureArrivee={heureArrivee}
          initialHeureDepart={heureDepart}
        />
      </div>

      <div className="logements-content">
        <FilterPanel
          filters={filters}
          onChange={handleFiltersChange}
          availableTypes={filterOptions.types.map((o) => o.type)}
          availableEquipements={filterOptions.equipements}
          mobileOpen={mobileFiltersOpen}
          onCloseMobile={() => setMobileFiltersOpen(false)}
        />

        <div className="logements-main">
          <SortBar
            total={shownTotal}
            tri={tri}
            onTriChange={handleTriChange}
            onOpenFilters={() => setMobileFiltersOpen(true)}
          />

          <div id={gridId} className="logements-grid" role="list">
            {shownLoading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            ) : error ? (
              <div className="logements-error">
                <p>{error}</p>
                <button type="button" className="logements-retry" onClick={() => syncParams({}, false)}>
                  {t("logements.retry")}
                </button>
              </div>
            ) : shownResults.length === 0 ? (
              <div className="logements-empty">
                <p className="logements-empty-title">{t("logements.emptyTitle")}</p>
                <p className="logements-empty-desc">{t("logements.emptyDesc")}</p>
              </div>
            ) : (
              shownResults.map((item) => <PropertyCard key={item.id} item={item} />)
            )}
          </div>

          {!shownLoading && shownResults.length > 0 && (
            <Pagination page={page} totalPages={shownTotalPages} onPageChange={handlePageChange} gridId={gridId} />
          )}
        </div>
      </div>
    </section>
  );
}