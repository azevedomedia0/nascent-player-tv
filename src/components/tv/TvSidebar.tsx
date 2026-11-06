import React, { useState, useRef } from 'react';
import { 
  Film, 
  Clapperboard, 
  Bookmark, 
  HardDrive, 
  Users, 
  Share2, 
  Wifi, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Folder, 
  FolderPlus,
  Upload,
  CheckCircle2, 
  Radio, 
  ArrowRight,
  ShieldCheck,
  Usb,
  Network,
  Server,
  X,
  Puzzle,
  Sparkles,
  Lock
} from 'lucide-react';
import { TvTab } from './TvTopNav';
import { AppLogo } from '../AppLogo';

export interface LocalFolderSource {
  id: string;
  name: string;
  path: string;
  fileCount: number;
  type: string;
  addedAt: string;
}

export interface SharedPeerSummary {
  id: string;
  name: string;
  owner: string;
  avatarInitials: string;
  avatarColor: string;
  itemCount: number;
  status: 'online' | 'streaming' | 'offline';
  pingMs: number;
  bandwidth: string;
}

interface TvSidebarProps {
  activeTab: TvTab;
  onTabChange: (tab: TvTab) => void;
  selectedPeerId: string | null;
  onSelectPeer: (peerId: string | null) => void;
  peers: SharedPeerSummary[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenConnectModal: () => void;
  onOpenPlugins?: () => void;
  localFilesCount?: number;
  onAddFolderSource?: (folder: LocalFolderSource) => void;
}

export const TvSidebar: React.FC<TvSidebarProps> = ({
  activeTab,
  onTabChange,
  selectedPeerId,
  onSelectPeer,
  peers,
  isCollapsed,
  onToggleCollapse,
  onOpenConnectModal,
  onOpenPlugins,
  localFilesCount: _localFilesCount = 3,
  onAddFolderSource,
}) => {
  const isLocalActive = activeTab === 'local-media' || activeTab === 'library';
  const isSharedActive = activeTab === 'shared-libraries';

  const [activeSourceId, setActiveSourceId] = useState<string | null>(null);
  const [isAddShareOpen, setIsAddShareOpen] = useState(false);
  const [newShareName, setNewShareName] = useState('');
  const [newShareProtocol, setNewShareProtocol] = useState<'SMB' | 'NFS' | 'DLNA' | 'WebDAV'>('SMB');
  const [newShareAddress, setNewShareAddress] = useState('');
  const [newShareUser, setNewShareUser] = useState('');

  // Local System Folders as media sources
  const [importedFolders, setImportedFolders] = useState<LocalFolderSource[]>([
    {
      id: 'f-1',
      name: '4K Masters & Remuxes',
      path: '/mnt/nvme0n1/media/movies',
      fileCount: 3,
      type: 'Movies',
      addedAt: 'Internal NVMe',
    },
    {
      id: 'f-2',
      name: 'Cinema Library',
      path: '/Volumes/Media/Cinema',
      fileCount: 12,
      type: 'Movies & TV',
      addedAt: 'Direct Storage',
    },
  ]);
  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false);
  const [folderPathInput, setFolderPathInput] = useState('');
  const [folderNameInput, setFolderNameInput] = useState('');
  const [folderTypeInput, setFolderTypeInput] = useState('Movies');
  const [folderSuccessMessage, setFolderSuccessMessage] = useState<string | null>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFileSystemFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const relativePath = files[0].webkitRelativePath || '';
      const folderName = relativePath.split('/')[0] || 'Imported System Folder';
      const count = files.length;
      
      const newFolder: LocalFolderSource = {
        id: `folder-${Date.now()}`,
        name: folderName,
        path: `/local/${folderName.toLowerCase().replace(/\s+/g, '_')}`,
        fileCount: count,
        type: folderTypeInput,
        addedAt: 'Local System',
      };
      
      setImportedFolders((prev) => [...prev, newFolder]);
      if (onAddFolderSource) {
        onAddFolderSource(newFolder);
      }
      setFolderSuccessMessage(`Imported "${folderName}" with ${count} media file(s)!`);
      setTimeout(() => {
        setFolderSuccessMessage(null);
        setIsAddFolderOpen(false);
      }, 1200);
      onTabChange('local-media');
    }
  };

  const handleAddFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderPathInput.trim()) return;
    const name = folderNameInput.trim() || folderPathInput.split('/').filter(Boolean).pop() || 'Local Media Folder';
    const newFolder: LocalFolderSource = {
      id: `folder-${Date.now()}`,
      name,
      path: folderPathInput.trim(),
      fileCount: Math.floor(Math.random() * 8) + 4,
      type: folderTypeInput,
      addedAt: 'Direct Mount',
    };
    setImportedFolders((prev) => [...prev, newFolder]);
    if (onAddFolderSource) {
      onAddFolderSource(newFolder);
    }
    setFolderSuccessMessage(`Imported folder "${name}" as media source!`);
    setTimeout(() => {
      setFolderSuccessMessage(null);
      setIsAddFolderOpen(false);
      setFolderPathInput('');
      setFolderNameInput('');
    }, 1000);
    onTabChange('local-media');
  };

  const [removableDevices, setRemovableDevices] = useState([
    {
      id: 'usb-sandisk',
      name: 'SanDisk Ultra USB 3.0',
      mountPoint: '/mnt/media_rw/USB1_SANDISK',
      freeSpace: '42.8 GB free',
      totalSpace: '128 GB',
      itemCount: 3,
      status: 'mounted' as const,
    },
    {
      id: 'ssd-samsung',
      name: 'Samsung T7 Shield SSD',
      mountPoint: '/storage/usbotg_samsung',
      freeSpace: '640 GB free',
      totalSpace: '1 TB',
      itemCount: 8,
      status: 'mounted' as const,
    },
  ]);

  const [networkShares, setNetworkShares] = useState([
    {
      id: 'smb-truenas',
      name: 'TrueNAS Core (SMB)',
      protocol: 'SMB 3.0',
      address: 'smb://192.168.1.120/movies',
      itemCount: 14,
      status: 'connected' as const,
      ping: '3ms',
    },
    {
      id: 'nfs-synology',
      name: 'Synology Media (NFS)',
      protocol: 'NFS v4',
      address: 'nfs://synology.lan/video',
      itemCount: 9,
      status: 'connected' as const,
      ping: '2ms',
    },
  ]);

  const handleAddNetworkShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShareAddress.trim()) return;
    const name = newShareName.trim() || `${newShareProtocol} Share (${newShareAddress.split('/').filter(Boolean).pop() || 'media'})`;
    const newShare = {
      id: `share-${Date.now()}`,
      name,
      protocol: newShareProtocol,
      address: newShareAddress.trim(),
      itemCount: Math.floor(Math.random() * 12) + 4,
      status: 'connected' as const,
      ping: `${Math.floor(Math.random() * 4) + 1}ms`,
    };
    setNetworkShares((prev) => [...prev, newShare]);
    setActiveSourceId(newShare.id);
    onTabChange('local-media');
    setIsAddShareOpen(false);
    setNewShareName('');
    setNewShareAddress('');
    setNewShareUser('');
  };

  // D-Pad and Keyboard navigation within the Navigation Menu for Android TV & KDE Plasma Bigscreen
  const handleSidebarKeyDown = (e: React.KeyboardEvent) => {
    // Only handle D-pad and navigation keys
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const focusable = Array.from(
        document.querySelectorAll<HTMLElement>('aside button:not([disabled]), aside [tabindex="0"]')
      );
      if (focusable.length === 0) return;
      const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
      let nextIndex = 0;
      if (e.key === 'ArrowDown') {
        nextIndex = currentIndex < focusable.length - 1 ? currentIndex + 1 : 0;
      } else {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : focusable.length - 1;
      }
      focusable[nextIndex]?.focus();
    } else if (e.key === 'ArrowRight') {
      // Exit Navigation Menu to main content area
      e.preventDefault();
      const mainFocusable = document.querySelector<HTMLElement>('main button:not([disabled]), main [tabindex="0"], main .cursor-pointer');
      mainFocusable?.focus();
    } else if (e.key === 'Escape' || e.key === 'Backspace' || e.key === 'BrowserBack') {
      e.preventDefault();
      if (!isCollapsed) {
        onToggleCollapse();
      }
    }
  };

  return (
    <>
    <aside 
      onKeyDown={handleSidebarKeyDown}
      className={`relative z-30 flex-shrink-0 transition-all duration-300 ease-in-out select-none border-r border-white/10 bg-transparent backdrop-blur-md flex flex-col ${
        isCollapsed ? 'w-20 items-center' : 'w-72 lg:w-80'
      }`}
      aria-label="Media Sources Sidebar"
    >
      {/* Top Header & Navigation */}
      <div className={`flex-1 w-full flex flex-col transition-all ${
        isCollapsed ? 'items-center justify-center py-6 px-0 gap-4 overflow-hidden' : 'p-4 gap-6 overflow-y-auto no-scrollbar'
      }`}>
        {/* Brand + collapse control */}
        <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center w-full px-0' : 'justify-between px-1'}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                <AppLogo className="w-full h-full" showBackground={false} />
              </div>
              <span className="font-display font-extrabold text-lg tracking-wide text-white truncate">
                Nascent Player{' '}
                <span className="text-zinc-300 text-[10px] font-semibold tracking-widest px-1.5 py-0.5 rounded-full bg-transparent border border-white/20 ml-1">
                  TV
                </span>
              </span>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className={`flex items-center justify-center shrink-0 ${
              isCollapsed ? 'w-10 h-10 rounded-xl mx-auto' : 'w-8 h-8 rounded-full'
            } bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white border border-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer`}
            title={isCollapsed ? "Expand sidebar (M)" : "Collapse sidebar (M)"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Primary Source Navigation */}
        <div className={`flex flex-col ${isCollapsed ? 'items-center justify-center gap-2.5 w-full' : 'gap-2'}`}>
          {/* 1. LOCAL MEDIA FILES */}
          <div className={`flex flex-col ${isCollapsed ? 'items-center justify-center w-full' : ''}`}>
            <button
              onClick={() => {
                onTabChange('local-media');
                onSelectPeer(null);
              }}
              className={`group relative flex items-center ${
                isCollapsed ? 'justify-center w-11 h-11 p-0 mx-auto' : 'w-full justify-between px-3.5 py-3'
              } rounded-2xl font-medium text-sm focus:outline-none ${
                isLocalActive
                  ? 'text-white font-semibold'
                  : 'text-zinc-300 hover:text-white'
              }`}
              title="Local Media Files (Direct Storage)"
            >
              <div className={`flex items-center justify-center ${isCollapsed ? 'w-full h-full' : 'gap-3 min-w-0'}`}>
                <div className={`flex items-center justify-center w-9 h-9 aspect-square flex-shrink-0 rounded-lg ${
                  isLocalActive 
                    ? 'bg-sky-500 text-black shadow-md shadow-sky-500/30' 
                    : 'bg-white/10 text-sky-400'
                }`}>
                  <HardDrive className="w-5 h-5" />
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col text-left truncate">
                    <span className="truncate">Local Media Files</span>
                    <span className="text-[11px] text-zinc-400 font-normal">Internal NVMe & LAN</span>
                  </div>
                )}
              </div>
            </button>

            {/* Expanded Local Folders Sub-list */}
            {!isCollapsed && (
              <div className="pl-4 pr-1 flex flex-col gap-1 border-l-2 border-white/5 ml-5 mt-1.5">
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Folders ({importedFolders.length})
                  </span>
                </div>

                {importedFolders.map((folder) => (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => {
                      onTabChange('local-media');
                      onSelectPeer(null);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-white/5 focus:ring-2 focus:ring-sky-400 focus:outline-none focus:bg-white/10 transition-all text-left cursor-pointer group"
                    title={`${folder.name} (${folder.path})`}
                  >
                    <div className="flex items-center gap-2 truncate min-w-0">
                      <Folder className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                      <div className="flex flex-col truncate">
                        <span className="truncate text-xs font-medium text-zinc-200 group-hover:text-white">{folder.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono truncate">{folder.path}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono ml-1 flex-shrink-0">
                      {folder.fileCount}
                    </span>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setIsAddFolderOpen(true)}
                  className="mt-1 flex items-center gap-2 px-3 py-1.5 rounded-xl border border-dashed border-white/15 hover:border-sky-400/50 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-sky-300 text-xs transition-all text-left cursor-pointer"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-sky-400" />
                  <span>+ Add Folder</span>
                </button>
              </div>
            )}
          </div>

          {/* 2. SHARED LIBRARIES FROM OTHER USERS */}
          <div className={`flex flex-col ${isCollapsed ? 'items-center justify-center w-full mt-0' : 'gap-1.5 mt-1'}`}>
            <button
              onClick={() => {
                onTabChange('shared-libraries');
                onSelectPeer(null);
              }}
              className={`group relative flex items-center ${
                isCollapsed ? 'justify-center w-11 h-11 p-0 mx-auto' : 'w-full justify-between px-3.5 py-3'
              } rounded-2xl font-medium text-sm focus:outline-none ${
                isSharedActive && !selectedPeerId
                  ? 'text-white font-semibold'
                  : 'text-zinc-300 hover:text-white'
              }`}
              title="Shared Libraries from other users"
            >
              <div className={`flex items-center justify-center ${isCollapsed ? 'w-full h-full' : 'gap-3 min-w-0'}`}>
                <div className={`relative flex items-center justify-center w-9 h-9 aspect-square flex-shrink-0 rounded-lg ${
                  isSharedActive && !selectedPeerId
                    ? 'bg-pink-500 text-white' 
                    : 'bg-white/10 text-pink-400'
                }`}>
                  <Users className="w-5 h-5" />
                  {/* Live sync dot */}
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col text-left truncate">
                    <span className="truncate">Shared Libraries</span>
                    <span className="text-[11px] text-zinc-400 font-normal">From other users</span>
                  </div>
                )}
              </div>
            </button>

            {/* Expanded Peer Libraries Sub-list */}
            {!isCollapsed && (
              <div className="pl-4 pr-1 flex flex-col gap-1 border-l-2 border-white/5 ml-5 mt-1">
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Connected Peers
                  </span>
                </div>

                {peers.map((peer) => {
                  const isPeerSelected = isSharedActive && selectedPeerId === peer.id;
                  return (
                    <button
                      key={peer.id}
                      onClick={() => {
                        onTabChange('shared-libraries');
                        onSelectPeer(peer.id);
                      }}
                      className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all text-left focus:outline-none ${
                        isPeerSelected
                          ? 'bg-pink-500/20 text-white border border-pink-400/40 font-semibold'
                          : 'text-zinc-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate min-w-0">
                        <div className={`w-6 h-6 rounded-lg ${peer.avatarColor} text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0 shadow-sm`}>
                          {peer.avatarInitials}
                        </div>
                        <div className="flex flex-col truncate">
                          <span className="truncate">{peer.name}</span>
                          <span className="text-[10px] text-zinc-400 truncate">{peer.owner}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          peer.status === 'online' ? 'bg-emerald-400' : 'bg-zinc-600'
                        }`} />
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {peer.itemCount}
                        </span>
                      </div>
                    </button>
                  );
                })}

                {/* Quick Add Friend Library Button */}
                <button
                  onClick={onOpenConnectModal}
                  className="mt-1 flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-white/15 hover:border-pink-400/50 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-pink-300 text-xs transition-all text-left"
                >
                  <Plus className="w-3.5 h-3.5 text-pink-400" />
                  <span>+ Connect Shared Library</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Separator */}
        <div className={`h-px bg-white/10 ${isCollapsed ? 'w-8 mx-auto my-0.5' : 'w-full'}`} />

        {/* Removable Devices and Network Shares Section */}
        <div className={`flex flex-col ${isCollapsed ? 'items-center justify-center gap-2.5 w-full' : 'gap-3'}`}>

          {/* Sub-section 1: Removable Devices (USB / OTG / External SSD) */}
          <div className={`flex flex-col ${isCollapsed ? 'items-center justify-center gap-1.5 w-full' : 'gap-1'}`}>
            {!isCollapsed && (
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                Removable Devices
              </span>
            )}
            {removableDevices.map((dev) => {
              const isSelected = activeSourceId === dev.id;
              return (
                <button
                  key={dev.id}
                  onClick={() => {
                    setActiveSourceId(dev.id);
                    onTabChange('local-media');
                    onSelectPeer(null);
                  }}
                  className={`group flex items-center ${
                    isCollapsed ? 'justify-center w-11 h-11 p-0 mx-auto' : 'justify-between px-3 py-2'
                  } rounded-xl text-xs transition-all text-left focus:outline-none cursor-pointer ${
                    isSelected
                      ? 'bg-yellow-500/15 text-white border border-yellow-400/40 shadow-sm font-semibold'
                      : 'text-zinc-300 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                  title={`${dev.name} (${dev.freeSpace} • ${dev.itemCount} files)`}
                >
                  <div className={`flex items-center justify-center ${isCollapsed ? 'w-full h-full' : 'gap-2.5 truncate min-w-0'}`}>
                    <div className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all ${
                      isSelected ? 'bg-yellow-400 text-black shadow-md shadow-yellow-500/20' : 'bg-yellow-400/10 text-yellow-400 group-hover:bg-yellow-400/20'
                    }`}>
                      <Usb className="w-4 h-4" />
                    </div>
                    {!isCollapsed && (
                      <div className="flex flex-col truncate">
                        <span className="truncate font-medium text-zinc-200 group-hover:text-white">
                          {dev.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono truncate">
                          {dev.freeSpace}
                        </span>
                      </div>
                    )}
                  </div>

                  {!isCollapsed && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Mounted" />
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {dev.itemCount}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sub-section 2: Network Shares (SMB / NFS / DLNA) */}
          <div className={`flex flex-col ${isCollapsed ? 'items-center justify-center gap-1.5 w-full' : 'gap-1 mt-1'}`}>
            {!isCollapsed && (
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  Network Shares
                </span>
              </div>
            )}
            {networkShares.map((share) => {
              const isSelected = activeSourceId === share.id;
              return (
                <button
                  key={share.id}
                  onClick={() => {
                    setActiveSourceId(share.id);
                    onTabChange('local-media');
                    onSelectPeer(null);
                  }}
                  className={`group flex items-center ${
                    isCollapsed ? 'justify-center w-11 h-11 p-0 mx-auto' : 'justify-between px-3 py-2'
                  } rounded-xl text-xs transition-all text-left focus:outline-none cursor-pointer ${
                    isSelected
                      ? 'bg-orange-500/15 text-white border border-orange-400/40 shadow-sm font-semibold'
                      : 'text-zinc-300 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                  title={`${share.name} (${share.address} • ${share.itemCount} files)`}
                >
                  <div className={`flex items-center justify-center ${isCollapsed ? 'w-full h-full' : 'gap-2.5 truncate min-w-0'}`}>
                    <div className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all ${
                      isSelected ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/20'
                    }`}>
                      <Server className="w-4 h-4" />
                    </div>
                    {!isCollapsed && (
                      <div className="flex flex-col truncate">
                        <span className="truncate font-medium text-zinc-200 group-hover:text-white">
                          {share.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono truncate">
                          {share.protocol} • {share.ping}
                        </span>
                      </div>
                    )}
                  </div>

                  {!isCollapsed && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Connected" />
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {share.itemCount}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}

            {!isCollapsed && (
              <button
                onClick={() => setIsAddShareOpen(true)}
                className="mt-1 flex items-center gap-2 px-3 py-1.5 rounded-xl border border-dashed border-white/15 hover:border-orange-400/50 bg-white/5 hover:bg-orange-500/10 text-zinc-300 hover:text-orange-300 text-xs transition-all text-left cursor-pointer"
              >
                <Plus className="w-3 h-3 text-orange-400" />
                <span>+ Add SMB / NFS Share</span>
              </button>
            )}
          </div>
        </div>

        {/* Community Addons & Plugins Entrypoint */}
        {onOpenPlugins && (
          <div className={`mt-auto pt-2 border-t border-white/10 ${isCollapsed ? 'w-full flex justify-center' : ''}`}>
            <button
              onClick={onOpenPlugins}
              className={`group flex items-center ${
                isCollapsed ? 'justify-center w-11 h-11 p-0 mx-auto' : 'w-full justify-between px-3.5 py-2.5'
              } rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-all text-left focus:outline-none cursor-pointer`}
              title="Community Plugins & Addons (Stremio Protocol)"
            >
              <div className={`flex items-center justify-center ${isCollapsed ? 'w-full h-full' : 'gap-2.5 truncate min-w-0'}`}>
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 group-hover:scale-105 transition-transform shrink-0">
                  <Puzzle className="w-5 h-5" />
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col truncate min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-xs truncate">Community Addons</span>
                    </div>
                    <span className="text-[10px] text-indigo-300/70 font-normal truncate">Stremio Protocol v3</span>
                  </div>
                )}
              </div>
            </button>
          </div>
        )}
      </div>
    </aside>

    {/* Add Network Share Modal */}
    {isAddShareOpen && (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={() => setIsAddShareOpen(false)}
      >
        <div 
          className="relative w-full max-w-lg bg-[#181818] border border-white/20 rounded-3xl p-6 lg:p-8 shadow-2xl flex flex-col gap-5 select-none"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-display">Mount Network Share</h3>
                <p className="text-xs text-zinc-400">Connect SMB, NFS, DLNA, or WebDAV storage</p>
              </div>
            </div>
            <button
              onClick={() => setIsAddShareOpen(false)}
              className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleAddNetworkShare} className="flex flex-col gap-4">
            {/* Protocol selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Protocol</label>
              <div className="grid grid-cols-4 gap-2">
                {(['SMB', 'NFS', 'DLNA', 'WebDAV'] as const).map((proto) => (
                  <button
                    key={proto}
                    type="button"
                    onClick={() => setNewShareProtocol(proto)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      newShareProtocol === proto
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                        : 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10'
                    }`}
                  >
                    {proto}
                  </button>
                ))}
              </div>
            </div>

            {/* Share Address / Path */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Server Address / Share URL</label>
              <input
                type="text"
                value={newShareAddress}
                onChange={(e) => setNewShareAddress(e.target.value)}
                placeholder={newShareProtocol === 'SMB' ? 'smb://192.168.1.100/movies' : 'nfs://nas.local/volume1/media'}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 focus:border-orange-400 focus:outline-none text-sm text-white font-mono placeholder:text-zinc-600"
                required
              />
            </div>

            {/* Display Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Display Label (Optional)</label>
              <input
                type="text"
                value={newShareName}
                onChange={(e) => setNewShareName(e.target.value)}
                placeholder="e.g. Living Room Synology NAS"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 focus:border-orange-400 focus:outline-none text-sm text-white placeholder:text-zinc-600"
              />
            </div>

            {/* Credentials */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Username & Credentials (Optional)</label>
              <input
                type="text"
                value={newShareUser}
                onChange={(e) => setNewShareUser(e.target.value)}
                placeholder="Guest or user:password"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 focus:border-orange-400 focus:outline-none text-sm text-white placeholder:text-zinc-600"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAddShareOpen(false)}
                className="px-5 py-2.5 rounded-full text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Mount & Connect</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Add Local System Folder Modal */}
    {isAddFolderOpen && (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={() => setIsAddFolderOpen(false)}
      >
        <div 
          className="relative w-full max-w-lg bg-[#181818] border border-white/20 rounded-3xl p-6 lg:p-8 shadow-2xl flex flex-col gap-5 select-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Hidden Directory File Input for System Folder Import */}
          <input
            type="file"
            ref={folderInputRef}
            onChange={handleFileSystemFolderSelect}
            {...({ webkitdirectory: '', directory: '' } as any)}
            multiple
            className="hidden"
          />

          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <FolderPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-display">Add Local System Folder</h3>
                <p className="text-xs text-zinc-400">Import a local directory or mountpoint as a media source</p>
              </div>
            </div>
            <button
              onClick={() => setIsAddFolderOpen(false)}
              className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {folderSuccessMessage && (
            <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{folderSuccessMessage}</span>
            </div>
          )}

          {/* Quick System Directory Picker */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-sky-400" />
                  Select System Directory
                </span>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Choose any folder on your device using your OS file browser
                </p>
              </div>
              <button
                type="button"
                onClick={() => folderInputRef.current?.click()}
                className="px-4 py-2 rounded-full bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-sky-500/20 cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Browse Folder</span>
              </button>
            </div>
          </div>

          {/* Preset Quick Folders */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Quick System Mountpoint Presets
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'User Movies', path: '/Users/steven/Movies', type: 'Movies' },
                { name: '4K Cinema Drive', path: 'D:\\Media\\4K_Cinema', type: 'Movies' },
                { name: 'External USB OTG', path: '/mnt/media_rw/USB1/video', type: 'Removable' },
                { name: 'TV Shows Archive', path: '/Volumes/Storage/TV_Shows', type: 'TV Shows' },
              ].map((preset) => (
                <button
                  key={preset.path}
                  type="button"
                  onClick={() => {
                    setFolderNameInput(preset.name);
                    setFolderPathInput(preset.path);
                    setFolderTypeInput(preset.type);
                  }}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all flex flex-col gap-0.5 group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-200 group-hover:text-sky-300">{preset.name}</span>
                    <span className="text-[9px] text-zinc-500 font-mono">{preset.type}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono truncate">{preset.path}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleAddFolderSubmit} className="flex flex-col gap-4">
            {/* Folder Path */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                System Folder Path
              </label>
              <input
                type="text"
                value={folderPathInput}
                onChange={(e) => setFolderPathInput(e.target.value)}
                placeholder="/home/user/Movies or D:\Media"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 focus:border-sky-400 focus:outline-none text-sm text-white font-mono placeholder:text-zinc-600"
                required
              />
            </div>

            {/* Folder Name & Type */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Display Label (Optional)
                </label>
                <input
                  type="text"
                  value={folderNameInput}
                  onChange={(e) => setFolderNameInput(e.target.value)}
                  placeholder="e.g. Master Library"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 focus:border-sky-400 focus:outline-none text-sm text-white placeholder:text-zinc-600"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Media Content Type
                </label>
                <select
                  value={folderTypeInput}
                  onChange={(e) => setFolderTypeInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/15 focus:border-sky-400 focus:outline-none text-sm text-white"
                >
                  <option value="Movies">Movies & Cinema</option>
                  <option value="TV Shows">TV Series & Shows</option>
                  <option value="Documentaries">Documentaries</option>
                  <option value="Mixed">Mixed Media</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAddFolderOpen(false)}
                className="px-5 py-2.5 rounded-full text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Import Folder Source</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  );
};
