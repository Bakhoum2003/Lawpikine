import { useEffect, useRef } from "react";
import Icon from "../common/Icon";
import StarRating from "./StarRating";
import ReviewStatusBadge from "./ReviewStatusBadge";
import ReviewAvatar from "./ReviewAvatar";

const dateTime = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });

// Détails d'un avis : commentaire complet et actions Approuver / Refuser.
export default function ReviewDetailsModal({ review, productName, busy = false, onStatus, onClose }) {
  const closeRef = useRef(null);
  const closeHandler = useRef(onClose);
  closeHandler.current = onClose;

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event) => event.key === "Escape" && closeHandler.current();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[85] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="review-title" className="slide-in flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-gray-100 p-5">
          <h2 id="review-title" className="text-lg font-bold text-gray-900">Détails de l'avis</h2>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Fermer" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-law-green">
            <Icon name="lucide:x" width={18} />
          </button>
        </header>

        <div className="space-y-5 overflow-y-auto p-5">
          {review.demo && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">Avis de démonstration : il n'a pas été écrit par un vrai client.</p>}
          <div className="flex items-center gap-3">
            <ReviewAvatar name={review.customerName} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-gray-900">{review.customerName}</p>
              <p className="text-xs text-gray-500">Publié le {dateTime.format(new Date(review.createdAt))}</p>
            </div>
            <ReviewStatusBadge status={review.status} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
            <StarRating rating={review.rating} size={20} />
            <span>{productName ? <>Produit : <strong className="text-gray-900">{productName}</strong></> : "Produit non précisé"}</span>
          </div>
          <p className="whitespace-pre-line break-words rounded-xl bg-gray-50 p-4 text-sm leading-6 text-gray-700">{review.comment}</p>
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-gray-100 p-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-law-green">Fermer</button>
          {review.status !== "refused" && (
            <button type="button" disabled={busy} onClick={() => onStatus(review, "refused")} className="rounded-lg border border-red-100 px-5 py-2.5 text-sm font-semibold text-law-red transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-law-red disabled:opacity-60">Refuser</button>
          )}
          {review.status !== "approved" && (
            <button type="button" disabled={busy} onClick={() => onStatus(review, "approved")} className="rounded-lg bg-law-green px-5 py-2.5 text-sm font-bold text-white transition hover:bg-law-green-dark focus:outline-none focus:ring-2 focus:ring-law-green focus:ring-offset-2 disabled:opacity-60">Approuver</button>
          )}
        </footer>
      </section>
    </div>
  );
}
