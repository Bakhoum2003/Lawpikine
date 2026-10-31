import { Link, useLocation } from "react-router-dom";
import Icon from "../common/Icon";
import { ADMIN_NAV, isNavActive } from "./adminNav";

// Ordinateur : colonne fixe. Tablette / mobile : tiroir ouvert par le menu.
export default function Sidebar({ open, onClose, onLogout }) {
  const { pathname } = useLocation();
  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        id="admin-sidebar"
        aria-label="Navigation administrateur"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#0f4d2a] text-white transition-transform duration-300 lg:w-60 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col items-center px-4 pb-4 pt-6">
          <img src="/favicon-person.png" alt="" width="192" height="192" className="h-12 w-12 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.35)]" />
          <span className="font-display text-2xl tracking-[.18em]">LAWPIKING</span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {ADMIN_NAV.map((item) => {
            const active = isNavActive(pathname, item);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white/70 ${active ? "bg-law-red text-white shadow-sm" : "text-white/80 hover:bg-white/10 hover:text-white"}`}
              >
                <Icon name={item.icon} width={18} className="shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/70"
          >
            <Icon name="lucide:log-out" width={18} className="shrink-0" />
            Se déconnecter
          </button>
        </div>
      </aside>
    </>
  );
}
