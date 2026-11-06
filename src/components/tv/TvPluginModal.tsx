import React, { useState, useEffect } from 'react';
import { 
  Puzzle, 
  X, 
  Check, 
  Download, 
  Trash2, 
  Plus, 
  RefreshCw, 
  Layers, 
  Sliders, 
  Cpu, 
  Sparkles, 
  Search,
  Globe,
  Lock,
  Link2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { globalPluginEngine } from '../../lib/plugins/pluginEngine';
import { POPULAR_COMMUNITY_DIRECTORY } from '../../lib/plugins/defaultPlugins';
import { InstalledAddon } from '../../lib/plugins/types';
import { addonPaywall } from '../../lib/plugins/addonPaywall';
import { TvAddonPaywallModal } from './TvAddonPaywallModal';

interface TvPluginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'installed' | 'directory' | 'add-url';

export const TvPluginModal: React.FC<TvPluginModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('installed');
  const [addons, setAddons] = useState<InstalledAddon[]>([]);
  const [directorySearch, setDirectorySearch] = useState('');
  const [directoryCategory, setDirectoryCategory] = useState<string>('all');
  
  // Community Addons Paywall State
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [paywallTargetAddon, setPaywallTargetAddon] = useState<string | undefined>(undefined);
  const [isCommunityUnlocked, setIsCommunityUnlocked] = useState<boolean>(() => addonPaywall.isUnlocked());

  // Custom Install State
  const [isInstalling, setIsInstalling] = useState(false);
  const [installUrl, setInstallUrl] = useState('');
  const [installError, setInstallError] = useState<string | null>(null);
  const [installSuccess, setInstallSuccess] = useState<string | null>(null);
  
  // Settings Editor State
  const [configuringAddon, setConfiguringAddon] = useState<InstalledAddon | null>(null);
  const [tempSettings, setTempSettings] = useState<Record<string, any>>({});

  // Sync with AddonPaywall
  useEffect(() => {
    setIsCommunityUnlocked(addonPaywall.isUnlocked());
    const unsub = addonPaywall.subscribe((unlocked) => {
      setIsCommunityUnlocked(unlocked);
    });
    return () => unsub();
  }, []);

  // Sync with PluginEngine
  useEffect(() => {
    const update = () => {
      setAddons(globalPluginEngine.getInstalledAddons());
    };
    update();
    const unsubscribe = globalPluginEngine.subscribe(update);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (configuringAddon) {
          setConfiguringAddon(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, configuringAddon]);

  if (!isOpen) return null;

  const handleToggle = (id: string) => {
    globalPluginEngine.toggleAddon(id);
  };

  const handleUninstall = (id: string) => {
    globalPluginEngine.uninstallAddon(id);
  };

  const handleInstallFromUrl = async (urlToInstall?: string, addonName?: string) => {
    const targetUrl = (urlToInstall ?? installUrl).trim();
    if (!targetUrl) return;

    // Check Paywall status
    if (!isCommunityUnlocked) {
      setPaywallTargetAddon(addonName || (urlToInstall ? 'Community Addon' : 'Custom Manifest URL'));
      setIsPaywallOpen(true);
      return;
    }

    setIsInstalling(true);
    setInstallError(null);
    setInstallSuccess(null);

    try {
      const installed = await globalPluginEngine.installFromUrl(targetUrl);
      setInstallSuccess(`Installed "${installed.manifest.name}" (v${installed.manifest.version})`);
      setInstallUrl('');
      setTimeout(() => {
        setActiveTab('installed');
        setInstallSuccess(null);
      }, 1000);
    } catch (err: any) {
      setInstallError(err.message || 'Failed to install addon');
    } finally {
      setIsInstalling(false);
    }
  };

  const handleOpenConfigure = (addon: InstalledAddon) => {
    setConfiguringAddon(addon);
    setTempSettings({ ...(addon.userSettings || {}) });
  };

  const handleSaveSettings = () => {
    if (configuringAddon) {
      globalPluginEngine.updateAddonSettings(configuringAddon.manifest.id, tempSettings);
      setConfiguringAddon(null);
    }
  };

  const filteredDirectory = POPULAR_COMMUNITY_DIRECTORY.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(directorySearch.toLowerCase()) || 
                          item.description.toLowerCase().includes(directorySearch.toLowerCase());
    const matchesCat = directoryCategory === 'all' || item.category === directoryCategory;
    return matchesSearch && matchesCat;
  });

  const installedIds = new Set(addons.map(a => a.manifest.id));
  const activeCount = addons.filter(a => a.enabled).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[#131313]/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[88vh] bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#141414]">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl border border-[#1b1b1b]/40 text-[#1b1b1b] shadow-lg shadow-fuchsia-500/25"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, var(--logo-magenta) 0%, var(--logo-purple) 28%, var(--logo-cyan) 55%, var(--logo-mint) 78%, var(--logo-gold) 100%)',
              }}
            >
              <Puzzle className="w-6 h-6 drop-shadow-sm" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">Community Plugins & Addons</h2>
              </div>
              <p className="text-xs text-white/50">
                {addons.length} Installed • {activeCount} Active • Modular media formats, stream scrapers, and player hooks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCommunityUnlocked ? (
              <button
                onClick={() => {
                  setPaywallTargetAddon(undefined);
                  setIsPaywallOpen(true);
                }}
                className="px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-sky-400/20 via-pink-400/20 to-amber-400/20 text-pink-300 border border-pink-400/40 flex items-center gap-1.5 shadow-sm hover:opacity-90 cursor-pointer"
                title="Manage VIP Subscription Pass"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>VIP Active</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setPaywallTargetAddon(undefined);
                  setIsPaywallOpen(true);
                }}
                className="px-3 py-1 rounded-full text-xs font-bold text-[#1b1b1b] shadow-md shadow-fuchsia-500/25 hover:opacity-95 flex items-center gap-1.5 cursor-pointer border border-[#1b1b1b]/30"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, var(--logo-magenta) 0%, var(--logo-purple) 28%, var(--logo-cyan) 55%, var(--logo-mint) 78%, var(--logo-gold) 100%)',
                }}
              >
                <Lock className="w-3.5 h-3.5 text-[#1b1b1b] drop-shadow-sm" />
                <span>Get VIP Pass</span>
              </button>
            )}

            <button
              onClick={() => globalPluginEngine.resetToDefaults()}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition flex items-center gap-1.5"
              title="Reset to default official addons"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-white/10 bg-[#161616] overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('installed')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              activeTab === 'installed'
                ? 'border-indigo-500 text-white font-semibold'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            Installed Addons
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/10 text-white/80">
              {addons.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              activeTab === 'directory'
                ? 'border-indigo-500 text-white font-semibold'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            Community Directory
            {isCommunityUnlocked ? (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-pink-500/20 text-pink-300 border border-pink-500/30 flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5 text-amber-300" /> VIP
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                <Lock className="w-2.5 h-2.5" /> VIP
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('add-url')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              activeTab === 'add-url'
                ? 'border-indigo-500 text-white font-semibold'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <Link2 className="w-4 h-4" />
            Add by Addon URL
            {!isCommunityUnlocked && (
              <Lock className="w-3 h-3 text-amber-400" />
            )}
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#161616]/50">
          
          {/* TAB 1: INSTALLED ADDONS */}
          {activeTab === 'installed' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2">
                <p className="text-sm text-white/60">
                  Manage active resources, custom decoders, and stream scrapers.
                </p>
                <button
                  onClick={() => setActiveTab('directory')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Browse Directory
                </button>
              </div>

              {addons.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
                  <Puzzle className="w-10 h-10 text-white/20 mx-auto mb-3" />
                  <p className="text-white/60 font-medium">No addons currently installed</p>
                  <button
                    onClick={() => globalPluginEngine.resetToDefaults()}
                    className="mt-3 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                  >
                    Restore Default Addons
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {addons.map((addon) => {
                    const isConfigurable = addon.manifest.configurable?.settings?.length;

                    return (
                      <div
                        key={addon.manifest.id}
                        className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all hover:border-white/30 hover:shadow-lg hover:shadow-black/40 hover:-translate-y-0.5 ${
                          addon.enabled
                            ? 'bg-[#1f1f1f] border-white/15'
                            : 'bg-[#181818] border-white/5 opacity-70'
                        }`}
                      >
                        {/* Photo-forward hero */}
                        <div className="relative aspect-square w-full bg-zinc-900 overflow-hidden">
                          {addon.manifest.icon ? (
                            <img
                              src={addon.manifest.icon}
                              alt={addon.manifest.name}
                              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-600/40 via-purple-700/30 to-zinc-900 text-indigo-300">
                              <Puzzle className="w-16 h-16 opacity-80" />
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

                          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {isConfigurable && (
                              <button
                                onClick={() => handleOpenConfigure(addon)}
                                className="p-1.5 rounded-lg bg-black/55 text-white/80 hover:text-white hover:bg-black/75 backdrop-blur-sm transition"
                                title="Configure"
                              >
                                <Sliders className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleUninstall(addon.manifest.id)}
                              className="p-1.5 rounded-lg bg-black/55 text-white/70 hover:text-rose-300 hover:bg-rose-500/30 backdrop-blur-sm transition"
                              title="Uninstall Addon"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="absolute top-2 left-2 flex flex-wrap gap-1 max-w-[70%]">
                            {addon.isBuiltIn && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider bg-sky-500/90 text-black">
                                Official
                              </span>
                            )}
                            {addon.manifest.formatDecoder && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider bg-amber-400/90 text-black flex items-center gap-0.5">
                                <Cpu className="w-2.5 h-2.5" />
                                Decoder
                              </span>
                            )}
                            {addon.manifest.playbackEnhancer && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider bg-purple-400/90 text-black flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5" />
                                Enhancer
                              </span>
                            )}
                          </div>

                          <div className="absolute inset-x-0 bottom-0 p-3 pt-8">
                            <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 drop-shadow-md">
                              {addon.manifest.name}
                            </h3>
                            <span className="mt-1 inline-block text-[10px] font-mono text-white/55">
                              v{addon.manifest.version}
                            </span>
                          </div>
                        </div>

                        <div className="p-2.5">
                          {addon.enabled ? (
                            <button
                              onClick={() => {
                                if (isConfigurable) handleOpenConfigure(addon);
                              }}
                              className="w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition bg-indigo-600 hover:bg-indigo-500 text-white"
                            >
                              Open App
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggle(addon.manifest.id)}
                              className="w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition bg-white/10 text-white/60 hover:text-white hover:bg-white/15"
                            >
                              Disabled
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: COMMUNITY DIRECTORY */}
          {activeTab === 'directory' && (
            <div className="space-y-4">
              {/* COMMUNITY ADDONS PAYWALL BANNER */}
              {!isCommunityUnlocked && (
                <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#170e28] via-[#241028] to-[#12162a] border border-pink-500/35 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-200">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 via-pink-500 to-amber-300 p-0.5 shrink-0 shadow-lg shadow-pink-500/20">
                      <div className="w-full h-full bg-[#13141f] rounded-[10px] flex items-center justify-center text-pink-300">
                        <Sparkles className="w-5 h-5 text-amber-300" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-sm sm:text-base font-display">
                          Community Addons VIP Pass Required
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-pink-500/20 text-pink-300 border border-pink-500/35 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> VIP Pass
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 mt-0.5 max-w-xl">
                        Install community stream scrapers (Torrentio, CyberFlix, Orion), unlock 4K HDR streams, and connect Debrid accounts with the Community Addons Pass.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setPaywallTargetAddon(undefined);
                      setIsPaywallOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl text-[#1b1b1b] font-extrabold text-xs shadow-lg shadow-fuchsia-500/25 hover:opacity-95 flex items-center gap-1.5 shrink-0 cursor-pointer border border-[#1b1b1b]/30"
                    style={{
                      backgroundImage:
                        'linear-gradient(135deg, var(--logo-magenta) 0%, var(--logo-purple) 28%, var(--logo-cyan) 55%, var(--logo-mint) 78%, var(--logo-gold) 100%)',
                    }}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#1b1b1b] drop-shadow-sm" />
                    <span>Unlock VIP Pass ($4.99/mo)</span>
                  </button>
                </div>
              )}

              {/* FILTER BAR */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={directorySearch}
                    onChange={(e) => setDirectorySearch(e.target.value)}
                    placeholder="Search community addons..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/40 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto scrollbar-none">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'official', label: 'Official' },
                    { id: 'streams', label: 'Streams' },
                    { id: 'codecs', label: 'Decoders & Codecs' },
                    { id: 'subtitles', label: 'Subtitles' },
                    { id: 'catalogs', label: 'Catalogs' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setDirectoryCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        directoryCategory === cat.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white/5 text-white/60 hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* DIRECTORY GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {filteredDirectory.map((item) => {
                  const isInstalled = installedIds.has(item.id);
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-[#1f1f1f] border border-white/10 hover:border-white/20 transition flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={item.icon}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover bg-black/40 border border-white/10 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold text-white text-sm truncate">{item.name}</h3>
                            <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1 flex-shrink-0">
                              ★ {item.rating}
                            </span>
                          </div>
                          <p className="text-xs text-white/40">By {item.author} • {item.installCount} users</p>
                          <p className="text-xs text-white/70 mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <div className="flex items-center gap-1">
                          {item.resources.slice(0, 3).map((r, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded text-[9px] bg-white/5 font-mono text-white/60">
                              {r}
                            </span>
                          ))}
                        </div>

                        {isInstalled ? (
                          <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            Installed
                          </span>
                        ) : isCommunityUnlocked ? (
                          <button
                            onClick={() => handleInstallFromUrl(item.manifestUrl, item.name)}
                            disabled={isInstalling}
                            className="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition shadow cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Install Addon
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setPaywallTargetAddon(item.name);
                              setIsPaywallOpen(true);
                            }}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-pink-500/25 to-amber-500/25 hover:from-pink-500/35 hover:to-amber-500/35 text-pink-200 border border-pink-500/40 flex items-center gap-1.5 transition shadow cursor-pointer"
                          >
                            <Lock className="w-3.5 h-3.5 text-amber-300" />
                            Unlock to Install
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ADD BY ADDON URL */}
          {activeTab === 'add-url' && (
            <div className="max-w-2xl mx-auto py-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Add by Addon URL</h3>
                <p className="text-xs text-white/60 mt-1">
                  Paste a manifest URL to install a community addon. Supports <code className="text-indigo-400 font-mono">https://</code> and <code className="text-indigo-400 font-mono">stremio://</code> links.
                </p>
              </div>

              {!isCommunityUnlocked && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-pink-500/15 to-purple-500/15 border border-pink-500/35 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-pink-500/20 text-pink-300 border border-pink-500/30">
                      <Lock className="w-4 h-4 text-amber-300" />
                    </div>
                    <div>
                      <p className="font-bold text-white">VIP Pass required for custom URLs</p>
                      <p className="text-zinc-300 text-[11px]">Unlock to install any third-party addon manifest.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setPaywallTargetAddon('Custom Manifest URL');
                      setIsPaywallOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-[#1b1b1b] font-extrabold text-xs shadow shrink-0 cursor-pointer border border-[#1b1b1b]/30"
                    style={{
                      backgroundImage:
                        'linear-gradient(135deg, var(--logo-magenta) 0%, var(--logo-purple) 28%, var(--logo-cyan) 55%, var(--logo-mint) 78%, var(--logo-gold) 100%)',
                    }}
                  >
                    Unlock VIP Pass
                  </button>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-xs font-medium text-white/80">Addon Manifest URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={installUrl}
                    onChange={(e) => setInstallUrl(e.target.value)}
                    placeholder="https://example.com/manifest.json"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  {isCommunityUnlocked ? (
                    <button
                      onClick={() => handleInstallFromUrl()}
                      disabled={isInstalling || !installUrl.trim()}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold flex items-center gap-2 transition shrink-0"
                    >
                      {isInstalling ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      Install
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setPaywallTargetAddon('Custom Manifest URL');
                        setIsPaywallOpen(true);
                      }}
                      className="px-5 py-2.5 rounded-xl text-[#1b1b1b] text-sm font-bold flex items-center gap-2 transition shadow-md hover:opacity-95 cursor-pointer shrink-0 border border-[#1b1b1b]/30"
                      style={{
                        backgroundImage:
                          'linear-gradient(135deg, var(--logo-magenta) 0%, var(--logo-purple) 28%, var(--logo-cyan) 55%, var(--logo-mint) 78%, var(--logo-gold) 100%)',
                      }}
                    >
                      <Lock className="w-4 h-4" />
                      Unlock VIP
                    </button>
                  )}
                </div>
              </div>

              {installError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Installation failed:</span> {installError}
                  </div>
                </div>
              )}

              {installSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Success!</span> {installSuccess}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ADDON SETTINGS MODAL DIALOG */}
        {configuringAddon && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-lg bg-[#1e1e1e] border border-white/15 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-white text-base">Configure {configuringAddon.manifest.name}</h3>
                </div>
                <button
                  onClick={() => setConfiguringAddon(null)}
                  className="p-1 rounded-lg text-white/60 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {configuringAddon.manifest.configurable?.settings?.map((setting) => (
                  <div key={setting.key} className="space-y-1">
                    <label className="text-xs font-semibold text-white/80 block">
                      {setting.label}
                    </label>
                    {setting.description && (
                      <p className="text-[11px] text-white/50">{setting.description}</p>
                    )}

                    {setting.type === 'string' && (
                      <input
                        type="text"
                        value={tempSettings[setting.key] ?? setting.default ?? ''}
                        onChange={(e) => setTempSettings({ ...tempSettings, [setting.key]: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    )}

                    {setting.type === 'password' && (
                      <input
                        type="password"
                        value={tempSettings[setting.key] ?? setting.default ?? ''}
                        onChange={(e) => setTempSettings({ ...tempSettings, [setting.key]: e.target.value })}
                        placeholder="••••••••••••••••"
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    )}

                    {setting.type === 'boolean' && (
                      <label className="flex items-center gap-2 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={tempSettings[setting.key] ?? setting.default ?? false}
                          onChange={(e) => setTempSettings({ ...tempSettings, [setting.key]: e.target.checked })}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-white/10 border-white/20"
                        />
                        <span className="text-xs text-white/80">Enabled</span>
                      </label>
                    )}

                    {setting.type === 'select' && setting.options && (
                      <select
                        value={tempSettings[setting.key] ?? setting.default ?? ''}
                        onChange={(e) => setTempSettings({ ...tempSettings, [setting.key]: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        {setting.options.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-[#1f1f1f]">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  onClick={() => setConfiguringAddon(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Community Addons Paywall Modal */}
        <TvAddonPaywallModal
          isOpen={isPaywallOpen}
          onClose={() => {
            setIsPaywallOpen(false);
            setPaywallTargetAddon(undefined);
          }}
          targetAddonName={paywallTargetAddon}
          onUnlockedSuccess={() => {
            setIsCommunityUnlocked(true);
          }}
        />

      </div>
    </div>
  );
};
