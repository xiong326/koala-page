const API_BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    const err = new Error(body.error || `Request failed: ${res.status}`);
    err.status = res.status;
    throw err;
  }

  return res.json();
}

export async function fetchKoalas(board) {
  return request(`/koalas?board=${encodeURIComponent(board)}`);
}

export async function createKoala(koala) {
  return request('/koalas', { method: 'POST', body: JSON.stringify(koala) });
}

export async function updateKoala(id, fields) {
  return request(`/koalas/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(fields) });
}

export async function deleteKoala(id) {
  return request(`/koalas/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function uploadImage(thumbBlob, mediumBlob, filename) {
  const form = new FormData();
  form.append('thumb', thumbBlob);
  form.append('medium', mediumBlob);
  form.append('filename', filename);
  return request('/images/upload', { method: 'POST', body: form });
}

export async function login(code) {
  return request('/auth/login', { method: 'POST', body: JSON.stringify({ code }) });
}

export async function logout() {
  return request('/auth/logout', { method: 'POST' });
}

export async function checkAuth() {
  return request('/auth/me');
}

export async function listPasskeys() {
  return request('/auth/passkeys');
}

export async function createPasskey(name, role) {
  return request('/auth/passkeys', { method: 'POST', body: JSON.stringify({ name, role }) });
}

export async function revokePasskey(id) {
  return request(`/auth/passkeys/${id}`, { method: 'DELETE' });
}

export async function fetchAuditLog(limit = 50, offset = 0) {
  return request(`/audit?limit=${limit}&offset=${offset}`);
}
