"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  /** Current page (1-based) */
  page: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items */
  total?: number;
  /** Called when a page is selected */
  onPageChange: (page: number) => void;
  /** Whether the component is in a loading state */
  loading?: boolean;
}

/**
 * Reusable pagination controls with Previous/Next buttons and page indicators.
 * Matches the lawn bowling app design system (green theme).
 */
export function Pagination({
  page,
  totalPages,
  total,
  onPageChange,
  loading,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  // Generate visible page numbers (show max 5 with ellipsis)
  const pages = getPageNumbers(page, totalPages);

  return (
    <nav
      className="flex items-center justify-between gap-4 pt-4"
      aria-label="Pagination"
    >
      <div className="text-sm text-[#3D5A3E]">
        {total != null && (
          <span>
            {total.toLocaleString()} item{total !== 1 ? "s" : ""}
          </span>
        )}
        <span className="ml-2 sm:hidden">
          Page {page}/{totalPages}
        </span>
      </div>

      <div className="flex items-center gap-1">
        {/* Previous button */}
        <button
          onClick={() => hasPrev && onPageChange(page - 1)}
          disabled={!hasPrev || loading}
          aria-label="Previous page"
          className="inline-flex items-center justify-center rounded-lg border border-[#0A2E12]/10 bg-white px-2 py-1.5 text-sm text-[#0A2E12] transition-colors hover:bg-[#0A2E12]/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:ml-1">Previous</span>
        </button>

        {/* Page number buttons (hidden on mobile) */}
        <div className="hidden items-center gap-1 sm:flex">
          {pages.map((p, idx) =>
            p === "..." ? (
              <span
                key={`ellipsis-${idx}`}
                className="px-1 text-[#3D5A3E] select-none"
              >
                &hellip;
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p as number)}
                disabled={loading}
                aria-current={p === page ? "page" : undefined}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  p === page
                    ? "bg-[#1B5E20] text-white"
                    : "text-[#0A2E12] hover:bg-[#0A2E12]/5"
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        {/* Next button */}
        <button
          onClick={() => hasNext && onPageChange(page + 1)}
          disabled={!hasNext || loading}
          aria-label="Next page"
          className="inline-flex items-center justify-center rounded-lg border border-[#0A2E12]/10 bg-white px-2 py-1.5 text-sm text-[#0A2E12] transition-colors hover:bg-[#0A2E12]/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="sr-only sm:not-sr-only sm:mr-1">Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}

/**
 * Generate an array of page numbers with ellipsis markers.
 * E.g. [1, 2, 3, 4, 5] or [1, "...", 4, 5, 6, "...", 10]
 */
function getPageNumbers(
  current: number,
  total: number
): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [];

  // Always show first page
  pages.push(1);

  if (current > 3) {
    pages.push("...");
  }

  // Show pages around current
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push("...");
  }

  // Always show last page
  pages.push(total);

  return pages;
}
