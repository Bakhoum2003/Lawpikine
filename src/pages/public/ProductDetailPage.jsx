import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Icon from "../../components/common/Icon";
import { formatPrice, getProductBySlug, getProductsByType } from "../../services/productService";

const categoryNames = { tshirts: "T-shirts", pulls: "Pulls", bonnets: "Bonnets" };
const colorSwatches = {
  "VERT MENTHE": "#73c9a7", "VERT FONCÉ": "#14532d", "GRIS CHINÉ": "#9ca3af",
  "BLEU ROYAL": "#1d4ed8", "NOIR INTENSE": "#111827", "ROUGE CARDINAL": "#dc2626",
  MARRON: "#92400e", ORANGE: "#f97316", JAUNE: "#facc15",
};
const sizeRows = [["S", "96", "68", "44"], ["M", "100", "71", "46"], ["L", "104", "74", "48"], ["XL", "112", "77", "52"], ["XXL", "120", "80", "56"]];

export default function ProductDetailPage({ favorites, onFavorite, onAdd, onMessage, onReady }) {
  const { slug } = useParams();
  const product = getProductBySlug(slug);
  const navigate = useNavigate();
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState("description");
  const [image, setImage] = useState(product?.img);

  useEffect(() => {
    setSize("");
    setQuantity(1);
    setImage(product?.img);
    onReady?.();
  }, [product?.id, onReady]);

  if (!product) return <NotFound />;
  const colors = getProductsByType(product.productType);
  const maxQuantity = product.stock ?? Infinity;
  const selectColor = (variant) => navigate(`/produit/${variant.slug}`);
  const addToCart = () => {
    if (product.sizes?.length && !size) return onMessage("Choisissez une taille avant d’ajouter au panier.");
    onAdd(product, { size, color: product.name, quantity });
  };

  return (
    <section className="bg-white px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Breadcrumb product={product} />
        <div className="mt-7 grid gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,.92fr)] lg:gap-14">
          <ProductGallery product={product} image={image} onImageChange={setImage} />
          <ProductInfo product={product} />
          <div className="lg:col-start-2 lg:row-start-1 lg:mt-48">
            <ColorSelector colors={colors} selectedId={product.id} onSelect={selectColor} />
            <SizeSelector sizes={product.sizes} selected={size} onSelect={setSize} />
            <PurchaseControls quantity={quantity} maxQuantity={maxQuantity} onQuantityChange={setQuantity} onAdd={addToCart} />
            <button onClick={() => onFavorite(product.id)} aria-pressed={favorites.includes(product.id)} className={`mt-3 flex w-full items-center justify-center gap-2 border-2 py-3.5 text-sm font-bold transition ${favorites.includes(product.id) ? "border-law-red bg-red-50 text-law-red" : "border-law-green text-law-green hover:bg-green-50"}`}>
              <Icon name="lucide:heart" width={18} className={favorites.includes(product.id) ? "fill-current" : ""} />
              {favorites.includes(product.id) ? "Ajouté aux favoris" : "Ajouter aux favoris"}
            </button>
          </div>
        </div>
        <ServiceHighlights />
        <ProductTabs product={product} activeTab={tab} onTabChange={setTab} />
      </div>
    </section>
  );
}

function Breadcrumb({ product }) {
  return <nav aria-label="Fil d’Ariane" className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500"><Link to="/" className="hover:text-law-red">Accueil</Link><span>›</span><Link to="/#collection" className="hover:text-law-red">{categoryNames[product.productType] || "Collection"}</Link><span>›</span><span className="text-gray-900">{product.name}</span></nav>;
}
function ProductGallery({ product, image, onImageChange }) {
  const images = product.images?.length ? product.images : [product.img];
  return <div className="flex min-w-0 flex-col gap-3 sm:flex-row"><div className={`order-2 flex gap-2 overflow-x-auto sm:order-1 sm:max-h-[520px] sm:flex-col sm:overflow-y-auto ${images.length < 2 ? "hidden" : ""}`}>{images.map((src, index) => <button key={src} onClick={() => onImageChange(src)} aria-label={`Voir l’image ${index + 1}`} className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 p-1 ${image === src ? "border-law-red" : "border-transparent bg-gray-50"}`}><img src={src} alt="" className="h-full w-full object-contain" /></button>)}</div><div className={`order-1 flex min-h-[360px] flex-1 items-center justify-center rounded-2xl bg-gradient-to-br p-6 sm:order-2 sm:min-h-[520px] ${product.bgColor}`}><img src={image} alt={product.name} className="max-h-[490px] w-full object-contain drop-shadow-2xl" /></div></div>;
}
function ProductInfo({ product }) { return <div className="lg:col-start-2 lg:row-start-1"><p className="text-[11px] font-bold uppercase tracking-[.2em] text-law-red">{categoryNames[product.productType]}</p><h1 className="mt-2 font-display text-4xl tracking-wide text-gray-900 sm:text-5xl">{product.name}</h1><p className="mt-3 font-display text-3xl text-law-red">{formatPrice(product.price)}</p><p className="mt-7 leading-7 text-gray-600">{product.desc}</p></div>; }
function ColorSelector({ colors, selectedId, onSelect }) { return <section className="mt-7"><h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">Couleur</h2><div className="mt-3 flex flex-wrap gap-3">{colors.map((color) => <button key={color.id} onClick={() => onSelect(color)} title={color.name} aria-label={`Couleur ${color.name}`} aria-pressed={selectedId === color.id} className={`h-9 w-9 rounded-full border-2 p-1 transition ${selectedId === color.id ? "border-gray-900 ring-2 ring-law-green ring-offset-2" : "border-gray-200"}`}><span className="block h-full w-full rounded-full" style={{ backgroundColor: colorSwatches[color.name] || "#e5e7eb" }} /></button>)}</div></section>; }
function SizeSelector({ sizes = [], selected, onSelect }) { if (!sizes.length) return null; return <section className="mt-7"><h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">Taille <span className="normal-case text-law-red">(obligatoire)</span></h2><div className="mt-3 flex flex-wrap gap-2">{sizes.map((item) => <button key={item} onClick={() => onSelect(item)} className={`min-w-12 border-2 px-4 py-2.5 text-sm font-bold transition ${selected === item ? "border-law-red bg-red-50 text-law-red" : "border-gray-200 text-gray-700 hover:border-law-green"}`}>{item}</button>)}</div></section>; }
function PurchaseControls({ quantity, maxQuantity, onQuantityChange, onAdd }) { const change = (delta) => onQuantityChange(Math.max(1, Math.min(maxQuantity, quantity + delta))); return <section className="mt-8 flex flex-col gap-3 sm:flex-row"><div className="flex h-14 shrink-0 items-center justify-between border border-gray-200"><button onClick={() => change(-1)} disabled={quantity === 1} aria-label="Diminuer la quantité" className="h-full w-12 disabled:text-gray-300">−</button><span className="w-9 text-center font-bold">{quantity}</span><button onClick={() => change(1)} disabled={quantity >= maxQuantity} aria-label="Augmenter la quantité" className="h-full w-12 disabled:text-gray-300">+</button></div><button onClick={onAdd} disabled={maxQuantity < 1} className="flex h-14 flex-1 items-center justify-center gap-2 bg-law-green px-5 text-sm font-bold text-white shadow-lg shadow-green-100 transition hover:bg-law-green-dark disabled:bg-gray-300"><Icon name="lucide:shopping-bag" width={18} />{maxQuantity < 1 ? "Indisponible" : "Ajouter au panier"}</button></section>; }
function ServiceHighlights() { const items = [["lucide:banknote", "Paiement à la livraison"]]; return <div className="mt-14 grid gap-5 border-y border-gray-100 py-7">{items.map(([icon, text]) => <div key={text} className="flex items-center gap-3 text-sm font-semibold text-gray-600"><Icon name={icon} width={20} className="text-law-green" />{text}</div>)}</div>; }
function ProductTabs({ product, activeTab, onTabChange }) { const tabs = [{ id: "description", label: "Description" }, { id: "reviews", label: "Avis" }, ...(product.sizes?.length ? [{ id: "sizes", label: "Guide des tailles" }] : [])]; return <section className="mt-10"><div className="flex gap-1 border-b border-gray-200">{tabs.map((tab) => <button key={tab.id} onClick={() => onTabChange(tab.id)} className={`border-b-2 px-4 py-3 text-sm font-bold ${activeTab === tab.id ? "border-law-red text-law-red" : "border-transparent text-gray-500"}`}>{tab.label}</button>)}</div><div className="py-7 text-sm leading-7 text-gray-600">{activeTab === "description" && <p>{product.desc}</p>}{activeTab === "reviews" && <p>Aucun avis client n’est encore disponible pour ce produit.</p>}{activeTab === "sizes" && <SizeTable />}</div></section>; }
function SizeTable() { return <div className="overflow-x-auto border border-gray-200"><table className="w-full min-w-[520px] text-left"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr>{["Taille", "Poitrine (cm)", "Longueur (cm)", "Épaules (cm)"].map((label) => <th key={label} className="px-4 py-3">{label}</th>)}</tr></thead><tbody>{sizeRows.map((row) => <tr key={row[0]} className="border-t border-gray-100">{row.map((cell, index) => <td key={cell} className={`px-4 py-3 ${index === 0 ? "font-bold text-law-red" : ""}`}>{cell}</td>)}</tr>)}</tbody></table></div>; }
function NotFound() { return <section className="px-4 py-32 text-center"><h1 className="font-display text-4xl">Produit introuvable</h1><Link to="/" className="mt-6 inline-block bg-law-red px-6 py-3 text-sm font-bold text-white">Retour à la boutique</Link></section>; }
