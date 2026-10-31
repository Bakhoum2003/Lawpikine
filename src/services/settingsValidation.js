// Validation des paramètres de la boutique. Les valeurs sont celles du FORMULAIRE
// (textes) ; les erreurs sont indexées par « section.champ » (ex. « social.instagram »).

export const SETTINGS_LIMITS = { name: 60, description: 300, address: 120, city: 60, email: 120, message: 300, title: 100, info: 300, welcome: 120, highlight: 80, footer: 200, copyright: 100, feeMax: 1000000 };

const collapse = (text) => String(text ?? "").replace(/\s+/g, " ").trim();
const HEX = /^#[0-9a-fA-F]{6}$/;
export const SOCIAL_HOSTS = { instagram: "instagram.com", snapchat: "snapchat.com", tiktok: "tiktok.com" };
export const SOCIAL_LABELS = { instagram: "Instagram", snapchat: "Snapchat", tiktok: "TikTok" };

// Adresse web valide (http/https) ; si `host` est donné, le site doit en être ou en dépendre (www., m., etc.).
export function validateUrl(value, host) {
  let url;
  try {
    url = new URL(value);
  } catch {
    return "Saisissez une adresse valide commençant par https://";
  }
  if (!["http:", "https:"].includes(url.protocol)) return "L'adresse doit commencer par http:// ou https://";
  if (host && url.hostname !== host && !url.hostname.endsWith(`.${host}`)) return `Le lien doit pointer vers ${host}.`;
  return null;
}

export const digitsOnly = (value) => String(value ?? "").replace(/[\s.\-()+]/g, "");

export function validateSettings(form) {
  const errors = {};
  const set = (key, message) => {
    errors[key] = message;
  };
  const { general, social, orders, appearance } = form;

  const name = collapse(general.name);
  if (!name) set("general.name", "Le nom de la boutique est obligatoire.");
  else if (name.length > SETTINGS_LIMITS.name) set("general.name", `Le nom ne doit pas dépasser ${SETTINGS_LIMITS.name} caractères.`);
  if (general.description.length > SETTINGS_LIMITS.description) set("general.description", `La description ne doit pas dépasser ${SETTINGS_LIMITS.description} caractères.`);
  if (collapse(general.address).length > SETTINGS_LIMITS.address) set("general.address", `L'adresse ne doit pas dépasser ${SETTINGS_LIMITS.address} caractères.`);
  if (collapse(general.city).length > SETTINGS_LIMITS.city) set("general.city", `La ville ne doit pas dépasser ${SETTINGS_LIMITS.city} caractères.`);

  const phone = collapse(general.phone);
  if (phone) {
    if (!/^[+\d\s.\-()]+$/.test(phone)) set("general.phone", "Le numéro ne doit contenir que des chiffres, des espaces et le signe +.");
    else if (digitsOnly(phone).length < 8 || digitsOnly(phone).length > 15) set("general.phone", "Le numéro doit contenir entre 8 et 15 chiffres.");
  }
  const email = collapse(general.email);
  if (!email) set("general.email", "L'adresse e-mail de contact est obligatoire.");
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) set("general.email", "Saisissez une adresse e-mail valide.");
  else if (email.length > SETTINGS_LIMITS.email) set("general.email", "Cette adresse e-mail est trop longue.");

  for (const key of Object.keys(SOCIAL_HOSTS)) {
    const link = collapse(social[key]);
    if (link) {
      const problem = validateUrl(link, SOCIAL_HOSTS[key]);
      if (problem) set(`social.${key}`, problem);
    }
  }

  const whatsapp = digitsOnly(orders.whatsappNumber);
  if (!whatsapp) set("orders.whatsappNumber", "Le numéro WhatsApp est obligatoire.");
  else if (!/^\d+$/.test(whatsapp) || whatsapp.length < 9 || whatsapp.length > 15) set("orders.whatsappNumber", "Format international attendu : 9 à 15 chiffres, indicatif inclus (ex. 221776771009).");
  const title = collapse(orders.orderMessageTitle);
  if (!title) set("orders.orderMessageTitle", "Le titre du message de commande est obligatoire.");
  else if (title.length > SETTINGS_LIMITS.title) set("orders.orderMessageTitle", `Le titre ne doit pas dépasser ${SETTINGS_LIMITS.title} caractères.`);
  const contact = collapse(orders.contactMessage);
  if (!contact) set("orders.contactMessage", "Le message du bouton WhatsApp est obligatoire.");
  else if (contact.length > SETTINGS_LIMITS.message) set("orders.contactMessage", `Le message ne doit pas dépasser ${SETTINGS_LIMITS.message} caractères.`);
  const fee = String(orders.deliveryFee ?? "").replace(/\s/g, "");
  if (!fee) set("orders.deliveryFee", "Indiquez les frais de livraison (0 si gratuite).");
  else if (!/^\d+$/.test(fee)) set("orders.deliveryFee", "Les frais doivent être un nombre entier, 0 ou plus.");
  else if (Number(fee) > SETTINGS_LIMITS.feeMax) set("orders.deliveryFee", "Ce montant est trop élevé.");
  if (orders.deliveryInfo.length > SETTINGS_LIMITS.info) set("orders.deliveryInfo", `Les informations de livraison ne doivent pas dépasser ${SETTINGS_LIMITS.info} caractères.`);

  if (collapse(appearance.welcomeText).length > SETTINGS_LIMITS.welcome) set("appearance.welcomeText", `Le texte ne doit pas dépasser ${SETTINGS_LIMITS.welcome} caractères.`);
  if (collapse(appearance.welcomeHighlight).length > SETTINGS_LIMITS.highlight) set("appearance.welcomeHighlight", `Le texte ne doit pas dépasser ${SETTINGS_LIMITS.highlight} caractères.`);
  if (!HEX.test(appearance.primaryColor)) set("appearance.primaryColor", "Couleur non valide (format #RRGGBB).");
  if (!HEX.test(appearance.secondaryColor)) set("appearance.secondaryColor", "Couleur non valide (format #RRGGBB).");
  if (appearance.footerText.length > SETTINGS_LIMITS.footer) set("appearance.footerText", `Le texte ne doit pas dépasser ${SETTINGS_LIMITS.footer} caractères.`);
  if (collapse(appearance.copyright).length > SETTINGS_LIMITS.copyright) set("appearance.copyright", `Le texte ne doit pas dépasser ${SETTINGS_LIMITS.copyright} caractères.`);
  return errors;
}

// Formulaire (textes) → paramètres normalisés à enregistrer.
export function formToSettings(form) {
  const text = (value) => collapse(value);
  const { general, social, orders, appearance } = form;
  return {
    general: { name: text(general.name), logo: general.logo, description: general.description.trim(), address: text(general.address), city: text(general.city), phone: text(general.phone), email: text(general.email) },
    social: { instagram: text(social.instagram), snapchat: text(social.snapchat), tiktok: text(social.tiktok) },
    orders: {
      whatsappNumber: digitsOnly(orders.whatsappNumber),
      orderMessageTitle: text(orders.orderMessageTitle),
      contactMessage: text(orders.contactMessage),
      currency: "FCFA",
      deliveryFee: Number(String(orders.deliveryFee).replace(/\s/g, "")),
      deliveryInfo: orders.deliveryInfo.trim(),
    },
    appearance: {
      banner: appearance.banner,
      welcomeText: text(appearance.welcomeText),
      welcomeHighlight: text(appearance.welcomeHighlight),
      primaryColor: appearance.primaryColor.toUpperCase(),
      secondaryColor: appearance.secondaryColor.toUpperCase(),
      footerText: appearance.footerText.trim(),
      copyright: text(appearance.copyright),
      showSocialInFooter: Boolean(appearance.showSocialInFooter),
      showContactInFooter: Boolean(appearance.showContactInFooter),
    },
  };
}

// Paramètres enregistrés → valeurs du formulaire (tout en texte).
export function settingsToForm(settings) {
  return {
    general: { ...settings.general },
    social: { ...settings.social },
    orders: { ...settings.orders, deliveryFee: String(settings.orders.deliveryFee) },
    appearance: { ...settings.appearance },
  };
}

export class SettingsValidationError extends Error {
  constructor(fields) {
    super("Certains paramètres sont invalides.");
    this.name = "SettingsValidationError";
    this.fields = fields;
  }
}
