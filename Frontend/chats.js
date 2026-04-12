api.requireAuth();

const params = new URLSearchParams(window.location.search);
const convId = params.get('conv');
const otherUsername = params.get('u');
const me = api.user();
let pollInterval;

if (!convId) window.location.href = 'message.html';

// Update header with real user info
async function loadHeader() {
  if (!otherUsername) return;
  try {
    const user = await api.getProfile(otherUsername);
    const nameEl = document.querySelector('.profile-name');
    const imgEl = document.querySelector('.user-img');
    if (nameEl) nameEl.textContent = user.username;
    if (imgEl) imgEl.src = api.avatar(user.profile_picture);
  } catch (_) {}
}

// Render messages
function renderMessages(messages) {
  const container = document.querySelector('.main-section');
  if (!container) return;
  container.innerHTML = messages.map(msg => {
    const isMine = msg.sender.id === me.id;
    return `
    <div class="${isMine ? 'chat2' : 'chat1'}" style="max-width:75%;${isMine ? 'margin-left:auto;' : ''}">
      <p style="margin:0;">${msg.content}</p>
      <span style="font-size:10px;color:#aaa;display:block;margin-top:2px;text-align:${isMine ? 'right' : 'left'};">${api.timeAgo(msg.created_at)}</span>
    </div>`;
  }).join('');
  container.scrollTop = container.scrollHeight;
}

async function loadMessages() {
  try {
    const messages = await api.getMessages(convId);
    renderMessages(messages);
  } catch (_) {}
}

async function sendMessage() {
  const input = document.querySelector('.text');
  const content = input.value.trim();
  if (!content) return;
  input.value = '';
  try {
    await api.sendMessage(convId, content);
    await loadMessages();
  } catch (_) {}
}

// Send on Enter key or send button click
document.addEventListener('DOMContentLoaded', () => {
  loadHeader();
  loadMessages();

  const input = document.querySelector('.text');
  const sendBtn = document.querySelector('.send');

  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }
  if (sendBtn) sendBtn.addEventListener('click', sendMessage);

  // back button
  const backBtn = document.querySelector('.back');
  if (backBtn) backBtn.addEventListener('click', () => window.location.href = url('message.html'));

  // poll for new messages every 3 seconds
  pollInterval = setInterval(loadMessages, 3000);
});

window.addEventListener('beforeunload', () => clearInterval(pollInterval));
