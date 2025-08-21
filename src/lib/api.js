// src/lib/api.js

// 1) Bepaal de API-base (werkt voor Vite én Vue-CLI én op Render)
const API =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE_URL) ||
  process.env.VUE_APP_API_BASE_URL ||
  (location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://ben-jerrys-api.onrender.com");

// 2) Generieke fetch-helper met foutafhandeling
export async function apiFetch(path, options = {}) {
  if (!path.startsWith("/")) path = "/" + path;

  const headers = new Headers(options.headers || {});
  // Alleen zetten als het geen FormData is (dan laat je de browser 'm bepalen)
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const url = `${API}${path}`;

  let res;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (e) {
    throw new Error(`Netwerkfout naar ${url.split("?")[0]}`);
  }

  // Probeer JSON te lezen; als het geen JSON is (HTML/lege body), negeren
  let data = null;
  try {
    data = await res.clone().json();
  } catch (e) {
    // Niet leeg laten i.v.m. ESLint: no-empty
    data = null; // parse-fout is oké; we geven hieronder een nette fout terug
  }

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) ||
      `Request faalde (${res.status})`;
    throw new Error(msg);
  }

  return data ?? (await res.json());
}

// 3) Kleine helpers die je in components kunt importeren
export function apiGet(path) {
  return apiFetch(path, { method: "GET" });
}

export function apiPost(path, body) {
  return apiFetch(path, { method: "POST", body: JSON.stringify(body) });
}

export function apiPut(path, body) {
  return apiFetch(path, { method: "PUT", body: JSON.stringify(body) });
}

export function apiDelete(path) {
  return apiFetch(path, { method: "DELETE" });
}
