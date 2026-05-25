/* ============================================================
   FarmDirect - Farmer JS (farmer.js)
   Handles: farmer cards, farmer store page, farmer dashboard
   ============================================================ */

/* ─── FARMER CARDS (Home Page) ───────────────────────────── */

function farmerCard(farmer) {
  return `
    <div class="farmer-card">
      <img src="${getImageSrc(farmer.store_photo)}" alt="${farmer.store_name || farmer.full_name}" onerror="this.src='${PLACEHOLDER_IMG}'" />
      <div class="farmer-card-body">
        <div class="farmer-card-title">${farmer.store_name || farmer.full_name}</div>
        <div class="farmer-card-subtitle">${farmer.farm_location || 'Local Farm'} · ${farmer.province || ''}</div>
        <div class="farmer-card-bio">${farmer.bio || 'Fresh goods delivered directly from the farm.'}</div>
        <div class="farmer-card-actions">
          <button onclick="showFarmerStore(${farmer.id})">Open Store</button>
        </div>
      </div>
    </div>`;
}

async function fetchFarmers(limit = 3) {
  const response = await apiGet(`products.php?action=get_farmers&limit=${limit}`);
  if (!response.success) {
    showToast(response.message || 'Could not load farmer shops.', 'error');
    return [];
  }
  STATE.farmers = response.farmers || [];
  return STATE.farmers;
}

async function renderFeaturedFarmers() {
  const farmers = await fetchFarmers(3);
  document.getElementById('farmer-cards').innerHTML = farmers.length
    ? farmers.map(f => farmerCard(f)).join('')
    : '<p>No farmer shops available at the moment.</p>';
}

/* ─── FARMER DASHBOARD ───────────────────────────────────── */

async function renderFarmerDashboard() {
  if (!APP_USER || APP_USER.role !== 'farmer') {
    showToast('Farmer access only. Please login as a farmer.', 'error');
    showPage('login');
    return;
  }

  showPage('farmer-dashboard');

  // Get farmer dashboard data
  const response = await apiGet(`products.php?action=get_farmer_dashboard&farmer_id=${APP_USER.id}`);
  
  if (response.success) {
    const data = response.data || {};
    
    // Update overview stats
    document.getElementById('farmer-stat-products').textContent = data.total_products || 0;
    document.getElementById('farmer-stat-orders').textContent = data.total_orders || 0;
    document.getElementById('farmer-stat-revenue').textContent = `₱${(data.total_revenue || 0).toFixed(2)}`;
    document.getElementById('farmer-stat-rating').textContent = (data.rating || 4.5).toFixed(1) + '★';

    // Store info
    const storeInfo = document.getElementById('farmer-store-details');
    if (storeInfo) {
      storeInfo.innerHTML = `
        <div style="margin-bottom:16px;">
          <div style="font-size:12px; color:var(--gray); text-transform:uppercase; margin-bottom:4px;">Store Name</div>
          <div style="font-size:18px; font-weight:bold;">${APP_USER.store_name || APP_USER.full_name}</div>
        </div>
        <div style="margin-bottom:16px;">
          <div style="font-size:12px; color:var(--gray); text-transform:uppercase; margin-bottom:4px;">Location</div>
          <div style="font-size:16px;">${APP_USER.farm_location || 'N/A'}</div>
        </div>
        <div style="margin-bottom:16px;">
          <div style="font-size:12px; color:var(--gray); text-transform:uppercase; margin-bottom:4px;">Province</div>
          <div style="font-size:16px;">${APP_USER.province || 'N/A'}</div>
        </div>
        <div style="margin-bottom:16px;">
          <div style="font-size:12px; color:var(--gray); text-transform:uppercase; margin-bottom:4px;">Bio</div>
          <div style="font-size:14px;">${APP_USER.bio || 'Add a bio to your store'}</div>
        </div>
        <div style="margin-bottom:16px;">
          <div style="font-size:12px; color:var(--gray); text-transform:uppercase; margin-bottom:4px;">Member Since</div>
          <div style="font-size:16px;">${new Date(APP_USER.created_at).toLocaleDateString()}</div>
        </div>
      `;
    }

    // Store photo
    const storePhotoEl = document.getElementById('farmer-store-photo');
    if (storePhotoEl) {
      storePhotoEl.src = getImageSrc(APP_USER.store_photo);
    }

    // Recent orders
    if (data.recent_orders && data.recent_orders.length > 0) {
      document.getElementById('farmer-recent-orders').innerHTML = data.recent_orders.map(order => `
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:12px;">#${order.id}</td>
          <td style="padding:12px;">${order.buyer_name}</td>
          <td style="padding:12px;">₱${parseFloat(order.total_amount).toFixed(2)}</td>
          <td style="padding:12px;"><span style="background:#fef3c7; color:#92400e; padding:4px 12px; border-radius:6px; font-weight:600; font-size:12px;">${order.status}</span></td>
          <td style="padding:12px;">${new Date(order.created_at).toLocaleDateString()}</td>
        </tr>`).join('');
    }
  }

  // Load products
  await loadFarmerProducts();
  
  // Load orders
  await loadFarmerOrders('all');
}

/* ─── SWITCH FARMER DASHBOARD TABS ──────────────────────── */

function switchFarmerTab(tabName, evt) {
  // Hide all tabs
  document.querySelectorAll('.farmer-tab-content').forEach(tab => tab.style.display = 'none');
  
  // Remove active state from all buttons
  document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
  
  // Show selected tab
  const tabEl = document.getElementById(`farmer-tab-${tabName}`);
  if (tabEl) tabEl.style.display = 'block';
  
  // Add active state to clicked button
  if (evt && evt.target) {
    evt.target.classList.add('active');
    evt.target.style.borderBottom = '3px solid #10b981';
    evt.target.style.marginBottom = '-2px';
  }
}

/* ─── LOAD FARMER PRODUCTS ───────────────────────────────── */

async function loadFarmerProducts() {
  const response = await apiGet(`products.php?action=get_farmer_products&farmer_id=${APP_USER.id}`);
  
  if (!response.success || !response.products) {
    document.getElementById('farmer-products-list').innerHTML = '<p>No products yet.</p>';
    return;
  }

  const products = response.products;
  if (products.length === 0) {
    document.getElementById('farmer-products-list').innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:40px; color:var(--gray);">No products available. Add your first product!</p>';
    return;
  }

  document.getElementById('farmer-products-list').innerHTML = products.map(prod => `
    <div style="background:white; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden;">
      <img src="${getImageSrc(prod.image)}" alt="${prod.name}" onerror="this.src='${PLACEHOLDER_IMG}'" style="width:100%; height:180px; object-fit:cover;"/>
      <div style="padding:16px;">
        <h3 style="font-weight:bold; margin-bottom:8px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${prod.name}</h3>
        <p style="color:var(--gray); font-size:14px; margin-bottom:12px;">${prod.category}</p>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="font-size:18px; font-weight:bold; color:#10b981;">₱${parseFloat(prod.price).toFixed(2)}</div>
          <div style="color:var(--gray); font-size:14px;">Stock: ${prod.stock}</div>
        </div>
      </div>
    </div>`).join('');
}

/* ─── LOAD FARMER ORDERS ────────────────────────────────── */

async function loadFarmerOrders(status = 'all') {
  const response = await apiGet(`products.php?action=get_farmer_orders&farmer_id=${APP_USER.id}&status=${status}`);
  
  if (!response.success || !response.orders) {
    document.getElementById('farmer-orders-list').innerHTML = '<tr><td colspan="6" style="padding:20px; text-align:center; color:var(--gray);">No orders</td></tr>';
    return;
  }

  const orders = response.orders;
  if (orders.length === 0) {
    document.getElementById('farmer-orders-list').innerHTML = '<tr><td colspan="6" style="padding:20px; text-align:center; color:var(--gray);">No orders with this status</td></tr>';
    return;
  }

  document.getElementById('farmer-orders-list').innerHTML = orders.map(order => `
    <tr style="border-bottom:1px solid #e5e7eb;">
      <td style="padding:12px;">#${order.id}</td>
      <td style="padding:12px;">${order.buyer_name}</td>
      <td style="padding:12px;">${order.item_count} item${order.item_count > 1 ? 's' : ''}</td>
      <td style="padding:12px;">₱${parseFloat(order.total_amount).toFixed(2)}</td>
      <td style="padding:12px;"><span style="background:#fef3c7; color:#92400e; padding:4px 12px; border-radius:6px; font-weight:600; font-size:12px;">${order.status}</span></td>
      <td style="padding:12px; text-align:center;">
        <button style="background:none; border:none; cursor:pointer; color:#3b82f6; text-decoration:underline; font-size:14px;" onclick="showOrderDetails(${order.id})">View</button>
      </td>
    </tr>`).join('');
}

/* ─── FILTER FARMER ORDERS ──────────────────────────────── */

function filterFarmerOrders(status, evt) {
  const statusMap = {
    processing: 'confirmed',
    completed: 'delivered'
  };
  const mappedStatus = statusMap[status] || status;
  document.querySelectorAll('.admin-sub-tab-btn').forEach(b => b.classList.remove('active'));
  if (evt && evt.target) evt.target.classList.add('active');
  loadFarmerOrders(mappedStatus);
}

/* ─── SHOW ADD PRODUCT FORM ──────────────────────────────── */

function showAddProductForm() {
  showToast('Product form feature coming soon!', 'info');
  // This can be expanded to show a modal with product form
}

/* ─── EDIT FARMER STORE ──────────────────────────────────── */

function editFarmerStore() {
  showToast('Store editing feature coming soon!', 'info');
  // This can be expanded to show a modal with store form
}

/* ─── FARMER STORE PAGE (Public View) ────────────────────── */

async function showFarmerStore(farmerId) {
  const response = await apiGet(`products.php?action=get_farmer&id=${encodeURIComponent(farmerId)}`);
  if (!response.success) {
    showToast(response.message || 'Could not open farmer store.', 'error');
    return;
  }
  const farmer = response.farmer;
  const products = response.products || [];

  document.getElementById('farmer-store-info').innerHTML = `
    <div style="display:flex; gap:24px; flex-wrap:wrap; align-items:flex-start;">
      <img src="${getImageSrc(farmer.store_photo)}" alt="${farmer.store_name || farmer.full_name}"
        style="width:220px; height:220px; object-fit:cover; border-radius:18px; background:#f0f0f0;"
        onerror="this.src='${PLACEHOLDER_IMG}'" />
      <div style="flex:1; min-width:280px;">
        <h1 style="font-size:32px; margin-bottom:10px;">${farmer.store_name || farmer.full_name}</h1>
        <p style="color:#6b7280; margin-bottom:12px;">${farmer.bio || 'A trusted local farmer delivering fresh produce.'}</p>
        <p style="font-size:14px; color:#6b7280; margin-bottom:8px;"><strong>📍 Location:</strong> ${farmer.farm_location || 'N/A'}, ${farmer.province || ''}</p>
        <p style="font-size:14px; color:#6b7280; margin-bottom:8px;"><strong>⭐ Rating:</strong> ${(farmer.rating || 4.5).toFixed(1)}/5</p>
        <p style="font-size:14px; color:#6b7280;"><strong>📞 Contact:</strong> ${farmer.gcash_number || farmer.paymaya_number || 'Not available'}</p>
      </div>
    </div>`;

  document.getElementById('farmer-store-products').innerHTML = products.length
    ? products.map(p => productCard(p, true)).join('')
    : '<p style="text-align:center; color:var(--gray); padding:40px;">No products available from this shop yet.</p>';

  showPage('farmer-store');
}

