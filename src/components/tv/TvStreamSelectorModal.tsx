import React, { useState, useMemo, useEffect } from 'react';
import { 
  Play, 
  X, 
  Tv, 
  Film, 
  Zap, 
  Radio, 
  HardDrive, 
  Globe, 
  Sparkles, 
  ShieldCheck, 
  Wifi, 
  Check, 
  Layers, 
  Flame,
  ArrowRight,
  Puzzle,
  Lock
} from 'lucide-react';
import { FeaturedMovie } from '../../lib/types';
import { TRENDING_PLATFORMS } from '../../App';
import { globalPluginEngine } from '../../lib/plugins/pluginEngine';

export interface StreamSource {
  id: string;
  provider: string;
  type: 'official' | 'debrid' | 'addon' | 'p2p';
  title: string;
  quality: '4K REMUX' | '4K UHD' | '4K HDR' | '1080p' | '720p' | 'Audio Only';
  resolution: string;
  audio: string;
  size?: string;
  bitrate: string;
  health: string;
  badge: string;
  badgeColor: string;
  iconType: 'netflix' | 'disney' | 'prime' | 'apple' | 'hbo' | 'hulu' | 'torrentio' | 'debrid' | 'mesh' | 'cinemeta' | 'addon';
  isRecommended?: boolean;
}

interface TvStreamSelectorModalProps {
  movie: FeaturedMovie | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectStream: (movie: FeaturedMovie, stream: StreamSource) => void;
}

export const TvStreamSelectorModal: React.FC<TvStreamSelectorModalProps> = ({
  movie,
  isOpen,
  onClose,
  onSelectStream,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'official' | 'debrid' | 'p2p'>('all');
  const [pluginStreams, setPluginStreams] = useState<StreamSource[]>([]);

  useEffect(() => {
    if (!isOpen || !movie) {
      setPluginStreams([]);
      return;
    }

    let isMounted = true;
    const mediaType = (movie as any).isSeries || (movie as any).type === 'series' ? 'series' : 'movie';
    const mediaId = movie.id?.startsWith('tt') ? movie.id : `tt${movie.id?.replace(/[^0-9]/g, '').padEnd(7, '1') || '1375666'}`;

    globalPluginEngine.queryStreams(mediaType, mediaId)
      .then((items) => {
        if (!isMounted) return;
        const converted: StreamSource[] = items.map((item, idx) => ({
          id: `plugin-${item.sourceAddonId || 'addon'}-${idx}`,
          provider: item.sourceAddonName || 'Community Addon',
          type: item.infoHash ? 'p2p' : 'addon',
          title: item.title || item.name,
          quality: item.quality || '4K UHD',
          resolution: item.resolution || '2160p HEVC',
          audio: item.audio || 'Dolby Digital 5.1',
          size: item.size || '32.0 GB',
          bitrate: '45.0 Mbps',
          health: item.seeds ? `⚡ ${item.seeds} P2P Seeders` : '⚡ Fast CDN Direct',
          badge: item.sourceAddonName?.split(' ')[0] || 'Community',
          badgeColor: 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/40',
          iconType: 'addon',
          isRecommended: idx === 0
        }));
        setPluginStreams(converted);
      })
      .catch((err) => {
        console.warn('[TvStreamSelectorModal] Error fetching plugin streams', err);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, movie]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Compute all available platforms and streams for this specific movie or show
  const availableStreams = useMemo<StreamSource[]>(() => {
    if (!movie) return [];

    const mid = movie.id?.toLowerCase() || '';
    const title = movie.title?.toLowerCase() || '';

    // Check registered trending platforms dictionary
    const registered = TRENDING_PLATFORMS[movie.id]?.platforms || [];

    const streams: StreamSource[] = [];

    // 1. Direct 4K Master (Nascent Core)
    streams.push({
      id: 'nascent-master',
      provider: 'Nascent Core',
      type: 'official',
      title: `${movie.title} • Direct 4K Cinema Master`,
      quality: '4K REMUX',
      resolution: '3840x2160 • HEVC 10-bit',
      audio: 'Dolby Atmos 7.1 TrueHD',
      size: '28.4 GB',
      bitrate: '52.4 Mbps',
      health: 'Direct NVMe SSD / Zero Transcode',
      badge: 'Cinema Master',
      badgeColor: 'bg-sky-500/20 text-sky-300 border border-sky-500/40',
      iconType: 'mesh',
      isRecommended: true
    });

    // 2. Official Platform Streams based on movie/show catalogue
    if (registered.includes('Netflix') || title.includes('stranger') || title.includes('squid') || title.includes('spider') || title.includes('irishman') || title.includes('babygirl') || title.includes('uncut')) {
      streams.push({
        id: 'netflix-official',
        provider: 'Netflix',
        type: 'official',
        title: 'Netflix Official 4K Dolby Vision',
        quality: '4K UHD',
        resolution: '2160p • Dolby Vision • HDR10',
        audio: 'Dolby Atmos Spatial Audio',
        size: 'Cloud Stream',
        bitrate: '24.8 Mbps',
        health: 'Official Cloud CDN (Ultra HD)',
        badge: 'Netflix 4K',
        badgeColor: 'bg-red-600/25 text-red-300 border border-red-500/40',
        iconType: 'netflix',
        isRecommended: true
      });
    }

    if (registered.includes('Apple TV+') || registered.includes('Apple TV') || title.includes('severance') || title.includes('ted lasso') || title.includes('slow horses') || title.includes('silo') || title.includes('napoleon') || title.includes('past lives')) {
      streams.push({
        id: 'apple-official',
        provider: 'Apple TV+',
        type: 'official',
        title: 'Apple TV+ Master Stream',
        quality: '4K REMUX',
        resolution: '2160p • Lossless Apple ProRes Dynamic',
        audio: 'Dolby Atmos 7.1 Lossless',
        size: 'Cloud Stream',
        bitrate: '41.2 Mbps',
        health: 'Highest Bitrate Official Stream',
        badge: 'Apple TV+ 4K',
        badgeColor: 'bg-zinc-600/30 text-zinc-100 border border-zinc-500/40',
        iconType: 'apple',
        isRecommended: true
      });
    }

    if (registered.includes('Disney+') || title.includes('mandalorian') || title.includes('loki') || title.includes('star wars') || title.includes('inside out') || title.includes('andor') || title.includes('x-men') || title.includes('moana') || title.includes('ahsoka')) {
      streams.push({
        id: 'disney-official',
        provider: 'Disney+',
        type: 'official',
        title: 'Disney+ IMAX Enhanced Stream',
        quality: '4K UHD',
        resolution: '1.90:1 Expanded IMAX Aspect Ratio',
        audio: 'IMAX Enhanced DTS:X / Atmos',
        size: 'Cloud Stream',
        bitrate: '30.5 Mbps',
        health: 'Official Disney+ Master Stream',
        badge: 'Disney+ IMAX',
        badgeColor: 'bg-blue-600/25 text-blue-300 border border-blue-500/40',
        iconType: 'disney'
      });
    }

    if (registered.includes('HBO Max') || title.includes('dune') || title.includes('last of us') || title.includes('house of the dragon') || title.includes('succession') || title.includes('white lotus') || title.includes('civil war')) {
      streams.push({
        id: 'hbo-official',
        provider: 'HBO Max',
        type: 'official',
        title: 'HBO Max Premiere Stream',
        quality: '4K UHD',
        resolution: '2160p • Dolby Vision HDR',
        audio: 'Dolby Atmos 5.1 Surround',
        size: 'Cloud Stream',
        bitrate: '28.0 Mbps',
        health: 'Official Max Global CDN',
        badge: 'HBO Max',
        badgeColor: 'bg-purple-600/25 text-purple-300 border border-purple-500/40',
        iconType: 'hbo'
      });
    }

    if (registered.includes('Hulu') || title.includes('shogun') || title.includes('the bear') || title.includes('fargo') || title.includes('deadpool') || title.includes('poor things')) {
      streams.push({
        id: 'hulu-official',
        provider: 'Hulu',
        type: 'official',
        title: 'Hulu UHD Master Stream',
        quality: '4K UHD',
        resolution: '2160p • HDR10 Color Grading',
        audio: '5.1 Studio Surround',
        size: 'Cloud Stream',
        bitrate: '22.0 Mbps',
        health: 'Official Hulu Network Stream',
        badge: 'Hulu UHD',
        badgeColor: 'bg-emerald-600/25 text-emerald-300 border border-emerald-500/40',
        iconType: 'hulu'
      });
    }

    if (registered.includes('Prime Video') || title.includes('boys') || title.includes('fallout') || title.includes('reacher') || title.includes('rings of power') || title.includes('invincible')) {
      streams.push({
        id: 'prime-official',
        provider: 'Prime Video',
        type: 'official',
        title: 'Prime Video 4K HDR10+ Stream',
        quality: '4K UHD',
        resolution: '2160p • HDR10+ • X-Ray Actor Scene Trivia',
        audio: 'Dolby Atmos 5.1',
        size: 'Cloud Stream',
        bitrate: '26.4 Mbps',
        health: 'Official Amazon Web CDN',
        badge: 'Prime Video',
        badgeColor: 'bg-cyan-600/25 text-cyan-300 border border-cyan-500/40',
        iconType: 'prime'
      });
    }

    // Default official platform if none matched explicitly
    if (streams.length === 1) {
      streams.push({
        id: 'netflix-fallback',
        provider: 'Netflix',
        type: 'official',
        title: 'Netflix 4K Ultra HD Stream',
        quality: '4K UHD',
        resolution: '2160p • Dolby Vision • Spatial Audio',
        audio: 'Dolby Atmos 5.1',
        size: 'Cloud Stream',
        bitrate: '24.5 Mbps',
        health: 'Official Global CDN',
        badge: 'Netflix 4K',
        badgeColor: 'bg-red-600/25 text-red-300 border border-red-500/40',
        iconType: 'netflix'
      });
    }

    // 3. Stremio / Nuvio Debrid Providers ([RD+] Torrentio, RealDebrid, CyberFlix)
    streams.push({
      id: 'torrentio-rd-4k',
      provider: 'Torrentio [RD+]',
      type: 'debrid',
      title: `${movie.title} • 2160p HDR10+ REMUX HEVC`,
      quality: '4K REMUX',
      resolution: '4K HDR10+ • HEVC Main 10',
      audio: 'Dolby TrueHD Atmos 7.1',
      size: '22.8 GB',
      bitrate: '58.2 Mbps',
      health: '⚡ Instant RealDebrid Cloud Cache (436 Seeders)',
      badge: 'Torrentio RD+',
      badgeColor: 'bg-purple-500/25 text-purple-300 border border-purple-500/40',
      iconType: 'torrentio',
      isRecommended: true
    });

    streams.push({
      id: 'torrentio-rd-1080p',
      provider: 'Torrentio [RD+]',
      type: 'debrid',
      title: `${movie.title} • 1080p BluRay Remux AVC`,
      quality: '1080p',
      resolution: '1080p Full HD • Lossless AVC',
      audio: 'DTS-HD MA 5.1',
      size: '12.4 GB',
      bitrate: '18.5 Mbps',
      health: '⚡ Instant RealDebrid Cloud Cache (512 Seeders)',
      badge: 'Torrentio RD+',
      badgeColor: 'bg-purple-500/25 text-purple-300 border border-purple-500/40',
      iconType: 'torrentio'
    });

    streams.push({
      id: 'realdebrid-fast-cdn',
      provider: 'RealDebrid CDN',
      type: 'debrid',
      title: `${movie.title} • High-Speed Web-DL Multi-Audio`,
      quality: '4K HDR',
      resolution: '2160p Web-DL • HDR10 • English + Spanish Subtitles',
      audio: 'E-AC-3 JOC Atmos',
      size: '14.2 GB',
      bitrate: '28.0 Mbps',
      health: '⚡ Zero Buffering High-Speed CDN Node',
      badge: 'RealDebrid Ultra',
      badgeColor: 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40',
      iconType: 'debrid'
    });

    // 4. Community Add-ons & P2P Mesh
    streams.push({
      id: 'mesh-peer-vault',
      provider: "Steven's 4K Vault",
      type: 'p2p',
      title: "Steven's 4K Vault • Local NVMe Peer Mesh",
      quality: '4K REMUX',
      resolution: '4K Direct Master • Zero Transcode Pass',
      audio: 'Lossless Audio Passthrough',
      size: 'Direct Play',
      bitrate: '98.0 Mbps',
      health: '🟢 Local LAN Peer Mesh • 12ms Low Latency',
      badge: 'P2P Mesh',
      badgeColor: 'bg-amber-500/25 text-amber-300 border border-amber-500/40',
      iconType: 'mesh'
    });

    streams.push({
      id: 'cinemeta-webseed',
      provider: 'Cinemeta CDN',
      type: 'addon',
      title: 'Cinemeta WebSeed Fast Stream (1080p 60FPS)',
      quality: '1080p',
      resolution: '1080p Adaptive • Multi-Subtitles',
      audio: 'AAC Stereo 320kbps',
      size: '4.8 GB',
      bitrate: '12.0 Mbps',
      health: '⚡ WebSeed Fast Start CDN (32 Seeds)',
      badge: 'Cinemeta',
      badgeColor: 'bg-teal-500/25 text-teal-300 border border-teal-500/40',
      iconType: 'cinemeta'
    });

    return streams;
  }, [movie]);

  const allStreams = useMemo(() => {
    return [...availableStreams, ...pluginStreams];
  }, [availableStreams, pluginStreams]);

  const filteredStreams = useMemo(() => {
    if (selectedCategory === 'all') return allStreams;
    if (selectedCategory === 'official') return allStreams.filter((s) => s.type === 'official');
    if (selectedCategory === 'debrid') return allStreams.filter((s) => s.type === 'debrid');
    if (selectedCategory === 'p2p') return allStreams.filter((s) => s.type === 'p2p' || s.type === 'addon');
    return allStreams;
  }, [allStreams, selectedCategory]);

  if (!isOpen || !movie) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#07060b]/96 backdrop-blur-3xl flex items-center justify-center p-4 sm:p-6 lg:p-10 select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0c0c11] border border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header Strip with Title Preview */}
        <div className="p-6 border-b border-white/10 flex items-start justify-between gap-4 bg-gradient-to-r from-white/[0.04] to-transparent">
          <div className="flex items-center gap-4 min-w-0">
            {/* Poster Thumbnail */}
            <div className="w-14 sm:w-16 aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border border-white/15 shrink-0 shadow-lg">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Stremio & Community Stream Providers
                </span>
                <span className="text-zinc-500 text-xs">•</span>
                <span className="text-xs text-zinc-400 font-mono">{movie.releaseYear}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white truncate">
                {movie.title}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                Select your preferred streaming provider, platform, or 4K debrid cache to start watching.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400 shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Category Tabs */}
        <div className="px-6 py-3 border-b border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar bg-black/30">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-sky-400 text-black font-bold shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10'
            }`}
          >
            All Sources ({allStreams.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('official')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'official'
                ? 'bg-sky-400 text-black font-bold shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10'
            }`}
          >
            Official Platforms
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('debrid')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'debrid'
                ? 'bg-sky-400 text-black font-bold shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10'
            }`}
          >
            RealDebrid & 4K Remux
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('p2p')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'p2p'
                ? 'bg-sky-400 text-black font-bold shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10'
            }`}
          >
            Community Addons & P2P
          </button>
        </div>

        {/* Stream Source List */}
        <div className="p-6 overflow-y-auto no-scrollbar space-y-3 flex-1">
          {filteredStreams.map((stream) => {
            // The community-addons paywall was removed: it was client-side
            // only (a localStorage flag with hardcoded voucher codes) and
            // gated no real payment. All streams are selectable.
            const isLocked = false;

            const handleClick = () => {
              onSelectStream(movie, stream);
            };

            return (
              <div
                key={stream.id}
                onClick={handleClick}
                className={`group p-4 rounded-2xl transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 focus:outline-none focus:ring-2 focus:ring-sky-400 ${
                  isLocked 
                    ? 'bg-gradient-to-r from-pink-950/20 via-white/[0.03] to-purple-950/20 hover:bg-white/[0.08] border border-pink-500/30 hover:border-pink-400/60' 
                    : 'bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-sky-400/60'
                }`}
                tabIndex={0}
              >
                {/* Left Details */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div className="p-3 rounded-xl bg-black/60 border border-white/10 group-hover:scale-105 group-hover:border-sky-400/40 transition-all shrink-0">
                    {stream.iconType === 'netflix' && <Tv className="w-5 h-5 text-red-400" />}
                    {stream.iconType === 'disney' && <Tv className="w-5 h-5 text-blue-400" />}
                    {stream.iconType === 'apple' && <Tv className="w-5 h-5 text-zinc-200" />}
                    {stream.iconType === 'prime' && <Tv className="w-5 h-5 text-cyan-400" />}
                    {stream.iconType === 'hbo' && <Tv className="w-5 h-5 text-purple-400" />}
                    {stream.iconType === 'hulu' && <Tv className="w-5 h-5 text-emerald-400" />}
                    {stream.iconType === 'torrentio' && <Zap className="w-5 h-5 text-purple-400" />}
                    {stream.iconType === 'debrid' && <Sparkles className="w-5 h-5 text-emerald-400" />}
                    {stream.iconType === 'mesh' && <Radio className="w-5 h-5 text-amber-400" />}
                    {stream.iconType === 'cinemeta' && <Globe className="w-5 h-5 text-teal-400" />}
                    {stream.iconType === 'addon' && <Puzzle className="w-5 h-5 text-indigo-400" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-display font-bold text-sm text-white group-hover:text-sky-300 transition-colors">
                        {stream.provider}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${stream.badgeColor}`}>
                        {stream.badge}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-white font-mono font-bold">
                        {stream.quality}
                      </span>
                      {isLocked && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/35 font-bold flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5 text-amber-300" />
                          VIP Pass
                        </span>
                      )}
                      {stream.isRecommended && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1">
                          <Flame className="w-2.5 h-2.5 text-amber-400" />
                          Best Quality
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-300 line-clamp-1 font-medium">
                      {stream.title}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap text-[11px] text-zinc-400 mt-1 font-mono">
                      <span>{stream.resolution}</span>
                      <span>•</span>
                      <span className="text-zinc-300">{stream.audio}</span>
                      <span>•</span>
                      <span className="text-sky-400">{stream.bitrate}</span>
                      {stream.size && (
                        <>
                          <span>•</span>
                          <span>{stream.size}</span>
                        </>
                      )}
                    </div>

                    <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
                      <span>{stream.health}</span>
                    </div>
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {isLocked ? (
                    <button
                      type="button"
                      className="flex items-center gap-2.5 px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-pink-500 to-amber-400 text-black font-bold text-xs sm:text-sm tracking-wide shadow-xl shadow-black/50 transition-all pointer-events-none active:scale-95"
                    >
                      <Lock className="w-4 h-4 fill-current ml-0.5" />
                      <span>Unlock VIP</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="flex items-center gap-2.5 px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-white group-hover:bg-zinc-200 text-black font-bold text-xs sm:text-sm tracking-wide shadow-xl shadow-black/50 transition-all pointer-events-none active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-black text-black ml-0.5" />
                      <span>Play Stream</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
