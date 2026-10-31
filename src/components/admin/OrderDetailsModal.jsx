import { useEffect, useRef } from "react";
import Icon from "../common/Icon";
import OrderStatusBadge from "./OrderStatusBadge";
import { ORDER_STATUSES } from "../../data/ordersDemo";
import { formatOrderNumber, orderQuantity, orderTotal } from "../../services/adminOrderService";
import { formatPrice } from "../../services/productService";

const dateTime = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
const NOT_PROVIDED = "Non renseigné";

// Détails d'une commande : produits, quantités, prix, total, coordonnées et changement de statut.
export default function OrderDetailsModal({ order, busy = false, onStatusChange, onClose }) {
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

  const { customer } = order;
  const contact = [
    ["Nom", customer.name],
    ["Téléphone", customer.phone],
    ["Ville", customer.city],
    ["Adresse", customer.address],
  ];

  return (
    <div className="fixed inset-0 z-[85] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="order-title" className="slide-in flex max-h-[92vh] w-full max-w-2xl flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-gray-100 p-5">
          <div>
            <h2 id="order-title" className="text-lg font-bold text-gray-900">Commande {formatOrderNumber(order.number)}</h2>
            <p className="mt-0.5 text-xs text-gray-500">Passée le {dateTime.format(new Date(order.createdAt))}</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Fermer" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-law-green">
            <Icon name="lucide:x" width={18} />
          </button>
        </header>

        <div className="space-y-6 overflow-y-auto p-5">
          {order.demo && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">Commande de démonstration : elle n'a pas été passée par un vrai client.</p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              Statut actuel <OrderStatusBadge status={order.status} />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              Changer le statut
              <select value={order.status} disabled={busy} onChange={(event) => onStatusChange(order, event.target.value)} className="rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 outline-none transition focus:border-law-green focus:ring-2 focus:ring-green-100 disabled:opacity-60">
                {ORDER_STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
              </select>
            </label>
          </div>

          <section aria-label="Produits commandés">
            <h3 className="mb-2 text-sm font-bold text-gray-900">Produits commandés</h3>
            <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100">
              {order.items.map((item) => (
                <li key={`${item.slug}-${item.size}`} className="flex items-center gap-3 p-3">
                  <img src={item.img} alt={item.name} className="h-12 w-12 shrink-0 rounded-lg bg-gray-100 object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">Taille {item.size} · {item.qty} × {formatPrice(item.price)}</p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-gray-800">{formatPrice(item.price * item.qty)}</p>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center justify-between px-1 text-sm">
              <span className="text-gray-500">{orderQuantity(order)} article{orderQuantity(order) > 1 ? "s" : ""}</span>
              <span className="text-base font-extrabold text-gray-900">Total : <span className="text-law-red">{formatPrice(orderTotal(order))}</span></span>
            </div>
          </section>

          <section aria-label="Coordonnées du client">
            <h3 className="mb-2 text-sm font-bold text-gray-900">Client</h3>
            <dl className="grid gap-x-6 gap-y-3 rounded-xl bg-gray-50 p-4 text-sm sm:grid-cols-2">
              {contact.map(([label, value]) => (
                <div key={label} className="min-w-0">
                  <dt className="text-xs text-gray-500">{label}</dt>
                  <dd className={`break-words font-medium ${value ? "text-gray-900" : "text-gray-400"}`}>{value || NOT_PROVIDED}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <footer className="border-t border-gray-100 p-4 text-right">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-law-green">Fermer</button>
        </footer>
      </section>
    </div>
  );
}
