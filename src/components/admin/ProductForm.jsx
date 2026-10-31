import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../common/Icon";
import ProductImageField from "./ProductImageField";
import ProductColorsField from "./ProductColorsField";
import { getAvailableSizes } from "../../data/adminProductsSeed";
import { getCategories } from "../../services/categoryStore";
import { LIMITS, validateProduct } from "../../services/productValidation";

const EMPTY_VALUES = { name: "", description: "", price: "", category: "", sizes: [], colors: [], stock: "" };
const fieldClass = (error) =>
  `w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 ${error ? "border-law-red focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-law-green focus:ring-2 focus:ring-green-100"}`;

// Formulaire produit réutilisable (ajout maintenant, modification ensuite).
// onSubmit(values) : promesse ; en cas d'échec, `error.fields` désigne les champs en erreur.
export default function ProductForm({ initialValues, initialImage = null, submitLabel = "Ajouter le produit", loadingLabel = "Enregistrement...", onSubmit, cancelTo }) {
  const [values, setValues] = useState({ ...EMPTY_VALUES, ...initialValues });
  const [image, setImage] = useState(initialImage);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const sizes = getAvailableSizes(values.category);
  // Catégories proposées : les actives, plus (à la modification) celle déjà utilisée par le produit, même désactivée.
  const [categoryOptions] = useState(() => getCategories().filter((category) => category.enabled || category.value === initialValues?.category));

  const setField = (name, value) => {
    setValues((old) => ({ ...old, [name]: value }));
    if (errors[name]) setErrors((old) => ({ ...old, [name]: undefined }));
  };
  const onText = (event) => setField(event.target.name, event.target.value);
  const onCategory = (event) => {
    const category = event.target.value;
    const allowed = getAvailableSizes(category);
    setValues((old) => ({ ...old, category, sizes: old.sizes.filter((size) => allowed.includes(size)) }));
    setErrors((old) => ({ ...old, category: undefined, sizes: undefined }));
  };
  const toggleSize = (size) =>
    setField("sizes", values.sizes.includes(size) ? values.sizes.filter((item) => item !== size) : [...values.sizes, size]);

  const submit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    const payload = { ...values, img: image?.dataUrl ?? "" };
    const found = validateProduct(payload);
    setErrors(found);
    setFormError("");
    const firstInvalid = ["name", "price", "category", "stock", "description"].find((key) => found[key]);
    if (Object.keys(found).length) {
      if (firstInvalid) document.getElementById(`product-${firstInvalid}`)?.focus();
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(payload);
    } catch (failure) {
      if (failure?.fields) setErrors(failure.fields);
      else setFormError(failure?.message || "L'enregistrement a échoué. Réessayez.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="mt-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-8">
        <ProductImageField image={image} onChange={setImage} />

        <div className="space-y-5">
          <Field label="Nom du produit" required error={errors.name} id="product-name">
            <input id="product-name" name="name" type="text" value={values.name} onChange={onText} maxLength={LIMITS.nameMax + 20} disabled={submitting} placeholder="Ex: T-shirt Lawpiking" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "product-name-error" : undefined} className={fieldClass(errors.name)} />
          </Field>

          <Field label="Description" error={errors.description} id="product-description">
            <textarea id="product-description" name="description" rows={4} value={values.description} onChange={onText} disabled={submitting} placeholder="Décrivez votre produit..." aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? "product-description-error" : undefined} className={`${fieldClass(errors.description)} resize-y`} />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Prix (FCFA)" required error={errors.price} id="product-price">
              <input id="product-price" name="price" type="text" inputMode="numeric" autoComplete="off" value={values.price} onChange={onText} disabled={submitting} placeholder="Ex: 15000" aria-invalid={Boolean(errors.price)} aria-describedby={errors.price ? "product-price-error" : undefined} className={fieldClass(errors.price)} />
            </Field>
            <Field label="Catégorie" required error={errors.category} id="product-category">
              <div className="relative">
                <select id="product-category" name="category" value={values.category} onChange={onCategory} disabled={submitting} aria-invalid={Boolean(errors.category)} aria-describedby={errors.category ? "product-category-error" : undefined} className={`${fieldClass(errors.category)} appearance-none pr-9 ${values.category ? "" : "text-gray-400"}`}>
                  <option value="">Sélectionner une catégorie</option>
                  {categoryOptions.map((item) => <option key={item.value} value={item.value}>{item.enabled ? item.name : `${item.name} (désactivée)`}</option>)}
                </select>
                <Icon name="lucide:chevron-down" width={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </Field>
          </div>

          <fieldset>
            <legend className="mb-1.5 text-xs font-semibold text-gray-700">Tailles disponibles</legend>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {sizes.map((size) => (
                <label key={size} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={values.sizes.includes(size)} onChange={() => toggleSize(size)} disabled={submitting} className="h-4 w-4 rounded border-gray-300 accent-law-green" />
                  {size}
                </label>
              ))}
            </div>
            {errors.sizes && <p className="mt-1 text-xs text-law-red">{errors.sizes}</p>}
          </fieldset>

          <ProductColorsField value={values.colors} onChange={(colors) => setField("colors", colors)} error={errors.colors} />

          <Field label="Stock" required error={errors.stock} id="product-stock">
            <input id="product-stock" name="stock" type="text" inputMode="numeric" autoComplete="off" value={values.stock} onChange={onText} disabled={submitting} placeholder="Ex: 25" aria-invalid={Boolean(errors.stock)} aria-describedby={errors.stock ? "product-stock-error" : undefined} className={`${fieldClass(errors.stock)} sm:max-w-[50%]`} />
          </Field>
        </div>
      </div>

      {formError && <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-law-red-dark">{formError}</p>}

      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
        <Link to={cancelTo} className="flex items-center justify-center rounded-lg border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-law-green">
          Annuler
        </Link>
        <button type="submit" disabled={submitting} className="flex items-center justify-center gap-2 rounded-lg bg-law-green px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-law-green-dark focus:outline-none focus:ring-2 focus:ring-law-green focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-80">
          {submitting && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
          {submitting ? loadingLabel : submitLabel}
        </button>
      </div>
    </form>
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
