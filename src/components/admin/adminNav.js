// Navigation de l'espace administrateur : une seule source pour la sidebar
// (ordinateur / menu mobile) et la barre d'onglets mobile.
// Catégories et Paramètres ont leur place dans le menu mais ne sont pas encore développés.
export const ADMIN_NAV = [
  { to: "/admin", label: "Tableau de bord", icon: "lucide:layout-dashboard", end: true },
  { to: "/admin/produits", label: "Produits", icon: "lucide:shirt" },
  { to: "/admin/categories", label: "Catégories", icon: "lucide:tags" },
  { to: "/admin/commandes", label: "Commandes", icon: "lucide:shopping-cart" },
  { to: "/admin/avis", label: "Avis clients", icon: "lucide:star" },
  { to: "/admin/promotions", label: "Promotions", icon: "lucide:badge-percent" },
  { to: "/admin/stock", label: "Stock", icon: "lucide:boxes" },
  { to: "/admin/parametres", label: "Paramètres", icon: "lucide:settings" },
];

export const ADMIN_TABS = [
  { to: "/admin", label: "Accueil", icon: "lucide:house", end: true },
  { to: "/admin/produits", label: "Produits", icon: "lucide:shirt" },
  { to: "/admin/commandes", label: "Commandes", icon: "lucide:shopping-cart" },
];

export const isNavActive = (pathname, item) => {
  const path = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  return item.end ? path === item.to : path === item.to || path.startsWith(`${item.to}/`);
};
