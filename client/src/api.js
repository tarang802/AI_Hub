// Empty means "same origin" — in production the API and the built client are
// served by the same server, so relative paths keep the session cookie
// first-party. Local dev sets VITE_API_URL (see .env.example) because Vite
// serves the client on a different port than the API.
export const API_URL = import.meta.env.VITE_API_URL || "";

export async function fetchMe() {
  const res = await fetch(`${API_URL}/auth/me`, { credentials: "include" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.user;
}

export function googleLoginUrl() {
  return `${API_URL}/auth/google`;
}

export async function logout() {
  await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
}
