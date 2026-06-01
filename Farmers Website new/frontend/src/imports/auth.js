/* ============================================================
   FarmDirect - Auth JS (auth.js)
   Handles: login, logout, farmer apply, buyer apply
   ============================================================ */

/* ─── LOGIN ──────────────────────────────────────────────── */

function handleLogin(event) {
  event.preventDefault();
  
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  if (!username || !password) {
    showToast('Please enter username and password.', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('action', 'login');
  formData.append('username', username);
  formData.append('password', password);

  fetch('auth.php', { method: 'POST', body: formData })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast('Login successful! Welcome back! 🎉', 'success');
        setTimeout(() => {
          window.location.href = 'index.php';
        }, 1000);
      } else {
        showToast(data.message || 'Login failed. Please try again.', 'error');
      }
    })
    .catch(err => {
      console.error('Login error:', err);
      showToast('An error occurred. Please try again.', 'error');
    });
}

/* ─── LOGOUT ─────────────────────────────────────────────── */

function logout() {
  fetch('auth.php?action=logout')
    .then(res => res.json())
    .then(data => {
      showToast('Logged out', 'success');
      setTimeout(() => {
        window.location.href = data.data?.redirect || 'index.php';
      }, 800);
    });
}

/* ─── APPLY TAB SWITCHER ─────────────────────────────────── */

function switchApplyTab(btn, formId) {
  document.querySelectorAll('.apply-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('farmer-form').style.display = formId === 'farmer-form' ? 'block' : 'none';
  document.getElementById('buyer-form').style.display = formId === 'buyer-form' ? 'block' : 'none';
}

/* ─── APPLY SUBMIT ───────────────────────────────────────── */

function handleApplySubmit(role) {
  const formData = new FormData();
  formData.append('action', 'apply_' + role);

  if (role === 'farmer') {
    formData.append('full_name', document.getElementById('farmer-fullname')?.value.trim() || '');
    formData.append('age', document.getElementById('farmer-age')?.value.trim() || '');
    formData.append('email', document.getElementById('farmer-email')?.value.trim() || '');
    formData.append('address', document.getElementById('farmer-address')?.value.trim() || '');
    formData.append('contact', document.getElementById('farmer-contact')?.value.trim() || '');
    formData.append('store_name', document.getElementById('farmer-store-name')?.value.trim() || '');
    formData.append('id_type', document.getElementById('farmer-id-type')?.value.trim() || '');
    formData.append('gcash', document.getElementById('farmer-gcash')?.value.trim() || '');
    formData.append('paymaya', document.getElementById('farmer-paymaya')?.value.trim() || '');
    formData.append('username', document.getElementById('farmer-username')?.value.trim() || '');
    formData.append('password', document.getElementById('farmer-password')?.value || '');
    formData.append('confirm_password', document.getElementById('farmer-confirm-password')?.value || '');

    const idFile = document.getElementById('farmer-id-photo')?.files[0];
    const photoFile = document.getElementById('farmer-store-photo')?.files[0];
    if (idFile) formData.append('id_photo', idFile);
    if (photoFile) formData.append('store_photo', photoFile);
  } else {
    formData.append('full_name', document.getElementById('buyer-fullname')?.value.trim() || '');
    formData.append('age', document.getElementById('buyer-age')?.value.trim() || '');
    formData.append('email', document.getElementById('buyer-email')?.value.trim() || '');
    formData.append('address', document.getElementById('buyer-address')?.value.trim() || '');
    formData.append('contact', document.getElementById('buyer-contact')?.value.trim() || '');
    formData.append('city', document.getElementById('buyer-city')?.value.trim() || '');
    formData.append('province', document.getElementById('buyer-province')?.value.trim() || '');
    formData.append('id_type', document.getElementById('buyer-id-type')?.value.trim() || '');
    formData.append('username', document.getElementById('buyer-username')?.value.trim() || '');
    formData.append('password', document.getElementById('buyer-password')?.value || '');
    formData.append('confirm_password', document.getElementById('buyer-confirm-password')?.value || '');

    const idFile = document.getElementById('buyer-id-photo')?.files[0];
    const photoFile = document.getElementById('buyer-face-photo')?.files[0];
    if (idFile) formData.append('id_photo', idFile);
    if (photoFile) formData.append('face_photo', photoFile);
  }

  fetch('auth.php', { method: 'POST', body: formData })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast(data.message || 'Application submitted successfully! Please wait for admin verification.', 'success');
        setTimeout(() => {
          showPage('login');
          document.getElementById(role === 'farmer' ? 'farmer-form' : 'buyer-form')?.querySelector('form')?.reset();
          document.getElementById(role === 'farmer' ? 'farmer-form' : 'buyer-form')?.querySelectorAll('input[type="file"]').forEach(input => input.value = '');
        }, 1500);
      } else {
        showToast(data.message || 'Application submission failed. Please try again.', 'error');
      }
    })
    .catch(err => {
      console.error('Apply error:', err);
      showToast('An error occurred. Please try again.', 'error');
    });
}
