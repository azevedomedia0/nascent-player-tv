# Nascent Player TV

Nascent Player TV is an Android TV / Google TV streaming experience — a
10-foot TV interface for browsing and playing a local media library,
with Stremio-style addon support, watch parties, and AI-assisted
metadata enrichment.

The frontend is a **React 19** single-page app (Vite + Tailwind CSS)
served by an **Express** server (`server.ts`) that also provides the
REST API for the media library, streaming, uploads, plugins, and
watch parties.

> **Status:** early / in active development. The catalog is currently
> largely hardcoded sample data, and some features (streaming-engine
> telemetry, Waku chat) are simulated rather than backed by a real
> service. See [Known limitations](#known-limitations).

## Features

- TV-first UI: hero billboard, content rows, detail modals, search,
  libraries, settings, and a remote-friendly player
- Local media library with upload, byte-range streaming, and
  watch-progress tracking
- Stremio-compatible addons (Cinemeta, Torrentio, OpenSubtitles and
  others) for streams, metadata, catalogs, and subtitles — see
  [PLUGIN_API.md](PLUGIN_API.md)
- Watch parties with synchronized playback and chat
- Gemini-powered metadata enrichment for titles in your library
- IMDb lookup via the built-in `/api/imdb/*` endpoints

## Run locally

**Prerequisites:** Node.js 22+ and npm.

```bash
# Install dependencies (`npm ci` works; the peer-dependency conflict
# that used to require --legacy-peer-deps went away with the SvelteKit
# cleanup of 2026-11-06).
npm ci

# Copy the example env file and fill in what you need (see below).
cp .env.example .env

# Start the dev server (Express + Vite, http://127.0.0.1:3000 by default).
npm run dev
```

Other scripts:

| Script | What it does |
| --- | --- |
| `npm run dev` | Run the dev server with `tsx server.ts` |
| `npm run build` | Build the React app with Vite and bundle the server with esbuild into `dist/server.cjs` |
| `npm start` | Run the production build (`node dist/server.cjs`) |
| `npm run lint` | Typecheck the project (`tsc --noEmit`) |
| `npm test` | Run the test suite (`tsx --test tests/security.test.ts`) |
| `npm run clean` | Remove `dist/` |

## Configuration

All configuration is via environment variables — see
[.env.example](.env.example). Copy it to `.env` for local development;
never commit a real `.env` (it is gitignored).

| Variable | Default | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | — | Required for Gemini metadata enrichment (`/api/metadata/enrich`). Without it, enrichment returns an error. |
| `HOST` | `127.0.0.1` | Interface the server binds to. Only set `HOST=0.0.0.0` behind a reverse proxy that adds authentication — see [Security](#security). |
| `PORT` | `3000` | Port the server listens on. |
| `APP_URL` | — | Public URL of the deployment, used for self-referential links. |
| `NASCENT_GATEWAY_PASSWORD` | — | Enables built-in HTTP Basic Auth for the whole app. Prefer this for remote browser access. |
| `NASCENT_API_TOKEN` | — | Optional token for non-browser clients (curl/scripts). When set and the gateway is off, mutating `/api` calls and sensitive GETs require `Authorization: Bearer` or `x-api-token`. Do not mirror this into any `VITE_*` variable. |
| `STREMIO_PROXY_ALLOWLIST` | — | Extra hostnames (comma-separated) the Stremio proxy may fetch, in addition to the bundled addon hosts. Never add a wildcard or an internal host. |

Uploaded files are stored in `./media/` and library state in
`./data/` (`media.json`, `history.json`, `plugins.json`).

## Security

Nascent Player TV is a **local media server**. It is safe on localhost
(`HOST=127.0.0.1`, the default). It has **no built-in login**, so do
**not** expose it directly to the internet or an untrusted network.

To access it remotely, enable the built-in gateway
(`NASCENT_GATEWAY_PASSWORD`) or put the app behind a reverse proxy
(Caddy, nginx, Cloudflare Tunnel, Tailscale, etc.) that adds
authentication. Do not just set `HOST=0.0.0.0` and port-forward it.
Do not put secrets in `VITE_*` env vars — they are baked into the
browser bundle.

The server hardens its endpoints with an SSRF allowlist for the
Stremio proxy, path-traversal protection for local files, whitelisted
`/api/media/add` input, upload/benchmark size caps, rate limiting,
and security headers. Full details, including known limitations
(client-asserted watch-party hosts, Debrid tokens in `localStorage`,
client-side paywall), are in [SECURITY.md](SECURITY.md).

## Plugins

Plugins follow the Stremio addon protocol (manifest / stream / meta /
catalog / subtitles). The full plugin API, including the addon
manifest format and the local plugin registry, is documented in
[PLUGIN_API.md](PLUGIN_API.md).

## Project structure

```
.
├── server.ts               # Express server + REST API (the only backend)
├── src/
│   ├── main.tsx            # React entry point
│   ├── App.tsx             # TV UI shell
│   ├── components/         # TV components (player, rows, modals, sidebar…)
│   │   └── tv/             # 10-foot UI components
│   ├── lib/
│   │   ├── security.ts     # Shared server-side security helpers (tested)
│   │   ├── streamingEngine.ts
│   │   ├── imdbService.ts
│   │   ├── tvMediaData.ts  # Hardcoded catalog data
│   │   ├── tvEpisodeData.ts
│   │   └── plugins/        # Stremio addon engine + default plugins
│   └── types.ts
├── tests/
│   └── security.test.ts    # Tests for src/lib/security.ts
├── data/                   # Library state (sample media/history/plugins)
├── public/                 # Static assets (logo, posters)
├── index.html
├── vite.config.ts
├── PLUGIN_API.md
└── SECURITY.md
```

## Development

```bash
npm run lint   # tsc --noEmit
npm test       # security-helper tests
npm run build  # production build (also run by CI)
```

CI runs on every push and pull request to `main` — see
[.github/workflows/ci.yml](.github/workflows/ci.yml). It installs
dependencies, runs the linter, the tests, and the production build.

## Known limitations

- The catalog is mostly hardcoded sample data (`src/lib/tvMediaData.ts`,
  `src/App.tsx`); there is no real backend media source yet.
- Watch parties are held in memory and are lost on restart; the
  Waku chat and streaming-engine telemetry are simulated.
- Torrentio streams resolve to sample videos by title keyword — there
  is no real torrent playback.
- Persistence is flat JSON files under `data/`, read/written
  synchronously per request, with no locking.

## License

Apache License 2.0 — see [LICENSE](LICENSE).
