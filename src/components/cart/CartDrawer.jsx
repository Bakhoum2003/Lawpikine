import Icon from "../common/Icon";
import { formatPrice } from "../../services/productService";
export default function CartDrawer({
  open,
  items,
  onClose,
  onQuantity,
  onRemove,
  onCheckout,
}) {
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-display text-2xl tracking-wide">TON PANIER</h3>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <Icon name="lucide:x" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {items.length ? (
            items.map((item) => (
              <div
                key={`${item.id}-${item.size}-${item.color}`}
                className="flex gap-4 mb-4 pb-4 border-b border-gray-100"
              >
                <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-contain p-2"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-bold text-sm truncate">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-gray-400 uppercase">
                        {item.size ? `Taille: ${item.size}` : ""}{item.size && item.color ? " · " : ""}{item.color ? `Couleur: ${item.color}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemove(item)}
                      className="text-gray-300 hover:text-red-500"
                    >
                      <Icon name="lucide:trash-2" width={16} />
                    </button>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button
                        onClick={() => onQuantity(item, -1)}
                        className="w-8 h-8 text-gray-400"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => onQuantity(item, 1)} disabled={item.stock != null && item.qty >= item.stock}
                        className="w-8 h-8 text-gray-400"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-bold text-law-red">
                      {formatPrice(item.price * item.qty)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <Empty />
          )}
        </div>
        {items.length > 0 && (
          <div className="p-6 border-t border-gray-100">
            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Sous-total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Livraison</span>
                <span className="text-law-green">Gratuite</span>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="font-display text-2xl text-law-red">
                  {formatPrice(total)}
                </span>
              </div>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-law-red text-white font-bold text-sm tracking-widest uppercase py-4 hover:bg-law-red-dark"
            >
              Passer la commande
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
function Empty() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon name="lucide:shopping-bag" width={32} className="text-gray-300" />
      </div>
      <p className="text-gray-400 font-medium">Ton panier est vide</p>
      <p className="text-gray-300 text-sm mt-1">
        Ajoute des pièces pour commencer
      </p>
    </div>
  );
}
