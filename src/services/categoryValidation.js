export const CATEGORY_LIMITS = { nameMax: 40, descriptionMax: 200 };

const collapse = (text) => String(text ?? "").replace(/\s+/g, " ").trim();
const normalizeName = (name) => collapse(name).normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

// existingNames : noms des AUTRES catégories (pas de doublon, accents/majuscules/espaces ignorés).
export function validateCategory(values, { existingNames = [] } = {}) {
  const errors = {};
  const name = collapse(values.name);
  if (!name) errors.name = "Le nom de la catégorie est obligatoire.";
  else if (name.length > CATEGORY_LIMITS.nameMax) errors.name = `Le nom ne doit pas dépasser ${CATEGORY_LIMITS.nameMax} caractères.`;
  else if (existingNames.some((existing) => normalizeName(existing) === normalizeName(name))) errors.name = "Une catégorie porte déjà ce nom.";
  if (String(values.description ?? "").length > CATEGORY_LIMITS.descriptionMax)
    errors.description = `La description ne doit pas dépasser ${CATEGORY_LIMITS.descriptionMax} caractères.`;
  return errors;
}

export const toCategoryPayload = (values) => ({
  name: collapse(values.name),
  description: String(values.description ?? "").trim(),
  image: values.image ?? "",
  enabled: Boolean(values.enabled),
});

export class CategoryValidationError extends Error {
  constructor(fields) {
    super("Certaines informations de la catégorie sont invalides.");
    this.name = "CategoryValidationError";
    this.fields = fields;
  }
}

// Suppression refusée : des produits utilisent encore la catégorie.
export class CategoryInUseError extends Error {
  constructor(count) {
    super(
      `Cette catégorie contient ${count} produit${count > 1 ? "s" : ""}. Réaffectez d'abord ${count > 1 ? "ces produits" : "ce produit"} à une autre catégorie (page Produits, bouton Modifier), puis réessayez. Aucun produit n'est supprimé.`,
    );
    this.name = "CategoryInUseError";
    this.count = count;
  }
}
