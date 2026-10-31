import { DEFAULT_CATEGORIES } from "../data/categoriesSeed";

// Magasin SYNCHRONE des catégories (localStorage) : unique source de vérité, lue par les
// formulaires et les filtres de produits, et modifiée par services/adminCategoryService.js.
// Il ne dépend d'aucun autre service pour que tout le monde puisse l'importer sans cycle.
//
// Forme d'une catégorie :
//   { id, value (clé stable stockée dans productType), name, description, image (data URL ou ""),
//     enabled, createdAt?, updatedAt? }

const STORAGE_KEY = "lawpikingAdminCategories";
const STORAGE_VERSION = 1;

export function saveCategoryData(categories, nextId) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, nextId, categories }));
    return true;
  } catch {
    return false;
  }
}

export function loadCategoryData() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored?.version === STORAGE_VERSION && Array.isArray(stored.categories)) {
      const highest = Math.max(0, ...stored.categories.map((category) => Number(category.id) || 0));
      return { categories: stored.categories, nextId: Math.max(stored.nextId ?? 0, highest + 1) };
    }
  } catch {
    // Contenu absent ou illisible : on repart des catégories par défaut.
  }
  const categories = DEFAULT_CATEGORIES.map((category) => ({ ...category, createdAt: new Date().toISOString() }));
  const nextId = Math.max(...categories.map((category) => category.id)) + 1;
  saveCategoryData(categories, nextId);
  return { categories, nextId };
}

// Toutes les catégories (actives et inactives) : pour les filtres et les libellés.
export const getCategories = () => loadCategoryData().categories;

// Catégories utilisables pour un NOUVEAU produit.
export const getActiveCategories = () => getCategories().filter((category) => category.enabled);

// Nom affiché d'une catégorie à partir de sa clé (la clé elle-même si elle est inconnue).
export const getCategoryLabel = (value) => getCategories().find((category) => category.value === value)?.name ?? value;
