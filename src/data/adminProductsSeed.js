// Données de démonstration propres à l'administration des produits.
// Le catalogue (nom, image, prix, tailles…) reste dans data/products.js :
// seul ce qui n'y existe pas (le stock) est défini ici.

// Les catégories ne sont plus définies ici : elles viennent de la source centralisée
// services/categoryStore.js (gérée par la page Catégories). Ré-export pour les pages existantes.
export { getCategoryLabel } from "../services/categoryStore";

// Options proposées par le formulaire produit (ajout, puis modification).
const STANDARD_SIZES = ["S", "M", "L", "XL", "XXL"];
export const SIZES_BY_CATEGORY = {
  tshirts: STANDARD_SIZES,
  pulls: STANDARD_SIZES,
  bonnets: ["Unique"],
};
export const getAvailableSizes = (category) => SIZES_BY_CATEGORY[category] ?? STANDARD_SIZES;

export const PRODUCT_COLORS = [
  { name: "Noir", hex: "#111827" },
  { name: "Blanc", hex: "#FFFFFF" },
  { name: "Gris", hex: "#9CA3AF" },
  { name: "Rouge", hex: "#DC2626" },
  { name: "Bordeaux", hex: "#7F1D1D" },
  { name: "Orange", hex: "#F97316" },
  { name: "Jaune", hex: "#FACC15" },
  { name: "Vert", hex: "#15803D" },
  { name: "Bleu", hex: "#1D4ED8" },
  { name: "Marron", hex: "#92400E" },
];

// Seuil d'alerte par défaut : un produit dont le stock est inférieur ou égal à ce seuil
// (mais supérieur à 0) est en « stock faible ». Modifiable produit par produit.
export const DEFAULT_LOW_STOCK_THRESHOLD = 10;

// Stock de démonstration par produit existant (clé = slug du catalogue).
// 0 = rupture de stock.
export const DEMO_STOCK_BY_SLUG = {
  "tshirt-vert-menthe": 25,
  "tshirt-vert-fonce": 18,
  "tshirt-gris-chine": 12,
  "tshirt-bleu-royal": 8,
  "tshirt-noir-intense": 15,
  "tshirt-rouge-cardinal": 0,
  "tshirt-marron": 22,
  "tshirt-orange": 0,
  "tshirt-jaune": 10,
};
