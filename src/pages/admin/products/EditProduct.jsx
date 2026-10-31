import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Icon from "../../../components/common/Icon";
import ProductForm from "../../../components/admin/ProductForm";
import { getAdminProduct, updateAdminProduct } from "../../../services/adminProductService";
import { productToFormImage, productToFormValues } from "../../../services/productValidation";
import { setFlash } from "../../../services/flashMessage";

const LIST_PATH = "/admin/produits";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  // undefined = chargement, null = introuvable, objet = produit
  const [product, setProduct] = useState(undefined);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setProduct(undefined);
    setFailed(false);
    getAdminProduct(id)
      .then((found) => !cancelled && setProduct(found))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (values) => {
    const updated = await updateAdminProduct(product.id, values);
    setFlash(`« ${updated.name} » a été modifié.`);
    navigate(LIST_PATH);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">Modifier un produit</h1>
          <p className="mt-1 text-sm text-gray-500">Modifiez les informations de votre produit</p>
        </div>
        <BackLink />
      </div>

      {product === undefined && !failed && (
        <div className="mt-6 animate-pulse rounded-2xl border border-gray-100 bg-white p-6 shadow-sm" aria-busy="true" aria-label="Chargement du produit">
          <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
            <div className="aspect-square rounded-xl bg-gray-100" />
            <div className="space-y-4">{[0, 1, 2, 3].map((item) => <div key={item} className="h-12 rounded-lg bg-gray-100" />)}</div>
          </div>
        </div>
      )}

      {(product === null || failed) && (
        <div role="alert" className="mt-6 rounded-2xl border border-gray-100 bg-white px-4 py-14 text-center shadow-sm">
          <Icon name="lucide:package-x" width={36} className="mx-auto text-gray-300" />
          <p className="mt-3 font-semibold text-gray-900">{failed ? "Impossible de charger ce produit." : "Ce produit est introuvable."}</p>
          <p className="mt-1 text-sm text-gray-500">{failed ? "Réessayez ou revenez à la liste." : "Il a peut-être été supprimé, ou l'adresse est incorrecte."}</p>
          <Link to={LIST_PATH} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-law-green px-5 py-2.5 text-sm font-bold text-white transition hover:bg-law-green-dark focus:outline-none focus:ring-2 focus:ring-law-green focus:ring-offset-2">
            <Icon name="lucide:arrow-left" width={16} />
            Retour aux produits
          </Link>
        </div>
      )}

      {product && (
        <ProductForm
          key={product.id}
          initialValues={productToFormValues(product)}
          initialImage={productToFormImage(product)}
          submitLabel="Enregistrer les modifications"
          loadingLabel="Enregistrement..."
          cancelTo={LIST_PATH}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

function BackLink() {
  return (
    <Link to={LIST_PATH} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-law-green">
      <Icon name="lucide:arrow-left" width={16} />
      Retour aux produits
    </Link>
  );
}
