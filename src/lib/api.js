// src/lib/api.js

// Laat het voor zowel Vite als Vue-CLI werken:
const API =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE_URL) ||
  process.env.VUE_APP_API_BASE_URL ||
  (location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://ben-jerrys-api.onrender.com');

export async function apiFetch(path, options = {}) {
  if (!path.startsWith('/')) path = '/' + path;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const url = `${API}${path}`;

  let res;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (e) {
    // Netwerk/CORS etc.
    throw new Error(`Netwerkfout naar ${url.split('?')[0]}`);
  }

  // Probeer body te lezen zodat we zinvolle fout tonen
  let data = null;
  try {
    data = await res.clone().json();
  // eslint-disable-next-line no-empty
  } catch (e) {} // HTML/lege body? Negeer JSON parse error.

  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `Request faalde (${res.status})`;
    throw new Error(msg);
  }

  return data ?? (await res.json());
}
