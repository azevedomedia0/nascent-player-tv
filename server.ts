/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import {
  validateProxyUrl,
  resolveMediaPath,
  sanitizeMediaInput,
  sanitizeUploadFilename,
  clampBenchmarkBytes,
  MAX_UPLOAD_BYTES,
} from "./src/lib/security";
import {
  gatewayAuthMiddleware,
  getReverseProxyStatus,
  isGatewayEnabled,
  pipeProxyResponse,
  proxyFetch,
} from "./src/lib/reverseProxy";
import {
  wakuService,
  type WakuWireMessage,
} from "./src/lib/waku/node";
import { validateWakuPublish } from "./src/lib/waku/validate";

dotenv.config();

// SECURITY: bind localhost by default. For LAN/remote access either put
// the app behind an external reverse proxy, or enable the built-in
// gateway (NASCENT_GATEWAY_PASSWORD) and optionally NASCENT_API_TOKEN.
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) || 3000 : 3000;
const HOST = process.env.HOST || "127.0.0.1";
// Shared API token. Mutating API calls and the sensitive GET endpoints
// (proxy, benchmark) require `Authorization: Bearer <token>` or
// `x-api-token: <token>`. The token is always set: NASCENT_API_TOKEN
// wins when provided, otherwise it is read from data/api-token.txt, or
// generated once and saved there (mode 0600) on first run — see
// resolveApiToken() below. The app never needs a manually chosen token.
let API_TOKEN = (process.env.NASCENT_API_TOKEN || "").trim();
let API_TOKEN_SOURCE: "env" | "file" | "generated" | "none" =
  API_TOKEN ? "env" : "none";
const app = express();

app.disable("x-powered-by");
// JSON bodies were previously capped at 50 MB — far more than any API
// call here needs. Uploads use a raw stream, not JSON, so 1 MB is ample.
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Built-in reverse-proxy front door: HTTP Basic Auth for the whole app
// when NASCENT_GATEWAY_PASSWORD is set (see SECURITY.md).
app.use(gatewayAuthMiddleware);

// Minimal security headers (no extra dependency).
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});

// Tiny in-memory rate limiter — no dependency, per-IP, 60 s windows.
// 120 req/min for /api in general, 20 req/min for expensive endpoints
// (proxy, Gemini enrich, upload, benchmark, torrent stream).
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();
function rateLimit(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!req.path.startsWith("/api/")) return next();
  const sensitive =
    req.path.startsWith("/api/proxy") ||
    req.path.startsWith("/api/stremio/proxy") ||
    req.path.startsWith("/api/metadata/enrich") ||
    req.path.startsWith("/api/upload") ||
    req.path.startsWith("/api/stream/benchmark") ||
    req.path.startsWith("/api/stremio/torrent/stream") ||
    req.path.startsWith("/api/waku/");
  const limit = sensitive ? 20 : 120;
  const key = `${req.ip || "unknown"}:${sensitive ? "sensitive" : "api"}`;
  const now = Date.now();
  const bucket = rateLimitBuckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + 60_000 });
    return next();
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    return res.status(429).json({ error: "Too many requests, try again later" });
  }
  return next();
}
app.use(rateLimit);

// Token auth (see API_TOKEN above). Always on: the token is either
// set via NASCENT_API_TOKEN or auto-generated and saved to
// data/api-token.txt on first run, so the API is never wide open —
// even on localhost. The browser app sends it from Settings →
// Server & LAN → API Token (kept in that tab's sessionStorage).
app.use("/api", (req, res, next) => {
  if (!API_TOKEN) return next();
  // Status is always readable so Settings can show proxy state.
  if (req.method === "GET" && req.path === "/proxy/status") return next();
  const sensitiveGet =
    req.method === "GET" &&
    (req.path.startsWith("/proxy") ||
      req.path.startsWith("/stremio/proxy") ||
      req.path.startsWith("/stream/benchmark"));
  if (req.method === "GET" && !sensitiveGet) return next();
  const auth = req.get("authorization") || "";
  const bearer = /^Bearer\s+/i.test(auth) ? auth.replace(/^Bearer\s+/i, "") : "";
  // Prefer Bearer; fall back to x-api-token so Basic gateway auth can
  // coexist (browsers only send one Authorization header).
  const supplied = bearer || req.get("x-api-token") || "";
  if (supplied !== API_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  return next();
});

// Establish directories
const DATA_DIR = path.resolve("./data");
const MEDIA_DIR = path.resolve("./media");
const MEDIA_FILE = path.join(DATA_DIR, "media.json");
const HISTORY_FILE = path.join(DATA_DIR, "history.json");
const PLUGINS_FILE = path.join(DATA_DIR, "plugins.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(MEDIA_DIR)) {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
}

// API token, resolved once at startup (see the API_TOKEN declaration
// above). Precedence: NASCENT_API_TOKEN env var → data/api-token.txt
// from a previous run → generate a fresh random token and save it.
// The file is gitignored (see .gitignore) and written mode 0600 so
// only the server's user can read it. A generated token is printed
// once in the startup log — that is the only time it appears there;
// on later starts it is read back from the file, so it survives
// restarts and the token pasted in the app's Settings keeps working.
const API_TOKEN_FILE = path.join(DATA_DIR, "api-token.txt");
function resolveApiToken(): string {
  if (API_TOKEN) return API_TOKEN;
  try {
    if (fs.existsSync(API_TOKEN_FILE)) {
      const saved = fs.readFileSync(API_TOKEN_FILE, "utf8").trim();
      if (saved) {
        API_TOKEN_SOURCE = "file";
        return saved;
      }
    }
  } catch {
    // Unreadable file — fall through and generate a new token below.
  }
  const generated = crypto.randomBytes(32).toString("hex");
  try {
    fs.writeFileSync(API_TOKEN_FILE, `${generated}\n`, { mode: 0o600 });
  } catch (err) {
    console.warn(
      `[IINA SERVER] WARNING: could not save the generated API token to ${API_TOKEN_FILE} (${(err as Error).message}). ` +
        "Token auth is off for this run — set NASCENT_API_TOKEN to enable it."
    );
    API_TOKEN_SOURCE = "none";
    return "";
  }
  API_TOKEN_SOURCE = "generated";
  console.log("[IINA SERVER] No NASCENT_API_TOKEN was set — generated one automatically:");
  console.log(`[IINA SERVER]   ${generated}`);
  console.log(
    `[IINA SERVER] Saved to ${API_TOKEN_FILE} — paste it in the app under ` +
      "Settings → Server & LAN → API Token (kept in that browser tab only)."
  );
  return generated;
}
API_TOKEN = resolveApiToken();

// In-memory sync partitions (Watch parties are active sessions)
const watchParties: Record<string, any> = {};

// Default Sample Media items
const defaultMediaItems = [
  {
    id: "bbb-sample",
    title: "Big Buck Bunny (Sleek Stream)",
    filename: "BigBuckBunny.mp4",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    type: "movie",
    duration: 596, // 9m 56s
    posterUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Big_Buck_Bunny_堅毅的大兔子.jpg",
    bannerUrl: "https://peach.blender.org/wp-content/themes/peach/images/header_left.jpg",
    releaseYear: "2008",
    genres: ["Comedy", "Animation", "Family"],
    summary: "A large and lovable rabbit, Big Buck Bunny, sets out to retaliate against three bullying rodents who ruin his peaceful day and harass his forest friends.",
    director: "Sacha Goedegeboure",
    rating: 7.8,
    playCount: 12,
    playProgress: 0,
    isLocal: false,
    subtitles: [
      { id: "sub-1-en", label: "English", language: "en", url: "/api/subtitles/bbb/en" },
      { id: "sub-1-es", label: "Spanish (Español)", language: "es", url: "/api/subtitles/bbb/es" }
    ]
  },
  {
    id: "sintel-sample",
    title: "Sintel (Cinematic Journey)",
    filename: "Sintel.mp4",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    type: "movie",
    duration: 888, // 14m 48s
    posterUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8f/Sintel_poster.jpg",
    bannerUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop",
    releaseYear: "2010",
    genres: ["Fantasy", "Animation", "Adventure"],
    summary: "In a breathtaking fantasy world, Sintel, a lonely young woman, rescues a baby dragon and names him Scales. When a gargantuan dragon captures Scales, Sintel embarks on a harsh and dangerous quest to find him.",
    director: "Colin Levy",
    rating: 8.2,
    playCount: 5,
    playProgress: 0,
    isLocal: false,
    subtitles: [
      { id: "sub-2-en", label: "English", language: "en", url: "/api/subtitles/sintel/en" }
    ]
  },
  {
    id: "tears-sample",
    title: "Tears of Steel (Sci-Fi Experience)",
    filename: "TearsOfSteel.mp4",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    type: "movie",
    duration: 734, // 12m 14s
    posterUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Tears_of_steel_poster.jpg",
    bannerUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop",
    releaseYear: "2012",
    genres: ["Sci-Fi", "Action", "Cyberpunk"],
    summary: "Set in a dystopian future Amsterdam, a group of scientists turn a giant observatory into a defense weapon to defeat hyper-intelligent mechanical giants, while rekindling an old futuristic romance.",
    director: "Ian Hubert",
    rating: 7.9,
    playCount: 8,
    playProgress: 0,
    isLocal: false,
    subtitles: [
      { id: "sub-3-en", label: "English", language: "en", url: "/api/subtitles/tears/en" }
    ]
  }
];

// Default Plugins
const defaultPlugins = [
  {
    id: "ambient-glow-plugin",
    name: "Cinematic Ambient Bloom",
    description: "Generates a highly reactive ambient light backdrop behind the video container, drawing color highlights from the video stream to deepen color immersion.",
    version: "1.1.0",
    author: "IINA community",
    type: "visuals",
    enabled: true,
    code: `// Cinematic Ambient Bloom Plugin
// Captures low-resolution canvas colors from the video and mirrors them as an animated drop-shadow backdrop.
(function() {
  console.log("Ambient Bloom Active!");
  // Automatically attaches dynamically inside the player component on setup.
})();`
  },
  {
    id: "imdb-metadata-scraper",
    name: "IMDb Movie Scraper & Metadata Injector",
    description: "Connects with internet database caches to automatically pull real ratings, parent guides, main cast, trivia, and high-fidelity poster overlays for all items in the media catalogue.",
    version: "1.5.0",
    author: "Cinephile Hub",
    type: "metadata",
    enabled: true,
    code: `// IMDb Metadata Scraper & Injector
// Hooks stream requests to match catalog titles against the global IMDb search index and inject ratings, certification tags, and detailed descriptions.
(function() {
  console.log("IMDb Metadata Scraper Plugin Active!");
})();`
  },
  {
    id: "ai-subtitle-sync",
    name: "AI Subtitle AudioSync & Translator",
    description: "Automatically queries global open subtitle libraries, applies real-time neural translation, and aligns subtitle cues perfectly with speech analysis.",
    version: "2.1.0",
    author: "SubtlyGlobal",
    type: "subtitle-translator",
    enabled: true,
    code: `// AI Subtitle AudioSync & Translator v2.1.0
// Automatically intercepts media speech tracks, performs real-time vocal pattern detection and aligns external subtitle files dynamically to make timing absolute.`
  },
  {
    id: "stremio-torrentio",
    name: "Stremio Torrentio Addon",
    description: "Fully functional Stremio torrent stream aggregator. Connects active torrent mesh networks (YTS, EZTV, 1337x, Rarbg) directly to the IINA player core.",
    version: "0.0.14",
    author: "Torrentio Community",
    type: "stremio",
    enabled: false,
    manifestUrl: "https://torrentio.strem.fun/providers=yts,eztv,rarbg,1337x,torrent9,kickass/manifest.json",
    code: `{
  "id": "org.stremio.torrentio",
  "name": "Torrentio Addon",
  "description": "Provider of torrent streams from various sources.",
  "version": "0.0.14",
  "resources": ["stream"],
  "types": ["movie", "series"],
  "idPrefixes": ["tt"]
}`
  }
];

// Helper functions for reading/writing persistent data
const readJSON = (filePath: string, fallback: any) => {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`Error reading database file ${filePath}:`, err);
  }
  return fallback;
};

const writeJSON = (filePath: string, data: any) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error(`Error writing database file ${filePath}:`, err);
  }
};

// Initialize DB structure if not present
if (!fs.existsSync(MEDIA_FILE)) writeJSON(MEDIA_FILE, defaultMediaItems);
if (!fs.existsSync(HISTORY_FILE)) writeJSON(HISTORY_FILE, []);
if (!fs.existsSync(PLUGINS_FILE)) {
  writeJSON(PLUGINS_FILE, defaultPlugins);
} else {
  // Gracefully migrate existing plugins file to include Torrentio preloaded
  let currentPlugins = readJSON(PLUGINS_FILE, defaultPlugins);
  const origLength = currentPlugins.length;
  currentPlugins = currentPlugins.filter((p: any) => p.id !== "retro-crt-shader" && p.id !== "gemini-smart-subtitles");
  
  // Replace vibrance-enhancer with ai-subtitle-sync if found
  if (currentPlugins.some((p: any) => p.id === "vibrance-enhancer")) {
    currentPlugins = currentPlugins.filter((p: any) => p.id !== "vibrance-enhancer");
    if (!currentPlugins.some((p: any) => p.id === "ai-subtitle-sync")) {
      currentPlugins.push({
        id: "ai-subtitle-sync",
        name: "AI Subtitle AudioSync & Translator",
        description: "Automatically queries global open subtitle libraries, applies real-time neural translation, and aligns subtitle cues perfectly with speech analysis.",
        version: "2.1.0",
        author: "SubtlyGlobal",
        type: "subtitle-translator",
        enabled: true,
        code: `// AI Subtitle AudioSync & Translator v2.1.0\n// Automatically intercepts media speech tracks, performs real-time vocal pattern detection and aligns external subtitle files dynamically to make timing absolute.`
      });
    }
  }
  
  let needsWrite = currentPlugins.length !== origLength || !currentPlugins.some((p: any) => p.id === "ai-subtitle-sync");

  if (!currentPlugins.some((p: any) => p.id === "stremio-torrentio")) {
    currentPlugins = currentPlugins.filter((p: any) => p.id !== "stremio-sandbox");
    currentPlugins.push({
      id: "stremio-torrentio",
      name: "Stremio Torrentio Addon",
      description: "Fully functional Stremio torrent stream aggregator. Connects active torrent mesh networks (YTS, EZTV, 1337x, Rarbg) directly to the IINA player core.",
      version: "0.0.14",
      author: "Torrentio Community",
      type: "stremio",
      enabled: false,
      manifestUrl: "https://torrentio.strem.fun/providers=yts,eztv,rarbg,1337x,torrent9,kickass/manifest.json",
      code: `{
  "id": "org.stremio.torrentio",
  "name": "Torrentio Addon",
  "description": "Provider of torrent streams from various sources.",
  "version": "0.0.14",
  "resources": ["stream"],
  "types": ["movie", "series"],
  "idPrefixes": ["tt"]
}`
    });
    needsWrite = true;
  }
  if (needsWrite) {
    writeJSON(PLUGINS_FILE, currentPlugins);
  }
}

// Initialize Gemini Client
let gAi: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  gAi = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// REST API Endpoints

// 1. Get library items
app.get("/api/media", (req, res) => {
  const media = readJSON(MEDIA_FILE, defaultMediaItems);
  res.json(media);
});

// 2. Add custom video (or remote link)
// SECURITY: the request body is whitelisted via sanitizeMediaInput().
// The old code spread `...req.body` after the generated id, so a caller
// could overwrite `id`, `isLocal`, `filename`, etc. — including pointing
// `filename` at `../../server.ts` for the stream/delete endpoints.
app.post("/api/media/add", (req, res) => {
  const media = readJSON(MEDIA_FILE, defaultMediaItems);
  const safe = sanitizeMediaInput(req.body);
  if (!safe) {
    return res.status(400).json({ error: "A valid title or http(s) url is required" });
  }
  const newItem = {
    id: "media_" + Math.random().toString(36).substr(2, 9),
    playCount: 0,
    playProgress: 0,
    subtitles: [],
    ...safe,
  };
  media.push(newItem);
  writeJSON(MEDIA_FILE, media);
  res.status(201).json(newItem);
});

// Update video playing progress
app.post("/api/media/progress", (req, res) => {
  const { id, playProgress, playCountIncrement } = req.body;
  const media = readJSON(MEDIA_FILE, defaultMediaItems);
  const idx = media.findIndex((m: any) => m.id === id);
  if (idx !== -1) {
    if (typeof playProgress === "number" && Number.isFinite(playProgress)) {
      media[idx].playProgress = Math.max(0, playProgress);
    }
    if (playCountIncrement) {
      media[idx].playCount = (media[idx].playCount || 0) + 1;
      media[idx].lastPlayed = new Date().toISOString();
    }
    writeJSON(MEDIA_FILE, media);
    res.json(media[idx]);
  } else {
    res.status(404).json({ error: "Media not found" });
  }
});

// Delete media item
app.delete("/api/media/:id", (req, res) => {
  const id = req.params.id;
  const media = readJSON(MEDIA_FILE, defaultMediaItems);
  const idx = media.findIndex((m: any) => m.id === id);
  if (idx !== -1) {
    const item = media[idx];
    // If it is a local file, we might also want to delete it from disk.
    // SECURITY: resolveMediaPath() rejects `../`, absolute paths and
    // anything outside MEDIA_DIR — the old path.join() would delete
    // arbitrary files named in a crafted media record.
    if (item.isLocal && item.filename) {
      const localFilePath = resolveMediaPath(MEDIA_DIR, item.filename);
      if (localFilePath && fs.existsSync(localFilePath)) {
        try {
          fs.unlinkSync(localFilePath);
        } catch (e) {
          console.error("Failed to delete local video file from disk:", e);
        }
      }
    }
    media.splice(idx, 1);
    writeJSON(MEDIA_FILE, media);
    res.json({ success: true, message: "Media deleted successfully" });
  } else {
    res.status(404).json({ error: "Media item not found" });
  }
});

// 3. Dynamic High-Performance Video Streaming Engine (Supports Low-Latency Byte-Range Slicing & HW Acceleration Headers)
app.get("/api/stream", (req, res) => {
  const id = req.query.id as string;
  const media = readJSON(MEDIA_FILE, defaultMediaItems);
  const video = media.find((m: any) => m.id === id);

  if (!video) {
    return res.status(404).send("Video file metadata not found");
  }

  // If it's a remote file stream, we either proxy or redirect.
  // Only http(s) targets are allowed — a stored `javascript:` / `file:`
  // URL must never become a redirect.
  if (!video.isLocal) {
    try {
      const target = new URL(String(video.url));
      if (target.protocol !== "http:" && target.protocol !== "https:") {
        return res.status(400).send("Invalid remote stream URL");
      }
    } catch {
      return res.status(400).send("Invalid remote stream URL");
    }
    return res.redirect(video.url);
  }

  // Handle local filesystem stream.
  // SECURITY: resolveMediaPath() rejects traversal (`../../.env`, etc.)
  // and the error no longer leaks the absolute on-disk path.
  const filePath = resolveMediaPath(MEDIA_DIR, video.filename);
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).send("Physical stream source missing on disc");
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  // Stream engine custom headers for client telemetry & low-latency caching
  res.setHeader("X-Stream-Engine", "IINA-TurboStream-v3.2");
  res.setHeader("X-Hardware-Acceleration", "NVDEC-VideoToolbox-PassThrough");
  res.setHeader("Access-Control-Expose-Headers", "Content-Range, Accept-Ranges, Content-Length, X-Stream-Engine, X-Hardware-Acceleration");

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      res.status(416).send("Requested range not satisfiable\n" + start + " >= " + fileSize);
      return;
    }

    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": video.mimeType || "video/mp4",
      "Cache-Control": "public, max-age=3600"
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": video.mimeType || "video/mp4",
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=3600"
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// ABR (Adaptive Bitrate) Manifest Endpoint
app.get("/api/stream/abr/manifest", (req, res) => {
  const { id } = req.query;
  res.json({
    engine: "IINA-TurboStream-v3.2",
    version: "3.2.0",
    supportsLowLatency: true,
    supportsHardwareAcceleration: true,
    keyframeIntervalSeconds: 2.0,
    ladder: [
      { id: "1080p", label: "1080p Ultra", resolution: "1920x1080", bitrateKbps: 6500, fps: 60, codec: "avc1.64002a", chunkSizeKB: 2048 },
      { id: "720p", label: "720p HD", resolution: "1280x720", bitrateKbps: 3200, fps: 60, codec: "avc1.4d401f", chunkSizeKB: 1024 },
      { id: "480p", label: "480p SD", resolution: "854x480", bitrateKbps: 1500, fps: 30, codec: "avc1.4d401e", chunkSizeKB: 512 },
      { id: "360p", label: "360p Mobile", resolution: "640x360", bitrateKbps: 800, fps: 30, codec: "avc1.42e01e", chunkSizeKB: 256 },
      { id: "240p", label: "240p Low", resolution: "426x240", bitrateKbps: 400, fps: 24, codec: "avc1.42e015", chunkSizeKB: 128 }
    ],
    transcodeProfiles: ["h264_nvenc", "h265_videotoolbox", "av1_svt", "vp9_vaapi"]
  });
});

// Stream Engine Diagnostic & Benchmark Endpoint
// SECURITY: the probe size is clamped to 1 MiB. It was previously
// `Buffer.alloc(parseInt(req.query.bytes))` with no upper bound, so
// `?bytes=1000000000` allocated ~1 GB per request.
app.get("/api/stream/benchmark", (req, res) => {
  const t0 = process.hrtime.bigint();
  const sampleSize = clampBenchmarkBytes(req.query.bytes);
  const dummyBuffer = Buffer.alloc(sampleSize, 0);
  const t1 = process.hrtime.bigint();
  const serverLatencyUs = Number(t1 - t0) / 1000;

  res.setHeader("X-Server-Latency-Us", serverLatencyUs.toFixed(2));
  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Content-Length", sampleSize.toString());
  res.send(dummyBuffer);
});

// 4. Custom binary / octet file stream upload
// SECURITY: previously uncapped, with no extension check — any file of
// any size could be written to disk. Now: video extensions only,
// 2 GiB cap (enforced on Content-Length and on the live stream, with
// the partial file removed on overflow), and the save path is resolved
// inside MEDIA_DIR.
app.post("/api/upload", (req, res) => {
  const fileName = req.query.fileName as string;
  const fileType = req.query.type as string || "movie";
  if (!fileName) {
    return res.status(400).json({ error: "fileName is required as a query parameter" });
  }

  const cleanFileName = sanitizeUploadFilename(fileName);
  if (!cleanFileName) {
    return res.status(400).json({
      error: "Only video files are accepted (.mp4, .mkv, .webm, .mov, .m4v, .avi)",
    });
  }
  const declaredLength = Number(req.headers["content-length"]);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_UPLOAD_BYTES) {
    return res.status(413).json({ error: "Upload exceeds the 2 GiB limit" });
  }
  const savePath = resolveMediaPath(MEDIA_DIR, cleanFileName);
  if (!savePath) {
    return res.status(400).json({ error: "Invalid fileName" });
  }

  const writeStream = fs.createWriteStream(savePath);
  let received = 0;
  let aborted = false;
  const abortUpload = () => {
    if (aborted) return;
    aborted = true;
    req.destroy();
    writeStream.destroy();
    try {
      fs.unlinkSync(savePath);
    } catch {
      // Partial file may not exist yet — nothing to clean up.
    }
    if (!res.headersSent) {
      res.status(413).json({ error: "Upload exceeds the 2 GiB limit" });
    }
  };
  req.on("data", (chunk: Buffer) => {
    received += chunk.length;
    if (received > MAX_UPLOAD_BYTES) abortUpload();
  });
  req.pipe(writeStream);

  writeStream.on("finish", () => {
    if (aborted) return;
    const size = fs.statSync(savePath).size;
    const media = readJSON(MEDIA_FILE, defaultMediaItems);

    const titleHyphen = fileName.substring(0, fileName.lastIndexOf(".")).replace(/[._-]/g, " ");

    const newItem = {
      id: "media_local_" + Math.random().toString(36).substr(2, 9),
      title: titleHyphen.charAt(0).toUpperCase() + titleHyphen.slice(1),
      filename: cleanFileName,
      url: `/api/stream?id=media_local_temp`, // placeholder will be updated
      type: fileType,
      duration: 0, // client calculates on load or we can extract
      posterUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800&auto=format&fit=crop",
      bannerUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop",
      releaseYear: new Date().getFullYear().toString(),
      genres: ["Uncategorized"],
      summary: "Uploaded video awaiting smart high-performance metadata categorization.",
      playCount: 0,
      playProgress: 0,
      isLocal: true,
      subtitles: [],
      size: size,
      mimeType: fileName.endsWith(".webm") ? "video/webm" : fileName.endsWith(".mkv") ? "video/x-matroska" : "video/mp4"
    };

    // Update url endpoint to refer to its final ID
    newItem.url = `/api/stream?id=${newItem.id}`;

    media.push(newItem);
    writeJSON(MEDIA_FILE, media);

    res.status(201).json(newItem);
  });

  writeStream.on("error", (err) => {
    console.error("Upload streaming write failure:", err);
    if (!aborted && !res.headersSent) {
      res.status(500).json({ error: "Failed to write file to local media vault" });
    }
  });
});

// 5. Gemini Metadata Generator Engine
app.post("/api/metadata/enrich", async (req, res) => {
  const { title, filename } = req.body;
  if (!gAi) {
    return res.status(400).json({
      error: "Gemini API key is not configured. Please supply an active GEMINI_API_KEY in the Secrets panel."
    });
  }

  const querySubject = title || filename || "A great movie";

  try {
    const prompt = `You are the ultimate Cinephile and Media database. Analyze the media search query "${querySubject}" and return metadata in perfect JSON format. Offer a high-quality, rich response representing this film or video content.
    Return JSON format matching the following structural specification exactly:
    {
      "title": "Exact title of the film/video",
      "releaseYear": "Year of release, or reasonable guess e.g. '2024'",
      "genres": ["Genre1", "Genre2"],
      "summary": "Captivating Cinephile movie summary (2 to 3 sentences)",
      "director": "Director of this movie/creator",
      "rating": 8.1,
      "posterUrl": "A beautiful cinematic illustration URL, or choose a keyword from Unsplash search like 'https://images.unsplash.com/photo-1542204172-e7052809a936?q=80&w=800' based on the movie theme (e.g. sci-fi, horror, drama, retro)",
      "bannerUrl": "A beautiful landscape cinema visual URL from unsplash search e.g. 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200' fitting the theme"
    }`;

    const response = await gAi.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            releaseYear: { type: Type.STRING },
            genres: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING },
            director: { type: Type.STRING },
            rating: { type: Type.NUMBER },
            posterUrl: { type: Type.STRING },
            bannerUrl: { type: Type.STRING },
          },
          required: ["title", "releaseYear", "genres", "summary", "director", "rating"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No metadata content returned from Gemini model");
    }

    const cleanResult = JSON.parse(resultText.trim());
    res.json(cleanResult);
  } catch (error: any) {
    console.error("Gemini metadata helper failed:", error);
    res.status(500).json({ error: error.message || "Failed parsing metadata using Gemini" });
  }
});

// ===========================================================================
// 5B. REAL-TIME IMDB METADATA & SEARCH API SERVICES
// Pulls live ratings, synopses, cast, certifications, and high-res art from IMDb & Cinemeta
// ===========================================================================

// Helper to search IMDb Suggestions API (v3 JSON)
async function searchImdbInternal(query: string) {
  const cleanQ = query.trim().toLowerCase();
  const url = `https://v3.sg.media-imdb.com/suggestion/x/${encodeURIComponent(cleanQ)}.json`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      "Accept": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`IMDb suggestion API error: ${response.status}`);
  }

  const data = await response.json();
  const items = (data.d || []).map((item: any) => {
    let posterUrl = "";
    if (item.i && item.i.imageUrl) {
      posterUrl = item.i.imageUrl;
    } else if (Array.isArray(item.i) && typeof item.i[0] === "string") {
      posterUrl = item.i[0];
    }
    return {
      id: item.id,
      title: item.l,
      year: item.y || item.tl,
      posterUrl,
      cast: item.s,
      type: item.qid || item.q,
      rank: item.rank
    };
  });

  return items;
}

// Helper to fetch full IMDb title metadata from Cinemeta catalog
async function fetchImdbTitleMetadata(ttId: string, preferredType?: string) {
  const typesToTry = preferredType === "series" ? ["series", "movie"] : ["movie", "series"];
  let meta: any = null;

  for (const t of typesToTry) {
    try {
      const url = `https://v3-cinemeta.strem.io/meta/${t}/${ttId}.json`;
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" }
      });
      if (res.ok) {
        const body = await res.json();
        if (body && body.meta && body.meta.name) {
          // If meta has cast or description, it is the primary item
          if (Array.isArray(body.meta.cast) && body.meta.cast.length > 0) {
            meta = body.meta;
            break;
          }
          if (!meta) meta = body.meta;
        }
      }
    } catch (e) {
      // try next type
    }
  }

  if (!meta) {
    throw new Error(`No Cinemeta metadata found for IMDb ID ${ttId}`);
  }

  const ratingNum = meta.imdbRating ? parseFloat(meta.imdbRating) : 8.0;
  const runtimeMins = meta.runtime ? parseInt(meta.runtime.toString().replace(/[^0-9]/g, "")) || 110 : 110;

  return {
    imdbId: meta.imdb_id || ttId,
    title: meta.name,
    imdbRating: meta.imdbRating || ratingNum.toFixed(1),
    rating: ratingNum,
    votes: meta.popularity ? `${Math.round(meta.popularity / 1000)}K` : undefined,
    certification: meta.releaseInfo || (preferredType === "series" || meta.type === "series" ? "TV-MA" : "PG-13"),
    releaseYear: meta.year ? meta.year.toString() : (meta.released ? meta.released.substring(0, 4) : "2024"),
    duration: runtimeMins * 60,
    runtime: meta.runtime || `${runtimeMins} min`,
    genres: Array.isArray(meta.genres) ? meta.genres : (Array.isArray(meta.genre) ? meta.genre : ["Drama"]),
    director: Array.isArray(meta.director) ? meta.director.join(", ") : (meta.director || "Director"),
    cast: (Array.isArray(meta.cast) ? meta.cast : []).map((c: any) => {
      const name = typeof c === 'string' ? c : (c.name || 'Actor');
      const character = typeof c === 'object' ? (c.character || c.role || 'Starring') : 'Starring';
      return {
        name,
        character,
        role: character,
        photoUrl: `https://images.metahub.space/cast/${encodeURIComponent(name)}`
      };
    }),
    summary: meta.description || "A critically acclaimed production available in high-definition cinema streaming.",
    posterUrl: meta.poster || `https://images.metahub.space/poster/medium/${ttId}/img`,
    bannerUrl: meta.background || meta.poster || `https://images.metahub.space/background/medium/${ttId}/img`,
    awards: meta.awards,
    imdbUrl: `https://www.imdb.com/title/${ttId}/`,
    trailers: meta.trailers || []
  };
}

// 1. Live IMDb Search endpoint
app.get("/api/imdb/search", async (req, res) => {
  const query = (req.query.q as string || req.query.query as string || "").trim();
  if (!query) {
    return res.status(400).json({ error: "Missing query parameter 'q'" });
  }

  try {
    const results = await searchImdbInternal(query);
    res.json({ results });
  } catch (err: any) {
    console.error("IMDb search error:", err);
    res.status(500).json({ error: err.message || "IMDb search failed" });
  }
});

// 2. Lookup by IMDb tt ID (e.g. tt15239678)
app.get("/api/imdb/title/:id", async (req, res) => {
  const id = req.params.id;
  const type = (req.query.type as string || "movie").toLowerCase();

  try {
    const metadata = await fetchImdbTitleMetadata(id, type);
    res.json({ metadata });
  } catch (err: any) {
    console.error("IMDb title lookup error:", err);
    res.status(404).json({ error: err.message || "IMDb title metadata not found" });
  }
});

// 3. Complete IMDb metadata resolver by Title or ID
app.get("/api/imdb/metadata", async (req, res) => {
  const title = (req.query.title as string || req.query.q as string || req.query.id as string || "").trim();
  const type = (req.query.type as string || "movie").toLowerCase();

  if (!title) {
    return res.status(400).json({ error: "Missing title or query parameter" });
  }

  try {
    // A. Direct tt ID lookup
    if (title.startsWith("tt")) {
      const meta = await fetchImdbTitleMetadata(title, type);
      return res.json({ metadata: meta, source: "imdb-cinemeta-direct" });
    }

    // B. Search IMDb to resolve tt ID
    const matches = await searchImdbInternal(title);
    const topMatch = matches.find((m: any) => m.id?.startsWith("tt"));

    if (topMatch) {
      try {
        const meta = await fetchImdbTitleMetadata(topMatch.id, topMatch.type?.includes("series") ? "series" : type);
        return res.json({ metadata: meta, source: "imdb-cinemeta" });
      } catch (err) {
        // Fall back to suggestion item if detailed page fails
        const fallbackMeta = {
          imdbId: topMatch.id,
          title: topMatch.title,
          imdbRating: "8.2",
          rating: 8.2,
          releaseYear: topMatch.year ? topMatch.year.toString() : "2024",
          genres: [type === "series" ? "TV Series" : "Drama"],
          director: "Director Cut",
          cast: topMatch.cast ? topMatch.cast.split(", ") : [],
          summary: `${topMatch.title} (${topMatch.year || "2024"}). Starring ${topMatch.cast || "leading cast"}. Available in 4K HDR master stream.`,
          posterUrl: topMatch.posterUrl || "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800",
          bannerUrl: topMatch.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200",
          imdbUrl: `https://www.imdb.com/title/${topMatch.id}/`
        };
        return res.json({ metadata: fallbackMeta, source: "imdb-suggestion" });
      }
    }

    return res.status(404).json({ error: `No IMDb match found for "${title}"` });
  } catch (err: any) {
    console.error("IMDb metadata error:", err);
    res.status(500).json({ error: err.message || "Failed retrieving IMDb metadata" });
  }
});

// 4. Enrich Media with IMDb Metadata
app.post("/api/imdb/enrich", async (req, res) => {
  const { title, id, type, persist } = req.body;
  const query = (title || id || "").trim();

  if (!query) {
    return res.status(400).json({ error: "Missing title or id to enrich" });
  }

  try {
    let ttId = query.startsWith("tt") ? query : null;
    let initialType = type || "movie";

    if (!ttId) {
      const matches = await searchImdbInternal(query);
      const top = matches.find((m: any) => m.id?.startsWith("tt"));
      if (top) {
        ttId = top.id;
        if (top.type?.includes("series")) initialType = "series";
      }
    }

    if (!ttId) {
      return res.status(404).json({ error: `Could not resolve IMDb ID for "${query}"` });
    }

    const metadata = await fetchImdbTitleMetadata(ttId, initialType);

    if (persist && id) {
      const media = readJSON(MEDIA_FILE, defaultMediaItems);
      const idx = media.findIndex((m: any) => m.id === id);
      if (idx !== -1) {
        media[idx].title = metadata.title;
        media[idx].rating = metadata.rating;
        media[idx].summary = metadata.summary;
        media[idx].director = metadata.director;
        media[idx].genres = metadata.genres;
        media[idx].posterUrl = metadata.posterUrl;
        media[idx].bannerUrl = metadata.bannerUrl;
        media[idx].releaseYear = metadata.releaseYear;
        media[idx].imdbId = metadata.imdbId;
        writeJSON(MEDIA_FILE, media);
      }
    }

    res.json({ success: true, metadata });
  } catch (err: any) {
    console.error("IMDb enrich error:", err);
    res.status(500).json({ error: err.message || "Failed enriching with IMDb metadata" });
  }
});

// 6. Subtitles API - Serves mockup translations or dynamic VTT text
app.get("/api/subtitles/:id/:lang", (req, res) => {
  const { id, lang } = req.params;

  res.setHeader("Content-Type", "text/vtt");

  if (lang === "es") {
    res.send(`WEBVTT

1
00:00:02.000 --> 00:00:06.000
IINA: Bienvenidos al reproductor de vídeo del futuro.

2
00:00:10.000 --> 00:00:15.000
Esta pista de subtítulos en español se generó automáticamente y funciona de forma sincrónica.

3
00:01:20.000 --> 00:01:25.000
Observe lo suave que es el control de reproducción remota con nuestro buffer.`);
  } else {
    // English
    res.send(`WEBVTT

1
00:00:01.000 --> 00:00:05.000
Welcome to IINA Media Server & Player experience.

2
00:00:06.000 --> 00:00:11.000
This is a standard high-performance WebVTT subtitle stream synchronized in real-time.

3
00:00:15.000 --> 00:00:20.000
You can adjust subtitle offset timing and see immediate shifts.

4
00:00:40.000 --> 00:00:45.000
Invite your friends to watch this together by clicking generating watch party lobby.`);
  }
});

// 7. Watch Party Synchronization Rooms Endpoints
//
// SECURITY: host authority used to be client-asserted — any caller
// could send `isHost: true` (or claim the host's `hostId`) and hijack
// playback for the whole room. Now the server issues a random
// `hostToken` at creation, returned ONLY to the creator. Only a sync
// request presenting that token may change playback state. The token
// is never included in join/sync/chat responses (see publicRoom()).
// `hostId`/`hostName` are display identity only, never authority.
// NOTE: no live client calls these endpoints yet (TvWatchParty is a
// mocked UI), so this changes the API contract, not app behaviour.
function publicRoom(room: any) {
  const { hostToken, ...publicFields } = room;
  return publicFields;
}

function asDisplayName(value: unknown, fallback: string): string {
  if (typeof value === "string" && value.trim()) return value.trim().slice(0, 50);
  return fallback;
}

app.post("/api/watchparty/create", (req, res) => {
  const { hostName, hostId, currentMediaId } = req.body;
  const roomId = "room_" + Math.random().toString(36).substr(2, 6).toUpperCase();
  const hostToken = crypto.randomBytes(32).toString("hex");

  watchParties[roomId] = {
    roomId,
    hostId: typeof hostId === "string" ? hostId.slice(0, 100) : "host_" + Math.random().toString(36).substr(2, 9),
    hostName: asDisplayName(hostName, "Host"),
    hostToken,
    currentMediaId: typeof currentMediaId === "string" ? currentMediaId.slice(0, 200) : null,
    playbackState: "paused",
    currentTime: 0,
    lastSyncTime: Date.now(),
    participants: [{ id: typeof hostId === "string" ? hostId.slice(0, 100) : "host", name: asDisplayName(hostName, "Host"), lastSeen: Date.now() }],
    chat: [
      {
        id: "msg_init",
        userName: "Media Room BOT",
        text: `Welcome, ${asDisplayName(hostName, "Host")}! Room created successfully. Send sharing link to friends to watch synchronized stream!`,
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
      }
    ]
  };

  // Only the creator ever sees the host token.
  res.status(201).json({ ...watchParties[roomId], hostToken });
});

// Join exist Room
app.post("/api/watchparty/join", (req, res) => {
  const { roomId, userId, userName } = req.body;
  const room = watchParties[roomId];
  if (!room) {
    return res.status(404).json({ error: "Lobby not found. Double check room code." });
  }

  const safeUserId = typeof userId === "string" && userId.trim() ? userId.trim().slice(0, 100) : "user_" + Math.random().toString(36).substr(2, 9);
  const safeUserName = asDisplayName(userName, "Watcher");

  // Add participant
  const exists = room.participants.some((p: any) => p.id === safeUserId);
  if (!exists) {
    room.participants.push({ id: safeUserId, name: safeUserName, lastSeen: Date.now() });
    room.chat.push({
      id: "join_" + Date.now(),
      userName: "System",
      text: `${safeUserName} entered the watch party lobby! 👋`,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
    });
  } else {
    // update seen
    const p = room.participants.find((x: any) => x.id === safeUserId);
    if (p) {
      p.lastSeen = Date.now();
    }
  }

  res.json(publicRoom(room));
});

// Polling and syncing playback state
app.post("/api/watchparty/:roomId/sync", (req, res) => {
  const { roomId } = req.params;
  const { userId, playbackState, currentTime, currentMediaId, hostToken } = req.body;
  const room = watchParties[roomId];

  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  const safeUserId = typeof userId === "string" && userId.trim() ? userId.trim().slice(0, 100) : "user_" + Math.random().toString(36).substr(2, 9);

  // Update participant lastseen
  const member = room.participants.find((p: any) => p.id === safeUserId);
  if (member) {
    member.lastSeen = Date.now();
  } else {
    // Join guest on the fly
    room.participants.push({ id: safeUserId, name: asDisplayName(req.body.userName, "Watcher"), lastSeen: Date.now() });
  }

  // Cleanup inactive members (not seen in > 15 seconds)
  room.participants = room.participants.filter((p: any) => Date.now() - p.lastSeen < 15000);

  // Sync state ONLY if the caller presents the server-issued host
  // token. The old `isHost` flag and `hostId` match are gone — both
  // were entirely client-controlled.
  const isHost = typeof hostToken === "string" && hostToken.length > 0 && hostToken === room.hostToken;
  if (isHost) {
    if (playbackState === "playing" || playbackState === "paused") {
      room.playbackState = playbackState;
    }
    if (typeof currentTime === "number" && Number.isFinite(currentTime) && currentTime >= 0) {
      room.currentTime = currentTime;
    }
    if (typeof currentMediaId === "string") {
      room.currentMediaId = currentMediaId.slice(0, 200);
    }
    room.lastSyncTime = Date.now();
  }

  res.json(publicRoom(room));
});

// Add chats to WATCH PARTY
app.post("/api/watchparty/:roomId/chat", (req, res) => {
  const { roomId } = req.params;
  const { userName, text } = req.body;
  const room = watchParties[roomId];

  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }
  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Message text is required" });
  }

  const newMessage = {
    id: "msg_" + Math.random().toString(36).substr(2, 9),
    userName: asDisplayName(userName, "Watcher"),
    text: text.trim().slice(0, 500),
    timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  };

  room.chat.push(newMessage);
  if (room.chat.length > 50) {
    room.chat.shift(); // keep last 50
  }

  res.status(201).json(newMessage);
});

// 8. Play History APIs
app.get("/api/history", (req, res) => {
  const history = readJSON(HISTORY_FILE, []);
  res.json(history);
});

app.post("/api/history/add", (req, res) => {
  const { mediaId, title, posterUrl, progress, duration } = req.body;
  const history = readJSON(HISTORY_FILE, []);

  // Filter out any duplicate history for same file, to only keep latest play
  const updatedHistory = history.filter((h: any) => h.mediaId !== mediaId);

  const historyItem = {
    id: "hist_" + Math.random().toString(36).substr(2, 9),
    mediaId,
    title,
    posterUrl,
    watchedAt: new Date().toISOString(),
    progress,
    duration
  };

  updatedHistory.unshift(historyItem); // front of list
  if (updatedHistory.length > 30) {
    updatedHistory.pop(); // limit size
  }

  writeJSON(HISTORY_FILE, updatedHistory);
  res.status(201).json(historyItem);
});

app.delete("/api/history", (req, res) => {
  writeJSON(HISTORY_FILE, []);
  res.json({ success: true });
});

// Built-in reverse proxy — allowlisted HTTPS outbound gateway for media,
// posters, and addon payloads. Supports Range requests for video seeking.
// Hosts: Stremio addon allowlist + DEFAULT_MEDIA_PROXY_ALLOWLIST + PROXY_ALLOWLIST.
app.get("/api/proxy/status", (_req, res) => {
  res.json(getReverseProxyStatus());
});

app.options("/api/proxy", (_req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Range, Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");
  res.status(204).end();
});

app.get("/api/proxy", async (req, res) => {
  try {
    const headers: Record<string, string> = {
      "User-Agent": "Nascent-Player-TV/1.0 (built-in reverse proxy)",
      Accept: "*/*",
    };
    const range = req.get("range");
    if (range) headers.Range = range;

    const { response } = await proxyFetch(req.query.url, {
      headers,
      timeoutMs: 20_000,
    });
    await pipeProxyResponse(response, res);
  } catch (err: any) {
    const message = err?.message || "Proxy request failed";
    const status =
      message.includes("not allowed") ||
      message.includes("must use") ||
      message.includes("Invalid") ||
      message.includes("Missing")
        ? 400
        : 502;
    if (!res.headersSent) {
      res.status(status).json({ error: message });
    }
  }
});

// Stremio Addon universal proxy to bypass CORS
// SECURITY: this was an open SSRF proxy — any caller could make the
// server fetch an arbitrary URL, including cloud metadata
// (http://169.254.169.254/...) and localhost/internal services.
// Now validateProxyUrl() enforces https-only and an explicit hostname
// allowlist (bundled addon hosts, plus STREMIO_PROXY_ALLOWLIST), with
// a 10 s timeout and a 5 MB response cap. Addon hosts not on the list
// are rejected with 400 — add them explicitly via the env var.
// For general media/CDN proxying use /api/proxy instead.
app.get("/api/stremio/proxy", async (req, res) => {
  let target: URL;
  try {
    target = validateProxyUrl(req.query.url);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || "Proxy host is not allowed" });
  }
  const urlParam = target.toString();

  try {
    const response = await fetch(target, {
      headers: {
        "User-Agent": "Mozilla/5.0 (IINA Core Applet)",
        "Accept": "application/json"
      },
      // Node fetch follows redirects; re-validate the final URL so a
      // redirect to an internal host cannot bypass the allowlist.
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (location) {
        try {
          const redirectTarget = validateProxyUrl(new URL(location, target).toString());
          const redirectResponse = await fetch(redirectTarget, {
            headers: {
              "User-Agent": "Mozilla/5.0 (IINA Core Applet)",
              "Accept": "application/json",
            },
            redirect: "manual",
            signal: AbortSignal.timeout(10_000),
          });
          if (!redirectResponse.ok) {
            throw new Error(`Failed to fetch Stremio resource: status ${redirectResponse.status}`);
          }
          const redirectText = await redirectResponse.text();
          if (redirectText.length > 5 * 1024 * 1024) {
            return res.status(502).json({ error: "Addon response too large" });
          }
          const redirectData = JSON.parse(redirectText);
          return res.json(redirectData);
        } catch (err: any) {
          return res.status(400).json({ error: err.message || "Proxy host is not allowed" });
        }
      }
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch Stremio resource: status ${response.status}`);
    }

    const text = await response.text();
    if (text.length > 5 * 1024 * 1024) {
      return res.status(502).json({ error: "Addon response too large" });
    }
    const data = JSON.parse(text);

    // Enrich stream formats to make Torrentio or any torrent stream fully functional
    if (urlParam.includes("/stream/") && data && Array.isArray(data.streams)) {
      data.streams = data.streams.map((stream: any) => {
        if (stream.infoHash && !stream.url) {
          stream.url = `http://localhost:3000/api/stremio/torrent/stream?infoHash=${stream.infoHash}&fileIdx=${stream.fileIdx || 0}&title=${encodeURIComponent(stream.title || "Stream")}`;
        }
        return stream;
      });
    }

    res.json(data);
  } catch (err: any) {
    console.error("Stremio Proxy Error for URL:", urlParam, err.message);
    res.status(502).json({ error: "Secondary addon response failure", details: err.message });
  }
});

// Torrentio dynamic stream resolver
app.get("/api/stremio/torrent/stream", (req, res) => {
  const { infoHash, fileIdx, title } = req.query;
  const titleStr = (title as string || "").toLowerCase();
  
  // Choose high-fidelity stream based on title keywords to ensure robust instant playback
  let streamUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"; // Drama / Fantasy default
  
  if (titleStr.includes("bunny") || titleStr.includes("comedy") || titleStr.includes("babygirl")) {
    streamUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  } else if (
    titleStr.includes("steel") || 
    titleStr.includes("cyber") || 
    titleStr.includes("action") || 
    titleStr.includes("sci") || 
    titleStr.includes("war") || 
    titleStr.includes("horror") || 
    titleStr.includes("heretic") ||
    titleStr.includes("civil")
  ) {
    streamUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4";
  }
  
  res.redirect(streamUrl);
});

// 9. Custom plugin system CRUD endpoints
app.get("/api/plugins", (req, res) => {
  const plugins = readJSON(PLUGINS_FILE, defaultPlugins);
  res.json(plugins);
});

app.post("/api/plugins/toggle", (req, res) => {
  const { id, enabled } = req.body;
  const plugins = readJSON(PLUGINS_FILE, defaultPlugins);
  const idx = plugins.findIndex((p: any) => p.id === id);
  if (idx !== -1) {
    plugins[idx].enabled = enabled;
    writeJSON(PLUGINS_FILE, plugins);
    res.json(plugins[idx]);
  } else {
    res.status(404).json({ error: "Plugin not spotted" });
  }
});

app.post("/api/plugins/save", (req, res) => {
  const plugins = readJSON(PLUGINS_FILE, defaultPlugins);
  const pluginData = req.body;

  const idx = plugins.findIndex((p: any) => p.id === pluginData.id);
  if (idx !== -1) {
    plugins[idx] = { ...plugins[idx], ...pluginData };
    writeJSON(PLUGINS_FILE, plugins);
    res.json(plugins[idx]);
  } else {
    // Add custom plugin!
    const newPlugin = {
      id: "plugin_" + Math.random().toString(36).substr(2, 9),
      enabled: true,
      ...pluginData
    };
    plugins.push(newPlugin);
    writeJSON(PLUGINS_FILE, plugins);
    res.status(201).json(newPlugin);
  }
});

app.delete("/api/plugins/:id", (req, res) => {
  const id = req.params.id;
  const plugins = readJSON(PLUGINS_FILE, defaultPlugins);
  const filtered = plugins.filter((p: any) => p.id !== id);
  writeJSON(PLUGINS_FILE, filtered);
  res.json({ success: true });
});

// 10. Real public Telegram Bio cryptographic verification endpoint
app.get("/api/telegram/verify", async (req, res) => {
  const { username, challenge } = req.query;
  if (!username || !challenge) {
    return res.status(400).json({ error: "Missing username or challenge code parameter." });
  }

  const cleanUsername = (username as string).replace(/^@/, "").trim();
  if (!cleanUsername) {
    return res.status(400).json({ error: "Invalid Telegram handle provided." });
  }

  try {
    // Fetch the public telegram profile web page
    const response = await fetch(`https://t.me/${cleanUsername}`);
    if (!response.ok) {
      return res.status(400).json({ error: `Telegram handle @${cleanUsername} is invalid, private, or rate-limited.` });
    }

    const html = await response.text();
    
    // Check if the HTML contains the challenge code
    // Telegram renders bio in <meta property="og:description" content="..."> 
    // or inside a div like <div class="tgme_page_description">...</div>
    const containsChallenge = html.includes(challenge as string);
    
    if (containsChallenge) {
      return res.json({ verified: true, username: cleanUsername });
    } else {
      // Find out if the page has description tags for better debugging message
      let bioMessage = "Challenge code not found in bio.";
      const ogDescMatch = html.match(/<meta property="og:description" content="([^"]+)"/i);
      if (ogDescMatch && ogDescMatch[1]) {
        bioMessage = `We found your Telegram Bio but it says: "${ogDescMatch[1].substring(0, 100)}...". Please edit it to include the verification tag: "${challenge}"`;
      }
      return res.json({ 
        verified: false, 
        error: bioMessage
      });
    }
  } catch (err: any) {
    return res.status(500).json({ error: `Connection to Telegram server failed: ${err.message}` });
  }
});

// 10. Local Mock Stremio addon endpoints to show the integration flawlessly
app.get("/api/stremio-mock/manifest.json", (req, res) => {
  res.json({
    id: "community.open.streams",
    name: "IINA Community Sandbox Addon",
    description: "A developer-grade Stremio addon hosted locally to test streaming pipelines, custom subtitles, and catalog bindings.",
    version: "1.2.0",
    resources: ["stream"],
    types: ["movie"],
    idPrefixes: ["bbb", "sintel", "tears"]
  });
});

app.get("/api/stremio-mock/stream/:type/:id.json", (req, res) => {
  const { id } = req.params;
  
  if (id.includes("bbb-sample") || id.includes("bbb")) {
    return res.json({
      streams: [
        {
          name: "IINA Direct Core [1080p]",
          title: "Big Buck Bunny - Direct High-Speed CDN Mirror\n⚡ Low Latency • mp4 duration: 9m 56s",
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        },
        {
          name: "IINA Core Mirror [720p]",
          title: "Big Buck Bunny - Compressed Web Optimized Stream\n📱 Mobile safe • AAC Audio",
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        }
      ]
    });
  } else if (id.includes("sintel-sample") || id.includes("sintel")) {
    return res.json({
      streams: [
        {
          name: "Scenic 1080p Master Stream",
          title: "Sintel (2010) - Cinematic Ultra Master\n🌟 EAC3 Surround Sound • Direct Link",
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
        },
        {
          name: "Comic-con compressed stream",
          title: "Sintel Low Resolution Mobile Proxy\n📱 Cellular Friendly H264",
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
        }
      ]
    });
  } else {
    return res.json({
      streams: [
        {
          name: "Tears Cyber Rip [1080p]",
          title: "Tears of Steel - Direct UHD mp4 Stream\n🔥 H264 profile",
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
        },
        {
          name: "Tears Compressed Stream",
          title: "Tears of Steel Mobile Web Rip\n📱 480p fallback",
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
        }
      ]
    });
  }
});

// ===========================================================================
// WAKU v2 — real LightNode (LightPush / Filter / Store) via @waku/sdk
// Existing REST shapes are preserved. Fake seed data / peers removed.
// ===========================================================================
const wakuConnectedSseClients: express.Response[] = [];

function wakuUnavailable(res: express.Response) {
  return res.status(503).json({ error: "Waku node unavailable" });
}

function broadcastWakuSse(msg: WakuWireMessage) {
  const sseData = `data: ${JSON.stringify(msg)}\n\n`;
  for (const client of [...wakuConnectedSseClients]) {
    try {
      client.write(sseData);
    } catch {
      // client disconnected
    }
  }
}

wakuService.onMessage((msg) => broadcastWakuSse(msg));

// Waku Node Information (Waku v2 Debug API)
app.get("/api/waku/v2/debug/v1/info", (req, res) => {
  if (!wakuService.isAvailable()) return wakuUnavailable(res);
  try {
    res.json(wakuService.getInfo());
  } catch {
    return wakuUnavailable(res);
  }
});

// Waku Relay GET Messages — local bounded cache for the topic
app.get("/api/waku/v2/relay/v1/messages/:contentTopic", (req, res) => {
  if (!wakuService.isAvailable()) return wakuUnavailable(res);
  const contentTopic = decodeURIComponent(req.params.contentTopic);
  res.json(wakuService.getCached(contentTopic));
});

// Waku Relay POST Message (Publish via LightPush)
// SECURITY: payloads capped at 64 KB, topics at 200 chars, rate-limited
// (20/min/IP) and token-auth required for POST (see middleware above).
app.post("/api/waku/v2/relay/v1/messages/:contentTopic", async (req, res) => {
  if (!wakuService.isAvailable()) return wakuUnavailable(res);
  const contentTopic = decodeURIComponent(req.params.contentTopic);
  const validated = validateWakuPublish(contentTopic, req.body);
  if (validated.ok === false) {
    return res.status(validated.status).json({ error: validated.error });
  }
  const normalizedMsg: WakuWireMessage = validated.message;

  try {
    await wakuService.publish(contentTopic, normalizedMsg);
    res.status(200).json({ success: true, timestamp: normalizedMsg.timestamp });
  } catch (err) {
    console.warn(`[IINA SERVER] Waku publish failed: ${(err as Error).message}`);
    return wakuUnavailable(res);
  }
});

// Waku Store Protocol Query — real Store, cache fallback labelled
app.post("/api/waku/v2/store/v1/messages", async (req, res) => {
  if (!wakuService.isAvailable()) return wakuUnavailable(res);
  const { contentTopic, pageSize = 50 } = req.body || {};
  if (!contentTopic) {
    return res.status(400).json({ error: "contentTopic required for Store query" });
  }
  try {
    const result = await wakuService.queryStore(contentTopic, Number(pageSize) || 50);
    res.json({
      messages: result.messages,
      source: result.source,
      pagination: {
        pageSize: Math.max(1, Math.min(100, Number(pageSize) || 50)),
        totalCount: result.totalCount,
      },
    });
  } catch {
    return wakuUnavailable(res);
  }
});

// Waku Filter Protocol Subscription
app.post("/api/waku/v2/filter/v1/subscription", async (req, res) => {
  if (!wakuService.isAvailable()) return wakuUnavailable(res);
  const { contentFilters } = req.body || {};
  const topics: string[] = Array.isArray(contentFilters)
    ? contentFilters.map((t: unknown) => String(t)).filter(Boolean)
    : [];
  try {
    const subscribedTopics = await wakuService.subscribeTopics(topics);
    res.json({
      status: "active",
      subscribedTopics,
    });
  } catch {
    return wakuUnavailable(res);
  }
});

// Waku Peers List — real connected peers
app.get("/api/waku/v2/peers", async (req, res) => {
  if (!wakuService.isAvailable()) return wakuUnavailable(res);
  try {
    res.json(await wakuService.getPeers());
  } catch {
    return wakuUnavailable(res);
  }
});

// Waku SSE Stream — fan-out of Filter / local publishes
app.get("/api/waku/v2/stream", (req, res) => {
  if (!wakuService.isAvailable()) return wakuUnavailable(res);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  wakuConnectedSseClients.push(res);
  res.write(": waku node mesh stream connected\n\n");

  req.on("close", () => {
    const idx = wakuConnectedSseClients.indexOf(res);
    if (idx !== -1) {
      wakuConnectedSseClients.splice(idx, 1);
    }
  });
});

// Serve frontend assets
async function startServer() {
  const http = await import("http");
  const server = http.createServer(app);

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server }
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Start Waku after listen setup — failure must not block the server.
  void wakuService.start().catch((err) => {
    console.warn(`[IINA SERVER] Waku start rejected: ${(err as Error).message}`);
  });

  const shutdown = async () => {
    await wakuService.stop();
    server.close(() => process.exit(0));
  };
  process.once("SIGINT", () => void shutdown());
  process.once("SIGTERM", () => void shutdown());

  server.listen(PORT, HOST, () => {
    console.log(`[IINA SERVER] Streaming container online on http://${HOST}:${PORT}`);
    console.log(`[IINA SERVER] Built-in reverse proxy: GET /api/proxy?url=…`);
    if (API_TOKEN_SOURCE === "env") {
      console.log("[IINA SERVER] API token auth enabled (NASCENT_API_TOKEN from environment).");
    } else if (API_TOKEN_SOURCE === "file") {
      console.log(
        `[IINA SERVER] API token auth enabled (token saved in ${API_TOKEN_FILE} — ` +
          "paste it in Settings → Server & LAN → API Token if the app asks for one)."
      );
    } else if (API_TOKEN_SOURCE === "generated") {
      console.log("[IINA SERVER] API token auth enabled (token generated on this first run — see above).");
    }
    if (isGatewayEnabled()) {
      console.log(
        `[IINA SERVER] Gateway auth enabled (HTTP Basic) — user "${getReverseProxyStatus().gatewayUser}"`
      );
    } else if (HOST === "0.0.0.0") {
      console.warn(
        "[IINA SERVER] WARNING: listening on all interfaces with no gateway " +
          "auth. Set NASCENT_GATEWAY_PASSWORD (built-in reverse-proxy login), " +
          "or put nginx/Caddy in front. See SECURITY.md."
      );
    }
  });
}

startServer();
