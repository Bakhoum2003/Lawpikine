import { memo } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../common/Icon";
import { formatPrice } from "../../services/productService";
function ProductCard({ product, favorite, onFavorite, onOpenProduct, index = 0 }) {
  const navigate = useNavigate();
  return (
    <article
      className="product-card group cursor-pointer"
      onClick={() => onOpenProduct ? onOpenProduct(product.slug, navigate) : navigate(`/produit/${product.slug}`)}
    >
      <div
        className={`relative mb-3 aspect-square overflow-hidden rounded-xl bg-gradient-to-br ${product.bgColor}`}
      >
        <img
          src={product.img}
          alt={product.name}
          className="product-img h-full w-full object-contain p-5 sm:p-6 transition-transform duration-500 drop-shadow-xl"
        />
        <button
          onClick={(event) => {
            event.stopPropagation();
            onFavorite(product.id);
          }}
          aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          aria-pressed={favorite}
          className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:scale-110 hover:text-law-red focus:outline-none focus:ring-2 focus:ring-law-red ${favorite ? "text-law-red" : "text-gray-700"}`}
        >
          <Icon
            name="lucide:heart"
            width={16}
            className={favorite ? "fill-current" : ""}
          />
        </button>
        <div className="product-overlay absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300">
          <span className="bg-white px-4 py-2 text-[10px] font-bold tracking-widest uppercase text-gray-900">
            Voir détails
          </span>
        </div>
      </div>
      <div className="px-1">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="font-display text-xl tracking-wide uppercase text-gray-900 transition-colors group-hover:text-law-red">
            {product.name}
          </h3>
          <span className="shrink-0 font-display text-xl text-law-red">
            {formatPrice(product.price)}
          </span>
        </div>
        <p className="mb-2 line-clamp-2 text-xs text-gray-400">
          {product.desc}
        </p>
        <div className="flex gap-1.5">
          {product.sizes?.map((size) => (
            <span
              key={size}
              className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-400"
            >
              {size}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export default memo(ProductCard);
