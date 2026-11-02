import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

export const PORT = 3000;

// Establish directories
export const DATA_DIR = path.resolve('./data');
export const MEDIA_DIR = path.resolve('./media');
export const MEDIA_FILE = path.join(DATA_DIR, 'media.json');
export const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
export const PLUGINS_FILE = path.join(DATA_DIR, 'plugins.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(MEDIA_DIR)) {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
}

// In-memory sync partitions (Watch parties are active sessions)
export const watchParties: Record<string, any> = {};

// Default Sample Media items
export const defaultMediaItems = [
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
export const defaultPlugins = [
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
    enabled: true,
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
export const readJSON = (filePath: string, fallback: any) => {
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

export const writeJSON = (filePath: string, data: any) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error(`Error writing database file ${filePath}:`, err);
  }
};

// Initialize DB files
export function initDb() {
  if (!fs.existsSync(MEDIA_FILE)) writeJSON(MEDIA_FILE, defaultMediaItems);
  if (!fs.existsSync(HISTORY_FILE)) writeJSON(HISTORY_FILE, []);
  if (!fs.existsSync(PLUGINS_FILE)) {
    writeJSON(PLUGINS_FILE, defaultPlugins);
  } else {
    // Gracefully migrate existing plugins
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
        enabled: true,
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
}

// Initialize on require
initDb();

// Initialize Gemini Client
export let gAi: GoogleGenAI | null = null;
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
