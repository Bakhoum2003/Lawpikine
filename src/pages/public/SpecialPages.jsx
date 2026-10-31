import ProductGrid from "../../components/products/ProductGrid";
export function FavoritesPage({ products, favorites, onFavorite, onOpenProduct }) {
  const list = products.filter((p) => favorites.includes(p.id));
  return (
    <section className="min-h-screen bg-white px-4 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12">
          <p className="text-[11px] font-bold tracking-[.3em] uppercase text-law-red">
            Ma sélection
          </p>
          <h1 className="font-display text-5xl sm:text-6xl">Mes favoris</h1>
          <p className="mt-3 text-gray-500">
            Retrouvez ici les pièces que vous avez mises de côté.
          </p>
        </div>
        {list.length ? (
          <ProductGrid
            products={list}
            isFavorite={(id) => favorites.includes(id)}
            onFavorite={onFavorite}
            onOpenProduct={onOpenProduct}
          />
        ) : (
          <div className="py-16 text-center">
            <h2 className="font-display text-3xl">
              Aucun favori pour le moment
            </h2>
            <p className="mt-3 text-gray-500">
              Ajoutez un T-shirt en cliquant sur le cœur présent sur chaque
              produit.
            </p>
            <a
              href="/#collection"
              className="mt-7 inline-flex bg-law-red px-6 py-3 text-xs font-bold tracking-widest uppercase text-white"
            >
              Découvrir la collection
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
export function AccountPage() {
  return (
    <section className="min-h-screen bg-white px-4 py-24">
      <div className="mx-auto max-w-lg border border-gray-100 bg-white p-8 text-center shadow-sm">
        <h1 className="font-display text-4xl">Espace compte</h1>
        <p className="mt-4 text-sm text-gray-500">
          La connexion sera bientôt disponible. Aucun compte ni mot de passe
          n’est demandé pour le moment.
        </p>
        <a
          href="#collection"
          className="mt-7 inline-flex bg-law-red px-6 py-3 text-xs font-bold tracking-widest uppercase text-white"
        >
          Voir la collection
        </a>
      </div>
    </section>
  );
}
export function AdminPage() {
  return (
    <section className="min-h-screen bg-gray-50 px-4 py-24">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-bold tracking-widest text-law-red">
          ADMINISTRATION — PRÉPARATION FRONTEND
        </p>
        <h1 className="mt-2 font-display text-5xl">Gestion des produits</h1>
        <p className="mt-4 max-w-2xl text-gray-600">
          Cette interface prépare les futurs écrans de gestion. Aucun accès
          n’est sécurisé et les opérations ne sont ni persistantes ni reliées à
          un backend.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            "Connexion administrateur",
            "Ajouter un produit",
            "Modifier ou supprimer",
          ].map((title) => (
            <div key={title} className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="font-bold">{title}</h2>
              <p className="mt-2 text-sm text-gray-500">
                À connecter à une API sécurisée ultérieurement.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
