import { useEffect, useRef, useState } from "react";
import Icon from "../common/Icon";
import { DISCOUNT_TYPES, PROMO_LIMITS, validatePromotion } from "../../services/promotionValidation";
import { getCategoryLabel } from "../../data/adminProductsSeed";

const EMPTY = { name: "", discountType: "percent", value: "", startDate: "", endDate: "", scope: "all", productSlugs: [] };
const fieldClass = (error) =>
  `w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 ${error ? "border-law-red focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-law-green focus:ring-2 focus:ring-green-100"}`;

// Formulaire de création / modification d'une promotion (fenêtre).
// initialValues : valeurs préremplies (modification) · products : produits existants
// onSubmit(values) : promesse ; en cas d'échec, `error.fields` désigne les champs en erreur.
export default function PromotionFormModal({ initialValues, products, onSubmit, onClose }) {
  const editing = Boolean(initialValues);
  const [values, setValues] = useState({ ...EMPTY, ...initialValues });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const closeHandler = useRef(onClose);
  closeHandler.current = onClose;
  const submittingRef = useRef(false);
  submittingRef.current = submitting;

  useEffect(() => {
    document.getElementById("promo-name")?.focus();
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
  const toggleSlug = (slug) =>
    setField("productSlugs", values.productSlugs.includes(slug) ? values.productSlugs.filter((item) => item !== slug) : [...values.productSlugs, slug]);

  const submit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    const found = validatePromotion(values, { products });
    setErrors(found);
    setFormError("");
    const first = ["name", "value", "startDate", "endDate"].find((key) => found[key]);
    if (Object.keys(found).length) {
      if (first) document.getElementById(`promo-${first}`)?.focus();
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

  const percent = values.discountType === "percent";

  return (
    <div className="fixed inset-0 z-[85] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(event) => event.target === event.currentTarget && !submitting && onClose()}>
      <form onSubmit={submit} noValidate role="dialog" aria-modal="true" aria-labelledby="promo-title" className="slide-in flex max-h-[94vh] w-full max-w-xl flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-gray-100 p-5">
          <div>
            <h2 id="promo-title" className="text-lg font-bold text-gray-900">{editing ? "Modifier la promotion" : "Nouvelle promotion"}</h2>
            <p className="mt-0.5 text-xs text-gray-500">{editing ? "Modifiez les informations de cette offre." : "Renseignez les informations de votre offre."}</p>
          </div>
          <button type="button" onClick={onClose} disabled={submitting} aria-label="Fermer" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-law-green">
            <Icon name="lucide:x" width={18} />
          </button>
        </header>

        <div className="space-y-5 overflow-y-auto p-5">
          <Field label="Nom de la promotion" required error={errors.name} id="promo-name">
            <input id="promo-name" name="name" type="text" value={values.name} onChange={onText} maxLength={PROMO_LIMITS.nameMax + 20} disabled={submitting} placeholder="Ex: Soldes de fin d'année" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "promo-name-error" : undefined} className={fieldClass(errors.name)} />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Type de réduction" required error={errors.discountType} id="promo-discountType">
              <div className="relative">
                <select id="promo-discountType" name="discountType" value={values.discountType} onChange={onText} disabled={submitting} className={`${fieldClass(errors.discountType)} appearance-none pr-9`}>
                  {DISCOUNT_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
                <Icon name="lucide:chevron-down" width={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </Field>
            <Field label={percent ? "Valeur (%)" : "Valeur (FCFA)"} required error={errors.value} id="promo-value">
              <input id="promo-value" name="value" type="text" inputMode="numeric" autoComplete="off" value={values.value} onChange={onText} disabled={submitting} placeholder={percent ? "Ex: 20" : "Ex: 2000"} aria-invalid={Boolean(errors.value)} aria-describedby={errors.value ? "promo-value-error" : undefined} className={fieldClass(errors.value)} />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Date de début" required error={errors.startDate} id="promo-startDate">
              <input id="promo-startDate" name="startDate" type="date" value={values.startDate} onChange={onText} disabled={submitting} aria-invalid={Boolean(errors.startDate)} aria-describedby={errors.startDate ? "promo-startDate-error" : undefined} className={fieldClass(errors.startDate)} />
            </Field>
            <Field label="Date de fin" required error={errors.endDate} id="promo-endDate">
              <input id="promo-endDate" name="endDate" type="date" value={values.endDate} min={values.startDate || undefined} onChange={onText} disabled={submitting} aria-invalid={Boolean(errors.endDate)} aria-describedby={errors.endDate ? "promo-endDate-error" : undefined} className={fieldClass(errors.endDate)} />
            </Field>
          </div>

          <fieldset>
            <legend className="mb-1.5 text-xs font-semibold text-gray-700">Produits concernés <span className="text-law-red">*</span></legend>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {[["all", "Tous les produits"], ["selected", "Une sélection de produits"]].map(([value, label]) => (
                <label key={value} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                  <input type="radio" name="scope" value={value} checked={values.scope === value} onChange={onText} disabled={submitting} className="h-4 w-4 accent-law-green" />
                  {label}
                </label>
              ))}
            </div>
            {values.scope === "selected" && (
              <div className="mt-3">
                <ul className={`max-h-48 divide-y divide-gray-100 overflow-y-auto rounded-lg border ${errors.productSlugs ? "border-law-red" : "border-gray-200"}`}>
                  {products.map((product) => (
                    <li key={product.slug}>
                      <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <input type="checkbox" checked={values.productSlugs.includes(product.slug)} onChange={() => toggleSlug(product.slug)} disabled={submitting} className="h-4 w-4 shrink-0 rounded border-gray-300 accent-law-green" />
                        <span className="min-w-0 flex-1 truncate font-medium">{product.name}</span>
                        <span className="shrink-0 text-xs text-gray-400">{getCategoryLabel(product.productType)}</span>
                      </label>
                    </li>
                  ))}
                </ul>
                <p className="mt-1.5 text-xs text-gray-500">{values.productSlugs.length} produit{values.productSlugs.length > 1 ? "s" : ""} sélectionné{values.productSlugs.length > 1 ? "s" : ""}</p>
                {errors.productSlugs && <p role="alert" className="mt-1 text-xs text-law-red">{errors.productSlugs}</p>}
              </div>
            )}
          </fieldset>

          {formError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-law-red-dark">{formError}</p>}
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-gray-100 p-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={submitting} className="rounded-lg border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-law-green disabled:opacity-60">Annuler</button>
          <button type="submit" disabled={submitting} className="flex items-center justify-center gap-2 rounded-lg bg-law-green px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-law-green-dark focus:outline-none focus:ring-2 focus:ring-law-green focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-80">
            {submitting && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
            {submitting ? "Enregistrement..." : "Enregistrer"}
          </button>
        </footer>
      </form>
    </div>
  );
}

function Field({ label, required = false, error, id, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-gray-700">
        {label} {required && <span className="text-law-red">*</span>}
      </label>
      {children}
      {error && <p id={`${id}-error`} className="mt-1.5 text-xs text-law-red">{error}</p>}
    </div>
  );
}
