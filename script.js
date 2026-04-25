/* =====================================================
   Thanusha's Kitchen — script.js
   This file contains ALL the JavaScript for the website.
   Linked at the bottom of index.html as:
   <script src="script.js"></script>
===================================================== */

/* ===== PRODUCT DATA =====
   Products come from products.js (loaded before this file in index.html).
   To add, edit or remove a product — only edit products.js.
   No changes to this file are needed for product updates.
========================== */
let products = PRODUCTS; /* PRODUCTS is defined in products.js */

/* ===== CART STATE =====
   cart stores items as an object keyed by product id.
   Example: { 1: { ...productData, qty: 2 }, 3: { ...productData, qty: 1 } }
   Cart is persisted in sessionStorage so it survives
   page navigation (e.g. going to checkout and coming back).
========================== */
let cart = {};

/* ─── Save cart to sessionStorage ─── */
function saveCart() {
  sessionStorage.setItem('tk_cart', JSON.stringify(Object.values(cart)));
}

/* ─── Restore cart from sessionStorage on page load ─── */
function restoreCart() {
  try {
    const saved = sessionStorage.getItem('tk_cart');
    if (!saved) return;
    const items = JSON.parse(saved);
    items.forEach(item => {
      cart[item.id] = item; /* re-build the cart object keyed by id */
    });
  } catch (e) {
    /* If storage is corrupt just start with empty cart */
    cart = {};
  }
}

/* =====================================================
   BUILD A SINGLE PRODUCT CARD (shared helper)
   Returns the HTML string for one product card.
===================================================== */
function buildCard(p) {
  return `
    <div class="product-card reveal">
      <div class="product-img">
        <img src="${p.img}" alt="${p.name}" loading="lazy"
          onerror="this.src='images/placeholder.jpg'; this.onerror=null;" />
        <span class="product-badge">${p.badge}</span>
      </div>
      <div class="product-body">
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <div style="display:flex;gap:3px;margin-bottom:10px;">
          ${Array.from({length: 5}, (_, i) =>
            `<i class="fa-solid fa-pepper-hot" style="font-size:0.75rem;color:${i < p.spice ? 'var(--red)' : 'var(--border)'};"></i>`
          ).join('')}
          <span style="font-size:0.75rem;color:var(--muted);margin-left:5px;">${p.weight}</span>
        </div>
        <div class="product-footer">
          <div class="product-price">₹${p.price}<span>/ ${p.weight}</span></div>
          <button class="add-to-cart-btn" id="btn-${p.id}" onclick="addToCart(${p.id})">
            <i class="fa-solid fa-plus"></i> Add
          </button>
        </div>
      </div>
    </div>`;
}

/* =====================================================
   RENDER PRODUCTS
   Splits products by category and fills each grid.
   "pickles"  → #grid-pickles
   "podis"    → #grid-podis
===================================================== */
function renderProducts() {
  const pickles = products.filter(p => p.category === 'pickles');
  const podis   = products.filter(p => p.category === 'podis');

  document.getElementById('grid-pickles').innerHTML = pickles.map(buildCard).join('');
  document.getElementById('grid-podis').innerHTML   = podis.map(buildCard).join('');

  observeReveal(); /* re-attach scroll animations to new cards */
}

/* =====================================================
   SWITCH CATEGORY TAB
   Shows the selected section and hides the other.
   Highlights the active tab button.
   @param {string} category — "pickles" or "podis"
   @param {Element} btn     — the clicked tab button
===================================================== */
function switchTab(category, btn) {
  /* Hide all category sections */
  document.querySelectorAll('.category-section').forEach(sec => {
    sec.style.display = 'none';
  });

  /* Remove active state from all tabs */
  document.querySelectorAll('.cat-tab').forEach(t => {
    t.classList.remove('active');
  });

  /* Show the selected section and mark tab active */
  document.getElementById('section-' + category).style.display = 'block';
  btn.classList.add('active');
}

/* =====================================================
   ADD TO CART
   Adds a product to cart or increments its quantity.
   @param {number} id — product ID to add
===================================================== */
function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  if (cart[id]) {
    cart[id].qty++;
  } else {
    cart[id] = { ...product, qty: 1 };
  }

  updateCartUI();
  saveCart(); /* persist cart so it survives page navigation */
  showToast(`${product.name} added to cart! 🛒`);

  /* Show green "Added" feedback on the button for 1.4 seconds */
  const btn = document.getElementById(`btn-${id}`);
  if (btn) {
    btn.classList.add('added');
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Added';
    setTimeout(() => {
      btn.classList.remove('added');
      btn.innerHTML = '<i class="fa-solid fa-plus"></i> Add';
    }, 1400);
  }
}

/* =====================================================
   REMOVE FROM CART
   Completely removes a product from the cart.
   @param {number} id — product ID to remove
===================================================== */
function removeFromCart(id) {
  delete cart[id];
  saveCart(); /* persist updated cart */
  updateCartUI();
}

/* =====================================================
   CHANGE QUANTITY
   Increments or decrements the quantity of a cart item.
   Removes item automatically when qty reaches 0.
   @param {number} id    — product ID
   @param {number} delta — +1 to increase, -1 to decrease
===================================================== */
function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) {
    delete cart[id];
  }
  saveCart(); /* persist updated cart */
  updateCartUI();
}

/* =====================================================
   UPDATE CART UI
   Refreshes every cart-related element on screen:
   - Nav badge count
   - Sidebar item list with qty controls
   - Total price
   - Footer show/hide
===================================================== */
function updateCartUI() {
  const items      = Object.values(cart);
  const totalQty   = items.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = items.reduce((sum, i) => sum + (i.price * i.qty), 0);

  /* Update nav badge */
  const badge = document.getElementById('cartBadge');
  badge.textContent = totalQty;
  badge.style.display = totalQty > 0 ? 'flex' : 'none';

  const cartItemsEl = document.getElementById('cartItems');
  const emptyEl     = document.getElementById('cartEmpty');
  const footerEl    = document.getElementById('cartFooter');
  const totalEl     = document.getElementById('cartTotal');

  /* Show empty state when cart is empty */
  if (items.length === 0) {
    /* FIXED: use CSS visibility instead of appendChild which
       removes emptyEl from the DOM and breaks future renders */
    emptyEl.style.display   = 'block';
    footerEl.style.display  = 'none';
    /* Clear only the dynamically added item rows, not emptyEl */
    document.querySelectorAll('.cart-item').forEach(el => el.remove());
    return;
  }

  /* Hide empty message, show footer */
  emptyEl.style.display  = 'none';
  footerEl.style.display = 'block';
  totalEl.textContent    = `₹${totalPrice}`;

  /* FIXED: remove previous item rows first, then re-render
     This avoids overwriting innerHTML (which destroys emptyEl) */
  document.querySelectorAll('.cart-item').forEach(el => el.remove());

  /* Build and insert item rows before the empty message node */
  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img class="cart-item-img" src="${item.img}" alt="${item.name}" />
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${item.price} / ${item.weight}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)">
            <i class="fa-solid fa-minus" style="font-size:0.65rem;"></i>
          </button>
          <span style="font-weight:700;font-size:0.9rem;min-width:18px;text-align:center;">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)">
            <i class="fa-solid fa-plus" style="font-size:0.65rem;"></i>
          </button>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
        <span style="font-weight:700;color:var(--red);font-size:0.95rem;">₹${item.price * item.qty}</span>
        <button class="cart-item-delete" onclick="removeFromCart(${item.id})">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>`;
    /* Insert before emptyEl so emptyEl stays in the DOM */
    cartItemsEl.insertBefore(div, emptyEl);
  });
}

/* =====================================================
   OPEN / CLOSE CART SIDEBAR
===================================================== */
function openCart() {
  document.getElementById('cartSidebar').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden'; /* lock background scroll */
}

function closeCart() {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

/* =====================================================
   TOAST NOTIFICATION
   Pops up a small message at the bottom of the screen.
   @param {string} msg — text to display
===================================================== */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

/* =====================================================
   CONTACT FORM SUBMISSION
   Validates required fields and shows success message.
===================================================== */
function submitForm() {
  const name  = document.getElementById('fname').value.trim();
  const email = document.getElementById('femail').value.trim();
  const msg   = document.getElementById('fmsg').value.trim();

  if (!name || !email || !msg) {
    showToast('Please fill in Name, Email and Message.');
    return;
  }

  /* Show the green success banner */
  document.getElementById('formSuccess').style.display = 'block';

  /* Clear all fields */
  ['fname', 'lname', 'femail', 'fsubject', 'fmsg'].forEach(id => {
    document.getElementById(id).value = '';
  });

  /* Auto-hide success message after 5 seconds */
  setTimeout(() => {
    document.getElementById('formSuccess').style.display = 'none';
  }, 5000);
}

/* =====================================================
   NAVBAR — SCROLL SHADOW
   Adds a shadow when the user scrolls past 30px.
===================================================== */
window.addEventListener('scroll', () => {
  document.getElementById('navbar')
    .classList.toggle('scrolled', window.scrollY > 30);
});

/* =====================================================
   HAMBURGER MENU (Mobile Navigation)
===================================================== */
document.getElementById('hamburger').addEventListener('click', function () {
  document.getElementById('navLinks').classList.toggle('mobile-open');
});

/* Close mobile menu when any nav link is clicked */
document.querySelectorAll('#navLinks a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('navLinks').classList.remove('mobile-open');
  });
});

/* =====================================================
   SCROLL REVEAL ANIMATION
   Uses IntersectionObserver to fade elements in as
   they scroll into view. Cards stagger with a delay.
===================================================== */
function observeReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        observer.unobserve(entry.target); /* only animate once */
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* =====================================================
   GO TO CHECKOUT
   Cart is already saved to sessionStorage on every
   change via saveCart(), so we just navigate.
===================================================== */
function goToCheckout() {
  const items = Object.values(cart);
  if (items.length === 0) {
    showToast('Your cart is empty! Add some products first.');
    return;
  }
  window.location.href = 'checkout.html';
}

/* =====================================================
   SCROLL SPY — ACTIVE NAV HIGHLIGHT
   Watches each page section as the user scrolls and
   adds the .active class to the matching nav link,
   giving it the red pill highlight automatically.
===================================================== */
function initScrollSpy() {
  /* All sections that have a matching nav link */
  const sections = document.querySelectorAll('section[id], div[id="why-strip"]');
  const navLinks = document.querySelectorAll('#navLinks a');

  /* Map each section id → its nav link for fast lookup */
  const linkMap = {};
  navLinks.forEach(link => {
    const id = link.getAttribute('href').replace('#', '');
    linkMap[id] = link;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const link = linkMap[entry.target.id];
      if (!link) return;

      if (entry.isIntersecting) {
        /* Remove active from all links */
        navLinks.forEach(l => l.classList.remove('active'));
        /* Add active to the currently visible section's link */
        link.classList.add('active');
      }
    });
  }, {
    /* Trigger when section crosses the middle of the viewport */
    rootMargin: '-40% 0px -55% 0px',
    threshold: 0
  });

  sections.forEach(section => observer.observe(section));

  /* Also set active on click immediately without waiting for scroll */
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

/* =====================================================
   INITIALISE ON PAGE LOAD
   products.js is loaded first (see index.html), so
   PRODUCTS is already available by the time this runs.
===================================================== */
renderProducts();  /* build product cards from products.js         */
observeReveal();   /* set up scroll animations                     */
restoreCart();     /* reload cart from sessionStorage if returning  */
updateCartUI();    /* sync badge and cart state                     */
initScrollSpy();   /* highlight active nav link on scroll           */