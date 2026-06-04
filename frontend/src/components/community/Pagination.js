import { ChevronLeft, ChevronRight } from 'lucide-react';

function getPageNumbers(current, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = [];
  pages.push(1);

  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('...');

  pages.push(total);

  return pages;
}

export function Pagination({ currentPage, totalPages, onPageChange, totalItems, pageSize = 10 }) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);
  const rangeStart = (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalItems || totalPages * pageSize);

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      {totalItems != null && (
        <p className="text-sm text-slate-500">
          Showing {rangeStart}–{rangeEnd} of {totalItems}
        </p>
      )}

      <nav className="flex items-center gap-1" role="navigation" aria-label="Pagination">
        <button
          id="pagination-prev"
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((page, idx) =>
          page === '...' ? (
            <span
              key={`ellipsis-${idx}`}
              className="w-10 h-10 flex items-center justify-center text-sm text-slate-400"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              id={`pagination-page-${page}`}
              type="button"
              onClick={() => onPageChange(page)}
              aria-current={page === currentPage ? 'page' : undefined}
              className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-colors ${
                page === currentPage
                  ? 'bg-navy-700 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          id="pagination-next"
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
}

export default Pagination;
