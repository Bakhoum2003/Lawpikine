const STATUSES = {
  in: { label: "En stock", tone: "bg-green-50 text-law-green" },
  low: { label: "Stock faible", tone: "bg-orange-50 text-orange-600" },
  out: { label: "Rupture de stock", tone: "bg-red-50 text-law-red" },
};

export const STOCK_STATUS_LABELS = { in: STATUSES.in.label, low: STATUSES.low.label, out: STATUSES.out.label };

// Badge de stock : En stock (vert), Stock faible (orange), Rupture de stock (rouge).
export default function StockStatusBadge({ status }) {
  const { label, tone } = STATUSES[status] ?? STATUSES.in;
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none ${tone}`}>{label}</span>;
}
