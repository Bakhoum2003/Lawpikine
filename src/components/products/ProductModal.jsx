import { useState } from "react";
import Icon from "../common/Icon";
import { formatPrice } from "../../services/productService";
export default function ProductModal({ product, onClose, onAdd }) {
  const [size, setSize] = useState(product?.sizes[1] || "M");
  if (!product) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center"
        >
          <Icon name="lucide:x" />
        </button>
        <div className="grid md:grid-cols-2">
          <div
            className={`bg-gradient-to-br ${product.bgColor} p-8 sm:p-12 flex items-center justify-center min-h-[400px]`}
          >
            <img
              src={product.img}
              alt={product.name}
              className="max-h-96 object-contain drop-shadow-2xl"
            />
          </div>
          <div className="p-8 sm:p-10 flex flex-col justify-center">
            <h2 className="font-display text-4xl sm:text-5xl tracking-wide mb-2">
              {product.name}
            </h2>
            <p className="font-display text-3xl text-law-red mb-6">
              {formatPrice(product.price)}
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">{product.desc}</p>
            <div className="mb-8">
              <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-3">
                Choisir la taille
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((item) => (
                  <button
                    key={item}
                    onClick={() => setSize(item)}
                    className={`size-btn text-sm font-bold px-5 py-2.5 border-2 border-gray-200 hover:border-law-red ${size === item ? "active" : ""}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => {
                onAdd(product, size);
                onClose();
              }}
              className="w-full bg-law-red text-white font-bold text-sm tracking-widest uppercase py-4 hover:bg-law-red-dark shadow-lg shadow-red-200 flex items-center justify-center gap-3"
            >
              <Icon name="lucide:shopping-bag" width={18} />
              Ajouter au panier
            </button>
            <p className="text-center text-[11px] text-gray-400 mt-4">
              Livraison gratuite • Retour sous 30 jours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
