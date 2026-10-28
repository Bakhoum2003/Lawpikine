
    const WHATSAPP_NUMBER = '221776771009';  

    // ============ DATA PRODUITS ============
    const products = [
      {
        id: 1,
        name: "VERT MENTHE",
        price: 10000,
        productType: "tshirts",
        category: "pastel",
        desc: "Le frais, le léger, le printanier. Parfait pour l'été et les journées ensoleillées. Couleur menthe douce qui apaise le regard.",
        img: "images/T-shirt_vert.jpeg",
        bgColor: "from-emerald-100 to-teal-100",
        sizes: ["S", "M", "L", "XL", "XXL"],
        badge: null
      },
      {
        id: 2,
        name: "VERT FONCÉ",
        price: 10000,
        productType: "tshirts",
        category: "dark",
        desc: "Profond, mystérieux, élégance naturelle. Une teinte intemporelle qui va avec tout et met en valeur.",
        img: "images/T-shirt_vertFoncé.jpeg",
        bgColor: "from-emerald-900 to-green-800",
        sizes: ["S", "M", "L", "XL", "XXL"],
        badge: null
      },
      {
        id: 3,
        name: "GRIS CHINÉ",
        price: 10000,
        productType: "tshirts",
        category: "pastel",
        desc: "Le classique indémodable. Subtil et versatile, il se porte tous les jours sans jamais faire faux bond.",
        img: "images/T-shirt_gris.jpeg",
        bgColor: "from-gray-200 to-gray-300",
        sizes: ["S", "M", "L", "XL", "XXL"],
        badge: "Bestseller"
      },
      {
        id: 4,
        name: "BLEU ROYAL",
        price: 10000,
        productType: "tshirts",
        category: "dark",
        desc: "Un bleu profond et lumineux, facile à associer et idéal pour affirmer son style.",
        img: "images/T-shirt_Bleu.jpeg",
        bgColor: "from-blue-900 to-indigo-900",
        sizes: ["S", "M", "L", "XL", "XXL"],
        badge: "Nouveau"
      },
      {
        id: 5,
        name: "NOIR INTENSE",
        price: 10000,
        productType: "tshirts",
        category: "dark",
        desc: "L'essentiel absolu. Sans concession, sans compromis. Le noir qui fait loi.",
        img: "images/T-shirt_noir.jpeg",
        bgColor: "from-gray-900 to-black",
        sizes: ["S", "M", "L", "XL", "XXL"],
        badge: "Iconique"
      },
      {
        id: 6,
        name: "ROUGE CARDINAL",
        price: 10000,
        productType: "tshirts",
        category: "vibrant",
        desc: "Le feu, la passion, l'audace. Pour ceux qui osent se démarquer et affirmer leur style.",
        img: "images/T-shirt_rouge.jpeg",
        bgColor: "from-red-600 to-red-700",
        sizes: ["S", "M", "L", "XL", "XXL"],
        badge: "Limité"
      },
      {
        id: 7,
        name: "MARRON",
        price: 10000,
        productType: "tshirts",
        category: "dark",
        desc: "Une teinte marron chaleureuse et naturelle, facile à porter au quotidien.",
        img: "images/T-shirt_maron.jpeg",
        bgColor: "from-amber-100 to-orange-200",
        sizes: ["S", "M", "L", "XL", "XXL"],
        badge: null
      },
      {
        id: 8,
        name: "ORANGE",
        price: 10000,
        productType: "tshirts",
        category: "vibrant",
        desc: "Une couleur orange lumineuse pour apporter une touche d'énergie à ta tenue.",
        img: "images/T-shirt_orange.jpeg",
        bgColor: "from-orange-100 to-amber-200",
        sizes: ["S", "M", "L", "XL", "XXL"],
        badge: null
      },
      {
        id: 9,
        name: "JAUNE",
        price: 10000,
        productType: "tshirts",
        category: "vibrant",
        desc: "Une couleur jaune lumineuse et pleine d'énergie pour illuminer ta tenue.",
        img: "images/T-shirt_jaune.jpeg",
        bgColor: "from-yellow-200 to-amber-300",
        sizes: ["S", "M", "L", "XL", "XXL"],
        badge: "Nouveau"
      }
    ];

    const CART_STORAGE_KEY = 'lawpikingCart';
    const FAVORITES_STORAGE_KEY = 'lawpikingFavorites';

    function loadCart() {
      try {
        const storedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (storedCart === null) return [];

        const parsedCart = JSON.parse(storedCart);
        if (!Array.isArray(parsedCart)) {
          throw new TypeError('Le panier enregistré doit être une liste.');
        }

        const restoredCart = [];
        parsedCart.forEach(entry => {
          if (!entry || typeof entry !== 'object') {
            console.warn('Un article invalide du panier enregistré a été ignoré.', entry);
            return;
          }

          const productId = Number(entry.id);
          const product = products.find(item => item.id === productId);
          const size = entry.size ?? entry.taille;
          const quantity = Number(entry.qty ?? entry.quantite);

          if (!product || !product.sizes.includes(size) || !Number.isInteger(quantity) || quantity < 1) {
            console.warn('Un article invalide du panier enregistré a été ignoré.', entry);
            return;
          }

          const existing = restoredCart.find(item => item.id === productId && item.size === size);
          if (existing) {
            existing.qty += quantity;
          } else {
            restoredCart.push({ ...product, size, qty: quantity });
          }
        });

        return restoredCart;
      } catch (error) {
        console.error('Impossible de charger le panier depuis localStorage.', error);
        showToast('Impossible de lire le panier enregistré sur cet appareil.');
        return [];
      }
    }

    let cart = loadCart();
    let favorites = loadFavorites();
    let currentCategory = 'all';
    let currentSearch = '';

    function loadFavorites() {
      try {
        const saved = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) || '[]');
        if (!Array.isArray(saved)) throw new TypeError('Les favoris enregistrés doivent être une liste.');
        return [...new Set(saved.map(Number))].filter(id => products.some(product => product.id === id));
      } catch (error) {
        console.error('Impossible de charger les favoris depuis localStorage.', error);
        return [];
      }
    }

    function saveFavorites() {
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
        updateFavoritesUI();
        return true;
      } catch (error) {
        console.error('Impossible d’enregistrer les favoris dans localStorage.', error);
        showToast('Impossible d’enregistrer les favoris sur cet appareil.');
        return false;
      }
    }

    function formatPrice(amount) {
      return `${new Intl.NumberFormat('fr-FR').format(amount)} F`;
    }

    function normalizeSearchText(value) {
      return String(value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('fr');
    }

    function isFavorite(id) {
      return favorites.includes(id);
    }

    function toggleFavorite(id) {
      favorites = isFavorite(id) ? favorites.filter(favoriteId => favoriteId !== id) : [...favorites, id];
      if (saveFavorites()) showToast(isFavorite(id) ? 'Ajouté aux favoris !' : 'Retiré des favoris.');
    }

    function productCard(product, index) {
      const favorite = isFavorite(product.id);
      return `
        <article class="product-card group cursor-pointer slide-in" style="animation-delay: ${index * 0.06}s" onclick="openModal(${product.id})">
          <div class="relative mb-3 aspect-square overflow-hidden rounded-xl bg-gradient-to-br ${product.bgColor}">
            <img src="${product.img}" alt="${product.name}" class="product-img h-full w-full object-contain p-5 sm:p-6 transition-transform duration-500 drop-shadow-xl">
            <button type="button" onclick="event.stopPropagation(); toggleFavorite(${product.id})" aria-label="${favorite ? 'Retirer' : 'Ajouter'} ${product.name} ${favorite ? 'des favoris' : 'aux favoris'}" aria-pressed="${favorite}" class="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm transition hover:scale-110 hover:text-law-red focus:outline-none focus:ring-2 focus:ring-law-red ${favorite ? 'text-law-red' : ''}">
              <iconify-icon icon="${favorite ? 'lucide:heart' : 'lucide:heart'}" width="16" ${favorite ? 'style="fill: currentColor"' : ''} aria-hidden="true"></iconify-icon>
            </button>
            <div class="product-overlay absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300">
              <span class="bg-white px-4 py-2 text-[10px] font-bold tracking-widest uppercase text-gray-900">Voir détails</span>
            </div>
          </div>
          <div class="px-1">
            <div class="mb-1 flex items-start justify-between gap-2">
              <h3 class="font-display text-xl tracking-wide uppercase text-gray-900 transition-colors group-hover:text-law-red">${product.name}</h3>
              <span class="shrink-0 font-display text-xl text-law-red">${formatPrice(product.price)}</span>
            </div>
            <p class="mb-2 line-clamp-2 text-xs text-gray-400">${product.desc}</p>
            <div class="flex gap-1.5">${product.sizes.map(size => `<span class="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-400">${size}</span>`).join('')}</div>
          </div>
        </article>`;
    }

    const categoryLabels = {
      all: 'TOUS LES PRODUITS',
      tshirts: 'LES T-SHIRTS',
      pulls: 'LES PULLS',
      bonnets: 'LES BONNETS',
    };

    function productsForCurrentCategory() {
      return currentCategory === 'all'
        ? products
        : products.filter(product => product.productType === currentCategory);
    }

    // ============ RENDU PRODUITS ============
    function renderProducts() {
      const grid = document.getElementById('products-grid');
      const query = normalizeSearchText(currentSearch.trim());
      const filtered = productsForCurrentCategory().filter(product => {
        const searchableText = normalizeSearchText(
          ['t-shirt', ...Object.values(product).flat(Infinity)].join(' ')
        );
        return !query || searchableText.includes(query);
      });
      grid.innerHTML = filtered.map(productCard).join('');
      document.getElementById('no-products-found').classList.toggle('hidden', filtered.length > 0);
    }

    function selectCategory(category) {
      currentCategory = category;
      currentSearch = '';
      document.getElementById('product-search').value = '';
      document.getElementById('collection-title').textContent = categoryLabels[category] || categoryLabels.all;
      document.querySelectorAll('.category-btn').forEach(btn => {
        if (btn.dataset.category === category) {
          btn.classList.add('bg-gray-900', 'text-white');
          btn.classList.remove('bg-gray-100', 'text-gray-600');
        } else {
          btn.classList.remove('bg-gray-900', 'text-white');
          btn.classList.add('bg-gray-100', 'text-gray-600');
        }
      });
      const hasAvailableProducts = productsForCurrentCategory().length > 0;
      document.getElementById('products-grid').classList.toggle('hidden', !hasAvailableProducts);
      document.getElementById('no-products-found').classList.toggle('hidden', true);
      document.getElementById('category-coming-soon')?.remove();
      if (!hasAvailableProducts) {
        document.getElementById('products-grid').insertAdjacentHTML('afterend', `<div id="category-coming-soon" class="py-16 text-center"><div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-law-red"><iconify-icon icon="lucide:clock-3" width="28" aria-hidden="true"></iconify-icon></div><h3 class="font-display text-4xl tracking-wide text-gray-900">Bientôt disponible</h3><p class="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">Notre collection de ${category === 'pulls' ? 'pulls' : 'bonnets'} arrive bientôt. Restez connectés !</p></div>`);
      } else {
        renderProducts();
      }
    }

    function searchProducts(value) {
      currentSearch = value;
      renderProducts();
    }

    function renderFavorites() {
      const favoriteProducts = products.filter(product => isFavorite(product.id));
      document.getElementById('favorites-grid').innerHTML = favoriteProducts.map(productCard).join('');
      document.getElementById('favorites-empty').classList.toggle('hidden', favoriteProducts.length > 0);
    }

    function updateFavoritesUI() {
      const count = document.getElementById('favorites-count');
      count.textContent = favorites.length;
      count.classList.toggle('hidden', favorites.length === 0);
      renderProducts();
      renderFavorites();
    }

    function updateViewFromHash() {
      const view = window.location.hash.slice(1);
      const main = document.getElementById('site-content');
      const favoritesPage = document.getElementById('favorites-page');
      const accountPage = document.getElementById('account-page');
      const specialView = view === 'favorites' || view === 'account';
      [...main.children].forEach(section => {
        if (section !== favoritesPage && section !== accountPage) section.classList.toggle('hidden', specialView);
      });
      favoritesPage.classList.toggle('hidden', view !== 'favorites');
      accountPage.classList.toggle('hidden', view !== 'account');
      if (view === 'favorites') renderFavorites();
      if (specialView) window.scrollTo(0, 0);
    }

    // ============ MODAL ============
    function openModal(id) {
      const p = products.find(x => x.id === id);
      document.getElementById('modal-content').innerHTML = `
        <div class="bg-gradient-to-br ${p.bgColor} p-8 sm:p-12 flex items-center justify-center min-h-[400px]">
          <img src="${p.img}" alt="${p.name}" class="max-h-96 object-contain drop-shadow-2xl">
        </div>
        <div class="p-8 sm:p-10 flex flex-col justify-center">
          <h2 class="font-display text-4xl sm:text-5xl tracking-wide text-gray-900 mb-2">${p.name}</h2>
          <p class="font-display text-3xl text-law-red mb-6">${formatPrice(p.price)}</p>
          <p class="text-gray-600 leading-relaxed mb-8">${p.desc}</p>
          
          <div class="mb-8">
            <p class="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-3">Choisir la taille</p>
            <div class="flex flex-wrap gap-2" id="modal-sizes">
              ${p.sizes.map((s, idx) => `
                <button type="button" onclick="selectSize(this)" class="size-btn text-sm font-bold px-5 py-2.5 border-2 border-gray-200 hover:border-law-red transition-all ${idx === 1 ? 'active' : ''}" data-size="${s}">${s}</button>
              `).join('')}
            </div>
          </div>
          
          <button onclick="addToCartFromModal(${p.id})" class="w-full bg-law-red text-white font-bold text-sm tracking-widest uppercase py-4 hover:bg-law-red-dark transition-colors shadow-lg shadow-red-200 flex items-center justify-center gap-3">
            <iconify-icon icon="lucide:shopping-bag" width="18"></iconify-icon>
            Ajouter au panier
          </button>
          
          <p class="text-center text-[11px] text-gray-400 mt-4">Livraison gratuite • Retour sous 30 jours</p>
        </div>
      `;
      document.getElementById('product-modal').classList.remove('hidden');
      document.getElementById('product-modal').classList.add('flex');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      document.getElementById('product-modal').classList.add('hidden');
      document.getElementById('product-modal').classList.remove('flex');
      document.body.style.overflow = '';
    }

    function selectSize(btn) {
      btn.closest('#modal-sizes').querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }

    // ============ PANIER ============
    function addToCartFromModal(id) {
      const p = products.find(x => x.id === id);
      const sizeEl = document.querySelector('#modal-sizes .size-btn.active');
      const size = sizeEl ? sizeEl.dataset.size : 'M';
      addToCart(p, size);
      closeModal();
    }

    function addToCart(product, size) {
      const canonicalProduct = products.find(item => item.id === product.id);
      if (!canonicalProduct || !canonicalProduct.sizes.includes(size)) {
        console.error('Produit ou taille invalide : impossible de l’ajouter au panier.', { product, size });
        showToast('Cet article ou cette taille est indisponible.');
        return;
      }

      const updatedCart = cart.map(item => ({ ...item }));
      const existing = updatedCart.find(item => item.id === canonicalProduct.id && item.size === size);
      if (existing) existing.qty++;
      else updatedCart.push({ ...canonicalProduct, size, qty: 1 });

      if (saveCart(updatedCart)) {
        showToast(`${canonicalProduct.name} (${size}) ajouté !`);
      }
    }

    function addBundleToCart() {
      products.forEach(p => addToCart(p, 'M'));
      showToast('Pack Collection Complète ajouté !');
    }

    function removeFromCart(productId, size) {
      const updatedCart = cart.filter(item => item.id !== productId || item.size !== size);
      saveCart(updatedCart);
    }

    function changeQty(productId, size, delta) {
      const updatedCart = cart.map(item => ({ ...item }));
      const item = updatedCart.find(item => item.id === productId && item.size === size);
      if (!item) return;

      item.qty += delta;
      if (item.qty <= 0) {
        saveCart(updatedCart.filter(cartItem => cartItem !== item));
        return;
      }
      saveCart(updatedCart);
    }

    function saveCart(updatedCart) {
      const storedCart = updatedCart.map(item => ({
        id: item.id,
        nom: item.name,
        prix: item.price,
        image: item.img,
        taille: item.size,
        quantite: item.qty,
      }));

      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(storedCart));
      } catch (error) {
        console.error('Impossible d’enregistrer le panier dans localStorage.', error);
        showToast('Impossible d’enregistrer le panier sur cet appareil.');
        return false;
      }

      cart = updatedCart;
      updateCartUI();
      return true;
    }

    function updateCartUI() {
      const countEl = document.getElementById('cart-count');
      const itemsEl = document.getElementById('cart-items');
      const footerEl = document.getElementById('cart-footer');
      const totalEl = document.getElementById('cart-total');
      const subtotalEl = document.getElementById('cart-subtotal');

      const totalItems = cart.reduce((s, i) => s + i.qty, 0);
      const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

      countEl.textContent = totalItems;
      itemsEl.innerHTML = totalItems > 0 ? cart.map(item => `
        <div class="flex gap-4 mb-4 pb-4 border-b border-gray-100 last:border-0">
          <div class="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0">
            <img src="${item.img}" alt="${item.name}" class="w-full h-full object-contain p-2">
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-bold text-sm truncate">${item.name}</h4>
                <p class="text-[10px] text-gray-400 uppercase tracking-wider">Taille: ${item.size}</p>
              </div>
              <button onclick="removeFromCart(${item.id}, '${item.size}')" class="text-gray-300 hover:text-red-500 transition-colors">
                <iconify-icon icon="lucide:trash-2" width="16"></iconify-icon>
              </button>
            </div>
            <div class="flex justify-between items-end mt-2">
              <div class="flex items-center border border-gray-200 rounded-lg">
                <button onclick="changeQty(${item.id}, '${item.size}', -1)" class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-law-red">−</button>
                <span class="w-8 text-center text-sm font-medium">${item.qty}</span>
                <button onclick="changeQty(${item.id}, '${item.size}', 1)" class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-law-red">+</button>
              </div>
              <span class="font-bold text-law-red">${formatPrice(item.price * item.qty)}</span>
            </div>
          </div>
        </div>
      `).join('') : `
        <div id="cart-empty" class="h-full flex flex-col items-center justify-center text-center">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <iconify-icon icon="lucide:shopping-bag" width="32" class="text-gray-300"></iconify-icon>
          </div>
          <p class="text-gray-400 font-medium">Ton panier est vide</p>
          <p class="text-gray-300 text-sm mt-1">Ajoute des pièces pour commencer</p>
        </div>
      `;

      if (totalItems > 0) {
        countEl.classList.remove('hidden');
        footerEl.classList.remove('hidden');
        totalEl.textContent = formatPrice(totalPrice);
        subtotalEl.textContent = formatPrice(totalPrice);
      } else {
        countEl.classList.add('hidden');
        footerEl.classList.add('hidden');
      }
    }

    function toggleCart() {
      const sidebar = document.getElementById('cart-sidebar');
      const overlay = document.getElementById('cart-overlay');
      const isOpen = sidebar.classList.contains('cart-open');
      if (isOpen) {
        sidebar.classList.remove('cart-open');
        overlay.classList.add('hidden');
      } else {
        sidebar.classList.add('cart-open');
        overlay.classList.remove('hidden');
      }
    }

    let checkoutOrder = null;

    function checkout() {
      if (cart.length === 0) {
        showCheckoutError('Ton panier est vide. Ajoute au moins un article avant de commander.');
        return;
      }

      if (document.getElementById('cart-sidebar').classList.contains('cart-open')) {
        toggleCart();
      }

      const form = document.getElementById('checkout-form');
      form.reset();
      checkoutOrder = null;
      document.getElementById('checkout-error').classList.add('hidden');
      document.getElementById('checkout-form').classList.remove('hidden');
      document.getElementById('checkout-review-step').classList.add('hidden');
      document.getElementById('checkout-success-step').classList.add('hidden');
      document.getElementById('checkout-modal').classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }

    function closeCheckout() {
      document.getElementById('checkout-modal').classList.add('hidden');
      document.body.style.overflow = '';
      checkoutOrder = null;
    }

    function backToCheckoutForm() {
      document.getElementById('checkout-review-step').classList.add('hidden');
      document.getElementById('checkout-form').classList.remove('hidden');
    }

    function showCheckoutError(message) {
      const error = document.getElementById('checkout-error');
      error.textContent = message;
      error.classList.remove('hidden');
    }

    function appendSummaryLine(container, label, value) {
      const line = document.createElement('p');
      line.className = 'text-sm text-gray-600';
      line.textContent = `${label} : ${value}`;
      container.appendChild(line);
    }

    function prepareOrder(event) {
      event.preventDefault();
      const form = document.getElementById('checkout-form');
      if (cart.length === 0) {
        showCheckoutError('Ton panier est vide. Ajoute au moins un article avant de commander.');
        return;
      }

      const formData = new FormData(form);
      const customer = {
        name: formData.get('customer-name').trim(),
        phone: formData.get('customer-phone').trim(),
        city: formData.get('customer-city').trim(),
        address: formData.get('customer-address').trim(),
      };
      const missingField = Object.keys(customer).find(key => !customer[key]);
      if (missingField) {
        showCheckoutError('Merci de remplir tous les champs obligatoires.');
        form.querySelector(`[name="customer-${missingField}"]`).focus();
        return;
      }
      if (!form.reportValidity()) return;

      const items = cart.map(item => ({ ...item }));
      checkoutOrder = {
        customer,
        items,
        total: items.reduce((sum, item) => sum + item.price * item.qty, 0),
      };

      const summaryItems = document.getElementById('order-summary-items');
      summaryItems.replaceChildren();
      items.forEach(item => {
        const product = document.createElement('div');
        product.className = 'rounded-xl border border-gray-100 p-4';
        const name = document.createElement('h4');
        name.className = 'font-bold text-gray-900';
        name.textContent = item.name;
        product.appendChild(name);
        appendSummaryLine(product, 'Taille', item.size);
        if (item.color) appendSummaryLine(product, 'Couleur', item.color);
        appendSummaryLine(product, 'Quantité', item.qty);
        appendSummaryLine(product, 'Prix unitaire', formatPrice(item.price));
        appendSummaryLine(product, 'Sous-total', formatPrice(item.price * item.qty));
        summaryItems.appendChild(product);
      });

      const customerSummary = document.getElementById('order-summary-customer');
      customerSummary.replaceChildren();
      appendSummaryLine(customerSummary, 'Nom', customer.name);
      appendSummaryLine(customerSummary, 'Téléphone', customer.phone);
      appendSummaryLine(customerSummary, 'Ville', customer.city);
      appendSummaryLine(customerSummary, 'Adresse', customer.address);
      document.getElementById('order-summary-total').textContent = formatPrice(checkoutOrder.total);

      document.getElementById('checkout-error').classList.add('hidden');
      document.getElementById('checkout-form').classList.add('hidden');
      document.getElementById('checkout-review-step').classList.remove('hidden');
    }

    function buildWhatsAppMessage(order) {
      const lines = ['🛍️ *NOUVELLE COMMANDE — LAWPIKING*', ''];
      order.items.forEach(item => {
        lines.push(`👕 *Produit : ${item.name}*`);
        lines.push(`Taille : ${item.size}`);
        if (item.color) lines.push(`Couleur : ${item.color}`);
        lines.push(`Quantité : ${item.qty}`);
        lines.push(`Prix unitaire : ${formatPrice(item.price)}`);
        lines.push(`Sous-total : ${formatPrice(item.price * item.qty)}`);
        lines.push('');
      });
      lines.push(`💰 *TOTAL : ${formatPrice(order.total)}*`, '');
      lines.push('👤 *CLIENT*');
      lines.push(`Nom : ${order.customer.name}`);
      lines.push(`Téléphone : ${order.customer.phone}`);
      lines.push(`Ville : ${order.customer.city}`);
      lines.push(`Adresse : ${order.customer.address}`);
      lines.push('', '🚚 Livraison : À domicile', '', '💵 Paiement : À la livraison');
      return lines.join('\n');
    }

    function confirmOrder() {
      if (!checkoutOrder || cart.length === 0) {
        showCheckoutError('Impossible de confirmer : ton panier est vide ou les informations sont manquantes.');
        return;
      }
      if (!/^\d{8,15}$/.test(WHATSAPP_NUMBER)) {
        showCheckoutError('Le numéro WhatsApp de Lawpiking doit être configuré au format international, sans + ni espaces.');
        return;
      }

      const message = buildWhatsAppMessage(checkoutOrder);
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      const whatsappWindow = window.open(whatsappUrl, '_blank');
      if (!whatsappWindow) {
        showCheckoutError('WhatsApp n’a pas pu s’ouvrir. Autorise les fenêtres contextuelles puis réessaie. Ton panier est conservé.');
        return;
      }
      whatsappWindow.opener = null;

      if (!saveCart([])) {
        showCheckoutError('La commande est prête, mais le panier n’a pas pu être vidé sur cet appareil.');
        return;
      }
      checkoutOrder = null;
      document.getElementById('checkout-review-step').classList.add('hidden');
      document.getElementById('checkout-success-step').classList.remove('hidden');
    }

    // ============ MOBILE MENU ============
    function toggleMobileMenu() {
      document.getElementById('mobile-menu').classList.toggle('hidden');
    }

    // ============ TOAST ============
    function showToast(msg) {
      const toast = document.getElementById('toast');
      document.getElementById('toast-msg').textContent = msg;
      toast.classList.remove('hidden');
      setTimeout(() => toast.classList.add('hidden'), 2800);
    }

    // ============ INIT ============
    renderProducts();
    updateCartUI();
    updateFavoritesUI();
    updateViewFromHash();
    window.addEventListener('hashchange', updateViewFromHash);
    window.addEventListener('storage', event => {
      if (event.key === FAVORITES_STORAGE_KEY) {
        favorites = loadFavorites();
        updateFavoritesUI();
      }
    });

    const floatingWhatsAppLink = document.getElementById('whatsapp-float');
    if (floatingWhatsAppLink) {
      const message = "Bonjour, je vous contacte depuis le site LAWPIKING. J'aimerais avoir plus d'informations sur vos produits.";
      floatingWhatsAppLink.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    }

    // Close modal on escape key
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
