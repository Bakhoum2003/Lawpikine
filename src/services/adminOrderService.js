import { DEMO_ORDERS } from "../data/ordersDemo";
import { getProductBySlug } from "./productService";

// Source de données centralisée des commandes pour l'administration.
//
// ⚠️ IMPORTANT : la boutique envoie les commandes UNIQUEMENT par WhatsApp. Elles ne
// sont enregistrées nulle part : cette page ne peut donc pas les afficher. Ce service
// conserve dans localStorage des commandes de DÉMONSTRATION (marquées `demo: true`)
// et prépare la structure d'une future intégration. Pour passer à l'API Node.js,
// il suffira de remplacer le contenu des fonctions par des appels fetch :
//   listAdminOrders()                  → GET    /api/orders
//   getAdminOrder(id)                  → GET    /api/orders/:id
//   updateAdminOrderStatus(id, status) → PATCH  /api/orders/:id/status
//   (à venir) la création : POST /api/orders, appelée par le processus de commande
//   quand le backend existera — le processus WhatsApp actuel n'est pas modifié.
//
// Forme d'une commande :
//   { id, number, createdAt (ISO), status: "pending" | "delivered" | "cancelled",
//     customer: { name, phone, city, address }, items: [{ slug, name, img, size, qty, price }],
//     demo?: true }
// Le montant total est toujours calculé à partir des lignes (orderTotal), jamais stocké.

const STORAGE_KEY = "lawpikingAdminOrders";
const STORAGE_VERSION = 1;
const VALID_STATUSES = ["pending", "delivered", "cancelled"];

export const formatOrderNumber = (number) => `#LWP${String(number).padStart(3, "0")}`;
export const orderTotal = (order) => order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
export const orderQuantity = (order) => order.items.reduce((sum, item) => sum + item.qty, 0);

// Statistiques calculées à partir de la liste fournie (une seule vérité).
export function computeOrderStats(orders) {
  const count = (status) => orders.filter((order) => order.status === status).length;
  return { total: orders.length, pending: count("pending"), delivered: count("delivered"), cancelled: count("cancelled") };
}

function buildDemoOrders() {
  const now = new Date();
  return DEMO_ORDERS.map((demo, index) => {
    const createdAt = new Date(now);
    createdAt.setDate(now.getDate() - demo.days);
    createdAt.setHours(Math.min(demo.hour, demo.days === 0 ? now.getHours() : 23), 0, 0, 0);
    const number = DEMO_ORDERS.length - index;
    return {
      id: number,
      number,
      createdAt: createdAt.toISOString(),
      status: demo.status,
      customer: { name: `Client démo ${number}`, phone: "", city: "", address: "" },
      items: demo.items
        .map(([slug, size, qty]) => {
          const product = getProductBySlug(slug);
          return product ? { slug, name: product.name, img: product.img, size, qty, price: product.price } : null;
        })
        .filter(Boolean),
      demo: true,
    };
  });
}

function save(orders) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, orders }));
    return true;
  } catch {
    return false;
  }
}

function load() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    // Une liste vide est valide : elle signifie « démo retirée » et non « jamais initialisé ».
    if (stored?.version === STORAGE_VERSION && Array.isArray(stored.orders)) return stored.orders;
  } catch {
    // Contenu absent ou illisible : on repart de la démonstration.
  }
  const orders = buildDemoOrders();
  save(orders);
  return orders;
}

// Simule le délai d'un appel réseau (à supprimer avec l'API).
const simulateLatency = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

// Les plus récentes d'abord.
export async function listAdminOrders() {
  return [...load()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getAdminOrder(id) {
  return load().find((order) => String(order.id) === String(id)) ?? null;
}

// Retourne la commande mise à jour.
export async function updateAdminOrderStatus(id, status) {
  if (!VALID_STATUSES.includes(status)) throw new Error("Statut non valide.");
  const orders = load();
  const current = orders.find((order) => String(order.id) === String(id));
  if (!current) throw new Error("Cette commande n'existe plus.");
  await simulateLatency();
  const updated = { ...current, status, updatedAt: new Date().toISOString() };
  if (!save(orders.map((order) => (order === current ? updated : order)))) {
    throw new Error("Impossible d'enregistrer le changement (stockage du navigateur indisponible).");
  }
  return updated;
}

// Outils de démonstration : retirer toutes les commandes (état vide) / restaurer la démo.
export async function clearAdminOrders() {
  save([]);
  return [];
}

export async function resetAdminOrders() {
  const orders = buildDemoOrders();
  save(orders);
  return orders;
}
