document.getElementById('signin-btn').addEventListener('click', async () => {
  const email = document.querySelector('.email').value.trim();
  const password = document.querySelector('.password').value;
  const msg = document.getElementById('signin-message');

  if (!email || !password) {
    msg.textContent = 'Please enter email and password.';
    return;
  }

  const btn = document.getElementById('signin-btn');
  btn.textContent = 'Signing in...';
  btn.disabled = true;

  try {
    const res = await fetch('http://127.0.0.1:8000/api/auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('access', data.access);
      localStorage.setItem('refresh', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.assign(url('home.html'));
    } else {
      const errorText = Object.values(data).flat().join(' ');
      msg.textContent = errorText || 'Login failed.';
      btn.textContent = 'Sign In';
      btn.disabled = false;
    }
  } catch (err) {
    msg.textContent = 'Network error. Is the server running?';
    btn.textContent = 'Sign In';
    btn.disabled = false;
  }
});
