// auth.js
async function fetchProfile(token) {
  const res = await fetch('/users/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (res.status === 401) throw new Error('Unauthorized');
  if (!data.success) throw new Error(data.message || 'Failed to load profile');
  return data.payload;
}

async function initAuth() {
  const token = localStorage.getItem('accessToken');
  if (!token) return redirectToLogin();

  try {
    const profile = await fetchProfile(token);
    const welcomeEl = document.getElementById('welcome');
    if (welcomeEl) welcomeEl.innerText = `Hi, ${profile.name}`;
  } catch (err) {
    console.error('Auth error:', err.message);
    redirectToLogin();
  }
}

function redirectToLogin() {
  localStorage.removeItem('accessToken');
  window.location.href = '/login';
}

async function loadDynamicContent(page) {
  const container = document.getElementById('dynamicContent');
  if (!container) return;

  container.innerHTML = '<p>Loading...</p>';
  try {
    const res = await fetch(`/dashboard/${page}`, {
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    });
    if (!res.ok) throw new Error(`Failed to load ${page}`);
    const html = await res.text();
    container.innerHTML = html;
  } catch (err) {
    console.error('Load content error:', err.message);
    container.innerHTML = '<p>Error loading content.</p>';
  }
}

function setupNavigation() {
  document.querySelectorAll('.sidebar a[data-page]').forEach((link) => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      if (page) await loadDynamicContent(page);
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await initAuth();
  setupNavigation();
  await loadDynamicContent('statistics');
});
