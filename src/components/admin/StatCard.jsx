import Icon from "../common/Icon";

const TONES = {
  green: "bg-green-50 text-law-green",
  red: "bg-red-50 text-law-red",
  amber: "bg-amber-50 text-amber-500",
};

// display : texte à afficher à la place de `value` (ex. « 4,8/5 », « 94 % »).
export default function StatCard({ icon, title, value, display, delta, trend = "up", tone = "green" }) {
  const up = trend === "up";
  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-2.5">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${TONES[tone]}`}>
          <Icon name={icon} width={18} />
        </span>
        <h2 className="text-xs font-semibold text-gray-500 sm:text-sm">{title}</h2>
      </div>
      <p className="mt-3 text-3xl font-extrabold leading-none text-gray-900 sm:text-4xl">
        {display ?? new Intl.NumberFormat("fr-FR").format(value)}
      </p>
      {delta && (
        <p className={`mt-2 flex items-center gap-1 text-[11px] font-semibold ${up ? "text-law-green" : "text-law-red"}`}>
          <Icon name={up ? "lucide:trending-up" : "lucide:trending-down"} width={13} />
          {delta}
        </p>
      )}
    </article>
  );
}
