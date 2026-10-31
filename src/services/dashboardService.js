import { DASHBOARD_STATS, SALES_LAST_7_DAYS, TOP_PRODUCTS } from "../data/dashboardDemo";
import { getProductBySlug } from "./productService";

// Données de démonstration. La fonction est asynchrone pour que la page n'ait
// pas à changer quand elle appellera une vraie API (ex. GET /admin/dashboard).

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);
const toTitle = (text) => text.toLowerCase().split(" ").map(capitalize).join(" ");

function lastSevenDays() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return date;
  });
}

const shortDay = new Intl.DateTimeFormat("fr-FR", { weekday: "short" });
const longDay = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "short" });

export async function getDashboardData() {
  const sales = lastSevenDays().map((date, index) => ({
    date: date.toISOString().slice(0, 10),
    label: capitalize(shortDay.format(date).replace(".", "")),
    fullLabel: capitalize(longDay.format(date)),
    value: SALES_LAST_7_DAYS[index],
  }));

  const topProducts = TOP_PRODUCTS.map(({ slug, sold }) => {
    const product = getProductBySlug(slug);
    return product
      ? { id: product.id, name: `T-shirt ${toTitle(product.name)}`, img: product.img, sold, amount: sold * product.price }
      : null;
  }).filter(Boolean);

  return { stats: DASHBOARD_STATS, sales, topProducts };
}
