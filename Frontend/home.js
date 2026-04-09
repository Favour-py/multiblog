api.requireAuth();

const feed = document.querySelector('.posts-ctn');
const storiesRow = document.querySelector('.profiles');

// ── Render stories (following users) ──────────────────────────────────────
async function loadStories() {
  const me = api.user();
  if (!me || !storiesRow) return;
  try {
    const users = await api.getFollowing(me.username);
    if (!users.length) return;
    storiesRow.innerHTML = users.slice(0, 6).map(u => `
      <div class="profile-1" onclick="window.location.href='profile.html?u=${u.username}'">
        <img src="${api.avatar(u.profile_picture)}" alt="${u.username}" style="width:48px;height:48px;border-radius:50%;object-fit:cover;cursor:pointer;">
        <p style="font-size:11px;text-align:center;margin-top:4px;">${u.username}</p>
      </div>`).join('');
  } catch (_) {}
}

// ── Render a single post card ──────────────────────────────────────────────
function postCard(p) {
  const me = api.user();
  const isOwner = me && String(p.author.id) === String(me.id);
  return `
  <div class="post-con" id="post-${p.id}">
    <div class="post1">
      <div class="top1">
        <div class="top-left1">
          <div class="p1-profile" onclick="window.location.href='profile.html?u=${p.author.username}'" style="cursor:pointer;">
            <img src="${api.avatar(p.author.profile_picture)}" alt="${p.author.username}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;">
          </div>
          <div class="top-left1-info">
            <p class="name1">${p.author.first_name || p.author.username}</p>
            <div class="active-status-flex">
              <p class="active-status">${api.timeAgo(p.created_at)}</p>
            </div>
          </div>
        </div>
        <div class="top-right1">
          ${isOwner ? `<span onclick="event.stopPropagation();deletePost('${p.id}')" style="cursor:pointer;color:#e74c3c;font-size:12px;">Delete</span>` : ''}
        </div>
      </div>
      <div class="post-content">
        <p class="post-title">${p.title}</p>
        <p style="font-size:13px;color:#555;margin:4px 0 8px;">${p.content.substring(0, 200)}${p.content.length > 200 ? '...' : ''}</p>
        ${p.image ? `<img class="post-image" src="http://127.0.0.1:8000${p.image}" alt="post image">` : ''}
      </div>
      <div class="down-section">
        <div class="like-count-ctn" onclick="event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();toggleLike('${p.id}');return false;" style="cursor:pointer;">
          <img src="heart.svg" alt="like" style="${p.is_liked ? 'filter:invert(27%) sepia(90%) saturate(700%) hue-rotate(320deg)' : ''}">
          <p class="like-count" id="likes-${p.id}">${p.likes_count}</p>
        </div>
        <div class="comment-count-ctn" onclick="event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();toggleComments('${p.id}');return false;" style="cursor:pointer;">
          <img src="icons.svg" alt="comment">
          <p class="comment-count">${p.comments_count}</p>
        </div>
        <div class="share-count-ctn" onclick="event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();sharePost('${p.id}');return false;" style="cursor:pointer;">
          <img src="icons (1).svg" alt="share">
          <p class="share-count" id="shares-${p.id}">${p.shares_count}</p>
        </div>
      </div>
      <div class="comments-panel" id="comments-${p.id}" style="display:none;padding:10px 0;">
        <div class="comments-list" id="comments-list-${p.id}"></div>
        <div style="display:flex;gap:8px;margin-top:8px;">
          <input type="text" id="comment-input-${p.id}" placeholder="Write a comment..." style="flex:1;padding:8px;border-radius:20px;border:1px solid #ddd;outline:none;">
          <button onclick="submitComment('${p.id}')" style="padding:8px 16px;border-radius:20px;background:#6c63ff;color:#fff;border:none;cursor:pointer;">Post</button>
        </div>
      </div>
    </div>
  </div>`;
}

function commentHTML(c, postId) {
  return `
  <div style="display:flex;gap:8px;margin-bottom:10px;" id="comment-${c.id}">
    <img src="${api.avatar(c.author?.profile_picture)}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">
    <div style="flex:1;">
      <p style="font-weight:600;font-size:13px;margin:0;">${c.author?.username || 'User'}</p>
      <p style="font-size:13px;margin:2px 0;">${c.content}</p>
      <div style="display:flex;gap:12px;font-size:11px;color:#888;">
        <span>${api.timeAgo(c.created_at)}</span>
        <span onclick="showReplyInput('${c.id}','${postId}')" style="cursor:pointer;">Reply</span>
      </div>
      ${c.replies?.length ? `<div style="margin-left:16px;margin-top:6px;">${c.replies.map(r => commentHTML(r, postId)).join('')}</div>` : ''}
      <div id="reply-input-${c.id}" style="display:none;margin-top:6px;display:none;">
        <input type="text" id="reply-text-${c.id}" placeholder="Write a reply..." style="padding:6px;border-radius:16px;border:1px solid #ddd;width:80%;outline:none;">
        <button onclick="submitReply('${c.id}','${postId}')" style="padding:6px 12px;border-radius:16px;background:#6c63ff;color:#fff;border:none;cursor:pointer;margin-left:4px;">Reply</button>
      </div>
    </div>
  </div>`;
}

// ── Load posts ─────────────────────────────────────────────────────────────
async function loadPosts() {
  try {
    const posts = await api.getPosts();
    feed.innerHTML = posts.length
      ? posts.map(postCard).join('')
      : '<p style="text-align:center;color:#888;padding:40px;">No posts yet. Be the first!</p>';
  } catch (_) {
    feed.innerHTML = '<p style="text-align:center;color:red;padding:20px;">Failed to load posts.</p>';
  }
}

// ── Like / Unlike ──────────────────────────────────────────────────────────
async function toggleLike(postId) {
  try {
    const data = await api.likePost(postId);
    document.getElementById(`likes-${postId}`).textContent = data.likes_count;
    const heart = document.querySelector(`#post-${postId} .like-count-ctn img`);
    heart.style.filter = data.status === 'liked'
      ? 'invert(27%) sepia(90%) saturate(700%) hue-rotate(320deg)' : '';
  } catch (_) {}
}

// ── Share ──────────────────────────────────────────────────────────────────
async function sharePost(postId) {
  try {
    const data = await api.sharePost(postId);
    document.getElementById(`shares-${postId}`).textContent = data.shares_count;
  } catch (_) {}
}

// ── Delete ─────────────────────────────────────────────────────────────────
async function deletePost(postId) {
  if (!confirm('Delete this post?')) return;
  try {
    await api.delete(`/posts/posts/${postId}/`);
    document.getElementById(`post-${postId}`).remove();
  } catch (_) {}
}

// ── Comments panel ─────────────────────────────────────────────────────────
async function toggleComments(postId) {
  const panel = document.getElementById(`comments-${postId}`);
  const isOpen = panel.style.display !== 'none';
  panel.style.display = isOpen ? 'none' : 'block';
  if (!isOpen) {
    const list = document.getElementById(`comments-list-${postId}`);
    list.innerHTML = '<p style="font-size:12px;color:#888;">Loading...</p>';
    try {
      const comments = await api.getComments(postId);
      list.innerHTML = comments.length
        ? comments.filter(c => !c.reply_to).map(c => commentHTML(c, postId)).join('')
        : '<p style="font-size:12px;color:#888;">No comments yet.</p>';
    } catch (_) { list.innerHTML = ''; }
  }
}

async function submitComment(postId) {
  const input = document.getElementById(`comment-input-${postId}`);
  const content = input.value.trim();
  if (!content) return;
  try {
    await api.addComment(postId, content);
    input.value = '';
    // reload comments
    const list = document.getElementById(`comments-list-${postId}`);
    const comments = await api.getComments(postId);
    list.innerHTML = comments.filter(c => !c.reply_to).map(c => commentHTML(c, postId)).join('');
  } catch (_) {}
}

function showReplyInput(commentId, postId) {
  const div = document.getElementById(`reply-input-${commentId}`);
  div.style.display = div.style.display === 'none' ? 'flex' : 'none';
}

async function submitReply(commentId, postId) {
  const input = document.getElementById(`reply-text-${commentId}`);
  const content = input.value.trim();
  if (!content) return;
  try {
    await api.addComment(postId, content, commentId);
    input.value = '';
    const list = document.getElementById(`comments-list-${postId}`);
    const comments = await api.getComments(postId);
    list.innerHTML = comments.filter(c => !c.reply_to).map(c => commentHTML(c, postId)).join('');
  } catch (_) {}
}

// ── New Post modal ─────────────────────────────────────────────────────────
function openNewPostModal() {
  document.getElementById('new-post-modal').style.display = 'flex';
}
function closeNewPostModal() {
  document.getElementById('new-post-modal').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
  loadStories();
  loadPosts();
  // Poll for count updates every 10 seconds without re-rendering
  setInterval(async () => {
    try {
      const posts = await api.getPosts();
      posts.forEach(p => {
        const likesEl = document.getElementById(`likes-${p.id}`);
        const sharesEl = document.getElementById(`shares-${p.id}`);
        if (likesEl) likesEl.textContent = p.likes_count;
        if (sharesEl) sharesEl.textContent = p.shares_count;
      });
    } catch (_) {}
  }, 10000);
});

async function submitNewPost() {
  const title = document.getElementById('post-title').value.trim();
  const content = document.getElementById('post-content').value.trim();
  const category = document.getElementById('post-category').value;
  const errEl = document.getElementById('post-error');
  errEl.textContent = '';
  try {
    await api.createPost({ title, content, category });
    closeNewPostModal();
    document.getElementById('post-title').value = '';
    document.getElementById('post-content').value = '';
    loadPosts();
  } catch (err) {
    const errors = Object.values(err).flat().join(' ');
    errEl.textContent = errors || 'Failed to create post.';
  }
}
