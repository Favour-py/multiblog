api.requireAuth();

document.getElementById('edit-pic').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (ev) => document.getElementById('edit-avatar').src = ev.target.result;
    reader.readAsDataURL(file);
  }
});

async function loadCurrentProfile() {
  try {
    const user = await api.me();
    document.getElementById('edit-firstname').value = user.first_name || '';
    document.getElementById('edit-lastname').value = user.last_name || '';
    document.getElementById('edit-bio').value = user.bio || '';
    if (user.profile_picture) {
      document.getElementById('edit-avatar').src = api.avatar(user.profile_picture);
    }
  } catch (_) {}
}

async function saveProfile() {
  const msg = document.getElementById('edit-msg');
  const btn = document.querySelector('.save-btn');
  btn.textContent = 'Saving...';
  btn.disabled = true;

  const formData = new FormData();
  formData.append('first_name', document.getElementById('edit-firstname').value.trim());
  formData.append('last_name', document.getElementById('edit-lastname').value.trim());
  formData.append('bio', document.getElementById('edit-bio').value.trim());

  const picFile = document.getElementById('edit-pic').files[0];
  if (picFile) formData.append('profile_picture', picFile);

  try {
    const res = await fetch('http://127.0.0.1:8000/api/auth/me/', {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${api.token()}` },
      body: formData
    });
    const data = await res.json();

    if (res.ok) {
      // Update localStorage with new profile data including picture URL
      const current = api.user();
      localStorage.setItem('user', JSON.stringify({ ...current, ...data }));
      msg.style.color = '#2ecc71';
      msg.textContent = '✓ Profile updated!';
      // Update avatar preview with actual saved URL
      if (data.profile_picture) {
        document.getElementById('edit-avatar').src = api.avatar(data.profile_picture);
      }
      btn.textContent = 'Save Changes';
      btn.disabled = false;
    } else {
      msg.style.color = '#e74c3c';
      msg.textContent = Object.values(data).flat().join(' ') || 'Update failed.';
      btn.textContent = 'Save Changes';
      btn.disabled = false;
    }
  } catch (_) {
    msg.style.color = '#e74c3c';
    msg.textContent = 'Network error.';
    btn.textContent = 'Save Changes';
    btn.disabled = false;
  }
}

document.addEventListener('DOMContentLoaded', loadCurrentProfile);
