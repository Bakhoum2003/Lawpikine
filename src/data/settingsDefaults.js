// Paramètres par défaut de la boutique LAWPIKING.
//
// Ces valeurs reprennent ce que la boutique publique affiche AUJOURD'HUI dans son code
// (coordonnées, réseaux sociaux, numéro WhatsApp, textes d'accueil et de pied de page).
// Elles ne sont lues que par services/adminSettingsService.js. La boutique publique n'utilise
// pas encore ces paramètres : elle garde ses propres valeurs jusqu'à la connexion au backend.

export const DEFAULT_SETTINGS = {
  general: {
    name: "LAWPIKING",
    logo: "/favicon-person.png", // image par défaut ; remplacée par une data URL si l'admin choisit un autre logo
    description: "Découvrez nos collections de T-shirts et affirmez votre style avec Lawpiking.",
    address: "Dakar, Sénégal",
    city: "Dakar",
    phone: "+221 77 677 10 09",
    email: "malaw596@gmail.com",
  },
  social: {
    instagram: "https://www.instagram.com/maalawpikine?exln=NzF2dG5mMGxlbml3",
    snapchat: "https://www.snapchat.com/add/malawpikine",
    tiktok: "https://www.tiktok.com/@malawpikine?_r=1&_t=ZS-9B06huwTR93",
  },
  orders: {
    // Format international, chiffres uniquement, sans « + » (format attendu par wa.me).
    whatsappNumber: "221776771009",
    // Première ligne du message de commande (le reste — produits, total, client — est généré par la boutique).
    orderMessageTitle: "NOUVELLE COMMANDE — LAWPIKING",
    // Message prérempli du bouton WhatsApp flottant de la boutique.
    contactMessage: "Bonjour, je vous contacte depuis le site LAWPIKING.",
    currency: "FCFA",
    deliveryFee: 0, // en FCFA ; 0 = livraison gratuite
    deliveryInfo: "Livraison partout au Sénégal | Paiement à la livraison disponible",
  },
  appearance: {
    banner: "", // image d'accueil facultative (data URL)
    welcomeText: "9 Couleurs. Un seul état d'esprit.",
    welcomeHighlight: "Le style qui te définit.",
    primaryColor: "#DC2626", // rouge LAWPIKING
    secondaryColor: "#15803D", // vert LAWPIKING
    footerText: "", // vide = reprendre la description de la boutique
    copyright: "© 2026 LAWPIKING. Tous droits réservés.",
    showSocialInFooter: true,
    showContactInFooter: true,
  },
};
