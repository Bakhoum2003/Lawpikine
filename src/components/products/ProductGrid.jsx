import ProductCard from "./ProductCard";
export default function ProductGrid({
  products,
  isFavorite,
  onFavorite,
  onOpenProduct,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          index={index}
          favorite={isFavorite(product.id)}
          onFavorite={onFavorite}
          onOpenProduct={onOpenProduct}
        />
      ))}
    </div>
  );
}
