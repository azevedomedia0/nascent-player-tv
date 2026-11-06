# Security

## Threat model

Nascent Player TV is a **local media server**. It is safe on localhost
(`HOST=127.0.0.1`, the default). It has **no built-in login**, so it is
**not safe to expose directly to the internet or an untrusted network**.

If you need remote access, put it behind a reverse proxy (Caddy, nginx,
Cloudflare Tunnel, Tailscale, etc.) that adds authentication, and set
`NASCENT_API_TOKEN` as a second layer — see below. Do not just set
`HOST=0.0.0.0` and port-forward it.

## What is protected (fixed 2026-11-06)

All of these apply to the Express backend in `server.ts`, via the
shared helpers in `src/lib/security.ts`. (The SvelteKit duplicate API
route that used to carry the same flaws was deleted in the dead-code
cleanup of 2026-11-06, so there is now a single backend to patch.)

- **Localhost by default.** The server binds `127.0.0.1:3000` unless
  `HOST` is set. Binding `0.0.0.0` prints a warning at startup.
- **SSRF proxy allowlist.** `/api/stremio/proxy` only fetches `https://`
  URLs on an explicit hostname allowlist (the bundled addon hosts:
  Cinemeta, Torrentio, OpenSubtitles, AnimeKitsu, Podcasts, Cyberflix).
  IP literals, `localhost`, embedded credentials, and non-HTTPS URLs
  are rejected, redirects are re-validated against the same list, and
  fetches time out after 10 s with a 5 MB response cap. Add hosts only
  via `STREMIO_PROXY_ALLOWLIST` — never a wildcard or an internal host.
  Note: an allowlisted host could in theory DNS-rebind to a private IP;
  the allowlist plus localhost binding is the mitigation, not a proof
  against a malicious addon host.
- **Path traversal.** `/api/stream` and `DELETE /api/media/:id` resolve
  filenames with `resolveMediaPath()`, which rejects `../`, absolute
  paths, and anything outside `media/`. Stream errors no longer leak
  absolute on-disk paths, and remote-stream redirects are restricted
  to `http(s):` URLs.
- **Mass-assignment in `/api/media/add`.** The request body is
  whitelisted (`sanitizeMediaInput()`). The server always generates
  `id`, `playCount`, `playProgress`, and `subtitles`; `isLocal` is only
  honoured with a validated local filename.
- **Upload caps.** Uploads accept video extensions only
  (`.mp4`, `.mkv`, `.webm`, `.mov`, `.m4v`, `.avi`), are capped at
  2 GiB (checked on `Content-Length` and on the live stream), and a
  partial file is removed on overflow.
- **Benchmark cap.** `/api/stream/benchmark?bytes=` is clamped to 1 MiB
  (was uncapped `Buffer.alloc()` — 1 GB per request).
- **Rate limiting and headers.** In-memory per-IP limiting on `/api`
  (120 req/min general, 20 req/min for proxy / enrich / upload /
  benchmark / torrent-stream), plus `X-Content-Type-Options`,
  `X-Frame-Options`, and `Referrer-Policy` headers. JSON bodies are
  capped at 1 MB (was 50 MB).

## Optional token auth

Set `NASCENT_API_TOKEN` to a long random token. When set, mutating API
calls (`POST` / `DELETE` under `/api`) and the sensitive GET endpoints
(`/api/stremio/proxy`, `/api/stream/benchmark`) require
`Authorization: Bearer <token>` or `x-api-token: <token>`.

This is opt-in so local use is unchanged. Note that the Svelte UI calls
the proxy without a token, so enabling the token will break its Stremio
addon installer until that UI sends the header — use it together with
reverse-proxy auth, not as a drop-in for the browser UI.

## Known limitations (not fixed here)

- **No real authentication or per-user sessions.** Watch-party host
  status is still client-asserted (`isHost` in the request body), and
  the Waku chat endpoint accepts any message. Do not rely on these for
  access control.
- **Debrid tokens** are stored in plaintext `localStorage` and the
  plugin docs suggest putting API keys in addon URLs. Move them to a
  server-side secret store before entering a real token.
- **The paywall is client-side only** (`localStorage` flag, hardcoded
  voucher codes) and is trivially bypassed. It gates no payment.
- **Plugin/addon hosts are trusted once allowlisted.** A malicious
  addon can serve arbitrary stream URLs and metadata to the player.
  Only allowlist hosts you trust, and do not pre-enable Torrentio
  (a torrent aggregator) if that matters for your deployment.
- **Data files are tracked in git** (`data/*.json`) and `media/`
  uploads are not ignored. Do not commit real watch history or
  uploaded files.

## Reporting a vulnerability

Open a GitHub issue in this repo, or contact the maintainer directly.
Please do not publish an exploit before a fix is available.
