# Community Plugin & Addon API Specification

The Media Player & Streaming Server features an open, modular **Community Plugin Architecture** modeled directly after the **Stremio Addon Protocol (v3)**. 

Developers can build and publish plugins to:
1. **Add new media formats & containers** (e.g. MKV, AV1, Opus, FLAC, AC3 audio pass-through, WebCodecs GPU demuxers).
2. **Integrate third-party services** (e.g. IMDb, TMDb, Real-Debrid, OpenSubtitles, Trakt, AniList/Kitsu, RSS feeds).
3. **Resolve stream sources** (Direct HTTP/HLS/DASH links, BitTorrent peer mesh infoHashes, YouTube trailers, cloud caches).
4. **Introduce playback enhancements** (Crowdsourced intro/outro skip, dynamic range compression, video post-processing shaders, subtitle synchronization).

---

## 1. Architectural Philosophy

An Addon is a lightweight, stateless web service or client-side module exposing a standard JSON API. It is completely platform-agnostic and can be written in **Node.js**, **Python**, **Go**, **Rust**, **PHP**, or deployed serverless to **Cloudflare Workers**, **Vercel**, **Deno Deploy**, or self-hosted in **Docker**.

```
┌────────────────────────────────────────────────────────┐
│              Nascent Media Player (App)                │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP GET (JSON)
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
   │  Cinemeta   │  │  Torrentio  │  │   Custom    │
   │ (Metadata)  │  │  (Streams)  │  │ Addon Server│
   └─────────────┘  └─────────────┘  └─────────────┘
```

Every addon provides a **manifest** at `/manifest.json`. The player engine discovers capabilities through this manifest and dynamically queries resource routes:
- `/catalog/{type}/{id}/{extraArgs?}.json`
- `/meta/{type}/{id}.json`
- `/stream/{type}/{id}.json`
- `/subtitles/{type}/{id}.json`

---

## 2. Manifest Specification (`/manifest.json`)

The manifest defines the addon's identity, supported media types, resources, and configuration options.

### Endpoint: `GET /manifest.json`

#### Response JSON Schema:

```json
{
  "id": "org.community.exampleaddon",
  "name": "Community Stream & Decoder Hub",
  "version": "1.0.0",
  "description": "Provides high-bitrate 4K streams and MKV decoding support.",
  "author": "Community Developer",
  "icon": "https://example.com/icon.png",
  "logo": "https://example.com/logo.png",
  "background": "https://example.com/background.jpg",
  "types": ["movie", "series", "anime", "channel"],
  "resources": [
    "catalog",
    "meta",
    "stream",
    "subtitles",
    "format_decoder",
    "playback_enhancer"
  ],
  "catalogs": [
    {
      "type": "movie",
      "id": "top_rated",
      "name": "Community Top Rated",
      "extra": [
        { "name": "search", "isRequired": false },
        { "name": "genre", "options": ["Action", "Sci-Fi", "Drama"] },
        { "name": "skip", "isRequired": false }
      ]
    }
  ],
  "idPrefixes": ["tt", "custom:"],
  "behaviorHints": {
    "adult": false,
    "p2p": false,
    "configurable": true,
    "configurationRequired": false
  },
  "formatDecoder": {
    "supportedExtensions": [".mkv", ".flac", ".opus", ".hevc", ".av1"],
    "supportedCodecs": ["truehd", "dts", "eac3", "av01"],
    "hardwareAccelerated": true
  },
  "playbackEnhancer": {
    "capabilities": ["auto_skip_intro", "smart_eq", "spatial_audio"],
    "eventHooks": ["onTimeUpdate", "onTrackLoaded"]
  },
  "configurable": {
    "settings": [
      {
        "key": "apiKey",
        "label": "Debrid or Provider API Token",
        "type": "password",
        "description": "Optional token for uncapped direct downloads"
      },
      {
        "key": "maxQuality",
        "label": "Preferred Maximum Resolution",
        "type": "select",
        "default": "4k",
        "options": [
          { "label": "4K Ultra HD (2160p)", "value": "4k" },
          { "label": "Full HD (1080p)", "value": "1080p" }
        ]
      }
    ]
  }
}
```

---

## 3. Resource Endpoints

All responses must return HTTP `200 OK` with JSON bodies and CORS header `Access-Control-Allow-Origin: *`.

### 3.1 Catalogs (`/catalog/{type}/{id}/{extraArgs?}.json`)
Provides searchable, filterable lists of media for browsing views.

- **URL Pattern**: `/catalog/{type}/{id}.json` or `/catalog/{type}/{id}/search={query}.json`
- **Example Request**: `GET /catalog/movie/top/search=inception.json`
- **Response Format**:
```json
{
  "metas": [
    {
      "id": "tt1375666",
      "type": "movie",
      "name": "Inception",
      "poster": "https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg",
      "posterShape": "poster",
      "banner": "https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
      "genres": ["Action", "Sci-Fi", "Adventure"],
      "imdbRating": "8.8",
      "releaseInfo": "2010",
      "description": "A thief who steals corporate secrets through dream-sharing technology..."
    }
  ]
}
```

---

### 3.2 Metadata (`/meta/{type}/{id}.json`)
Provides rich item details (directors, cast, trailers, episode guides for series).

- **URL Pattern**: `/meta/{type}/{id}.json`
- **Example Request**: `GET /meta/movie/tt1375666.json`
- **Response Format**:
```json
{
  "meta": {
    "id": "tt1375666",
    "type": "movie",
    "name": "Inception",
    "genres": ["Action", "Sci-Fi"],
    "poster": "https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg",
    "background": "https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
    "logo": "https://images.metahub.space/logo/medium/tt1375666/img",
    "description": "Dom Cobb is a skilled thief, the absolute best in the dangerous art of extraction...",
    "releaseInfo": "2010",
    "imdbRating": "8.8",
    "runtime": "148 min",
    "director": ["Christopher Nolan"],
    "cast": ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page", "Tom Hardy"],
    "trailers": [
      { "source": "YoHD9XEInc0", "type": "Trailer" }
    ],
    "videos": [
      {
        "id": "tt1375666:1:1",
        "title": "Episode 1",
        "season": 1,
        "episode": 1,
        "released": "2010-07-16"
      }
    ]
  }
}
```

---

### 3.3 Streams (`/stream/{type}/{id}.json`)
Resolves playable stream URLs, torrent hashes, or external streams.

- **URL Pattern**: `/stream/{type}/{id}.json`
- **Example Request**: `GET /stream/movie/tt1375666.json`
- **Response Format**:
```json
{
  "streams": [
    {
      "name": "UltraStream 4K",
      "title": "4K REMUX • HEVC 10-bit • TrueHD Atmos 7.1 • 45.2 GB • 142 seeds",
      "url": "https://cdn.example.com/media/inception-4k-master.mkv",
      "quality": "4K REMUX",
      "resolution": "3840x2160",
      "codec": "HEVC Main 10",
      "audio": "Dolby Atmos 7.1 TrueHD",
      "size": "45.2 GB",
      "seeds": 142,
      "behaviorHints": {
        "notWebReady": false,
        "proxyHeaders": {
          "request": {
            "User-Agent": "NascentMediaPlayer/1.0"
          }
        }
      }
    },
    {
      "name": "P2P BitTorrent",
      "title": "1080p • 10-bit x265 • AAC 5.1 • 2.4 GB • 210 seeds",
      "infoHash": "8f0a3e8c9b1234567890abcdef1234567890abcd",
      "fileIdx": 0,
      "quality": "1080p"
    }
  ]
}
```

---

### 3.4 Subtitles (`/subtitles/{type}/{id}.json`)
Resolves subtitle tracks in WebVTT (.vtt) or SubRip (.srt).

- **URL Pattern**: `/subtitles/{type}/{id}.json`
- **Example Request**: `GET /subtitles/movie/tt1375666.json`
- **Response Format**:
```json
{
  "subtitles": [
    {
      "id": "sub-en-1",
      "url": "https://subs.example.com/en/inception.vtt",
      "lang": "English [SDH]",
      "label": "English Full SDH",
      "format": "vtt"
    },
    {
      "id": "sub-es-1",
      "url": "https://subs.example.com/es/inception.vtt",
      "lang": "Spanish",
      "label": "Español Latino",
      "format": "vtt"
    }
  ]
}
```

---

## 4. Media Player & Format Decoder Extensions

Unlike standard Stremio plugins which rely only on system codecs, this API allows plugins to register **Custom Decoders** and **Playback Enhancers**:

### 4.1 Custom Format Decoders (`formatDecoder`)
Enables playback of non-native web containers (e.g., `.mkv`, `.avi`, `.flac`) via WebCodecs and WASM demuxers.

```typescript
export interface CustomFormatDecoderConfig {
  supportedExtensions: string[]; // ['.mkv', '.avi', '.flac']
  supportedCodecs: string[]; // ['dts', 'truehd', 'ac3', 'av01']
  hardwareAccelerated: boolean;
  wasmModuleUrl?: string;
  workerScriptUrl?: string;
}
```

### 4.2 Playback Enhancers (`playbackEnhancer`)
Allows plugins to hook into player lifecycle events (`onTimeUpdate`, `onBuffering`, `onTrackLoaded`):
- `auto_skip_intro`: Provides start/end seconds for intros and credit sequences.
- `smart_eq`: Dynamic compression and dialogue amplification.
- `upscaling_shader`: WebGL anime super-resolution / edge sharpening.

---

## 5. Implementation Examples

### Example A: Node.js / Express Server

```javascript
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

const MANIFEST = {
  id: 'org.mycommunity.addon',
  name: 'My Custom Stream Addon',
  version: '1.0.0',
  description: 'Community stream resolver for movies and series',
  types: ['movie', 'series'],
  resources: ['stream'],
  idPrefixes: ['tt']
};

app.get('/manifest.json', (req, res) => {
  res.json(MANIFEST);
});

app.get('/stream/:type/:id.json', (req, res) => {
  const { type, id } = req.params;
  
  res.json({
    streams: [
      {
        name: 'MyAddon 4K Direct',
        title: `4K UHD • HEVC • ${id}`,
        url: `https://media.example.com/streams/${id}/master.m3u8`,
        quality: '4K UHD',
        resolution: '3840x2160'
      }
    ]
  });
});

app.listen(7000, () => console.log('Addon running at http://localhost:7000'));
```

---

### Example B: Python (FastAPI / Asynchronous)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MANIFEST = {
    "id": "org.python.streamhub",
    "name": "Python Stream Hub",
    "version": "1.0.0",
    "description": "Ultra fast asynchronous stream provider",
    "types": ["movie", "series"],
    "resources": ["stream"],
    "idPrefixes": ["tt"]
}

@app.get("/manifest.json")
def get_manifest():
    return MANIFEST

@app.get("/stream/{media_type}/{media_id}.json")
def get_streams(media_type: str, media_id: str):
    return {
        "streams": [
            {
                "name": "Python 4K Cache",
                "title": f"4K HDR • Direct Link • {media_id}",
                "url": f"https://streams.example.org/{media_id}.mp4",
                "quality": "4K HDR"
            }
        ]
    }
```

---

## 6. Installing & Testing Addons

In the app:
1. Open the **Plugins & Addons** modal via the top bar or settings.
2. Select **"Install Addon"**.
3. Paste the URL of your manifest:
   - `http://localhost:7000/manifest.json` (Local development)
   - `https://your-addon-name.vercel.app/manifest.json` (Production)
   - Stremio URLs like `stremio://your-addon.domain/manifest.json` are automatically normalized.
4. Use the built-in **Developer Sandbox** tab to test live requests with custom IMDb IDs (`tt1375666`, `tt0816692`) and inspect response times and raw JSON payloads.

---

## 7. Security & Sandboxing Rules

1. **CORS Headers**: All community addons must send `Access-Control-Allow-Origin: *`.
2. **Safe Secrets**: Addon configuration keys (like Real-Debrid tokens) are stored locally in the user's browser sandbox and passed securely via query parameters or custom URL segments (e.g. `https://addon.com/{api_key}/manifest.json`).
3. **No Native Execution**: All remote plugins execute strictly via HTTP REST. No executable binaries are permitted from untrusted URLs. Local media decoders use browser-standard WebCodecs and sandboxed WebAssembly.
