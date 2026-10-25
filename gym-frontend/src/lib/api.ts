export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export function authFetch(path: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
}

// Throws when the backend rejects a request, so callers never treat a failed save as saved.
export async function ensureOk(res: Response): Promise<Response> {
  if (res.ok) return res;
  if (res.status === 401) throw new Error("Tu sesión venció. Volvé a iniciar sesión.");
  const body = await res.json().catch(() => null);
  const msg = Array.isArray(body?.message) ? body.message.join(", ") : body?.message;
  throw new Error(msg || `Error ${res.status}`);
}
