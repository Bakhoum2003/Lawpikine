import { Link } from "react-router-dom";
import Icon from "../common/Icon";

export default function Topbar({ userName = "Admin", menuOpen, onMenu }) {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-100 bg-white">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-8">
        {/* Tablette / mobile : logo, le menu est dans le bouton à droite */}
        <Link to="/admin" className="flex items-center gap-2 lg:hidden">
          <img src="/favicon-person.png" alt="" width="192" height="192" className="h-8 w-8 object-contain" />
          <span className="font-display text-xl tracking-[.15em] text-law-green-dark">LAWPIKING</span>
        </Link>

        {/* Ordinateur : recherche (interface seulement pour le moment) */}
        <label className="relative hidden w-full max-w-md lg:block">
          <span className="sr-only">Rechercher</span>
          <Icon name="lucide:search" width={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Rechercher..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-law-green focus:bg-white focus:ring-2 focus:ring-green-100"
          />
        </label>

        <div className="ml-auto flex items-center gap-1 sm:gap-3">
          <button type="button" aria-label="Notifications" className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-law-green">
            <Icon name="lucide:bell" width={20} />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-law-red ring-2 ring-white" aria-hidden="true" />
          </button>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-law-green text-sm font-bold text-white" aria-hidden="true">
              {userName.charAt(0).toUpperCase()}
            </span>
            <span className="text-sm font-semibold text-gray-800">{userName}</span>
          </div>
          <button
            type="button"
            onClick={onMenu}
            aria-label="Ouvrir le menu"
            aria-expanded={menuOpen}
            aria-controls="admin-sidebar"
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-law-green lg:hidden"
          >
            <Icon name="lucide:menu" width={22} />
          </button>
        </div>
      </div>
    </header>
  );
}
