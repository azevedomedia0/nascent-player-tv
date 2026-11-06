import { InstalledAddon } from './types';

export const DEFAULT_COMMUNITY_ADDONS: InstalledAddon[] = [
  {
    manifest: {
      id: 'com.linvo.cinemeta',
      name: 'Cinemeta (Official IMDb & TMDb)',
      version: '3.0.12',
      description: 'Official IMDb and TMDb metadata and catalog provider for movies and TV series, featuring high-resolution artwork, trailers, cast lists, and IMDb ratings.',
      author: 'Stremio Official',
      icon: 'https://v3-cinemeta.strem.io/favicon.ico',
      types: ['movie', 'series'],
      resources: ['catalog', 'meta'],
      catalogs: [
        {
          type: 'movie',
          id: 'top',
          name: 'Popular Movies',
          extra: [
            { name: 'search', isRequired: false },
            { name: 'genre', options: ['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Thriller', 'Horror', 'Animation', 'Romance'] },
            { name: 'skip', isRequired: false }
          ]
        },
        {
          type: 'series',
          id: 'top',
          name: 'Popular Series',
          extra: [
            { name: 'search', isRequired: false },
            { name: 'genre', options: ['Drama', 'Comedy', 'Action', 'Sci-Fi', 'Mystery', 'Crime', 'Documentary'] },
            { name: 'skip', isRequired: false }
          ]
        }
      ],
      idPrefixes: ['tt'],
      behaviorHints: {
        adult: false,
        p2p: false,
        configurable: false
      }
    },
    transportUrl: 'https://v3-cinemeta.strem.io/manifest.json',
    enabled: true,
    installedAt: '2025-01-01T00:00:00.000Z',
    isBuiltIn: true,
    healthStatus: 'healthy',
    latencyMs: 142
  },
  {
    manifest: {
      id: 'org.torrentio.community',
      name: 'Torrentio Streams & Debrid',
      version: '1.0.8',
      description: 'Community multi-provider torrent and stream scraper. Resolves 4K HDR, 1080p, remuxes, seeders, and peer mesh connections for movies and TV series.',
      author: 'TheCommunityAddonDev',
      icon: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?q=80&w=256&auto=format&fit=crop',
      types: ['movie', 'series', 'anime'],
      resources: ['stream'],
      idPrefixes: ['tt', 'kitsu:'],
      behaviorHints: {
        adult: false,
        p2p: true,
        configurable: true
      },
      configurable: {
        settings: [
          {
            key: 'providerFilter',
            label: 'Excluded Providers',
            type: 'string',
            default: '',
            description: 'Comma separated list of providers to exclude (e.g. rarbg, piratebay)'
          },
          {
            key: 'sortQuality',
            label: 'Sorting Priority',
            type: 'select',
            default: 'quality',
            options: [
              { label: 'Highest Quality (4K Remux first)', value: 'quality' },
              { label: 'Highest Seeders', value: 'seeders' },
              { label: 'Smallest File Size', value: 'size' }
            ]
          },
          {
            key: 'debridApiKey',
            label: 'Real-Debrid / AllDebrid API Token',
            type: 'password',
            default: '',
            description: 'Optional API token for instant zero-p2p cached direct streaming'
          }
        ]
      }
    },
    transportUrl: 'https://torrentio.strem.fun/manifest.json',
    enabled: true,
    installedAt: '2025-01-01T00:00:00.000Z',
    isBuiltIn: true,
    healthStatus: 'healthy',
    latencyMs: 185
  },
  {
    manifest: {
      id: 'org.stremio.opensubtitles',
      name: 'OpenSubtitles v3',
      version: '3.1.0',
      description: 'Official OpenSubtitles integration with automatic hash-matching, multi-language detection, and synchronization offset adjustments.',
      author: 'Stremio Official',
      icon: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=256&auto=format&fit=crop',
      types: ['movie', 'series'],
      resources: ['subtitles'],
      idPrefixes: ['tt'],
      behaviorHints: {
        adult: false,
        configurable: true
      },
      configurable: {
        settings: [
          {
            key: 'primaryLanguage',
            label: 'Preferred Subtitle Language',
            type: 'select',
            default: 'en',
            options: [
              { label: 'English (en)', value: 'en' },
              { label: 'Spanish (es)', value: 'es' },
              { label: 'French (fr)', value: 'fr' },
              { label: 'German (de)', value: 'de' },
              { label: 'Japanese (ja)', value: 'ja' },
              { label: 'Portuguese (pt)', value: 'pt' }
            ]
          },
          {
            key: 'autoDownload',
            label: 'Auto-load best matched subtitle',
            type: 'boolean',
            default: true
          }
        ]
      }
    },
    transportUrl: 'https://opensubtitles-v3.strem.io/manifest.json',
    enabled: true,
    installedAt: '2025-01-01T00:00:00.000Z',
    isBuiltIn: true,
    healthStatus: 'healthy',
    latencyMs: 98
  },
  {
    manifest: {
      id: 'org.nascent.codecs',
      name: 'WebCodecs Matroska & Audio Pack',
      version: '2.4.0',
      description: 'Native media decoder plugin. Adds zero-copy hardware decoding for MKV containers, AC3/E-AC3 audio pass-through, AV1 10-bit HDR remuxing, and GPU shaders.',
      author: 'Nascent Media Engine Team',
      icon: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=256&auto=format&fit=crop',
      types: ['movie', 'series', 'channel', 'other'],
      resources: ['format_decoder', 'playback_enhancer'],
      formatDecoder: {
        supportedExtensions: ['.mkv', '.avi', '.flac', '.opus', '.hevc', '.av1', '.ts'],
        supportedCodecs: ['dts-hd', 'truehd', 'eac3', 'ac3', 'av01', 'hev1'],
        hardwareAccelerated: true
      },
      playbackEnhancer: {
        capabilities: ['spatial_audio', 'smart_eq', 'upscaling_shader'],
        eventHooks: ['onTimeUpdate', 'onTrackLoaded']
      },
      behaviorHints: {
        p2p: false,
        configurable: true
      },
      configurable: {
        settings: [
          {
            key: 'gpuAcceleration',
            label: 'Hardware Acceleration Pipeline',
            type: 'select',
            default: 'webcodecs',
            options: [
              { label: 'WebCodecs GPU Zero-Copy (Recommended)', value: 'webcodecs' },
              { label: 'WASM Multi-Threaded Soft Fallback', value: 'wasm' },
              { label: 'Native HTML5 Passthrough', value: 'native' }
            ]
          },
          {
            key: 'audioNormalization',
            label: 'Dynamic Range Compression & Dialogue Boost',
            type: 'boolean',
            default: true,
            description: 'Amplifies quiet dialogue while leveling explosive action peaks'
          }
        ]
      }
    },
    transportUrl: 'addon://internal.nascent.codecs/manifest.json',
    enabled: true,
    installedAt: '2025-01-01T00:00:00.000Z',
    isBuiltIn: true,
    healthStatus: 'healthy',
    latencyMs: 8
  },
  {
    manifest: {
      id: 'org.community.autoskip',
      name: 'Smart Skip & Chapter Marks',
      version: '1.2.4',
      description: 'Playback enhancer plugin that crowdsources and calculates intro/recap/outro start & end timestamps, offering seamless 1-click or automated binge skipping.',
      author: 'Community Media Lab',
      icon: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=256&auto=format&fit=crop',
      types: ['series', 'anime'],
      resources: ['playback_enhancer'],
      playbackEnhancer: {
        capabilities: ['auto_skip_intro'],
        eventHooks: ['onTimeUpdate']
      },
      behaviorHints: {
        configurable: true
      },
      configurable: {
        settings: [
          {
            key: 'autoSkipBehavior',
            label: 'Skip Behavior',
            type: 'select',
            default: 'prompt',
            options: [
              { label: 'Show "Skip Intro" Button (Prompt)', value: 'prompt' },
              { label: 'Automatically Skip Without Prompting', value: 'auto' },
              { label: 'Disabled', value: 'off' }
            ]
          }
        ]
      }
    },
    transportUrl: 'addon://internal.community.autoskip/manifest.json',
    enabled: true,
    installedAt: '2025-01-01T00:00:00.000Z',
    isBuiltIn: false,
    healthStatus: 'healthy',
    latencyMs: 12
  },
  {
    manifest: {
      id: 'org.stremio.anime-kitsu',
      name: 'Anime Kitsu & MyAnimeList',
      version: '2.0.4',
      description: 'Comprehensive anime database addon tracking ongoing simulcasts, seasons, episodes, Japanese audio streams, and community ratings via Kitsu.io.',
      author: 'Kitsu Community',
      icon: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=256&auto=format&fit=crop',
      types: ['anime', 'series'],
      resources: ['catalog', 'meta'],
      catalogs: [
        {
          type: 'anime',
          id: 'kitsu-popular',
          name: 'Trending Anime',
          extra: [
            { name: 'search', isRequired: false },
            { name: 'genre', options: ['Shounen', 'Isekai', 'Sci-Fi', 'Romance', 'Fantasy', 'Action'] }
          ]
        }
      ],
      idPrefixes: ['kitsu:'],
      behaviorHints: {
        adult: false
      }
    },
    transportUrl: 'https://anime-kitsu.strem.fun/manifest.json',
    enabled: false,
    installedAt: '2025-01-02T10:00:00.000Z',
    isBuiltIn: false,
    healthStatus: 'healthy',
    latencyMs: 210
  },
  {
    manifest: {
      id: 'org.sonarr.automation',
      name: 'Sonarr TV Automation',
      version: '4.0.12',
      description: 'Smart TV series library manager — monitors releases, grabs episodes, and organizes your show vault via Sonarr API.',
      author: 'Sonarr Team',
      icon: 'https://raw.githubusercontent.com/Sonarr/Sonarr/develop/Logo/256.png',
      types: ['series'],
      resources: ['catalog', 'meta'],
      catalogs: [
        {
          type: 'series',
          id: 'sonarr-library',
          name: 'Sonarr Library',
          extra: [{ name: 'search', isRequired: false }]
        }
      ],
      behaviorHints: {
        configurable: true,
        configurationRequired: true
      },
      configurable: {
        settings: [
          {
            key: 'baseUrl',
            label: 'Sonarr Base URL',
            type: 'string',
            default: 'http://localhost:8989',
            description: 'Local or remote Sonarr instance URL'
          },
          {
            key: 'apiKey',
            label: 'API Key',
            type: 'password',
            default: '',
            description: 'Sonarr Settings → General → API Key'
          }
        ]
      }
    },
    transportUrl: 'addon://internal.sonarr/manifest.json',
    enabled: false,
    installedAt: '2025-01-03T00:00:00.000Z',
    isBuiltIn: false,
    healthStatus: 'healthy',
    latencyMs: 24
  },
  {
    manifest: {
      id: 'org.radarr.automation',
      name: 'Radarr Movie Automation',
      version: '5.14.0',
      description: 'Automated movie collection manager — finds, downloads, and renames films via Radarr API.',
      author: 'Radarr Team',
      icon: 'https://raw.githubusercontent.com/Radarr/Radarr/develop/Logo/256.png',
      types: ['movie'],
      resources: ['catalog', 'meta'],
      catalogs: [
        {
          type: 'movie',
          id: 'radarr-library',
          name: 'Radarr Library',
          extra: [{ name: 'search', isRequired: false }]
        }
      ],
      behaviorHints: {
        configurable: true,
        configurationRequired: true
      },
      configurable: {
        settings: [
          {
            key: 'baseUrl',
            label: 'Radarr Base URL',
            type: 'string',
            default: 'http://localhost:7878',
            description: 'Local or remote Radarr instance URL'
          },
          {
            key: 'apiKey',
            label: 'API Key',
            type: 'password',
            default: '',
            description: 'Radarr Settings → General → API Key'
          }
        ]
      }
    },
    transportUrl: 'addon://internal.radarr/manifest.json',
    enabled: false,
    installedAt: '2025-01-03T00:00:00.000Z',
    isBuiltIn: false,
    healthStatus: 'healthy',
    latencyMs: 26
  },
  {
    manifest: {
      id: 'org.prowlarr.indexers',
      name: 'Prowlarr Indexer Manager',
      version: '1.29.0',
      description: 'Unified indexer manager that syncs torrent and Usenet trackers across Sonarr, Radarr, and Lidarr.',
      author: 'Prowlarr Team',
      icon: 'https://raw.githubusercontent.com/Prowlarr/Prowlarr/develop/Logo/256.png',
      types: ['movie', 'series'],
      resources: ['stream'],
      behaviorHints: {
        configurable: true,
        configurationRequired: true
      },
      configurable: {
        settings: [
          {
            key: 'baseUrl',
            label: 'Prowlarr Base URL',
            type: 'string',
            default: 'http://localhost:9696',
            description: 'Local or remote Prowlarr instance URL'
          },
          {
            key: 'apiKey',
            label: 'API Key',
            type: 'password',
            default: '',
            description: 'Prowlarr Settings → General → API Key'
          }
        ]
      }
    },
    transportUrl: 'addon://internal.prowlarr/manifest.json',
    enabled: false,
    installedAt: '2025-01-03T00:00:00.000Z',
    isBuiltIn: false,
    healthStatus: 'healthy',
    latencyMs: 28
  },
  {
    manifest: {
      id: 'org.jackett.proxy',
      name: 'Jackett Indexer Proxy',
      version: '0.22.0',
      description: 'API proxy that translates dozens of torrent trackers into a single Torznab/Potato feed for download clients.',
      author: 'Jackett Community',
      icon: 'https://raw.githubusercontent.com/Jackett/Jackett/master/src/Jackett.Server/Content/favicon.ico',
      types: ['movie', 'series', 'anime'],
      resources: ['stream'],
      behaviorHints: {
        p2p: true,
        configurable: true,
        configurationRequired: true
      },
      configurable: {
        settings: [
          {
            key: 'baseUrl',
            label: 'Jackett Base URL',
            type: 'string',
            default: 'http://localhost:9117',
            description: 'Local or remote Jackett instance URL'
          },
          {
            key: 'apiKey',
            label: 'API Key',
            type: 'password',
            default: '',
            description: 'Jackett dashboard API key'
          }
        ]
      }
    },
    transportUrl: 'addon://internal.jackett/manifest.json',
    enabled: false,
    installedAt: '2025-01-03T00:00:00.000Z',
    isBuiltIn: false,
    healthStatus: 'healthy',
    latencyMs: 30
  },
  {
    manifest: {
      id: 'org.bazarr.subtitles',
      name: 'Bazarr Subtitle Manager',
      version: '1.5.1',
      description: 'Companion for Sonarr & Radarr that automatically downloads and manages subtitles for your media library.',
      author: 'Bazarr Team',
      icon: 'https://raw.githubusercontent.com/morpheus65535/bazarr/master/frontend/public/images/logo128.png',
      types: ['movie', 'series'],
      resources: ['subtitles'],
      behaviorHints: {
        configurable: true,
        configurationRequired: true
      },
      configurable: {
        settings: [
          {
            key: 'baseUrl',
            label: 'Bazarr Base URL',
            type: 'string',
            default: 'http://localhost:6767',
            description: 'Local or remote Bazarr instance URL'
          },
          {
            key: 'apiKey',
            label: 'API Key',
            type: 'password',
            default: '',
            description: 'Bazarr Settings → General → API Key'
          }
        ]
      }
    },
    transportUrl: 'addon://internal.bazarr/manifest.json',
    enabled: false,
    installedAt: '2025-01-03T00:00:00.000Z',
    isBuiltIn: false,
    healthStatus: 'healthy',
    latencyMs: 22
  }
];

export const POPULAR_COMMUNITY_DIRECTORY: {
  id: string;
  name: string;
  author: string;
  category: 'official' | 'streams' | 'subtitles' | 'codecs' | 'catalogs';
  description: string;
  manifestUrl: string;
  rating: number;
  installCount: string;
  icon: string;
  types: string[];
  resources: string[];
}[] = [
  {
    id: 'com.linvo.cinemeta',
    name: 'Cinemeta (Official)',
    author: 'Stremio Official',
    category: 'official',
    description: 'Official IMDb and TMDb metadata and catalog provider with complete synopses, cast info, and posters.',
    manifestUrl: 'https://v3-cinemeta.strem.io/manifest.json',
    rating: 4.9,
    installCount: '2.4M',
    icon: 'https://v3-cinemeta.strem.io/favicon.ico',
    types: ['movie', 'series'],
    resources: ['catalog', 'meta']
  },
  {
    id: 'org.torrentio.community',
    name: 'Torrentio Streams',
    author: 'TheCommunityAddonDev',
    category: 'streams',
    description: 'Scrapes popular community sources for 4K REMUX, 1080p, HDR, and Real-Debrid cached torrent streams.',
    manifestUrl: 'https://torrentio.strem.fun/manifest.json',
    rating: 4.9,
    installCount: '1.8M',
    icon: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?q=80&w=256&auto=format&fit=crop',
    types: ['movie', 'series', 'anime'],
    resources: ['stream']
  },
  {
    id: 'org.stremio.opensubtitles',
    name: 'OpenSubtitles v3',
    author: 'Stremio Official',
    category: 'subtitles',
    description: 'Direct integration with OpenSubtitles database supporting 70+ languages and subtitle offset tuning.',
    manifestUrl: 'https://opensubtitles-v3.strem.io/manifest.json',
    rating: 4.8,
    installCount: '2.1M',
    icon: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=256&auto=format&fit=crop',
    types: ['movie', 'series'],
    resources: ['subtitles']
  },
  {
    id: 'org.nascent.codecs',
    name: 'WebCodecs Matroska & Audio Pack',
    author: 'Nascent Media Engine Team',
    category: 'codecs',
    description: 'Demuxes MKV, Opus, FLAC, AC3, and AV1 video streams with zero-copy WebGPU acceleration.',
    manifestUrl: 'addon://internal.nascent.codecs/manifest.json',
    rating: 4.9,
    installCount: '890K',
    icon: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=256&auto=format&fit=crop',
    types: ['movie', 'series', 'channel'],
    resources: ['format_decoder', 'playback_enhancer']
  },
  {
    id: 'org.community.autoskip',
    name: 'Smart Skip & Chapter Marks',
    author: 'Community Media Lab',
    category: 'codecs',
    description: 'Crowdsourced intro, outro, recap, and credits skipping for binge-watching TV shows and anime.',
    manifestUrl: 'addon://internal.community.autoskip/manifest.json',
    rating: 4.7,
    installCount: '420K',
    icon: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=256&auto=format&fit=crop',
    types: ['series', 'anime'],
    resources: ['playback_enhancer']
  },
  {
    id: 'org.stremio.anime-kitsu',
    name: 'Anime Kitsu & MyAnimeList',
    author: 'Kitsu Community',
    category: 'catalogs',
    description: 'Catalogs and episode metadata for Japanese anime, OVA series, and movies directly from Kitsu API.',
    manifestUrl: 'https://anime-kitsu.strem.fun/manifest.json',
    rating: 4.7,
    installCount: '650K',
    icon: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=256&auto=format&fit=crop',
    types: ['anime', 'series'],
    resources: ['catalog', 'meta']
  },
  {
    id: 'org.stremio.cyberflix',
    name: 'CyberFlix Catalog',
    author: 'CyberFlix Team',
    category: 'catalogs',
    description: 'Aggregates trending sections from Netflix, HBO Max, Disney+, Apple TV+, and Amazon Prime Video.',
    manifestUrl: 'https://cyberflix.kamy.me/manifest.json',
    rating: 4.6,
    installCount: '580K',
    icon: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=256&auto=format&fit=crop',
    types: ['movie', 'series'],
    resources: ['catalog']
  },
  {
    id: 'org.stremio.podcasts',
    name: 'Stremio Podcasts & Radio',
    author: 'OpenMedia Community',
    category: 'catalogs',
    description: 'Streams over 20,000 public RSS audio/video podcasts and live global internet radio feeds.',
    manifestUrl: 'https://podcasts.strem.fun/manifest.json',
    rating: 4.5,
    installCount: '190K',
    icon: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=256&auto=format&fit=crop',
    types: ['channel', 'other'],
    resources: ['catalog', 'meta', 'stream']
  },
  {
    id: 'org.sonarr.automation',
    name: 'Sonarr TV Automation',
    author: 'Sonarr Team',
    category: 'catalogs',
    description: 'Smart TV series library manager — monitors releases, grabs episodes, and organizes your show vault.',
    manifestUrl: 'addon://internal.sonarr/manifest.json',
    rating: 4.9,
    installCount: '312K',
    icon: 'https://raw.githubusercontent.com/Sonarr/Sonarr/develop/Logo/256.png',
    types: ['series'],
    resources: ['catalog', 'meta']
  },
  {
    id: 'org.radarr.automation',
    name: 'Radarr Movie Automation',
    author: 'Radarr Team',
    category: 'catalogs',
    description: 'Automated movie collection manager — finds, downloads, and renames films to match your library.',
    manifestUrl: 'addon://internal.radarr/manifest.json',
    rating: 4.9,
    installCount: '298K',
    icon: 'https://raw.githubusercontent.com/Radarr/Radarr/develop/Logo/256.png',
    types: ['movie'],
    resources: ['catalog', 'meta']
  },
  {
    id: 'org.prowlarr.indexers',
    name: 'Prowlarr Indexer Manager',
    author: 'Prowlarr Team',
    category: 'streams',
    description: 'Unified indexer manager that syncs torrent and Usenet trackers across Sonarr, Radarr, and Lidarr.',
    manifestUrl: 'addon://internal.prowlarr/manifest.json',
    rating: 4.8,
    installCount: '241K',
    icon: 'https://raw.githubusercontent.com/Prowlarr/Prowlarr/develop/Logo/256.png',
    types: ['movie', 'series'],
    resources: ['stream']
  },
  {
    id: 'org.jackett.proxy',
    name: 'Jackett Indexer Proxy',
    author: 'Jackett Community',
    category: 'streams',
    description: 'API proxy that translates dozens of torrent trackers into a single Torznab/Potato feed.',
    manifestUrl: 'addon://internal.jackett/manifest.json',
    rating: 4.7,
    installCount: '380K',
    icon: 'https://raw.githubusercontent.com/Jackett/Jackett/master/src/Jackett.Server/Content/favicon.ico',
    types: ['movie', 'series', 'anime'],
    resources: ['stream']
  },
  {
    id: 'org.bazarr.subtitles',
    name: 'Bazarr Subtitle Manager',
    author: 'Bazarr Team',
    category: 'subtitles',
    description: 'Companion for Sonarr & Radarr that automatically downloads and manages library subtitles.',
    manifestUrl: 'addon://internal.bazarr/manifest.json',
    rating: 4.8,
    installCount: '195K',
    icon: 'https://raw.githubusercontent.com/morpheus65535/bazarr/master/frontend/public/images/logo128.png',
    types: ['movie', 'series'],
    resources: ['subtitles']
  }
];
