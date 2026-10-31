import { useCallback, useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/navigation/Header";
import CartDrawer from "./components/cart/CartDrawer";
import CheckoutModal from "./components/cart/CheckoutModal";
import StorePage from "./pages/public/StorePage";
import ProductDetailPage from "./pages/public/ProductDetailPage";
import { FavoritesPage, AccountPage, AdminPage } from "./pages/public/SpecialPages";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import AdminLayout from "./components/admin/AdminLayout";
import ProductsAdmin from "./pages/admin/products/ProductsAdmin";
import AddProduct from "./pages/admin/products/AddProduct";
import EditProduct from "./pages/admin/products/EditProduct";
import OrdersAdmin from "./pages/admin/OrdersAdmin";
import StockAdmin from "./pages/admin/StockAdmin";
import PromotionsAdmin from "./pages/admin/PromotionsAdmin";
import ReviewsAdmin from "./pages/admin/ReviewsAdmin";
import CategoriesAdmin from "./pages/admin/CategoriesAdmin";
import SettingsAdmin from "./pages/admin/SettingsAdmin";
import { ContactFooter, SiteFooter } from "./components/layout/ContentSections";
import { getProducts } from "./services/productService";
import { useLocalStorage } from "./hooks/useLocalStorage";
import Icon from "./components/common/Icon";
import FeedbackModal from "./components/contact/FeedbackModal";

export default function App() {
  const products = getProducts();
  const location = useLocation();
  const [favorites, setFavorites] = useLocalStorage("lawpikingFavorites", []);
  const [cart, setCart] = useLocalStorage("lawpikingCart", []);
  const [drawer, setDrawer] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [toast, setToast] = useState("");
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(""), 2800); return () => clearTimeout(timer); }, [toast]);
  const show = useCallback((message) => setToast(message), []);
  const toggleFavorite = useCallback((id) => {
    const isRemoving = favorites.includes(id);
    setFavorites((old) => old.includes(id) ? old.filter((x) => x !== id) : [...old, id]);
    show(isRemoving ? "Retiré des favoris." : "Ajouté aux favoris !");
  }, [favorites, setFavorites, show]);
  const add = useCallback((product, options = {}) => {
    const { size = "", color = "", quantity = 1 } = options;
    setCart((old) => {
      const found = old.find((x) => x.id === product.id && x.size === size && x.color === color);
      return found ? old.map((x) => x === found ? { ...x, qty: Math.min(x.qty + quantity, product.stock ?? Infinity) } : x) : [...old, { ...product, size, color, qty: quantity }];
    });
    show(`${product.name} ajouté au panier !`);
  }, [setCart, show]);
  const update = (item, delta) => setCart((old) => old.map((x) => x.id === item.id && x.size === item.size && x.color === item.color ? { ...x, qty: Math.min(x.qty + delta, x.stock ?? Infinity) } : x).filter((x) => x.qty > 0));
  const remove = (item) => setCart((old) => old.filter((x) => x.id !== item.id || x.size !== item.size || x.color !== item.color));
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const isPublic = !location.pathname.startsWith("/admin") && !location.pathname.startsWith("/compte");
  const isAdminPage = location.pathname.startsWith("/admin");
  const isProductPage = location.pathname.startsWith("/produit/");
  const openProduct = useCallback((slug, navigate) => {
    setProductLoading(true);
    requestAnimationFrame(() => navigate(`/produit/${slug}`));
  }, []);
  const storeProps = { favorites, onFavorite: toggleFavorite, onFeedback: () => setFeedbackOpen(true), onOpenProduct: openProduct };
  return <div className="flex min-h-screen flex-col">
    {!isAdminPage && <Header favorites={favorites.length} cartCount={count} onCart={() => setDrawer(true)} showInfoBar={!isAdminPage} />}
    <ScrollToProductTop pathname={location.pathname} />
    <main className="flex-1"><Routes>
      <Route path="/" element={<StorePage {...storeProps} />} />
      <Route path="/produit/:slug" element={<ProductDetailPage favorites={favorites} onFavorite={toggleFavorite} onAdd={add} onMessage={show} onReady={() => setProductLoading(false)} />} />
      <Route path="/favoris" element={<FavoritesPage products={products} favorites={favorites} onFavorite={toggleFavorite} onOpenProduct={openProduct} />} />
      <Route path="/compte" element={<AccountPage />} />
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<AdminLayout><Dashboard /></AdminLayout>} />
      <Route path="/admin/produits" element={<AdminLayout><ProductsAdmin /></AdminLayout>} />
      <Route path="/admin/produits/nouveau" element={<AdminLayout><AddProduct /></AdminLayout>} />
      <Route path="/admin/produits/:id/modifier" element={<AdminLayout><EditProduct /></AdminLayout>} />
      <Route path="/admin/commandes" element={<AdminLayout><OrdersAdmin /></AdminLayout>} />
      <Route path="/admin/stock" element={<AdminLayout><StockAdmin /></AdminLayout>} />
      <Route path="/admin/promotions" element={<AdminLayout><PromotionsAdmin /></AdminLayout>} />
      <Route path="/admin/avis" element={<AdminLayout><ReviewsAdmin /></AdminLayout>} />
      <Route path="/admin/categories" element={<AdminLayout><CategoriesAdmin /></AdminLayout>} />
      <Route path="/admin/parametres" element={<AdminLayout><SettingsAdmin /></AdminLayout>} />
      <Route path="/admin/*" element={<AdminLayout><AdminPage /></AdminLayout>} />
      <Route path="*" element={<StorePage {...storeProps} />} />
    </Routes></main>
    {isPublic && (isProductPage ? <SiteFooter /> : <ContactFooter onFeedback={() => setFeedbackOpen(true)} />)}
    {!isAdminPage && <CartDrawer open={drawer} items={cart} onClose={() => setDrawer(false)} onQuantity={update} onRemove={remove} onCheckout={() => { setDrawer(false); setCheckout(true); }} />}
    {checkout && <CheckoutModal items={cart} onClose={() => setCheckout(false)} onComplete={() => { setCart([]); setCheckout(false); show("Votre commande a été préparée."); }} />}
    {feedbackOpen && <FeedbackModal onClose={() => setFeedbackOpen(false)} />}
    {productLoading && <ProductSpinner />}
    {!isAdminPage && <a href="https://wa.me/221776771009?text=Bonjour%2C%20je%20vous%20contacte%20depuis%20le%20site%20LAWPIKING." target="_blank" rel="noreferrer" className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg"><Icon name="simple-icons:whatsapp" width={26} /></a>}
    {toast && <div role="status" className="fixed bottom-6 left-1/2 z-[70] flex min-w-[300px] -translate-x-1/2 items-center gap-3 rounded-xl bg-gray-900 px-6 py-4 text-white shadow-2xl"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-law-green"><Icon name="lucide:check" width={16} /></div><span className="text-sm font-medium">{toast}</span></div>}
  </div>;
}

function ScrollToProductTop({ pathname }) {
  useEffect(() => {
    if (pathname.startsWith("/produit/")) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}
function ProductSpinner() {
  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-white/75 backdrop-blur-[1px]" role="status" aria-label="Chargement du produit"><span className="product-spinner" /></div>;
}
