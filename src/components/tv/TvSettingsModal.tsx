import React, { useEffect, useRef, useState } from 'react';
import { 
  X, 
  Settings, 
  Puzzle, 
  Wifi, 
  Volume2, 
  Check, 
  Plus, 
  Server, 
  Activity, 
  ShieldCheck, 
  RotateCcw,
  Languages,
  Film,
  Moon,
  Palette,
  Tv,
  Trash2,
  RefreshCw,
  Sparkles,
  Play,
  Gamepad2,
  User,
  UserCheck,
  LogOut,
  Shield,
  Eye,
  EyeOff,
  Download,
  ExternalLink,
  ChevronDown,
  Layers,
  CheckCircle2,
  AlertCircle,
  Globe,
  Subtitles,
  Video,
  Cloud,
  Zap,
  Clapperboard,
  BookOpen,
  Library,
  Bluetooth,
  BluetoothConnected,
  Speaker,
  Headphones,
  Camera,
  type LucideIcon,
} from 'lucide-react';
import { apiFetch, clearApiToken, getApiToken, setApiToken } from '../../lib/apiAuth';
import {
  UI_THEMES,
  UiThemeId,
  applyUiTheme,
  getStoredUiTheme,
} from '../../lib/uiTheme';

interface TvSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPlugins?: () => void;
  eqGains: {
    hz60: number;
    hz230: number;
    hz910: number;
    hz4000: number;
    hz14000: number;
  };
  onEqChange: (freq: string, val: number) => void;
  audioPreset: string;
  onAudioPresetChange: (preset: any) => void;
  initialCategory?: SettingCategory;
}

export type SettingCategory = 
  | 'profile'
  | 'plugins'
  | 'remote'
  | 'audio-video' 
  | 'playback' 
  | 'network';

interface PluginItem {
  id: string;
  name: string;
  version: string;
  author: string;
  category: 'catalogs' | 'subtitles' | 'streaming' | 'audio' | 'sync';
  description: string;
  enabled: boolean;
  isInstalled: boolean;
  isOfficial?: boolean;
  rating?: string;
  downloads?: string;
}

/** Per-plugin glyph — matched to the addon’s job, not a generic puzzle. */
function getPluginIcon(plugin: PluginItem): LucideIcon {
  switch (plugin.id) {
    case 'cinemeta':
      return Clapperboard; // movie catalog / metadata
    case 'opensubtitles':
      return Subtitles; // caption tracks
    case 'nascent-p2p':
      return Video; // P2P / peer video
    case 'trakt-sync':
      return Library; // watchlist / library scrobble sync
    case 'anime-kitsu':
      return BookOpen; // anime catalog / tracker
    case 'debrid-bridge':
      return Zap; // debrid stream bridge
    default:
      break;
  }
  switch (plugin.category) {
    case 'catalogs':
      return Layers;
    case 'subtitles':
      return Subtitles;
    case 'streaming':
      return Wifi;
    case 'audio':
      return Volume2;
    case 'sync':
      return Cloud;
    default:
      return Puzzle;
  }
}

interface UserProfile {
  id: string;
  name: string;
  initials: string;
  color: string;
  avatarUrl?: string | null;
  isKid: boolean;
  isPrimary?: boolean;
}

export const TvSettingsModal: React.FC<TvSettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenPlugins,
  eqGains,
  onEqChange,
  audioPreset,
  onAudioPresetChange,
  initialCategory = 'profile',
}) => {
  const [activeCategory, setActiveCategory] = useState<SettingCategory>(initialCategory);

  // Profile Settings State
  const [profiles, setProfiles] = useState<UserProfile[]>([
    { id: '1', name: 'Steven Azevedo', initials: 'SA', color: 'from-sky-500 to-indigo-600', isKid: false, isPrimary: true },
    { id: '2', name: 'Living Room TV', initials: 'LR', color: 'from-amber-500 to-orange-600', isKid: false },
    { id: '3', name: 'Kids Cinema', initials: 'KC', color: 'from-emerald-400 to-teal-600', isKid: true },
  ]);
  const [activeProfileId, setActiveProfileId] = useState<string>('1');
  const [editingName, setEditingName] = useState(false);
  const [profileNameInput, setProfileNameInput] = useState('Steven Azevedo');
  const [profileAvatarDraft, setProfileAvatarDraft] = useState<string | null>(null);
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);
  const [maturityRating, setMaturityRating] = useState<'all' | 'pg13' | 'family'>('all');
  const [autoplayTrailers, setAutoplayTrailers] = useState(true);
  const [showContinueWatching, setShowContinueWatching] = useState(true);
  const [privateViewing, setPrivateViewing] = useState(false);
  const [syncHistory, setSyncHistory] = useState(true);
  const [defaultStartupTab, setDefaultStartupTab] = useState<'movies' | 'shows' | 'local-media' | 'watchlists'>('movies');
  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);

  // Plugins State
  const [pluginCategoryFilter, setPluginCategoryFilter] = useState<'all' | 'installed' | 'catalogs' | 'subtitles' | 'streaming' | 'audio'>('all');
  const [pluginSearch, setPluginSearch] = useState('');
  const [manifestUrl, setManifestUrl] = useState('');
  const [isInstallingFromUrl, setIsInstallingFromUrl] = useState(false);
  const [pluginFeedback, setPluginFeedback] = useState<string | null>(null);

  const [pluginsList, setPluginsList] = useState<PluginItem[]>([
    {
      id: 'cinemeta',
      name: 'Cinemeta 4K UHD Catalog',
      version: 'v3.2.1',
      author: 'Nascent Core Team',
      category: 'catalogs',
      description: 'High-fidelity cinema posters, IMDb ratings, casting metadata, and 4K backdrop art.',
      enabled: true,
      isInstalled: true,
      isOfficial: true,
      rating: '4.9',
      downloads: '142K'
    },
    {
      id: 'opensubtitles',
      name: 'OpenSubtitles v3 Scraper',
      version: 'v2.0.4',
      author: 'Community OSS',
      category: 'subtitles',
      description: 'Automated hash-matching subtitle downloads with sub-second sync and 40+ languages.',
      enabled: true,
      isInstalled: true,
      isOfficial: true,
      rating: '4.8',
      downloads: '210K'
    },
    {
      id: 'nascent-p2p',
      name: 'Nascent Mesh P2P Streamer',
      version: 'v4.1.0',
      author: 'Nascent Engine',
      category: 'streaming',
      description: 'Decentralized peer-to-peer media sharing and zero-transcode local LAN streaming.',
      enabled: true,
      isInstalled: true,
      isOfficial: true,
      rating: '5.0',
      downloads: '95K'
    },
    {
      id: 'trakt-sync',
      name: 'Trakt.tv Scrobbler & Cloud Sync',
      version: 'v2.4.0',
      author: 'Trakt Team',
      category: 'sync',
      description: 'Automatically scrobble watched episodes, rate movies, and sync library across devices.',
      enabled: false,
      isInstalled: false,
      isOfficial: false,
      rating: '4.7',
      downloads: '88K'
    },
    {
      id: 'anime-kitsu',
      name: 'AnimeKitsu & AniList Tracker',
      version: 'v1.6.2',
      author: 'Kitsu Community',
      category: 'catalogs',
      description: 'Specialized Japanese anime release schedules, episode guides, and Japanese audio metadata.',
      enabled: false,
      isInstalled: false,
      isOfficial: false,
      rating: '4.8',
      downloads: '64K'
    },
    {
      id: 'debrid-bridge',
      name: 'Real-Debrid & Premiumize Bridge',
      version: 'v3.0.5',
      author: 'Debrid Devs',
      category: 'streaming',
      description: 'Ultra-fast unthrottled multi-gigabit cache streams directly from premium cloud seedboxes.',
      enabled: false,
      isInstalled: false,
      isOfficial: false,
      rating: '4.9',
      downloads: '175K'
    }
  ]);

  // Audio / Video & Existing Preferences
  const [nightMode, setNightMode] = useState(false);
  const [audioPassthrough, setAudioPassthrough] = useState(true);

  type BtDeviceKind = 'remote' | 'gamepad' | 'speaker' | 'headphones' | 'other';
  type BtDeviceRow = {
    id: string;
    name: string;
    kind: BtDeviceKind;
    status: 'connected' | 'paired' | 'available';
    detail: string;
  };
  const [btDevices, setBtDevices] = useState<BtDeviceRow[]>([]);
  const [btScanning, setBtScanning] = useState(false);
  const [btFeedback, setBtFeedback] = useState<string | null>(null);

  const btSupported =
    typeof navigator !== 'undefined' &&
    !!(navigator as Navigator & { bluetooth?: unknown }).bluetooth;

  const kindIcon = (kind: BtDeviceKind): LucideIcon => {
    switch (kind) {
      case 'remote':
        return Tv;
      case 'gamepad':
        return Gamepad2;
      case 'speaker':
        return Speaker;
      case 'headphones':
        return Headphones;
      default:
        return Bluetooth;
    }
  };

  const refreshGamepadDevices = () => {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return;
    const pads = Array.from(navigator.getGamepads()).filter(Boolean) as Gamepad[];
    setBtDevices((prev) => {
      const withoutPads = prev.filter((d) => !d.id.startsWith('gamepad-'));
      const fromPads: BtDeviceRow[] = pads.map((pad, idx) => ({
        id: `gamepad-${pad.index}-${idx}`,
        name: pad.id?.trim() || `Gamepad ${pad.index + 1}`,
        kind: 'gamepad' as const,
        status: 'connected' as const,
        detail: `HID index ${pad.index} · ${pad.buttons?.length ?? 0} buttons`,
      }));
      return [...fromPads, ...withoutPads];
    });
  };

  useEffect(() => {
    refreshGamepadDevices();
    const onConnect = () => refreshGamepadDevices();
    const onDisconnect = () => refreshGamepadDevices();
    window.addEventListener('gamepadconnected', onConnect);
    window.addEventListener('gamepaddisconnected', onDisconnect);
    return () => {
      window.removeEventListener('gamepadconnected', onConnect);
      window.removeEventListener('gamepaddisconnected', onDisconnect);
    };
  }, []);

  const handleBluetoothScan = async () => {
    setBtFeedback(null);
    setBtScanning(true);
    try {
      refreshGamepadDevices();
      const bluetooth = (navigator as Navigator & {
        bluetooth?: {
          requestDevice: (opts: {
            acceptAllDevices?: boolean;
            optionalServices?: string[];
          }) => Promise<{ id: string; name?: string; gatt?: { connected?: boolean } }>;
        };
      }).bluetooth;

      if (!bluetooth?.requestDevice) {
        setBtFeedback(
          'Web Bluetooth is not available in this browser. Plug in a USB gamepad or use a Chromium build with Bluetooth enabled.'
        );
        return;
      }

      const device = await bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'device_information', 'generic_access'],
      });
      const name = device.name?.trim() || 'Bluetooth device';
      const lower = name.toLowerCase();
      let kind: BtDeviceKind = 'other';
      if (/remote|fire tv|shield|roku|apple tv|chromecast/.test(lower)) kind = 'remote';
      else if (/xbox|dualshock|dualsense|controller|gamepad|joy-con|switch/.test(lower)) kind = 'gamepad';
      else if (/speaker|soundbar|boom|homepod|echo/.test(lower)) kind = 'speaker';
      else if (/buds|headphone|airpods|headset|earbud/.test(lower)) kind = 'headphones';

      setBtDevices((prev) => {
        const next = prev.filter((d) => d.id !== device.id);
        next.unshift({
          id: device.id || `bt-${Date.now()}`,
          name,
          kind,
          status: device.gatt?.connected ? 'connected' : 'paired',
          detail: device.gatt?.connected ? 'GATT connected' : 'Paired via Web Bluetooth picker',
        });
        return next;
      });
      setBtFeedback(`Added “${name}”. Audio/speaker profiles may still need OS-level pairing.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/cancel|abort/i.test(msg)) {
        setBtFeedback('Pairing cancelled.');
      } else {
        setBtFeedback(msg || 'Bluetooth pairing failed.');
      }
    } finally {
      setBtScanning(false);
    }
  };

  const removeBtDevice = (id: string) => {
    setBtDevices((prev) => prev.filter((d) => d.id !== id));
  };

  // Playback & Video
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [skipIntros, setSkipIntros] = useState(true);
  const [matchFrameRate, setMatchFrameRate] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<'original' | 'fit' | 'cinema'>('original');
  const [resumeBehavior, setResumeBehavior] = useState<'always' | 'ask' | 'restart'>('always');

  // Subtitles & Audio Languages
  const [subtitleLang, setSubtitleLang] = useState('English');
  const [subtitleSize, setSubtitleSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [subtitleColor, setSubtitleColor] = useState<'yellow' | 'white' | 'cyan'>('yellow');
  const [autoDownloadSubs, setAutoDownloadSubs] = useState(true);

  // Storage & Drives
  const [autoScanUsb, setAutoScanUsb] = useState(true);
  const [libraryUpdateFreq, setLibraryUpdateFreq] = useState<'hourly' | 'daily' | 'manual'>('daily');
  const [cacheCleared, setCacheCleared] = useState(false);

  // Server & LAN
  const [dlnaBroadcast, setDlnaBroadcast] = useState(true);
  const [upnpPortForward, setUpnpPortForward] = useState(true);
  const [proxyStatus, setProxyStatus] = useState<{
    outboundEnabled: boolean;
    endpoint: string;
    allowlistSize: number;
    gatewayEnabled: boolean;
    gatewayUser: string | null;
    host: string;
    port: number;
  } | null>(null);
  const [proxyStatusError, setProxyStatusError] = useState<string | null>(null);

  // API token (NASCENT_API_TOKEN) — entered by the user, kept in
  // sessionStorage for this browser tab only. Never baked into the
  // app bundle (see src/lib/apiAuth.ts).
  const [apiTokenInput, setApiTokenInput] = useState<string>(() => getApiToken());
  const [apiTokenSaved, setApiTokenSaved] = useState<boolean>(() => getApiToken().length > 0);

  // UI theme (app shell background) — persisted in localStorage
  const [uiTheme, setUiTheme] = useState<UiThemeId>(() => getStoredUiTheme());

  useEffect(() => {
    if (!isOpen || activeCategory !== 'network') return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch('/api/proxy/status');
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setProxyStatus(data);
          setProxyStatusError(null);
        }
      } catch (err: any) {
        if (!cancelled) {
          setProxyStatusError(err?.message || 'Could not reach reverse proxy');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, activeCategory]);

  if (!isOpen) return null;

  const currentProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];
  const displayedAvatarUrl = editingName
    ? profileAvatarDraft
    : currentProfile.avatarUrl ?? null;

  const beginProfileEdit = () => {
    setProfileNameInput(currentProfile.name);
    setProfileAvatarDraft(currentProfile.avatarUrl ?? null);
    setEditingName(true);
  };

  const cancelProfileEdit = () => {
    setEditingName(false);
    setProfileAvatarDraft(currentProfile.avatarUrl ?? null);
    if (profilePhotoInputRef.current) profilePhotoInputRef.current.value = '';
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 4 * 1024 * 1024) {
      setProfileFeedback('Photo must be under 4 MB.');
      setTimeout(() => setProfileFeedback(null), 3000);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfileAvatarDraft(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfileName = () => {
    if (!profileNameInput.trim()) return;
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === activeProfileId
          ? {
              ...p,
              name: profileNameInput.trim(),
              initials: profileNameInput
                .trim()
                .split(/\s+/)
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase() || 'TV',
              avatarUrl: profileAvatarDraft,
            }
          : p
      )
    );
    setEditingName(false);
    setProfileFeedback(
      profileAvatarDraft !== (currentProfile.avatarUrl ?? null)
        ? 'Profile name and photo updated.'
        : 'Profile name updated successfully.'
    );
    setTimeout(() => setProfileFeedback(null), 3000);
  };

  const handleLogOut = () => {
    clearApiToken();
    setApiTokenInput('');
    setApiTokenSaved(false);
    setProfileFeedback('Signed out of this device.');
    setTimeout(() => {
      setProfileFeedback(null);
      onClose();
    }, 600);
  };

  const handleTogglePlugin = (pluginId: string) => {
    setPluginsList((prev) =>
      prev.map((item) =>
        item.id === pluginId ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  const handleInstallPlugin = (pluginId: string) => {
    setPluginsList((prev) =>
      prev.map((item) =>
        item.id === pluginId
          ? { ...item, isInstalled: true, enabled: true }
          : item
      )
    );
    const target = pluginsList.find((p) => p.id === pluginId);
    setPluginFeedback(`Plugin "${target?.name || pluginId}" installed and enabled!`);
    setTimeout(() => setPluginFeedback(null), 3500);
  };

  const handleUninstallPlugin = (pluginId: string) => {
    setPluginsList((prev) =>
      prev.map((item) =>
        item.id === pluginId
          ? { ...item, isInstalled: false, enabled: false }
          : item
      )
    );
    const target = pluginsList.find((p) => p.id === pluginId);
    setPluginFeedback(`Uninstalled "${target?.name || pluginId}".`);
    setTimeout(() => setPluginFeedback(null), 3500);
  };

  const handleInstallFromManifest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manifestUrl.trim()) return;
    const manifestName = manifestUrl.split('/').pop()?.replace('.json', '') || 'Community Plugin';
    const newPlugin: PluginItem = {
      id: `custom-${Date.now()}`,
      name: manifestName.charAt(0).toUpperCase() + manifestName.slice(1),
      version: 'v1.0.0',
      author: 'Custom URL',
      category: 'catalogs',
      description: `Installed from manifest: ${manifestUrl}`,
      enabled: true,
      isInstalled: true,
      rating: '5.0',
      downloads: '1'
    };
    setPluginsList((prev) => [newPlugin, ...prev]);
    setManifestUrl('');
    setIsInstallingFromUrl(false);
    setPluginFeedback(`Installed custom plugin "${newPlugin.name}" successfully!`);
    setTimeout(() => setPluginFeedback(null), 4000);
  };

  const filteredPlugins = pluginsList.filter((plugin) => {
    if (pluginCategoryFilter === 'installed' && !plugin.isInstalled) return false;
    if (pluginCategoryFilter !== 'all' && pluginCategoryFilter !== 'installed' && plugin.category !== pluginCategoryFilter) return false;
    if (pluginSearch.trim()) {
      const q = pluginSearch.toLowerCase();
      return (
        plugin.name.toLowerCase().includes(q) ||
        plugin.description.toLowerCase().includes(q) ||
        plugin.author.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 nascent-app-bg flex items-center justify-center p-4 lg:p-8 select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-7xl h-[min(920px,92vh)] bg-black/45 backdrop-blur-xl border border-white/20 rounded-[32px] overflow-hidden shadow-2xl flex flex-col">
        {/* Top Header */}
        <div className="px-8 py-4.5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-white">Settings</h2>
              <span className="text-xs text-zinc-400">Profile preferences, plugins, audio equalizer, playback controls, and network</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close settings"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Two-Pane TV Settings Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Navigation Rail */}
          <div className="w-64 border-r border-white/10 p-4 flex flex-col gap-1.5 bg-black/40 overflow-y-auto no-scrollbar">
            {[
              { id: 'profile', label: 'Profile & Account', icon: User },
              { id: 'remote', label: 'Bluetooth Remote', icon: Bluetooth },
              { id: 'audio-video', label: 'Display & Sound', icon: Palette },
              { id: 'playback', label: 'Playback & Video', icon: Film },
              { id: 'network', label: 'Server & LAN', icon: Server },
              { id: 'plugins', label: 'Plugins & Addons', icon: Puzzle, count: pluginsList.filter(p => p.isInstalled && p.enabled).length },
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all text-left ${
                    isActive
                      ? 'bg-sky-500 text-black shadow-lg shadow-sky-500/30 font-bold'
                      : 'text-zinc-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{cat.label}</span>
                  </div>
                  {typeof cat.count === 'number' && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${isActive ? 'bg-black/25 text-black' : 'bg-white/10 text-zinc-400'}`}>
                      {cat.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Detail Pane */}
          <div className="flex-1 p-7 lg:p-8 overflow-y-auto no-scrollbar">
            {/* 1. PROFILE SETTINGS TAB */}
            {activeCategory === 'profile' && (
              <div className="flex flex-col gap-6 animate-in fade-in duration-150">
                {profileFeedback && (
                  <div className="px-4 py-2.5 rounded-2xl bg-emerald-950/70 border border-emerald-400/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{profileFeedback}</span>
                  </div>
                )}

                {/* Profile Banner Card */}
                <div className="p-6 rounded-3xl bg-gradient-to-r from-sky-950/40 via-indigo-950/30 to-black/80 border border-sky-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                  <div className="flex items-center gap-4">
                    <input
                      ref={profilePhotoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePhotoChange}
                    />
                    <div className="relative flex flex-col items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (editingName) {
                            profilePhotoInputRef.current?.click();
                          } else {
                            beginProfileEdit();
                            // Open picker after edit mode mounts
                            requestAnimationFrame(() => profilePhotoInputRef.current?.click());
                          }
                        }}
                        className={`relative w-16 h-16 rounded-2xl bg-gradient-to-tr ${currentProfile.color} flex items-center justify-center text-white font-extrabold text-2xl shadow-xl ring-2 ring-white/20 overflow-hidden group focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer`}
                        title={editingName ? 'Change profile photo' : 'Edit profile'}
                        aria-label={editingName ? 'Change profile photo' : 'Edit profile'}
                      >
                        {displayedAvatarUrl ? (
                          <img
                            src={displayedAvatarUrl}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <span className="relative z-0">{currentProfile.initials}</span>
                        )}
                        {editingName && (
                          <span className="absolute inset-0 z-10 flex items-center justify-center bg-black/55 opacity-100 group-hover:bg-black/70 transition-colors">
                            <Camera className="w-6 h-6 text-white drop-shadow" />
                          </span>
                        )}
                      </button>
                      {editingName && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => profilePhotoInputRef.current?.click()}
                            className="text-[10px] text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
                          >
                            Change photo
                          </button>
                          {profileAvatarDraft && (
                            <button
                              type="button"
                              onClick={() => {
                                setProfileAvatarDraft(null);
                                if (profilePhotoInputRef.current) profilePhotoInputRef.current.value = '';
                              }}
                              className="text-[10px] text-zinc-400 hover:text-rose-300 font-semibold cursor-pointer"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      {editingName ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <input
                            type="text"
                            value={profileNameInput}
                            onChange={(e) => setProfileNameInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveProfileName();
                              if (e.key === 'Escape') cancelProfileEdit();
                            }}
                            autoFocus
                            className="px-3 py-1 bg-black/60 border border-sky-400 rounded-xl text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
                          />
                          <button
                            type="button"
                            onClick={handleSaveProfileName}
                            className="px-3 py-1 bg-sky-500 text-black text-xs font-bold rounded-xl hover:bg-sky-400 transition-colors cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelProfileEdit}
                            className="px-3 py-1 bg-white/10 text-zinc-300 hover:text-white text-xs font-semibold rounded-xl hover:bg-white/15 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5">
                          <h3 className="font-display font-extrabold text-2xl text-white">
                            {currentProfile.name}
                          </h3>
                          <button
                            type="button"
                            onClick={beginProfileEdit}
                            className="text-xs text-sky-400 hover:text-sky-300 underline font-medium cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-2.5 mt-1">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          Nascent Premium · Active Member
                        </span>
                        {currentProfile.isKid && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold">
                            Kids Filter Enabled
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-stretch md:self-center">
                    <button
                      type="button"
                      onClick={handleLogOut}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-zinc-200 hover:text-white border border-white/15 text-xs font-semibold transition-all cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-sky-400" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>

                {/* Content Maturity & Screening */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Content Maturity Level</h4>
                      <p className="text-xs text-zinc-400">Filter media catalogs, search results, and spotlight trailers</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {[
                        { id: 'all', label: 'All Ratings (R / TV-MA)' },
                        { id: 'pg13', label: 'Teens (PG-13 / TV-14)' },
                        { id: 'family', label: 'Family (G / PG)' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setMaturityRating(item.id as any)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            maturityRating === item.id
                              ? 'bg-sky-500 text-black font-bold shadow-md'
                              : 'bg-white/5 hover:bg-white/10 text-zinc-300'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-xs font-semibold text-zinc-200">Autoplay Billboard Trailers</h5>
                        <p className="text-[11px] text-zinc-400">Play background trailers with sound on movie hover</p>
                      </div>
                      <button
                        onClick={() => setAutoplayTrailers(!autoplayTrailers)}
                        className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${autoplayTrailers ? 'bg-sky-500' : 'bg-zinc-700'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${autoplayTrailers ? 'right-0.5' : 'left-0.5'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-xs font-semibold text-zinc-200">Display Continue Watching Shelf</h5>
                        <p className="text-[11px] text-zinc-400">Show in-progress resume row directly above top 50 rails</p>
                      </div>
                      <button
                        onClick={() => setShowContinueWatching(!showContinueWatching)}
                        className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${showContinueWatching ? 'bg-sky-500' : 'bg-zinc-700'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${showContinueWatching ? 'right-0.5' : 'left-0.5'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-xs font-semibold text-zinc-200">Sync Across LAN Devices</h5>
                        <p className="text-[11px] text-zinc-400">Synchronize watchlist and playback markers with local TVs</p>
                      </div>
                      <button
                        onClick={() => setSyncHistory(!syncHistory)}
                        className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${syncHistory ? 'bg-sky-500' : 'bg-zinc-700'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${syncHistory ? 'right-0.5' : 'left-0.5'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-xs font-semibold text-zinc-200">Private Viewing Mode</h5>
                        <p className="text-[11px] text-zinc-400">Pause logging viewing history and stats for this session</p>
                      </div>
                      <button
                        onClick={() => setPrivateViewing(!privateViewing)}
                        className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${privateViewing ? 'bg-sky-500' : 'bg-zinc-700'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${privateViewing ? 'right-0.5' : 'left-0.5'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Default Home Tab */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Default Startup Tab</h4>
                    <p className="text-xs text-zinc-400">Choose which catalog section opens first when turning on TV</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[
                      { id: 'movies', label: 'Movies' },
                      { id: 'shows', label: 'TV Shows' },
                      { id: 'local-media', label: 'Libraries' },
                      { id: 'watchlists', label: 'Watchlist' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setDefaultStartupTab(tab.id as any)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          defaultStartupTab === tab.id
                            ? 'bg-sky-500 text-black font-bold'
                            : 'bg-white/5 hover:bg-white/10 text-zinc-300'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. PLUGINS TAB */}
            {activeCategory === 'plugins' && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-150">
                {pluginFeedback && (
                  <div className="px-4 py-2.5 rounded-2xl bg-sky-950/70 border border-sky-400/40 text-sky-300 text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>{pluginFeedback}</span>
                  </div>
                )}

                {/* Plugins Header & Manifest URL installer */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-1 border-b border-white/10">
                  <div>
                    <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
                      <Puzzle className="w-5 h-5 text-sky-400" />
                      <span>Plugins & Community Addons</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Extend scrapers, subtitle sources, audio decoders, and cloud torrent resolvers.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {onOpenPlugins && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenPlugins();
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                      >
                        <Puzzle className="w-3.5 h-3.5" />
                        <span>Addon Studio & Sandbox</span>
                      </button>
                    )}
                    <button
                      onClick={() => setIsInstallingFromUrl(!isInstallingFromUrl)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Install from URL</span>
                    </button>
                  </div>
                </div>

                {/* Inline Manifest Installer Input */}
                {isInstallingFromUrl && (
                  <form onSubmit={handleInstallFromManifest} className="p-4 rounded-2xl bg-white/5 border border-sky-500/40 flex flex-col sm:flex-row items-center gap-3 animate-in fade-in">
                    <input
                      type="url"
                      value={manifestUrl}
                      onChange={(e) => setManifestUrl(e.target.value)}
                      placeholder="Paste addon manifest URL (e.g., https://addons.nascent.tv/manifest.json)"
                      className="flex-1 w-full px-4 py-2 bg-black/60 border border-white/20 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-400"
                    />
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-sky-500 text-black font-bold text-xs rounded-xl hover:bg-sky-400 transition-colors cursor-pointer"
                      >
                        Install Plugin
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsInstallingFromUrl(false)}
                        className="px-3 py-2 text-zinc-400 hover:text-white text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Category Filters Bar */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {[
                    { id: 'all', label: `All (${pluginsList.length})` },
                    { id: 'installed', label: `Installed (${pluginsList.filter(p => p.isInstalled).length})` },
                    { id: 'catalogs', label: 'Catalogs' },
                    { id: 'subtitles', label: 'Subtitles' },
                    { id: 'streaming', label: 'Streaming' },
                    { id: 'audio', label: 'Audio' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setPluginCategoryFilter(cat.id as any)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        pluginCategoryFilter === cat.id
                          ? 'bg-sky-500 text-black font-bold shadow-md shadow-sky-500/20'
                          : 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/5'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Plugin Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pb-4">
                  {filteredPlugins.map((plugin) => {
                    const PluginIcon = getPluginIcon(plugin);
                    return (
                    <div
                      key={plugin.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                        plugin.isInstalled && plugin.enabled
                          ? 'bg-white/5 border-sky-500/30 shadow-md'
                          : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-md ${
                            plugin.isInstalled && plugin.enabled
                              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                              : 'bg-white/10 text-zinc-400 border border-white/10'
                          }`}>
                            <PluginIcon className="w-5 h-5" aria-hidden />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-white">{plugin.name}</span>
                              {plugin.isOfficial && (
                                <span className="px-1.5 py-0.2 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[9px] font-bold">
                                  Official
                                </span>
                              )}
                              <span className="text-[10px] text-zinc-400 font-mono">{plugin.version}</span>
                            </div>
                            <span className="text-[11px] text-zinc-400">By {plugin.author}</span>
                          </div>
                        </div>

                        {/* Status Toggle or Install button */}
                        {plugin.isInstalled ? (
                          <button
                            onClick={() => handleTogglePlugin(plugin.id)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                              plugin.enabled
                                ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 shadow-sm'
                                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                            }`}
                          >
                            {plugin.enabled ? 'Active' : 'Disabled'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleInstallPlugin(plugin.id)}
                            className="flex items-center gap-1 px-3 py-1 rounded-full bg-sky-500 hover:bg-sky-400 text-black text-xs font-bold shadow-md transition-all cursor-pointer"
                          >
                            <Download className="w-3 h-3" />
                            <span>Install</span>
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-zinc-400 line-clamp-2">
                        {plugin.description}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-zinc-400">
                        <div className="flex items-center gap-3">
                          {plugin.rating && (
                            <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                              ★ {plugin.rating}
                            </span>
                          )}
                          {plugin.downloads && (
                            <span>{plugin.downloads} users</span>
                          )}
                        </div>

                        {plugin.isInstalled && (
                          <button
                            onClick={() => handleUninstallPlugin(plugin.id)}
                            className="text-[11px] text-rose-400/80 hover:text-rose-300 transition-colors cursor-pointer"
                          >
                            Uninstall
                          </button>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Display & Sound */}
            {activeCategory === 'audio-video' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="font-display font-bold text-lg text-white mb-1 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-sky-400" />
                    UI Theme
                  </h3>
                  <p className="text-xs text-zinc-400 mb-4">
                    Choose the ambient look for the app shell, settings, and search. Saved on this device.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {UI_THEMES.map((theme) => {
                      const isSelected = uiTheme === theme.id;
                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => {
                            setUiTheme(theme.id);
                            applyUiTheme(theme.id);
                          }}
                          className={`group relative p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-sky-500/15 border-sky-400 shadow-[0_0_18px_rgba(56,189,248,0.22)]'
                              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                          }`}
                        >
                          <div
                            className="h-14 w-full rounded-xl mb-3 border border-white/10 overflow-hidden relative"
                            style={{
                              backgroundImage: `linear-gradient(135deg, ${theme.swatches[2]} 0%, ${theme.swatches[1]} 45%, ${theme.swatches[0]} 100%)`,
                            }}
                            aria-hidden
                          >
                            <div className="absolute inset-0 flex items-end justify-end gap-1 p-2">
                              {theme.swatches.map((color) => (
                                <span
                                  key={color}
                                  className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-sm font-semibold ${isSelected ? 'text-sky-300' : 'text-white'}`}>
                              {theme.label}
                            </span>
                            {isSelected && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-sky-300">
                                <Check className="w-3 h-3" />
                                Active
                              </span>
                            )}
                            {theme.id === 'midnight' && !isSelected && (
                              <Moon className="w-3.5 h-3.5 text-zinc-500" aria-hidden />
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-1 leading-snug">{theme.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="font-display font-bold text-lg text-white mb-1">Cinema Audio Equalizer</h3>
                  <p className="text-xs text-zinc-400 mb-4">Fine-tune frequencies for home cinema acoustics, TV speakers, and soundbars.</p>

                  {/* Presets */}
                  <div className="grid grid-cols-4 gap-2 mb-6">
                    {[
                      { id: 'normal', label: 'Cinema Studio' },
                      { id: 'vocal', label: 'Dialogue Clear' },
                      { id: 'bass', label: 'Bass Nascent Boost' },
                      { id: 'cinema', label: 'Surround 5.1' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => onAudioPresetChange(p.id)}
                        className={`py-2 px-3.5 rounded-full text-xs font-semibold border text-center transition-all ${
                          audioPreset === p.id
                            ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                            : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Sliders */}
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-end justify-between gap-4">
                    {[
                      { id: 'hz60', label: '60Hz' },
                      { id: 'hz230', label: '230Hz' },
                      { id: 'hz910', label: '910Hz' },
                      { id: 'hz4000', label: '4kHz' },
                      { id: 'hz14000', label: '14kHz' },
                    ].map((band) => (
                      <div key={band.id} className="flex flex-col items-center gap-2 flex-1">
                        <input
                          type="range"
                          min="-12"
                          max="12"
                          step="1"
                          value={(eqGains as any)[band.id] || 0}
                          onChange={(e) => onEqChange(band.id, parseFloat(e.target.value))}
                          className="h-28 w-2 accent-sky-400 [writing-mode:vertical-lr] [direction:rtl] cursor-pointer"
                        />
                        <span className="text-xs font-mono text-zinc-400">{band.label}</span>
                        <span className="text-xs font-mono text-sky-400">
                          {((eqGains as any)[band.id] || 0) > 0 ? `+${(eqGains as any)[band.id]}` : (eqGains as any)[band.id]}dB
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Sound & Display Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Night Mode (DRC)</h4>
                      <p className="text-xs text-zinc-400">Compresses explosions & boosts quiet whispers</p>
                    </div>
                    <button
                      onClick={() => setNightMode(!nightMode)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${nightMode ? 'bg-sky-500' : 'bg-zinc-700'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${nightMode ? 'right-0.5' : 'left-0.5'}`} />
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Dolby Atmos Passthrough</h4>
                      <p className="text-xs text-zinc-400">Direct bitstream to HDMI eARC sound system</p>
                    </div>
                    <button
                      onClick={() => setAudioPassthrough(!audioPassthrough)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${audioPassthrough ? 'bg-sky-500' : 'bg-zinc-700'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${audioPassthrough ? 'right-0.5' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Playback & Video */}
            {activeCategory === 'playback' && (
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="font-display font-bold text-lg text-white mb-1">Playback & Video Preferences</h3>
                  <p className="text-xs text-zinc-400 mb-4">Frame rate matching, automation, and aspect ratio controls.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-white">Auto-Play Next Episode</h4>
                        <p className="text-xs text-zinc-400">Seamlessly continue next TV show episode</p>
                      </div>
                      <button
                        onClick={() => setAutoPlayNext(!autoPlayNext)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${autoPlayNext ? 'bg-sky-500' : 'bg-zinc-700'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${autoPlayNext ? 'right-0.5' : 'left-0.5'}`} />
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-white">Auto-Skip Intros & Recaps</h4>
                        <p className="text-xs text-zinc-400">Automatically jump past title credits</p>
                      </div>
                      <button
                        onClick={() => setSkipIntros(!skipIntros)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${skipIntros ? 'bg-sky-500' : 'bg-zinc-700'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${skipIntros ? 'right-0.5' : 'left-0.5'}`} />
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-white">Match Frame Rate (24p)</h4>
                        <p className="text-xs text-zinc-400">Eliminates judder for true 24.000 fps cinema</p>
                      </div>
                      <button
                        onClick={() => setMatchFrameRate(!matchFrameRate)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${matchFrameRate ? 'bg-sky-500' : 'bg-zinc-700'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${matchFrameRate ? 'right-0.5' : 'left-0.5'}`} />
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2">
                      <span className="text-xs font-semibold text-zinc-400 uppercase">Default Aspect Ratio</span>
                      <div className="flex items-center gap-2">
                        {[
                          { id: 'original', label: 'Original' },
                          { id: 'fit', label: 'Fit to TV' },
                          { id: 'cinema', label: '21:9 Scope' },
                        ].map((ar) => (
                          <button
                            key={ar.id}
                            onClick={() => setAspectRatio(ar.id as any)}
                            className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
                              aspectRatio === ar.id ? 'bg-sky-500 text-black' : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                            }`}
                          >
                            {ar.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Resume Playback</h4>
                      <p className="text-xs text-zinc-400">Choose behavior when opening previously watched titles</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {[
                        { id: 'always', label: 'Resume' },
                        { id: 'ask', label: 'Always Ask' },
                        { id: 'restart', label: 'Start Over' },
                      ].map((r) => (
                        <button
                          key={r.id}
                          onClick={() => setResumeBehavior(r.id as any)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            resumeBehavior === r.id ? 'bg-sky-500 text-black' : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-display font-bold text-lg text-white mb-1">Subtitles & Audio Language</h3>
                  <p className="text-xs text-zinc-400 mb-4">Typography, positioning, styling, and scraper settings.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2">
                      <span className="text-xs font-semibold text-zinc-400 uppercase">Default Subtitle Language</span>
                      <div className="grid grid-cols-3 gap-2">
                        {['English', 'Spanish', 'French', 'German', 'Japanese', 'Off'].map((lang) => (
                          <button
                            key={lang}
                            onClick={() => setSubtitleLang(lang)}
                            className={`py-1.5 rounded-xl text-xs font-semibold transition-all ${
                              subtitleLang === lang ? 'bg-sky-500 text-black' : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                            }`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2">
                      <span className="text-xs font-semibold text-zinc-400 uppercase">Subtitle Font Size</span>
                      <div className="flex items-center gap-2">
                        {[
                          { id: 'small', label: 'Small (24px)' },
                          { id: 'medium', label: 'Medium (32px)' },
                          { id: 'large', label: 'Large (40px)' },
                        ].map((s) => (
                          <button
                            key={s.id}
                            onClick={() => setSubtitleSize(s.id as any)}
                            className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
                              subtitleSize === s.id ? 'bg-sky-500 text-black' : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-white">Subtitle Text Color</h4>
                        <p className="text-xs text-zinc-400">High-contrast on bright HDR scenes</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {[
                          { id: 'yellow', label: 'Yellow', bg: 'bg-amber-300 text-black' },
                          { id: 'white', label: 'White', bg: 'bg-white text-black' },
                          { id: 'cyan', label: 'Cyan', bg: 'bg-cyan-300 text-black' },
                        ].map((c) => (
                          <button
                            key={c.id}
                            onClick={() => setSubtitleColor(c.id as any)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                              subtitleColor === c.id ? `${c.bg} shadow-md` : 'bg-white/10 text-zinc-300 hover:bg-white/20'
                            }`}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-white">Auto-Download Subtitles</h4>
                        <p className="text-xs text-zinc-400">Fetch matching .srt from OpenSubtitles</p>
                      </div>
                      <button
                        onClick={() => setAutoDownloadSubs(!autoDownloadSubs)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${autoDownloadSubs ? 'bg-sky-500' : 'bg-zinc-700'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${autoDownloadSubs ? 'right-0.5' : 'left-0.5'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Server & LAN (includes storage / cache) */}
            {activeCategory === 'network' && (
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="font-display font-bold text-lg text-white mb-1">Storage, Drives & Cache</h3>
                  <p className="text-xs text-zinc-400 mb-4">Removable media detection, disk caches, and library maintenance.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-white">Auto-Scan USB Drives</h4>
                        <p className="text-xs text-zinc-400">Scan media automatically on drive insertion</p>
                      </div>
                      <button
                        onClick={() => setAutoScanUsb(!autoScanUsb)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${autoScanUsb ? 'bg-sky-500' : 'bg-zinc-700'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${autoScanUsb ? 'right-0.5' : 'left-0.5'}`} />
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2">
                      <span className="text-xs font-semibold text-zinc-400 uppercase">Library Auto-Refresh</span>
                      <div className="flex items-center gap-2">
                        {[
                          { id: 'hourly', label: 'Every 6h' },
                          { id: 'daily', label: 'Daily' },
                          { id: 'manual', label: 'Manual' },
                        ].map((f) => (
                          <button
                            key={f.id}
                            onClick={() => setLibraryUpdateFreq(f.id as any)}
                            className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
                              libraryUpdateFreq === f.id ? 'bg-sky-500 text-black' : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Video Chunk & Artwork Cache</h4>
                      <p className="text-xs text-zinc-400">
                        {cacheCleared ? 'Cache is clear (0 MB)' : '1.42 GB stored across indexed media & posters'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setCacheCleared(true);
                        setTimeout(() => setCacheCleared(false), 4000);
                      }}
                      className="px-5 py-2.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all"
                    >
                      {cacheCleared ? 'Cache Cleared!' : 'Clear Stream Cache'}
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-display font-bold text-lg text-white mb-1">Local Server & Network Diagnostics</h3>
                  <p className="text-xs text-zinc-400 mb-4">Built-in reverse proxy, port binding, DLNA, and LAN sync.</p>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3 mb-4">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center justify-center">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">Built-in Reverse Proxy</h4>
                        <p className="text-xs text-zinc-400">Allowlisted HTTPS gateway · Range streaming · optional Basic auth</p>
                      </div>
                    </div>
                    {proxyStatusError ? (
                      <p className="text-xs text-rose-400">{proxyStatusError}</p>
                    ) : proxyStatus ? (
                      <>
                        <div className="flex items-center justify-between text-xs text-zinc-300">
                          <span>Outbound endpoint</span>
                          <span className="font-mono text-zinc-200">{proxyStatus.endpoint}?url=…</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-zinc-300">
                          <span>Allowlisted hosts</span>
                          <span className="font-mono text-zinc-200">{proxyStatus.allowlistSize}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-zinc-300">
                          <span>Gateway auth</span>
                          <span className={`font-bold ${proxyStatus.gatewayEnabled ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {proxyStatus.gatewayEnabled
                              ? `On · ${proxyStatus.gatewayUser}`
                              : 'Off · set NASCENT_GATEWAY_PASSWORD'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-zinc-300">
                          <span>Bind</span>
                          <span className="font-mono text-zinc-200">{proxyStatus.host}:{proxyStatus.port}</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-zinc-500">Loading proxy status…</p>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3 mb-4">
                    <div>
                      <h4 className="text-sm font-semibold text-white">API Token</h4>
                      <p className="text-xs text-zinc-400">
                        Required only when the server sets <span className="font-mono">NASCENT_API_TOKEN</span>. Paste it here once per browser session — it is kept in this tab only and is never shipped in the app.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        value={apiTokenInput}
                        onChange={(e) => {
                          setApiTokenInput(e.target.value);
                          setApiTokenSaved(false);
                        }}
                        placeholder={apiTokenSaved ? 'Token saved for this session' : 'Paste API token…'}
                        autoComplete="off"
                        className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-sky-500 font-mono"
                      />
                      <button
                        onClick={() => {
                          setApiToken(apiTokenInput);
                          setApiTokenSaved(apiTokenInput.trim().length > 0);
                        }}
                        className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          clearApiToken();
                          setApiTokenInput('');
                          setApiTokenSaved(false);
                        }}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold transition"
                      >
                        Clear
                      </button>
                    </div>
                    {apiTokenSaved && (
                      <p className="text-xs text-emerald-400">Token saved for this browser session.</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-white">DLNA Media Server</h4>
                        <p className="text-xs text-zinc-400">Broadcast local media to smart TVs</p>
                      </div>
                      <button
                        onClick={() => setDlnaBroadcast(!dlnaBroadcast)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${dlnaBroadcast ? 'bg-sky-500' : 'bg-zinc-700'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${dlnaBroadcast ? 'right-0.5' : 'left-0.5'}`} />
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-white">UPnP Port Mapping</h4>
                        <p className="text-xs text-zinc-400">Automatic router port traversal</p>
                      </div>
                      <button
                        onClick={() => setUpnpPortForward(!upnpPortForward)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${upnpPortForward ? 'bg-sky-500' : 'bg-zinc-700'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${upnpPortForward ? 'right-0.5' : 'left-0.5'}`} />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs text-zinc-300">
                      <span>Server Status</span>
                      <span className="font-bold text-emerald-400">
                        Online · Port {proxyStatus?.port ?? 3000} Active
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-zinc-300">
                      <span>Bind address</span>
                      <span className="font-mono text-zinc-200">
                        {proxyStatus ? `${proxyStatus.host}:${proxyStatus.port}` : '127.0.0.1:3000'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-zinc-300">
                      <span>Bandwidth Limit</span>
                      <span className="font-mono text-zinc-200">Unlimited (Gigabit Ready)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-zinc-300">
                      <span>LAN Latency</span>
                      <span className="font-mono text-emerald-400">0.8 ms (Local SSD Bus)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TV Remote & Bluetooth accessories */}
            {activeCategory === 'remote' && (
              <div className="flex flex-col gap-6">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
                    <div>
                      <h3 className="font-display font-bold text-lg text-white mb-1">
                        Bluetooth Devices
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Pair TV remotes, game controllers, speakers, and headphones. Gamepads use the
                        HID Gamepad API; other accessories use Web Bluetooth when the browser allows it.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleBluetoothScan()}
                      disabled={btScanning}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-sky-500 hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed text-black text-xs font-bold shadow-md shadow-sky-500/20 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400 shrink-0"
                    >
                      {btScanning ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Bluetooth className="w-3.5 h-3.5" />
                      )}
                      <span>{btScanning ? 'Scanning…' : 'Scan & Pair'}</span>
                    </button>
                  </div>

                  <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px]">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                        btSupported
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                      }`}
                    >
                      <BluetoothConnected className="w-3 h-3" />
                      {btSupported ? 'Web Bluetooth available' : 'Web Bluetooth unavailable'}
                    </span>
                    <span className="text-zinc-500">
                      Remotes & speakers often require OS Bluetooth settings in addition to the browser picker.
                    </span>
                  </div>

                  {btFeedback && (
                    <div className="mb-3 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[11px] text-zinc-300">
                      {btFeedback}
                    </div>
                  )}

                  {btDevices.length === 0 ? (
                    <div className="p-5 rounded-2xl bg-white/5 border border-dashed border-white/15 text-center">
                      <Bluetooth className="w-6 h-6 text-zinc-500 mx-auto mb-2" />
                      <p className="text-xs text-zinc-400">
                        No Bluetooth or gamepad devices listed yet. Press Scan &amp; Pair, or connect a
                        controller and it will appear automatically.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {btDevices.map((device) => {
                        const Icon = kindIcon(device.kind);
                        return (
                          <div
                            key={device.id}
                            className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10"
                          >
                            <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold text-white truncate">
                                  {device.name}
                                </span>
                                <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">
                                  {device.kind}
                                </span>
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold border ${
                                    device.status === 'connected'
                                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                      : device.status === 'paired'
                                        ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                                        : 'bg-white/5 text-zinc-400 border-white/10'
                                  }`}
                                >
                                  {device.status}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-500 truncate">{device.detail}</p>
                            </div>
                            <button
                              type="button"
                              title="Remove from list"
                              onClick={() => removeBtDevice(device.id)}
                              className="px-3 py-1.5 rounded-full text-[11px] font-semibold text-zinc-400 hover:text-rose-300 hover:bg-rose-500/10 border border-white/10 cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
