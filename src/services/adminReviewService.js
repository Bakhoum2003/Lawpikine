import { DEMO_REVIEWS } from "../data/reviewsDemo";

// Source de données centralisée des avis clients pour l'administration.
//
// ⚠️ La boutique publique ne collecte PAS d'avis : son formulaire « Donnez votre avis »
// ouvre seulement un e-mail (mailto:) et les témoignages du site sont du contenu statique.
// Rien n'est donc enregistré dans l'application. Ce service conserve dans localStorage des
// avis de DÉMONSTRATION (marqués `demo: true`) et prépare la structure d'une future
// intégration. Pour passer à l'API Node.js, il suffira de remplacer le contenu des
// fonctions par des appels fetch :
//   listAdminReviews()               → GET    /api/reviews
//   updateAdminReviewStatus(id, st)  → PATCH  /api/reviews/:id/status
//   deleteAdminReview(id)            → DELETE /api/reviews/:id
// (la création viendra du formulaire public quand le backend existera ; les avis
// « approved » pourront alors être affichés sur la boutique — rien n'est modifié ici.)
//
// Forme d'un avis :
//   { id, customerName, rating (1-5), comment, productSlug | null, createdAt (ISO),
//     status: "approved" | "pending" | "refused", demo?: true }

const STORAGE_KEY = "lawpikingAdminReviews";
const STORAGE_VERSION = 1;
const VALID_STATUSES = ["approved", "pending", "refused"];

// Positif : 4★ et plus · négatif : 2★ et moins · 3★ = neutre (ni l'un ni l'autre).
export const isPositive = (review) => review.rating >= 4;
export const isNegative = (review) => review.rating <= 2;

// Statistiques calculées sur les avis non refusés (un avis refusé ne compte pas).
export function computeReviewStats(reviews) {
  const counted = reviews.filter((review) => review.status !== "refused");
  const total = counted.length;
  const percent = (count) => (total ? Math.round((count / total) * 100) : 0);
  return {
    total,
    average: total ? counted.reduce((sum, review) => sum + review.rating, 0) / total : 0,
    positive: percent(counted.filter(isPositive).length),
    negative: percent(counted.filter(isNegative).length),
  };
}

function buildDemoReviews() {
  const now = new Date();
  return DEMO_REVIEWS.map((demo, index) => {
    const createdAt = new Date(now);
    createdAt.setDate(now.getDate() - demo.days);
    createdAt.setHours(10, 0, 0, 0);
    const number = DEMO_REVIEWS.length - index;
    return {
      id: number,
      customerName: `Client démo ${number}`,
      rating: demo.rating,
      comment: demo.comment,
      productSlug: demo.productSlug,
      createdAt: createdAt.toISOString(),
      status: demo.status,
      demo: true,
    };
  });
}

function save(reviews) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, reviews }));
    return true;
  } catch {
    return false;
  }
}

function load() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    // Une liste vide est valide : elle signifie « démo retirée » et non « jamais initialisé ».
    if (stored?.version === STORAGE_VERSION && Array.isArray(stored.reviews)) return stored.reviews;
  } catch {
    // Contenu absent ou illisible : on repart de la démonstration.
  }
  const reviews = buildDemoReviews();
  save(reviews);
  return reviews;
}

// Simule le délai d'un appel réseau (à supprimer avec l'API).
const simulateLatency = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

// Les plus récents d'abord.
export async function listAdminReviews() {
  return [...load()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// Retourne l'avis mis à jour.
export async function updateAdminReviewStatus(id, status) {
  if (!VALID_STATUSES.includes(status)) throw new Error("Statut non valide.");
  const reviews = load();
  const current = reviews.find((review) => String(review.id) === String(id));
  if (!current) throw new Error("Cet avis n'existe plus.");
  await simulateLatency();
  const updated = { ...current, status, updatedAt: new Date().toISOString() };
  if (!save(reviews.map((review) => (review === current ? updated : review)))) {
    throw new Error("Impossible d'enregistrer le changement (stockage du navigateur indisponible).");
  }
  return updated;
}

// Retourne la liste restante.
export async function deleteAdminReview(id) {
  const remaining = load().filter((review) => String(review.id) !== String(id));
  await simulateLatency(250);
  save(remaining);
  return remaining;
}

// Outils de démonstration : retirer tous les avis (état vide) / restaurer la démo.
export async function clearAdminReviews() {
  save([]);
  return [];
}

export async function resetAdminReviews() {
  const reviews = buildDemoReviews();
  save(reviews);
  return reviews;
}
