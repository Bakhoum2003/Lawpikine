import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/common/Icon";
import { DEMO_CREDENTIALS, login } from "../../services/authService";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ email, password }) {
  const errors = {};
  if (!email.trim()) errors.email = "L'adresse email est obligatoire.";
  else if (!EMAIL_PATTERN.test(email.trim()))
    errors.email = "Saisissez une adresse email valide.";
  if (!password) errors.password = "Le mot de passe est obligatoire.";
  return errors;
}

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const change = (event) => {
    const { name, type, checked, value } = event.target;
    setForm((old) => ({ ...old, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((old) => ({ ...old, [name]: undefined }));
    if (message) setMessage(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (loading) return;
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    setLoading(true);
    setMessage(null);
    try {
      await login(form);
      navigate("/admin");
    } catch (error) {
      setMessage({ type: "error", text: error.message });
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 md:flex-row">
      <BrandPanel />
      <main className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-8 md:px-8 md:py-12 lg:px-12">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.08)] ring-1 ring-gray-100 sm:p-9">
          <header className="text-center">
            <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
              Espace Administrateur
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Connectez-vous pour gérer votre boutique
            </p>
          </header>

          <form onSubmit={submit} noValidate className="mt-7 space-y-5">
            <Field label="Adresse email" error={errors.email} id="admin-email">
              <Icon name="lucide:mail" width={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="username"
                value={form.email}
                onChange={change}
                disabled={loading}
                placeholder="votre@email.com"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "admin-email-error" : undefined}
                className={inputClass(errors.email, "pr-4")}
              />
            </Field>

            <Field label="Mot de passe" error={errors.password} id="admin-password">
              <Icon name="lucide:lock" width={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="admin-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={form.password}
                onChange={change}
                disabled={loading}
                placeholder="Votre mot de passe"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "admin-password-error" : undefined}
                className={inputClass(errors.password, "pr-12")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                aria-pressed={showPassword}
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-law-green"
              >
                <Icon name={showPassword ? "lucide:eye-off" : "lucide:eye"} width={18} />
              </button>
            </Field>

            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={change}
                  disabled={loading}
                  className="h-4 w-4 rounded border-gray-300 accent-law-green"
                />
                Se souvenir de moi
              </label>
              <button
                type="button"
                onClick={() =>
                  setMessage({
                    type: "info",
                    text: "La réinitialisation du mot de passe sera disponible une fois le backend connecté.",
                  })
                }
                className="text-sm font-semibold text-law-red transition hover:text-law-red-dark hover:underline focus:outline-none focus:ring-2 focus:ring-law-red focus:ring-offset-2"
              >
                Mot de passe oublié ?
              </button>
            </div>

            {message && (
              <p
                role={message.type === "error" ? "alert" : "status"}
                className={`rounded-lg px-4 py-3 text-sm ${message.type === "error" ? "bg-red-50 text-law-red-dark" : "bg-gray-100 text-gray-700"}`}
              >
                {message.text}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-law-red py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-law-red-dark focus:outline-none focus:ring-2 focus:ring-law-red focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-80"
            >
              {loading && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>

          <p className="mt-6 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-2.5 text-center text-[11px] leading-relaxed text-gray-500">
            Mode démonstration : connexion simulée, sans sécurité réelle.
            <br />
            Test : <span className="font-semibold text-gray-700">{DEMO_CREDENTIALS.email}</span> / <span className="font-semibold text-gray-700">{DEMO_CREDENTIALS.password}</span>
          </p>

          <p className="mt-6 text-center font-display text-sm tracking-[.25em] text-gray-400">
            LAWPIKING
          </p>
        </div>
      </main>
    </div>
  );
}

function inputClass(error, paddingRight) {
  return `w-full rounded-lg border bg-white py-3 pl-11 ${paddingRight} text-sm text-gray-900 outline-none transition placeholder:text-gray-400 disabled:bg-gray-50 ${error ? "border-law-red focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-law-green focus:ring-2 focus:ring-green-100"}`;
}

function Field({ label, error, id, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-gray-700">
        {label} <span className="text-law-red">*</span>
      </label>
      <div className="relative">{children}</div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-law-red">
          {error}
        </p>
      )}
    </div>
  );
}

function BrandPanel() {
  return (
    <aside className="relative flex h-60 shrink-0 flex-col items-center justify-center overflow-hidden bg-law-green-dark px-6 pb-10 text-center text-white md:h-auto md:min-h-screen md:w-[42%] md:pb-0 lg:w-[48%]">
      <div
        aria-hidden="true"
        className="absolute -inset-3 scale-105 bg-cover bg-center blur-[2px]"
        style={{ backgroundImage: "url('/admin-login-bg.jpg')" }}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-[#0f4d2a]/85" />

      <div className="relative z-10 flex flex-col items-center">
        <img
          src="/favicon-person.png"
          alt=""
          width="192"
          height="192"
          className="h-16 w-16 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.35)] md:h-28 md:w-28"
        />
        <p className="mt-1 max-w-full font-display text-4xl tracking-[.18em] md:mt-3 md:text-5xl md:tracking-[.12em] lg:text-6xl lg:tracking-[.18em]">
          LAWPIKING
        </p>
        <p className="mt-2 text-[11px] font-medium uppercase tracking-[.25em] text-white/85 md:mt-4 md:text-sm">
          Style · Qualité · Confiance
        </p>
      </div>

      <svg
        aria-hidden="true"
        viewBox="0 0 800 160"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 h-14 w-full md:h-32"
      >
        <path d="M0,88 C150,38 300,138 480,88 C620,48 720,68 800,38 L800,160 L0,160 Z" fill="#15803D" />
        <path d="M0,108 C160,68 320,148 500,103 C640,68 730,93 800,68 L800,160 L0,160 Z" fill="#FFFFFF" />
        <path d="M0,126 C170,93 330,158 520,120 C650,96 740,116 800,98 L800,160 L0,160 Z" fill="#DC2626" />
      </svg>
    </aside>
  );
}
