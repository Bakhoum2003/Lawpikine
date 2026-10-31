import { Link, useNavigate } from "react-router-dom";
import Icon from "../../../components/common/Icon";
import ProductForm from "../../../components/admin/ProductForm";
import { createAdminProduct } from "../../../services/adminProductService";
import { setFlash } from "../../../services/flashMessage";

const LIST_PATH = "/admin/produits";

export default function AddProduct() {
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    const product = await createAdminProduct(values);
    setFlash(`« ${product.name} » a été ajouté à votre boutique.`);
    navigate(LIST_PATH);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">Ajouter un produit</h1>
          <p className="mt-1 text-sm text-gray-500">Ajoutez un nouveau produit à votre boutique</p>
        </div>
        <Link to={LIST_PATH} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-law-green">
          <Icon name="lucide:arrow-left" width={16} />
          Retour aux produits
        </Link>
      </div>
      <ProductForm cancelTo={LIST_PATH} onSubmit={handleSubmit} />
    </div>
  );
}
