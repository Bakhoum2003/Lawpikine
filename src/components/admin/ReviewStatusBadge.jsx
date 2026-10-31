import { getReviewStatusLabel } from "../../data/reviewsDemo";

const TONES = {
  approved: "bg-green-50 text-law-green",
  pending: "bg-orange-50 text-orange-600",
  refused: "bg-red-50 text-law-red",
};

// Badge d'avis : Approuvé (vert), En attente (orange), Refusé (rouge).
export default function ReviewStatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none ${TONES[status] ?? "bg-gray-100 text-gray-600"}`}>
      {getReviewStatusLabel(status)}
    </span>
  );
}
