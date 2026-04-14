let strengthScore = 0;

// ── Profile picture preview ──────────────────────────────────────────────
document.getElementById('profile-pic').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      document.getElementById('avatar-img').src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// ── Eye toggle ────────────────────────────────────────────────────────────
document.querySelector('.eye1').addEventListener('click', () => {
  const p = document.querySelector('.password');
  p.type = p.type === 'password' ? 'text' : 'password';
});

document.querySelector('.eye2').addEventListener('click', () => {
  const p = document.querySelector('.cpassword');
  p.type = p.type === 'password' ? 'text' : 'password';
});

// ── Password strength bar ─────────────────────────────────────────────────
const passInput = document.querySelector('.password');
const pass1Div = document.querySelector('.pass1');

pass1Div.insertAdjacentHTML('afterend', `
  <div id="strength-bar-wrap" style="height:6px;border-radius:4px;background:#ddd;margin-top:4px;display:none;">
    <div id="strength-bar" style="height:100%;width:0%;border-radius:4px;transition:width 0.3s,background 0.3s;"></div>
  </div>
  <p id="strength-label" style="font-size:11px;margin-top:4px;display:none;"></p>
`);

passInput.addEventListener('input', () => {
  const val = passInput.value;
  const wrap = document.getElementById('strength-bar-wrap');
  const bar = document.getElementById('strength-bar');
  const label = document.getElementById('strength-label');

  if (!val) {
    wrap.style.display = 'none';
    label.style.display = 'none';
    strengthScore = 0;
    return;
  }

  wrap.style.display = 'block';
  label.style.display = 'block';

  strengthScore = 0;
  if (val.length >= 8) strengthScore++;
  if (/[A-Z]/.test(val)) strengthScore++;
  if (/[0-9]/.test(val)) strengthScore++;
  if (/[^A-Za-z0-9]/.test(val)) strengthScore++;

  const levels = [
    { w: '25%', color: '#e74c3c', text: 'Weak' },
    { w: '50%', color: '#e67e22', text: 'Fair' },
    { w: '75%', color: '#f1c40f', text: 'Good' },
    { w: '100%', color: '#2ecc71', text: 'Strong' },
  ];
  const lvl = levels[strengthScore - 1] || { w: '5%', color: '#e74c3c', text: 'Too short' };
  bar.style.width = lvl.w;
  bar.style.background = lvl.color;
  label.textContent = lvl.text;
  label.style.color = lvl.color;
});

// ── Confirm password mismatch ─────────────────────────────────────────────
const cpassInput = document.querySelector('.cpassword');
const pass2Div = document.querySelector('.pass2');

pass2Div.insertAdjacentHTML('afterend', `
  <p id="match-msg" style="font-size:11px;margin-top:4px;"></p>
`);

cpassInput.addEventListener('input', () => {
  const matchMsg = document.getElementById('match-msg');
  if (!cpassInput.value) { matchMsg.textContent = ''; return; }
  if (cpassInput.value !== passInput.value) {
    matchMsg.textContent = "Passwords don't match";
    matchMsg.style.color = '#e74c3c';
  } else {
    matchMsg.textContent = '✓ Passwords match';
    matchMsg.style.color = '#2ecc71';
  }
});

// ── Sign Up button click ──────────────────────────────────────────────────
document.getElementById('signup-btn').addEventListener('click', async () => {
  const msg = document.getElementById('signup-message');

  if (strengthScore < 4 && document.getElementById('strength-label')?.textContent !== 'Strong') {
    msg.style.color = '#e74c3c';
    msg.textContent = 'Password is too weak. Make it Strong (green) before signing up.';
    return;
  }

  const fname = document.querySelector('.fname').value.trim();
  const lname = document.querySelector('.lname').value.trim();
  const username = document.querySelector('.username').value.trim();
  const email = document.querySelector('.email').value.trim();
  const password = passInput.value;
  const confirm_password = cpassInput.value;
  const date_of_birth = document.querySelector('.date').value;

  if (!fname || !lname || !username || !email || !password) {
    msg.style.color = '#e74c3c';
    msg.textContent = 'Please fill in all required fields.';
    return;
  }

  if (password !== confirm_password) {
    msg.style.color = '#e74c3c';
    msg.textContent = "Passwords don't match!";
    return;
  }

  if (!document.querySelector('.cprivacy').checked) {
    msg.style.color = '#e74c3c';
    msg.textContent = 'You must accept Privacy Policy!';
    return;
  }

  const btn = document.getElementById('signup-btn');
  btn.textContent = 'Creating account...';
  btn.disabled = true;

  try {
    const res = await fetch(`${BASE}/auth/signup/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username, first_name: fname, last_name: lname, email,
        password, confirm_password,
        ...(date_of_birth && { date_of_birth })
      })
    });
    const data = await res.json();

    if (res.ok) {
      const picFile = document.getElementById('profile-pic').files[0];
      if (picFile) {
        const loginRes = await fetch(`${BASE}/auth/login/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const loginData = await loginRes.json();
        if (loginRes.ok) {
          const formData = new FormData();
          formData.append('profile_picture', picFile);
          await fetch(`${BASE}/auth/me/`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${loginData.access}` },
            body: formData
          });
        }
      }
      msg.style.color = '#2ecc71';
      msg.textContent = '✓ Account created! Redirecting...';
      window.location.assign(url('signin.html'));
    } else {
      const errorText = Object.entries(data)
        .map(([f, v]) => `${f}: ${[v].flat().join(', ')}`)
        .join(' | ');
      msg.style.color = '#e74c3c';
      msg.textContent = errorText || 'Signup failed.';
      btn.textContent = 'Sign Up';
      btn.disabled = false;
    }
  } catch (err) {
    msg.style.color = '#e74c3c';
    msg.textContent = 'Network error. Is the server running?';
    btn.textContent = 'Sign Up';
    btn.disabled = false;
  }
});
