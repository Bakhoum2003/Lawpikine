export const fieldClass = (error) =>
  `w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-400 ${error ? "border-law-red focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-law-green focus:ring-2 focus:ring-green-100"}`;

export const fieldId = (section, field) => `settings-${section}-${field}`;

// Carte blanche d'un bloc de paramètres.
export function Card({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
      {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

// Étiquette + champ + aide + erreur.
export function Field({ section, field, label, required = false, hint, error, children }) {
  const id = fieldId(section, field);
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-gray-700">
        {label} {required && <span className="text-law-red">*</span>}
      </label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="mt-1.5 text-[11px] text-gray-400">{hint}</p>}
      {error && <p id={`${id}-error`} className="mt-1.5 text-xs text-law-red">{error}</p>}
    </div>
  );
}

// Champ texte (ou zone de texte) relié au formulaire : form[section][field].
export function TextInput({ form, errors, onChange, section, field, label, required, hint, type = "text", inputMode, placeholder, rows, maxLength, disabled }) {
  const id = fieldId(section, field);
  const key = `${section}.${field}`;
  const error = errors[key];
  const props = {
    id,
    value: form[section][field],
    onChange: (event) => onChange(section, field, event.target.value),
    disabled,
    placeholder,
    maxLength,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? `${id}-error` : hint ? `${id}-hint` : undefined,
    className: `${fieldClass(error)} ${rows ? "resize-y" : ""}`,
  };
  return (
    <Field section={section} field={field} label={label} required={required} hint={hint} error={error}>
      {rows ? <textarea rows={rows} {...props} /> : <input type={type} inputMode={inputMode} autoComplete="off" {...props} />}
    </Field>
  );
}
