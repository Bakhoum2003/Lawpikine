import { DEFAULT_SETTINGS } from "../data/settingsDefaults";
import { SettingsValidationError, formToSettings, settingsToForm, validateSettings } from "./settingsValidation";

// Service centralisé des paramètres de la boutique (une seule source de vérité).
//
// Version frontend : les paramètres sont conservés dans localStorage. Pour passer à l'API
// Node.js, il suffira de remplacer le contenu de ces fonctions par des appels fetch :
//   getAdminSettings()          → GET  /api/settings
//   updateAdminSettings(values) → PUT  /api/settings
//   resetAdminSettings()        → DELETE /api/settings (retour aux valeurs par défaut)
// Les images (logo, bannière) sont réduites puis conservées dans le navigateur : elles ne sont
// PAS envoyées sur un serveur (le backend remplacera cela par un envoi, ex. POST /api/uploads).
//
// ⚠️ Cette étape ne branche rien sur la boutique publique : elle garde ses propres valeurs
// (numéro WhatsApp, réseaux sociaux, textes…). Les paramètres sont prêts à être lus plus tard
// par la boutique, par exemple pour construire https://wa.me/<orders.whatsappNumber>?text=…

const STORAGE_KEY = "lawpikingAdminSettings";
const STORAGE_VERSION = 1;

// Fusionne avec les valeurs par défaut : une clé absente (ancienne version) retrouve sa valeur par défaut.
const withDefaults = (stored) =>
  Object.fromEntries(Object.entries(DEFAULT_SETTINGS).map(([section, defaults]) => [section, { ...defaults, ...(stored?.[section] ?? {}) }]));

function load() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored?.version === STORAGE_VERSION && stored.settings && typeof stored.settings === "object") return withDefaults(stored.settings);
  } catch {
    // Contenu absent ou illisible : valeurs par défaut.
  }
  return withDefaults(null);
}

function save(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, settings, updatedAt: new Date().toISOString() }));
    return true;
  } catch {
    return false;
  }
}

// Simule le délai d'un appel réseau (à supprimer avec l'API).
const simulateLatency = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getAdminSettings() {
  return load();
}

// form : valeurs du formulaire (voir settingsValidation.js). Retourne les paramètres enregistrés.
export async function updateAdminSettings(form) {
  const errors = validateSettings(form);
  if (Object.keys(errors).length) throw new SettingsValidationError(errors);
  await simulateLatency();
  const settings = formToSettings(form);
  if (!save(settings)) throw new Error("Impossible d'enregistrer (stockage du navigateur plein ou indisponible). Choisissez des images plus légères.");
  return settings;
}

export async function resetAdminSettings() {
  await simulateLatency(300);
  const settings = withDefaults(null);
  save(settings);
  return settings;
}

export { settingsToForm };
