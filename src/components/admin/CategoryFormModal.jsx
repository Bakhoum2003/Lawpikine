import { useEffect, useRef, useState } from "react";
import Icon from "../common/Icon";
import { CATEGORY_LIMITS, validateCategory } from "../../services/categoryValidation";
import { ImageError, prepareProductImage } from "../../services/imageService";

const fieldClass = (error) =>
  `w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 ${error ? "border-law-red focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-law-green focus:ring-2 focus:ring-green-100"}`;

// Formulaire d'ajout / modification d'une catégorie (fenêtre).
// initialValues : valeurs préremplies (modification) · existingNames : noms des AUTRES catégories
// onSubmit(values) : promesse ; en cas d'échec, `error.fields` désigne les champs en erreur.
export default function CategoryFormModal({ initialValues, existingNames, onSubmit, onClose }) {
  const editing = Boolean(initialValues);
  const [values, setValues] = useState({ name: "", description: "", image: "", enabled: true, ...initialValues });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [imageError, setImageError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);
  const closeHandler = useRef(onClose);
  closeHandler.current = onClose;
  const submittingRef = useRef(false);
  submittingRef.current = submitting;

  useEffect(() => {
    document.getElementById("category-name")?.focus();
    const onKey = (event) => event.key === "Escape" && !submittingRef.current && closeHandler.current();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, []);

  const setField = (name, value) => {
    setValues((old) => ({ ...old, [name]: value }));
    setErrors((old) => ({ ...old, [name]: undefined }));
  };
  const onText = (event) => setField(event.target.name, event.target.value);

  const pickImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setImageError("");
    setProcessing(true);
    try {
      // Une icône n'a pas besoin d'être grande : 256 px suffisent et économisent le stockage.
      setField("image", (await prepareProductImage(file, { maxSide: 256 })).dataUrl);
    } catch (failure) {
      setImageError(failure instanceof ImageError ? failure.message : "Impossible de lire cette image.");
    } finally {
      setProcessing(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (submitting || processing) return;
    const found = validateCategory(values, { existingNames });
    setErrors(found);
    setFormError("");
    if (Object.keys(found).length) {
      document.getElementById(found.name ? "category-name" : "category-description")?.focus();
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (failure) {
      if (failure?.fields) setErrors(failure.fields);
      else setFormError(failure?.message || "L'enregistrement a échoué. Réessayez.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[85] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(event) => event.target === event.currentTarget && !submitting && onClose()}>
      <form onSubmit={submit} noValidate role="dialog" aria-modal="true" aria-labelledby="category-title" className="slide-in flex max-h-[94vh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-gray-100 p-5">
          <div>
            <h2 id="category-title" className="text-lg font-bold text-gray-900">{editing ? "Modifier la catégorie" : "Ajouter une catégorie"}</h2>
            <p className="mt-0.5 text-xs text-gray-500">{editing ? "Les produits de cette catégorie y restent associés." : "Renseignez les informations de la catégorie."}</p>
          </div>
          <button type="button" onClick={onClose} disabled={submitting} aria-label="Fermer" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-law-green">
            <Icon name="lucide:x" width={18} />
          </button>
        </header>

        <div className="space-y-5 overflow-y-auto p-5">
          <div>
            <label htmlFor="category-name" className="mb-1.5 block text-xs font-semibold text-gray-700">Nom de la catégorie <span className="text-law-red">*</span></label>
            <input id="category-name" name="name" type="text" value={values.name} onChange={onText} maxLength={CATEGORY_LIMITS.nameMax + 20} disabled={submitting} placeholder="Ex: Casquettes" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "category-name-error" : undefined} className={fieldClass(errors.name)} />
            {errors.name && <p id="category-name-error" className="mt-1.5 text-xs text-law-red">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="category-description" className="mb-1.5 block text-xs font-semibold text-gray-700">Description</label>
            <textarea id="category-description" name="description" rows={3} value={values.description} onChange={onText} disabled={submitting} placeholder="Décrivez cette catégorie..." aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? "category-description-error" : undefined} className={`${fieldClass(errors.description)} resize-y`} />
            {errors.description && <p id="category-description-error" className="mt-1.5 text-xs text-law-red">{errors.description}</p>}
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold text-gray-700">Image ou icône <span className="font-normal text-gray-400">(facultative)</span></p>
            <input ref={fileRef} id="category-image" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={pickImage} className="sr-only" />
            <div className="flex items-center gap-4">
              {values.image ? (
                <img src={values.image} alt="Aperçu de la catégorie" className="h-16 w-16 shrink-0 rounded-xl border border-gray-200 bg-gray-50 object-cover" />
              ) : (
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-300">
                  <Icon name="lucide:image-plus" width={24} />
                </span>
              )}
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => fileRef.current?.click()} disabled={processing || submitting} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-law-green disabled:opacity-60">
                  <Icon name={values.image ? "lucide:refresh-cw" : "lucide:upload"} width={14} />
                  {processing ? "Traitement..." : values.image ? "Remplacer" : "Choisir une image"}
                </button>
                {values.image && (
                  <button type="button" onClick={() => { setImageError(""); setField("image", ""); }} disabled={processing || submitting} className="flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-law-red transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-law-red disabled:opacity-60">
                    <Icon name="lucide:trash-2" width={14} />
                    Supprimer
                  </button>
                )}
              </div>
            </div>
            <p className="mt-2 text-[11px] text-gray-400">JPG, JPEG, PNG ou WebP · 5 Mo max · réduite puis conservée dans ce navigateur (mode démonstration, sans envoi sur un serveur).</p>
            {imageError && <p role="alert" className="mt-1.5 text-xs text-law-red">{imageError}</p>}
          </div>

          <fieldset>
            <legend className="mb-1.5 text-xs font-semibold text-gray-700">Statut</legend>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {[[true, "Active"], [false, "Inactive"]].map(([value, label]) => (
                <label key={label} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                  <input type="radio" name="enabled" checked={values.enabled === value} onChange={() => setField("enabled", value)} disabled={submitting} className="h-4 w-4 accent-law-green" />
                  {label}
                </label>
              ))}
            </div>
            {!values.enabled && <p className="mt-1.5 text-xs text-gray-500">Une catégorie inactive ne peut pas recevoir de nouveaux produits ; ses produits actuels restent en place.</p>}
          </fieldset>

          {formError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-law-red-dark">{formError}</p>}
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-gray-100 p-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={submitting} className="rounded-lg border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-law-green disabled:opacity-60">Annuler</button>
          <button type="submit" disabled={submitting || processing} className="flex items-center justify-center gap-2 rounded-lg bg-law-green px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-law-green-dark focus:outline-none focus:ring-2 focus:ring-law-green focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-80">
            {submitting && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
            {submitting ? "Enregistrement..." : "Enregistrer"}
          </button>
        </footer>
      </form>
    </div>
  );
}
