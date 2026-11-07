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
  benchmark / torrent-stream / Waku), plus `X-Content-Type-Options`,
  `X-Frame-Options`, and `Referrer-Policy` headers. JSON bodies are
  capped at 1 MB (was 50 MB).

## Fixed in the 2026-11-06 follow-up

- **Watch-party host takeover — fixed.** Playback sync used to trust
  a client-sent `isHost` flag (or a client-chosen `hostId`). The
  server now issues a random 32-byte `hostToken` at room creation,
  returned only to the creator; only a sync request presenting that
  token may change playback state, and the token is stripped from
  join/sync/chat responses. `hostId`/`hostName` are display identity
  only. Chat messages are capped at 500 chars, names at 50. No live
  client calls these endpoints yet (the watch-party UI is mocked),
  so this changes the API contract, not app behaviour.
- **Waku open relay — capped.** `/api/waku/v2/relay/v1/messages` was
  an unauthenticated, uncapped spam relay that stored and broadcast
  any payload. Payloads are now capped at 64 KB, topics at 200 chars,
  store queries at 100 messages, and the endpoint is rate-limited
  (20 req/min/IP).
- **Debrid tokens — removed.** The Real-Debrid/AllDebrid token field
  was removed from the Torrentio addon settings, the plugin docs no
  longer suggest putting API keys in addon URLs, and the plugin
  engine strips any previously stored `debridApiKey` from
  `localStorage` on load and refuses to save a new one. Do not enter
  a Debrid token in this app.
- **Client-side paywall — removed.** The "Community Addons" paywall
  (`localStorage` flag, hardcoded voucher codes like `VIP-PASS`) is
  gone: `addonPaywall.ts` and `TvAddonPaywallModal.tsx` were deleted
  and the lock gates in the stream selector, plugin modal, and
  sidebar were removed. Community addons are no longer locked behind
  a fake purchase. There is no payment backend; if a real paywall is
  ever wanted it must be server-verified.
- **Torrentio no longer pre-enabled.** The Torrentio addon now ships
  disabled by default (server defaults and the bundled addon list).
  Existing installs keep their current setting; enable it explicitly
  in the plugin modal if you want it.
- **Runtime data no longer tracked.** `data/*.json` and `media/` are
  now gitignored and the sample data files were removed from the
  repo. The server recreates them from its built-in defaults on
  startup, so a fresh clone still starts with the sample library.

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

- **No real authentication or per-user sessions.** The API is open to
  anyone who can reach the server — that is why localhost binding is
  the primary control. The watch-party host token is a per-room
  secret, not a user identity, and the Waku endpoint still accepts
  messages from anyone (now size-capped and rate-limited). Do not
  rely on these for access control.
- **Plugin/addon hosts are trusted once allowlisted.** A malicious
  addon can serve arbitrary stream URLs and metadata to the player.
  Only allowlist hosts you trust.
- **Gemini API key is server-side only**, but `POST
  /api/metadata/enrich` lets any local caller spend the key's quota
  (rate-limited to 20 req/min/IP). Keep the server on localhost.

## Reporting a vulnerability

Open a GitHub issue in this repo, or contact the maintainer directly.
Please do not publish an exploit before a fix is available.
