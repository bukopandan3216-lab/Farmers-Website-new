/* ============================================================
   FarmDirect - Buyer JS (buyer.js)
   Handles: buyer profile page, order history, checkout
   ============================================================ */

/* ─── RENDER BUYER PROFILE ───────────────────────────────── */

async function renderBuyerProfile() {
  if (!APP_USER || APP_USER.role !== 'buyer') {
    showToast('Buyer access only. Please login as a buyer.', 'error');
    showPage('login');
    return;
  }

  showPage('buyer-profile');

  const profileResponse = await apiGet(`products.php?action=get_buyer_profile&user_id=${APP_USER.id}`);
  const ordersResponse = await apiGet('products.php?action=get_buyer_orders');

  const info = document.getElementById('buyer-profile-info');
  if (info) {
    const profile = profileResponse.success ? profileResponse.profile : APP_USER;
    info.innerHTML = `
      <div style="margin-bottom:12px;">
        <div style="font-size:12px; color:var(--gray); text-transform:uppercase; margin-bottom:4px;">Full Name</div>
        <div style="font-size:16px;">${profile.full_name || APP_USER.full_name}</div>
      </div>
      <div style="margin-bottom:12px;">
        <div style="font-size:12px; color:var(--gray); text-transform:uppercase; margin-bottom:4px;">Email</div>
        <div style="font-size:16px;">${profile.email || APP_USER.email}</div>
      </div>
      <div style="margin-bottom:12px;">
        <div style="font-size:12px; color:var(--gray); text-transform:uppercase; margin-bottom:4px;">Contact</div>
        <div style="font-size:16px;">${profile.contact || APP_USER.contact || 'Not set'}</div>
      </div>
      <div style="margin-bottom:12px;">
        <div style="font-size:12px; color:var(--gray); text-transform:uppercase; margin-bottom:4px;">Delivery Address</div>
        <div style="font-size:16px;">${profile.delivery_address || APP_USER.delivery_address || 'Not set'}</div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div>
          <div style="font-size:12px; color:var(--gray); text-transform:uppercase; margin-bottom:4px;">City</div>
          <div style="font-size:16px;">${profile.city || APP_USER.city || 'N/A'}</div>
        </div>
        <div>
          <div style="font-size:12px; color:var(--gray); text-transform:uppercase; margin-bottom:4px;">Province</div>
          <div style="font-size:16px;">${profile.province || APP_USER.buyer_province || 'N/A'}</div>
        </div>
      </div>
    `;

    const editForm = document.getElementById('buyer-edit-form');
    if (editForm) {
      document.getElementById('edit-buyer-fullname').value = profile.full_name || APP_USER.full_name || '';
      document.getElementById('edit-buyer-email').value = profile.email || APP_USER.email || '';
      document.getElementById('edit-buyer-contact').value = profile.contact || APP_USER.contact || '';
      document.getElementById('edit-buyer-address').value = profile.delivery_address || APP_USER.delivery_address || '';
      document.getElementById('edit-buyer-city').value = profile.city || APP_USER.city || '';
      document.getElementById('edit-buyer-province').value = profile.province || APP_USER.buyer_province || '';
    }
  }

  const ordersEl = document.getElementById('buyer-orders');
  if (ordersEl) {
    if (ordersResponse.success && ordersResponse.orders && ordersResponse.orders.length > 0) {
      ordersEl.innerHTML = ordersResponse.orders.map(order => {
        const itemsHtml = (order.items || []).map(item => `
          <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #f3f4f6;">
            <div>
              <div style="font-weight:600;">${item.name}</div>
              <div style="font-size:13px; color:var(--gray);">Qty: ${item.qty} × ₱${parseFloat(item.unit_price).toFixed(2)}</div>
            </div>
            <div style="font-weight:700;">₱${parseFloat(item.subtotal).toFixed(2)}</div>
          </div>`).join('');

        return `
          <div style="background:white; padding:18px; border:1px solid #e5e7eb; border-radius:12px; margin-bottom:16px; text-align:left;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:12px;">
              <div>
                <strong>Order #${order.id}</strong>
                <div style="font-size:13px; color:var(--gray);">${new Date(order.created_at).toLocaleDateString()}</div>
              </div>
              <span style="background:${order.status === 'delivered' ? '#dcfce7' : '#fef3c7'}; color:${order.status === 'delivered' ? '#166534' : '#92400e'}; padding:6px 14px; border-radius:999px; font-size:12px; font-weight:700;">${order.status}</span>
            </div>
            <div style="margin-bottom:12px; font-size:14px; color:var(--gray);">
              <strong>Delivery:</strong> ${order.delivery_address || 'N/A'}<br/>
              <strong>Delivery Date:</strong> ${order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'TBD'}
            </div>
            <div style="background:#f8fafc; padding:14px; border-radius:10px; margin-bottom:12px;">
              ${itemsHtml}
            </div>
            <div style="display:flex; justify-content:space-between; font-weight:700;">
              <div>Total</div>
              <div>₱${parseFloat(order.grand_total).toFixed(2)}</div>
            </div>
          </div>`;
      }).join('');
    } else {
      ordersEl.innerHTML = '<p style="color:var(--gray); text-align:center;">No orders yet. Start shopping! 🛒</p>';
    }
  }

  const stats = {
    totalOrders: ordersResponse.success ? (ordersResponse.orders?.length || 0) : 0,
    totalSpent: ordersResponse.success ? (ordersResponse.orders?.reduce((sum, o) => sum + parseFloat(o.grand_total || 0), 0) || 0) : 0,
    memberDays: Math.floor((Date.now() - new Date(APP_USER.created_at || Date.now())) / (1000 * 60 * 60 * 24)),
  };

  if (document.getElementById('buyer-total-orders')) {
    document.getElementById('buyer-total-orders').textContent = stats.totalOrders;
  }
  if (document.getElementById('buyer-total-spent')) {
    document.getElementById('buyer-total-spent').textContent = `₱${stats.totalSpent.toFixed(2)}`;
  }
  if (document.getElementById('buyer-favorite-category')) {
    document.getElementById('buyer-favorite-category').textContent = profileResponse.success ? (profileResponse.profile.preferred_categories || 'None') : 'None';
  }
  if (document.getElementById('buyer-member-days')) {
    document.getElementById('buyer-member-days').textContent = stats.memberDays;
  }
}

function toggleBuyerEditForm(cancel = false) {
  const editForm = document.getElementById('buyer-edit-form');
  if (!editForm) return;
  if (cancel) {
    editForm.style.display = 'none';
    return;
  }
  editForm.style.display = editForm.style.display === 'none' || editForm.style.display === '' ? 'block' : 'none';
}

async function saveBuyerProfile() {
  const fullName = document.getElementById('edit-buyer-fullname').value.trim();
  const email = document.getElementById('edit-buyer-email').value.trim();
  const contact = document.getElementById('edit-buyer-contact').value.trim();
  const address = document.getElementById('edit-buyer-address').value.trim();
  const city = document.getElementById('edit-buyer-city').value.trim();
  const province = document.getElementById('edit-buyer-province').value.trim();

  if (!fullName || !email || !address || !city || !province) {
    showToast('Please complete all profile fields before saving.', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('action', 'update_buyer_profile');
  formData.append('full_name', fullName);
  formData.append('email', email);
  formData.append('contact', contact);
  formData.append('delivery_address', address);
  formData.append('city', city);
  formData.append('province', province);

  const response = await fetch('products.php', { method: 'POST', body: formData });
  const data = await response.json();

  if (data.success) {
    APP_USER.full_name = fullName;
    APP_USER.email = email;
    APP_USER.contact = contact;
    APP_USER.delivery_address = address;
    APP_USER.city = city;
    APP_USER.buyer_province = province;
    showToast('Profile updated successfully!', 'success');
    document.getElementById('buyer-edit-form').style.display = 'none';
    await renderBuyerProfile();
  } else {
    showToast(data.message || 'Could not update profile.', 'error');
  }
}

async function renderCheckoutPage() {
  if (!APP_USER || APP_USER.role !== 'buyer') {
    showToast('Please login to continue to checkout.', 'error');
    showPage('login');
    return;
  }

  if (STATE.cart.length === 0) {
    showToast('Your cart is empty.', 'error');
    showPage('cart');
    return;
  }

  showPage('checkout');

  const profileResponse = await apiGet('products.php?action=get_buyer_profile');
  if (profileResponse.success) {
    const profile = profileResponse.profile;
    document.getElementById('checkout-name').value = profile.full_name || APP_USER.full_name || '';
    document.getElementById('checkout-phone').value = profile.contact || APP_USER.contact || '';
    document.getElementById('checkout-address').value = profile.delivery_address || '';
    document.getElementById('checkout-city').value = profile.city || '';
    document.getElementById('checkout-province').value = profile.province || APP_USER.buyer_province || '';
  }

  const subtotal = STATE.cart.reduce((sum, x) => sum + x.price * x.qty, 0);
  const deliveryFee = 50;
  const total = subtotal + deliveryFee;
  document.getElementById('checkout-subtotal').textContent = `₱${subtotal.toFixed(2)}`;
  document.getElementById('checkout-total').textContent = `₱${total.toFixed(2)}`;
}

function showOrderConfirmation(order) {
  showPage('order-confirmation');
  const details = document.getElementById('order-confirmation-details');
  if (!details) return;
  const orderRef = order.order_id || order.id || 'N/A';

  details.innerHTML = `
    <div style="text-align:left; margin-bottom:20px;">
      <p><strong>Order Reference:</strong> #${orderRef}</p>
      <p><strong>Status:</strong> ${order.status}</p>
      <p><strong>Delivery Date:</strong> ${order.delivery_date || 'TBD'}</p>
      <p><strong>Delivery Address:</strong> ${order.delivery_address}</p>
      <p><strong>Grand Total:</strong> ₱${parseFloat(order.grand_total).toFixed(2)}</p>
    </div>
    <div style="background:#f8fafc; padding:16px; border-radius:12px;">
      ${(order.items || []).map(item => `
        <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
          <div>
            <div style="font-weight:700;">${item.name}</div>
            <div style="font-size:13px; color:var(--gray);">Qty: ${item.qty} × ₱${parseFloat(item.unit_price).toFixed(2)}</div>
          </div>
          <div>₱${parseFloat(item.subtotal).toFixed(2)}</div>
        </div>
      `).join('')}
    </div>
  `;
}

async function handleCheckout(event) {
  event.preventDefault();

  if (!APP_USER || APP_USER.role !== 'buyer') {
    showToast('Please login to checkout.', 'error');
    showPage('login');
    return;
  }

  if (STATE.cart.length === 0) {
    showToast('Your cart is empty!', 'error');
    return;
  }

  const name = document.getElementById('checkout-name').value.trim();
  const phone = document.getElementById('checkout-phone').value.trim();
  const address = document.getElementById('checkout-address').value.trim();
  const city = document.getElementById('checkout-city').value.trim();
  const province = document.getElementById('checkout-province').value.trim();

  if (!name || !phone || !address || !city || !province) {
    showToast('Please fill all required fields.', 'error');
    return;
  }

  const payload = STATE.cart.map(item => ({ product_id: item.id, qty: item.qty, name: item.name }));
  const formData = new FormData();
  formData.append('action', 'create_order');
  formData.append('items', JSON.stringify(payload));
  formData.append('name', name);
  formData.append('phone', phone);
  formData.append('address', address);
  formData.append('city', city);
  formData.append('province', province);

  const response = await fetch('products.php', { method: 'POST', body: formData });
  const data = await response.json();

  if (data.success) {
    STATE.cart = [];
    saveCart();
    updateCartBadge();
    renderCart();
    const order = (data.orders && data.orders.length > 0) ? data.orders[0] : {
      order_id: 'N/A',
      delivery_address: `${address}, ${city}, ${province}`,
      grand_total: data.grand_total || 0,
      status: 'pending',
      delivery_date: data.delivery_date || '',
      items: payload.map(item => ({ ...item, name: item.name || '' }))
    };
    showToast('Order completed successfully! Your order details are now in your profile.', 'success');
    showOrderConfirmation(order);
  } else {
    showToast(data.message || 'Error placing order.', 'error');
  }
}

