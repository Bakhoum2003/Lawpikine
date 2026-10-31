import { Card, TextInput } from "./SettingsFields";
import SettingsImageField from "../SettingsImageField";
import { DEFAULT_SETTINGS } from "../../../data/settingsDefaults";

export default function GeneralSettings({ form, errors, onChange, disabled }) {
  const common = { form, errors, onChange, section: "general", disabled };
  return (
    <Card title="Informations générales" description="Les informations de base de votre boutique.">
      <TextInput {...common} field="name" label="Nom de la boutique" required placeholder="LAWPIKING" />
      <SettingsImageField id="settings-general-logo" label="Logo de la boutique" value={form.general.logo} defaultValue={DEFAULT_SETTINGS.general.logo} maxSide={512} onChange={(logo) => onChange("general", "logo", logo)} />
      <TextInput {...common} field="description" label="Description de la boutique" rows={3} placeholder="Présentez votre boutique en quelques mots..." />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput {...common} field="address" label="Adresse" placeholder="Ex: Dakar, Sénégal" />
        <TextInput {...common} field="city" label="Ville" placeholder="Ex: Dakar" />
        <TextInput {...common} field="phone" label="Numéro de téléphone" type="tel" inputMode="tel" placeholder="+221 77 000 00 00" />
        <TextInput {...common} field="email" label="Adresse e-mail de contact" required type="email" inputMode="email" placeholder="contact@exemple.com" />
      </div>
    </Card>
  );
}
