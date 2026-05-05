const BASE = '';

function token() { return localStorage.getItem('sb_token'); }
function setToken(t) { localStorage.setItem('sb_token', t); }
function setUser(u) { localStorage.setItem('sb_user', JSON.stringify(u)); }
function getUser() { try { return JSON.parse(localStorage.getItem('sb_user')); } catch { return null; } }
function logout() { localStorage.removeItem('sb_token'); localStorage.removeItem('sb_user'); window.location.href = '/'; }

async function api(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const tok = token();
  if (tok) headers['Authorization'] = `Bearer ${tok}`;
  const res = await fetch(`${BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw { status: res.status, ...data };
  return data;
}

const Auth = {
  register: (body) => api('POST', '/api/auth/register', body),
  login: (body) => api('POST', '/api/auth/login', body),
  me: () => api('GET', '/api/auth/me'),
};

const Payments = {
  pricing: () => api('GET', '/api/payments/pricing'),
  playerCheckout: (competition_level) => api('POST', '/api/payments/player-checkout', { competition_level }),
  scoutCheckout: (plan) => api('POST', '/api/payments/scout-checkout', { plan }),
};

const Players = {
  list: (params = {}) => api('GET', '/api/players?' + new URLSearchParams(params)),
  get: (id) => api('GET', `/api/players/${id}`),
  mySubmissions: () => api('GET', '/api/players/my/submissions'),
  submit: (body) => api('POST', '/api/players/submit', body),
  positions: () => api('GET', '/api/players/positions'),
};

// Redirect if not authenticated
function requireAuth(role) {
  const user = getUser();
  const tok = token();
  if (!tok || !user) { window.location.href = '/'; return null; }
  if (role && user.role !== role) { window.location.href = '/'; return null; }
  return user;
}

// Show error in an alert element
function showError(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.className = 'alert alert-error';
  el.style.display = 'block';
}
function showSuccess(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.className = 'alert alert-success';
  el.style.display = 'block';
}
function clearAlert(el) { if (el) { el.style.display = 'none'; el.textContent = ''; } }

// Format currency
function fmt(pence) { return '£' + (pence / 100).toFixed(2); }
function fmtNum(n, decimals = 0) { return n == null ? '—' : Number(n).toFixed(decimals); }

// Render user nav
function renderNav(user) {
  const area = document.getElementById('nav-user');
  if (!area) return;
  if (user) {
    const dash = user.role === 'scout' ? '/scout/dashboard.html' : '/player/dashboard.html';
    area.innerHTML = `
      <a href="${dash}" class="btn btn-outline btn-sm">Dashboard</a>
      <button class="btn btn-ghost btn-sm" onclick="logout()">Sign out</button>
    `;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const user = getUser();
  renderNav(user);
});
