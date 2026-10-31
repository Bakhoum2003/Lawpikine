import { Link, useLocation } from "react-router-dom";
import Icon from "../common/Icon";
import { ADMIN_TABS, isNavActive } from "./adminNav";

// Barre d'onglets fixe en bas, visible sous 1024 px (maquette « aperçu mobile »).
export default function MobileTabBar({ onMore }) {
  const { pathname } = useLocation();
  const base = "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-law-green";
  return (
    <nav aria-label="Navigation rapide" className="fixed inset-x-0 bottom-0 z-30 flex border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
      {ADMIN_TABS.map((tab) => {
        const active = isNavActive(pathname, tab);
        return (
          <Link key={tab.to} to={tab.to} aria-current={active ? "page" : undefined} className={`${base} ${active ? "text-law-green" : "text-gray-500 hover:text-gray-800"}`}>
            <Icon name={tab.icon} width={22} />
            {tab.label}
          </Link>
        );
      })}
      <button type="button" onClick={onMore} aria-controls="admin-sidebar" className={`${base} text-gray-500 hover:text-gray-800`}>
        <Icon name="lucide:layout-grid" width={22} />
        Plus
      </button>
    </nav>
  );
}
