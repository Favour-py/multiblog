api.requireAuth();

const params = new URLSearchParams(window.location.search);
const username = params.get('u') || api.user()?.username;
const me = api.user();
const isOwnProfile = me && me.username === username;

async function loadProfile() {
  try {
    const user = await api.getProfile(username);

    document.querySelector('.profile-name').textContent = `${user.first_name} ${user.last_name}`;
    document.querySelector('.profile-img').src = api.avatar(user.profile_picture);
    document.querySelector('.followers-counts').textContent = user.followers_count;
    document.querySelector('.following-counts').textContent = user.following_count;

    // inject bio
    const middle = document.querySelector('.middle');
    if (!document.getElementById('profile-bio')) {
      middle.insertAdjacentHTML('beforeend', `<p id="profile-bio" style="font-size:13px;color:#666;text-align:center;padding:0 20px;">${user.bio || ''}</p>`);
    }

    // follow / edit button
    if (!document.getElementById('follow-btn')) {
      const btn = document.createElement('button');
      btn.id = 'follow-btn';
      btn.style.cssText = 'margin:12px auto;display:block;padding:10px 32px;border-radius:20px;border:none;cursor:pointer;font-weight:600;font-size:14px;';
      middle.appendChild(btn);
    }
    const btn = document.getElementById('follow-btn');
    if (isOwnProfile) {
      btn.textContent = 'Edit Profile';
      btn.style.background = '#eee';
      btn.style.color = '#333';
      btn.onclick = () => window.location.href = url('edit_profile.html');
    } else {
      btn.textContent = user.is_following ? 'Unfollow' : 'Follow';
      btn.style.background = user.is_following ? '#eee' : '#6c63ff';
      btn.style.color = user.is_following ? '#333' : '#fff';
      btn.onclick = () => toggleFollow(username, btn);
    }

    loadUserPosts(user.id);
  } catch (_) {}
}

async function toggleFollow(username, btn) {
  try {
    const data = await api.follow(username);
    const following = data.status === 'followed';
    btn.textContent = following ? 'Unfollow' : 'Follow';
    btn.style.background = following ? '#eee' : '#6c63ff';
    btn.style.color = following ? '#333' : '#fff';
    document.querySelector('.followers-counts').textContent = data.followers_count;
  } catch (_) {}
}

async function loadUserPosts(userId) {
  const container = document.querySelector('.posts-ctn');
  if (!container) return;
  try {
    const posts = await api.getPosts(`?author=${userId}`);
    document.querySelector('.post-counts').textContent = posts.length;
    container.innerHTML = posts.length
      ? posts.map(p => `
        <div class="post-con">
          <div class="post1">
            <div class="post-content">
              <p class="post-title">${p.title}</p>
              <p style="font-size:13px;color:#555;">${p.content.substring(0, 150)}...</p>
              ${p.image ? `<img class="post-image" src="http://127.0.0.1:8000${p.image}" alt="">` : ''}
            </div>
            <div class="down-section">
              <div class="like-count-ctn"><img src="heart.svg" alt=""><p>${p.likes_count}</p></div>
              <div class="comment-count-ctn"><img src="icons.svg" alt=""><p>${p.comments_count}</p></div>
              <div class="share-count-ctn"><img src="icons (1).svg" alt=""><p>${p.shares_count}</p></div>
            </div>
          </div>
        </div>`).join('')
      : '<p style="text-align:center;color:#888;padding:30px;">No posts yet.</p>';
  } catch (_) {}
}

document.addEventListener('DOMContentLoaded', loadProfile);
