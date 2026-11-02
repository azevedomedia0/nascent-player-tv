export interface SubtitleTrack {
  id: string;
  label: string;
  language: string;
  url: string; // URL path to subtitle text (vtt or srt)
  isCustom?: boolean;
}

export interface MediaItem {
  id: string;
  title: string;
  filename: string;
  url: string; // API endpoint /api/stream?id=... or direct public test file URL
  size?: number; // bytes
  mimeType?: string;
  type: 'movie' | 'show' | 'clip';
  duration: number; // in seconds
  posterUrl: string;
  bannerUrl: string;
  releaseYear: string;
  genres: string[];
  summary: string;
  director?: string;
  rating?: number; // e.g. 8.5
  playCount: number;
  playProgress: number; // last playback point in seconds
  lastPlayed?: string; // ISO timestamp
  isLocal: boolean;
  subtitles: SubtitleTrack[];
  library?: string;
}

export interface PlayHistoryItem {
  id: string;
  mediaId: string;
  title: string;
  posterUrl: string;
  watchedAt: string;
  progress: number; // seconds
  duration: number; // seconds
}

export interface WatchParty {
  roomId: string;
  hostId: string;
  hostName: string;
  currentMediaId: string | null;
  playbackState: 'playing' | 'paused';
  currentTime: number;
  lastSyncTime: number; // Date.now() timestamp
  participants: { id: string; name: string; lastSeen: number }[];
  chat: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  userName: string;
  text: string;
  timestamp: string;
}

export interface PlayerPlugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  code: string; // Javascript string containing hooks, or manifest JSON for stremio
  enabled: boolean;
  type: 'metadata' | 'video-filter' | 'subtitle-translator' | 'visuals' | 'stremio';
  manifestUrl?: string; // Stremio manifest URL if type === 'stremio'
}
