import { listAdminProducts } from "./adminProductService";
import { PromotionValidationError, toPromotionPayload, validatePromotion } from "./promotionValidation";

// Source de données centralisée des promotions pour l'administration.
//
// Version frontend : les promotions sont conservées dans localStorage. Les pages
// n'appellent que les fonctions exportées ci-dessous (asynchrones) : pour passer à
// l'API Node.js, il suffira de remplacer leur contenu par des appels fetch :
//   listAdminPromotions()                → GET    /api/promotions
//   createAdminPromotion(values)         → POST   /api/promotions
//   updateAdminPromotion(id, values)     → PUT    /api/promotions/:id
//   setAdminPromotionEnabled(id, on)     → PATCH  /api/promotions/:id/enabled
//   deleteAdminPromotion(id)             → DELETE /api/promotions/:id
//
// Forme d'une promotion :
//   { id, name, discountType: "percent" | "fixed", value, startDate "AAAA-MM-JJ", endDate,
//     enabled: boolean, scope: "all" | "selected", productSlugs: [slug], createdAt, updatedAt? }
// Les produits sont repérés par leur slug (identique dans le catalogue public) : la boutique
// pourra donc s'en servir plus tard avec findActivePromotion / getDiscountedPrice ci-dessous.
//
// ⚠️ Cette étape ne change AUCUN prix de la boutique publique et n'applique aucune
// réduction aux commandes. Aucune promotion de démonstration n'est créée.

const STORAGE_KEY = "lawpikingAdminPromotions";
const STORAGE_VERSION = 1;

function save(promotions, nextId) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, nextId, promotions }));
    return true;
  } catch {
    return false;
  }
}

function load() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored?.version === STORAGE_VERSION && Array.isArray(stored.promotions)) {
      const highest = Math.max(0, ...stored.promotions.map((promotion) => Number(promotion.id) || 0));
      return { promotions: stored.promotions, nextId: Math.max(stored.nextId ?? 0, highest + 1) };
    }
  } catch {
    // Contenu absent ou illisible : on repart d'une liste vide.
  }
  return { promotions: [], nextId: 1 };
}

// Simule le délai d'un appel réseau (à supprimer avec l'API).
const simulateLatency = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

const STORAGE_FULL = "Impossible d'enregistrer (stockage du navigateur indisponible).";
const productsForValidation = async () => (await listAdminProducts()).map(({ slug, price }) => ({ slug, price }));

// ---- Fonctions pures (utilisables par la future boutique publique) ----

export const todayKey = (now = new Date()) =>
  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

// "active" : activée, valide et dans ses dates. Sinon "inactive", avec la raison :
// "disabled" (désactivée), "invalid" (informations invalides), "scheduled" (pas encore commencée), "expired" (terminée).
export function getPromotionStatus(promotion, products = [], today = todayKey()) {
  if (!promotion.enabled) return { active: false, reason: "disabled" };
  if (Object.keys(validatePromotion(promotion, { products })).length) return { active: false, reason: "invalid" };
  if (today < promotion.startDate) return { active: false, reason: "scheduled" };
  if (today > promotion.endDate) return { active: false, reason: "expired" };
  return { active: true, reason: null };
}

export const promotionAppliesTo = (promotion, slug) => promotion.scope === "all" || promotion.productSlugs.includes(slug);

export function getDiscountedPrice(price, promotion) {
  const reduced = promotion.discountType === "percent" ? price - Math.round((price * promotion.value) / 100) : price - promotion.value;
  return Math.max(0, reduced);
}

// Première promotion active qui concerne ce produit (la plus avantageuse), ou null.
export function findActivePromotion(promotions, product, today = todayKey()) {
  const candidates = promotions.filter((promotion) => promotionAppliesTo(promotion, product.slug) && getPromotionStatus(promotion, [product], today).active);
  return candidates.sort((a, b) => getDiscountedPrice(product.price, a) - getDiscountedPrice(product.price, b))[0] ?? null;
}

// ---- Accès aux données ----

// Les plus récentes d'abord.
export async function listAdminPromotions() {
  return load().promotions;
}

export async function createAdminPromotion(values) {
  const errors = validatePromotion(values, { products: await productsForValidation() });
  if (Object.keys(errors).length) throw new PromotionValidationError(errors);
  await simulateLatency();
  const { promotions, nextId } = load();
  const promotion = { ...toPromotionPayload(values), id: nextId, enabled: true, createdAt: new Date().toISOString() };
  if (!save([promotion, ...promotions], nextId + 1)) throw new Error(STORAGE_FULL);
  return promotion;
}

export async function updateAdminPromotion(id, values) {
  const errors = validatePromotion(values, { products: await productsForValidation() });
  if (Object.keys(errors).length) throw new PromotionValidationError(errors);
  await simulateLatency();
  const { promotions, nextId } = load();
  const current = promotions.find((promotion) => String(promotion.id) === String(id));
  if (!current) throw new Error("Cette promotion n'existe plus.");
  const updated = { ...current, ...toPromotionPayload(values), id: current.id, updatedAt: new Date().toISOString() };
  if (!save(promotions.map((promotion) => (promotion === current ? updated : promotion)), nextId)) throw new Error(STORAGE_FULL);
  return updated;
}

// Active ou désactive. Activer une promotion dont les informations sont invalides est refusé.
export async function setAdminPromotionEnabled(id, enabled) {
  const { promotions, nextId } = load();
  const current = promotions.find((promotion) => String(promotion.id) === String(id));
  if (!current) throw new Error("Cette promotion n'existe plus.");
  if (enabled) {
    const errors = validatePromotion(current, { products: await productsForValidation() });
    const first = Object.values(errors)[0];
    if (first) throw new Error(`Activation impossible : ${first} Modifiez la promotion.`);
  }
  await simulateLatency(250);
  const updated = { ...current, enabled: Boolean(enabled), updatedAt: new Date().toISOString() };
  if (!save(promotions.map((promotion) => (promotion === current ? updated : promotion)), nextId)) throw new Error(STORAGE_FULL);
  return updated;
}

export async function deleteAdminPromotion(id) {
  const { promotions, nextId } = load();
  const remaining = promotions.filter((promotion) => String(promotion.id) !== String(id));
  save(remaining, nextId);
  return remaining;
}
