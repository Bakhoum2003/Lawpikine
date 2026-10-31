// Avis de DÉMONSTRATION de l'administration.
//
// ⚠️ Ce ne sont pas de vrais avis. La boutique publique ne stocke aucun avis :
// son formulaire « Donnez votre avis » ouvre simplement un e-mail, et les témoignages
// du site sont du contenu statique. Ces 32 lignes servent à montrer la page (elles
// reproduisent les chiffres de la maquette : 32 avis, 4,8/5, 94 % / 6 %). Elles portent
// `demo: true`, aucun nom ni commentaire de vrai client n'y figure.
//
// Répartition : 30 avis à 5★, un à 2★, un à 1★ · 26 approuvés, 6 en attente.

export const REVIEW_STATUSES = [
  { value: "approved", label: "Approuvé" },
  { value: "pending", label: "En attente" },
  { value: "refused", label: "Refusé" },
];

export const getReviewStatusLabel = (value) => REVIEW_STATUSES.find((status) => status.value === value)?.label ?? value;

const SHORT = "Avis de démonstration : ce texte est un exemple, il ne provient d'aucun client.";
const LONG = `${SHORT} Il est volontairement plus long pour tester l'affichage du commentaire complet : le texte se coupe dans la liste, puis s'affiche en entier dans la fenêtre de détails. Aucune opinion réelle n'est exprimée ici.`;

const PRODUCT_SLUGS = ["tshirt-noir-intense", "tshirt-vert-fonce", "tshirt-rouge-cardinal", "tshirt-gris-chine", "tshirt-bleu-royal", null];

// 32 avis, du plus récent au plus ancien : [note, statut]
const RATINGS = [5, 5, 5, 2, 5, 5, 5, 5, 5, 5, 5, 5, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
const PENDING_INDEXES = new Set([0, 1, 3, 7, 12, 20]);

export const DEMO_REVIEWS = RATINGS.map((rating, index) => ({
  rating,
  status: PENDING_INDEXES.has(index) ? "pending" : "approved",
  days: Math.floor(index * 1.4),
  productSlug: PRODUCT_SLUGS[index % PRODUCT_SLUGS.length],
  comment: index % 5 === 2 ? LONG : SHORT,
}));
