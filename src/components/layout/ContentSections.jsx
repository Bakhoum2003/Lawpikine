import React from "react";
import Icon from "../common/Icon";
const benefits = [
  [
    "lucide:shirt",
    "QUALITÉ PREMIUM",
    "Des T-shirts pensés pour allier confort, style et durabilité. Des matières sélectionnées avec soin pour vous accompagner au quotidien.",
    "red",
  ],
  [
    "lucide:palette",
    "COULEURS UNIQUES",
    "Du classique au plus audacieux, Lawpiking propose des couleurs pensées pour s’adapter à chaque style.",
    "green",
  ],
  [
    "lucide:heart-handshake",
    "UN ACHAT, UN GESTE POUR L’ÉDUCATION",
    "Chez Lawpiking, nos ventes contribuent chaque année à des dons de fournitures scolaires destinés aux élèves. Votre style peut aussi soutenir l’éducation.",
    "gray",
  ],
];
function Picture({ image, color, h }) {
  const backgrounds = {
    emerald: "from-emerald-50 to-teal-50",
    gray: "from-gray-100 to-gray-200",
    black: "from-gray-800 to-gray-900",
    red: "from-red-50 to-red-100",
  };
  return (
    <div className={`bg-gray-100 rounded-2xl overflow-hidden shadow-xl ${h}`}>
      <img
        src={`/${image}`}
        alt="T-shirt Lawpiking"
        className={`w-full h-full object-contain p-6 bg-gradient-to-br ${backgrounds[color]}`}
      />
    </div>
  );
}
export function About() {
  const colors = {
    red: [
      "bg-red-50 group-hover:bg-law-red",
      "text-law-red group-hover:text-white",
    ],
    green: [
      "bg-green-50 group-hover:bg-law-green",
      "text-law-green group-hover:text-white",
    ],
    gray: [
      "bg-gray-100 group-hover:bg-gray-900",
      "text-gray-700 group-hover:text-white",
    ],
  };
  return (
    <>
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-law-cream">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[11px] font-bold tracking-[.3em] uppercase text-law-green mb-3">
              02 — Pourquoi Nous Choisir
            </p>
            <h2 className="font-display text-5xl sm:text-6xl tracking-tight">
              La Différence LAWPIKING
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map(([icon, title, text, color]) => (
              <div
                key={title}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group"
              >
                <div
                  className={`w-14 h-14 ${colors[color][0]} rounded-xl flex items-center justify-center mb-6 transition-colors duration-300`}
                >
                  <Icon
                    name={icon}
                    width={28}
                    className={`${colors[color][1]} transition-colors`}
                  />
                </div>
                <h3 className="font-display text-2xl tracking-wide mb-3">
                  {title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <SizeGuide />
      <Testimonials />
    </>
  );
}
function SizeGuide() {
  const rows = [
    ["S", "96", "68", "44"],
    ["M", "100", "71", "46"],
    ["L", "104", "74", "48"],
    ["XL", "112", "77", "52"],
    ["XXL", "120", "80", "56"],
  ];
  return (
    <section
      id="size-guide"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-gray-100"
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[11px] font-bold tracking-[.3em] uppercase text-law-red mb-3">
            03 — Guide
          </p>
          <h2 className="font-display text-4xl tracking-tight">
            Guide des Tailles
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            Notre coupe est Regular Fit. Si tu es entre deux tailles, prends la
            taille au-dessus.
          </p>
        </div>
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Taille",
                  "Poitrine (cm)",
                  "Longueur (cm)",
                  "Épaules (cm)",
                ].map((x) => (
                  <th
                    key={x}
                    className="py-4 px-6 text-left text-[11px] font-bold tracking-widest uppercase text-gray-500"
                  >
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row[0]} className="hover:bg-red-50/30">
                  {row.map((x, i) => (
                    <td
                      key={x}
                      className={`py-4 px-6 ${i === 0 ? "font-bold text-law-red" : ""}`}
                    >
                      {x}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
function Testimonials() {
  const cards = [
    [
      "Y",
      "Youssef M.",
      "Le vert menthe est une tuerie. Qualité au rendez-vous, je vais prendre les autres couleurs.",
      "border-law-red",
      5,
    ],
    [
      "L",
      "Léa D.",
      "Enfin une marque française qui assume son style. Le rouge est magnifique, très bon tissus.",
      "border-law-green",
      5,
    ],
    [
      "K",
      "Karim B.",
      "J’ai pris le pack complet, super idée. Tous mes potes veulent la même maintenant lol",
      "border-gray-900",
      4,
    ],
  ];
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[11px] font-bold tracking-[.3em] uppercase text-law-green mb-3">
            04 — Avis Clients
          </p>
          <h2 className="font-display text-5xl tracking-tight">
            Ils Ont Choisi la Loi
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {cards.map(([initial, name, quote, color, rating]) => (
            <div
              key={name}
              className={`bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border-l-4 ${color}`}
            >
              <div className="mb-4 flex gap-1">
                {Array.from({ length: 5 }, (_, index) => (
                  <Icon
                    key={index}
                    name="lucide:star"
                    width={18}
                    className={
                      index < rating ? "text-yellow-400" : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                “{quote}”
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold">
                  {initial}
                </div>
                <p className="font-bold text-sm">{name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
export function ContactFooter({ onFeedback }) {
  return (
    <>
      <ContactSection onFeedback={onFeedback} />
      <SiteFooter />
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-slate-950 px-4 py-14 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-8 pb-10 lg:grid-cols-3">
            <div className="col-span-2 lg:col-span-1">
              <p className="font-display text-2xl tracking-widest">LAWPIKING</p>
              <p className="mt-3 text-sm text-slate-400">
                Découvrez nos collections de T-shirts et affirmez votre style
                avec Lawpiking.
              </p>
            </div>
            <nav>
              <p className="text-[11px] font-semibold uppercase tracking-[.18em] text-slate-200">
                Boutique
              </p>
              <a
                href="/#collection"
                className="block mt-4 text-sm text-slate-400"
              >
                Collection
              </a>
              <a
                href="/#size-guide"
                className="block mt-3 text-sm text-slate-400"
              >
                Guide des tailles
              </a>
            </nav>
            <nav>
              <p className="text-[11px] font-semibold uppercase tracking-[.18em] text-slate-200">
                Marque
              </p>
              <a href="/#about" className="block mt-4 text-sm text-slate-400">
                Notre histoire
              </a>
              <a href="/#contact" className="block mt-3 text-sm text-slate-400">
                Contact
              </a>
            </nav>
          </div>
          <div className="flex flex-col items-center gap-2 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
            <p>© 2026 LAWPIKING. Tous droits réservés.</p>
            <p>
              Réalisé par{" "}
              <a
                href="https://wa.me/221705558382"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-slate-300 underline decoration-law-green underline-offset-4 transition-colors hover:text-white"
              >
                BAKHOUM_DEV
              </a>
            </p>
          </div>
        </div>
    </footer>
  );
}
function ContactSection({ onFeedback }) {
  const [form, setForm] = React.useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = React.useState({});
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const submit = (event) => {
    event.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = "Votre nom est obligatoire.";
    if (!form.email.trim()) next.email = "Votre adresse e-mail est obligatoire.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Saisissez une adresse e-mail valide.";
    if (!form.message.trim()) next.message = "Votre message est obligatoire.";
    setErrors(next);
    if (Object.keys(next).length) return;
    const subject = `Message du site LAWPIKING — ${form.name.trim()}`;
    const body = `Nom : ${form.name.trim()}\nE-mail : ${form.email.trim()}\n\nMessage :\n${form.message.trim()}`;
    window.location.href = `mailto:malaw596@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  return <section id="contact" className="bg-[#FFFBF5] px-4 py-16 sm:px-6 sm:py-20 lg:px-8"><div className="mx-auto max-w-6xl"><div className="mb-10 text-center"><p className="text-xs font-bold tracking-[.2em] text-law-red">— NOUS SOMMES À VOTRE ÉCOUTE —</p><h2 className="mt-3 font-display text-4xl sm:text-5xl">Contactez-nous</h2></div><div className="grid gap-6 lg:grid-cols-2"><section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"><h3 className="text-xl font-bold text-slate-900">Nos coordonnées</h3><div className="mt-7 space-y-5"><ContactDetail icon="lucide:phone" label="Téléphone" value="+221 77 677 10 09" href="tel:+221776771009" /><ContactDetail icon="lucide:mail" label="E-mail" value="malaw596@gmail.com" href="mailto:malaw596@gmail.com" /><ContactDetail icon="lucide:map-pin" label="Adresse" value="Dakar, Sénégal" /></div><div className="mt-7 overflow-hidden rounded-xl border border-gray-100"><iframe title="LAWPIKING à Dakar" src="https://www.google.com/maps?q=14.7501939,-17.3934825&z=15&output=embed" className="h-72 w-full border-0" loading="lazy" allowFullScreen /><a href="https://www.google.com/maps/dir/?api=1&destination=14.7501939,-17.3934825" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 border-t border-gray-100 px-4 py-3 text-sm font-bold text-law-green hover:bg-green-50"><Icon name="lucide:route" width={17} />Voir l’itinéraire</a></div></section><section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"><h3 className="text-xl font-bold text-slate-900">Envoyez-nous un message</h3><form noValidate onSubmit={submit} className="mt-7 space-y-5"><ContactField label="Nom complet" name="name" value={form.name} error={errors.name} placeholder="Votre nom" onChange={update} /><ContactField label="E-mail" name="email" type="email" value={form.email} error={errors.email} placeholder="Votre adresse e-mail" onChange={update} /><ContactField label="Message" name="message" value={form.message} error={errors.message} placeholder="Écrivez votre message ici..." onChange={update} textarea /><button type="submit" className="w-full rounded-lg bg-law-green px-5 py-3.5 text-sm font-bold text-white transition hover:bg-law-green-dark">Envoyer le message</button></form><button type="button" onClick={onFeedback} className="mt-5 text-sm font-semibold text-law-red hover:underline">Donner votre avis</button></section></div></div></section>;
}
function ContactDetail({ icon, label, value, href }) { const content = <><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-50 text-law-green"><Icon name={icon} width={20} /></span><span><span className="block text-sm font-semibold text-slate-900">{label}</span><span className="mt-0.5 block text-sm text-gray-600">{value}</span></span></>; return href ? <a href={href} className="flex items-center gap-4 rounded-lg hover:bg-gray-50">{content}</a> : <div className="flex items-center gap-4">{content}</div>; }
function ContactField({ label, name, type = "text", value, error, placeholder, onChange, textarea = false }) { const classes = `mt-1.5 w-full rounded-lg border px-3 py-3 text-sm outline-none transition focus:border-law-green focus:ring-2 focus:ring-green-100 ${error ? "border-red-500" : "border-gray-200"}`; return <label className="block text-sm font-semibold text-slate-800">{label} <span className="text-law-red">*</span>{textarea ? <textarea name={name} value={value} onChange={(event) => onChange(name, event.target.value)} placeholder={placeholder} rows="5" className={`${classes} resize-y`} aria-invalid={Boolean(error)} /> : <input name={name} type={type} value={value} onChange={(event) => onChange(name, event.target.value)} placeholder={placeholder} className={classes} aria-invalid={Boolean(error)} />}{error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}</label>; }
