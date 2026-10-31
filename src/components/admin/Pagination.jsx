import Icon from "../common/Icon";

function pageItems(page, count) {
  if (count <= 5) return Array.from({ length: count }, (_, index) => index + 1);
  const items = new Set([1, count, page - 1, page, page + 1]);
  const sorted = [...items].filter((item) => item >= 1 && item <= count).sort((a, b) => a - b);
  return sorted.flatMap((item, index) => (index > 0 && item - sorted[index - 1] > 1 ? ["…", item] : [item]));
}

export default function Pagination({ page, pageCount, onPage }) {
  if (pageCount <= 1) return null;
  const arrow = "flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-law-green";
  return (
    <nav aria-label="Pagination" className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <span className="hidden w-24 sm:block" aria-hidden="true" />
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Page précédente" className={arrow}>
          <Icon name="lucide:chevron-left" width={16} />
        </button>
        {pageItems(page, pageCount).map((item, index) =>
          item === "…" ? (
            <span key={`gap-${index}`} className="px-1 text-sm text-gray-400" aria-hidden="true">…</span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPage(item)}
              aria-label={`Page ${item}`}
              aria-current={item === page ? "page" : undefined}
              className={`h-8 min-w-8 rounded-md px-2 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-law-green ${item === page ? "bg-law-red text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              {item}
            </button>
          )
        )}
        <button type="button" onClick={() => onPage(page + 1)} disabled={page >= pageCount} aria-label="Page suivante" className={arrow}>
          <Icon name="lucide:chevron-right" width={16} />
        </button>
      </div>
      <p className="w-24 text-xs text-gray-500 sm:text-right">Page {page} sur {pageCount}</p>
    </nav>
  );
}
