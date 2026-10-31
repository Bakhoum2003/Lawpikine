import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/common/Icon";
import GeneralSettings from "../../components/admin/settings/GeneralSettings";
import SocialSettings from "../../components/admin/settings/SocialSettings";
import OrderSettings from "../../components/admin/settings/OrderSettings";
import AppearanceSettings from "../../components/admin/settings/AppearanceSettings";
import AccountSettings from "../../components/admin/settings/AccountSettings";
import { getAdminSettings, settingsToForm, updateAdminSettings } from "../../services/adminSettingsService";
import { getSession, logout } from "../../services/authService";

const TABS = [
  { id: "general", label: "Général", icon: "lucide:store" },
  { id: "social", label: "Réseaux sociaux", icon: "lucide:share-2" },
  { id: "orders", label: "Commandes", icon: "lucide:shopping-cart" },
  { id: "appearance", label: "Personnalisation", icon: "lucide:palette" },
  { id: "account", label: "Compte", icon: "lucide:user-round" },
];
const SAVE_TABS = new Set(["general", "social", "orders", "appearance"]);

export default function SettingsAdmin() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(null); // formulaire correspondant aux paramètres enregistrés
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [tab, setTab] = useState("general");
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getAdminSettings()
      .then((settings) => {
        if (cancelled) return;
        const initial = settingsToForm(settings);
        setSaved(initial);
        setForm(initial);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const dirty = useMemo(() => Boolean(form && saved) && JSON.stringify(form) !== JSON.stringify(saved), [form, saved]);
  const tabErrors = (id) => Object.keys(errors).filter((key) => key.startsWith(`${id}.`)).length;

  const onChange = (section, field, value) => {
    setForm((old) => ({ ...old, [section]: { ...old[section], [field]: value } }));
    setErrors((old) => (old[`${section}.${field}`] ? { ...old, [`${section}.${field}`]: undefined } : old));
  };

  const cancel = () => {
    setForm(saved);
    setErrors({});
    setNotice({ text: "Modifications annulées." });
  };

  const save = async () => {
    if (saving) return;
    setSaving(true);
    setNotice(null);
    try {
      const settings = await updateAdminSettings(form);
      const fresh = settingsToForm(settings);
      setSaved(fresh);
      setForm(fresh);
      setErrors({});
      setNotice({ text: "Les paramètres ont été enregistrés." });
    } catch (failure) {
      if (failure?.fields) {
        setErrors(failure.fields);
        const first = Object.keys(failure.fields)[0];
        setTab(first.split(".")[0]);
        setNotice({ text: `${Object.keys(failure.fields).length} champ(s) à corriger avant d'enregistrer.`, error: true });
        setTimeout(() => document.getElementById(`settings-${first.replace(".", "-")}`)?.focus(), 50);
      } else {
        setNotice({ text: failure?.message || "L'enregistrement a échoué. Réessayez.", error: true });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const panelProps = { form, errors: Object.fromEntries(Object.entries(errors).filter(([, value]) => value)), onChange, disabled: saving };

  return (
    <div className="mx-auto max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">Paramètres</h1>
        <p className="mt-1 text-sm text-gray-500">Configurez les informations et le fonctionnement de votre boutique</p>
      </div>

      {notice && (
        <p role={notice.error ? "alert" : "status"} className={`mt-5 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium ${notice.error ? "bg-red-50 text-law-red-dark" : "bg-green-50 text-law-green-dark"}`}>
          <Icon name={notice.error ? "lucide:circle-alert" : "lucide:circle-check"} width={16} className="shrink-0" />
          {notice.text}
        </p>
      )}
      {failed && <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-law-red-dark">Impossible de charger les paramètres.</p>}

      {!form && !failed && (
        <div className="mt-6 animate-pulse space-y-4" aria-busy="true" aria-label="Chargement des paramètres">
          <div className="h-12 rounded-xl bg-gray-100" />
          <div className="h-64 rounded-2xl bg-gray-100" />
        </div>
      )}

      {form && (
        <>
          <div role="tablist" aria-label="Sections des paramètres" className="mt-6 flex gap-1 overflow-x-auto rounded-xl border border-gray-100 bg-white p-1.5 shadow-sm">
            {TABS.map((item) => {
              const active = tab === item.id;
              const count = tabErrors(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  id={`tab-${item.id}`}
                  aria-selected={active}
                  aria-controls={`panel-${item.id}`}
                  onClick={() => setTab(item.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-law-green ${active ? "bg-law-green text-white" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <Icon name={item.icon} width={16} />
                  {item.label}
                  {count > 0 && <span aria-label={`${count} erreur(s)`} className="flex h-5 min-w-5 items-center justify-center rounded-full bg-law-red px-1 text-[10px] font-bold text-white">{count}</span>}
                </button>
              );
            })}
          </div>

          <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-5">
            {tab === "general" && <GeneralSettings {...panelProps} />}
            {tab === "social" && <SocialSettings {...panelProps} />}
            {tab === "orders" && <OrderSettings {...panelProps} />}
            {tab === "appearance" && <AppearanceSettings {...panelProps} onGoToLogo={() => setTab("general")} />}
            {tab === "account" && <AccountSettings session={getSession()} onLogout={handleLogout} />}
          </div>

          {SAVE_TABS.has(tab) && (
            <div className="mt-6 flex flex-col-reverse items-stretch gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <p className={`text-xs ${dirty ? "font-semibold text-orange-600" : "text-gray-400"}`}>{dirty ? "Modifications non enregistrées" : "Aucune modification en attente"}</p>
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button type="button" onClick={cancel} disabled={!dirty || saving} className="rounded-lg border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-law-green disabled:cursor-not-allowed disabled:opacity-50">Annuler</button>
                <button type="button" onClick={save} disabled={!dirty || saving} className="flex items-center justify-center gap-2 rounded-lg bg-law-green px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-law-green-dark focus:outline-none focus:ring-2 focus:ring-law-green focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400">
                  {saving && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
                  {saving ? "Enregistrement..." : "Enregistrer les modifications"}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
