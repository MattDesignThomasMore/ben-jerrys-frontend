// src/lib/api.js
const API_BASE =
  import.meta.env?.VITE_API_BASE_URL ||
  (location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://ben-jerrys-api.onrender.com");

export async function apiPost(path, data) {
  if (!path.startsWith("/")) path = "/" + path;
  const res = await fetch(API_BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const text = await res.text().catch(() => "");
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {}

  if (!res.ok) {
    const msg =
      (json && (json.message || json.error)) ||
      `Request faalde (${res.status})`;
    throw new Error(msg);
  }

  return json ?? {};
}
