/**
 * Client helper: rewrite an absolute https URL through the built-in
 * reverse proxy (`/api/proxy`). Same-origin / relative / non-https
 * URLs are returned unchanged.
 */
export function viaReverseProxy(url: string | undefined | null): string {
  if (!url) return "";
  try {
    const parsed = new URL(url, typeof window !== "undefined" ? window.location.origin : "http://localhost");
    if (parsed.protocol !== "https:") return url;
    // Already proxied
    if (parsed.pathname === "/api/proxy" || parsed.pathname.startsWith("/api/proxy?")) return url;
    return `/api/proxy?url=${encodeURIComponent(parsed.toString())}`;
  } catch {
    return url;
  }
}
