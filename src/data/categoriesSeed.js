// Catégories initiales de la boutique LAWPIKING (créées une seule fois, au premier chargement).
// Ensuite, la source de vérité est services/categoryStore.js (localStorage) : cette liste
// n'est plus lue. `value` est la clé stockée dans `productType` de chaque produit : elle ne
// change JAMAIS, même si la catégorie est renommée.

export const DEFAULT_CATEGORIES = [
  { id: 1, value: "tshirts", name: "T-shirts", description: "Les T-shirts de la collection LAWPIKING.", image: "", enabled: true },
  { id: 2, value: "pulls", name: "Pulls", description: "Les pulls de la collection LAWPIKING.", image: "", enabled: true },
  { id: 3, value: "bonnets", name: "Bonnets", description: "Les bonnets de la collection LAWPIKING.", image: "", enabled: true },
];
