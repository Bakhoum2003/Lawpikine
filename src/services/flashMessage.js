// Message de confirmation affiché sur la page suivante (ex. « Produit ajouté »).
// Conservé le temps d'une navigation dans sessionStorage, lu une seule fois.
const KEY = "lawpikingAdminFlash";

export function setFlash(message) {
  try {
    sessionStorage.setItem(KEY, message);
  } catch {
    // Sans stockage, la page suivante n'affichera simplement pas le message.
  }
}

export function takeFlash() {
  try {
    const message = sessionStorage.getItem(KEY);
    if (message) sessionStorage.removeItem(KEY);
    return message;
  } catch {
    return null;
  }
}
