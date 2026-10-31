import { Card, Field, TextInput, fieldClass, fieldId } from "./SettingsFields";
import SettingsImageField from "../SettingsImageField";
import { DEFAULT_SETTINGS } from "../../../data/settingsDefaults";

function ColorField({ form, errors, onChange, field, label }) {
  const value = form.appearance[field];
  const error = errors[`appearance.${field}`];
  const valid = /^#[0-9a-fA-F]{6}$/.test(value);
  return (
    <Field section="appearance" field={field} label={label} error={error}>
      <div className="flex items-center gap-2">
        <input type="color" aria-label={`${label} (sélecteur)`} value={valid ? value : "#000000"} onChange={(event) => onChange("appearance", field, event.target.value.toUpperCase())} className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-gray-200 bg-white p-1" />
        <input id={fieldId("appearance", field)} value={value} onChange={(event) => onChange("appearance", field, event.target.value)} maxLength={7} aria-invalid={Boolean(error)} aria-describedby={error ? `${fieldId("appearance", field)}-error` : undefined} className={`${fieldClass(error)} font-mono uppercase`} />
      </div>
    </Field>
  );
}

// Aperçu indicatif (jamais appliqué à la boutique publique).
function Preview({ form }) {
  const { general, appearance, social } = form;
  const footerText = appearance.footerText.trim() || general.description;
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200" aria-label="Aperçu de la personnalisation">
      <div className="relative bg-white p-5" style={appearance.banner ? { backgroundImage: `linear-gradient(rgba(255,255,255,.82), rgba(255,255,255,.82)), url(${appearance.banner})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
        <div className="flex items-center gap-2">
          {general.logo && <img src={general.logo} alt="" className="h-8 w-8 object-contain" />}
          <span className="font-display text-lg tracking-widest"><span style={{ color: appearance.primaryColor }}>{general.name.slice(0, 3).toUpperCase()}</span><span style={{ color: appearance.secondaryColor }}>{general.name.slice(3).toUpperCase()}</span></span>
        </div>
        <p className="mt-4 break-words text-base font-light text-gray-600">{appearance.welcomeText}<br /><span className="font-semibold text-gray-800">{appearance.welcomeHighlight}</span></p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-white" style={{ backgroundColor: appearance.primaryColor }}>Découvrir la collection</span>
          <span className="rounded border-2 px-4 py-2 text-[11px] font-bold uppercase tracking-widest" style={{ borderColor: appearance.secondaryColor, color: appearance.secondaryColor }}>Contact</span>
        </div>
      </div>
      <div className="bg-slate-950 p-5 text-white">
        <p className="font-display tracking-widest">{general.name}</p>
        {footerText && <p className="mt-1.5 break-words text-xs text-slate-400">{footerText}</p>}
        {appearance.showContactInFooter && <p className="mt-2 break-words text-[11px] text-slate-400">{[general.phone, general.email, general.address].filter(Boolean).join(" · ")}</p>}
        {appearance.showSocialInFooter && <p className="mt-1 text-[11px] text-slate-400">Réseaux : {["instagram", "snapchat", "tiktok"].filter((key) => social[key].trim()).map((key) => key[0].toUpperCase() + key.slice(1)).join(", ") || "aucun"}</p>}
        <p className="mt-3 border-t border-slate-800 pt-3 text-[11px] text-slate-500">{appearance.copyright}</p>
      </div>
    </div>
  );
}

export default function AppearanceSettings({ form, errors, onChange, disabled, onGoToLogo }) {
  const common = { form, errors, onChange, section: "appearance", disabled };
  const resetColors = () => {
    onChange("appearance", "primaryColor", DEFAULT_SETTINGS.appearance.primaryColor);
    onChange("appearance", "secondaryColor", DEFAULT_SETTINGS.appearance.secondaryColor);
  };
  return (
    <div className="space-y-5">
      <Card title="Identité et page d'accueil" description="Préparez l'apparence de la boutique. Rien n'est appliqué à la boutique publique pour le moment.">
        <div>
          <p className="mb-1.5 text-xs font-semibold text-gray-700">Logo</p>
          <div className="flex flex-wrap items-center gap-3">
            {form.general.logo && <img src={form.general.logo} alt="Logo actuel" className="h-14 w-14 rounded-xl border border-gray-200 bg-gray-50 object-contain" />}
            <button type="button" onClick={onGoToLogo} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-law-green">Modifier dans « Général »</button>
          </div>
        </div>
        <SettingsImageField id="settings-appearance-banner" label="Bannière principale" value={form.appearance.banner} defaultValue="" maxSide={1600} previewClass="h-24 w-44" fit="object-cover" emptyLabel="Aucune bannière" onChange={(banner) => onChange("appearance", "banner", banner)} />
        <TextInput {...common} field="welcomeText" label="Texte d'accueil" placeholder="9 Couleurs. Un seul état d'esprit." />
        <TextInput {...common} field="welcomeHighlight" label="Texte d'accueil mis en avant" placeholder="Le style qui te définit." />
      </Card>

      <Card title="Couleurs principales" description="Par défaut, le rouge et le vert de LAWPIKING.">
        <div className="grid gap-5 sm:grid-cols-2">
          <ColorField form={form} errors={errors} onChange={onChange} field="primaryColor" label="Couleur principale (rouge)" />
          <ColorField form={form} errors={errors} onChange={onChange} field="secondaryColor" label="Couleur secondaire (vert)" />
        </div>
        <button type="button" onClick={resetColors} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-law-green">Rétablir les couleurs LAWPIKING</button>
      </Card>

      <Card title="Pied de page">
        <TextInput {...common} field="footerText" label="Texte du pied de page" rows={2} hint="Laissez vide pour reprendre la description de la boutique." />
        <TextInput {...common} field="copyright" label="Mention de droits" placeholder="© 2026 LAWPIKING. Tous droits réservés." />
        <div className="flex flex-col gap-2">
          {[["showContactInFooter", "Afficher les coordonnées (téléphone, e-mail, adresse)"], ["showSocialInFooter", "Afficher les réseaux sociaux"]].map(([field, label]) => (
            <label key={field} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.appearance[field]} onChange={(event) => onChange("appearance", field, event.target.checked)} disabled={disabled} className="h-4 w-4 rounded border-gray-300 accent-law-green" />
              {label}
            </label>
          ))}
        </div>
      </Card>

      <Card title="Aperçu" description="Indicatif : la boutique publique n'est pas modifiée.">
        <Preview form={form} />
      </Card>
    </div>
  );
}
