import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { getSession, isAuthenticated, logout } from "../../services/authService";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileTabBar from "./MobileTabBar";

// Structure commune des pages admin : sidebar, barre supérieure, barre d'onglets mobile.
// ⚠️ La redirection vers /admin/login n'est qu'un confort d'interface (connexion de
// démonstration côté navigateur) : elle ne protège aucune donnée.
export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const authenticated = isAuthenticated();

  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (event) => event.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  if (!authenticated) return <Navigate to="/admin/login" replace />;

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#f5f7f6]">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} onLogout={handleLogout} />
      <div className="lg:pl-60">
        <Topbar userName={getSession()?.name ?? "Admin"} menuOpen={menuOpen} onMenu={() => setMenuOpen((open) => !open)} />
        <main className="px-4 pb-24 pt-5 lg:px-8 lg:pb-10 lg:pt-7">{children}</main>
      </div>
      <MobileTabBar onMore={() => setMenuOpen(true)} />
    </div>
  );
}
