// Commandes de DÉMONSTRATION de l'administration.
//
// ⚠️ Ce ne sont pas de vraies commandes. La boutique envoie les commandes
// uniquement par WhatsApp (CheckoutModal) : elles ne sont enregistrées nulle part
// dans l'application. Ces lignes servent à montrer la page ; elles portent
// `demo: true` et aucun nom, téléphone ou adresse réel n'y figure.
//
// days : ancienneté en jours (0 = aujourd'hui) ; la date est calculée à l'initialisation.
// items : produits du catalogue repérés par leur slug (le prix vient du catalogue).

export const ORDER_STATUSES = [
  { value: "pending", label: "En cours" },
  { value: "delivered", label: "Livrée" },
  { value: "cancelled", label: "Annulée" },
];

export const getOrderStatusLabel = (value) =>
  ORDER_STATUSES.find((status) => status.value === value)?.label ?? value;

export const DEMO_ORDERS = [
  { days: 0, hour: 10, status: "pending", items: [["tshirt-noir-intense", "M", 2], ["tshirt-vert-fonce", "L", 1]] },
  { days: 1, hour: 15, status: "pending", items: [["tshirt-rouge-cardinal", "XL", 1]] },
  { days: 2, hour: 11, status: "delivered", items: [["tshirt-gris-chine", "M", 1], ["tshirt-bleu-royal", "M", 1]] },
  { days: 3, hour: 9, status: "pending", items: [["tshirt-vert-menthe", "S", 3]] },
  { days: 5, hour: 17, status: "delivered", items: [["tshirt-noir-intense", "L", 1]] },
  { days: 6, hour: 14, status: "cancelled", items: [["tshirt-jaune", "M", 2]] },
  { days: 9, hour: 12, status: "delivered", items: [["tshirt-vert-fonce", "XL", 2], ["tshirt-noir-intense", "XXL", 1]] },
  { days: 14, hour: 16, status: "delivered", items: [["tshirt-marron", "L", 1]] },
  { days: 20, hour: 10, status: "cancelled", items: [["tshirt-orange", "S", 1]] },
];
