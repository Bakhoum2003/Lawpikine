import Icon from "../../common/Icon";
import { Card, Field, TextInput, fieldClass } from "./SettingsFields";
import { digitsOnly } from "../../../services/settingsValidation";

const number = new Intl.NumberFormat("fr-FR");

export default function OrderSettings({ form, errors, onChange, disabled }) {
  const common = { form, errors, onChange, section: "orders", disabled };
  const { orders } = form;
  const fee = Number(String(orders.deliveryFee).replace(/\s/g, ""));
  const link = digitsOnly(orders.whatsappNumber);
  return (
    <div className="space-y-5">
      <Card title="Commandes WhatsApp" description="Les commandes de la boutique sont envoyées par WhatsApp.">
        <TextInput {...common} field="whatsappNumber" label="Numéro WhatsApp qui reçoit les commandes" required type="tel" inputMode="tel" placeholder="221776771009" hint="Format international, sans « + » ni espaces (ex. 221776771009)." />
        <TextInput {...common} field="orderMessageTitle" label="Titre du message de commande" required placeholder="NOUVELLE COMMANDE — LAWPIKING" hint="Première ligne du message envoyé. Les produits, le total et les coordonnées du client sont ajoutés automatiquement par la boutique." />
        <TextInput {...common} field="contactMessage" label="Message prérempli du bouton WhatsApp" required rows={2} placeholder="Bonjour, je vous contacte depuis le site LAWPIKING." />

        <div className="rounded-xl bg-gray-50 p-4" aria-label="Aperçu du message de commande">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-700"><Icon name="lucide:eye" width={14} />Aperçu du message de commande (exemple)</p>
          <pre className="whitespace-pre-wrap break-words font-sans text-xs leading-5 text-gray-600">{`🛍️ *${orders.orderMessageTitle.trim() || "…"}*\n\n👕 *Produit : Exemple*\nTaille : M\nQuantité : 1\n\n💰 *TOTAL : …*\n\n👤 *CLIENT*\nNom : …`}</pre>
          <p className="mt-2 break-all text-[11px] text-gray-400">Destinataire : {link ? `https://wa.me/${link}` : "—"}</p>
        </div>
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Ces paramètres sont <strong>préparés</strong> pour le système de commande, mais la boutique utilise encore son propre numéro et ses propres messages : ils ne seront pris en compte qu'une fois la boutique reliée à ces paramètres.
        </p>
      </Card>

      <Card title="Livraison et devise">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field section="orders" field="currency" label="Devise">
            <input id="settings-orders-currency" value="FCFA" readOnly disabled className={fieldClass(false)} />
          </Field>
          <TextInput {...common} field="deliveryFee" label="Frais de livraison (FCFA)" required inputMode="numeric" placeholder="0" hint={Number.isFinite(fee) && String(orders.deliveryFee).trim() !== "" ? (fee === 0 ? "Livraison gratuite." : `${number.format(fee)} FCFA`) : undefined} />
        </div>
        <TextInput {...common} field="deliveryInfo" label="Informations de livraison" rows={3} placeholder="Ex: Livraison partout au Sénégal | Paiement à la livraison" />
      </Card>
    </div>
  );
}
