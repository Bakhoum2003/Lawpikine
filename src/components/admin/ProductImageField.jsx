import { useRef, useState } from "react";
import Icon from "../common/Icon";
import { ImageError, formatFileSize, prepareProductImage } from "../../services/imageService";

// Zone d'image du produit : choix ou glisser-déposer, aperçu, remplacement, suppression.
// image : null | { dataUrl, name, size }
export default function ProductImageField({ image, onChange }) {
  const inputRef = useRef(null);
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file) => {
    if (!file) return;
    setError("");
    setProcessing(true);
    try {
      onChange(await prepareProductImage(file));
    } catch (failure) {
      setError(failure instanceof ImageError ? failure.message : "Impossible de lire cette image.");
    } finally {
      setProcessing(false);
    }
  };

  const onInputChange = (event) => {
    handleFile(event.target.files?.[0]);
    event.target.value = ""; // permet de rechoisir le même fichier
  };
  const onDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold text-gray-700">Image du produit</p>
      <input ref={inputRef} id="product-image" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={onInputChange} className="sr-only peer" />

      {image ? (
        <div>
          <img src={image.dataUrl} alt="Aperçu du produit" className="aspect-square w-full rounded-xl border border-gray-200 bg-gray-50 object-cover" />
          <p className="mt-2 truncate text-xs text-gray-500">
            {image.current ? ["Image actuelle", image.name].filter(Boolean).join(" · ") : `${image.name} · ${formatFileSize(image.size)}`}
          </p>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => inputRef.current?.click()} disabled={processing} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-law-green disabled:opacity-60">
              <Icon name="lucide:refresh-cw" width={14} />
              {processing ? "Traitement..." : "Remplacer"}
            </button>
            <button type="button" onClick={() => { setError(""); onChange(null); }} disabled={processing} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-100 py-2 text-xs font-semibold text-law-red transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-law-red disabled:opacity-60">
              <Icon name="lucide:trash-2" width={14} />
              Supprimer
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor="product-image"
          onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition peer-focus-visible:ring-2 peer-focus-visible:ring-law-green peer-focus-visible:ring-offset-2 lg:min-h-72 ${dragging ? "border-law-green bg-green-50" : "border-gray-300 bg-gray-50 hover:border-law-green hover:bg-green-50/50"}`}
        >
          {processing ? (
            <>
              <span aria-hidden="true" className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-law-green" />
              <span className="mt-3 text-sm font-semibold text-gray-700">Traitement de l'image...</span>
            </>
          ) : (
            <>
              <Icon name="lucide:image-plus" width={34} className="text-gray-400" />
              <span className="mt-3 text-sm font-semibold text-gray-700">Cliquez pour ajouter une image</span>
              <span className="mt-1 text-xs text-gray-500">ou glissez-déposez</span>
              <span className="mt-3 text-[11px] text-gray-400">Formats acceptés : JPG, JPEG, PNG, WebP · 5 Mo max</span>
            </>
          )}
        </label>
      )}

      {error && <p role="alert" className="mt-2 text-xs text-law-red">{error}</p>}
      <p className="mt-2 text-[11px] leading-relaxed text-gray-400">
        Mode démonstration : l'image est réduite puis conservée dans ce navigateur, sans envoi sur un serveur.
      </p>
    </div>
  );
}
