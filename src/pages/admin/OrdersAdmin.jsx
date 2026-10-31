import { useEffect, useMemo, useState } from "react";
import Icon from "../../components/common/Icon";
import StatCard from "../../components/admin/StatCard";
import OrderStatusBadge from "../../components/admin/OrderStatusBadge";
import OrderDetailsModal from "../../components/admin/OrderDetailsModal";
import Pagination from "../../components/admin/Pagination";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import {
  clearAdminOrders, computeOrderStats, formatOrderNumber, listAdminOrders, orderTotal,
  resetAdminOrders, updateAdminOrderStatus,
} from "../../services/adminOrderService";
import { formatPrice } from "../../services/productService";
import { getOrderStatusLabel } from "../../data/ordersDemo";

const PAGE_SIZE = 6;
const shortDate = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
const normalize = (text) => text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
// Jour local (AAAA-MM-JJ), comparable à la valeur d'un <input type="date">.
const dayKey = (iso) => {
  const date = new Date(iso);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
const fieldClass = "w-full rounded-lg border border-gray-200 bg-white py-2.5 text-sm text-gray-700 outline-none transition focus:border-law-green focus:ring-2 focus:ring-green-100";

export default function OrdersAdmin() {
  const [orders, setOrders] = useState(null);
  const [failed, setFailed] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(null);
  const [toCancel, setToCancel] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState(null); // { text, error }

  useEffect(() => {
    let cancelled = false;
    listAdminOrders()
      .then((list) => !cancelled && setOrders(list))
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

  const stats = useMemo(() => computeOrderStats(orders ?? []), [orders]);

  const filtered = useMemo(() => {
    if (!orders) return [];
    const query = normalize(search).replace(/^#/, "");
    return orders.filter(
      (order) =>
        (!query || normalize(formatOrderNumber(order.number)).includes(query) || normalize(order.customer.name).includes(query)) &&
        (status === "all" || order.status === status) &&
        (!date || dayKey(order.createdAt) === date),
    );
  }, [orders, search, status, date]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const hasFilters = search !== "" || status !== "all" || date !== "";
  const openOrder = orders?.find((order) => order.id === openId) ?? null;
  const hasDemo = orders?.some((order) => order.demo);

  const onFilter = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };
  const resetFilters = () => {
    setSearch("");
    setStatus("all");
    setDate("");
    setPage(1);
  };

  const applyStatus = async (order, next) => {
    setBusyId(order.id);
    try {
      const updated = await updateAdminOrderStatus(order.id, next);
      setOrders((old) => old.map((item) => (item.id === updated.id ? updated : item)));
      setNotice({ text: `Commande ${formatOrderNumber(order.number)} : statut « ${getOrderStatusLabel(next)} ».` });
      setToCancel(null);
    } catch (failure) {
      setNotice({ text: failure.message || "Le changement de statut a échoué. Réessayez.", error: true });
      setToCancel(null);
    } finally {
      setBusyId(null);
    }
  };
  // Toute annulation passe par une confirmation.
  const requestStatus = (order, next) => {
    if (next === order.status) return;
    if (next === "cancelled") setToCancel(order);
    else applyStatus(order, next);
  };

  const replaceDemo = async (action) => {
    setOrders(await action());
    setOpenId(null);
    resetFilters();
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">Gestion des commandes</h1>
        <p className="mt-1 text-sm text-gray-500">Consultez et gérez les commandes de votre boutique</p>
      </div>

      {notice && (
        <p role={notice.error ? "alert" : "status"} className={`mt-5 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium ${notice.error ? "bg-red-50 text-law-red-dark" : "bg-green-50 text-law-green-dark"}`}>
          <Icon name={notice.error ? "lucide:circle-alert" : "lucide:circle-check"} width={16} className="shrink-0" />
          {notice.text}
        </p>
      )}
      {failed && <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-law-red-dark">Impossible de charger les commandes.</p>}

      {orders && (
        <aside className="mt-5 flex flex-col gap-3 rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3 text-xs text-amber-800 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2">
            <Icon name="lucide:info" width={15} className="mt-0.5 shrink-0" />
            <span>
              <strong>Mode démonstration.</strong> Les commandes envoyées par WhatsApp ne sont pas enregistrées automatiquement dans l'application : les commandes ci-dessous sont des exemples, pas de vraies ventes.
            </span>
          </p>
          <button type="button" onClick={() => replaceDemo(hasDemo ? clearAdminOrders : resetAdminOrders)} className="shrink-0 self-start rounded-md border border-amber-200 bg-white px-3 py-1.5 font-semibold text-amber-800 transition hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 sm:self-auto">
            {hasDemo ? "Retirer les données de démo" : "Restaurer les données de démo"}
          </button>
        </aside>
      )}

      <section aria-label="Statistiques des commandes" className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-5">
        <StatCard icon="lucide:shopping-cart" tone="green" title="Total commandes" value={stats.total} />
        <StatCard icon="lucide:clock" tone="amber" title="En cours" value={stats.pending} />
        <StatCard icon="lucide:circle-check" tone="green" title="Livrées" value={stats.delivered} />
        <StatCard icon="lucide:circle-x" tone="red" title="Annulées" value={stats.cancelled} />
      </section>

      <section className="mt-5 rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="grid grid-cols-1 gap-3 border-b border-gray-100 p-4 min-[420px]:grid-cols-2 sm:p-5 md:grid-cols-[minmax(0,1fr)_11rem_11rem]">
          <label className="relative col-span-full md:col-span-1">
            <span className="sr-only">Rechercher une commande</span>
            <Icon name="lucide:search" width={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="search" value={search} onChange={onFilter(setSearch)} placeholder="N° de commande ou nom du client..." className={`${fieldClass} pl-10 pr-4 placeholder:text-gray-400`} />
          </label>
          <label className="relative">
            <span className="sr-only">Filtrer par statut</span>
            <select value={status} onChange={onFilter(setStatus)} className={`${fieldClass} appearance-none pl-3 pr-8`}>
              <option value="all">Toutes</option>
              <option value="pending">En cours</option>
              <option value="delivered">Livrées</option>
              <option value="cancelled">Annulées</option>
            </select>
            <Icon name="lucide:chevron-down" width={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </label>
          <label>
            <span className="sr-only">Filtrer par date</span>
            <input type="date" value={date} onChange={onFilter(setDate)} aria-label="Filtrer par date" className={`${fieldClass} px-3`} />
          </label>
        </div>

        {!orders && !failed && (
          <div className="animate-pulse space-y-3 p-5" aria-busy="true" aria-label="Chargement des commandes">
            {[0, 1, 2, 3].map((item) => <div key={item} className="h-12 rounded-lg bg-gray-100" />)}
          </div>
        )}

        {orders && orders.length === 0 && (
          <div className="px-4 py-14 text-center">
            <Icon name="lucide:inbox" width={36} className="mx-auto text-gray-300" />
            <p className="mt-3 font-semibold text-gray-900">Aucune commande enregistrée</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
              Les commandes envoyées par WhatsApp ne sont pas enregistrées automatiquement. Elles apparaîtront ici lorsque le backend sera connecté.
            </p>
            <button type="button" onClick={() => replaceDemo(resetAdminOrders)} className="mt-4 text-sm font-semibold text-law-red hover:underline focus:outline-none focus:ring-2 focus:ring-law-red">
              Restaurer les données de démonstration
            </button>
          </div>
        )}

        {orders && orders.length > 0 && filtered.length === 0 && (
          <div className="px-4 py-14 text-center">
            <p className="font-semibold text-gray-900">Aucune commande ne correspond à votre recherche.</p>
            {hasFilters && (
              <button type="button" onClick={resetFilters} className="mt-3 text-sm font-semibold text-law-red hover:underline focus:outline-none focus:ring-2 focus:ring-law-red">Réinitialiser les filtres</button>
            )}
          </div>
        )}

        {filtered.length > 0 && (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Liste des commandes</caption>
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    <th scope="col" className="px-5 py-3">N° commande</th>
                    <th scope="col" className="px-3 py-3">Client</th>
                    <th scope="col" className="px-3 py-3">Date</th>
                    <th scope="col" className="px-3 py-3">Montant total (FCFA)</th>
                    <th scope="col" className="px-3 py-3">Statut</th>
                    <th scope="col" className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visible.map((order) => (
                    <tr key={order.id} className="transition-colors hover:bg-gray-50/60">
                      <td className="whitespace-nowrap px-5 py-3 font-semibold text-gray-900">{formatOrderNumber(order.number)}</td>
                      <td className="px-3 py-3 text-gray-700">{order.customer.name}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-gray-600">{shortDate.format(new Date(order.createdAt))}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-gray-700">{formatPrice(orderTotal(order))}</td>
                      <td className="px-3 py-3"><OrderStatusBadge status={order.status} /></td>
                      <td className="px-5 py-3"><RowActions order={order} busy={busyId === order.id} onOpen={setOpenId} onStatus={requestStatus} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-gray-100 md:hidden">
              {visible.map((order) => (
                <li key={order.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900">{formatOrderNumber(order.number)}</p>
                      <p className="truncate text-sm text-gray-600">{order.customer.name}</p>
                      <p className="text-xs text-gray-500">{shortDate.format(new Date(order.createdAt))}</p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800">{formatPrice(orderTotal(order))}</p>
                    <RowActions order={order} busy={busyId === order.id} onOpen={setOpenId} onStatus={requestStatus} />
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

      {openOrder && <OrderDetailsModal order={openOrder} busy={busyId === openOrder.id} onStatusChange={requestStatus} onClose={() => setOpenId(null)} />}

      {toCancel && (
        <ConfirmDialog
          icon="lucide:ban"
          title="Annuler cette commande ?"
          message={`La commande ${formatOrderNumber(toCancel.number)} passera au statut « Annulée ». Vous pourrez la remettre « En cours » depuis ses détails.`}
          confirmLabel="Annuler la commande"
          busyLabel="Annulation..."
          busy={busyId === toCancel.id}
          onConfirm={() => applyStatus(toCancel, "cancelled")}
          onCancel={() => setToCancel(null)}
        />
      )}
    </div>
  );
}

function RowActions({ order, busy, onOpen, onStatus }) {
  const base = "flex h-8 w-8 items-center justify-center rounded-md border transition focus:outline-none focus:ring-2 disabled:opacity-50";
  const label = formatOrderNumber(order.number);
  return (
    <div className="flex items-center justify-end gap-2">
      <button type="button" onClick={() => onOpen(order.id)} aria-label={`Voir les détails de ${label}`} title="Voir les détails" className={`${base} border-gray-200 text-gray-600 hover:bg-gray-50 focus:ring-law-green`}>
        <Icon name="lucide:eye" width={15} />
      </button>
      {order.status === "pending" && (
        <>
          <button type="button" disabled={busy} onClick={() => onStatus(order, "delivered")} aria-label={`Marquer ${label} comme livrée`} title="Marquer comme livrée" className={`${base} border-green-100 text-law-green hover:bg-green-50 focus:ring-law-green`}>
            <Icon name="lucide:check" width={15} />
          </button>
          <button type="button" disabled={busy} onClick={() => onStatus(order, "cancelled")} aria-label={`Annuler ${label}`} title="Annuler la commande" className={`${base} border-red-100 text-law-red hover:bg-red-50 focus:ring-law-red`}>
            <Icon name="lucide:x" width={15} />
          </button>
        </>
      )}
    </div>
  );
}
