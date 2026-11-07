/**
 * Attach NASCENT_API_TOKEN to browser API calls when configured.
 * Prefer `x-api-token` so it coexists with HTTP Basic gateway auth
 * (browsers only send one Authorization header).
 */

const TOKEN =
  (typeof import.meta !== "undefined" &&
    (import.meta as ImportMeta & { env?: Record<string, string> }).env
      ?.VITE_NASCENT_API_TOKEN) ||
  "";

export function getApiToken(): string {
  return TOKEN.trim();
}

/** Headers for fetch()/XHR to /api when a token is configured. */
export function apiAuthHeaders(extra: HeadersInit = {}): Headers {
  const headers = new Headers(extra);
  const token = getApiToken();
  if (token) {
    headers.set("x-api-token", token);
  }
  return headers;
}

/** Same-origin /api fetch with auth headers merged in. */
export function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = apiAuthHeaders(init.headers);
  return fetch(input, { ...init, headers });
}
