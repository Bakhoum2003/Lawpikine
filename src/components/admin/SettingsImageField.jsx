import { useRef, useState } from "react";
import Icon from "../common/Icon";
import { ImageError, prepareProductImage } from "../../services/imageService";

// Image de paramètre (logo, bannière) : aperçu, remplacement, retrait / retour à l'image par défaut.
// ⚠️ Mode démonstration : l'image est réduite puis conservée dans ce navigateur, sans envoi sur un serveur.
export default function SettingsImageField({ id, label, value, onChange, maxSide, previewClass = "h-20 w-20", fit = "object-contain", defaultValue = "", emptyLabel = "Aucune image", hint }) {
  const inputRef = useRef(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const pick = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");
    setProcessing(true);
    try {
      onChange((await prepareProductImage(file, { maxSide })).dataUrl);
    } catch (failure) {
      setError(failure instanceof ImageError ? failure.message : "Impossible de lire cette image.");
    } finally {
      setProcessing(false);
    }
  };

  const isDefault = value === defaultValue;
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold text-gray-700">{label}</p>
      <input ref={inputRef} id={id} type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={pick} className="sr-only" />
      <div className="flex flex-wrap items-center gap-4">
        {value ? (
          <img src={value} alt={`Aperçu : ${label}`} className={`${previewClass} shrink-0 rounded-xl border border-gray-200 bg-gray-50 ${fit}`} />
        ) : (
          <span className={`${previewClass} flex shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-center text-[11px] text-gray-400`}>{emptyLabel}</span>
        )}
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => inputRef.current?.click()} disabled={processing} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-law-green disabled:opacity-60">
            <Icon name={value ? "lucide:refresh-cw" : "lucide:upload"} width={14} />
            {processing ? "Traitement..." : value ? "Remplacer" : "Choisir une image"}
          </button>
          {!isDefault && (
            <button type="button" onClick={() => { setError(""); onChange(defaultValue); }} disabled={processing} className="flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-law-red transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-law-red disabled:opacity-60">
              <Icon name={defaultValue ? "lucide:undo-2" : "lucide:trash-2"} width={14} />
              {defaultValue ? "Rétablir par défaut" : "Retirer"}
            </button>
          )}
        </div>
      </div>
      <p className="mt-2 text-[11px] text-gray-400">{hint ?? "JPG, JPEG, PNG ou WebP · 5 Mo max."} Mode démonstration : l'image est conservée dans ce navigateur, sans envoi sur un serveur.</p>
      {error && <p role="alert" className="mt-1.5 text-xs text-law-red">{error}</p>}
    </div>
  );
}
