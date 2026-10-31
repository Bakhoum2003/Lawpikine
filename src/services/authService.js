// ⚠️ CONNEXION DE DÉMONSTRATION — AUCUNE SÉCURITÉ RÉELLE.
// Les identifiants sont vérifiés côté navigateur : n'importe qui peut les lire
// dans le code. Ce service sert uniquement à simuler le parcours d'un
// administrateur tant que le backend n'existe pas.
// Remplacer le contenu de `login` / `logout` / `getSession` par des appels API
// (ex. POST /auth/login) sans changer leurs signatures : les pages n'ont pas
// à être modifiées.

const SESSION_KEY = "lawpikingAdminSession";

export const DEMO_CREDENTIALS = {
  email: "admin@lawpiking.sn",
  password: "admin123",
};

const readStorage = (storage) => {
  try {
    return JSON.parse(storage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
};

export const getSession = () =>
  readStorage(localStorage) ?? readStorage(sessionStorage);

export const isAuthenticated = () => Boolean(getSession());

export const login = ({ email, password, remember = false }) =>
  new Promise((resolve, reject) => {
    // Délai artificiel pour simuler un appel réseau.
    setTimeout(() => {
      const valid =
        email.trim().toLowerCase() === DEMO_CREDENTIALS.email &&
        password === DEMO_CREDENTIALS.password;
      if (!valid) {
        reject(new Error("Adresse email ou mot de passe incorrect."));
        return;
      }
      const session = { email: DEMO_CREDENTIALS.email, name: "Admin", demo: true };
      try {
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_KEY);
        (remember ? localStorage : sessionStorage).setItem(
          SESSION_KEY,
          JSON.stringify(session),
        );
      } catch {
        // Stockage indisponible : la connexion reste valide pour cet appel.
      }
      resolve(session);
    }, 900);
  });

export const logout = () => {
  try {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Rien à faire si le stockage est indisponible.
  }
};
