import { getAvailableSizes } from "../data/adminProductsSeed";
import { getCategories } from "./categoryStore";

// Règles de validation d'un produit, partagées par le formulaire (ajout, puis
// modification) et par le service. Les valeurs peuvent être des textes de formulaire.

export const LIMITS = {
  nameMax: 80,
  descriptionMax: 1000,
  priceMax: 10000000,
  stockMax: 100000,
  colorsMax: 12,
};

const toText = (value) => String(value ?? "").replace(/\s/g, "");
const collapse = (text) => String(text).replace(/\s+/g, " ").trim();
const normalizeName = (name) => collapse(name).normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

export function validateProduct(values, { existingNames = [] } = {}) {
  const errors = {};
  const name = collapse(values.name ?? "");
  if (!name) errors.name = "Le nom du produit est obligatoire.";
  else if (name.length > LIMITS.nameMax) errors.name = `Le nom ne doit pas dépasser ${LIMITS.nameMax} caractères.`;
  else if (existingNames.some((existing) => normalizeName(existing) === normalizeName(name)))
    errors.name = "Un produit porte déjà ce nom.";

  if (String(values.description ?? "").length > LIMITS.descriptionMax)
    errors.description = `La description ne doit pas dépasser ${LIMITS.descriptionMax} caractères.`;

  const price = toText(values.price);
  if (!price) errors.price = "Le prix est obligatoire.";
  else if (!/^\d+$/.test(price) || Number(price) <= 0)
    errors.price = "Le prix doit être un nombre entier supérieur à 0.";
  else if (Number(price) > LIMITS.priceMax) errors.price = "Ce prix est trop élevé.";

  if (!values.category) errors.category = "Choisissez une catégorie.";
  else if (!getCategories().some((category) => category.value === values.category))
    errors.category = "Catégorie non valide.";

  const stock = toText(values.stock);
  if (!stock) errors.stock = "Indiquez la quantité en stock (0 si aucun).";
  else if (!/^\d+$/.test(stock)) errors.stock = "Le stock doit être un nombre entier, 0 ou plus.";
  else if (Number(stock) > LIMITS.stockMax) errors.stock = "Cette quantité est trop élevée.";

  const sizes = values.sizes ?? [];
  if (sizes.some((size) => !getAvailableSizes(values.category).includes(size)))
    errors.sizes = "Taille non valide pour cette catégorie.";

  if ((values.colors ?? []).length > LIMITS.colorsMax)
    errors.colors = `Sélectionnez au maximum ${LIMITS.colorsMax} couleurs.`;

  return errors;
}

// Modification rapide du stock (page Gestion du stock) : quantité et seuil d'alerte.
export function validateStockValues({ stock, threshold }) {
  const errors = {};
  const check = (value, label) => {
    const text = toText(value);
    if (!text) return `${label} : indiquez un nombre (0 si aucun).`;
    if (!/^\d+$/.test(text)) return `${label} : nombre entier, 0 ou plus.`;
    if (Number(text) > LIMITS.stockMax) return `${label} : quantité trop élevée.`;
    return undefined;
  };
  const stockError = check(stock, "Stock");
  const thresholdError = check(threshold, "Seuil");
  if (stockError) errors.stock = stockError;
  if (thresholdError) errors.threshold = thresholdError;
  return errors;
}

// Valeurs de formulaire validées → données du produit.
export function toProductPayload(values) {
  return {
    name: collapse(values.name),
    desc: String(values.description ?? "").trim(),
    price: Number(toText(values.price)),
    productType: values.category,
    sizes: [...(values.sizes ?? [])],
    colors: (values.colors ?? []).map(({ name, hex }) => ({ name, hex })),
    stock: Number(toText(values.stock)),
    img: values.img ?? "",
  };
}

// Produit enregistré → valeurs du formulaire (sens inverse de toProductPayload).
export function productToFormValues(product) {
  const allowed = getAvailableSizes(product.productType);
  return {
    name: product.name ?? "",
    description: product.desc ?? "",
    price: String(product.price ?? ""),
    category: product.productType ?? "",
    sizes: (product.sizes ?? []).filter((size) => allowed.includes(size)),
    colors: (product.colors ?? []).map(({ name, hex }) => ({ name, hex })),
    stock: String(product.stock ?? 0),
  };
}

// Image enregistrée → état attendu par ProductImageField (null si le produit n'en a pas).
export function productToFormImage(product) {
  if (!product.img) return null;
  const name = product.img.startsWith("data:") ? "" : decodeURIComponent(product.img.split("/").pop() || "");
  return { dataUrl: product.img, name, current: true };
}

export class ProductValidationError extends Error {
  constructor(fields) {
    super("Certaines informations du produit sont invalides.");
    this.name = "ProductValidationError";
    this.fields = fields;
  }
}
