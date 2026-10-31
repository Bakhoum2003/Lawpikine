import { getProducts } from "./productService";
import { getCategories } from "./categoryStore";
import { DEFAULT_LOW_STOCK_THRESHOLD, DEMO_STOCK_BY_SLUG } from "../data/adminProductsSeed";
import { ProductValidationError, toProductPayload, validateProduct, validateStockValues } from "./productValidation";

// Source de données centralisée des produits pour l'administration.
//
// Version frontend : les produits sont initialisés UNE FOIS à partir du catalogue
// existant (data/products.js) + le stock de démonstration, puis conservés dans
// localStorage. Les pages n'appellent que les fonctions exportées ci-dessous
// (toutes asynchrones) : pour passer à l'API Node.js, il suffira de remplacer le
// contenu de ces fonctions par des appels fetch, par exemple :
//   listAdminProducts()      → GET    /api/products
//   getAdminProduct(id)      → GET    /api/products/:id
//   createAdminProduct(data) → POST   /api/products
//   updateAdminProduct(id, data) → PUT /api/products/:id
//   updateAdminProductStock(id, data) → PATCH /api/products/:id/stock
//   deleteAdminProduct(id)   → DELETE /api/products/:id
//
// ⚠️ La boutique publique lit toujours le catalogue statique : ce qui est fait ici
// ne la modifie pas (les deux sources seront réunies avec le backend).

const STORAGE_KEY = "lawpikingAdminProducts";
const STORAGE_VERSION = 1;
const SLUG_PREFIX = { tshirts: "tshirt", pulls: "pull", bonnets: "bonnet" };

const seedProducts = () =>
  getProducts().map((product) => ({ ...product, stock: DEMO_STOCK_BY_SLUG[product.slug] ?? 0 }));

const nextIdFor = (products) => Math.max(0, ...products.map((product) => Number(product.id) || 0)) + 1;

// Retourne false si le navigateur refuse l'écriture (stockage plein ou indisponible).
function save(products, nextId) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, nextId, products }));
    return true;
  } catch {
    return false;
  }
}

function load() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored?.version === STORAGE_VERSION && Array.isArray(stored.products)) {
      // nextId évite de réutiliser l'identifiant d'un produit supprimé.
      return { products: stored.products, nextId: Math.max(stored.nextId ?? 0, nextIdFor(stored.products)) };
    }
  } catch {
    // Contenu absent ou illisible : on repart du catalogue.
  }
  const products = seedProducts();
  const nextId = nextIdFor(products);
  save(products, nextId);
  return { products, nextId };
}

const slugify = (text) =>
  text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// Même logique que le catalogue (« tshirt-noir-intense »), sans répéter le préfixe s'il est déjà dans le nom.
function buildSlug({ name, productType }) {
  const prefix = SLUG_PREFIX[productType] ?? (productType || "produit");
  const base = slugify(name) || prefix;
  return base === prefix || base.startsWith(`${prefix}-`) ? base : `${prefix}-${base}`;
}

function uniqueSlug(base, products) {
  const taken = new Set(products.map((product) => product.slug));
  let slug = base;
  for (let index = 2; taken.has(slug); index += 1) slug = `${base}-${index}`;
  return slug;
}

// Une catégorie désactivée ne peut pas recevoir de nouveau produit (les produits déjà associés restent).
const inactiveCategoryErrors = (value) =>
  getCategories().find((category) => category.value === value)?.enabled === false
    ? { category: "Cette catégorie est désactivée : choisissez une catégorie active." }
    : null;

// Simule le délai d'un appel réseau (à supprimer avec l'API).
const simulateLatency = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

// Le statut est dérivé du stock, jamais stocké (une seule vérité).
export const isInStock = (product) => Number(product.stock) > 0;

// Seuil d'alerte d'un produit (valeur par défaut si aucun n'a été défini).
export const getLowStockThreshold = (product) => Number(product.lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD);

// "out" (rupture : 0) · "low" (0 < stock ≤ seuil) · "in". Dérivé du stock et du seuil, jamais stocké.
export function getStockStatus(product) {
  const stock = Number(product.stock);
  if (!(stock > 0)) return "out";
  return stock <= getLowStockThreshold(product) ? "low" : "in";
}

export async function listAdminProducts() {
  return load().products;
}

export async function getAdminProduct(id) {
  return load().products.find((product) => String(product.id) === String(id)) ?? null;
}

// values : valeurs du formulaire (voir productValidation.js). Retourne le produit créé.
export async function createAdminProduct(values) {
  const { products, nextId } = load();
  const errors = validateProduct(values, { existingNames: products.map((product) => product.name) });
  if (Object.keys(errors).length) throw new ProductValidationError(errors);
  const inactive = inactiveCategoryErrors(values.category);
  if (inactive) throw new ProductValidationError(inactive);

  await simulateLatency();
  const data = toProductPayload(values);
  const product = {
    ...data,
    id: nextId,
    slug: uniqueSlug(buildSlug(data), products),
    createdAt: new Date().toISOString(),
  };
  // Le nouveau produit est placé en tête : il apparaît en haut de la première page.
  if (!save([product, ...products], nextId + 1)) {
    throw new Error("Le stockage du navigateur est plein. Supprimez des produits ou choisissez une image plus légère.");
  }
  return product;
}

// Modifie UN produit : son identifiant, son slug et sa date de création ne changent pas.
// values : valeurs du formulaire (même format que pour la création). Retourne le produit mis à jour.
export async function updateAdminProduct(id, values) {
  const { products, nextId } = load();
  const current = products.find((product) => String(product.id) === String(id));
  if (!current) throw new Error("Ce produit n'existe plus. Retournez à la liste des produits.");

  // Le produit modifié ne compte pas comme doublon de lui-même.
  const otherNames = products.filter((product) => product !== current).map((product) => product.name);
  const errors = validateProduct(values, { existingNames: otherNames });
  if (Object.keys(errors).length) throw new ProductValidationError(errors);
  // Garder la catégorie actuelle (même désactivée) est permis ; en choisir une désactivée ne l'est pas.
  const inactive = values.category !== current.productType ? inactiveCategoryErrors(values.category) : null;
  if (inactive) throw new ProductValidationError(inactive);

  await simulateLatency();
  const updated = {
    ...current,
    ...toProductPayload(values),
    id: current.id,
    slug: current.slug,
    updatedAt: new Date().toISOString(),
  };
  if (!save(products.map((product) => (product === current ? updated : product)), nextId)) {
    throw new Error("Le stockage du navigateur est plein. Choisissez une image plus légère ou supprimez des produits.");
  }
  return updated;
}

// Met à jour uniquement le stock et le seuil d'alerte d'UN produit (même magasin de données
// que les pages Produits : la liste des produits voit immédiatement le changement).
export async function updateAdminProductStock(id, { stock, threshold }) {
  const errors = validateStockValues({ stock, threshold });
  if (Object.keys(errors).length) throw new ProductValidationError(errors);
  const { products, nextId } = load();
  const current = products.find((product) => String(product.id) === String(id));
  if (!current) throw new Error("Ce produit n'existe plus. Actualisez la page.");

  await simulateLatency(300);
  const updated = { ...current, stock: Number(String(stock).replace(/\s/g, "")), lowStockThreshold: Number(String(threshold).replace(/\s/g, "")), updatedAt: new Date().toISOString() };
  if (!save(products.map((product) => (product === current ? updated : product)), nextId)) {
    throw new Error("Impossible d'enregistrer le changement (stockage du navigateur indisponible).");
  }
  return updated;
}

export async function deleteAdminProduct(id) {
  const { products, nextId } = load();
  const remaining = products.filter((product) => String(product.id) !== String(id));
  save(remaining, nextId);
  return remaining;
}

// Outil de développement : restaure les produits de démonstration.
export async function resetAdminProducts() {
  const products = seedProducts();
  save(products, nextIdFor(products));
  return products;
}
