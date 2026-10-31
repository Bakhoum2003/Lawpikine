import { useMemo, useState } from "react";
import { getProducts } from "../../services/productService";
import ProductGrid from "../../components/products/ProductGrid";
import { About } from "../../components/layout/ContentSections";
import HeroSection from "../../components/layout/HeroSection";
const labels = {
  all: "TOUS LES PRODUITS",
  tshirts: "LES T-SHIRTS",
  pulls: "LES PULLS",
  bonnets: "LES BONNETS",
};
export default function StorePage({
  favorites,
  onFavorite,
  onFeedback,
  onOpenProduct,
}) {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const products = useMemo(
    () =>
      getProducts().filter(
        (p) =>
          (category === "all" || p.productType === category) &&
          `${p.name} ${p.desc}`
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .includes(
              search
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase(),
            ),
      ),
    [category, search],
  );
  const unavailable = category === "pulls" || category === "bonnets";
  return (
    <>
      <HeroSection />
      <section id="collection" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
            <div>
              <p className="text-[11px] font-bold tracking-[.3em] uppercase text-law-red mb-3">
                01 — Collection Complète
              </p>
              <h2 className="font-display text-5xl sm:text-6xl tracking-tight">
                {labels[category]}
              </h2>
              <p className="text-gray-500 mt-3 max-w-md">
                Chaque t-shirt est pensé pour s’adapter à ton style, coupe
                regular fit, finitions premium.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(labels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setCategory(key);
                    setSearch("");
                  }}
                  className={`text-[11px] font-bold tracking-widest uppercase px-5 py-2.5 transition-all duration-300 ${category === key ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-law-red hover:text-white"}`}
                >
                  {key === "all"
                    ? "Tous"
                    : label.replace("LES ", "").replace("TSHIRTS", "T-shirts")}
                </button>
              ))}
            </div>
          </div>
          <label className="mb-8 block w-full md:max-w-xl">
            <span className="relative block">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                ⌕
              </span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un produit..."
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm shadow-sm outline-none transition focus:border-law-red focus:ring-2 focus:ring-red-100"
              />
            </span>
          </label>
          {unavailable ? (
            <div className="py-16 text-center">
              <h3 className="font-display text-4xl">Bientôt disponible</h3>
              <p className="mt-3 text-gray-500">
                Notre collection de {category} arrive bientôt. Restez connectés
                !
              </p>
            </div>
          ) : products.length ? (
            <ProductGrid
              products={products}
              isFavorite={(id) => favorites.includes(id)}
              onFavorite={onFavorite}
              onOpenProduct={onOpenProduct}
            />
          ) : (
            <p className="py-12 text-center text-gray-500">
              Aucun produit trouvé pour cette recherche.
            </p>
          )}
        </div>
      </section>
      <About />
    </>
  );
}
