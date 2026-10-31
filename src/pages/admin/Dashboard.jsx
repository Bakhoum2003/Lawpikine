import { useEffect, useState } from "react";
import Icon from "../../components/common/Icon";
import StatCard from "../../components/admin/StatCard";
import SalesChart from "../../components/admin/SalesChart";
import { getDashboardData } from "../../services/dashboardService";
import { formatPrice } from "../../services/productService";
import { getSession } from "../../services/authService";

const today = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(new Date());

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const name = getSession()?.name ?? "Admin";

  useEffect(() => {
    let cancelled = false;
    getDashboardData()
      .then((result) => !cancelled && setData(result))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">Bonjour {name} <span aria-hidden="true">👋</span></h1>
          <p className="mt-1 text-sm text-gray-500">Voici un aperçu de votre boutique aujourd'hui.</p>
        </div>
        <div className="hidden shrink-0 items-center gap-2.5 rounded-xl border border-gray-100 bg-white px-4 py-2.5 shadow-sm sm:flex">
          <Icon name="lucide:calendar" width={18} className="text-gray-400" />
          <div className="leading-tight">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Aujourd'hui</p>
            <p className="text-sm font-bold text-gray-800">{today}</p>
          </div>
        </div>
      </div>

      {failed && <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-law-red-dark">Impossible de charger les statistiques.</p>}
      {!data && !failed && <DashboardSkeleton />}
      {data && (
        <>
          <section aria-label="Statistiques" className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-5">
            <StatCard icon="lucide:package" tone="green" title="Total produits" {...data.stats.products} />
            <StatCard icon="lucide:shopping-cart" tone="red" title="Commandes" {...data.stats.orders} />
            <StatCard icon="lucide:star" tone="amber" title="Avis clients" {...data.stats.reviews} />
            <StatCard icon="lucide:boxes" tone="red" title="Stock total" {...data.stats.stock} />
          </section>

          <div className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <section className="min-w-0 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
              <h2 className="text-base font-bold text-gray-900">Évolution des ventes</h2>
              <p className="mb-4 text-xs text-gray-500">Ventes des 7 derniers jours</p>
              <SalesChart data={data.sales} />
            </section>

            <section className="min-w-0 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
              <h2 className="text-base font-bold text-gray-900">Produits les plus vendus</h2>
              <ul className="mt-4 divide-y divide-gray-100">
                {data.topProducts.map((product) => (
                  <li key={product.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <img src={product.img} alt={product.name} loading="lazy" className="h-12 w-12 shrink-0 rounded-lg bg-gray-100 object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.sold} ventes</p>
                    </div>
                    <p className="shrink-0 text-sm font-bold text-law-green-dark">{formatPrice(product.amount)}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mt-6 animate-pulse" aria-busy="true" aria-label="Chargement du tableau de bord">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <div key={item} className="h-28 rounded-2xl bg-white" />)}
      </div>
      <div className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="h-72 rounded-2xl bg-white" />
        <div className="h-72 rounded-2xl bg-white" />
      </div>
    </div>
  );
}
