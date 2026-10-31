import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../../../components/common/Icon";
import StatusBadge from "../../../components/admin/StatusBadge";
import Pagination from "../../../components/admin/Pagination";
import ConfirmDialog from "../../../components/admin/ConfirmDialog";
import { deleteAdminProduct, isInStock, listAdminProducts } from "../../../services/adminProductService";
import { formatPrice } from "../../../services/productService";
import { takeFlash } from "../../../services/flashMessage";
import { getCategories, getCategoryLabel } from "../../../services/categoryStore";

const PAGE_SIZE = 5;
// Routes prévues pour les prochaines étapes (pages Ajouter / Modifier).
const ADD_PATH = "/admin/produits/nouveau";
const editPath = (id) => `/admin/produits/${id}/modifier`;

const normalize = (text) => text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
const selectClass = "w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-3 pr-8 text-[13px] text-gray-700 sm:pl-3.5 sm:pr-9 sm:text-sm outline-none transition focus:border-law-green focus:ring-2 focus:ring-green-100";

export default function ProductsAdmin() {
  const [products, setProducts] = useState(null);
  const [failed, setFailed] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;
    listAdminProducts()
      .then((list) => !cancelled && setProducts(list))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, []);

  // Message laissé par une autre page (ex. « produit ajouté »).
  useEffect(() => {
    const flash = takeFlash();
    if (flash) setNotice(flash);
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  const filtered = useMemo(() => {
    if (!products) return [];
    const query = normalize(search);
    return products.filter(
      (product) =>
        (!query || normalize(product.name).includes(query)) &&
        (category === "all" || product.productType === category) &&
        (availability === "all" || (availability === "in" ? isInStock(product) : !isInStock(product))),
    );
  }, [products, search, category, availability]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const hasFilters = search !== "" || category !== "all" || availability !== "all";

  const onFilter = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };
  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setAvailability("all");
    setPage(1);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      setProducts(await deleteAdminProduct(toDelete.id));
      setNotice(`« ${toDelete.name} » a été supprimé.`);
      setToDelete(null);
    } catch {
      setNotice("La suppression a échoué. Réessayez.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">Gestion des produits</h1>
          <p className="mt-1 text-sm text-gray-500">Gérez les produits de votre boutique</p>
        </div>
        <Link to={ADD_PATH} className="inline-flex items-center gap-2 rounded-lg bg-law-red px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-law-red-dark focus:outline-none focus:ring-2 focus:ring-law-red focus:ring-offset-2">
          <Icon name="lucide:plus" width={16} />
          Ajouter un produit
        </Link>
      </div>

      {notice && (
        <p role="status" className="mt-5 flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-law-green-dark">
          <Icon name="lucide:circle-check" width={16} className="shrink-0" />
          {notice}
        </p>
      )}
      {failed && <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-law-red-dark">Impossible de charger les produits.</p>}

      <section className="mt-6 rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="grid grid-cols-1 gap-3 border-b border-gray-100 p-4 min-[420px]:grid-cols-2 sm:p-5 md:grid-cols-[minmax(0,1fr)_12rem_12rem]">
          <label className="relative col-span-full md:col-span-1">
            <span className="sr-only">Rechercher un produit</span>
            <Icon name="lucide:search" width={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={onFilter(setSearch)}
              placeholder="Rechercher un produit..."
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-law-green focus:ring-2 focus:ring-green-100"
            />
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
            <span className="sr-only">Filtrer par disponibilité</span>
            <select value={availability} onChange={onFilter(setAvailability)} className={selectClass}>
              <option value="all">Tous statuts</option>
              <option value="in">En stock</option>
              <option value="out">Rupture de stock</option>
            </select>
            <Icon name="lucide:chevron-down" width={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </label>
        </div>

        {!products && !failed && <TableSkeleton />}

        {products && filtered.length === 0 && (
          <div className="px-4 py-14 text-center">
            <p className="font-semibold text-gray-900">{products.length === 0 ? "Aucun produit dans le catalogue." : "Aucun produit ne correspond à votre recherche."}</p>
            {hasFilters && (
              <button type="button" onClick={resetFilters} className="mt-3 text-sm font-semibold text-law-red hover:underline focus:outline-none focus:ring-2 focus:ring-law-red">
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}

        {products && filtered.length > 0 && (
          <>
            {/* Ordinateur et tablette : tableau */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Liste des produits</caption>
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    <th scope="col" className="px-5 py-3">Image</th>
                    <th scope="col" className="px-3 py-3">Nom</th>
                    <th scope="col" className="px-3 py-3">Catégorie</th>
                    <th scope="col" className="px-3 py-3">Prix (FCFA)</th>
                    <th scope="col" className="px-3 py-3">Stock</th>
                    <th scope="col" className="px-3 py-3">Statut</th>
                    <th scope="col" className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visible.map((product) => (
                    <tr key={product.id} className="transition-colors hover:bg-gray-50/60">
                      <td className="px-5 py-3"><ProductImage product={product} /></td>
                      <td className="px-3 py-3 font-semibold text-gray-900">{product.name}</td>
                      <td className="px-3 py-3 text-gray-600">{getCategoryLabel(product.productType)}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-gray-700">{formatPrice(product.price)}</td>
                      <td className="px-3 py-3 text-gray-700">{product.stock}</td>
                      <td className="px-3 py-3"><StatusBadge inStock={isInStock(product)} /></td>
                      <td className="px-5 py-3"><RowActions product={product} onDelete={setToDelete} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile : une carte par produit, sans défilement horizontal */}
            <ul className="divide-y divide-gray-100 md:hidden">
              {visible.map((product) => (
                <li key={product.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <ProductImage product={product} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{getCategoryLabel(product.productType)}</p>
                      <p className="mt-1 text-sm font-semibold text-gray-800">{formatPrice(product.price)}</p>
                    </div>
                    <StatusBadge inStock={isInStock(product)} />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-gray-500">Stock : <span className="font-semibold text-gray-800">{product.stock}</span></p>
                    <RowActions product={product} onDelete={setToDelete} />
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

      {toDelete && (
        <ConfirmDialog
          title="Supprimer ce produit ?"
          message={`« ${toDelete.name} » sera retiré de la liste des produits. Cette action est définitive.`}
          confirmLabel="Supprimer"
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}

function ProductImage({ product }) {
  if (!product.img)
    return (
      <span role="img" aria-label={`Pas d'image pour ${product.name}`} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-300">
        <Icon name="lucide:image" width={20} />
      </span>
    );
  return <img src={product.img} alt={product.name} loading="lazy" className="h-12 w-12 shrink-0 rounded-lg bg-gray-100 object-cover" />;
}

function RowActions({ product, onDelete }) {
  const base = "flex h-8 w-8 items-center justify-center rounded-md border transition focus:outline-none focus:ring-2";
  return (
    <div className="flex items-center justify-end gap-2">
      <Link to={editPath(product.id)} aria-label={`Modifier ${product.name}`} title="Modifier" className={`${base} border-gray-200 text-gray-600 hover:bg-gray-50 focus:ring-law-green`}>
        <Icon name="lucide:pencil" width={15} />
      </Link>
      <button type="button" onClick={() => onDelete(product)} aria-label={`Supprimer ${product.name}`} title="Supprimer" className={`${base} border-red-100 text-law-red hover:bg-red-50 focus:ring-law-red`}>
        <Icon name="lucide:trash-2" width={15} />
      </button>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-5" aria-busy="true" aria-label="Chargement des produits">
      {[0, 1, 2, 3, 4].map((item) => <div key={item} className="h-12 rounded-lg bg-gray-100" />)}
    </div>
  );
}
