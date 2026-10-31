// Badge « En stock » / « Rupture » (réutilisable pour la page Stock).
export default function StatusBadge({ inStock }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none ${inStock ? "bg-green-50 text-law-green" : "bg-red-50 text-law-red"}`}>
      {inStock ? "En stock" : "Rupture"}
    </span>
  );
}
