/**
 * Attach NASCENT_API_TOKEN to browser API calls when configured.
 * Prefer `x-api-token` so it coexists with HTTP Basic gateway auth
 * (browsers only send one Authorization header).
 *
 * SECURITY: the token is held in sessionStorage, set by the user in
 * Settings → Server & LAN (see TvSettingsModal). It is NEVER read from
 * a build-time env var: Vite inlines VITE_* values into the shipped
 * JavaScript bundle, so a VITE_NASCENT_API_TOKEN would be readable by
 * anyone who can load the app — the token would protect nothing.
 * sessionStorage keeps the token in this browser tab only (cleared
 * when the tab closes) and out of the bundle and out of git.
 */

const SESSION_KEY = "nascent_api_token";

export function getApiToken(): string {
  if (typeof window === "undefined") return "";
  try {
    return (window.sessionStorage.getItem(SESSION_KEY) || "").trim();
  } catch {
    return "";
  }
}

export function hasApiToken(): boolean {
  return getApiToken().length > 0;
}

/** Save the API token for this browser session only. */
export function setApiToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    const value = token.trim();
    if (value) {
      window.sessionStorage.setItem(SESSION_KEY, value);
    } else {
      window.sessionStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // sessionStorage unavailable (private mode, etc.) — calls go unauthenticated.
  }
}

/** Forget the API token for this browser session. */
export function clearApiToken(): void {
  setApiToken("");
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
