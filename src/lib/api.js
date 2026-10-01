// All calls to the Node back end go through here.
const BASE = (import.meta.env.VITE_API_URL || '') + '/api';

export async function api(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'משהו השתבש. נסו שוב.');
    err.status = res.status;
    err.fields = data.fields;
    throw err;
  }
  return data;
}

// Tokens are kept in localStorage so admins/affiliates stay logged in.
export const tokenStore = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch { /* ignore */ } },
};
