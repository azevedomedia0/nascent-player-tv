/**
 * Stremio-Compatible Community Plugin & Addon Protocol Specification
 * Modeled after Stremio v3/v4 Addon Architecture with Media Player & Format Decoder extensions.
 */

export type AddonResourceType = 
  | 'catalog' 
  | 'meta' 
  | 'stream' 
  | 'subtitles' 
  | 'format_decoder' 
  | 'playback_enhancer';

export type AddonMediaType = 
  | 'movie' 
  | 'series' 
  | 'anime' 
  | 'channel' 
  | 'tv' 
  | 'music' 
  | 'other';

export interface AddonCatalogExtra {
  name: string;
  isRequired?: boolean;
  options?: string[];
  optionsLimit?: number;
}

export interface AddonCatalogDescriptor {
  type: AddonMediaType | string;
  id: string;
  name: string;
  extra?: AddonCatalogExtra[];
  extraSupported?: string[];
  extraRequired?: string[];
  pageSize?: number;
}

export interface AddonResourceDescriptor {
  name: AddonResourceType;
  types?: (AddonMediaType | string)[];
  idPrefixes?: string[];
}

export interface AddonBehaviorHints {
  adult?: boolean;
  p2p?: boolean;
  configurable?: boolean;
  configurationRequired?: boolean;
  manifestCache?: number;
}

export interface CustomFormatDecoderConfig {
  supportedExtensions: string[]; // e.g. ['.mkv', '.avi', '.flac', '.opus', '.hevc', '.av1']
  supportedCodecs: string[]; // e.g. ['dts', 'truehd', 'ac3', 'av1', 'vp9']
  hardwareAccelerated?: boolean;
  wasmModuleUrl?: string;
  workerScriptUrl?: string;
}

export interface CustomPlaybackEnhancerConfig {
  capabilities: ('auto_skip_intro' | 'smart_eq' | 'spatial_audio' | 'upscaling_shader' | 'sub_synchronizer')[];
  eventHooks?: ('onTimeUpdate' | 'onTrackLoaded' | 'onBuffering' | 'onSeek')[];
}

export interface AddonManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  icon?: string;
  logo?: string;
  background?: string;
  types: (AddonMediaType | string)[];
  resources: (AddonResourceType | AddonResourceDescriptor)[];
  catalogs?: AddonCatalogDescriptor[];
  idPrefixes?: string[];
  behaviorHints?: AddonBehaviorHints;
  contactEmail?: string;
  author?: string;
  repository?: string;
  // Extended media player & server capabilities
  formatDecoder?: CustomFormatDecoderConfig;
  playbackEnhancer?: CustomPlaybackEnhancerConfig;
  configurable?: {
    settings: {
      key: string;
      label: string;
      type: 'string' | 'password' | 'boolean' | 'select' | 'number';
      default?: any;
      options?: { label: string; value: string }[];
      description?: string;
    }[];
  };
}

export interface StreamItemBehaviorHints {
  notWebReady?: boolean;
  bingeGroup?: string;
  proxyHeaders?: {
    request?: Record<string, string>;
    response?: Record<string, string>;
  };
  countryWhitelist?: string[];
  group?: string;
  headers?: Record<string, string>;
}

export interface StreamItem {
  name: string; // Addon name or provider label, e.g. "Torrentio 4K", "Cinemeta", "Real-Debrid"
  title: string; // Detail line, e.g. "1080p • 10-bit • HEVC • HDR • 24.2 GB • 128 seeds"
  url?: string; // Direct HTTP / HLS / DASH stream URL
  infoHash?: string; // BitTorrent InfoHash for peer mesh streaming
  fileIdx?: number; // Torrent video file index
  externalUrl?: string; // Link to external platform or web browser
  ytId?: string; // YouTube video ID for trailers or previews
  behaviorHints?: StreamItemBehaviorHints;
  
  // Rich Player Metadata
  quality?: '4K REMUX' | '4K UHD' | '4K HDR' | '1080p' | '720p' | 'Audio Only';
  resolution?: string;
  codec?: string;
  audio?: string;
  size?: string;
  seeds?: number;
  peers?: number;
  sourceAddonId?: string;
  sourceAddonName?: string;
  latencyMs?: number;
}

export interface SubtitleItem {
  id: string;
  url: string;
  lang: string;
  label?: string;
  format?: 'srt' | 'vtt' | 'ass';
}

export interface MetaVideo {
  id: string;
  title: string;
  season?: number;
  episode?: number;
  released?: string;
  thumbnail?: string;
  streams?: StreamItem[];
  overview?: string;
}

export interface MetaDetail {
  id: string;
  type: AddonMediaType | string;
  name: string;
  genres?: string[];
  poster?: string;
  posterShape?: 'poster' | 'landscape' | 'square';
  background?: string;
  logo?: string;
  description?: string;
  releaseInfo?: string;
  imdbRating?: string | number;
  runtime?: string;
  cast?: string[];
  director?: string[];
  trailers?: { source: string; type: string }[];
  videos?: MetaVideo[];
}

export interface InstalledAddon {
  manifest: AddonManifest;
  transportUrl: string; // e.g. "https://v3-cinemeta.strem.io/manifest.json" or "addon://custom"
  enabled: boolean;
  installedAt: string;
  userSettings?: Record<string, any>;
  isBuiltIn?: boolean;
  healthStatus?: 'healthy' | 'degraded' | 'error' | 'offline';
  latencyMs?: number;
  lastChecked?: string;
}

export interface AddonResponse<T> {
  [key: string]: T | any;
  meta?: MetaDetail;
  metas?: MetaDetail[];
  streams?: StreamItem[];
  subtitles?: SubtitleItem[];
  hasMore?: boolean;
  cacheMaxAge?: number;
  staleRevalidate?: number;
}
