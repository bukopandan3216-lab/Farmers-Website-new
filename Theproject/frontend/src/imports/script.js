// ============================================================
// script.js — FarmDirect Core Frontend Logic
// FIXED VERSION — Addresses all reported issues:
//   1. Auth guard: cart & checkout require login (buyer role)
//   2. Featured Farmers shown in Shop All page (not just Home)
//   3. Farmer store page fully functional from any context
//   4. Product modal: Main/Details/Reviews tabs work + Visit Farmer Store btn
//   5. Consistent design across pages
// ============================================================

// ─── STATE ───────────────────────────────────────────────────
let STATE = {
  cart: JSON.parse(localStorage.getItem('fd_cart') || '[]'),
  currentCategory: 'All Products',
  searchQuery: '',
  currentProduct: null,
  currentProductTab: 'main', // track active product modal tab
};

// ─── HELPERS ─────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const qs = sel => document.querySelector(sel);

function showToast(msg, type = 'success') {
  const t = $('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast show' + (type === 'error' ? ' toast-error' : '');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3500);
}

function saveCart() {
  localStorage.setItem('fd_cart', JSON.stringify(STATE.cart));
}

function updateCartBadge() {
  const badge = $('cart-count');
  if (badge) {
    const total = STATE.cart.reduce((s, i) => s + i.qty, 0);
    badge.textContent = total;
    badge.style.display = total > 0 ? 'flex' : 'none';
  }
}

function photoUrl(path) {
  if (!path) return 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=400&q=80';
  if (path.startsWith('http')) return path;
  return path;
}

// ─── AUTH GUARD ──────────────────────────────────────────────
/**
 * FIX #1: Checks if user is logged in and is a buyer/admin.
 * Redirects to login with a friendly message if not.
 * Returns true if access is allowed, false otherwise.
 */
function requireBuyerAuth(action = 'do this') {
    console.log('Auth check:', APP_USER);

  if (!APP_USER) {
    showToast(`Please log in to ${action}. 🔐`, 'error');
    setTimeout(() => showPage('login'), 800);
    return false;
  }
  if (APP_USER.role === 'farmer') {
    showToast('Farmers cannot place orders. Please log in as a buyer.', 'error');
    return false;
  }
  if (APP_USER.status !== 'active') {
    showToast('Your account is pending approval. Please wait for admin verification.', 'error');
    return false;
  }
  return true;
}

// ─── PAGE ROUTING ─────────────────────────────────────────────
function showPage(page) {
  // Auth guard for protected pages
  if (page === 'cart') {
    // Allow viewing cart without login, but show auth banner
    // (actual checkout will be guarded separately)
  }
  if (page === 'checkout') {
    if (!requireBuyerAuth('proceed to checkout')) return;
  }
  if (page === 'buyer-profile') {
    if (!APP_USER) { showPage('login'); return; }
    if (APP_USER.role !== 'buyer') { showToast('This page is for buyers only.', 'error'); return; }
  }
  if (page === 'farmer-dashboard') {
    if (!APP_USER) { showPage('login'); return; }
    if (APP_USER.role !== 'farmer') { showToast('This page is for farmers only.', 'error'); return; }
  }

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = $(`page-${page}`);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // On-demand loaders
  if (page === 'home') {
    loadHomeProducts();
    loadHomeFarmers();
    loadFarmerCards(); // home farmer cards grid
  }
  if (page === 'shop') {
    loadShopProducts();
    loadShopFarmers(); // FIX #2: load featured farmers in shop page too
  }
  if (page === 'cart') {
    renderCart();
  }
  if (page === 'checkout') {
    renderCheckoutSummary();
    prefillCheckout();
  }
  if (page === 'buyer-profile' && typeof renderBuyerProfile === 'function') {
    renderBuyerProfile();
  }
  if (page === 'farmer-dashboard' && typeof renderFarmerDashboard === 'function') {
    renderFarmerDashboard();
  }
}

// ─── PRODUCTS ─────────────────────────────────────────────────
async function fetchProducts(params = {}) {
  const qs = new URLSearchParams({ action: 'get_products', ...params });
  const r = await fetch(`products.php?${qs}`);
  const d = await r.json();
  return d.success ? d.products : [];
}

async function fetchFarmers(limit = 6) {
  const r = await fetch(`products.php?action=get_farmers&limit=${limit}`);
  const d = await r.json();
  return d.success ? d.farmers : [];
}

async function fetchFarmer(id) {
  const r = await fetch(`products.php?action=get_farmer&id=${id}`);
  const d = await r.json();
  return d.success ? { farmer: d.farmer, products: d.products } : null;
}

// ─── PRODUCT CARD ─────────────────────────────────────────────
function makeProductCard(p) {
  const img = photoUrl(p.photo);
  const stock = parseInt(p.stock_qty);
  const stockLabel = stock < 1 ? '<span style="color:#ef4444;font-size:11px;">Out of stock</span>'
    : stock < 10 ? `<span style="color:#f59e0b;font-size:11px;">Only ${stock} left</span>`
    : `<span style="color:#10b981;font-size:11px;">In stock</span>`;

  return `
  <div class="product-card" onclick="openProductDetail(${p.id})">
    <div class="product-img-wrap" style="position:relative;overflow:hidden;border-radius:12px 12px 0 0;">
      <img src="${img}" alt="${escHtml(p.name)}" class="product-img"
           style="width:100%;height:200px;object-fit:cover;display:block;"
           onerror="this.src='https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=400&q=80'"/>
    </div>
    <div class="product-info" style="padding:16px;">
      <div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">${escHtml(p.category)}</div>
      <h3 style="font-size:16px;font-weight:600;margin-bottom:4px;color:#111827;">${escHtml(p.name)}</h3>
      <p style="font-size:13px;color:#6b7280;margin-bottom:8px;">${escHtml(p.store_name || p.farmer_name || '')}</p>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
        <span style="font-size:18px;font-weight:700;color:#10b981;">₱${parseFloat(p.price).toFixed(2)}<span style="font-size:12px;font-weight:400;color:#6b7280;">/${escHtml(p.unit||'kg')}</span></span>
        ${stockLabel}
      </div>
      <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(${p.id})"
        style="margin-top:12px;width:100%;padding:10px;background:#10b981;color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;transition:background .2s;"
        onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'"
        ${stock < 1 ? 'disabled style="background:#d1d5db;cursor:not-allowed;"' : ''}>
        ${stock < 1 ? 'Out of Stock' : '🛒 Add to Cart'}
      </button>
    </div>
  </div>`;
}

// ─── FARMER CARD ──────────────────────────────────────────────
function makeFarmerCard(f) {
  const img = photoUrl(f.store_photo);
  const rating = parseFloat(f.rating || 0).toFixed(1);
  const stars = rating > 0 ? `⭐ ${rating}` : '⭐ New';
  const location = [f.farm_location, f.province].filter(Boolean).join(', ') || 'Philippines';
  return `
  <div class="farmer-card" onclick="viewFarmerStore(${f.id})"
       style="background:white;border-radius:16px;overflow:hidden;cursor:pointer;border:1.5px solid #e5e7eb;transition:box-shadow .2s,transform .2s;"
       onmouseover="this.style.boxShadow='0 8px 24px rgba(0,0,0,.1)';this.style.transform='translateY(-2px)'"
       onmouseout="this.style.boxShadow='none';this.style.transform='none'">
    <div style="height:160px;overflow:hidden;position:relative;">
      <img src="${img}" alt="${escHtml(f.store_name)}"
           style="width:100%;height:100%;object-fit:cover;"
           onerror="this.src='https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800&q=80'"/>
      <div style="position:absolute;bottom:0;left:0;right:0;height:60px;background:linear-gradient(transparent,rgba(0,0,0,.6));"></div>
    </div>
    <div style="padding:16px;">
      <h3 style="font-size:16px;font-weight:700;color:#111827;margin-bottom:4px;">${escHtml(f.store_name)}</h3>
      <p style="font-size:13px;color:#6b7280;margin-bottom:8px;">by ${escHtml(f.full_name)}</p>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:12px;color:#6b7280;">📍 ${escHtml(location)}</span>
        <span style="font-size:12px;color:#f59e0b;">${stars}</span>
      </div>
      <button style="margin-top:12px;width:100%;padding:8px;background:#f0fdf4;color:#10b981;border:1.5px solid #10b981;border-radius:8px;font-weight:600;cursor:pointer;font-size:13px;transition:all .2s;"
        onmouseover="this.style.background='#10b981';this.style.color='white'"
        onmouseout="this.style.background='#f0fdf4';this.style.color='#10b981'">
        Visit Store →
      </button>
    </div>
  </div>`;
}

// ─── HOME PAGE LOADERS ────────────────────────────────────────
async function loadHomeProducts() {
  const container = $('home-products');
  if (!container) return;
  container.innerHTML = '<p style="color:#9ca3af;padding:24px;">Loading products…</p>';
  const products = await fetchProducts({ limit: 6 });
  container.innerHTML = products.length
    ? products.slice(0, 6).map(makeProductCard).join('')
    : '<p style="color:#9ca3af;padding:24px;">No products available yet.</p>';
}

async function loadHomeFarmers() {
  const container = $('home-farmers');
  if (!container) return;
  container.innerHTML = '<p style="color:#9ca3af;padding:24px;">Loading farmers…</p>';
  const farmers = await fetchFarmers(4);
  container.innerHTML = farmers.length
    ? farmers.map(makeFarmerCard).join('')
    : '<p style="color:#9ca3af;padding:24px;">No farmers yet.</p>';
}

async function loadFarmerCards() {
  const container = $('farmer-cards');
  if (!container) return;
  const farmers = await fetchFarmers(3);
  container.innerHTML = farmers.length
    ? farmers.map(makeFarmerCard).join('')
    : '<p style="color:#9ca3af;padding:24px;">No featured farmers yet.</p>';
}

// ─── SHOP PAGE LOADERS ────────────────────────────────────────
async function loadShopProducts() {
  const container = $('shop-products');
  if (!container) return;
  container.innerHTML = '<p style="color:#9ca3af;padding:24px;">Loading products…</p>';
  const params = {};
  if (STATE.currentCategory && STATE.currentCategory !== 'All Products') params.category = STATE.currentCategory;
  if (STATE.searchQuery) params.search = STATE.searchQuery;
  const products = await fetchProducts(params);
  container.innerHTML = products.length
    ? products.map(makeProductCard).join('')
    : '<p style="color:#9ca3af;padding:24px;">No products found.</p>';
}

// FIX #2: Load featured farmers in the Shop All page
async function loadShopFarmers() {
  const container = $('shop-farmers');
  if (!container) return;
  container.innerHTML = '<p style="color:#9ca3af;padding:16px;">Loading farmers…</p>';
  const farmers = await fetchFarmers(6);
  container.innerHTML = farmers.length
    ? farmers.map(makeFarmerCard).join('')
    : '<p style="color:#9ca3af;padding:16px;">No farmers yet.</p>';
}

function setTab(btn, category) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  STATE.currentCategory = category;
  loadShopProducts();
}

function filterShop(category) {
  STATE.currentCategory = category;
  showPage('shop');
  // After showPage, set the matching tab button active
  setTimeout(() => {
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.toggle('active', b.textContent.trim().replace('&', '&amp;') === category || b.textContent.trim() === category);
    });
  }, 100);
}

function handleSearch(val) {
  STATE.searchQuery = val.trim();
  if ($('page-shop') && $('page-shop').classList.contains('active')) {
    loadShopProducts();
  } else {
    showPage('shop');
  }
}

// ─── PRODUCT DETAIL MODAL ────────────────────────────────────
/**
 * FIX #4: Full product modal with working Main/Details/Reviews tabs
 * and a "Visit Farmer Store" button
 */
async function openProductDetail(id) {
  const r = await fetch(`products.php?action=get_product&id=${id}`);
  const d = await r.json();
  if (!d.success) { showToast('Could not load product.', 'error'); return; }
  const p = d.product;
  STATE.currentProduct = p;
  STATE.currentProductTab = 'main';

  const modal = $('product-detail-modal');
  const img = $('product-detail-img');
  const content = $('product-detail-content');

  img.src = photoUrl(p.photo);
  img.onerror = () => { img.src = 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=400&q=80'; };

  renderProductModalTabs(p, 'main');

  // Attach tab button listeners (the 3 buttons in the modal)
  const tabBtns = modal.querySelectorAll('.product-modal-tab');
  tabBtns.forEach(btn => {
    btn.onclick = () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      STATE.currentProductTab = btn.dataset.tab;
      renderProductModalTabs(p, btn.dataset.tab);
    };
  });

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function renderProductModalTabs(p, tab) {
  const content = $('product-detail-content');
  if (!content) return;

  const farmerLocation = [p.farm_location, p.province].filter(Boolean).join(', ') || 'Philippines';
  const harvestDate = p.harvest_date ? new Date(p.harvest_date).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Fresh daily';
  const stock = parseInt(p.stock_qty);

  if (tab === 'main') {
    content.innerHTML = `
      <div style="margin-bottom:8px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;">${escHtml(p.category)}</div>
      <h2 style="font-size:26px;font-weight:700;color:#111827;margin-bottom:8px;">${escHtml(p.name)}</h2>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
        <span style="font-size:28px;font-weight:700;color:#10b981;">₱${parseFloat(p.price).toFixed(2)}</span>
        <span style="font-size:14px;color:#6b7280;">per ${escHtml(p.unit || 'kg')}</span>
      </div>
      <p style="color:#374151;line-height:1.6;margin-bottom:20px;">${escHtml(p.description || 'Fresh produce directly from the farm.')}</p>

      <div style="background:#f8f9fa;border-radius:12px;padding:16px;margin-bottom:20px;">
        <div style="font-size:13px;font-weight:600;color:#374151;margin-bottom:10px;">Quick Info</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px;color:#6b7280;">
          <div>📦 Stock: <strong style="color:${stock < 10 ? '#f59e0b' : '#10b981'}">${stock} ${escHtml(p.unit || 'kg')}</strong></div>
          <div>📅 Harvested: <strong style="color:#374151;">${harvestDate}</strong></div>
          <div>🏪 Store: <strong style="color:#374151;">${escHtml(p.store_name || '')}</strong></div>
          <div>📍 From: <strong style="color:#374151;">${escHtml(farmerLocation)}</strong></div>
        </div>
      </div>

      <div style="display:flex;gap:12px;flex-wrap:wrap;">
        <button onclick="addToCart(${p.id})" style="flex:1;min-width:140px;padding:14px 20px;background:#10b981;color:white;border:none;border-radius:10px;font-weight:700;font-size:15px;cursor:pointer;transition:background .2s;"
          onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'"
          ${stock < 1 ? 'disabled style="background:#d1d5db;cursor:not-allowed;"' : ''}>
          🛒 ${stock < 1 ? 'Out of Stock' : 'Add to Cart'}
        </button>
        <button onclick="viewFarmerStore(${p.farmer_id})" style="flex:1;min-width:140px;padding:14px 20px;background:white;color:#10b981;border:2px solid #10b981;border-radius:10px;font-weight:700;font-size:15px;cursor:pointer;transition:all .2s;"
          onmouseover="this.style.background='#f0fdf4'" onmouseout="this.style.background='white'">
          🏪 Visit Farmer's Store
        </button>
      </div>`;
  } else if (tab === 'details') {
    content.innerHTML = `
      <h2 style="font-size:22px;font-weight:700;color:#111827;margin-bottom:16px;">${escHtml(p.name)} — Details</h2>
      <div style="display:grid;gap:16px;">
        <div style="background:#f8f9fa;border-radius:12px;padding:20px;">
          <h3 style="font-size:15px;font-weight:600;margin-bottom:12px;color:#374151;">📋 Product Information</h3>
          <table style="width:100%;font-size:14px;border-collapse:collapse;">
            <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:8px 0;color:#6b7280;width:40%;">Category</td><td style="padding:8px 0;font-weight:500;">${escHtml(p.category)}</td></tr>
            <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:8px 0;color:#6b7280;">Unit</td><td style="padding:8px 0;font-weight:500;">${escHtml(p.unit || 'kg')}</td></tr>
            <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:8px 0;color:#6b7280;">Price</td><td style="padding:8px 0;font-weight:500;color:#10b981;">₱${parseFloat(p.price).toFixed(2)} / ${escHtml(p.unit || 'kg')}</td></tr>
            <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:8px 0;color:#6b7280;">Stock Available</td><td style="padding:8px 0;font-weight:500;">${stock} ${escHtml(p.unit || 'kg')}</td></tr>
            <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:8px 0;color:#6b7280;">Harvest Date</td><td style="padding:8px 0;font-weight:500;">${harvestDate}</td></tr>
          </table>
        </div>
        <div style="background:#f8f9fa;border-radius:12px;padding:20px;">
          <h3 style="font-size:15px;font-weight:600;margin-bottom:12px;color:#374151;">👨‍🌾 Seller Information</h3>
          <table style="width:100%;font-size:14px;border-collapse:collapse;">
            <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:8px 0;color:#6b7280;width:40%;">Store</td><td style="padding:8px 0;font-weight:500;">${escHtml(p.store_name || '')}</td></tr>
            <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:8px 0;color:#6b7280;">Farmer</td><td style="padding:8px 0;font-weight:500;">${escHtml(p.farmer_name || '')}</td></tr>
            <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:8px 0;color:#6b7280;">Location</td><td style="padding:8px 0;font-weight:500;">${escHtml(farmerLocation)}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;">Bio</td><td style="padding:8px 0;font-weight:500;">${escHtml(p.bio || 'Trusted local farmer.')}</td></tr>
          </table>
        </div>
        <button onclick="viewFarmerStore(${p.farmer_id})" style="padding:12px 20px;background:#f0fdf4;color:#10b981;border:2px solid #10b981;border-radius:10px;font-weight:700;font-size:14px;cursor:pointer;transition:all .2s;"
          onmouseover="this.style.background='#10b981';this.style.color='white'" onmouseout="this.style.background='#f0fdf4';this.style.color='#10b981'">
          🏪 Visit ${escHtml(p.store_name || "Farmer's Store")}
        </button>
      </div>`;
  } else if (tab === 'reviews') {
    content.innerHTML = `
      <h2 style="font-size:22px;font-weight:700;color:#111827;margin-bottom:16px;">Reviews for ${escHtml(p.name)}</h2>
      <div style="background:#f8f9fa;border-radius:12px;padding:24px;text-align:center;margin-bottom:16px;">
        <div style="font-size:48px;margin-bottom:8px;">⭐</div>
        <div style="font-size:32px;font-weight:700;color:#f59e0b;margin-bottom:4px;">${parseFloat(p.rating || 0).toFixed(1)}</div>
        <div style="font-size:14px;color:#6b7280;">Farmer Rating</div>
      </div>
      <div id="product-reviews-list">
        <p style="color:#6b7280;font-size:14px;text-align:center;padding:24px;">
          No reviews yet for this product.<br/>
          <span style="font-size:12px;">Purchase the product to leave a review.</span>
        </p>
      </div>
      <div style="margin-top:16px;padding:16px;background:#fffbeb;border-radius:10px;border:1px solid #fde68a;">
        <p style="font-size:13px;color:#92400e;">💡 Reviews are available after purchasing and receiving your order.</p>
      </div>`;
    // Optionally load reviews from API here in future
  }
}

function closeProductDetail() {
  const modal = $('product-detail-modal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

// ─── FARMER STORE PAGE ───────────────────────────────────────
/**
 * FIX #3: viewFarmerStore — works from anywhere (home, shop, product modal)
 */
async function viewFarmerStore(farmerId) {
  closeProductDetail();
  showPage('farmer-store');

  const infoEl = $('farmer-store-info');
  const productsEl = $('farmer-store-products');
  if (!infoEl || !productsEl) return;

  infoEl.innerHTML = '<p style="color:#9ca3af;">Loading store…</p>';
  productsEl.innerHTML = '<p style="color:#9ca3af;">Loading products…</p>';

  const result = await fetchFarmer(farmerId);
  if (!result) {
    infoEl.innerHTML = '<p style="color:#ef4444;">Could not load store. Please try again.</p>';
    return;
  }

  const f = result.farmer;
  const products = result.products;
  const location = [f.farm_location, f.province].filter(Boolean).join(', ') || 'Philippines';
  const rating = parseFloat(f.rating || 0).toFixed(1);
  const stars = '⭐'.repeat(Math.min(5, Math.round(f.rating || 0)));

  infoEl.innerHTML = `
    <div style="display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start;background:white;padding:32px;border-radius:16px;border:1.5px solid #e5e7eb;margin-bottom:24px;">
      <div style="flex-shrink:0;">
        <img src="${photoUrl(f.store_photo)}" alt="${escHtml(f.store_name)}"
             style="width:140px;height:140px;object-fit:cover;border-radius:12px;border:2px solid #e5e7eb;"
             onerror="this.src='https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=400&q=80'"/>
      </div>
      <div style="flex:1;min-width:200px;">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px;">
          <h1 style="font-size:26px;font-weight:700;color:#111827;">${escHtml(f.store_name)}</h1>
          ${f.is_verified ? '<span style="background:#dcfce7;color:#16a34a;font-size:12px;padding:4px 10px;border-radius:20px;font-weight:600;">✓ Verified</span>' : ''}
        </div>
        <p style="font-size:15px;color:#6b7280;margin-bottom:8px;">by <strong>${escHtml(f.full_name)}</strong></p>
        <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:12px;font-size:13px;color:#6b7280;">
          <span>📍 ${escHtml(location)}</span>
          ${f.rating > 0 ? `<span>${stars} ${rating} rating</span>` : '<span>⭐ New Store</span>'}
          ${f.total_sales > 0 ? `<span>💰 ₱${parseFloat(f.total_sales).toLocaleString()} total sales</span>` : ''}
        </div>
        ${f.bio ? `<p style="font-size:14px;color:#374151;line-height:1.6;background:#f8f9fa;padding:12px;border-radius:8px;">${escHtml(f.bio)}</p>` : ''}
      </div>
    </div>`;

  productsEl.innerHTML = products.length
    ? products.map(makeProductCard).join('')
    : `<div style="text-align:center;padding:48px;color:#9ca3af;">
        <div style="font-size:48px;margin-bottom:12px;">📦</div>
        <p>This store has no products yet.</p>
       </div>`;
}

// ─── CART ─────────────────────────────────────────────────────
async function addToCart(productId) {
  // FIX #1: must be logged in as buyer to add to cart
  if (!requireBuyerAuth('add items to your cart')) return;

  const r = await fetch(`products.php?action=get_product&id=${productId}`);
  const d = await r.json();
  if (!d.success) { showToast('Product not found.', 'error'); return; }
  const p = d.product;
  const stock = parseInt(p.stock_qty);
  if (stock < 1) { showToast('Sorry, this product is out of stock.', 'error'); return; }

  const existing = STATE.cart.find(i => i.id === p.id);
  if (existing) {
    if (existing.qty >= stock) { showToast(`Only ${stock} available in stock.`, 'error'); return; }
    existing.qty++;
  } else {
    STATE.cart.push({
      id: p.id,
      name: p.name,
      price: parseFloat(p.price),
      unit: p.unit,
      photo: p.photo,
      farmer_id: p.farmer_id,
      store_name: p.store_name || p.farmer_name,
      stock_qty: stock,
      qty: 1,
    });
  }
  saveCart();
  updateCartBadge();
  showToast(`✅ ${p.name} added to cart!`);
}

function renderCart() {
  const container = $('cart-content');
  if (!container) return;

  // FIX #1: Show login prompt if not logged in
  if (!APP_USER) {
    container.innerHTML = `
      <div style="text-align:center;padding:60px 24px;">
        <div style="font-size:64px;margin-bottom:16px;">🔐</div>
        <h2 style="font-size:24px;font-weight:700;color:#111827;margin-bottom:8px;">Login Required</h2>
        <p style="color:#6b7280;margin-bottom:24px;">Please log in to view and manage your cart.</p>
        <button onclick="showPage('login')" style="padding:14px 32px;background:#10b981;color:white;border:none;border-radius:10px;font-weight:700;font-size:16px;cursor:pointer;">Login Now</button>
      </div>`;
    return;
  }
  if (APP_USER.role === 'farmer') {
    container.innerHTML = `
      <div style="text-align:center;padding:60px 24px;">
        <div style="font-size:64px;margin-bottom:16px;">🌾</div>
        <h2 style="font-size:24px;font-weight:700;color:#111827;margin-bottom:8px;">Farmers Can't Buy</h2>
        <p style="color:#6b7280;">Your account is registered as a farmer. Only buyers can shop on FarmDirect.</p>
      </div>`;
    return;
  }

  if (!STATE.cart.length) {
    container.innerHTML = `
      <div style="text-align:center;padding:60px 24px;">
        <div style="font-size:64px;margin-bottom:16px;">🛒</div>
        <h2 style="font-size:22px;font-weight:700;color:#111827;margin-bottom:8px;">Your cart is empty</h2>
        <p style="color:#6b7280;margin-bottom:24px;">Add fresh produce from our farmers to get started!</p>
        <button onclick="showPage('shop')" style="padding:14px 32px;background:#10b981;color:white;border:none;border-radius:10px;font-weight:700;font-size:16px;cursor:pointer;">Browse Products</button>
      </div>`;
    return;
  }

  const subtotal = STATE.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFee = 50;
  const total = subtotal + deliveryFee;

  const rows = STATE.cart.map(item => `
    <div style="display:flex;gap:16px;padding:20px 0;border-bottom:1px solid #e5e7eb;align-items:center;">
      <img src="${photoUrl(item.photo)}" alt="${escHtml(item.name)}"
           style="width:80px;height:80px;object-fit:cover;border-radius:10px;flex-shrink:0;"
           onerror="this.src='https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=400&q=80'"/>
      <div style="flex:1;">
        <div style="font-weight:600;color:#111827;margin-bottom:4px;">${escHtml(item.name)}</div>
        <div style="font-size:13px;color:#6b7280;margin-bottom:8px;">${escHtml(item.store_name)} • ₱${item.price.toFixed(2)}/${escHtml(item.unit || 'kg')}</div>
        <div style="display:flex;align-items:center;gap:10px;">
          <button onclick="changeQty(${item.id}, -1)" style="width:30px;height:30px;border:1.5px solid #d1d5db;background:white;border-radius:6px;font-size:18px;cursor:pointer;line-height:1;color:#374151;">-</button>
          <span style="font-weight:600;color:#111827;min-width:24px;text-align:center;">${item.qty}</span>
          <button onclick="changeQty(${item.id}, 1)" style="width:30px;height:30px;border:1.5px solid #d1d5db;background:white;border-radius:6px;font-size:18px;cursor:pointer;line-height:1;color:#374151;">+</button>
        </div>
      </div>
      <div style="text-align:right;flex-shrink:0;">
        <div style="font-size:18px;font-weight:700;color:#10b981;margin-bottom:8px;">₱${(item.price * item.qty).toFixed(2)}</div>
        <button onclick="removeFromCart(${item.id})" style="font-size:12px;color:#ef4444;background:none;border:none;cursor:pointer;text-decoration:underline;">Remove</button>
      </div>
    </div>`).join('');

  container.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 320px;gap:32px;align-items:start;max-width:1000px;margin:0 auto;">
      <div>
        <div style="background:white;border-radius:14px;border:1.5px solid #e5e7eb;padding:24px;">
          <h2 style="font-size:18px;font-weight:700;color:#111827;margin-bottom:4px;">Cart Items (${STATE.cart.length})</h2>
          ${rows}
        </div>
      </div>
      <div>
        <div style="background:white;border-radius:14px;border:1.5px solid #e5e7eb;padding:24px;position:sticky;top:100px;">
          <h2 style="font-size:18px;font-weight:700;color:#111827;margin-bottom:20px;">Order Summary</h2>
          <div style="display:flex;justify-content:space-between;margin-bottom:10px;font-size:14px;"><span style="color:#6b7280;">Subtotal</span><span>₱${subtotal.toFixed(2)}</span></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:16px;font-size:14px;"><span style="color:#6b7280;">Delivery Fee</span><span>₱${deliveryFee.toFixed(2)}</span></div>
          <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:700;border-top:2px solid #e5e7eb;padding-top:16px;margin-bottom:20px;"><span>Total</span><span style="color:#10b981;">₱${total.toFixed(2)}</span></div>
          <button onclick="proceedToCheckout()" ${!APP_USER ? 'disabled style="background:#d1d5db;cursor:not-allowed;"' : ''} style="width:100%;padding:14px;background:#10b981;color:white;border:none;border-radius:10px;font-weight:700;font-size:16px;cursor:pointer;transition:background .2s;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">
            Proceed to Checkout →
          </button>
          <button onclick="showPage('shop')" style="width:100%;padding:12px;background:white;color:#6b7280;border:1.5px solid #d1d5db;border-radius:10px;font-weight:600;font-size:14px;cursor:pointer;margin-top:10px;">
            Continue Shopping
          </button>
        </div>
      </div>
    </div>`;

  // On mobile, stack
  if (window.innerWidth < 700) {
    container.querySelector('[style*="grid-template-columns"]').style.gridTemplateColumns = '1fr';
  }
}

async function submitOrder() {
  if (!requireBuyerAuth('place an order')) return;

  if (!STATE.cart.length) {
    showToast('Your cart is empty.', 'error');
    return;
  }

  try {
    const res = await fetch('orders.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: STATE.cart })
    });

    const data = await res.json();

    if (!data.success) {
      showToast(data.message || 'Order failed.', 'error');
      return;
    }

    showToast('✅ Order placed successfully!');
    STATE.cart = [];
    saveCart();
    updateCartBadge();
    showPage('home');

  } catch (err) {
    showToast('Network error. Try again.', 'error');
  }
}

function changeQty(id, delta) {
  const item = STATE.cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    STATE.cart = STATE.cart.filter(i => i.id !== id);
  } else if (item.qty > item.stock_qty) {
    item.qty = item.stock_qty;
    showToast(`Only ${item.stock_qty} in stock.`, 'error');
  }
  saveCart();
  updateCartBadge();
  renderCart();
}

function removeFromCart(id) {
  STATE.cart = STATE.cart.filter(i => i.id !== id);
  saveCart();
  updateCartBadge();
  renderCart();
}

// ─── CHECKOUT ────────────────────────────────────────────────
/**
 * FIX #1: Checkout always requires buyer login
 */
function proceedToCheckout() {
  if (!requireBuyerAuth('checkout')) return;
  showPage('checkout');
}

function renderCheckoutSummary() {
  const subtotal = STATE.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFee = 50;
  const total = subtotal + deliveryFee;

  const sub = $('checkout-subtotal');
  const tot = $('checkout-total');
  if (sub) sub.textContent = `₱${subtotal.toFixed(2)}`;
  if (tot) tot.textContent = `₱${total.toFixed(2)}`;
}

function prefillCheckout() {
  if (!APP_USER) return;
  const nameEl = $('checkout-name');
  const phoneEl = $('checkout-phone');
  const addressEl = $('checkout-address');
  const cityEl = $('checkout-city');
  const provinceEl = $('checkout-province');

  if (nameEl && !nameEl.value) nameEl.value = APP_USER.full_name || '';
  if (phoneEl && !phoneEl.value) phoneEl.value = APP_USER.contact || '';
  if (addressEl && !addressEl.value) addressEl.value = APP_USER.delivery_address || APP_USER.address || '';
  if (cityEl && !cityEl.value) cityEl.value = APP_USER.city || APP_USER.buyer_province || '';
  if (provinceEl && !provinceEl.value) provinceEl.value = APP_USER.buyer_province || '';
}

// ─── APPLY TAB SWITCHER ──────────────────────────────────────
function switchApplyTab(btn, formId) {
  document.querySelectorAll('.apply-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.apply-form-card').forEach(f => f.style.display = 'none');
  const form = $(formId);
  if (form) form.style.display = 'block';
}

// ─── ESCAPE HTML ─────────────────────────────────────────────
function escHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ─── MODAL CLICK-OUTSIDE ─────────────────────────────────────
window.addEventListener('click', e => {
  const modal = $('product-detail-modal');
  if (modal && e.target === modal) closeProductDetail();
});

window.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeProductDetail();
});

// ─── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  if (!APP_USER) {
    localStorage.removeItem('fd_cart');
    STATE.cart = [];
  }

  updateCartBadge();
  loadHomeProducts();
  loadHomeFarmers();
  loadFarmerCards();

  // File input label updaters
  document.querySelectorAll('.file-input-wrap input[type="file"]').forEach(input => {
    input.addEventListener('change', function () {
      const label = this.closest('.file-input-wrap')?.querySelector('.file-name');
      if (label) label.textContent = this.files[0]?.name || 'No file chosen';
    });
  });
});