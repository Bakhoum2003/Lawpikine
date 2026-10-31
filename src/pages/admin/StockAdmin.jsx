import { useEffect, useMemo, useState } from "react";
import Icon from "../../components/common/Icon";
import StatCard from "../../components/admin/StatCard";
import StockStatusBadge from "../../components/admin/StockStatusBadge";
import Pagination from "../../components/admin/Pagination";
import { getLowStockThreshold, getStockStatus, listAdminProducts, updateAdminProductStock } from "../../services/adminProductService";
import { validateStockValues } from "../../services/productValidation";
import { getCategories, getCategoryLabel } from "../../services/categoryStore";

const PAGE_SIZE = 6;
const number = new Intl.NumberFormat("fr-FR");
const normalize = (text) => text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
const selectClass = "w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-3 pr-8 text-[13px] text-gray-700 sm:pl-3.5 sm:pr-9 sm:text-sm outline-none transition focus:border-law-green focus:ring-2 focus:ring-green-100";

export default function StockAdmin() {
  const [products, setProducts] = useState(null);
  const [failed, setFailed] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  // Modifications non enregistrées : { [id]: { stock, threshold } } (texte saisi).
  const [drafts, setDrafts] = useState({});
  const [errors, setErrors] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let cancelled = false;
    listAdminProducts()
      .then((list) => !cancelled && setProducts(list))
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

  // Statistiques calculées à partir des produits enregistrés (valeurs sauvegardées, pas les saisies en cours).
  const stats = useMemo(() => {
    const list = products ?? [];
    return {
      total: list.reduce((sum, product) => sum + (Number(product.stock) || 0), 0),
      inStock: list.filter((product) => getStockStatus(product) !== "out").length,
      out: list.filter((product) => getStockStatus(product) === "out").length,
      low: list.filter((product) => getStockStatus(product) === "low").length,
    };
  }, [products]);

  const filtered = useMemo(() => {
    if (!products) return [];
    const query = normalize(search);
    return products.filter(
      (product) =>
        (!query || normalize(product.name).includes(query)) &&
        (category === "all" || product.productType === category) &&
        (status === "all" || getStockStatus(product) === status),
    );
  }, [products, search, category, status]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const hasFilters = search !== "" || category !== "all" || status !== "all";

  const onFilter = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };
  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setStatus("all");
    setPage(1);
  };

  const valuesOf = (product) => drafts[product.id] ?? { stock: String(product.stock ?? 0), threshold: String(getLowStockThreshold(product)) };
  const isDirty = (product) => {
    const draft = drafts[product.id];
    return Boolean(draft) && (draft.stock !== String(product.stock ?? 0) || draft.threshold !== String(getLowStockThreshold(product)));
  };
  const edit = (product, field, value) => {
    setDrafts((old) => ({ ...old, [product.id]: { ...valuesOf(product), [field]: value } }));
    setErrors((old) => ({ ...old, [product.id]: undefined }));
  };
  const cancelEdit = (product) => {
    setDrafts(({ [product.id]: _removed, ...rest }) => rest);
    setErrors((old) => ({ ...old, [product.id]: undefined }));
  };

  const save = async (product) => {
    const values = valuesOf(product);
    const found = validateStockValues(values);
    if (Object.keys(found).length) {
      setErrors((old) => ({ ...old, [product.id]: found }));
      return;
    }
    setSavingId(product.id);
    try {
      const updated = await updateAdminProductStock(product.id, values);
      setProducts((old) => old.map((item) => (item.id === updated.id ? updated : item)));
      cancelEdit(product);
      setNotice({ text: `Stock de « ${updated.name} » mis à jour.` });
    } catch (failure) {
      if (failure?.fields) setErrors((old) => ({ ...old, [product.id]: failure.fields }));
      else setNotice({ text: failure?.message || "L'enregistrement a échoué. Réessayez.", error: true });
    } finally {
      setSavingId(null);
    }
  };

  const rowProps = { valuesOf, isDirty, errors, savingId, onEdit: edit, onSave: save, onCancel: cancelEdit };

  return (
    <div className="mx-auto max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">Gestion du stock</h1>
        <p className="mt-1 text-sm text-gray-500">Suivez les quantités disponibles de vos produits</p>
      </div>

      {notice && (
        <p role={notice.error ? "alert" : "status"} className={`mt-5 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium ${notice.error ? "bg-red-50 text-law-red-dark" : "bg-green-50 text-law-green-dark"}`}>
          <Icon name={notice.error ? "lucide:circle-alert" : "lucide:circle-check"} width={16} className="shrink-0" />
          {notice.text}
        </p>
      )}
      {failed && <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-law-red-dark">Impossible de charger les produits.</p>}

      <section aria-label="Statistiques du stock" className="mt-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-3 lg:gap-5">
        <StatCard icon="lucide:boxes" tone="green" title="Stock total" value={stats.total} />
        <StatCard icon="lucide:package-check" tone="green" title="En stock" value={stats.inStock} />
        <StatCard icon="lucide:package-x" tone="red" title="Rupture de stock" value={stats.out} />
      </section>

      {stats.low > 0 && (
        <p role="status" className="mt-5 flex items-center gap-2 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-700">
          <Icon name="lucide:triangle-alert" width={18} className="shrink-0" />
          <span>
            {stats.low} produit{stats.low > 1 ? "s" : ""} en stock faible : pensez à réapprovisionner.
            {status !== "low" && (
              <button type="button" onClick={() => { setStatus("low"); setPage(1); }} className="ml-2 font-bold underline focus:outline-none focus:ring-2 focus:ring-orange-400">Voir</button>
            )}
          </span>
        </p>
      )}

      <section className="mt-5 rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="grid grid-cols-1 gap-3 border-b border-gray-100 p-4 min-[420px]:grid-cols-2 sm:p-5 md:grid-cols-[minmax(0,1fr)_12rem_12rem]">
          <label className="relative col-span-full md:col-span-1">
            <span className="sr-only">Rechercher un produit</span>
            <Icon name="lucide:search" width={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="search" value={search} onChange={onFilter(setSearch)} placeholder="Rechercher un produit..." className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-law-green focus:ring-2 focus:ring-green-100" />
          </label>
          <label className="relative">
            <span className="sr-only">Filtrer par catégorie</span>
            <select value={category} onChange={onFilter(setCategory)} className={selectClass}>
              <option value="all">Toutes catégories</option>
              {getCategories().map((item) => <option key={item.value} value={item.value}>{item.name}</option>)}
            </select>
            <Icon name="lucide:chevron-down" width={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </label>
          <label className="relative">
            <span className="sr-only">Filtrer par statut de stock</span>
            <select value={status} onChange={onFilter(setStatus)} className={selectClass}>
              <option value="all">Tous</option>
              <option value="in">En stock</option>
              <option value="low">Stock faible</option>
              <option value="out">Rupture</option>
            </select>
            <Icon name="lucide:chevron-down" width={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </label>
        </div>

        {!products && !failed && (
          <div className="animate-pulse space-y-3 p-5" aria-busy="true" aria-label="Chargement du stock">
            {[0, 1, 2, 3, 4].map((item) => <div key={item} className="h-12 rounded-lg bg-gray-100" />)}
          </div>
        )}

        {products && filtered.length === 0 && (
          <div className="px-4 py-14 text-center">
            <p className="font-semibold text-gray-900">{products.length === 0 ? "Aucun produit dans le catalogue." : "Aucun produit ne correspond à votre recherche."}</p>
            {hasFilters && (
              <button type="button" onClick={resetFilters} className="mt-3 text-sm font-semibold text-law-red hover:underline focus:outline-none focus:ring-2 focus:ring-law-red">Réinitialiser les filtres</button>
            )}
          </div>
        )}

        {filtered.length > 0 && (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Stock des produits</caption>
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    <th scope="col" className="px-5 py-3">Image</th>
                    <th scope="col" className="px-3 py-3">Produit</th>
                    <th scope="col" className="px-3 py-3">Catégorie</th>
                    <th scope="col" className="px-3 py-3">Stock actuel</th>
                    <th scope="col" className="px-3 py-3">Seuil d'alerte</th>
                    <th scope="col" className="px-3 py-3">Statut</th>
                    <th scope="col" className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visible.map((product) => (
                    <StockRow key={product.id} product={product} {...rowProps} />
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-gray-100 md:hidden">
              {visible.map((product) => (
                <StockCard key={product.id} product={product} {...rowProps} />
              ))}
            </ul>

            <div className="border-t border-gray-100 p-4 sm:p-5">
              <Pagination page={currentPage} pageCount={pageCount} onPage={setPage} />
            </div>
          </>
        )}
      </section>
    </div>
  );
}

const inputClass = (error, extra = "") => `w-20 rounded-lg border bg-white px-2.5 py-2 text-sm text-gray-900 outline-none transition focus:ring-2 ${error ? "border-law-red focus:ring-red-100" : "border-gray-200 focus:border-law-green focus:ring-green-100"} ${extra}`;

// layout : "table" ou "card" — les deux présentations sont dans le DOM, leurs identifiants doivent différer.
function NumberField({ layout, product, field, label, values, error, disabled, onEdit, onSave }) {
  const id = `stock-${layout}-${product.id}-${field}`;
  return (
    <>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        aria-label={`${label} de ${product.name}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        value={values[field]}
        disabled={disabled}
        onChange={(event) => onEdit(product, field, event.target.value)}
        onKeyDown={(event) => event.key === "Enter" && onSave(product)}
        className={inputClass(error)}
      />
      {error && <p id={`${id}-error`} role="alert" className="mt-1 max-w-[11rem] text-[11px] leading-tight text-law-red">{error}</p>}
    </>
  );
}

function Actions({ product, dirty, saving, onSave, onCancel }) {
  return (
    <div className="flex items-center justify-end gap-2">
      {dirty && (
        <button type="button" disabled={saving} onClick={() => onCancel(product)} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-law-green disabled:opacity-60">Annuler</button>
      )}
      <button type="button" disabled={!dirty || saving} onClick={() => onSave(product)} aria-label={`Enregistrer le stock de ${product.name}`} className="flex items-center gap-1.5 rounded-lg bg-law-green px-3 py-2 text-xs font-bold text-white transition hover:bg-law-green-dark focus:outline-none focus:ring-2 focus:ring-law-green focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400">
        {saving && <span aria-hidden="true" className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
        {saving ? "Enregistrement..." : "Enregistrer"}
      </button>
    </div>
  );
}

function ProductThumb({ product }) {
  if (!product.img)
    return (
      <span role="img" aria-label={`Pas d'image pour ${product.name}`} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-300">
        <Icon name="lucide:image" width={20} />
      </span>
    );
  return <img src={product.img} alt={product.name} loading="lazy" className="h-12 w-12 shrink-0 rounded-lg bg-gray-100 object-cover" />;
}

function rowState(product, { valuesOf, isDirty, errors, savingId }) {
  const status = getStockStatus(product);
  return { status, values: valuesOf(product), dirty: isDirty(product), fieldErrors: errors[product.id] ?? {}, saving: savingId === product.id };
}

function StockRow({ product, ...rest }) {
  const { status, values, dirty, fieldErrors, saving } = rowState(product, rest);
  const field = { layout: "table", product, values, disabled: saving, onEdit: rest.onEdit, onSave: rest.onSave };
  return (
    <tr className={`transition-colors ${status === "low" ? "bg-orange-50/40" : status === "out" ? "bg-red-50/30" : "hover:bg-gray-50/60"}`}>
      <td className="px-5 py-3"><ProductThumb product={product} /></td>
      <td className="px-3 py-3 font-semibold text-gray-900">{product.name}</td>
      <td className="px-3 py-3 text-gray-600">{getCategoryLabel(product.productType)}</td>
      <td className="px-3 py-3 align-top"><div className="pt-1"><NumberField {...field} field="stock" label="Stock" error={fieldErrors.stock} /></div></td>
      <td className="px-3 py-3 align-top"><div className="pt-1"><NumberField {...field} field="threshold" label="Seuil d'alerte" error={fieldErrors.threshold} /></div></td>
      <td className="px-3 py-3">
        <span className="inline-flex items-center gap-1.5">
          {status === "low" && <Icon name="lucide:triangle-alert" width={14} className="text-orange-500" />}
          <StockStatusBadge status={status} />
        </span>
      </td>
      <td className="px-5 py-3"><Actions product={product} dirty={dirty} saving={saving} onSave={rest.onSave} onCancel={rest.onCancel} /></td>
    </tr>
  );
}

function StockCard({ product, ...rest }) {
  const { status, values, dirty, fieldErrors, saving } = rowState(product, rest);
  const field = { layout: "card", product, values, disabled: saving, onEdit: rest.onEdit, onSave: rest.onSave };
  return (
    <li className={`p-4 ${status === "low" ? "bg-orange-50/40" : status === "out" ? "bg-red-50/30" : ""}`}>
      <div className="flex items-start gap-3">
        <ProductThumb product={product} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-gray-900">{product.name}</p>
          <p className="text-xs text-gray-500">{getCategoryLabel(product.productType)}</p>
        </div>
        <span className="inline-flex items-center gap-1">
          {status === "low" && <Icon name="lucide:triangle-alert" width={14} className="text-orange-500" />}
          <StockStatusBadge status={status} />
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="mb-1 text-xs text-gray-500">Stock actuel</p>
          <NumberField {...field} field="stock" label="Stock" error={fieldErrors.stock} />
        </div>
        <div>
          <p className="mb-1 text-xs text-gray-500">Seuil d'alerte</p>
          <NumberField {...field} field="threshold" label="Seuil d'alerte" error={fieldErrors.threshold} />
        </div>
      </div>
      <div className="mt-3"><Actions product={product} dirty={dirty} saving={saving} onSave={rest.onSave} onCancel={rest.onCancel} /></div>
    </li>
  );
}
