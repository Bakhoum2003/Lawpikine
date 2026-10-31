export const products = [
  [
    "VERT MENTHE",
    "T-shirt_vert.jpeg",
    "from-emerald-100 to-teal-100",
    "Le frais, le léger, le printanier. Parfait pour l’été et les journées ensoleillées. Couleur menthe douce qui apaise le regard.",
  ],
  [
    "VERT FONCÉ",
    "T-shirt_vertFoncé.jpeg",
    "from-emerald-900 to-green-800",
    "Profond, mystérieux, élégance naturelle. Une teinte intemporelle qui va avec tout et met en valeur.",
  ],
  [
    "GRIS CHINÉ",
    "T-shirt_gris.jpeg",
    "from-gray-200 to-gray-300",
    "Le classique indémodable. Subtil et versatile, il se porte tous les jours sans jamais faire faux bond.",
  ],
  [
    "BLEU ROYAL",
    "T-shirt_Bleu.jpeg",
    "from-blue-900 to-indigo-900",
    "Un bleu profond et lumineux, facile à associer et idéal pour affirmer son style.",
  ],
  [
    "NOIR INTENSE",
    "T-shirt_noir.jpeg",
    "from-gray-900 to-black",
    "L’essentiel absolu. Sans concession, sans compromis. Le noir qui fait loi.",
  ],
  [
    "ROUGE CARDINAL",
    "T-shirt_rouge.jpeg",
    "from-red-600 to-red-700",
    "Le feu, la passion, l’audace. Pour ceux qui osent se démarquer et affirmer leur style.",
  ],
  [
    "MARRON",
    "T-shirt_maron.jpeg",
    "from-amber-100 to-orange-200",
    "Une teinte marron chaleureuse et naturelle, facile à porter au quotidien.",
  ],
  [
    "ORANGE",
    "T-shirt_orange.jpeg",
    "from-orange-100 to-amber-200",
    "Une couleur orange lumineuse pour apporter une touche d’énergie à ta tenue.",
  ],
  [
    "JAUNE",
    "T-shirt_jaune.jpeg",
    "from-yellow-200 to-amber-300",
    "Une couleur jaune lumineuse et pleine d’énergie pour illuminer ta tenue.",
  ],
].map(([name, image, bgColor, desc], index) => ({
  id: index + 1,
  slug: `tshirt-${name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}`,
  name,
  img: `/${image}`,
  bgColor,
  desc,
  price: 10000,
  productType: "tshirts",
  sizes: ["S", "M", "L", "XL", "XXL"],
}));
