/**
 * Built-in reverse proxy helpers.
 *
 * Outbound: allowlisted HTTPS fetch with redirect re-validation, timeouts,
 * and optional Range streaming (media / addon payloads).
 * Inbound: optional HTTP Basic gateway so HOST=0.0.0.0 can be exposed
 * without a separate nginx/Caddy layer — see SECURITY.md.
 */

import { getProxyAllowlist, validateProxyUrl } from "./security";
import type { Request, Response, NextFunction } from "express";

const DEFAULT_MEDIA_PROXY_ALLOWLIST = [
  "commondatastorage.googleapis.com",
  "storage.googleapis.com",
  "image.tmdb.org",
  "images.unsplash.com",
  "upload.wikimedia.org",
  "peach.blender.org",
] as const;

export function getReverseProxyAllowlist(): Set<string> {
  const extra = (process.env.PROXY_ALLOWLIST || "")
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
  return new Set([
    ...getProxyAllowlist(),
    ...DEFAULT_MEDIA_PROXY_ALLOWLIST,
    ...extra,
  ]);
}

export function validateReverseProxyUrl(raw: unknown): URL {
  return validateProxyUrl(raw, getReverseProxyAllowlist());
}

export type ProxyFetchResult = {
  response: globalThis.Response;
  finalUrl: URL;
};

/**
 * Fetch an allowlisted HTTPS URL. Manual redirects; each hop re-validated.
 * Caps hops at 3. Timeout 20s for streaming media.
 */
export async function proxyFetch(
  rawUrl: unknown,
  init: RequestInit & { timeoutMs?: number } = {}
): Promise<ProxyFetchResult> {
  const { timeoutMs = 20_000, ...rest } = init;
  let current = validateReverseProxyUrl(rawUrl);
  let response: globalThis.Response | null = null;

  for (let hop = 0; hop < 3; hop++) {
    response = await fetch(current, {
      ...rest,
      redirect: "manual",
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) break;
      current = validateReverseProxyUrl(new URL(location, current).toString());
      continue;
    }
    return { response, finalUrl: current };
  }

  if (!response) {
    throw new Error("Proxy fetch failed");
  }
  return { response, finalUrl: current };
}

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "content-encoding",
]);

/** Pipe an upstream fetch Response into Express, forwarding useful headers. */
export async function pipeProxyResponse(
  upstream: globalThis.Response,
  res: Response,
  opts: { maxBytes?: number } = {}
): Promise<void> {
  const maxBytes = opts.maxBytes ?? 200 * 1024 * 1024; // 200 MB default

  res.status(upstream.status);
  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP.has(lower)) return;
    if (lower === "set-cookie") return;
    res.setHeader(key, value);
  });
  // Always allow the SPA origin to read proxied media
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Expose-Headers", "Content-Length, Content-Range, Accept-Ranges");

  const contentLength = Number(upstream.headers.get("content-length") || 0);
  if (contentLength > maxBytes) {
    res.status(502).json({ error: "Upstream response too large" });
    return;
  }

  if (!upstream.body) {
    res.end();
    return;
  }

  const reader = upstream.body.getReader();
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        res.destroy();
        return;
      }
      if (!res.write(Buffer.from(value))) {
        await new Promise<void>((resolve) => res.once("drain", resolve));
      }
    }
    res.end();
  } catch {
    if (!res.headersSent) {
      res.status(502).json({ error: "Upstream stream failed" });
    } else {
      res.destroy();
    }
  }
}

/* ------------------------------------------------------------------ */
/* Inbound gateway (built-in reverse-proxy auth front door)              */
/* ------------------------------------------------------------------ */

export function isGatewayEnabled(): boolean {
  return Boolean(process.env.NASCENT_GATEWAY_PASSWORD?.trim());
}

export function getGatewayUser(): string {
  return (process.env.NASCENT_GATEWAY_USER || "nascent").trim() || "nascent";
}

/**
 * HTTP Basic Auth gate for the whole app when NASCENT_GATEWAY_PASSWORD
 * is set. This is the built-in substitute for putting nginx/Caddy in
 * front for simple remote access.
 */
export function gatewayAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!isGatewayEnabled()) return next();

  const header = req.get("authorization") || "";
  if (!header.startsWith("Basic ")) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Nascent Player"');
    return res.status(401).send("Authentication required");
  }

  let decoded = "";
  try {
    decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
  } catch {
    res.setHeader("WWW-Authenticate", 'Basic realm="Nascent Player"');
    return res.status(401).send("Authentication required");
  }

  const sep = decoded.indexOf(":");
  const user = sep >= 0 ? decoded.slice(0, sep) : decoded;
  const pass = sep >= 0 ? decoded.slice(sep + 1) : "";
  const expectedUser = getGatewayUser();
  const expectedPass = process.env.NASCENT_GATEWAY_PASSWORD || "";

  if (user !== expectedUser || pass !== expectedPass) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Nascent Player"');
    return res.status(401).send("Invalid credentials");
  }
  return next();
}

export function getReverseProxyStatus() {
  return {
    outboundEnabled: true,
    endpoint: "/api/proxy",
    allowlistSize: getReverseProxyAllowlist().size,
    gatewayEnabled: isGatewayEnabled(),
    gatewayUser: isGatewayEnabled() ? getGatewayUser() : null,
    host: process.env.HOST || "127.0.0.1",
    port: process.env.PORT ? Number(process.env.PORT) || 3000 : 3000,
  };
}
