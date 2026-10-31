import { useState } from "react";
import { formatPrice } from "../../services/productService";
const WHATSAPP = "221776771009";
export default function CheckoutModal({ items, onClose, onComplete }) {
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    city: "",
    address: "",
  });
  const [review, setReview] = useState(false);
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  if (!items.length) return null;
  const change = (e) =>
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    setReview(true);
  };
  const confirm = () => {
    const lines = ["🛍️ *NOUVELLE COMMANDE — LAWPIKING*", ""];
    items.forEach((i) =>
      lines.push(
        `👕 *Produit : ${i.name}*`,
        `Taille : ${i.size}`,
        `Quantité : ${i.qty}`,
        `Sous-total : ${formatPrice(i.price * i.qty)}`,
        "",
      ),
    );
    lines.push(
      `💰 *TOTAL : ${formatPrice(total)}*`,
      "",
      `👤 *CLIENT*`,
      `Nom : ${customer.name}`,
      `Téléphone : ${customer.phone}`,
      `Ville : ${customer.city}`,
      `Adresse : ${customer.address}`,
    );
    window.open(
      `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join("\n"))}`,
      "_blank",
      "noopener",
    );
    onComplete();
  };
  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:p-6">
      <section className="relative mx-auto my-3 w-full max-w-2xl rounded-2xl bg-white shadow-2xl sm:my-8">
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <h2 className="font-display text-2xl tracking-wide">
            FINALISER MA COMMANDE
          </h2>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="p-5 sm:p-8">
          {!review ? (
            <form onSubmit={submit} className="space-y-5">
              <h3 className="text-lg font-bold">Informations de livraison</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["name", "Nom complet", "text"],
                  ["phone", "Numéro de téléphone", "tel"],
                  ["city", "Ville", "text"],
                  ["address", "Adresse de livraison", "text"],
                ].map(([key, label, type]) => (
                  <label key={key} className="block text-sm font-medium">
                    {label} <span className="text-law-red">*</span>
                    <input
                      required
                      name={key}
                      type={type}
                      value={customer[key]}
                      onChange={change}
                      className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-3"
                    />
                  </label>
                ))}
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="font-semibold">🚚 Livraison : À domicile</p>
                <p className="mt-1 text-sm font-semibold text-law-green">
                  💵 Paiement à la livraison
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border px-5 py-3"
                >
                  Annuler
                </button>
                <button className="rounded-lg bg-law-red px-5 py-3 font-bold text-white">
                  Voir le récapitulatif
                </button>
              </div>
            </form>
          ) : (
            <div>
              <h3 className="mb-3 text-lg font-bold">🛍️ Votre commande</h3>
              {items.map((i) => (
                <p key={i.id + i.size} className="py-2 border-b">
                  {i.name} — {i.size} × {i.qty}
                </p>
              ))}
              <div className="my-5 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-law-red">{formatPrice(total)}</span>
              </div>
              <p className="rounded-xl bg-gray-50 p-4 text-sm">
                {customer.name}
                <br />
                {customer.phone}
                <br />
                {customer.city}, {customer.address}
              </p>
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setReview(false)}
                  className="rounded-lg border px-5 py-3"
                >
                  Modifier
                </button>
                <button
                  onClick={confirm}
                  className="rounded-lg bg-law-green px-5 py-3 font-bold text-white"
                >
                  ✅ Confirmer la commande
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
