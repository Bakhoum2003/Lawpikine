import { useEffect, useMemo, useState } from "react";
import Icon from "../../components/common/Icon";
import StatCard from "../../components/admin/StatCard";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import CategoryFormModal from "../../components/admin/CategoryFormModal";
import {
  createAdminCategory, deleteAdminCategory, getCategoryProductCounts, listAdminCategories,
  setAdminCategoryEnabled, updateAdminCategory,
} from "../../services/adminCategoryService";
import { CategoryInUseError } from "../../services/categoryValidation";

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState(null);
  const [counts, setCounts] = useState({});
  const [failed, setFailed] = useState(false);
  const [form, setForm] = useState(null); // null | { category?: category }
  const [toDelete, setToDelete] = useState(null);
  const [blocked, setBlocked] = useState(null); // { category, message }
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([listAdminCategories(), getCategoryProductCounts()])
      .then(([list, productCounts]) => {
        if (cancelled) return;
        setCategories(list);
        setCounts(productCounts);
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

  const stats = useMemo(() => {
    const list = categories ?? [];
    const active = list.filter((category) => category.enabled).length;
    return { total: list.length, active, inactive: list.length - active };
  }, [categories]);

  const handleSubmit = async (values) => {
    if (form.category) {
      const updated = await updateAdminCategory(form.category.id, values);
      setCategories((old) => old.map((item) => (item.id === updated.id ? updated : item)));
      setNotice({ text: `« ${updated.name} » a été modifiée.` });
    } else {
      const created = await createAdminCategory(values);
      setCategories((old) => [...old, created]);
      setNotice({ text: `« ${created.name} » a été ajoutée.` });
    }
    setForm(null);
  };

  const toggle = async (category) => {
    setBusyId(category.id);
    try {
      const updated = await setAdminCategoryEnabled(category.id, !category.enabled);
      setCategories((old) => old.map((item) => (item.id === updated.id ? updated : item)));
      setNotice({ text: `« ${updated.name} » ${updated.enabled ? "activée" : "désactivée"}.` });
    } catch (failure) {
      setNotice({ text: failure?.message || "Le changement a échoué. Réessayez.", error: true });
    } finally {
      setBusyId(null);
    }
  };

  // Les produits associés bloquent la suppression AVANT toute confirmation ; le service revérifie.
  const requestDelete = (category) => {
    const count = counts[category.value] ?? 0;
    if (count > 0) setBlocked({ category, message: new CategoryInUseError(count).message });
    else setToDelete(category);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      setCategories(await deleteAdminCategory(toDelete.id));
      setNotice({ text: `« ${toDelete.name} » a été supprimée.` });
      setToDelete(null);
    } catch (failure) {
      setToDelete(null);
      if (failure instanceof CategoryInUseError) setBlocked({ category: toDelete, message: failure.message });
      else setNotice({ text: failure?.message || "La suppression a échoué. Réessayez.", error: true });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">Gestion des catégories</h1>
          <p className="mt-1 text-sm text-gray-500">Organisez et gérez les catégories de votre boutique</p>
        </div>
        <button type="button" onClick={() => setForm({})} className="inline-flex items-center gap-2 rounded-lg bg-law-red px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-law-red-dark focus:outline-none focus:ring-2 focus:ring-law-red focus:ring-offset-2">
          <Icon name="lucide:plus" width={16} />
          Ajouter une catégorie
        </button>
      </div>

      {notice && (
        <p role={notice.error ? "alert" : "status"} className={`mt-5 flex items-start gap-2 rounded-lg px-4 py-3 text-sm font-medium ${notice.error ? "bg-red-50 text-law-red-dark" : "bg-green-50 text-law-green-dark"}`}>
          <Icon name={notice.error ? "lucide:circle-alert" : "lucide:circle-check"} width={16} className="mt-0.5 shrink-0" />
          {notice.text}
        </p>
      )}
      {failed && <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-law-red-dark">Impossible de charger les catégories.</p>}

      <section aria-label="Statistiques des catégories" className="mt-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-3 lg:gap-5">
        <StatCard icon="lucide:layers" tone="green" title="Total catégories" value={stats.total} />
        <StatCard icon="lucide:circle-check" tone="green" title="Catégories actives" value={stats.active} />
        <StatCard icon="lucide:circle-slash" tone="red" title="Catégories inactives" value={stats.inactive} />
      </section>

      <section className="mt-5 rounded-2xl border border-gray-100 bg-white shadow-sm">
        {!categories && !failed && (
          <div className="animate-pulse space-y-3 p-5" aria-busy="true" aria-label="Chargement des catégories">
            {[0, 1, 2].map((item) => <div key={item} className="h-14 rounded-lg bg-gray-100" />)}
          </div>
        )}

        {categories && categories.length === 0 && (
          <div className="px-4 py-14 text-center">
            <Icon name="lucide:layers" width={36} className="mx-auto text-gray-300" />
            <p className="mt-3 font-semibold text-gray-900">Aucune catégorie</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">Créez au moins une catégorie pour pouvoir ajouter des produits.</p>
          </div>
        )}

        {categories && categories.length > 0 && (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Liste des catégories</caption>
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    <th scope="col" className="px-5 py-3">Image</th>
                    <th scope="col" className="px-3 py-3">Nom</th>
                    <th scope="col" className="px-3 py-3">Description</th>
                    <th scope="col" className="px-3 py-3">Produits</th>
                    <th scope="col" className="px-3 py-3">Statut</th>
                    <th scope="col" className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map((category) => (
                    <tr key={category.id} className="transition-colors hover:bg-gray-50/60">
                      <td className="px-5 py-3"><CategoryThumb category={category} /></td>
                      <td className="px-3 py-3 font-semibold text-gray-900">{category.name}</td>
                      <td className="max-w-xs px-3 py-3 text-gray-600"><span className="line-clamp-2">{category.description || <span className="text-gray-400">—</span>}</span></td>
                      <td className="px-3 py-3 text-gray-700">{counts[category.value] ?? 0}</td>
                      <td className="px-3 py-3"><CategoryStatus enabled={category.enabled} /></td>
                      <td className="px-5 py-3"><RowActions category={category} busy={busyId === category.id} onEdit={(item) => setForm({ category: item })} onToggle={toggle} onDelete={requestDelete} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-gray-100 md:hidden">
              {categories.map((category) => (
                <li key={category.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <CategoryThumb category={category} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-gray-900">{category.name}</p>
                      <p className="line-clamp-2 break-words text-xs text-gray-500">{category.description || "Aucune description"}</p>
                    </div>
                    <CategoryStatus enabled={category.enabled} />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-gray-500">Produits : <span className="font-semibold text-gray-800">{counts[category.value] ?? 0}</span></p>
                    <RowActions category={category} busy={busyId === category.id} onEdit={(item) => setForm({ category: item })} onToggle={toggle} onDelete={requestDelete} />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {form && (
        <CategoryFormModal
          key={form.category?.id ?? "new"}
          initialValues={form.category ? { name: form.category.name, description: form.category.description, image: form.category.image, enabled: form.category.enabled } : undefined}
          existingNames={(categories ?? []).filter((category) => category.id !== form.category?.id).map((category) => category.name)}
          onSubmit={handleSubmit}
          onClose={() => setForm(null)}
        />
      )}

      {toDelete && (
        <ConfirmDialog
          title="Supprimer cette catégorie ?"
          message={`« ${toDelete.name} » ne contient aucun produit. Elle sera supprimée définitivement.`}
          confirmLabel="Supprimer"
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}

      {blocked && <BlockedDialog category={blocked.category} message={blocked.message} onClose={() => setBlocked(null)} />}
    </div>
  );
}

function CategoryStatus({ enabled }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none ${enabled ? "bg-green-50 text-law-green" : "bg-gray-100 text-gray-600"}`}>
      {enabled ? "Active" : "Inactive"}
    </span>
  );
}

function CategoryThumb({ category }) {
  if (category.image) return <img src={category.image} alt={`Image de ${category.name}`} className="h-12 w-12 shrink-0 rounded-lg bg-gray-100 object-cover" />;
  return (
    <span role="img" aria-label={`Icône de ${category.name}`} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-50 text-law-green">
      <Icon name="lucide:shirt" width={22} />
    </span>
  );
}

function RowActions({ category, busy, onEdit, onToggle, onDelete }) {
  const base = "flex h-8 w-8 items-center justify-center rounded-md border transition focus:outline-none focus:ring-2 disabled:opacity-50";
  return (
    <div className="flex items-center justify-end gap-2">
      <button type="button" onClick={() => onEdit(category)} aria-label={`Modifier ${category.name}`} title="Modifier" className={`${base} border-gray-200 text-gray-600 hover:bg-gray-50 focus:ring-law-green`}>
        <Icon name="lucide:pencil" width={15} />
      </button>
      <button
        type="button"
        role="switch"
        aria-checked={category.enabled}
        aria-label={`${category.enabled ? "Désactiver" : "Activer"} ${category.name}`}
        title={category.enabled ? "Désactiver" : "Activer"}
        disabled={busy}
        onClick={() => onToggle(category)}
        className={`relative mx-1 h-6 w-11 shrink-0 rounded-full transition focus:outline-none focus:ring-2 focus:ring-law-green focus:ring-offset-2 disabled:opacity-60 ${category.enabled ? "bg-law-green" : "bg-gray-300"}`}
      >
        <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${category.enabled ? "translate-x-5" : ""}`} />
      </button>
      <button type="button" onClick={() => onDelete(category)} aria-label={`Supprimer ${category.name}`} title="Supprimer" className={`${base} border-red-100 text-law-red hover:bg-red-50 focus:ring-law-red`}>
        <Icon name="lucide:trash-2" width={15} />
      </button>
    </div>
  );
}

// Suppression impossible : explique pourquoi, sans rien supprimer.
function BlockedDialog({ category, message, onClose }) {
  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="alertdialog" aria-modal="true" aria-labelledby="blocked-title" aria-describedby="blocked-message" className="slide-in w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-500">
          <Icon name="lucide:triangle-alert" width={22} />
        </span>
        <h2 id="blocked-title" className="mt-4 text-lg font-bold text-gray-900">Suppression impossible</h2>
        <p className="mt-1 text-sm font-semibold text-gray-700">« {category.name} »</p>
        <p id="blocked-message" className="mt-2 text-sm text-gray-500">{message}</p>
        <button type="button" autoFocus onClick={onClose} className="mt-6 w-full rounded-lg bg-law-green py-2.5 text-sm font-bold text-white transition hover:bg-law-green-dark focus:outline-none focus:ring-2 focus:ring-law-green focus:ring-offset-2">Compris</button>
      </section>
    </div>
  );
}
