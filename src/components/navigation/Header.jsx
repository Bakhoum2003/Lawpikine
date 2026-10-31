import { useState } from "react";
import Icon from "../common/Icon";
const links = [
  ["/#hero", "Accueil"],
  ["/#collection", "Collection"],
  ["/#about", "La Marque"],
  ["/#contact", "Contact"],
];
const socialLinks = [
  ["simple-icons:tiktok", "TikTok", "https://www.tiktok.com/@malawpikine?_r=1&_t=ZS-9B06huwTR93"],
  ["simple-icons:snapchat", "Snapchat", "https://www.snapchat.com/add/malawpikine"],
  ["simple-icons:instagram", "Instagram", "https://www.instagram.com/maalawpikine?exln=NzF2dG5mMGxlbml3"],
];
export default function Header({ favorites, cartCount, onCart, showInfoBar = true }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <>
      {showInfoBar && (
        <div className="bg-law-green text-white">
          <div className="mx-auto flex min-h-8 max-w-7xl items-center justify-between gap-2 px-4 py-1 sm:px-6 lg:px-8">
            <p className="flex min-w-0 items-center gap-2 text-[10px] font-semibold leading-4 sm:text-xs">
              <Icon name="lucide:truck" width={15} className="shrink-0" />
              <span>Livraison partout au Sénégal | Paiement à la livraison disponible</span>
            </p>
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              {socialLinks.map(([icon, label, href]) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="rounded-full p-1 text-white transition duration-200 hover:scale-110 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/80">
                  <Icon name={icon} width={15} />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm transition-all duration-300 border-b border-red-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="/#hero" className="flex items-center gap-2 group">
          <span className="w-8 h-8 bg-law-red rounded-sm flex items-center justify-center group-hover:bg-law-green transition-colors">
            <span className="text-white font-display text-lg">L</span>
          </span>
          <span className="font-display text-2xl tracking-widest text-gray-900 group-hover:text-law-red">
            LAWPIKING
          </span>
        </a>
        <div className="hidden md:flex items-center gap-8">
          {links.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="text-xs font-semibold tracking-widest uppercase text-gray-500 hover:text-law-red transition-colors"
            >
              {label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <a
            href="/favoris"
            className="relative p-2 text-gray-700 hover:bg-red-50 hover:text-law-red focus:outline-none focus:ring-2 focus:ring-law-red focus:ring-offset-2 rounded-full transition-colors"
          >
            <Icon name="lucide:heart" width={22} />
            {favorites > 0 && <Count value={favorites} />}
          </a>
          <a
            href="/compte"
            className="p-2 text-gray-700 hover:bg-red-50 hover:text-law-red focus:outline-none focus:ring-2 focus:ring-law-red focus:ring-offset-2 rounded-full transition-colors"
          >
            <Icon name="lucide:user-round" width={22} />
          </a>
          <button
            onClick={onCart}
            className="relative p-2 hover:bg-red-50 rounded-full transition-colors group"
          >
            <Icon
              name="lucide:shopping-bag"
              width={22}
              className="text-gray-700 group-hover:text-law-red transition-colors"
            />
            {cartCount > 0 && <Count value={cartCount} />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 hover:bg-red-50 rounded-full"
          >
            <Icon name="lucide:menu" width={22} />
          </button>
        </div>
      </div>
      <div
        className={`${mobileOpen ? "block" : "hidden"} md:hidden bg-white border-t border-red-100`}
      >
        <div className="px-6 py-4 flex flex-col gap-3">
          {links.map(([href, label]) => (
            <a
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium py-2 text-gray-700 hover:text-law-red"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </nav>
    </>
  );
}
function Count({ value }) {
  return (
    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-law-red text-white text-[10px] font-bold rounded-full flex items-center justify-center">
      {value}
    </span>
  );
}
