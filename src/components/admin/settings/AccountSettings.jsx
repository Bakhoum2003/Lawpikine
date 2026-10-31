import Icon from "../../common/Icon";
import { Card, Field, fieldClass } from "./SettingsFields";

// Compte administrateur. ⚠️ La connexion est une simulation frontend : aucun mot de passe
// n'est vérifié sur un serveur, donc il ne peut pas être modifié pour de vrai ici.
export default function AccountSettings({ session, onLogout }) {
  return (
    <div className="space-y-5">
      <Card title="Compte administrateur">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field section="account" field="name" label="Nom de l'administrateur">
            <input id="settings-account-name" value={session?.name ?? "Admin"} readOnly className={fieldClass(false)} />
          </Field>
          <Field section="account" field="email" label="Adresse e-mail">
            <input id="settings-account-email" value={session?.email ?? ""} readOnly className={fieldClass(false)} />
          </Field>
        </div>
        <p className="text-[11px] text-gray-400">Ces informations viennent de la session de démonstration et ne sont pas modifiables pour le moment.</p>
      </Card>

      <Card title="Mot de passe">
        <p role="note" className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
          <Icon name="lucide:info" width={15} className="mt-0.5 shrink-0" />
          <span>La connexion actuelle est une <strong>simulation</strong> : aucun mot de passe n'est enregistré ni sécurisé. La modification du mot de passe sera disponible après l'intégration du backend.</span>
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field section="account" field="current" label="Mot de passe actuel"><input id="settings-account-current" type="password" disabled placeholder="••••••••" className={fieldClass(false)} /></Field>
          <Field section="account" field="next" label="Nouveau mot de passe"><input id="settings-account-next" type="password" disabled placeholder="••••••••" className={fieldClass(false)} /></Field>
        </div>
        <button type="button" disabled className="cursor-not-allowed rounded-lg bg-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-400">Modifier le mot de passe (bientôt disponible)</button>
      </Card>

      <Card title="Session">
        <button type="button" onClick={onLogout} className="inline-flex items-center gap-2 rounded-lg bg-law-red px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-law-red-dark focus:outline-none focus:ring-2 focus:ring-law-red focus:ring-offset-2">
          <Icon name="lucide:log-out" width={16} />
          Se déconnecter
        </button>
      </Card>
    </div>
  );
}
