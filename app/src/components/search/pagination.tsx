"use client";

import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { useApp } from "@/components/providers/app-provider";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  gridId: string;
}

export function Pagination({ page, totalPages, onPageChange, gridId }: PaginationProps) {
  const { t } = useApp();
  if (totalPages <= 1) return null;

  const scrollToGrid = () => {
    document.getElementById(gridId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goTo = (p: number) => {
    onPageChange(p);
    setTimeout(scrollToGrid, 50);
  };

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <nav className="pagination" aria-label={t("logements.pagination")}>
      <button
        type="button"
        className="pagination-btn pagination-arrow"
        disabled={page <= 1}
        onClick={() => goTo(page - 1)}
        aria-label={t("logements.prevPage")}
      >
        <FaChevronLeft aria-hidden="true" size={12} />
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="pagination-dots">…</span>
        ) : (
          <button
            key={p}
            type="button"
            className={`pagination-btn ${p === page ? "pagination-btn--active" : ""}`}
            onClick={() => goTo(p)}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        className="pagination-btn pagination-arrow"
        disabled={page >= totalPages}
        onClick={() => goTo(page + 1)}
        aria-label={t("logements.nextPage")}
      >
        <FaChevronRight aria-hidden="true" size={12} />
      </button>
    </nav>
  );
}
