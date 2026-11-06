/**
 * Shared server-side security helpers.
 *
 * Pure functions only — no Express, SvelteKit, or framework imports — so
 * both `server.ts` (Express, the live backend) and
 * `src/routes/api/[...path]/+server.ts` (the SvelteKit duplicate) can use
 * the same validation. If a check changes here, it changes everywhere.
 *
 * Threat model: this is a local media server. It is safe on localhost.
 * It is NOT safe to expose directly to the internet without a reverse
 * proxy that adds authentication — see SECURITY.md.
 */

import path from "path";

/* ------------------------------------------------------------------ */
/* Stremio proxy allowlist (SSRF protection)                           */
/* ------------------------------------------------------------------ */

/** Addon hosts used by the bundled default plugins. Nothing else is
 *  proxied by default. Extend with STREMIO_PROXY_ALLOWLIST (comma
 *  separated hostnames) — never with a wildcard. */
export const DEFAULT_STREMIO_PROXY_ALLOWLIST = [
  "v3-cinemeta.strem.io",
  "torrentio.strem.fun",
  "opensubtitles-v3.strem.io",
  "anime-kitsu.strem.fun",
  "podcasts.strem.fun",
  "cyberflix.kamy.me",
] as const;

export function getProxyAllowlist(): Set<string> {
  const extra = (process.env.STREMIO_PROXY_ALLOWLIST || "")
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
  return new Set([...DEFAULT_STREMIO_PROXY_ALLOWLIST, ...extra]);
}

function isIpLiteral(hostname: string): boolean {
  // IPv4 (including 127.0.0.1, 169.254.x.x, 10/172.16/192.168 ranges)
  // and IPv6 (contains ':'). Both are rejected outright — the proxy is
  // only for named public addon hosts, never for internal addresses.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return true;
  if (hostname.includes(":")) return true;
  return false;
}

/**
 * Validate a user-supplied proxy target. Throws an Error with a safe,
 * non-leaking message on any failure.
 * - `stremio://` is rewritten to `https://` (legacy addon URLs).
 * - HTTPS only, no embedded credentials, no IP literals, no localhost.
 * - Hostname must be on the allowlist — this is what stops SSRF to
 *   cloud metadata endpoints (169.254.169.254), localhost services,
 *   and other internal hosts, including via redirects to those hosts
 *   (redirects are followed only to allowlisted hosts by the caller
 *   re-validating — see note in SECURITY.md).
 */
export function validateProxyUrl(raw: unknown, allowlist?: Set<string>): URL {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("Missing url parameter");
  }
  let target = raw.trim();
  if (target.startsWith("stremio://")) {
    target = target.replace("stremio://", "https://");
  }
  let url: URL;
  try {
    url = new URL(target);
  } catch {
    throw new Error("Invalid proxy URL");
  }
  if (url.protocol !== "https:") {
    throw new Error("Proxy URL must use https");
  }
  if (url.username || url.password) {
    throw new Error("Proxy URL must not contain credentials");
  }
  const hostname = url.hostname.toLowerCase();
  if (!hostname || hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new Error("Proxy host is not allowed");
  }
  if (isIpLiteral(hostname)) {
    throw new Error("Proxy host is not allowed");
  }
  const allowed = allowlist ?? getProxyAllowlist();
  if (!allowed.has(hostname)) {
    throw new Error("Proxy host is not allowed");
  }
  return url;
}

/* ------------------------------------------------------------------ */
/* Local media files (path traversal protection)                       */
/* ------------------------------------------------------------------ */

/**
 * Resolve a stored `filename` to a path inside MEDIA_DIR.
 * Returns null for anything unsafe: empty, absolute, containing a
 * directory separator, `..`, or resolving outside MEDIA_DIR.
 * Callers must treat null as a 400, never fall back to path.join().
 */
export function resolveMediaPath(mediaDir: string, filename: unknown): string | null {
  if (typeof filename !== "string" || !filename) return null;
  if (filename !== path.basename(filename)) return null;
  if (filename === "." || filename === "..") return null;
  const resolved = path.resolve(mediaDir, filename);
  const base = path.resolve(mediaDir) + path.sep;
  if (!resolved.startsWith(base)) return null;
  return resolved;
}

/* ------------------------------------------------------------------ */
/* /api/media/add input validation                                     */
/* ------------------------------------------------------------------ */

function asSafeString(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) return undefined;
  return trimmed;
}

function asSafeHttpUrl(value: unknown): string | undefined {
  const s = asSafeString(value, 2048);
  if (!s) return undefined;
  try {
    const url = new URL(s);
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    return s;
  } catch {
    return undefined;
  }
}

/**
 * Whitelist the fields a client may set when adding media.
 * The server always generates `id`, `playCount`, `playProgress` and
 * `subtitles` — a request body can no longer overwrite them (the old
 * code spread `...req.body` after the generated id, so a caller could
 * set any field, including `id` and `isLocal`).
 * `isLocal` is only honoured when a safe local filename is supplied.
 * Returns null when the body is not an object or has no usable title/url.
 */
export function sanitizeMediaInput(body: unknown): Record<string, unknown> | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const b = body as Record<string, unknown>;

  const title = asSafeString(b.title, 200);
  const url = asSafeHttpUrl(b.url);
  if (!title && !url) return null;

  const filename =
    typeof b.filename === "string" && b.filename === path.basename(b.filename)
      ? b.filename
      : undefined;

  const item: Record<string, unknown> = {};
  if (title) item.title = title;
  if (url) item.url = url;
  if (typeof b.type === "string" && b.type.trim().length <= 20) item.type = b.type.trim();
  if (typeof b.duration === "number" && Number.isFinite(b.duration) && b.duration >= 0) {
    item.duration = b.duration;
  }
  if (typeof b.releaseYear === "string" && b.releaseYear.trim().length <= 10) {
    item.releaseYear = b.releaseYear.trim();
  }
  if (Array.isArray(b.genres)) {
    const genres = b.genres
      .filter((g): g is string => typeof g === "string")
      .map((g) => g.trim())
      .filter(Boolean)
      .slice(0, 10);
    if (genres.length) item.genres = genres;
  }
  const summary = asSafeString(b.summary, 2000);
  if (summary) item.summary = summary;
  const director = asSafeString(b.director, 200);
  if (director) item.director = director;
  if (typeof b.rating === "number" && Number.isFinite(b.rating) && b.rating >= 0 && b.rating <= 10) {
    item.rating = b.rating;
  }
  const posterUrl = asSafeHttpUrl(b.posterUrl);
  if (posterUrl) item.posterUrl = posterUrl;
  const bannerUrl = asSafeHttpUrl(b.bannerUrl);
  if (bannerUrl) item.bannerUrl = bannerUrl;
  if (filename) item.filename = filename;
  // Only a local file with a validated filename may be marked local.
  item.isLocal = Boolean(b.isLocal) && Boolean(filename);
  if (typeof b.mimeType === "string" && b.mimeType.trim().length <= 100) {
    item.mimeType = b.mimeType.trim();
  }
  return item;
}

/* ------------------------------------------------------------------ */
/* Upload / benchmark caps                                             */
/* ------------------------------------------------------------------ */

/** Largest upload accepted: 2 GiB. Was previously uncapped. */
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024 * 1024;

export const ALLOWED_UPLOAD_EXTENSIONS = new Set([
  ".mp4",
  ".mkv",
  ".webm",
  ".mov",
  ".m4v",
  ".avi",
]);

/**
 * Validate an upload filename: must have an allowed video extension.
 * Returns a sanitised `Date.now()_name.ext` filename, or null.
 */
export function sanitizeUploadFilename(fileName: unknown): string | null {
  if (typeof fileName !== "string" || !fileName) return null;
  const ext = path.extname(fileName).toLowerCase();
  if (!ALLOWED_UPLOAD_EXTENSIONS.has(ext)) return null;
  const clean = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "");
  if (!clean || clean.length > 255) return null;
  return `${Date.now()}_${clean}`;
}

/** Largest benchmark probe: 1 MiB. Was previously uncapped
 *  (`Buffer.alloc(parseInt(req.query.bytes))` — 1 GB per request). */
export const MAX_BENCHMARK_BYTES = 1024 * 1024;

export function clampBenchmarkBytes(value: unknown): number {
  const parsed = typeof value === "string" ? parseInt(value, 10) : NaN;
  if (!Number.isFinite(parsed) || parsed <= 0) return 64 * 1024;
  return Math.min(parsed, MAX_BENCHMARK_BYTES);
}
