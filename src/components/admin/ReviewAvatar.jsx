const TONES = ["bg-law-green", "bg-law-red", "bg-gray-800", "bg-amber-500", "bg-blue-700"];

// Avatar à initiales (aucune photo de client n'est stockée).
export default function ReviewAvatar({ name }) {
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  const tone = TONES[[...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % TONES.length];
  return <span aria-hidden="true" className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${tone}`}>{initial}</span>;
}
