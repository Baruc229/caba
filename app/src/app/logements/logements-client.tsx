"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { SearchResult, SearchResultItem } from "@/lib/services/availability";
import { SearchBarCompact } from "@/components/search/search-bar-compact";
import { PropertyCard } from "@/components/search/property-card";
import { FilterPanel, type FilterState } from "@/components/search/filter-panel";
import { SortBar } from "@/components/search/sort-bar";
import { Pagination } from "@/components/search/pagination";
import { SkeletonCard } from "@/components/search/skeleton-card";

const LIMIT = 12;

interface LogementsClientProps {
  initialArrivee: string;
  initialDepart: string;
  initialAdultes: number;
  initialEnfants: number;
  initialBebes: number;
  initialType: string;
  initialTypeReservation: string;
  initialHeureArrivee: string;
  initialHeureDepart: string;
  initialTri: string;
  initialPage: number;
}

export function LogementsClient({
  initialArrivee,
  initialDepart,
  initialAdultes,
  initialEnfants,
  initialBebes,
  initialType,
  initialTypeReservation,
  initialHeureArrivee,
  initialHeureDepart,
  initialTri,
  initialPage,
}: LogementsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const gridRef = useRef<HTMLDivElement>(null);

  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tri, setTri] = useState(initialTri);
  const [page, setPage] = useState(initialPage);
  const [filters, setFilters] = useState<FilterState>({
    types: initialType ? [initialType] : [],
    chambresMin: 0,
    litsMin: 0,
    prixMin: 0,
    prixMax: 0,
    equipements: [],
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [filterOptions, setFilterOptions] = useState<{
    types: Array<{ type: string; count: number }>;
    equipements: Array<{ id: string; nom: string }>;
  }>({ types: [], equipements: [] });

  const [, startTransition] = useTransition();

  /* Fetch filter options */
  useEffect(() => {
    fetch("/api/search/filters")
      .then((r) => r.json())
      .then((data) => {
        if (data.types) setFilterOptions(data);
      })
      .catch(() => {});
  }, []);

  /* Fetch search results */
  const doSearch = useCallback(async () => {
    if (!initialArrivee || !initialDepart) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.set("arrivee", initialArrivee);
    params.set("depart", initialDepart);
    params.set("adultes", String(initialAdultes));
    if (initialEnfants > 0) params.set("enfants", String(initialEnfants));
    if (initialBebes > 0) params.set("bebes", String(initialBebes));
    if (initialTypeReservation) params.set("typeReservation", initialTypeReservation);
    if (initialHeureArrivee) params.set("heureArrivee", initialHeureArrivee);
    if (initialHeureDepart) params.set("heureDepart", initialHeureDepart);
    params.set("tri", tri);
    params.set("page", String(page));
    params.set("limit", String(LIMIT));

    if (filters.types.length === 1) params.set("type", filters.types[0]);
    if (filters.chambresMin > 0) params.set("chambres", String(filters.chambresMin));
    if (filters.litsMin > 0) params.set("lits", String(filters.litsMin));
    if (filters.prixMin > 0) params.set("prixMin", String(filters.prixMin));
    if (filters.prixMax > 0) params.set("prixMax", String(filters.prixMax));
    if (filters.equipements.length > 0) params.set("equipements", filters.equipements.join(","));

    try {
      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) throw new Error("Erreur serveur");
      const data: SearchResult = await res.json();
      setResults(data.results);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      setError("Une erreur est survenue lors de la recherche. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }, [
    initialArrivee,
    initialDepart,
    initialAdultes,
    initialEnfants,
    initialBebes,
    initialTypeReservation,
    initialHeureArrivee,
    initialHeureDepart,
    tri,
    page,
    filters,
  ]);

  /* Trigger search on param change */
  const mountedRef = useRef(true);
  useEffect(() => {
    if (mountedRef.current) {
      mountedRef.current = false;
      doSearch();
      return;
    }
    startTransition(() => {
      doSearch();
    });
  }, [doSearch, startTransition]);

  /* Update URL when filters/tri/page change */
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tri", tri);
    params.set("page", String(page));
    if (filters.types.length === 1) {
      params.set("type", filters.types[0]);
    } else {
      params.delete("type");
    }
    if (filters.chambresMin > 0) params.set("chambres", String(filters.chambresMin));
    else params.delete("chambres");
    if (filters.litsMin > 0) params.set("lits", String(filters.litsMin));
    else params.delete("lits");
    if (filters.prixMin > 0) params.set("prixMin", String(filters.prixMin));
    else params.delete("prixMin");
    if (filters.prixMax > 0) params.set("prixMax", String(filters.prixMax));
    else params.delete("prixMax");
    if (filters.equipements.length > 0) params.set("equipements", filters.equipements.join(","));
    else params.delete("equipements");

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [tri, page, filters, pathname, router, searchParams]);

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleTriChange = (newTri: string) => {
    setTri(newTri);
    setPage(1);
  };

  return (
    <section className="logements-page" aria-label="Recherche de logements">
      <div className="logements-search-wrap">
        <SearchBarCompact
          initialArrivee={initialArrivee}
          initialDepart={initialDepart}
          initialAdultes={initialAdultes}
          initialEnfants={initialEnfants}
          initialBebes={initialBebes}
          initialType={initialType}
          initialTypeReservation={initialTypeReservation}
          initialHeureArrivee={initialHeureArrivee}
          initialHeureDepart={initialHeureDepart}
        />
      </div>

      <div className="logements-content">
        <FilterPanel
          filters={filters}
          onChange={handleFiltersChange}
          availableTypes={filterOptions.types.map((t) => t.type)}
          availableEquipements={filterOptions.equipements}
          mobileOpen={mobileFiltersOpen}
          onCloseMobile={() => setMobileFiltersOpen(false)}
        />

        <div className="logements-main">
          <SortBar
            total={total}
            tri={tri}
            onTriChange={handleTriChange}
            onOpenFilters={() => setMobileFiltersOpen(true)}
          />

          <div ref={gridRef} className="logements-grid" role="list">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            ) : error ? (
              <div className="logements-error">
                <p>{error}</p>
                <button type="button" className="logements-retry" onClick={doSearch}>
                  Réessayer
                </button>
              </div>
            ) : results.length === 0 ? (
              <div className="logements-empty">
                <p className="logements-empty-title">Aucun logement trouvé</p>
                <p className="logements-empty-desc">
                  Essayez de modifier vos critères de recherche ou vos filtres.
                </p>
              </div>
            ) : (
              results.map((item) => (
                <PropertyCard key={item.id} item={item} />
              ))
            )}
          </div>

          {!loading && results.length > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              gridRef={gridRef}
            />
          )}
        </div>
      </div>
    </section>
  );
}
