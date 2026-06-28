(function () {
    const menu = window.LKSushiMenu || [];
    const tabs = document.getElementById("menuCategoryTabs");
    const content = document.getElementById("menuCategoryContent");
    const scrollLeft = document.getElementById("menuScrollLeft");
    const scrollRight = document.getElementById("menuScrollRight");
    const categoryScroll = document.querySelector(".menu-category-scroll");
    const cartPanel = document.getElementById("menuCart");
    const cartToggle = document.getElementById("cartToggle");
    const cartClose = document.getElementById("cartClose");
    const cartBackdrop = document.getElementById("cartBackdrop");
    const cartItems = document.getElementById("cartItems");
    const cartCount = document.getElementById("cartCount");
    const cartButtonCount = document.getElementById("cartButtonCount");
    const cartTotal = document.getElementById("cartTotal");

    if (!tabs || !content || !menu.length) {
        return;
    }

    const escapeHtml = (value) => String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    const parsePrice = (price) => Number(String(price || "").replace(/[^0-9.]/g, "")) || 0;
    const itemLookup = new Map();
    const cart = new Map();

    const addToCart = (item) => {
        const key = `${item.name}|${item.price}`;
        const existing = cart.get(key);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.set(key, {
                name: item.name,
                price: item.price,
                priceValue: parsePrice(item.price),
                quantity: 1
            });
        }
        renderCart();
    };

    const changeQuantity = (key, amount) => {
        const item = cart.get(key);
        if (!item) {
            return;
        }
        item.quantity += amount;
        if (item.quantity <= 0) {
            cart.delete(key);
        }
        renderCart();
    };

    const renderCart = () => {
        if (!cartItems || !cartCount || !cartTotal) {
            return;
        }

        const entries = Array.from(cart.entries());
        const totalItems = entries.reduce((sum, entry) => sum + entry[1].quantity, 0);
        const totalPrice = entries.reduce((sum, entry) => sum + (entry[1].priceValue * entry[1].quantity), 0);

        cartCount.textContent = `${totalItems} ${totalItems === 1 ? "item" : "items"}`;
        if (cartButtonCount) {
            cartButtonCount.textContent = totalItems;
        }
        cartTotal.textContent = `$${totalPrice.toFixed(2)}`;

        if (!entries.length) {
            cartItems.innerHTML = '<p class="cart-empty mb-0">No items added yet.</p>';
            return;
        }

        cartItems.innerHTML = entries.map(([key, item]) => `
            <div class="cart-line">
                <div class="cart-line-info">
                    <strong>${escapeHtml(item.name)}</strong>
                    <span>${escapeHtml(item.price)} x ${item.quantity}</span>
                </div>
                <div class="cart-line-actions">
                    <button type="button" class="cart-qty-btn" data-cart-key="${escapeHtml(key)}" data-cart-action="decrease" aria-label="Decrease ${escapeHtml(item.name)}">-</button>
                    <span>${item.quantity}</span>
                    <button type="button" class="cart-qty-btn" data-cart-key="${escapeHtml(key)}" data-cart-action="increase" aria-label="Increase ${escapeHtml(item.name)}">+</button>
                </div>
            </div>
        `).join("");
    };

    const itemMarkup = (item, id) => `
        <div class="col-lg-6">
            <div class="menu-card">
                <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy">
                <div class="menu-card-body">
                    <div class="d-flex justify-content-between align-items-start gap-3 mb-2">
                        <h4 class="mb-0">${escapeHtml(item.name)}</h4>
                        <span class="menu-price">${escapeHtml(item.price)}</span>
                    </div>
                    <p class="mb-3">${escapeHtml(item.description)}</p>
                    <button type="button" class="btn btn-primary rounded-pill px-4 py-2 menu-add-btn" data-menu-id="${id}">Add</button>
                </div>
            </div>
        </div>
    `;

    tabs.innerHTML = menu.map((section, index) => `
        <li class="nav-item p-1" role="presentation">
            <button class="nav-link ${index === 0 ? "active" : ""}" id="${section.slug}-tab" data-bs-toggle="pill" data-bs-target="#${section.slug}" type="button" role="tab" aria-controls="${section.slug}" aria-selected="${index === 0 ? "true" : "false"}">
                ${escapeHtml(section.category)}
            </button>
        </li>
    `).join("");

    content.innerHTML = menu.map((section, sectionIndex) => `
        <div class="tab-pane fade ${sectionIndex === 0 ? "show active" : ""}" id="${section.slug}" role="tabpanel" aria-labelledby="${section.slug}-tab">
            <div class="row g-4">
                ${section.items.map((item, itemIndex) => {
                    const id = `${sectionIndex}-${itemIndex}`;
                    itemLookup.set(id, item);
                    return itemMarkup(item, id);
                }).join("")}
            </div>
        </div>
    `).join("");

    content.addEventListener("click", (event) => {
        const button = event.target.closest(".menu-add-btn");
        if (!button) {
            return;
        }
        const item = itemLookup.get(button.dataset.menuId);
        if (item) {
            addToCart(item);
        }
    });

    if (cartItems) {
        cartItems.addEventListener("click", (event) => {
            const button = event.target.closest("[data-cart-action]");
            if (!button) {
                return;
            }
            changeQuantity(button.dataset.cartKey, button.dataset.cartAction === "increase" ? 1 : -1);
        });
    }

    if (categoryScroll && scrollLeft && scrollRight) {
        scrollLeft.addEventListener("click", () => {
            categoryScroll.scrollBy({ left: -240, behavior: "smooth" });
        });
        scrollRight.addEventListener("click", () => {
            categoryScroll.scrollBy({ left: 240, behavior: "smooth" });
        });
    }

    const setCartOpen = (isOpen) => {
        if (!cartPanel || !cartBackdrop) {
            return;
        }
        cartPanel.classList.toggle("show", isOpen);
        cartPanel.setAttribute("aria-hidden", isOpen ? "false" : "true");
        cartBackdrop.hidden = !isOpen;
        cartBackdrop.classList.toggle("show", isOpen);
    };

    if (cartToggle) {
        cartToggle.addEventListener("click", () => setCartOpen(true));
    }

    if (cartClose) {
        cartClose.addEventListener("click", () => setCartOpen(false));
    }

    if (cartBackdrop) {
        cartBackdrop.addEventListener("click", () => setCartOpen(false));
    }

    renderCart();
}());
