const BASE = window.location.port === '5500' ? 'http://127.0.0.1:8000/api' : '/api';

const isLocal = window.location.port === '5500';
const url = (path) => isLocal ? path + '.html' : '/' + path.replace('.html', '') + '/';

const api = {
  token: () => localStorage.getItem('access'),
  user: () => JSON.parse(localStorage.getItem('user') || 'null'),

  headers(auth = true) {
    const h = { 'Content-Type': 'application/json' };
    if (auth && this.token()) h['Authorization'] = `Bearer ${this.token()}`;
    return h;
  },

  async request(method, path, body = null, auth = true) {
    const opts = { method, headers: this.headers(auth) };
    if (body) opts.body = JSON.stringify(body);
    let res = await fetch(`${BASE}${path}`, opts);

    // Auto-refresh token on 401
    if (res.status === 401 && auth) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        opts.headers = this.headers(auth);
        res = await fetch(`${BASE}${path}`, opts);
      } else {
        this.logout();
        return;
      }
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw data;
    return data;
  },

  async refreshToken() {
    const refresh = localStorage.getItem('refresh');
    if (!refresh) return false;
    try {
      const res = await fetch(`${BASE}/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('access', data.access);
        if (data.refresh) localStorage.setItem('refresh', data.refresh);
        return true;
      }
      return false;
    } catch (_) { return false; }
  },

  get: (path, auth = true) => api.request('GET', path, null, auth),
  post: (path, body, auth = true) => api.request('POST', path, body, auth),
  patch: (path, body) => api.request('PATCH', path, body),
  delete: (path) => api.request('DELETE', path),

  // Auth
  login: (email, password) => api.post('/auth/login/', { email, password }, false),
  signup: (data) => api.post('/auth/signup/', data, false),
  me: () => api.get('/auth/me/'),

  // Posts
  getPosts: (params = '') => api.get(`/posts/posts/${params}`, false),
  createPost: (data) => api.post('/posts/posts/', data),
  likePost: (id) => api.post(`/posts/posts/${id}/like/`),
  sharePost: (id) => api.post(`/posts/posts/${id}/share/`),
  deletePost: (id) => api.delete(`/posts/posts/${id}/`),

  // Comments
  getComments: (postId) => api.get(`/comments/comments/?post=${postId}`),
  addComment: (postId, content, replyTo = null) =>
    api.post('/comments/comments/', { post: postId, content, ...(replyTo && { reply_to: replyTo }) }),

  // Profile & Follow
  getProfile: (username) => api.get(`/auth/profile/${username}/`),
  follow: (username) => api.post(`/auth/follow/${username}/`),
  getFollowers: (username) => api.get(`/auth/followers/${username}/`),
  getFollowing: (username) => api.get(`/auth/following/${username}/`),

  // Chat
  getConversations: () => api.get('/chat/conversations/'),
  startConversation: (username) => api.post('/chat/conversations/start/', { username }),
  getMessages: (convId) => api.get(`/chat/conversations/${convId}/messages/`),
  sendMessage: (convId, content) => api.post(`/chat/conversations/${convId}/send/`, { content }),

  saveSession(data) {
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);
    localStorage.setItem('user', JSON.stringify(data.user));
  },

  logout() {
    localStorage.clear();
    window.location.href = url('signin.html');
  },

  requireAuth() {
    if (!this.token()) window.location.href = url('signin.html');
  },

  avatar(url) {
    if (!url) return 'Ellipse 221 (1).svg';
    if (url.startsWith('http')) return url;
    return `http://127.0.0.1:8000${url}`;
  },

  timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }
};
