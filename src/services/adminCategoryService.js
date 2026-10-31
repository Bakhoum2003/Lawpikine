import { listAdminProducts } from "./adminProductService";
import { loadCategoryData, saveCategoryData } from "./categoryStore";
import { CategoryInUseError, CategoryValidationError, toCategoryPayload, validateCategory } from "./categoryValidation";

// Service centralisé des catégories pour l'administration.
//
// Version frontend : les catégories sont conservées dans localStorage (voir categoryStore.js)
// et les produits y font référence par la clé `value` (champ `productType`). Les pages
// n'appellent que ces fonctions asynchrones ; pour passer à l'API Node.js, il suffira de
// remplacer leur contenu par des appels fetch :
//   listAdminCategories()              → GET    /api/categories
//   getCategoryProductCounts()         → GET    /api/categories?withCounts=1
//   createAdminCategory(values)        → POST   /api/categories
//   updateAdminCategory(id, values)    → PUT    /api/categories/:id
//   setAdminCategoryEnabled(id, on)    → PATCH  /api/categories/:id/enabled
//   deleteAdminCategory(id)            → DELETE /api/categories/:id  (le serveur doit refuser
//                                         avec 409 si des produits utilisent la catégorie)
//
// ⚠️ La boutique publique garde son propre filtre de catégories : rien n'y est modifié.

const STORAGE_FULL = "Impossible d'enregistrer (stockage du navigateur indisponible). Choisissez une image plus légère.";
const simulateLatency = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

const slugify = (text) =>
  text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function uniqueValue(name, categories) {
  const base = slugify(name) || "categorie";
  const taken = new Set(categories.map((category) => category.value));
  let value = base;
  for (let index = 2; taken.has(value); index += 1) value = `${base}-${index}`;
  return value;
}

export async function listAdminCategories() {
  return loadCategoryData().categories;
}

// { [value]: nombre de produits } — tous les produits comptent, actifs ou non.
export async function getCategoryProductCounts() {
  const counts = {};
  for (const product of await listAdminProducts()) counts[product.productType] = (counts[product.productType] ?? 0) + 1;
  return counts;
}

export async function createAdminCategory(values) {
  const { categories, nextId } = loadCategoryData();
  const errors = validateCategory(values, { existingNames: categories.map((category) => category.name) });
  if (Object.keys(errors).length) throw new CategoryValidationError(errors);
  await simulateLatency();
  const category = { ...toCategoryPayload(values), id: nextId, value: uniqueValue(values.name, categories), createdAt: new Date().toISOString() };
  if (!saveCategoryData([...categories, category], nextId + 1)) throw new Error(STORAGE_FULL);
  return category;
}

// L'identifiant et la clé `value` ne changent jamais (les produits restent associés).
export async function updateAdminCategory(id, values) {
  const { categories, nextId } = loadCategoryData();
  const current = categories.find((category) => String(category.id) === String(id));
  if (!current) throw new Error("Cette catégorie n'existe plus.");
  const errors = validateCategory(values, { existingNames: categories.filter((category) => category !== current).map((category) => category.name) });
  if (Object.keys(errors).length) throw new CategoryValidationError(errors);
  await simulateLatency();
  const updated = { ...current, ...toCategoryPayload(values), id: current.id, value: current.value, updatedAt: new Date().toISOString() };
  if (!saveCategoryData(categories.map((category) => (category === current ? updated : category)), nextId)) throw new Error(STORAGE_FULL);
  return updated;
}

// Désactiver n'enlève rien aux produits déjà associés : seule la création de nouveaux produits est bloquée.
export async function setAdminCategoryEnabled(id, enabled) {
  const { categories, nextId } = loadCategoryData();
  const current = categories.find((category) => String(category.id) === String(id));
  if (!current) throw new Error("Cette catégorie n'existe plus.");
  await simulateLatency(250);
  const updated = { ...current, enabled: Boolean(enabled), updatedAt: new Date().toISOString() };
  if (!saveCategoryData(categories.map((category) => (category === current ? updated : category)), nextId)) throw new Error(STORAGE_FULL);
  return updated;
}

// Refuse (CategoryInUseError) tant que des produits utilisent la catégorie ; ne supprime jamais de produit.
export async function deleteAdminCategory(id) {
  const { categories, nextId } = loadCategoryData();
  const current = categories.find((category) => String(category.id) === String(id));
  if (!current) return categories;
  const inUse = (await getCategoryProductCounts())[current.value] ?? 0;
  if (inUse > 0) throw new CategoryInUseError(inUse);
  await simulateLatency(250);
  const remaining = categories.filter((category) => category !== current);
  saveCategoryData(remaining, nextId);
  return remaining;
}
