import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Sliders, 
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
  HardDrive,
  Moon,
  Tv,
  Trash2,
  RefreshCw,
  Sparkles,
  Play,
  Gamepad2,
  Bluetooth,
  BluetoothConnected,
  Headphones,
  User,
  UserCheck,
  UserPlus,
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
  Lock,
  Users,
  Share2,
  WifiOff
} from 'lucide-react';
import { SHARED_PEER_LIBRARIES } from '../../lib/tvMediaData';
import { addonPaywall } from '../../lib/plugins/addonPaywall';
import { TvAddonPaywallModal } from './TvAddonPaywallModal';

interface TvSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStreamingHUD: () => void;
  onToggleRemote?: () => void;
  isRemoteOpen?: boolean;
  onOpenPlugins?: () => void;
  pluginsActivated?: boolean;
  onPluginsActivatedChange?: (activated: boolean) => void;
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
  | 'remote' // legacy alias → Devices & Drives
  | 'audio-video' 
  | 'playback' // legacy alias → Display & Sound
  | 'subtitles' 
  | 'streaming' // legacy alias → Server & LAN
  | 'storage' 
  | 'peers'
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

interface UserProfile {
  id: string;
  name: string;
  initials: string;
  color: string;
  isKid: boolean;
  isPrimary?: boolean;
}

export const TvSettingsModal: React.FC<TvSettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenStreamingHUD,
  onToggleRemote,
  isRemoteOpen = false,
  onOpenPlugins,
  pluginsActivated = false,
  onPluginsActivatedChange,
  eqGains,
  onEqChange,
  audioPreset,
  onAudioPresetChange,
  initialCategory = 'profile',
}) => {
  const [activeCategory, setActiveCategory] = useState<SettingCategory>(() => {
    if (initialCategory === 'remote') return 'storage';
    if (initialCategory === 'streaming') return 'network';
    if (initialCategory === 'playback') return 'audio-video';
    return initialCategory;
  });

  // Profile Settings State
  const [profiles, setProfiles] = useState<UserProfile[]>([
    { id: '1', name: 'Steven Azevedo', initials: 'SA', color: 'from-sky-500 to-indigo-600', isKid: false, isPrimary: true },
    { id: '2', name: 'Living Room TV', initials: 'LR', color: 'from-amber-500 to-orange-600', isKid: false },
    { id: '3', name: 'Kids Cinema', initials: 'KC', color: 'from-emerald-400 to-teal-600', isKid: true },
  ]);
  const [activeProfileId, setActiveProfileId] = useState<string>('1');
  const [editingName, setEditingName] = useState(false);
  const [profileNameInput, setProfileNameInput] = useState('Steven Azevedo');
  const [maturityRating, setMaturityRating] = useState<'all' | 'pg13' | 'mature' | 'family'>('all');
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
  const [pluginsUnlocked, setPluginsUnlocked] = useState(() => addonPaywall.isUnlocked());
  const [isPluginPaywallOpen, setIsPluginPaywallOpen] = useState(false);

  useEffect(() => {
    const sync = (unlocked: boolean) => {
      setPluginsUnlocked(unlocked);
      try {
        if (unlocked) localStorage.setItem('nascent-plugins-unlocked', '1');
        else localStorage.removeItem('nascent-plugins-unlocked');
      } catch {
        /* ignore */
      }
    };
    sync(addonPaywall.isUnlocked());
    return addonPaywall.subscribe(sync);
  }, []);

  useEffect(() => {
    if (activeCategory === 'plugins' && !pluginsUnlocked) {
      setIsPluginPaywallOpen(true);
    }
  }, [activeCategory, pluginsUnlocked]);

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
      id: 'dolby-atmos',
      name: 'Dolby Atmos & DTS:X Bitstream',
      version: 'v1.8.0',
      author: 'Acoustics Lab',
      category: 'audio',
      description: 'Direct HDMI eARC bitstream passthrough for 7.1.4 object-based 3D spatial surround sound.',
      enabled: true,
      isInstalled: true,
      isOfficial: true,
      rating: '4.9',
      downloads: '118K'
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
    },
    {
      id: 'fanart-tv',
      name: 'Fanart.tv Ultra HD ClearArt',
      version: 'v1.1.2',
      author: 'Fanart Archive',
      category: 'catalogs',
      description: 'Transparent movie logos, disc art, animated posters, and 4K character banners.',
      enabled: false,
      isInstalled: false,
      isOfficial: false,
      rating: '4.6',
      downloads: '42K'
    }
  ]);

  // Audio / Video & Existing Preferences
  const [bufferSize, setBufferSize] = useState('512MB');
  const [hardwareAccel, setHardwareAccel] = useState(true);
  const [nightMode, setNightMode] = useState(false);
  const [audioPassthrough, setAudioPassthrough] = useState(true);

  // Playback & Video
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [skipIntros, setSkipIntros] = useState(true);
  const [matchFrameRate, setMatchFrameRate] = useState(true);
  const [resumeBehavior, setResumeBehavior] = useState<'always' | 'ask' | 'restart'>('always');

  // Bluetooth devices (TV remotes, audio, accessories)
  type BtDeviceKind = 'remote' | 'audio' | 'other';
  type BtDevice = {
    id: string;
    name: string;
    kind: BtDeviceKind;
    status: 'paired' | 'connected' | 'available';
    detail: string;
  };
  const [btFilter, setBtFilter] = useState<'all' | BtDeviceKind>('all');
  const [btScanning, setBtScanning] = useState(false);
  const [btFeedback, setBtFeedback] = useState<string | null>(null);
  const [btDevices, setBtDevices] = useState<BtDevice[]>([
    {
      id: 'bt-remote-1',
      name: 'Android TV Remote',
      kind: 'remote',
      status: 'connected',
      detail: 'HID · Battery 86%',
    },
    {
      id: 'bt-audio-1',
      name: 'Sony WH-1000XM5',
      kind: 'audio',
      status: 'paired',
      detail: 'A2DP · Last seen nearby',
    },
    {
      id: 'bt-audio-2',
      name: 'Samsung Soundbar Q990',
      kind: 'audio',
      status: 'available',
      detail: 'Audio sink · Not paired',
    },
    {
      id: 'bt-other-1',
      name: 'Xbox Wireless Controller',
      kind: 'other',
      status: 'available',
      detail: 'Gamepad · Ready to pair',
    },
  ]);

  const handleBluetoothScan = () => {
    setBtScanning(true);
    setBtFeedback('Scanning for nearby Bluetooth devices…');
    window.setTimeout(() => {
      setBtDevices((prev) => {
        const extras: BtDevice[] = [
          {
            id: `bt-remote-new-${Date.now()}`,
            name: 'Chromecast Voice Remote',
            kind: 'remote',
            status: 'available',
            detail: 'TV remote · Just discovered',
          },
          {
            id: `bt-audio-new-${Date.now()}`,
            name: 'AirPods Pro',
            kind: 'audio',
            status: 'available',
            detail: 'Audio · Just discovered',
          },
        ];
        const existing = new Set(prev.map((d) => d.name));
        return [...prev, ...extras.filter((d) => !existing.has(d.name))];
      });
      setBtScanning(false);
      setBtFeedback('Scan complete — select a device to pair');
      window.setTimeout(() => setBtFeedback(null), 2800);
    }, 1600);
  };

  const handleBluetoothPair = (id: string) => {
    setBtDevices((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, status: 'connected', detail: d.kind === 'remote' ? 'HID · Connected' : d.kind === 'audio' ? 'A2DP · Connected' : 'Connected' }
          : d
      )
    );
    const device = btDevices.find((d) => d.id === id);
    setBtFeedback(device ? `Paired & connected: ${device.name}` : 'Device connected');
    window.setTimeout(() => setBtFeedback(null), 2500);
  };

  const handleBluetoothRemove = (id: string) => {
    setBtDevices((prev) => prev.filter((d) => d.id !== id));
  };

  // Subtitles & Audio Languages
  const [subtitleLang, setSubtitleLang] = useState('English');
  const [subtitleSize, setSubtitleSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [subtitleColor, setSubtitleColor] = useState<'yellow' | 'white' | 'cyan'>('yellow');
  const [autoDownloadSubs, setAutoDownloadSubs] = useState(true);

  // Streaming Engine
  const [maxResolution, setMaxResolution] = useState<'4k' | '1080p' | 'auto'>('4k');

  // Storage & Drives
  const [autoScanUsb, setAutoScanUsb] = useState(true);
  const [libraryUpdateFreq, setLibraryUpdateFreq] = useState<'hourly' | 'daily' | 'manual'>('daily');
  const [cacheCleared, setCacheCleared] = useState(false);

  // Peers & Library Shares
  const [autoAcceptLanPeers, setAutoAcceptLanPeers] = useState(false);
  const [peerDiscovery, setPeerDiscovery] = useState(true);
  const [shareQuality, setShareQuality] = useState<'low' | 'med' | 'high'>('high');
  const [inviteCode, setInviteCode] = useState('NV-7F2K-9QPM');
  const [peerJoinCode, setPeerJoinCode] = useState('');
  const [peerJoinFeedback, setPeerJoinFeedback] = useState<string | null>(null);
  const [addPeerName, setAddPeerName] = useState('');
  const [addPeerCode, setAddPeerCode] = useState('');
  const [addPeerFeedback, setAddPeerFeedback] = useState<string | null>(null);
  const [isAddPeerOpen, setIsAddPeerOpen] = useState(false);
  const [peerRequests, setPeerRequests] = useState<
    Array<{
      id: string;
      name: string;
      handle: string;
      initials: string;
      color: string;
      direction: 'incoming' | 'outgoing';
      library: string;
      sentAt: string;
    }>
  >([
    {
      id: 'req-in-1',
      name: 'Jordan Lee',
      handle: '@jordan_l',
      initials: 'JL',
      color: 'bg-gradient-to-tr from-violet-500 to-fuchsia-600',
      direction: 'incoming',
      library: 'Wants access to your library',
      sentAt: '12m ago',
    },
    {
      id: 'req-in-2',
      name: 'Nova Media Lab',
      handle: '@nova_lab',
      initials: 'NM',
      color: 'bg-gradient-to-tr from-cyan-500 to-blue-600',
      direction: 'incoming',
      library: 'Wants access to your library',
      sentAt: '1h ago',
    },
    {
      id: 'req-out-1',
      name: 'Alex Remux Vault',
      handle: '@alex_r',
      initials: 'AR',
      color: 'bg-gradient-to-tr from-amber-500 to-orange-600',
      direction: 'outgoing',
      library: 'Pending access to Alex’s 4K Remux Vault',
      sentAt: '3h ago',
    },
  ]);

  // Server & LAN
  const [dlnaBroadcast, setDlnaBroadcast] = useState(true);
  const [upnpPortForward, setUpnpPortForward] = useState(true);

  if (!isOpen) return null;

  const currentProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

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
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase() || 'TV',
            }
          : p
      )
    );
    setEditingName(false);
    setProfileFeedback('Profile name updated successfully.');
    setTimeout(() => setProfileFeedback(null), 3000);
  };

  const handleLogOut = () => {
    setEditingName(false);
    setProfileFeedback('Signed out of this device.');
    window.setTimeout(() => {
      setProfileFeedback(null);
      onClose();
    }, 900);
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
    <div className="fixed inset-0 z-50 bg-[#131313]/96 backdrop-blur-2xl flex items-center justify-center p-4 lg:p-8 select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[min(860px,90vh)] bg-zinc-950/90 border border-white/20 rounded-[32px] overflow-hidden shadow-2xl flex flex-col">
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
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Two-Pane TV Settings Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Navigation Rail */}
          <div className="w-64 border-r border-white/10 p-4 flex flex-col gap-1.5 bg-black/40 overflow-y-auto no-scrollbar">
            {(() => {
              const incomingPeerRequests = peerRequests.filter((r) => r.direction === 'incoming').length;
              return [
              { id: 'profile', label: 'Profile & Account', icon: User },
              { id: 'audio-video', label: 'Display & Sound', icon: Sliders },
              { id: 'subtitles', label: 'Subtitles & Audio', icon: Languages },
              { id: 'storage', label: 'Devices & Drives', icon: HardDrive },
              {
                id: 'peers',
                label: 'Peers & Library Shares',
                icon: Users,
                ...(incomingPeerRequests > 0 ? { count: incomingPeerRequests } : {}),
              },
              { id: 'network', label: 'Server & LAN', icon: Server },
              {
                id: 'plugins',
                label: 'Plugins & Addons',
                icon: Puzzle,
                count: pluginsList.filter((p) => p.isInstalled && p.enabled).length,
                locked: !pluginsUnlocked,
              },
            ];
            })().map((cat) => {
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
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{cat.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {cat.locked && (
                      <Lock className={`w-3.5 h-3.5 ${isActive ? 'text-black/70' : 'text-amber-400'}`} />
                    )}
                    {typeof cat.count === 'number' && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${isActive ? 'bg-black/25 text-black' : 'bg-white/10 text-zinc-400'}`}>
                        {cat.count}
                      </span>
                    )}
                  </div>
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
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${currentProfile.color} flex items-center justify-center text-white font-extrabold text-2xl shadow-xl ring-2 ring-white/20`}>
                      {currentProfile.initials}
                    </div>
                    <div>
                      {editingName ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={profileNameInput}
                            onChange={(e) => setProfileNameInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveProfileName();
                              if (e.key === 'Escape') setEditingName(false);
                            }}
                            autoFocus
                            className="px-3 py-1 bg-black/60 border border-sky-400 rounded-xl text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
                          />
                          <button
                            onClick={handleSaveProfileName}
                            className="px-3 py-1 bg-sky-500 text-black text-xs font-bold rounded-xl hover:bg-sky-400 transition-colors"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5">
                          <h3 className="font-display font-extrabold text-2xl text-white">
                            {currentProfile.name}
                          </h3>
                          <button
                            onClick={() => {
                              setProfileNameInput(currentProfile.name);
                              setEditingName(true);
                            }}
                            className="text-xs text-sky-400 hover:text-sky-300 underline font-medium cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-2.5 mt-1">
                        {pluginsUnlocked ? (
                          <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[11px] font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-sky-400" />
                            Nascent TV Plus · Premium Member
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-white/10 text-zinc-400 border border-white/15 text-[11px] font-semibold flex items-center gap-1">
                            <Shield className="w-3 h-3 text-zinc-500" />
                            Basic Member
                          </span>
                        )}
                        {currentProfile.isKid && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold">
                            Kids Filter Enabled
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Log Out */}
                  <div className="flex items-center gap-2 self-stretch md:self-center">
                    <button
                      type="button"
                      onClick={handleLogOut}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-rose-500/20 text-zinc-200 hover:text-rose-200 border border-white/15 hover:border-rose-500/40 text-xs font-semibold transition-all cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
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
                        { id: 'all', label: 'All Ratings' },
                        { id: 'mature', label: 'R / TV-MA' },
                        { id: 'pg13', label: 'PG-13 / TV-14' },
                        { id: 'family', label: 'G / PG' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setMaturityRating(item.id as any)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
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
                      { id: 'watchlists', label: 'Watchlist' },
                      { id: 'movies', label: 'Movies' },
                      { id: 'shows', label: 'TV Shows' },
                      { id: 'local-media', label: 'Libraries' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setDefaultStartupTab(tab.id as any)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
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

            {/* 2. PLUGINS TAB (last in nav — paywalled) */}
            {activeCategory === 'plugins' && (
              <div className="relative flex flex-col gap-5 animate-in fade-in duration-150 min-h-full">
                {!pluginsUnlocked ? (
                  <div className="relative flex-1 min-h-[420px] rounded-3xl overflow-hidden border border-pink-500/30 bg-[#121212]">
                    {/* Dimmed preview of plugins behind paywall */}
                    <div className="absolute inset-0 opacity-30 blur-[2px] pointer-events-none select-none p-6 overflow-hidden">
                      <div className="flex items-center gap-2 mb-4">
                        <Puzzle className="w-5 h-5 text-sky-400" />
                        <span className="font-display font-bold text-xl text-white">Plugins & Community Addons</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {pluginsList.slice(0, 4).map((plugin) => (
                          <div key={plugin.id} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                            <div className="font-bold text-sm text-white">{plugin.name}</div>
                            <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">{plugin.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
                    <div className="relative z-10 h-full min-h-[420px] flex flex-col items-center justify-center text-center px-8 py-12 gap-4">
                      <div
                        className="w-16 h-16 rounded-2xl border border-white/20 text-[#1b1b1b] flex items-center justify-center shadow-lg shadow-fuchsia-500/25"
                        style={{
                          backgroundImage:
                            'linear-gradient(135deg, var(--logo-magenta) 0%, var(--logo-purple) 28%, var(--logo-cyan) 55%, var(--logo-mint) 78%, var(--logo-gold) 100%)',
                        }}
                      >
                        <Lock className="w-7 h-7" />
                      </div>
                      <div className="max-w-md space-y-2">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-500/15 border border-pink-400/30 text-pink-200 text-[10px] font-bold uppercase tracking-wider">
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          VIP Pass Required
                        </div>
                        <h3 className="font-display font-bold text-2xl text-white">
                          Unlock Plugins & Community Addons
                        </h3>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                          Subscribe to access scrapers, subtitle sources, audio decoders, and cloud torrent resolvers.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsPluginPaywallOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 rounded-full text-[#1b1b1b] font-extrabold text-xs shadow-lg shadow-fuchsia-500/25 hover:opacity-95 transition-all cursor-pointer border border-[#1b1b1b]/30"
                        style={{
                          backgroundImage:
                            'linear-gradient(135deg, var(--logo-magenta) 0%, var(--logo-purple) 28%, var(--logo-cyan) 55%, var(--logo-mint) 78%, var(--logo-gold) 100%)',
                        }}
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>View VIP Pass Plans</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                {pluginFeedback && (
                  <div className="px-4 py-2.5 rounded-2xl bg-sky-950/70 border border-sky-400/40 text-sky-300 text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>{pluginFeedback}</span>
                  </div>
                )}

                {/* Plugins Header & Manifest URL installer */}
                <div className="flex flex-col gap-3 pb-1 border-b border-white/10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
                        <Puzzle className="w-5 h-5 text-sky-400" />
                        <span>Plugins & Community Addons</span>
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Extend scrapers, subtitle sources, audio decoders, and cloud torrent resolvers.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {onOpenPlugins && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenPlugins();
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                        >
                          <Puzzle className="w-3.5 h-3.5" />
                          <span>Add Addon</span>
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

                  <div className="flex items-center justify-between gap-4 px-3.5 py-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className="min-w-0">
                      <h5 className="text-xs font-semibold text-zinc-100">Activate Plugins</h5>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Show a plugins shortcut next to notifications in the top bar.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={pluginsActivated}
                      aria-label="Activate Plugins"
                      onClick={() => {
                        const next = !pluginsActivated;
                        onPluginsActivatedChange?.(next);
                        setPluginFeedback(
                          next
                            ? 'Plugins activated — shortcut added beside notifications.'
                            : 'Plugins deactivated — top bar shortcut hidden.'
                        );
                        setTimeout(() => setPluginFeedback(null), 2800);
                      }}
                      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400/60 ${
                        pluginsActivated ? 'bg-sky-500' : 'bg-zinc-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                          pluginsActivated ? 'right-0.5' : 'left-0.5'
                        }`}
                      />
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
                  {filteredPlugins.map((plugin) => (
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
                            <Puzzle className="w-5 h-5" />
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
                  ))}
                </div>
                  </>
                )}
              </div>
            )}

            {/* 3. Display & Sound */}
            {activeCategory === 'audio-video' && (
              <div className="flex flex-col gap-6">
                {/* Playback & Video Preferences */}
                <div>
                  <h3 className="font-display font-bold text-lg text-white mb-1">Playback & Video Preferences</h3>
                  <p className="text-xs text-zinc-400 mb-4">Frame rate matching, automation, and resume behavior.</p>

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

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3 justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-white">Resume Playback</h4>
                        <p className="text-xs text-zinc-400">Choose behavior when opening previously watched titles</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[
                          { id: 'always', label: 'Resume' },
                          { id: 'ask', label: 'Always Ask' },
                          { id: 'restart', label: 'Start Over' },
                        ].map((r) => (
                          <button
                            key={r.id}
                            onClick={() => setResumeBehavior(r.id as any)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                              resumeBehavior === r.id ? 'bg-sky-500 text-black' : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                            }`}
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10">
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

            {/* 4. Subtitles & Audio Languages */}
            {activeCategory === 'subtitles' && (
              <div className="flex flex-col gap-5">
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

            {/* 7. Devices & Drives (includes Bluetooth) */}
            {activeCategory === 'storage' && (
              <div className="flex flex-col gap-8">
                {/* Bluetooth Devices */}
                <div>
                  <h3 className="font-display font-bold text-lg text-white mb-1">Bluetooth Devices</h3>
                  <p className="text-xs text-zinc-400 mb-5">
                    Pair TV remotes, headphones, soundbars, gamepads, and other Bluetooth accessories for lean-back control.
                  </p>

                  <div className="p-6 rounded-3xl bg-gradient-to-br from-sky-950/40 via-zinc-900/60 to-black/80 border border-sky-500/20 mb-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shadow-lg">
                        <Bluetooth className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white mb-0.5">Add Bluetooth Device</h4>
                        <p className="text-xs text-zinc-400">
                          {btFeedback || 'Scan nearby to add TV remotes, audio devices, and accessories.'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleBluetoothScan}
                      disabled={btScanning}
                      className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-lg flex items-center gap-2 focus:ring-2 focus:ring-sky-400 focus:outline-none disabled:opacity-70 ${
                        btScanning
                          ? 'bg-sky-500/30 border border-sky-400/40 text-sky-200'
                          : 'bg-sky-500 hover:bg-sky-400 text-black shadow-sky-500/30'
                      }`}
                    >
                      <RefreshCw className={`w-4 h-4 ${btScanning ? 'animate-spin' : ''}`} />
                      <span>{btScanning ? 'Scanning…' : 'Scan for Devices'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 mb-4 flex-wrap">
                    {[
                      { id: 'all', label: 'All Devices' },
                      { id: 'remote', label: 'TV Remotes' },
                      { id: 'audio', label: 'Audio' },
                      { id: 'other', label: 'Other' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setBtFilter(f.id as typeof btFilter)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                          btFilter === f.id
                            ? 'bg-sky-500 text-black font-bold'
                            : 'bg-white/5 hover:bg-white/10 text-zinc-300'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2.5">
                    {btDevices
                      .filter((d) => btFilter === 'all' || d.kind === btFilter)
                      .map((device) => {
                        const KindIcon =
                          device.kind === 'remote' ? Tv : device.kind === 'audio' ? Headphones : Gamepad2;
                        const kindLabel =
                          device.kind === 'remote' ? 'TV Remote' : device.kind === 'audio' ? 'Audio' : 'Accessory';
                        return (
                          <div
                            key={device.id}
                            className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/25 text-sky-400 flex items-center justify-center shrink-0">
                                {device.status === 'connected' ? (
                                  <BluetoothConnected className="w-5 h-5" />
                                ) : (
                                  <KindIcon className="w-5 h-5" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-semibold text-white truncate">{device.name}</span>
                                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-white/10 text-zinc-400">
                                    {kindLabel}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold capitalize ${
                                      device.status === 'connected'
                                        ? 'bg-emerald-500/20 text-emerald-300'
                                        : device.status === 'paired'
                                          ? 'bg-sky-500/20 text-sky-300'
                                          : 'bg-white/10 text-zinc-400'
                                    }`}
                                  >
                                    {device.status}
                                  </span>
                                </div>
                                <p className="text-[11px] text-zinc-500 mt-0.5">{device.detail}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {device.status !== 'connected' ? (
                                <button
                                  type="button"
                                  onClick={() => handleBluetoothPair(device.id)}
                                  className="px-3.5 py-1.5 rounded-full bg-sky-500 hover:bg-sky-400 text-black text-xs font-bold transition-all flex items-center gap-1.5"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  {device.status === 'available' ? 'Pair & Add' : 'Connect'}
                                </button>
                              ) : (
                                <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5 px-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  In use
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleBluetoothRemove(device.id)}
                                className="p-2 rounded-full bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 border border-white/10 transition-all"
                                title="Forget device"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    {btDevices.filter((d) => btFilter === 'all' || d.kind === btFilter).length === 0 && (
                      <div className="p-5 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center text-xs text-zinc-500">
                        No devices in this category. Scan to discover remotes, audio gear, and accessories.
                      </div>
                    )}
                  </div>
                </div>

                {/* Storage, Drives & Cache */}
                <div className="pt-2 border-t border-white/10">
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
              </div>
            )}

            {/* Peers & Library Shares */}
            {activeCategory === 'peers' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="font-display font-bold text-lg text-white mb-1">Peers & Library Shares</h3>
                  <p className="text-xs text-zinc-400 mb-4">
                    Share your local library over P2P, discover LAN peers, and manage trusted library connections.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-white">LAN Peer Discovery</h4>
                        <p className="text-xs text-zinc-400">Broadcast presence on the local network</p>
                      </div>
                      <button
                        onClick={() => setPeerDiscovery(!peerDiscovery)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${peerDiscovery ? 'bg-sky-500' : 'bg-zinc-700'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${peerDiscovery ? 'right-0.5' : 'left-0.5'}`} />
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-white">Auto-Accept LAN Peers</h4>
                        <p className="text-xs text-zinc-400">Skip invite approval for same-subnet devices</p>
                      </div>
                      <button
                        onClick={() => setAutoAcceptLanPeers(!autoAcceptLanPeers)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${autoAcceptLanPeers ? 'bg-sky-500' : 'bg-zinc-700'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${autoAcceptLanPeers ? 'right-0.5' : 'left-0.5'}`} />
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2">
                      <span className="text-xs font-semibold text-zinc-400 uppercase">Shared Stream Quality</span>
                      <div className="flex items-center gap-2">
                        {[
                          { id: 'low', label: 'Low' },
                          { id: 'med', label: 'Med' },
                          { id: 'high', label: 'High' },
                        ].map((q) => (
                          <button
                            key={q.id}
                            onClick={() => setShareQuality(q.id as typeof shareQuality)}
                            className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
                              shareQuality === q.id ? 'bg-sky-500 text-black' : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                            }`}
                          >
                            {q.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Add Peer — 4th grid tile */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-pink-500/25 flex flex-col gap-2 justify-between">
                      {!isAddPeerOpen ? (
                        <div className="flex items-center justify-between gap-3 h-full">
                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                              <UserPlus className="w-4 h-4 text-pink-400 shrink-0" />
                              Add Peer
                            </h4>
                            <p className="text-xs text-zinc-400">Connect a friend by name and invite code</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsAddPeerOpen(true)}
                            className="px-3 py-1.5 rounded-full bg-pink-500 hover:bg-pink-400 text-white text-xs font-bold transition shrink-0 flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <span className="text-xs font-semibold text-zinc-400 uppercase">Add Peer</span>
                          <input
                            type="text"
                            value={addPeerName}
                            onChange={(e) => setAddPeerName(e.target.value)}
                            placeholder="Display name"
                            className="px-2.5 py-1.5 rounded-xl bg-black/30 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-400"
                          />
                          <input
                            type="text"
                            value={addPeerCode}
                            onChange={(e) => setAddPeerCode(e.target.value.toUpperCase())}
                            placeholder="PEER-XXXX-MESH"
                            className="px-2.5 py-1.5 rounded-xl bg-black/30 border border-white/10 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-pink-400"
                          />
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setIsAddPeerOpen(false);
                                setAddPeerName('');
                                setAddPeerCode('');
                                setAddPeerFeedback(null);
                              }}
                              className="flex-1 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (!addPeerName.trim() || !addPeerCode.trim()) return;
                                setAddPeerFeedback(`Connecting to ${addPeerName.trim()}…`);
                                setTimeout(() => {
                                  setAddPeerFeedback(`Peer “${addPeerName.trim()}” added.`);
                                  setAddPeerName('');
                                  setAddPeerCode('');
                                  setTimeout(() => {
                                    setAddPeerFeedback(null);
                                    setIsAddPeerOpen(false);
                                  }, 2000);
                                }, 700);
                              }}
                              className="flex-1 py-1.5 rounded-full bg-pink-500 hover:bg-pink-400 text-white text-xs font-bold transition"
                            >
                              Connect
                            </button>
                          </div>
                          {addPeerFeedback && (
                            <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 shrink-0" />
                              {addPeerFeedback}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-white">Your Invite Code</h4>
                      <p className="text-xs text-zinc-400 truncate">Friends enter this code to request your library share</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 font-mono text-sm text-sky-300 tracking-wider">
                      {inviteCode}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        const next = `NV-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
                        setInviteCode(next);
                      }}
                      className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition"
                    >
                      Rotate
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <h4 className="text-sm font-semibold text-white">Join a Peer Library</h4>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={peerJoinCode}
                      onChange={(e) => setPeerJoinCode(e.target.value.toUpperCase())}
                      placeholder="Enter peer invite code"
                      className="flex-1 px-3 py-2.5 rounded-xl bg-black/30 border border-white/10 text-sm text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!peerJoinCode.trim()) return;
                        const code = peerJoinCode.trim();
                        setPeerRequests((prev) => [
                          {
                            id: `req-out-${Date.now()}`,
                            name: code,
                            handle: code,
                            initials: code.slice(0, 2),
                            color: 'bg-gradient-to-tr from-sky-500 to-indigo-600',
                            direction: 'outgoing',
                            library: `Pending access for invite ${code}`,
                            sentAt: 'Just now',
                          },
                          ...prev,
                        ]);
                        setPeerJoinFeedback(`Request sent for ${code}. Waiting for peer approval…`);
                        setPeerJoinCode('');
                        setTimeout(() => setPeerJoinFeedback(null), 4000);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black text-xs font-bold transition shrink-0"
                    >
                      Request Access
                    </button>
                  </div>
                  {peerJoinFeedback && (
                    <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {peerJoinFeedback}
                    </p>
                  )}
                </div>

                {/* Pending Requests */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-sm font-semibold text-white">Pending Requests</h4>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      {peerRequests.filter((r) => r.direction === 'incoming').length} incoming ·{' '}
                      {peerRequests.filter((r) => r.direction === 'outgoing').length} outgoing
                    </span>
                  </div>

                  {peerRequests.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-white/5 border border-dashed border-white/10 text-xs text-zinc-500 text-center">
                      No pending peer requests
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      {peerRequests.map((req) => (
                        <div
                          key={req.id}
                          className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-xl ${req.color} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow`}>
                              {req.initials}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="text-sm font-semibold text-white truncate">{req.name}</h5>
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                    req.direction === 'incoming'
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                      : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                  }`}
                                >
                                  {req.direction === 'incoming' ? 'Incoming' : 'Outgoing'}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-400 truncate">
                                {req.handle} · {req.library} · {req.sentAt}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            {req.direction === 'incoming' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setPeerRequests((prev) => prev.filter((r) => r.id !== req.id))}
                                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-rose-500/20 text-zinc-300 hover:text-rose-300 text-[11px] font-semibold transition"
                                >
                                  Decline
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPeerRequests((prev) => prev.filter((r) => r.id !== req.id))}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-[11px] font-bold transition flex items-center gap-1"
                                >
                                  <Check className="w-3 h-3" />
                                  Accept
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setPeerRequests((prev) => prev.filter((r) => r.id !== req.id))}
                                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-300 text-[11px] font-semibold transition"
                              >
                                Cancel Request
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3 gap-3">
                    <h4 className="text-sm font-semibold text-white">Connected Library Shares</h4>
                    <span className="text-[11px] text-zinc-400 font-mono shrink-0">
                      {SHARED_PEER_LIBRARIES.filter((p) => p.status !== 'offline').length} online
                    </span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {SHARED_PEER_LIBRARIES.map((peer) => (
                      <div
                        key={peer.id}
                        className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl ${peer.avatarColor} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow`}>
                            {peer.avatarInitials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h5 className="text-sm font-semibold text-white truncate">{peer.name}</h5>
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  peer.status === 'offline' ? 'bg-zinc-500' : peer.status === 'streaming' ? 'bg-amber-400' : 'bg-emerald-400'
                                }`}
                              />
                            </div>
                            <p className="text-[11px] text-zinc-400 truncate">
                              {peer.owner} · {peer.itemCount} titles · {peer.pingMs}ms · {peer.bandwidth}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {peer.status === 'offline' ? (
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white/5 text-zinc-400 flex items-center gap-1">
                              <WifiOff className="w-3 h-3" /> Offline
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 capitalize">
                              {peer.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 8. Server & LAN (includes Nascent Streaming Engine) */}
            {activeCategory === 'network' && (
              <div className="flex flex-col gap-8">
                {/* Nascent Streaming Engine */}
                <div>
                  <h3 className="font-display font-bold text-lg text-white mb-1">Nascent Streaming Engine</h3>
                  <p className="text-xs text-zinc-400 mb-4">Hardware decoding, adaptive bitrate policies, and buffer cache.</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2">
                      <span className="text-xs font-semibold text-zinc-400 uppercase">Hardware Acceleration</span>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">GPU Video Decoder (HEVC/AV1)</span>
                        <button
                          onClick={() => setHardwareAccel(!hardwareAccel)}
                          className={`w-12 h-6 rounded-full transition-colors relative ${hardwareAccel ? 'bg-sky-500' : 'bg-zinc-700'}`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${hardwareAccel ? 'right-0.5' : 'left-0.5'}`} />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2">
                      <span className="text-xs font-semibold text-zinc-400 uppercase">Buffer Cache Size</span>
                      <div className="flex items-center gap-2">
                        {['256MB', '512MB', '1GB'].map((b) => (
                          <button
                            key={b}
                            onClick={() => setBufferSize(b)}
                            className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
                              bufferSize === b
                                ? 'bg-sky-500 text-black'
                                : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                            }`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2">
                      <span className="text-xs font-semibold text-zinc-400 uppercase">Max Stream Resolution</span>
                      <div className="flex items-center gap-2">
                        {[
                          { id: '4k', label: '4K Ultra HD' },
                          { id: '1080p', label: '1080p FHD' },
                          { id: 'auto', label: 'Auto ABR' },
                        ].map((res) => (
                          <button
                            key={res.id}
                            onClick={() => setMaxResolution(res.id as any)}
                            className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
                              maxResolution === res.id ? 'bg-sky-500 text-black' : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                            }`}
                          >
                            {res.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-400/30 flex flex-col gap-3 justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">Full Telemetry HUD</h4>
                        <p className="text-xs text-sky-300">Live bitrate graphs, dropping frame monitoring, and peer mesh</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenStreamingHUD();
                        }}
                        className="self-start px-4 py-2 rounded-full bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs shadow-lg transition-all"
                      >
                        Open Telemetry HUD
                      </button>
                    </div>
                  </div>
                </div>

                {/* Local Server & Network Diagnostics */}
                <div className="pt-2 border-t border-white/10">
                  <h3 className="font-display font-bold text-lg text-white mb-1">Local Server & Network Diagnostics</h3>
                  <p className="text-xs text-zinc-400 mb-4">Port configuration, DLNA broadcast, and LAN peer synchronization.</p>

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
                      <span className="font-bold text-emerald-400">Online · Port 3000 Active</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-zinc-300">
                      <span>LAN Address</span>
                      <span className="font-mono text-zinc-200">192.168.1.104:3000</span>
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

          </div>
        </div>
      </div>

      <TvAddonPaywallModal
        isOpen={isPluginPaywallOpen && activeCategory === 'plugins' && !pluginsUnlocked}
        onClose={() => {
          setIsPluginPaywallOpen(false);
          if (!addonPaywall.isUnlocked()) {
            setActiveCategory('profile');
          }
        }}
        onUnlockedSuccess={() => {
          setPluginsUnlocked(true);
          setIsPluginPaywallOpen(false);
          try {
            localStorage.setItem('nascent-plugins-unlocked', '1');
          } catch {
            /* ignore */
          }
          setPluginFeedback('VIP Pass unlocked — Plugins & Community Addons are now available.');
          setTimeout(() => setPluginFeedback(null), 3200);
        }}
        targetAddonName="Plugins & Community Addons"
      />
    </div>
  );
};
