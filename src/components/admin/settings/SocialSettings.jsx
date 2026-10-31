import Icon from "../../common/Icon";
import { Card, TextInput } from "./SettingsFields";
import { SOCIAL_HOSTS, SOCIAL_LABELS } from "../../../services/settingsValidation";

const ICONS = { instagram: "simple-icons:instagram", snapchat: "simple-icons:snapchat", tiktok: "simple-icons:tiktok" };

export default function SocialSettings({ form, errors, onChange, disabled }) {
  return (
    <Card title="Réseaux sociaux" description="Liens complets de vos pages (laissez vide pour ne pas afficher un réseau).">
      {Object.keys(SOCIAL_HOSTS).map((key) => (
        <div key={key} className="flex items-start gap-3">
          <span aria-hidden="true" className="mt-7 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600"><Icon name={ICONS[key]} width={17} /></span>
          <div className="min-w-0 flex-1">
            <TextInput form={form} errors={errors} onChange={onChange} section="social" field={key} label={SOCIAL_LABELS[key]} type="url" inputMode="url" placeholder={`https://www.${SOCIAL_HOSTS[key]}/votre-compte`} disabled={disabled} />
          </div>
        </div>
      ))}
    </Card>
  );
}
