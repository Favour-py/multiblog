document.addEventListener('DOMContentLoaded', async () => {
  const page = window.location.pathname.split('/').pop() || 'home.html';
  const me = api.user();

  const nav = document.createElement('nav');
  nav.className = 'bottom-nav';
  nav.innerHTML = `
    <a href="${url('home.html')}" class="${page === 'home.html' || page === 'home' ? 'active' : ''}">
      <img src="Vector (5).svg" alt="home">
      <span>Home</span>
    </a>
    <a href="${url('message.html')}" class="${page === 'message.html' || page === 'messages' ? 'active' : ''}">
      <img src="Vector (6).svg" alt="messages">
      <span>Messages</span>
    </a>
    <a href="${url('profile.html')}?u=${me?.username || ''}" class="${page === 'profile.html' || page === 'profile' ? 'active' : ''}">
      <img id="nav-avatar" src="${api.avatar(me?.profile_picture)}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;" alt="profile">
      <span>Profile</span>
    </a>
  `;
  document.body.appendChild(nav);
  document.body.style.paddingBottom = '70px';

  // Fetch fresh user data to update profile picture
  if (api.token()) {
    try {
      const fresh = await api.me();
      // Update localStorage with latest data
      const current = api.user();
      localStorage.setItem('user', JSON.stringify({ ...current, ...fresh }));
      // Update navbar avatar
      const navAvatar = document.getElementById('nav-avatar');
      if (navAvatar && fresh.profile_picture) {
        navAvatar.src = api.avatar(fresh.profile_picture);
      }
    } catch (_) {}
  }
});
