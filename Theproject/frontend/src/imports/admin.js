/* ============================================================
   FarmDirect - Admin JS (admin.js)
   Handles: admin panel, user management, products, orders, reports
   ============================================================ */

let currentAdminApplicantRole = 'farmer';

/* ─── SHOW ADMIN PANEL ───────────────────────────────────── */

async function showAdminPanel() {
  if (!APP_USER || APP_USER.role !== 'admin') {
    showToast('Admin access only.', 'error');
    showPage('home');
    return;
  }
  window.location.href = 'admin.php';
}

/* ─── SWITCH ADMIN TABS ──────────────────────────────────── */

function switchAdminTab(tabName, evt) {
  // Hide all tabs
  document.querySelectorAll('.admin-tab-content').forEach(tab => tab.style.display = 'none');
  
  // Remove active state from all buttons
  document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
  
  // Show selected tab
  const tabEl = document.getElementById(`admin-tab-${tabName}`);
  if (tabEl) tabEl.style.display = 'block';
  
  // Add active state to clicked button
  if (evt && evt.target) evt.target.classList.add('active');
  
  // Load data for the tab
  if (tabName === 'users') loadAllUsers('all');
  if (tabName === 'products') loadAllProducts();
  if (tabName === 'orders') loadAllOrders();
  if (tabName === 'reports') loadReports();
}

/* ─── UPDATE ADMIN DASHBOARD ────────────────────────────── */

async function updateAdminDashboard() {
  // Get dashboard stats
  const response = await apiGet('products.php?action=get_admin_dashboard_stats');
  if (!response.success) return;

  const stats = response.data || {};
  
  // Update counts
  document.getElementById('count-pending-farmers').textContent = stats.pending_farmers || 0;
  document.getElementById('count-pending-buyers').textContent = stats.pending_buyers || 0;
  
  // Update products tab stats
  document.getElementById('stat-total-products').textContent = stats.total_products || 0;
  document.getElementById('stat-low-stock').textContent = stats.low_stock || 0;
  document.getElementById('stat-total-revenue').textContent = `₱${(stats.total_revenue || 0).toFixed(2)}`;
  
  // Update orders tab stats
  document.getElementById('stat-total-orders').textContent = stats.total_orders || 0;
  document.getElementById('stat-pending-orders').textContent = stats.pending_orders || 0;
  document.getElementById('stat-admin-commission').textContent = `₱${((stats.total_revenue || 0) * 0.05).toFixed(2)}`;
  
  // Update reports tab stats
  document.getElementById('stat-active-farmers').textContent = stats.active_farmers || 0;
  document.getElementById('stat-active-buyers').textContent = stats.active_buyers || 0;
  document.getElementById('stat-total-categories').textContent = stats.total_categories || 0;
  document.getElementById('stat-total-sales').textContent = `₱${(stats.total_revenue || 0).toFixed(2)}`;
}

/* ─── LOAD PENDING APPLICANTS ────────────────────────────── */

async function loadPendingApplicants(role = 'farmer') {
  const response = await apiGet(`products.php?action=get_pending_applicants&role=${role}`);
  if (!response.success) {
    document.getElementById('admin-applicants-list').innerHTML = '<p>Could not load applicants.</p>';
    return;
  }
  const applicants = response.applicants || [];
  if (applicants.length === 0) {
    document.getElementById('admin-applicants-list').innerHTML = `<p>✓ No pending ${role} applications. All ${role}s are verified!</p>`;
    return;
  }
  
  document.getElementById('admin-applicants-list').innerHTML = applicants.map(app => `
    <div class="applicant-card" style="background:white; padding:20px; border-radius:12px; border:1px solid #e5e7eb; display:grid; grid-template-columns:auto 1fr auto; gap:20px; align-items:start;">
      <div>
        <img src="${getImageSrc(app.id_photo)}" alt="${app.full_name}" onerror="this.src='${PLACEHOLDER_IMG}'" style="width:100px; height:100px; border-radius:8px; object-fit:cover;" />
      </div>
      <div>
        <h3 style="font-size:18px; margin-bottom:8px;">${app.full_name}</h3>
        <p style="margin:4px 0;"><strong>Email:</strong> ${app.email}</p>
        <p style="margin:4px 0;"><strong>Username:</strong> ${app.username}</p>
        <p style="margin:4px 0;"><strong>Role:</strong> <span style="background:#e0e7ff; color:#3730a3; padding:2px 8px; border-radius:4px; font-weight:600;">${app.role}</span></p>
        <p style="margin:4px 0;"><strong>Applied:</strong> ${new Date(app.created_at).toLocaleDateString()}</p>
        ${app.role === 'farmer' ? `<p style="margin:4px 0;"><strong>Farm Location:</strong> ${app.farm_location || 'N/A'}</p>` : ''}
      </div>
      <div style="display:flex; flex-direction:column; gap:8px;">
        <button class="submit-btn" style="background:#10b981; border:none; cursor:pointer; padding:8px 16px; font-size:14px; white-space:nowrap;" onclick="showUserDetailsModal(${app.id}, 'verify')">View Details</button>
        <button class="submit-btn" style="background:#ef4444; border:none; cursor:pointer; padding:8px 16px; font-size:14px; white-space:nowrap;" onclick="verifyApplicant(${app.id}, 'reject')">Reject</button>
      </div>
    </div>`).join('');
}

/* ─── FILTER APPLICANTS BY ROLE ──────────────────────────── */

function filterApplicants(role, evt) {
  currentAdminApplicantRole = role;
  document.querySelectorAll('.admin-sub-tab-btn').forEach(b => b.classList.remove('active'));
  if (evt && evt.target) evt.target.classList.add('active');
  loadPendingApplicants(role);
}

/* ─── LOAD ALL USERS ────────────────────────────────────── */

async function loadAllUsers(filter = 'all') {
  const response = await apiGet(`products.php?action=get_all_users&filter=${filter}`);
  if (!response.success) {
    document.getElementById('admin-users-list').innerHTML = '<tr><td colspan="7">Could not load users.</td></tr>';
    return;
  }
  
  const users = response.users || [];
  if (users.length === 0) {
    document.getElementById('admin-users-list').innerHTML = '<tr><td colspan="7" style="padding:20px; text-align:center; color:var(--gray);">No users found</td></tr>';
    return;
  }
  
  document.getElementById('admin-users-list').innerHTML = users.map(user => `
    <tr style="border-bottom:1px solid #e5e7eb;">
      <td style="padding:12px;">${user.id}</td>
      <td style="padding:12px;">${user.full_name}</td>
      <td style="padding:12px;">${user.email}</td>
      <td style="padding:12px;"><span style="background:#dbeafe; color:#1e40af; padding:4px 12px; border-radius:6px; font-weight:600; font-size:12px;">${user.role}</span></td>
      <td style="padding:12px;"><span style="background:${user.status === 'active' ? '#ecfdf5' : '#fee2e2'}; color:${user.status === 'active' ? '#047857' : '#991b1b'}; padding:4px 12px; border-radius:6px; font-weight:600; font-size:12px;">${user.status}</span></td>
      <td style="padding:12px;">${new Date(user.created_at).toLocaleDateString()}</td>
      <td style="padding:12px; text-align:center;">
        <button style="background:none; border:none; cursor:pointer; color:#3b82f6; text-decoration:underline;" onclick="showUserDetailsModal(${user.id}, 'view')">View</button>
      </td>
    </tr>`).join('');
}

/* ─── FILTER USERS ──────────────────────────────────────── */

function filterUsers(filter, evt) {
  document.querySelectorAll('.admin-sub-tab-btn').forEach(b => b.classList.remove('active'));
  if (evt && evt.target) evt.target.classList.add('active');
  loadAllUsers(filter);
}

/* ─── SHOW USER DETAILS MODAL ──────────────────────────── */

async function showUserDetailsModal(userId, action) {
  const response = await apiGet(`products.php?action=get_user_details&user_id=${userId}`);
  if (!response.success) {
    showToast('Could not load user details.', 'error');
    return;
  }
  
  const user = response.user || {};
  const modal = document.getElementById('user-details-modal');
  
  // Populate modal
  document.getElementById('user-modal-name').textContent = user.full_name;
  document.getElementById('user-modal-email').textContent = user.email;
  document.getElementById('user-modal-role').textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
  document.getElementById('user-modal-status').textContent = user.status.charAt(0).toUpperCase() + user.status.slice(1);
  document.getElementById('user-modal-date').textContent = new Date(user.created_at).toLocaleDateString();
  
  // Set photos
  document.getElementById('user-modal-photo').src = getImageSrc(user.face_photo || user.store_photo || user.profile_pic);
  const idPhoto = user.buyer_id_photo || user.farmer_id_photo || user.id_photo || user.store_photo;
  document.getElementById('user-modal-id').src = getImageSrc(idPhoto);
  
  // Extra info based on role
  let extraInfo = '';
  if (user.role === 'farmer') {
    const analyticsRows = (user.analytics || []).map(row => `
      <tr>
        <td>${row.month}/${row.year}</td>
        <td>₱${parseFloat(row.total_sales).toFixed(2)}</td>
        <td>${row.total_orders}</td>
        <td>${parseFloat(row.avg_rating).toFixed(2)}</td>
      </tr>
    `).join('');

    extraInfo = `
      <p><strong>Store Name:</strong> ${user.store_name || 'N/A'}</p>
      <p><strong>Farm Location:</strong> ${user.farm_location || 'N/A'}</p>
      <p><strong>Province:</strong> ${user.farm_province || 'N/A'}</p>
      <p><strong>Bio:</strong> ${user.bio || 'N/A'}</p>
      <p><strong>Active Products:</strong> ${user.product_count || 0}</p>
      <p><strong>Total Orders:</strong> ${user.total_orders || 0}</p>
      <p><strong>Total Revenue:</strong> ₱${parseFloat(user.total_revenue || 0).toFixed(2)}</p>
      <p><strong>Average Rating:</strong> ${parseFloat(user.avg_rating || 0).toFixed(2)}</p>
      <div style="margin-top:24px;">
        <h3 style="margin-bottom:12px;">Farmer Analytics (last 12 months)</h3>
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr style="background:#f3f4f6; text-align:left;">
              <th style="padding:8px;">Month</th>
              <th style="padding:8px;">Sales</th>
              <th style="padding:8px;">Orders</th>
              <th style="padding:8px;">Rating</th>
            </tr>
          </thead>
          <tbody>
            ${analyticsRows || '<tr><td colspan="4" style="padding:12px; color:var(--gray);">No analytics data available.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  } else if (user.role === 'buyer') {
    extraInfo = `
      <p><strong>City:</strong> ${user.buyer_city || 'N/A'}</p>
      <p><strong>Province:</strong> ${user.buyer_province || 'N/A'}</p>
      <p><strong>Delivery Address:</strong> ${user.delivery_address || 'N/A'}</p>
      <p><strong>Total Orders:</strong> ${user.order_count || 0}</p>
      <p><strong>Total Spent:</strong> ₱${parseFloat(user.total_spent || 0).toFixed(2)}</p>
    `;
  }
  document.getElementById('user-modal-extra-info').innerHTML = extraInfo;
  
  // Action buttons
  let actionButtons = '';
  if (action === 'verify' && user.status === 'pending') {
    actionButtons = `
      <button class="submit-btn" style="background:#10b981; flex:1;" onclick="verifyApplicant(${userId}, 'approve')">✓ Approve Application</button>
      <button class="submit-btn" style="background:#ef4444; flex:1;" onclick="verifyApplicant(${userId}, 'reject')">✗ Reject Application</button>
    `;
  } else {
    actionButtons = `<button class="submit-btn" style="flex:1;" onclick="closeUserModal()">Close</button>`;
  }
  document.getElementById('user-modal-actions').innerHTML = actionButtons;
  
  modal.style.display = 'flex';
}

/* ─── CLOSE USER MODAL ──────────────────────────────────── */

function closeUserModal() {
  document.getElementById('user-details-modal').style.display = 'none';
}

/* ─── VERIFY / REJECT APPLICANT ──────────────────────────── */

async function verifyApplicant(userId, action) {
  const confirmed = confirm(`Are you sure you want to ${action} this application?`);
  if (!confirmed) return;

  const formData = new FormData();
  formData.append('action', 'verify_applicant');
  formData.append('user_id', userId);
  formData.append('status', action === 'approve' ? 'active' : 'rejected');

  const response = await fetch('products.php', { method: 'POST', body: formData });
  const data = await response.json();

  if (data.success) {
    showToast(`Application ${action}ed successfully!`, 'success');
    closeUserModal();
    // Reload verification tab
    loadPendingApplicants(currentAdminApplicantRole || 'farmer');
  } else {
    showToast(data.message || 'Error processing application.', 'error');
  }
}

/* ─── LOAD ALL PRODUCTS ────────────────────────────────── */

let allProducts = [];

async function loadAllProducts() {
  const response = await apiGet('products.php?action=get_all_products');
  if (!response.success) {
    document.getElementById('admin-products-list').innerHTML = '<p>Could not load products.</p>';
    return;
  }
  
  allProducts = response.products || [];
  filterAdminProducts();
}

function filterAdminProducts() {
  const searchTerm = document.getElementById('admin-product-search').value.toLowerCase();
  const sortBy = document.getElementById('admin-product-sort').value;
  
  let filtered = allProducts.filter(prod => 
    prod.name.toLowerCase().includes(searchTerm) || 
    prod.store_name.toLowerCase().includes(searchTerm) ||
    prod.category.toLowerCase().includes(searchTerm)
  );
  
  // Sort
  filtered.sort((a, b) => {
    switch(sortBy) {
      case 'name-asc': return a.name.localeCompare(b.name);
      case 'name-desc': return b.name.localeCompare(a.name);
      case 'newest': return new Date(b.created_at) - new Date(a.created_at);
      case 'oldest': return new Date(a.created_at) - new Date(b.created_at);
      case 'farmer-asc': return (a.store_name || '').localeCompare(b.store_name || '');
      case 'farmer-desc': return (b.store_name || '').localeCompare(a.store_name || '');
      default: return 0;
    }
  });
  
  if (filtered.length === 0) {
    document.getElementById('admin-products-list').innerHTML = '<p>No products found.</p>';
    return;
  }
  
  document.getElementById('admin-products-list').innerHTML = filtered.map(prod => `
    <div style="background:white; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden;">
      <img src="${getImageSrc(prod.photo)}" alt="${prod.name}" onerror="this.src='${PLACEHOLDER_IMG}'" style="width:100%; height:200px; object-fit:cover;"/>
      <div style="padding:16px;">
        <h3 style="font-weight:bold; margin-bottom:8px;">${prod.name}</h3>
        <p style="color:var(--gray); font-size:14px; margin-bottom:8px;">by ${prod.store_name || 'Unknown'}</p>
        <p style="font-size:18px; font-weight:bold; color:#10b981; margin-bottom:8px;">₱${parseFloat(prod.price).toFixed(2)}</p>
        <p style="color:var(--gray); font-size:14px;">Stock: <strong>${prod.stock_qty}</strong></p>
      </div>
    </div>`).join('');
}

/* ─── LOAD ALL ORDERS ───────────────────────────────────── */

async function loadAllOrders() {
  const response = await apiGet('products.php?action=get_all_orders');
  if (!response.success) {
    document.getElementById('admin-orders-list').innerHTML = '<tr><td colspan="6">Could not load orders.</td></tr>';
    return;
  }
  
  const orders = response.orders || [];
  if (orders.length === 0) {
    document.getElementById('admin-orders-list').innerHTML = '<tr><td colspan="6" style="padding:20px; text-align:center; color:var(--gray);">No orders yet</td></tr>';
    return;
  }
  
  document.getElementById('admin-orders-list').innerHTML = orders.map(order => `
    <tr style="border-bottom:1px solid #e5e7eb;">
      <td style="padding:12px;">#${order.id}</td>
      <td style="padding:12px;">${order.buyer_name}</td>
      <td style="padding:12px;">₱${parseFloat(order.total_amount).toFixed(2)}</td>
      <td style="padding:12px;"><span style="background:#fef3c7; color:#92400e; padding:4px 12px; border-radius:6px; font-weight:600; font-size:12px;">${order.status}</span></td>
      <td style="padding:12px;">${new Date(order.created_at).toLocaleDateString()}</td>
      <td style="padding:12px; text-align:center;">
        <button style="background:none; border:none; cursor:pointer; color:#3b82f6; text-decoration:underline;" onclick="showOrderDetails(${order.id})">View</button>
      </td>
    </tr>`).join('');
}

/* ─── LOAD REPORTS ──────────────────────────────────────── */

async function loadReports() {
  const response = await apiGet('products.php?action=get_admin_reports');
  if (!response.success) {
    document.getElementById('admin-activity-log').innerHTML = '<p>Could not load reports.</p>';
    return;
  }
  
  const activities = response.activities || [];
  document.getElementById('admin-activity-log').innerHTML = activities.length ? activities.map(act => `
    <div style="padding:12px; background:white; border-radius:8px; border-left:3px solid #3b82f6;">
      <p style="margin:0; font-weight:600;">${act.activity}</p>
      <p style="margin:4px 0 0 0; color:var(--gray); font-size:14px;">${new Date(act.created_at).toLocaleString()}</p>
    </div>`).join('') : '<p style="color:var(--gray);">No recent activity</p>';
}

/* ─── SHOW ORDER DETAILS ────────────────────────────────── */

async function showOrderDetails(orderId) {
  const response = await apiGet(`products.php?action=get_order_details&order_id=${orderId}`);
  if (!response.success) {
    showToast('Could not load order details.', 'error');
    return;
  }
  // This can trigger a modal or navigate to detailed view
  alert(`Order #${orderId} Details\n\nImplement detailed order view modal here.`);
}
