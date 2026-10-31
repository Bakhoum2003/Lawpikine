// Préparation des images de produit.
//
// ⚠️ Version frontend, sans backend : l'image n'est PAS envoyée sur un serveur. Elle est
// vérifiée, réduite dans le navigateur puis conservée sous forme de texte (data URL)
// dans le produit, donc dans localStorage, avec le reste des données.
//
// Pour le backend Node.js, seul `prepareProductImage` change : il enverra le fichier
// (POST /api/uploads) et renverra l'URL publique de l'image. Le champ `img` du produit
// reste une simple adresse d'image dans les deux cas, donc aucune page n'est à modifier.

export const IMAGE_RULES = {
  extensions: ["jpg", "jpeg", "png", "webp"],
  mimeTypes: ["image/jpeg", "image/png", "image/webp"],
  maxBytes: 5 * 1024 * 1024,
  maxSide: 900,
  quality: 0.85,
};

export class ImageError extends Error {
  constructor(message) {
    super(message);
    this.name = "ImageError";
  }
}

export const formatFileSize = (bytes) =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo` : `${Math.max(1, Math.round(bytes / 1024))} Ko`;

function validateFile(file) {
  const extension = file.name.split(".").pop().toLowerCase();
  if (!IMAGE_RULES.extensions.includes(extension) || (file.type && !IMAGE_RULES.mimeTypes.includes(file.type)))
    throw new ImageError("Format non accepté : utilisez une image JPG, JPEG, PNG ou WebP.");
  if (file.size > IMAGE_RULES.maxBytes)
    throw new ImageError(`L'image est trop lourde (${formatFileSize(file.size)}). Maximum : ${formatFileSize(IMAGE_RULES.maxBytes)}.`);
  if (file.size === 0) throw new ImageError("Ce fichier est vide.");
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new ImageError("Cette image est illisible ou corrompue."));
    };
    image.src = url;
  });
}

function encode(canvas) {
  const webp = canvas.toDataURL("image/webp", IMAGE_RULES.quality);
  if (webp.startsWith("data:image/webp")) return webp;
  // Navigateur sans export WebP : JPEG sur fond blanc.
  const flat = document.createElement("canvas");
  flat.width = canvas.width;
  flat.height = canvas.height;
  const context = flat.getContext("2d");
  context.fillStyle = "#FFFFFF";
  context.fillRect(0, 0, flat.width, flat.height);
  context.drawImage(canvas, 0, 0);
  return flat.toDataURL("image/jpeg", IMAGE_RULES.quality);
}

// Retourne { dataUrl, name, size } (size = poids de l'image enregistrée, en octets).
// options.maxSide : plus grand côté de l'image enregistrée (900 px par défaut ; plus petit pour une icône).
export async function prepareProductImage(file, { maxSide = IMAGE_RULES.maxSide } = {}) {
  validateFile(file);
  const image = await loadImage(file);
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
  const dataUrl = encode(canvas);
  return { dataUrl, name: file.name, size: Math.round((dataUrl.length * 3) / 4) };
}
