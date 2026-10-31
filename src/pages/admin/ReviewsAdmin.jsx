import { useEffect, useMemo, useState } from "react";
import Icon from "../../components/common/Icon";
import StatCard from "../../components/admin/StatCard";
import StarRating from "../../components/admin/StarRating";
import ReviewAvatar from "../../components/admin/ReviewAvatar";
import ReviewStatusBadge from "../../components/admin/ReviewStatusBadge";
import ReviewDetailsModal from "../../components/admin/ReviewDetailsModal";
import Pagination from "../../components/admin/Pagination";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import { listAdminProducts } from "../../services/adminProductService";
import {
  clearAdminReviews, computeReviewStats, deleteAdminReview, listAdminReviews,
  resetAdminReviews, updateAdminReviewStatus,
} from "../../services/adminReviewService";
import { getReviewStatusLabel } from "../../data/reviewsDemo";

const PAGE_SIZE = 6;
const shortDate = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
const oneDecimal = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const normalize = (text) => text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
const selectClass = "w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-3 pr-8 text-[13px] text-gray-700 sm:pl-3.5 sm:pr-9 sm:text-sm outline-none transition focus:border-law-green focus:ring-2 focus:ring-green-100";

export default function ReviewsAdmin() {
  const [reviews, setReviews] = useState(null);
  const [products, setProducts] = useState([]);
  const [failed, setFailed] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [rating, setRating] = useState("all");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([listAdminReviews(), listAdminProducts()])
      .then(([list, productList]) => {
        if (cancelled) return;
        setReviews(list);
        setProducts(productList);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  const nameBySlug = useMemo(() => new Map(products.map((product) => [product.slug, product.name])), [products]);
  const productName = (review) => (review.productSlug ? nameBySlug.get(review.productSlug) ?? null : null);
  const stats = useMemo(() => computeReviewStats(reviews ?? []), [reviews]);

  const filtered = useMemo(() => {
    if (!reviews) return [];
    const query = normalize(search);
    return reviews.filter(
      (review) =>
        (!query || normalize(review.customerName).includes(query) || normalize(review.comment).includes(query)) &&
        (status === "all" || review.status === status) &&
        (rating === "all" || review.rating === Number(rating)),
    );
  }, [reviews, search, status, rating]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const hasFilters = search !== "" || status !== "all" || rating !== "all";
  const openReview = reviews?.find((review) => review.id === openId) ?? null;
  const hasDemo = reviews?.some((review) => review.demo);

  const onFilter = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };
  const resetFilters = () => {
    setSearch("");
    setStatus("all");
    setRating("all");
    setPage(1);
  };

  const changeStatus = async (review, next) => {
    setBusyId(review.id);
    try {
      const updated = await updateAdminReviewStatus(review.id, next);
      setReviews((old) => old.map((item) => (item.id === updated.id ? updated : item)));
      setNotice({ text: `Avis de ${review.customerName} : « ${getReviewStatusLabel(next)} ».` });
    } catch (failure) {
      setNotice({ text: failure?.message || "Le changement a échoué. Réessayez.", error: true });
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      setReviews(await deleteAdminReview(toDelete.id));
      setOpenId(null);
      setNotice({ text: `L'avis de ${toDelete.customerName} a été supprimé.` });
      setToDelete(null);
    } catch {
      setNotice({ text: "La suppression a échoué. Réessayez.", error: true });
    } finally {
      setDeleting(false);
    }
  };

  const replaceDemo = async (action) => {
    setReviews(await action());
    setOpenId(null);
    resetFilters();
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">Avis clients</h1>
        <p className="mt-1 text-sm text-gray-500">Consultez et gérez les avis laissés par vos clients</p>
      </div>

      {notice && (
        <p role={notice.error ? "alert" : "status"} className={`mt-5 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium ${notice.error ? "bg-red-50 text-law-red-dark" : "bg-green-50 text-law-green-dark"}`}>
          <Icon name={notice.error ? "lucide:circle-alert" : "lucide:circle-check"} width={16} className="shrink-0" />
          {notice.text}
        </p>
      )}
      {failed && <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-law-red-dark">Impossible de charger les avis.</p>}

      {reviews && (
        <aside className="mt-5 flex flex-col gap-3 rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3 text-xs text-amber-800 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2">
            <Icon name="lucide:info" width={15} className="mt-0.5 shrink-0" />
            <span>
              <strong>Mode démonstration.</strong> La boutique n'enregistre pas encore les avis (son formulaire envoie seulement un e-mail) : les avis et les statistiques ci-dessous sont des exemples, pas de vrais retours clients.
            </span>
          </p>
          <button type="button" onClick={() => replaceDemo(hasDemo ? clearAdminReviews : resetAdminReviews)} className="shrink-0 self-start rounded-md border border-amber-200 bg-white px-3 py-1.5 font-semibold text-amber-800 transition hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 sm:self-auto">
            {hasDemo ? "Retirer les données de démo" : "Restaurer les données de démo"}
          </button>
        </aside>
      )}

      <section aria-label="Statistiques des avis" className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-5">
        <StatCard icon="lucide:message-square" tone="green" title="Total avis" value={stats.total} />
        <StatCard icon="lucide:star" tone="amber" title="Note moyenne" display={`${oneDecimal.format(stats.average)}/5`} />
        <StatCard icon="lucide:thumbs-up" tone="green" title="Avis positifs" display={`${stats.positive} %`} />
        <StatCard icon="lucide:thumbs-down" tone="red" title="Avis négatifs" display={`${stats.negative} %`} />
      </section>
      <p className="mt-2 text-[11px] text-gray-400">Positif : 4★ et plus · négatif : 2★ et moins. Les avis refusés ne sont pas comptés.</p>

      <section className="mt-4 rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="grid grid-cols-1 gap-3 border-b border-gray-100 p-4 min-[420px]:grid-cols-2 sm:p-5 md:grid-cols-[minmax(0,1fr)_11rem_11rem]">
          <label className="relative col-span-full md:col-span-1">
            <span className="sr-only">Rechercher un avis</span>
            <Icon name="lucide:search" width={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="search" value={search} onChange={onFilter(setSearch)} placeholder="Nom du client ou commentaire..." className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-law-green focus:ring-2 focus:ring-green-100" />
          </label>
          <label className="relative">
            <span className="sr-only">Filtrer par statut</span>
            <select value={status} onChange={onFilter(setStatus)} className={selectClass}>
              <option value="all">Tous les statuts</option>
              <option value="approved">Approuvé</option>
              <option value="pending">En attente</option>
              <option value="refused">Refusé</option>
            </select>
            <Icon name="lucide:chevron-down" width={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </label>
          <label className="relative">
            <span className="sr-only">Filtrer par note</span>
            <select value={rating} onChange={onFilter(setRating)} className={selectClass}>
              <option value="all">Toutes les notes</option>
              {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} étoile{value > 1 ? "s" : ""}</option>)}
            </select>
            <Icon name="lucide:chevron-down" width={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </label>
        </div>

        {!reviews && !failed && (
          <div className="animate-pulse space-y-3 p-5" aria-busy="true" aria-label="Chargement des avis">
            {[0, 1, 2, 3].map((item) => <div key={item} className="h-20 rounded-lg bg-gray-100" />)}
          </div>
        )}

        {reviews && reviews.length === 0 && (
          <div className="px-4 py-14 text-center">
            <Icon name="lucide:message-square-off" width={36} className="mx-auto text-gray-300" />
            <p className="mt-3 font-semibold text-gray-900">Aucun avis enregistré</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
              Les avis envoyés par e-mail depuis la boutique ne sont pas enregistrés dans l'application. Les avis clients apparaîtront ici lorsque le backend sera connecté.
            </p>
            <button type="button" onClick={() => replaceDemo(resetAdminReviews)} className="mt-4 text-sm font-semibold text-law-red hover:underline focus:outline-none focus:ring-2 focus:ring-law-red">
              Restaurer les données de démonstration
            </button>
          </div>
        )}

        {reviews && reviews.length > 0 && filtered.length === 0 && (
          <div className="px-4 py-14 text-center">
            <p className="font-semibold text-gray-900">Aucun avis ne correspond à votre recherche.</p>
            {hasFilters && (
              <button type="button" onClick={resetFilters} className="mt-3 text-sm font-semibold text-law-red hover:underline focus:outline-none focus:ring-2 focus:ring-law-red">Réinitialiser les filtres</button>
            )}
          </div>
        )}

        {filtered.length > 0 && (
          <>
            <ul className="divide-y divide-gray-100">
              {visible.map((review) => (
                <li key={review.id} className="p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <ReviewAvatar name={review.customerName} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                        <p className="truncate font-semibold text-gray-900">{review.customerName}</p>
                        <ReviewStatusBadge status={review.status} />
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                        <StarRating rating={review.rating} size={15} />
                        <span>{shortDate.format(new Date(review.createdAt))}</span>
                        {productName(review) && <span className="truncate">· {productName(review)}</span>}
                      </div>
                      <p className="mt-2 line-clamp-2 break-words text-sm text-gray-600">{review.comment}</p>
                      <Actions review={review} busy={busyId === review.id} onOpen={setOpenId} onStatus={changeStatus} onDelete={setToDelete} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-gray-100 p-4 sm:p-5">
              <Pagination page={currentPage} pageCount={pageCount} onPage={setPage} />
            </div>
          </>
        )}
      </section>

      {openReview && <ReviewDetailsModal review={openReview} productName={productName(openReview)} busy={busyId === openReview.id} onStatus={changeStatus} onClose={() => setOpenId(null)} />}

      {toDelete && (
        <ConfirmDialog
          title="Supprimer cet avis ?"
          message={`L'avis de ${toDelete.customerName} sera supprimé. Cette action est définitive.`}
          confirmLabel="Supprimer"
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}

function Actions({ review, busy, onOpen, onStatus, onDelete }) {
  const base = "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 disabled:opacity-50";
  const who = review.customerName;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button type="button" onClick={() => onOpen(review.id)} aria-label={`Voir l'avis de ${who}`} className={`${base} border-gray-200 text-gray-600 hover:bg-gray-50 focus:ring-law-green`}>
        <Icon name="lucide:eye" width={14} />
        Voir
      </button>
      {review.status !== "approved" && (
        <button type="button" disabled={busy} onClick={() => onStatus(review, "approved")} aria-label={`Approuver l'avis de ${who}`} className={`${base} border-green-100 text-law-green hover:bg-green-50 focus:ring-law-green`}>
          <Icon name="lucide:check" width={14} />
          Approuver
        </button>
      )}
      {review.status !== "refused" && (
        <button type="button" disabled={busy} onClick={() => onStatus(review, "refused")} aria-label={`Refuser l'avis de ${who}`} className={`${base} border-red-100 text-law-red hover:bg-red-50 focus:ring-law-red`}>
          <Icon name="lucide:x" width={14} />
          Refuser
        </button>
      )}
      <button type="button" disabled={busy} onClick={() => onDelete(review)} aria-label={`Supprimer l'avis de ${who}`} className={`${base} ml-auto border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-law-red focus:ring-law-red`}>
        <Icon name="lucide:trash-2" width={14} />
        <span className="sr-only sm:not-sr-only">Supprimer</span>
      </button>
    </div>
  );
}
