api.requireAuth();

async function loadConversations() {
  const list = document.querySelector('.chat-list');
  if (!list) return;
  try {
    const convs = await api.getConversations();
    const me = api.user();
    if (!convs.length) {
      list.innerHTML = '<p style="text-align:center;color:#888;padding:20px;">No conversations yet.</p>';
      return;
    }
    list.innerHTML = convs.map(conv => {
      const other = conv.participants.find(p => p.id !== me.id) || conv.participants[0];
      const lastMsg = conv.last_message;
      const unread = conv.unread_count;
      return `
      <div class="chat1" onclick="window.location.href=url('chats.html')+'?conv=${conv.id}&u=${other.username}'" style="cursor:pointer;">
        <img src="${api.avatar(other.profile_picture)}" alt="${other.username}" style="width:48px;height:48px;border-radius:50%;object-fit:cover;">
        <div class="chat-list-div">
          <p class="sender-name">${other.username}</p>
          <p class="latest-message">${lastMsg ? lastMsg.content.substring(0, 40) : 'Start a conversation'}</p>
        </div>
        <div class="chat1-right">
          <p class="chat-time">${lastMsg ? api.timeAgo(lastMsg.created_at) : ''}</p>
          ${unread ? `<span style="background:#6c63ff;color:#fff;border-radius:50%;padding:2px 7px;font-size:11px;">${unread}</span>` : ''}
        </div>
      </div>`;
    }).join('');
  } catch (_) {}
}

// New conversation button
function injectNewChatBtn() {
  if (document.getElementById('new-chat-btn')) return;
  document.body.insertAdjacentHTML('beforeend', `
    <button id="new-chat-btn" onclick="openNewChat()" style="position:fixed;bottom:80px;right:20px;background:#6c63ff;color:#fff;border:none;border-radius:50%;width:52px;height:52px;font-size:24px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.2);z-index:999;">✉</button>
    <div id="new-chat-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;align-items:center;justify-content:center;">
      <div style="background:#fff;border-radius:16px;padding:24px;width:85%;max-width:360px;">
        <h3 style="margin:0 0 16px;">New Message</h3>
        <input id="new-chat-username" placeholder="Enter username..." style="width:100%;padding:10px;border-radius:8px;border:1px solid #ddd;box-sizing:border-box;">
        <p id="new-chat-err" style="color:red;font-size:12px;margin-top:6px;"></p>
        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;">
          <button onclick="document.getElementById('new-chat-modal').style.display='none'" style="padding:10px 20px;border-radius:8px;border:1px solid #ddd;cursor:pointer;">Cancel</button>
          <button onclick="startChat()" style="padding:10px 20px;border-radius:8px;background:#6c63ff;color:#fff;border:none;cursor:pointer;">Start</button>
        </div>
      </div>
    </div>`);
}

function openNewChat() {
  document.getElementById('new-chat-modal').style.display = 'flex';
}

async function startChat() {
  const username = document.getElementById('new-chat-username').value.trim();
  const err = document.getElementById('new-chat-err');
  err.textContent = '';
  try {
    const conv = await api.startConversation(username);
    window.location.href = url('chats.html') + `?conv=${conv.id}&u=${username}`;
  } catch (e) {
    err.textContent = e.error || 'User not found.';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadConversations();
  injectNewChatBtn();
});
