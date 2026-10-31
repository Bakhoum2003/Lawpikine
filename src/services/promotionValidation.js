// Règles de validation d'une promotion, partagées par le formulaire, le service et
// l'interrupteur d'activation. Les valeurs peuvent être des textes de formulaire.

export const DISCOUNT_TYPES = [
  { value: "percent", label: "Pourcentage (%)" },
  { value: "fixed", label: "Montant fixe (FCFA)" },
];

export const PROMO_LIMITS = { nameMax: 80, fixedMax: 10000000 };

const collapse = (text) => String(text ?? "").replace(/\s+/g, " ").trim();
const digits = (value) => String(value ?? "").replace(/\s/g, "");
const isDate = (text) => /^\d{4}-\d{2}-\d{2}$/.test(text) && !Number.isNaN(Date.parse(`${text}T00:00:00`));

// products : produits existants [{ slug, price }], utilisés pour vérifier la cible et le plafond du montant fixe.
export function validatePromotion(values, { products = [] } = {}) {
  const errors = {};
  const name = collapse(values.name);
  if (!name) errors.name = "Le nom de la promotion est obligatoire.";
  else if (name.length > PROMO_LIMITS.nameMax) errors.name = `Le nom ne doit pas dépasser ${PROMO_LIMITS.nameMax} caractères.`;

  const type = values.discountType;
  const raw = digits(values.value);
  if (!DISCOUNT_TYPES.some((item) => item.value === type)) errors.discountType = "Choisissez un type de réduction.";
  if (!raw) errors.value = "La valeur de la réduction est obligatoire.";
  else if (!/^\d+$/.test(raw) || Number(raw) <= 0) errors.value = "La valeur doit être un nombre entier supérieur à 0.";
  else if (type === "percent" && Number(raw) > 100) errors.value = "Un pourcentage doit être compris entre 1 et 100.";
  else if (type === "fixed" && Number(raw) > PROMO_LIMITS.fixedMax) errors.value = "Ce montant est trop élevé.";

  const startOk = isDate(values.startDate);
  const endOk = isDate(values.endDate);
  if (!values.startDate) errors.startDate = "La date de début est obligatoire.";
  else if (!startOk) errors.startDate = "Date de début non valide.";
  if (!values.endDate) errors.endDate = "La date de fin est obligatoire.";
  else if (!endOk) errors.endDate = "Date de fin non valide.";
  else if (startOk && values.endDate <= values.startDate) errors.endDate = "La date de fin doit être postérieure à la date de début.";

  const slugs = values.productSlugs ?? [];
  const known = new Set(products.map((product) => product.slug));
  const targets = values.scope === "selected" ? products.filter((product) => slugs.includes(product.slug)) : products;
  if (values.scope !== "all" && values.scope !== "selected") errors.scope = "Choisissez les produits concernés.";
  else if (values.scope === "selected" && !slugs.some((slug) => known.has(slug)))
    errors.productSlugs = "Sélectionnez au moins un produit existant.";

  if (!errors.value && type === "fixed" && targets.length) {
    const cheapest = Math.min(...targets.map((product) => Number(product.price)));
    if (Number(raw) >= cheapest) errors.value = `Le montant doit rester inférieur au prix du produit le moins cher concerné (${new Intl.NumberFormat("fr-FR").format(cheapest)} FCFA).`;
  }
  return errors;
}

// Valeurs validées → données enregistrées.
export function toPromotionPayload(values) {
  return {
    name: collapse(values.name),
    discountType: values.discountType,
    value: Number(digits(values.value)),
    startDate: values.startDate,
    endDate: values.endDate,
    scope: values.scope,
    productSlugs: values.scope === "selected" ? [...new Set(values.productSlugs)] : [],
  };
}

// Promotion enregistrée → valeurs du formulaire.
export function promotionToFormValues(promotion) {
  return {
    name: promotion.name,
    discountType: promotion.discountType,
    value: String(promotion.value),
    startDate: promotion.startDate,
    endDate: promotion.endDate,
    scope: promotion.scope,
    productSlugs: [...(promotion.productSlugs ?? [])],
  };
}

export class PromotionValidationError extends Error {
  constructor(fields) {
    super("Certaines informations de la promotion sont invalides.");
    this.name = "PromotionValidationError";
    this.fields = fields;
  }
}
