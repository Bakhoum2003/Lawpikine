import { getOrderStatusLabel } from "../../data/ordersDemo";

const TONES = {
  pending: "bg-orange-50 text-orange-600",
  delivered: "bg-green-50 text-law-green",
  cancelled: "bg-red-50 text-law-red",
};

// Badge de statut d'une commande : En cours (orange), Livrée (vert), Annulée (rouge).
export default function OrderStatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none ${TONES[status] ?? "bg-gray-100 text-gray-600"}`}>
      {getOrderStatusLabel(status)}
    </span>
  );
}
