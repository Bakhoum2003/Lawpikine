import { useEffect, useMemo, useState } from "react";
import Icon from "../../components/common/Icon";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import PromotionFormModal from "../../components/admin/PromotionFormModal";
import { listAdminProducts } from "../../services/adminProductService";
import {
  createAdminPromotion, deleteAdminPromotion, getPromotionStatus, listAdminPromotions,
  setAdminPromotionEnabled, updateAdminPromotion,
} from "../../services/adminPromotionService";
import { promotionToFormValues } from "../../services/promotionValidation";

const number = new Intl.NumberFormat("fr-FR");
const formatDate = (key) => key.split("-").reverse().join("/");
const formatDiscount = (promotion) => (promotion.discountType === "percent" ? `-${promotion.value} %` : `-${number.format(promotion.value)} FCFA`);
const REASONS = {
  disabled: "Désactivée",
  scheduled: "Pas encore commencée",
  expired: "Période terminée",
  invalid: "Informations invalides",
};

export default function PromotionsAdmin() {
  const [promotions, setPromotions] = useState(null);
  const [products, setProducts] = useState([]);
  const [failed, setFailed] = useState(false);
  const [form, setForm] = useState(null); // null | { promotion?: promotion }
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([listAdminPromotions(), listAdminProducts()])
      .then(([list, productList]) => {
        if (cancelled) return;
        setPromotions(list);
        setProducts(productList);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const validationProducts = useMemo(() => products.map(({ slug, price }) => ({ slug, price })), [products]);
  const nameBySlug = useMemo(() => new Map(products.map((product) => [product.slug, product.name])), [products]);

  const handleSubmit = async (values) => {
    if (form.promotion) {
      const updated = await updateAdminPromotion(form.promotion.id, values);
      setPromotions((old) => old.map((item) => (item.id === updated.id ? updated : item)));
      setNotice({ text: `« ${updated.name} » a été modifiée.` });
    } else {
      const created = await createAdminPromotion(values);
      setPromotions((old) => [created, ...old]);
      setNotice({ text: `« ${created.name} » a été créée.` });
    }
    setForm(null);
  };

  const toggle = async (promotion) => {
    setBusyId(promotion.id);
    try {
      const updated = await setAdminPromotionEnabled(promotion.id, !promotion.enabled);
      setPromotions((old) => old.map((item) => (item.id === updated.id ? updated : item)));
      setNotice({ text: `« ${updated.name} » ${updated.enabled ? "activée" : "désactivée"}.` });
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
      setPromotions(await deleteAdminPromotion(toDelete.id));
      setNotice({ text: `« ${toDelete.name} » a été supprimée.` });
      setToDelete(null);
    } catch {
      setNotice({ text: "La suppression a échoué. Réessayez.", error: true });
    } finally {
      setDeleting(false);
    }
  };

  const describeTargets = (promotion) => {
    if (promotion.scope === "all") return "Tous les produits";
    const names = promotion.productSlugs.map((slug) => nameBySlug.get(slug)).filter(Boolean);
    if (!names.length) return "Aucun produit existant";
    return names.length <= 2 ? names.join(", ") : `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">Gestion des promotions</h1>
          <p className="mt-1 text-sm text-gray-500">Créez et gérez les offres promotionnelles de votre boutique</p>
        </div>
        <button type="button" onClick={() => setForm({})} className="inline-flex items-center gap-2 rounded-lg bg-law-red px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-law-red-dark focus:outline-none focus:ring-2 focus:ring-law-red focus:ring-offset-2">
          <Icon name="lucide:plus" width={16} />
          Nouvelle promotion
        </button>
      </div>

      {notice && (
        <p role={notice.error ? "alert" : "status"} className={`mt-5 flex items-start gap-2 rounded-lg px-4 py-3 text-sm font-medium ${notice.error ? "bg-red-50 text-law-red-dark" : "bg-green-50 text-law-green-dark"}`}>
          <Icon name={notice.error ? "lucide:circle-alert" : "lucide:circle-check"} width={16} className="mt-0.5 shrink-0" />
          {notice.text}
        </p>
      )}
      {failed && <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-law-red-dark">Impossible de charger les promotions.</p>}

      {!promotions && !failed && (
        <div className="mt-6 grid animate-pulse gap-4 md:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Chargement des promotions">
          {[0, 1, 2].map((item) => <div key={item} className="h-44 rounded-2xl bg-gray-100" />)}
        </div>
      )}

      {promotions && promotions.length === 0 && (
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white px-4 py-14 text-center shadow-sm">
          <Icon name="lucide:tag" width={36} className="mx-auto text-gray-300" />
          <p className="mt-3 font-semibold text-gray-900">Aucune promotion pour le moment</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">Créez une offre (pourcentage ou montant fixe) pour tous vos produits ou une sélection. Elle ne modifie pas encore les prix de la boutique.</p>
          <button type="button" onClick={() => setForm({})} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-law-red px-5 py-2.5 text-sm font-bold text-white transition hover:bg-law-red-dark focus:outline-none focus:ring-2 focus:ring-law-red focus:ring-offset-2">
            <Icon name="lucide:plus" width={16} />
            Nouvelle promotion
          </button>
        </div>
      )}

      {promotions && promotions.length > 0 && (
        <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {promotions.map((promotion) => {
            const { active, reason } = getPromotionStatus(promotion, validationProducts);
            return (
              <li key={promotion.id} className="flex min-w-0 flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="break-words text-base font-bold text-gray-900">{promotion.name}</h2>
                    <p className="mt-0.5 text-xs text-gray-500">{promotion.discountType === "percent" ? "Pourcentage" : "Montant fixe"}</p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-red-50 px-2.5 py-1 text-sm font-extrabold text-law-red">{formatDiscount(promotion)}</span>
                </div>

                <dl className="mt-4 space-y-1.5 text-sm">
                  <div className="flex gap-2"><dt className="w-14 shrink-0 text-gray-500">Début</dt><dd className="font-medium text-gray-800">{formatDate(promotion.startDate)}</dd></div>
                  <div className="flex gap-2"><dt className="w-14 shrink-0 text-gray-500">Fin</dt><dd className="font-medium text-gray-800">{formatDate(promotion.endDate)}</dd></div>
                  <div className="flex gap-2"><dt className="w-14 shrink-0 text-gray-500">Produits</dt><dd className="min-w-0 break-words font-medium text-gray-800">{describeTargets(promotion)}</dd></div>
                </dl>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                  <div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none ${active ? "bg-green-50 text-law-green" : "bg-gray-100 text-gray-600"}`}>
                      {active ? "Active" : "Inactive"}
                    </span>
                    {!active && <p className="mt-1 text-[11px] text-gray-400">{REASONS[reason]}</p>}
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={promotion.enabled}
                    aria-label={`${promotion.enabled ? "Désactiver" : "Activer"} ${promotion.name}`}
                    disabled={busyId === promotion.id}
                    onClick={() => toggle(promotion)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition focus:outline-none focus:ring-2 focus:ring-law-green focus:ring-offset-2 disabled:opacity-60 ${promotion.enabled ? "bg-law-green" : "bg-gray-300"}`}
                  >
                    <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${promotion.enabled ? "translate-x-5" : ""}`} />
                  </button>
                </div>

                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={() => setForm({ promotion })} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-law-green">
                    <Icon name="lucide:pencil" width={14} />
                    Modifier
                  </button>
                  <button type="button" onClick={() => setToDelete(promotion)} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-100 py-2 text-xs font-semibold text-law-red transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-law-red">
                    <Icon name="lucide:trash-2" width={14} />
                    Supprimer
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {form && (
        <PromotionFormModal
          key={form.promotion?.id ?? "new"}
          initialValues={form.promotion ? promotionToFormValues(form.promotion) : undefined}
          products={products}
          onSubmit={handleSubmit}
          onClose={() => setForm(null)}
        />
      )}

      {toDelete && (
        <ConfirmDialog
          title="Supprimer cette promotion ?"
          message={`« ${toDelete.name} » sera supprimée. Cette action est définitive.`}
          confirmLabel="Supprimer"
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
