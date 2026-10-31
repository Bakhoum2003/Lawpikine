import { products } from "../data/products";

// Replace these local functions with HTTP calls when a backend is available.
export const getProducts = () => products;
export const getProductById = (id) =>
  products.find((product) => product.id === id);
export const getProductBySlug = (slug) =>
  products.find((product) => product.slug === slug);
export const getProductsByType = (productType) =>
  products.filter((product) => product.productType === productType);
export const formatPrice = (amount) =>
  `${new Intl.NumberFormat("fr-FR").format(amount)} FCFA`;
