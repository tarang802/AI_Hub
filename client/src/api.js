export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

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
