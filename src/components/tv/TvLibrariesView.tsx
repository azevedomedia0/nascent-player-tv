import React, { useState, useMemo, useRef } from 'react';
import { 
  HardDrive, 
  Folder, 
  FolderPlus, 
  Server, 
  Usb, 
  Network, 
  Wifi, 
  Users, 
  Play, 
  CheckCircle2, 
  RefreshCw, 
  LayoutGrid, 
  List, 
  Search, 
  Plus, 
  Sparkles, 
  X, 
  ChevronRight, 
  Activity, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  History, 
  Film, 
  Clapperboard, 
  Eye,
  SlidersHorizontal,
  Info,
  Radio,
  Share2
} from 'lucide-react';
import { FeaturedMovie } from '../../lib/types';
import { LocalMediaFileItem, SharedPeerLibrary } from '../../lib/tvMediaData';

export interface StorageDrive {
  id: string;
  name: string;
  mountPoint: string;
  type: 'nvme' | 'usb' | 'network';
  fileSystem: string;
  totalBytes: number; // in GB
  usedBytes: number;  // in GB
  readSpeed: string;
  health: string;
  itemCount: number;
}

export interface PeerWatchPartyInvitation {
  id: string;
  peerId: string;
  hostName: string;
  hostHandle: string;
  avatarInitials: string;
  avatarColor: string;
  movie: FeaturedMovie;
  startedAt: string;
  currentTime: string;
  viewerCount: number;
  syncQuality: string;
}

interface TvLibrariesViewProps {
  localMediaFiles: LocalMediaFileItem[];
  peerLibraries: SharedPeerLibrary[];
  onPlayMovie: (movie: FeaturedMovie) => void;
  onInspectMovie: (movie: FeaturedMovie) => void;
  onStreamSelectorMovie: (movie: FeaturedMovie) => void;
  onOpenWatchParty?: (movie: FeaturedMovie) => void;
  selectedPeerId: string | null;
  onSelectPeer: (peerId: string | null) => void;
}

export const TvLibrariesView: React.FC<TvLibrariesViewProps> = ({
  localMediaFiles,
  peerLibraries,
  onPlayMovie,
  onInspectMovie,
  onStreamSelectorMovie,
  onOpenWatchParty,
  selectedPeerId,
  onSelectPeer,
}) => {
  // Navigation tabs within Libraries
  type LibraryTab = 'all' | 'longest' | 'masters' | 'played' | 'volumes' | 'network' | 'peers';
  const [activeLibraryTab, setActiveLibraryTab] = useState<LibraryTab>(
    selectedPeerId ? 'peers' : 'all'
  );

  // View modes: 'grid' (cinematic poster tiles) vs 'inspector' (detailed technical audio/video rows)
  const [viewMode, setViewMode] = useState<'grid' | 'inspector'>('grid');

  // Search filter inside library
  const [searchQuery, setSearchQuery] = useState('');

  // Selected storage drive filter
  const [selectedDriveId, setSelectedDriveId] = useState<string | null>(null);

  // Rescan state & feedback
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<string | null>(null);

  // Modals inside Libraries view
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [isAddShareModalOpen, setIsAddShareModalOpen] = useState(false);
  const [isConnectPeerModalOpen, setIsConnectPeerModalOpen] = useState(false);
  const [peerCodeInput, setPeerCodeInput] = useState('');
  const [peerConnectStatus, setPeerConnectStatus] = useState<string | null>(null);

  // Add folder form
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderPath, setNewFolderPath] = useState('');
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Add share form
  const [shareName, setShareName] = useState('');
  const [shareProtocol, setShareProtocol] = useState<'SMB' | 'NFS' | 'DLNA'>('SMB');
  const [shareAddress, setShareAddress] = useState('');

  // Storage Drives state
  const [storageDrives, setStorageDrives] = useState<StorageDrive[]>([
    {
      id: 'nvme-primary',
      name: 'Internal PCIe 4.0 NVMe',
      mountPoint: '/mnt/nvme0n1/media',
      type: 'nvme',
      fileSystem: 'ext4 (Direct I/O)',
      totalBytes: 2000,
      usedBytes: 1420,
      readSpeed: '3,520 MB/s',
      health: '100% Optimal',
      itemCount: 4,
    },
    {
      id: 'usb-samsung-t7',
      name: 'Samsung T7 Shield SSD',
      mountPoint: '/storage/usbotg_samsung',
      type: 'usb',
      fileSystem: 'exFAT (USB 3.2 Gen2)',
      totalBytes: 1000,
      usedBytes: 360,
      readSpeed: '1,050 MB/s',
      health: 'Healthy (Mounted)',
      itemCount: 8,
    },
    {
      id: 'nas-truenas',
      name: 'TrueNAS Core Array',
      mountPoint: 'smb://192.168.1.120/movies',
      type: 'network',
      fileSystem: 'ZFS RAID-Z2 (10GbE)',
      totalBytes: 32000,
      usedBytes: 18400,
      readSpeed: '940 MB/s',
      health: 'Online (3ms ping)',
      itemCount: 148,
    },
    {
      id: 'nas-synology',
      name: 'Synology Media Vault',
      mountPoint: 'nfs://synology.lan/video',
      type: 'network',
      fileSystem: 'SHR Btrfs (1GbE)',
      totalBytes: 16000,
      usedBytes: 9400,
      readSpeed: '118 MB/s',
      health: 'Online (2ms ping)',
      itemCount: 85,
    },
  ]);

  // Active Watch Party Invitation from Connected Peer
  // Strictly only appears when a Connected Peer has started a Watch Party
  const [activePeerWatchParty, setActivePeerWatchParty] = useState<PeerWatchPartyInvitation | null>(() => {
    const streamingPeer = peerLibraries.find((p) => p.status === 'online' || p.status === 'streaming');
    if (!streamingPeer || streamingPeer.media.length === 0) return null;

    return {
      id: `party-${streamingPeer.id}`,
      peerId: streamingPeer.id,
      hostName: streamingPeer.owner,
      hostHandle: streamingPeer.ownerHandle,
      avatarInitials: streamingPeer.avatarInitials,
      avatarColor: streamingPeer.avatarColor,
      movie: streamingPeer.media[0],
      startedAt: '14 mins ago',
      currentTime: '00:42:15',
      viewerCount: 3,
      syncQuality: 'Direct P2P 4K Atmos · 0ms Drift',
    };
  });

  // Rescan simulation with realistic timings
  const handleRescan = () => {
    setIsScanning(true);
    setScanStatus('Scanning PCIe NVMe, attached USB-C storage & LAN mountpoints...');
    setTimeout(() => {
      setIsScanning(false);
      setScanStatus(
        `Index updated: ${localMediaFiles.length} local masters verified · 2 storage arrays synchronized · 0 corrupt blocks.`
      );
      setTimeout(() => setScanStatus(null), 4500);
    }, 1200);
  };

  // Convert LocalMediaFileItem to FeaturedMovie format for shared components
  const convertToMovie = (file: LocalMediaFileItem): FeaturedMovie => ({
    id: file.id,
    title: file.title,
    releaseYear: file.releaseYear,
    posterUrl: file.posterUrl,
    bannerUrl: file.bannerUrl,
    genres: file.genres,
    rating: file.rating,
    certification: file.certification,
    director: file.director,
    summary: file.summary,
    streamUrl: file.streamUrl,
  });

  // Helper to parse duration string like "2h 46m", "10m 34s", etc.
  const parseDurationSeconds = (d: string): number => {
    let seconds = 0;
    const hoursMatch = d.match(/(\d+)\s*h/);
    const minutesMatch = d.match(/(\d+)\s*m/);
    const secondsMatch = d.match(/(\d+)\s*s/);
    if (hoursMatch) seconds += parseInt(hoursMatch[1], 10) * 3600;
    if (minutesMatch) seconds += parseInt(minutesMatch[1], 10) * 60;
    if (secondsMatch) seconds += parseInt(secondsMatch[1], 10);
    return seconds;
  };

  // Longest duration files (sorted descending by runtime)
  const longestFiles = useMemo(() => {
    return [...localMediaFiles].sort(
      (a, b) => parseDurationSeconds(b.duration) - parseDurationSeconds(a.duration)
    );
  }, [localMediaFiles]);

  // Recently played playback items
  const recentlyPlayedFiles = useMemo(() => {
    return localMediaFiles.slice(0, 3);
  }, [localMediaFiles]);

  // Filtered files according to search, drive, and active tab
  const filteredLocalFiles = useMemo(() => {
    let result =
      activeLibraryTab === 'played'
        ? recentlyPlayedFiles
        : activeLibraryTab === 'longest'
        ? longestFiles
        : localMediaFiles;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          f.codec.toLowerCase().includes(q) ||
          f.resolution.toLowerCase().includes(q) ||
          f.audioTrack.toLowerCase().includes(q) ||
          f.genres.some((g) => g.toLowerCase().includes(q))
      );
    }

    if (selectedDriveId) {
      if (selectedDriveId === 'nvme-primary') {
        result = result.filter((f) => f.path.startsWith('/mnt/nvme0n1'));
      }
    }

    return result;
  }, [localMediaFiles, recentlyPlayedFiles, longestFiles, searchQuery, selectedDriveId, activeLibraryTab]);

  // All Peer Media combined or single selected peer
  const activePeer = useMemo(() => {
    if (!selectedPeerId) return null;
    return peerLibraries.find((p) => p.id === selectedPeerId) || null;
  }, [peerLibraries, selectedPeerId]);

  const allPeerMedia = useMemo(() => {
    if (activePeer) return activePeer.media;
    return peerLibraries.flatMap((p) => p.media);
  }, [peerLibraries, activePeer]);

  // All Peer Shared Files with owner details and network diagnostics
  const peerSharedFiles = useMemo(() => {
    const list = selectedPeerId
      ? (activePeer?.media || []).map((m) => ({
          ...m,
          peerName: activePeer?.name || 'Peer Node',
          peerOwner: activePeer?.owner || 'Peer User',
          peerInitials: activePeer?.avatarInitials || 'P',
          peerColor: activePeer?.avatarColor || 'bg-indigo-600',
          peerPing: activePeer?.pingMs || 20,
        }))
      : peerLibraries.flatMap((p) =>
          p.media.map((m) => ({
            ...m,
            peerName: p.name,
            peerOwner: p.owner,
            peerInitials: p.avatarInitials,
            peerColor: p.avatarColor,
            peerPing: p.pingMs,
          }))
        );

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.genres.some((g) => g.toLowerCase().includes(q)) ||
        (m.director && m.director.toLowerCase().includes(q)) ||
        m.peerOwner.toLowerCase().includes(q) ||
        m.peerName.toLowerCase().includes(q)
    );
  }, [peerLibraries, selectedPeerId, activePeer, searchQuery]);

  // Filtered peer media based on search query
  const filteredPeerMedia = useMemo(() => {
    return peerSharedFiles;
  }, [peerSharedFiles]);

  // Peer shared files categorized by Peer and Shared Library
  const categorizedPeerLibraries = useMemo(() => {
    return peerLibraries
      .filter((peer) => !selectedPeerId || peer.id === selectedPeerId)
      .map((peer) => {
        let media = peer.media.map((m) => ({
          ...m,
          peerName: peer.name,
          peerOwner: peer.owner,
          peerOwnerHandle: peer.ownerHandle,
          peerInitials: peer.avatarInitials,
          peerColor: peer.avatarColor,
          peerPing: peer.pingMs,
          peerBandwidth: peer.bandwidth,
          peerStorage: peer.storageShared,
          peerLocation: peer.location,
          peerDescription: peer.description,
        }));

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          media = media.filter(
            (m) =>
              m.title.toLowerCase().includes(q) ||
              m.genres.some((g) => g.toLowerCase().includes(q)) ||
              (m.director && m.director.toLowerCase().includes(q)) ||
              peer.owner.toLowerCase().includes(q) ||
              peer.name.toLowerCase().includes(q)
          );
        }

        return {
          ...peer,
          filteredMedia: media,
        };
      })
      .filter((peer) => peer.filteredMedia.length > 0);
  }, [peerLibraries, selectedPeerId, searchQuery]);

  // Handle Add Folder submit
  const handleAddFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderPath.trim()) return;
    const folderName = newFolderName.trim() || newFolderPath.split('/').filter(Boolean).pop() || 'Media Folder';
    setScanStatus(`Mounted folder "${folderName}" at ${newFolderPath.trim()}`);
    setIsAddFolderModalOpen(false);
    setNewFolderName('');
    setNewFolderPath('');
    setTimeout(() => setScanStatus(null), 3500);
  };

  // Handle Add Network Share submit
  const handleAddShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareAddress.trim()) return;
    const name = shareName.trim() || `${shareProtocol} (${shareAddress.split('/').filter(Boolean).pop() || 'share'})`;
    const newDrive: StorageDrive = {
      id: `share-${Date.now()}`,
      name,
      mountPoint: shareAddress.trim(),
      type: 'network',
      fileSystem: `${shareProtocol} Network Mount`,
      totalBytes: 8000,
      usedBytes: 4200,
      readSpeed: '450 MB/s',
      health: 'Connected (4ms)',
      itemCount: 16,
    };
    setStorageDrives((prev) => [...prev, newDrive]);
    setScanStatus(`Network share "${name}" successfully mounted.`);
    setIsAddShareModalOpen(false);
    setShareName('');
    setShareAddress('');
    setTimeout(() => setScanStatus(null), 3500);
  };

  // Handle Peer connect code
  const handleConnectPeer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!peerCodeInput.trim()) return;
    setPeerConnectStatus('Handshaking with P2P peer node...');
    setTimeout(() => {
      setPeerConnectStatus('Peer verified: "Alex\'s 4K Remux Vault" connected at 94 Mbps.');
      setTimeout(() => {
        setIsConnectPeerModalOpen(false);
        setPeerCodeInput('');
        setPeerConnectStatus(null);
      }, 1200);
    }, 1000);
  };

  return (
    <div className="w-full flex-1 flex flex-col gap-6 px-6 lg:px-12 py-5 max-w-[1720px] mx-auto animate-in fade-in duration-300">
      {/* 1. TOP HEADER & TELEMETRY COMMAND BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-400 flex items-center justify-center shadow-lg shadow-sky-500/10">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-2xl lg:text-3xl text-white tracking-wide">
                Local Media Libraries
              </h1>
              <p className="text-xs lg:text-sm text-zinc-400 mt-0.5">
                Direct zero-transcode NVMe SSD storage, local network mounts, and peer mesh nodes.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleRescan}
            disabled={isScanning}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-all focus:outline-none focus:ring-1 focus:ring-sky-400 cursor-pointer disabled:opacity-50"
            title="Refresh media"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-sky-400' : 'text-zinc-300'}`} />
            <span>{isScanning ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={() => setIsAddShareModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-orange-500/10 text-white text-xs font-medium border border-white/10 hover:border-orange-500/30 transition-all focus:outline-none focus:ring-1 focus:ring-orange-400 cursor-pointer"
            title="Mount SMB / NFS network share"
          >
            <Network className="w-3.5 h-3.5 text-orange-400" />
            <span>+ Mount Share</span>
          </button>

          <button
            onClick={() => setIsConnectPeerModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 text-pink-200 hover:text-white text-xs font-medium border border-pink-500/30 transition-all focus:outline-none focus:ring-1 focus:ring-pink-400 cursor-pointer"
            title="Add friend's peer library"
          >
            <Users className="w-3.5 h-3.5 text-pink-400" />
            <span>+ Add Peer</span>
          </button>
        </div>
      </div>

      {/* Real-time Scan Status Toast */}
      {scanStatus && (
        <div className="px-4 py-3 rounded-2xl bg-sky-950/60 border border-sky-400/40 text-sky-200 text-xs flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <span>{scanStatus}</span>
          </div>
          <button 
            onClick={() => setScanStatus(null)} 
            className="text-zinc-400 hover:text-white focus:outline-none cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* CONNECTED PEER WATCH PARTY INVITATION */}
      {activePeerWatchParty && (
        <div className="relative rounded-3xl overflow-hidden border border-pink-500/35 bg-gradient-to-r from-[#180c14] via-[#24111d] to-[#120d10] shadow-2xl shadow-pink-950/40 animate-in fade-in slide-in-from-top-3 duration-300">
          {/* Ambient Movie Backdrop Glow */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            {activePeerWatchParty.movie.bannerUrl && (
              <img
                src={activePeerWatchParty.movie.bannerUrl}
                alt={activePeerWatchParty.movie.title}
                className="w-full h-full object-cover object-center opacity-25 filter blur-md scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[#140a10] via-[#1a0c16]/90 to-[#140a10]/95" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#140a10] via-transparent to-transparent" />
          </div>

          <div className="relative z-10 p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Host Avatar, Live Badge & Movie Information */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 min-w-0 max-w-4xl">
              {/* Movie Poster with Live Badge Overlay */}
              <div 
                onClick={() => {
                  if (onOpenWatchParty) {
                    onOpenWatchParty(activePeerWatchParty.movie);
                  } else {
                    onPlayMovie(activePeerWatchParty.movie);
                  }
                }}
                className="w-24 sm:w-28 h-36 rounded-2xl overflow-hidden flex-shrink-0 relative group shadow-2xl border border-pink-500/40 bg-zinc-900 cursor-pointer"
              >
                <img
                  src={activePeerWatchParty.movie.posterUrl}
                  alt={activePeerWatchParty.movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                </div>
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-rose-600/90 text-white font-mono text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  LIVE
                </div>
              </div>

              {/* Host and Party Details */}
              <div className="flex flex-col gap-2">
                {/* Peer Host Info header */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-pink-500/20 border border-pink-400/30">
                    <div className={`w-5 h-5 rounded-full ${activePeerWatchParty.avatarColor} text-white text-[10px] font-bold flex items-center justify-center shadow-sm`}>
                      {activePeerWatchParty.avatarInitials}
                    </div>
                    <span className="text-[11px] font-mono text-pink-300">
                      {activePeerWatchParty.hostHandle}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono uppercase tracking-widest text-pink-400 font-bold flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Invited You to Watch Party
                  </span>

                  <span className="text-zinc-600 font-mono">·</span>
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                    <Radio className="w-3 h-3 animate-pulse" />
                    {activePeerWatchParty.viewerCount} peers in sync
                  </span>
                </div>

                {/* Movie Title */}
                <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                  <span>{activePeerWatchParty.movie.title}</span>
                  <span className="text-sm font-mono text-zinc-400 font-normal">
                    ({activePeerWatchParty.movie.releaseYear})
                  </span>
                </h2>

                <p className="text-xs text-zinc-300 line-clamp-2 max-w-2xl leading-relaxed">
                  {activePeerWatchParty.movie.summary}
                </p>

                {/* Live stream sync specs */}
                <div className="flex items-center gap-3 flex-wrap text-xs font-mono pt-1 text-zinc-300">
                  <span className="text-zinc-400">Started {activePeerWatchParty.startedAt}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Details, Accept, Decline */}
            <div className="flex items-center gap-3 flex-shrink-0 self-start md:self-center">
              <button
                onClick={() => onInspectMovie(activePeerWatchParty.movie)}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition-all cursor-pointer shadow-sm active:scale-95"
                title="View movie details & IMDb metadata"
              >
                <Info className="w-4 h-4 text-zinc-300" />
                <span>Details</span>
              </button>

              <button
                onClick={() => {
                  if (onOpenWatchParty) {
                    onOpenWatchParty(activePeerWatchParty.movie);
                  } else {
                    onPlayMovie(activePeerWatchParty.movie);
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-pink-500 hover:bg-pink-400 text-white font-extrabold text-xs shadow-xl shadow-pink-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Accept invitation and join watch party"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Accept</span>
              </button>

              <button
                onClick={() => setActivePeerWatchParty(null)}
                className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 text-xs border border-white/5 hover:border-rose-500/30 transition-all cursor-pointer active:scale-95"
                title="Decline invitation"
              >
                <X className="w-4 h-4" />
                <span>Decline</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXCLUSIVE SEARCH BAR: LOCAL MEDIA & SHARED FILES ONLY */}
      <div className="theme-panel w-full rounded-2xl border p-3 sm:p-3.5 backdrop-blur-md transition-all">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-4 w-4 h-4 theme-accent-icon pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search local storage & shared files by title, codec, audio, or peer..."
              className="theme-input w-full pl-11 pr-24 py-2.5 rounded-full border text-sm text-white placeholder-zinc-500 focus:outline-none transition-all font-sans"
              aria-label="Search local and shared media files"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="theme-clear absolute right-3.5 p-1 text-zinc-400 rounded-lg transition-colors cursor-pointer"
                title="Clear search"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Combined Pill-shape Segmented Scope Control */}
          <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
            <span className="theme-accent-muted text-[11px] font-mono uppercase tracking-wider font-semibold mr-0.5 hidden sm:inline">
              Scope:
            </span>
            <div className="theme-segment inline-flex items-center p-1 rounded-full border shadow-inner backdrop-blur-sm">
              <button
                type="button"
                onClick={() => {
                  setActiveLibraryTab('all');
                  onSelectPeer(null);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeLibraryTab === 'all' && !selectedPeerId
                    ? 'bg-white text-black font-bold shadow-md'
                    : 'theme-segment-idle'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveLibraryTab('masters');
                  onSelectPeer(null);
                }}
                title={`${localMediaFiles.length} local master files`}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeLibraryTab === 'masters' && !selectedPeerId
                    ? 'bg-sky-500 text-black font-bold shadow-md shadow-sky-500/25'
                    : 'theme-segment-idle'
                }`}
              >
                Local Files
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveLibraryTab('peers');
                }}
                title={`${peerLibraries.length} shared peer mesh libraries`}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeLibraryTab === 'peers'
                    ? 'bg-pink-500 text-white font-bold shadow-md shadow-pink-500/25'
                    : 'theme-segment-idle'
                }`}
              >
                Shared Files
              </button>
            </div>

            {searchQuery.trim() && (
              <div className="theme-chip flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono text-zinc-200 ml-1">
                <span className="theme-accent-icon font-bold">{filteredLocalFiles.length}</span>
                <span>matches</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. SOURCE TABS, IN-LIBRARY SEARCH & VIEW MODE SWITCHER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        {/* Source Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => {
              setActiveLibraryTab('masters');
              onSelectPeer(null);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer focus:outline-none ${
              activeLibraryTab === 'masters' && !selectedPeerId
                ? 'bg-sky-500 text-black font-bold shadow-md shadow-sky-500/20'
                : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Recently Added ({localMediaFiles.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveLibraryTab('played');
              onSelectPeer(null);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer focus:outline-none ${
              activeLibraryTab === 'played' && !selectedPeerId
                ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Recently Played ({recentlyPlayedFiles.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveLibraryTab('peers');
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer focus:outline-none ${
              activeLibraryTab === 'peers'
                ? 'bg-pink-500 text-white font-bold shadow-md shadow-pink-500/20'
                : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Peer Shared Files ({peerSharedFiles.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveLibraryTab('longest');
              onSelectPeer(null);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer focus:outline-none ${
              activeLibraryTab === 'longest' && !selectedPeerId
                ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20'
                : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Longest ({localMediaFiles.length})</span>
          </button>
        </div>

        {/* Search input & Grid / List View Toggle */}
        <div className="flex items-center gap-3">
          {/* Quick Search Input */}
          <div className="relative min-w-[220px] lg:min-w-[280px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter titles, codecs, audio..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer focus:outline-none ${
                viewMode === 'grid'
                  ? 'bg-sky-500 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Poster Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('inspector')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer focus:outline-none ${
                viewMode === 'inspector'
                  ? 'bg-sky-500 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Technical Diagnostics Inspector View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. MEDIA DISPLAY: GRID OR INSPECTOR LIST */}
      {(activeLibraryTab === 'all' || activeLibraryTab === 'longest' || activeLibraryTab === 'masters' || activeLibraryTab === 'played' || activeLibraryTab === 'peers') && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-2">
              {activeLibraryTab === 'peers' ? (
                <>
                  <Users className="w-4 h-4 text-pink-400" />
                  <span>
                    Peer Shared Files ({peerSharedFiles.length} files across {categorizedPeerLibraries.length} Peer Libraries)
                  </span>
                </>
              ) : activeLibraryTab === 'played' ? (
                <>
                  <History className="w-4 h-4 text-emerald-400" />
                  <span>Recently Played ({filteredLocalFiles.length})</span>
                </>
              ) : activeLibraryTab === 'longest' ? (
                <>
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Longest ({filteredLocalFiles.length})</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-sky-400" />
                  <span>Recently Added ({filteredLocalFiles.length})</span>
                </>
              )}
            </h3>
          </div>

          {(activeLibraryTab === 'peers' ? categorizedPeerLibraries.length === 0 : filteredLocalFiles.length === 0) ? (
            <div className="h-48 flex flex-col items-center justify-center p-8 rounded-3xl bg-white/5 border border-white/10 text-center">
              <Search className="w-10 h-10 text-zinc-600 mb-2" />
              <p className="text-sm font-semibold text-white">
                {activeLibraryTab === 'peers'
                  ? (searchQuery ? `No peer shared files match "${searchQuery}"` : 'No peer shared media files currently available')
                  : `No local media files match "${searchQuery}"`}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-3 px-4 py-1.5 rounded-xl bg-white/10 text-xs text-sky-400 hover:text-sky-300 font-medium cursor-pointer"
                >
                  Clear Search Filter
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            /* POSTER GRID VIEW */
            activeLibraryTab === 'peers' ? (
              <div className="flex flex-col gap-8">
                {categorizedPeerLibraries.map((peerLibrary) => (
                  <div
                    key={peerLibrary.id}
                    className="flex flex-col gap-4 p-5 sm:p-6 rounded-3xl bg-[#141417]/90 border border-white/10 shadow-2xl backdrop-blur-md"
                  >
                    {/* Peer & Shared Library Category Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`w-11 h-11 rounded-2xl ${peerLibrary.avatarColor} text-white font-bold flex items-center justify-center text-sm shadow-md flex-shrink-0`}>
                          {peerLibrary.avatarInitials}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h4 className="text-base font-bold text-white tracking-wide truncate">
                              {peerLibrary.name}
                            </h4>
                            <span className="text-xs text-zinc-400 font-medium">
                              Peer: <span className="text-pink-300 font-semibold">{peerLibrary.owner}</span>
                              <span className="text-zinc-500 font-mono ml-1">({peerLibrary.ownerHandle})</span>
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              ONLINE
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 truncate mt-0.5 max-w-2xl">
                            {peerLibrary.description}
                          </p>
                        </div>
                      </div>

                      {/* Network & Storage Diagnostics */}
                      <div className="flex items-center gap-2.5 text-xs font-mono text-zinc-400 flex-shrink-0 self-start sm:self-center">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10">
                          <Wifi className="w-3.5 h-3.5 text-pink-400" />
                          <span className="text-emerald-400 font-semibold">{peerLibrary.pingMs}ms</span>
                          <span className="text-zinc-600">·</span>
                          <span className="text-zinc-300">{peerLibrary.bandwidth}</span>
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-pink-500/15 border border-pink-500/30 text-pink-300 font-semibold text-xs">
                          {peerLibrary.filteredMedia.length} {peerLibrary.filteredMedia.length === 1 ? 'Shared File' : 'Shared Files'}
                        </div>
                      </div>
                    </div>

                    {/* Movie Grid for this Peer Library */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
                      {peerLibrary.filteredMedia.map((item) => (
                        <div
                          key={`${peerLibrary.id}-${item.id}`}
                          className="group relative rounded-2xl overflow-hidden bg-[#161618] border border-white/10 hover:border-pink-500/50 hover:shadow-xl hover:shadow-pink-500/10 transition-all duration-300 flex flex-col justify-between"
                        >
                          {/* Top Preview Image 16:9 */}
                          <div 
                            onClick={() => onPlayMovie(item)}
                            className="relative w-full aspect-video bg-zinc-900 overflow-hidden cursor-pointer"
                          >
                            <img
                              src={item.bannerUrl || item.posterUrl}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            {/* Hover play overlay */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                              <div className="w-12 h-12 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                <Play className="w-5 h-5 fill-current ml-0.5" />
                              </div>
                            </div>

                            {/* Bottom rating (runtime moved to card body) */}
                            {item.rating && (
                              <div className="absolute bottom-2 left-3 flex items-center gap-2 text-[11px] font-mono text-zinc-300">
                                <span className="text-amber-400 font-semibold">★ {item.rating}</span>
                              </div>
                            )}

                            {/* Peer source badge top-right */}
                            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-[11px] font-medium text-white shadow-md">
                              <span className={`w-2 h-2 rounded-full ${peerLibrary.avatarColor}`} />
                              <span className="text-zinc-200 truncate max-w-[130px]">{peerLibrary.owner}</span>
                            </div>
                          </div>

                          {/* Metadata Body */}
                          <div className="p-4 flex flex-col gap-2.5">
                            <div className="flex flex-col">
                              <div className="flex items-center justify-between gap-2">
                                <h4 
                                  onClick={() => onPlayMovie(item)}
                                  className="text-base font-bold text-white group-hover:text-pink-300 transition-colors truncate cursor-pointer"
                                >
                                  {item.title}
                                </h4>
                                <span className="text-xs font-mono text-zinc-500">{item.releaseYear}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-pink-400 mt-0.5">
                                <span className="truncate">{peerLibrary.name}</span>
                                <span className="text-zinc-600">·</span>
                                <span className="font-mono text-zinc-500">{peerLibrary.pingMs}ms latency</span>
                              </div>
                            </div>

                            {/* Genres & Runtime Line */}
                            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 flex-wrap">
                              {item.certification && (
                                <>
                                  <span className="text-zinc-300 font-semibold">{item.certification}</span>
                                  <span className="text-zinc-600">·</span>
                                </>
                              )}
                              <span className="text-amber-300 truncate max-w-[170px]">{item.genres?.slice(0, 3).join(', ')}</span>
                              <span className="text-zinc-600">·</span>
                              <span className="text-zinc-300">
                                {item.duration ? `${Math.floor(item.duration / 60)}h ${item.duration % 60}m` : '2h 15m'}
                              </span>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                              <button
                                onClick={() => onInspectMovie(item)}
                                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-medium text-zinc-300 hover:text-white transition-all cursor-pointer"
                              >
                                Media Info
                              </button>

                              <div className="flex items-center gap-2">
                                {onOpenWatchParty && (
                                  <button
                                    onClick={() => onOpenWatchParty(item)}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 hover:text-white text-[11px] font-semibold transition-all cursor-pointer border border-pink-500/20"
                                    title="Start peer watch party"
                                  >
                                    <Users className="w-3 h-3" />
                                    <span>Party</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => onPlayMovie(item)}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-400 text-white font-bold text-[11px] shadow-sm transition-all cursor-pointer"
                                >
                                  <Play className="w-3 h-3 fill-current" />
                                  <span>Direct Play</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
                {filteredLocalFiles.map((file) => {
                  const movie = convertToMovie(file);

                  return (
                    <div
                      key={file.id}
                      className="group relative rounded-2xl overflow-hidden bg-[#161618] border border-white/10 hover:border-white/25 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                    >
                      {/* Top Preview Image 16:9 */}
                      <div 
                        onClick={() => onPlayMovie(movie)}
                        className="relative w-full aspect-video bg-zinc-900 overflow-hidden cursor-pointer"
                      >
                        <img
                          src={file.bannerUrl || file.posterUrl}
                          alt={file.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Hover play overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                          <div className="w-12 h-12 rounded-full bg-sky-500 text-black flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          </div>
                        </div>

                        {/* Progress bar for Recently Played */}
                        {activeLibraryTab === 'played' && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                            <div 
                              className="h-full bg-emerald-400" 
                              style={{ width: file.id === 'bbb-sample' ? '82%' : file.id === 'sintel-sample' ? '54%' : '67%' }} 
                            />
                          </div>
                        )}
                      </div>

                      {/* Metadata Body */}
                      <div className="p-4 flex flex-col gap-2.5">
                        <div className="flex flex-col">
                          <div className="flex items-center justify-between gap-2">
                            <h4 
                              onClick={() => onPlayMovie(movie)}
                              className="text-base font-bold text-white group-hover:text-sky-300 transition-colors truncate cursor-pointer"
                            >
                              {file.title}
                            </h4>
                            <span className="text-xs font-mono text-zinc-500">{file.releaseYear}</span>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-500 truncate mt-0.5">
                            {file.path}
                          </span>
                        </div>

                        {/* Codec, Audio Spec & Runtime Line */}
                        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 flex-wrap">
                          <span className="text-emerald-400 font-semibold">{file.codec.split(' ')[0]}</span>
                          <span className="text-zinc-600">·</span>
                          <span className="text-amber-300 truncate max-w-[170px]">{file.audioTrack.split('(')[0]}</span>
                          <span className="text-zinc-600">·</span>
                          <span className="text-zinc-300">{file.duration}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* TECHNICAL DIAGNOSTICS INSPECTOR VIEW (Table-like rows) */
            activeLibraryTab === 'peers' ? (
              <div className="flex flex-col gap-8">
                {categorizedPeerLibraries.map((peerLibrary) => (
                  <div
                    key={peerLibrary.id}
                    className="flex flex-col gap-4 p-5 sm:p-6 rounded-3xl bg-[#141417]/90 border border-white/10 shadow-2xl backdrop-blur-md"
                  >
                    {/* Peer & Shared Library Category Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`w-11 h-11 rounded-2xl ${peerLibrary.avatarColor} text-white font-bold flex items-center justify-center text-sm shadow-md flex-shrink-0`}>
                          {peerLibrary.avatarInitials}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h4 className="text-base font-bold text-white tracking-wide truncate">
                              {peerLibrary.name}
                            </h4>
                            <span className="text-xs text-zinc-400 font-medium">
                              Peer: <span className="text-pink-300 font-semibold">{peerLibrary.owner}</span>
                              <span className="text-zinc-500 font-mono ml-1">({peerLibrary.ownerHandle})</span>
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              ONLINE
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 truncate mt-0.5 max-w-2xl">
                            {peerLibrary.description}
                          </p>
                        </div>
                      </div>

                      {/* Network & Storage Diagnostics */}
                      <div className="flex items-center gap-2.5 text-xs font-mono text-zinc-400 flex-shrink-0 self-start sm:self-center">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10">
                          <Wifi className="w-3.5 h-3.5 text-pink-400" />
                          <span className="text-emerald-400 font-semibold">{peerLibrary.pingMs}ms</span>
                          <span className="text-zinc-600">·</span>
                          <span className="text-zinc-300">{peerLibrary.bandwidth}</span>
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-pink-500/15 border border-pink-500/30 text-pink-300 font-semibold text-xs">
                          {peerLibrary.filteredMedia.length} {peerLibrary.filteredMedia.length === 1 ? 'Shared File' : 'Shared Files'}
                        </div>
                      </div>
                    </div>

                    {/* Table-like diagnostic rows */}
                    <div className="flex flex-col gap-2.5">
                      {peerLibrary.filteredMedia.map((item) => (
                        <div
                          key={`${peerLibrary.id}-${item.id}`}
                          className="p-4 rounded-2xl bg-[#161618] hover:bg-[#1f1f23] border border-white/10 hover:border-pink-500/30 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 group"
                        >
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            {/* Mini Thumbnail */}
                            <div
                              onClick={() => onPlayMovie(item)}
                              className="w-14 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-900 border border-white/10 cursor-pointer relative group-hover:scale-105 transition-transform"
                            >
                              <img
                                src={item.posterUrl || item.bannerUrl}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent flex items-center justify-center">
                                <Play className="w-4 h-4 fill-white text-white opacity-80 group-hover:opacity-100" />
                              </div>
                            </div>

                            {/* File Details */}
                            <div className="flex flex-col min-w-0 flex-1">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span
                                  onClick={() => onPlayMovie(item)}
                                  className="font-bold text-base text-white group-hover:text-pink-300 transition-colors cursor-pointer"
                                >
                                  {item.title}
                                </span>
                                <span className="text-xs font-mono text-zinc-500">{item.releaseYear}</span>
                                {item.rating && (
                                  <span className="text-[11px] font-mono text-amber-400 font-bold">★ {item.rating}</span>
                                )}
                                <span className="flex items-center gap-1.5 text-[11px] text-zinc-300 px-2 py-0.5 rounded-lg bg-white/5 border border-white/5">
                                  <span className={`w-2 h-2 rounded-full ${peerLibrary.avatarColor}`} />
                                  <span className="font-semibold">{peerLibrary.owner}</span>
                                  <span className="text-zinc-500">({peerLibrary.name})</span>
                                </span>
                              </div>

                              <div className="flex items-center gap-4 text-xs font-mono text-zinc-300 mt-2 flex-wrap">
                                <span className="text-pink-300">Genres: {item.genres?.slice(0, 3).join(', ')}</span>
                                {item.director && (
                                  <>
                                    <span className="text-zinc-600">·</span>
                                    <span className="text-zinc-400">Director: {item.director}</span>
                                  </>
                                )}
                                <span className="text-zinc-600">·</span>
                                <span>Duration: {item.duration ? `${Math.floor(item.duration / 60)}h ${item.duration % 60}m` : 'Feature'}</span>
                                <span className="text-zinc-600">·</span>
                                <span>Ping: <span className="text-emerald-400 font-semibold">{peerLibrary.pingMs}ms</span></span>
                              </div>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-2 flex-shrink-0 self-end lg:self-center">
                            {onOpenWatchParty && (
                              <button
                                onClick={() => onOpenWatchParty(item)}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-xs font-semibold text-pink-300 hover:text-white transition-all cursor-pointer border border-pink-500/20"
                              >
                                <Users className="w-3.5 h-3.5" />
                                <span>Watch Party</span>
                              </button>
                            )}

                            <button
                              onClick={() => onInspectMovie(item)}
                              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-all cursor-pointer"
                            >
                              Media Info
                            </button>

                            <button
                              onClick={() => onPlayMovie(item)}
                              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Direct Play</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {filteredLocalFiles.map((file) => {
                  const movie = convertToMovie(file);

                  return (
                    <div
                      key={file.id}
                      className="p-4 rounded-2xl bg-[#161618] hover:bg-[#1f1f23] border border-white/10 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 group"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        {/* Mini Thumbnail */}
                        <div
                          onClick={() => onPlayMovie(movie)}
                          className="w-14 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-900 border border-white/10 cursor-pointer relative group-hover:scale-105 transition-transform"
                        >
                          <img
                            src={file.posterUrl}
                            alt={file.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent flex items-center justify-center">
                            <Play className="w-4 h-4 fill-white text-white opacity-80 group-hover:opacity-100" />
                          </div>
                        </div>

                        {/* File Details */}
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span
                              onClick={() => onPlayMovie(movie)}
                              className="font-bold text-base text-white group-hover:text-sky-300 transition-colors cursor-pointer"
                            >
                              {file.title}
                            </span>
                            <span className="text-xs font-mono text-zinc-500">{file.releaseYear}</span>
                            <span className="text-[11px] font-mono text-sky-400 font-bold">{file.resolution}</span>
                            <span className="text-[11px] font-mono text-emerald-400 font-semibold">{file.codec}</span>
                          </div>

                          <span className="text-xs font-mono text-zinc-500 truncate mt-1">
                            {file.path}
                          </span>

                          <div className="flex items-center gap-4 text-xs font-mono text-zinc-300 mt-2 flex-wrap">
                            <span className="text-amber-300">Audio: {file.audioTrack}</span>
                            <span className="text-zinc-600">·</span>
                            <span>Bitrate: <span className="text-white font-semibold">{file.bitrate}</span></span>
                            <span className="text-zinc-600">·</span>
                            <span>Size: <span className="text-white font-semibold">{file.fileSize}</span></span>
                            <span className="text-zinc-600">·</span>
                            <span>Duration: {file.duration}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0 self-end lg:self-center">
                        <button
                          onClick={() => onStreamSelectorMovie(movie)}
                          className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-300 hover:text-white transition-all cursor-pointer"
                        >
                          Platforms
                        </button>

                        <button
                          onClick={() => onInspectMovie(movie)}
                          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-all cursor-pointer"
                        >
                          Media Info & IMDb
                        </button>

                        <button
                          onClick={() => onPlayMovie(movie)}
                          className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs shadow-md transition-all cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Direct Play</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      )}


      {/* 8. MODAL: ADD LOCAL SYSTEM FOLDER */}
      {isAddFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-[#18181b] border border-white/15 p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Import System Folder</h3>
                  <p className="text-xs text-zinc-400">Add local storage path to index 4K movies & shows.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddFolderModalOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFolder} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                  Folder Name
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g. 4K Cinema Masters"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                  Absolute Path on Device
                </label>
                <input
                  type="text"
                  value={newFolderPath}
                  onChange={(e) => setNewFolderPath(e.target.value)}
                  placeholder="/mnt/nvme0n1/media/movies or /Volumes/T7/Cinema"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-sky-400"
                  required
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setNewFolderPath('/mnt/nvme0n1/media/movies');
                    setNewFolderName('Internal NVMe Masters');
                  }}
                  className="text-xs font-mono text-sky-400 hover:underline cursor-pointer"
                >
                  Use Default NVMe Path
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddFolderModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs shadow-md cursor-pointer"
                  >
                    Mount & Scan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. MODAL: MOUNT NETWORK SHARE (SMB / NFS) */}
      {isAddShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-[#18181b] border border-white/15 p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  <Network className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Mount Network Share</h3>
                  <p className="text-xs text-zinc-400">Connect to NAS via SMB 3.0, NFS v4, or DLNA.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddShareModalOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddShare} className="flex flex-col gap-4">
              <div className="flex gap-2">
                {(['SMB', 'NFS', 'DLNA'] as const).map((proto) => (
                  <button
                    key={proto}
                    type="button"
                    onClick={() => setShareProtocol(proto)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                      shareProtocol === proto
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                        : 'bg-white/5 hover:bg-white/10 text-zinc-400'
                    }`}
                  >
                    {proto}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                  Share Display Name
                </label>
                <input
                  type="text"
                  value={shareName}
                  onChange={(e) => setShareName(e.target.value)}
                  placeholder="e.g. TrueNAS Movies"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-400"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                  Server URI Address
                </label>
                <input
                  type="text"
                  value={shareAddress}
                  onChange={(e) => setShareAddress(e.target.value)}
                  placeholder={shareProtocol === 'SMB' ? 'smb://192.168.1.100/movies' : 'nfs://nas.local/video'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-orange-400"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddShareModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  Mount Network Share
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. MODAL: CONNECT PEER LIBRARY CODE */}
      {isConnectPeerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-[#18181b] border border-white/15 p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Connect Friend's Peer Library</h3>
                  <p className="text-xs text-zinc-400">Enter a peer invitation code to stream their library.</p>
                </div>
              </div>
              <button
                onClick={() => setIsConnectPeerModalOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConnectPeer} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                  Peer Invite Code
                </label>
                <input
                  type="text"
                  value={peerCodeInput}
                  onChange={(e) => setPeerCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. PEER-8842-MESH"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-base text-white tracking-widest font-mono text-center placeholder-zinc-600 focus:outline-none focus:border-indigo-400"
                  required
                />
              </div>

              {peerConnectStatus && (
                <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-xs text-indigo-200 font-mono flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400 animate-spin" />
                  <span>{peerConnectStatus}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConnectPeerModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  Connect Peer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
