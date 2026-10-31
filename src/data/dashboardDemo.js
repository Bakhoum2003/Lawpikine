// Données de démonstration du Dashboard (aucun backend pour le moment).
// Elles sont lues uniquement par services/dashboardService.js : le jour où l'API
// existera, seul ce service change.

export const DASHBOARD_STATS = {
  products: { value: 24, delta: "+2 ce mois", trend: "up" },
  orders: { value: 15, delta: "+3 ce mois", trend: "up" },
  reviews: { value: 32, delta: "+5 ce mois", trend: "up" },
  stock: { value: 148, delta: "-12 ce mois", trend: "down" },
};

// Ventes en FCFA, du plus ancien au plus récent (le dernier élément = aujourd'hui).
export const SALES_LAST_7_DAYS = [20000, 45000, 30000, 40000, 35000, 60000, 70000];

// Produits existants du catalogue, repérés par leur slug.
export const TOP_PRODUCTS = [
  { slug: "tshirt-noir-intense", sold: 12 },
  { slug: "tshirt-vert-fonce", sold: 8 },
  { slug: "tshirt-rouge-cardinal", sold: 6 },
  { slug: "tshirt-gris-chine", sold: 4 },
];
