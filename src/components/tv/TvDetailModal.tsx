import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Play, 
  Film, 
  Plus, 
  Check, 
  Users, 
  Clock, 
  ArrowLeft, 
  Award,
  Zap,
  Radio,
  Tv,
  Layers,
  Globe,
  HardDrive,
  Sparkles,
  ExternalLink,
  ListPlus,
  ChevronDown
} from 'lucide-react';
import { FeaturedMovie } from '../../lib/types';
import { UserCustomList } from './TvSearchModal';
import { fetchImdbMetadata, getActorHeadshot, enrichCastArray, CastMember } from '../../lib/imdbService';
import { getAvailableSeasons, getEpisodesForSeason, isTvSeries } from '../../lib/tvEpisodeData';
import { TvStreamSelectorModal, StreamSource } from './TvStreamSelectorModal';

interface TvDetailModalProps {
  movie: FeaturedMovie | null;
  onClose: () => void;
  onPlay: (movie: FeaturedMovie) => void;
  onPlayTrailer: (movie: FeaturedMovie) => void;
  onToggleWatchlist: (movieId: string) => void;
  onOpenWatchParty: (movie: FeaturedMovie) => void;
  isWatchlistActive?: boolean;
  userLists?: UserCustomList[];
  onToggleAddToList?: (listId: string, movieId: string) => void;
  onCreateList?: (name: string, description?: string) => void;
  onUpdateMetadata?: (id: string, updated: Partial<FeaturedMovie>) => void;
  onDeleteMovie?: (id: string) => void;
}

export const TvDetailModal: React.FC<TvDetailModalProps> = ({
  movie,
  onClose,
  onPlay,
  onPlayTrailer,
  onToggleWatchlist,
  onOpenWatchParty,
  isWatchlistActive = false,
  userLists = [],
  onToggleAddToList,
  onCreateList,
  onUpdateMetadata,
  onDeleteMovie,
}) => {
  if (!movie) return null;

  const [isListMenuOpen, setIsListMenuOpen] = useState(false);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isStreamSelectorOpen, setIsStreamSelectorOpen] = useState(false);
  const [isFetchingImdb, setIsFetchingImdb] = useState(false);
  const [currentCast, setCurrentCast] = useState<CastMember[]>(() => {
    return enrichCastArray(movie.cast || []);
  });

  // Season and Episode state
  const availableSeasons = useMemo(() => {
    return getAvailableSeasons(movie.id, movie.title);
  }, [movie.id, movie.title]);

  const [selectedSeason, setSelectedSeason] = useState<number>(() => availableSeasons[0] || 1);
  const [viewMode, setViewMode] = useState<'episodes' | 'sources'>('episodes');
  const [isSeasonMenuOpen, setIsSeasonMenuOpen] = useState(false);
  const seasonMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (seasonMenuRef.current && !seasonMenuRef.current.contains(e.target as Node)) {
        setIsSeasonMenuOpen(false);
      }
    };
    if (isSeasonMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSeasonMenuOpen]);

  useEffect(() => {
    if (availableSeasons.length > 0 && !availableSeasons.includes(selectedSeason)) {
      setSelectedSeason(availableSeasons[0]);
    }
  }, [availableSeasons, movie.id]);

  const currentEpisodes = useMemo(() => {
    return getEpisodesForSeason(movie.id, movie.title, selectedSeason, movie.bannerUrl || movie.posterUrl);
  }, [movie.id, movie.title, selectedSeason, movie.bannerUrl, movie.posterUrl]);

  // Automatically fetch metadata from IMDb once a movie or TV show is selected (including cast images)
  useEffect(() => {
    if (!movie) return;

    setCurrentCast(enrichCastArray(movie.cast || []));

    let isCancelled = false;

    const autoFetchImdb = async () => {
      setIsFetchingImdb(true);
      try {
        const isTt = movie.id?.startsWith('tt') ? movie.id : undefined;
        const meta = await fetchImdbMetadata(isTt || movie.title);

        if (isCancelled || !meta) return;

        const enrichedCast = enrichCastArray(meta.cast && meta.cast.length > 0 ? meta.cast : movie.cast || []);
        setCurrentCast(enrichedCast);

        if (onUpdateMetadata) {
          onUpdateMetadata(movie.id, {
            title: meta.title,
            releaseYear: meta.releaseYear,
            genres: meta.genres,
            posterUrl: meta.posterUrl || movie.posterUrl,
            bannerUrl: meta.bannerUrl || movie.bannerUrl,
            summary: meta.summary || movie.summary,
            director: meta.director || movie.director,
            rating: meta.rating || (meta.imdbRating ? parseFloat(meta.imdbRating.toString()) : movie.rating),
            imdbRating: meta.imdbRating || movie.rating,
            imdbVotes: meta.votes || movie.imdbVotes,
            imdbId: meta.imdbId,
            imdbUrl: meta.imdbUrl,
            certification: meta.certification || movie.certification,
            cast: enrichedCast,
            awards: meta.awards || movie.awards,
            duration: meta.duration || movie.duration,
          });
        }
      } catch (err) {
        console.warn('Failed automatic IMDb fetch for selected item:', err);
      } finally {
        if (!isCancelled) {
          setIsFetchingImdb(false);
        }
      }
    };

    autoFetchImdb();

    return () => {
      isCancelled = true;
    };
  }, [movie?.id, movie?.title]);

  // Compute all various Watch Now options along with any add-ons
  const watchNowOptions = useMemo(() => {
    if (!movie) return [];

    const options: Array<{
      id: string;
      label: string;
      details: string;
      badge: string;
      badgeColor: string;
      icon: React.ReactNode;
      isPrimary?: boolean;
      isAddon?: boolean;
    }> = [
      {
        id: 'direct-master',
        label: 'Nascent 4K Direct Master',
        details: 'HEVC Main 10 • 48.5 Mbps • Dolby Atmos 7.1 • Zero Transcode',
        badge: 'Cinema Master',
        badgeColor: 'bg-sky-500/20 text-sky-300 border border-sky-500/30',
        icon: <Play className="w-4 h-4 fill-current text-sky-400" />,
        isPrimary: true,
        isAddon: false
      }
    ];

    const mid = movie.id.toLowerCase();
    const title = movie.title.toLowerCase();

    if (mid.includes('disney') || title.includes('star wars') || title.includes('mandalorian') || title.includes('inside out') || title.includes('avengers') || title.includes('loki') || title.includes('moana') || title.includes('bluey') || title.includes('pixar') || title.includes('lion king')) {
      options.push({
        id: 'disney-plus',
        label: 'Disney+ IMAX Enhanced Stream',
        details: '4K HDR • 1.90:1 Expanded Aspect Ratio • Dolby Atmos Audio',
        badge: 'Disney+ IMAX',
        badgeColor: 'bg-blue-600/20 text-blue-300 border border-blue-500/30',
        icon: <Tv className="w-4 h-4 text-blue-400" />,
        isPrimary: false
      });
    } else if (mid.includes('prime') || title.includes('boys') || title.includes('fallout') || title.includes('reacher') || title.includes('road house') || title.includes('invincible') || title.includes('rings of power')) {
      options.push({
        id: 'amazon-prime',
        label: 'Prime Video 4K HDR10+ Stream',
        details: '4K HDR10+ • X-Ray Actor Scene Trivia & Director Insights',
        badge: 'Prime Video',
        badgeColor: 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30',
        icon: <Tv className="w-4 h-4 text-cyan-400" />,
        isPrimary: false
      });
    } else if (mid.includes('apple') || title.includes('severance') || title.includes('ted lasso') || title.includes('slow horses') || title.includes('silo') || title.includes('napoleon') || title.includes('killers of the flower moon')) {
      options.push({
        id: 'apple-tv',
        label: 'Apple TV+ Master 4K Stream',
        details: '4K Dolby Vision • Lossless Spatial Audio & Dynamic Ambilight',
        badge: 'Apple TV+',
        badgeColor: 'bg-zinc-600/30 text-zinc-200 border border-zinc-500/30',
        icon: <Tv className="w-4 h-4 text-zinc-300" />,
        isPrimary: false
      });
    } else if (title.includes('shogun') || title.includes('the bear') || title.includes('fargo') || title.includes('deadpool') || title.includes('poor things')) {
      options.push({
        id: 'hulu-official',
        label: 'Hulu UHD Master Stream',
        details: '4K UHD • 5.1 Surround Sound • Official Network Cloud',
        badge: 'Hulu UHD',
        badgeColor: 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30',
        icon: <Tv className="w-4 h-4 text-emerald-400" />,
        isPrimary: false
      });
    } else if (title.includes('dune') || title.includes('last of us') || title.includes('civil war') || title.includes('oppenheimer') || title.includes('succession') || title.includes('house of the dragon')) {
      options.push({
        id: 'hbo-max',
        label: 'HBO Max Premiere Stream',
        details: '4K UHD • Dolby Atmos • IMAX Enhanced Home Master',
        badge: 'HBO Max',
        badgeColor: 'bg-purple-600/20 text-purple-300 border border-purple-500/30',
        icon: <Tv className="w-4 h-4 text-purple-400" />,
        isPrimary: false
      });
    } else {
      options.push({
        id: 'netflix-official',
        label: 'Netflix 4K Dolby Vision',
        details: '4K Ultra HD • Spatial Audio • Official Cloud Stream',
        badge: 'Netflix 4K',
        badgeColor: 'bg-red-600/20 text-red-300 border border-red-500/30',
        icon: <Tv className="w-4 h-4 text-red-400" />,
        isPrimary: false
      });
    }

    // Community Add-ons & Alternative Streams
    options.push({
      id: 'addon-torrentio',
      label: '[Torrentio Add-on] 4K HDR Remux Stream',
      details: 'YTS / 1337x P2P Cache • 18.4 GB • 214 Active Seeders (Zero Buffer)',
      badge: 'Add-on: Torrentio',
      badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
      icon: <Zap className="w-4 h-4 text-purple-400" />,
      isAddon: true
    });

    options.push({
      id: 'addon-mesh-peer',
      label: "[Mesh P2P Add-on] Steven's 4K Vault Shared Node",
      details: 'Direct LAN Peer Mesh • 98 Mbps Gigabit Link • Lossless Audio Pass',
      badge: 'Add-on: P2P Mesh',
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      icon: <Radio className="w-4 h-4 text-amber-400" />,
      isAddon: true
    });

    options.push({
      id: 'addon-cinemeta',
      label: '[Cinemeta Add-on] WebSeed CDN Fast Stream',
      details: 'Decentralized Web CDN Stream • 1080p 60FPS • Fast Start',
      badge: 'Add-on: Cinemeta',
      badgeColor: 'bg-teal-500/20 text-teal-300 border border-teal-500/30',
      icon: <Globe className="w-4 h-4 text-teal-400" />,
      isAddon: true
    });

    options.push({
      id: 'addon-mali-gpu',
      label: '[Mali GPU Add-on] 1080p Adaptive ABR Transcode',
      details: 'Hardware Transcode Bus • Optimized for Low-Bandwidth Streaming',
      badge: 'Add-on: Transcode',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      icon: <HardDrive className="w-4 h-4 text-emerald-400" />,
      isAddon: true
    });

    return options;
  }, [movie]);

  const backdropImage = movie.bannerUrl || movie.posterUrl;
  const ratingValue = movie.imdbRating || movie.rating || "8.5";
  const certification = movie.certification || "PG-13";
  const durationText = movie.duration ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m` : "2h 18m";

  return (
    <div className="fixed inset-0 z-50 bg-[#131313]/95 backdrop-blur-3xl overflow-y-auto no-scrollbar select-none animate-in fade-in duration-300">
      {/* Background Banner with Heavy Gradient Overlays */}
      <div className="absolute top-0 inset-x-0 h-[500px] overflow-hidden pointer-events-none">
        <img
          src={backdropImage}
          alt={movie.title}
          className="w-full h-full object-cover object-top opacity-35 filter blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-[#131313]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#131313] via-[#131313]/90 to-transparent" />
      </div>

      {/* Top Header Bar */}
      <div className="relative z-10 px-8 lg:px-14 pt-8 flex items-center justify-between">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-sm border border-white/15 focus:ring-2 focus:ring-sky-400 focus:outline-none transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-sky-400" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2.5">
          {/* Add to List button */}
          <div className="relative">
            <button
              onClick={() => setIsListMenuOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-zinc-200 text-xs border border-white/15 transition-all cursor-pointer focus:ring-2 focus:ring-sky-400 focus:outline-none"
            >
              <ListPlus className="w-3.5 h-3.5 text-sky-400" />
              <span>Add to List</span>
            </button>

            {/* Dropdown Menu for Custom Lists */}
            {isListMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 p-3.5 rounded-2xl bg-[#1a1a1a]/95 backdrop-blur-2xl border border-white/15 shadow-2xl z-50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Save to List</span>
                  <button
                    type="button"
                    onClick={() => setIsCreatingList((prev) => !prev)}
                    className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>New List</span>
                  </button>
                </div>

                {isCreatingList && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newListName.trim()) return;
                      if (onCreateList) onCreateList(newListName.trim());
                      setNewListName('');
                      setIsCreatingList(false);
                    }}
                    className="mb-2.5 space-y-1.5"
                  >
                    <input
                      type="text"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      placeholder="New list name..."
                      className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/20 text-xs text-white focus:outline-none focus:border-sky-400"
                      autoFocus
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsCreatingList(false)}
                        className="text-[10px] text-zinc-400 px-2 py-0.5"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!newListName.trim()}
                        className="px-2.5 py-0.5 rounded-md bg-sky-500 text-black font-bold text-[10px]"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-1 max-h-56 overflow-y-auto no-scrollbar">
                  {userLists && userLists.length > 0 ? (
                    userLists.map((list) => {
                      const isMember = list.movieIds.includes(movie.id);
                      return (
                        <button
                          key={list.id}
                          type="button"
                          onClick={() => {
                            if (onToggleAddToList) {
                              onToggleAddToList(list.id, movie.id);
                            }
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                            isMember
                              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                              : 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/5'
                          }`}
                        >
                          <span className="truncate">{list.name}</span>
                          {isMember ? (
                            <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          ) : (
                            <Plus className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-center py-2 text-xs text-zinc-500">
                      No custom lists yet. Create one above!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-8 lg:px-14 py-8 flex flex-col md:flex-row gap-10">
        {/* Left Column: Poster Artwork */}
        <div className="flex-shrink-0 w-64 lg:w-72">
          <div className="aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 bg-zinc-900 ring-4 ring-sky-500/20">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right Column: Title, Metadata, Plot, Cast & Actions */}
        <div className="flex-1 flex flex-col justify-start">

          {/* Metadata badges strip */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-300 mb-3">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="bg-[#f5c518] text-black text-[10px] px-1.5 py-0.5 rounded-sm font-black tracking-tight font-mono shadow-sm">IMDb</span>
              <span className="text-amber-400 font-bold">{ratingValue}</span>
              {movie.imdbVotes && <span className="text-zinc-400 text-xs font-mono">({movie.imdbVotes} votes)</span>}
            </span>
            <span className="text-zinc-600 font-bold">·</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 border border-white/20">
              {certification}
            </span>
            <span className="text-zinc-600 font-bold">·</span>
            <span>{movie.releaseYear}</span>
            <span className="text-zinc-600 font-bold">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>{durationText}</span>
            </span>
          </div>

          {/* Awards Banner if present */}
          {movie.awards && (
            <div className="mb-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs max-w-xl">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-medium line-clamp-1">{movie.awards}</span>
            </div>
          )}

          {/* Title */}
          <h1 className="font-display font-black text-4xl lg:text-5xl text-white tracking-tight mb-3">
            {movie.title}
          </h1>

          {/* Genres */}
          <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-sky-400">
            {(movie.genres || ['Cinema', 'Feature']).map((genre, idx) => (
              <React.Fragment key={genre}>
                <span>{genre}</span>
                {idx < (movie.genres || []).length - 1 && <span className="text-zinc-600">·</span>}
              </React.Fragment>
            ))}
            {movie.director && (
              <>
                <span className="text-zinc-600">·</span>
                <span className="text-zinc-400">Directed by {movie.director}</span>
              </>
            )}
          </div>

          {/* Action Buttons - All Pill Shaped */}
          <div className="flex flex-wrap items-center gap-3.5 my-5">
            {/* Watch Now button triggers Stremio/Nuvio streaming platforms list */}
            <button
              onClick={() => {
                setIsStreamSelectorOpen(true);
              }}
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-white hover:bg-sky-400 text-black font-extrabold text-sm shadow-xl transition-all transform hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>Watch Now</span>
            </button>

            <button
              onClick={() => {
                onPlayTrailer(movie);
                onClose();
              }}
              className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-all transform hover:scale-105"
            >
              <Film className="w-4 h-4 text-sky-400" />
              <span>Trailer</span>
            </button>

            <button
              onClick={() => onToggleWatchlist(movie.id)}
              className={`flex items-center gap-2 px-6 py-3.5 rounded-full font-semibold text-sm border transition-all transform hover:scale-105 ${
                isWatchlistActive
                  ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
            >
              {isWatchlistActive ? (
                <>
                  <Check className="w-4 h-4 text-sky-400" />
                  <span>In Watchlist</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-zinc-300" />
                  <span>Watchlist</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                onOpenWatchParty(movie);
                onClose();
              }}
              className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-all transform hover:scale-105"
            >
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Watch Party</span>
            </button>
          </div>

          {/* Season and Episode List Component */}
          <div className="my-4 p-5 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
            {/* Header with Season Selector Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4 text-sky-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Seasons & Episodes
                  </h3>
                </div>

                {/* Season Menu Picker */}
                <div ref={seasonMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsSeasonMenuOpen((prev) => !prev)}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 border border-white/15 hover:border-sky-400 text-xs font-semibold text-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer"
                    aria-haspopup="listbox"
                    aria-expanded={isSeasonMenuOpen}
                    title="Select Season"
                  >
                    <span className="text-sky-400 font-mono">S{selectedSeason}</span>
                    <span>Season {selectedSeason}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${isSeasonMenuOpen ? 'rotate-180 text-sky-400' : ''}`} />
                  </button>

                  {/* Dropdown Menu Picker Popover */}
                  {isSeasonMenuOpen && (
                    <div className="absolute left-0 top-full mt-1.5 w-48 p-1.5 rounded-2xl bg-[#18181b]/98 backdrop-blur-2xl border border-white/20 shadow-2xl z-40 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-2.5 py-1 mb-1 border-b border-white/10 text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                        Select Season
                      </div>
                      <div className="space-y-0.5 max-h-56 overflow-y-auto no-scrollbar">
                        {availableSeasons.map((seasonNum) => {
                          const isSelected = selectedSeason === seasonNum;
                          const epCount = getEpisodesForSeason(movie.id, movie.title, seasonNum, movie.bannerUrl || movie.posterUrl).length;

                          return (
                            <button
                              key={seasonNum}
                              type="button"
                              onClick={() => {
                                setSelectedSeason(seasonNum);
                                setViewMode('episodes');
                                setIsSeasonMenuOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                                isSelected
                                  ? 'bg-sky-500 text-black font-bold shadow-md shadow-sky-500/20'
                                  : 'text-zinc-300 hover:text-white hover:bg-white/10'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={isSelected ? 'text-black font-bold' : 'text-sky-400 font-mono'}>
                                  S{seasonNum}
                                </span>
                                <span>Season {seasonNum}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[10px] font-mono ${isSelected ? 'text-black/80' : 'text-zinc-500'}`}>
                                  {epCount} eps
                                </span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-black stroke-[2.5]" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Info / Source View Toggle */}
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-mono text-zinc-400">
                  {currentEpisodes.length} Episodes
                </span>
                <button
                  type="button"
                  onClick={() => setViewMode((prev) => (prev === 'episodes' ? 'sources' : 'episodes'))}
                  className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-zinc-300 font-medium transition-all cursor-pointer"
                >
                  {viewMode === 'episodes' ? 'View Sources' : 'View Episodes'}
                </button>
              </div>
            </div>

            {viewMode === 'episodes' ? (
              /* Episode List Rail / Cards */
              <div className="space-y-3 max-h-[380px] overflow-y-auto no-scrollbar pr-1">
                {currentEpisodes.map((ep) => (
                  <div
                    key={ep.id}
                    className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 rounded-2xl bg-white/5 hover:bg-white/[0.08] border border-white/10 transition-all"
                  >
                    {/* Episode Thumbnail - Select to Play */}
                    <button
                      type="button"
                      onClick={() => {
                        onPlay({
                          ...movie,
                          title: `${movie.title} • S${selectedSeason}:E${ep.episodeNumber} "${ep.title}"`,
                          duration: parseInt(ep.duration) || movie.duration
                        });
                        onClose();
                      }}
                      className="group/thumb relative w-full sm:w-44 aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-sky-400 shrink-0 shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all text-left"
                      title={`Play S${selectedSeason}:E${ep.episodeNumber} - ${ep.title}`}
                      aria-label={`Play S${selectedSeason}:E${ep.episodeNumber} - ${ep.title}`}
                    >
                      <img
                        src={ep.thumbnailUrl || movie.bannerUrl || movie.posterUrl}
                        alt={ep.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover/thumb:scale-105 group-hover/thumb:brightness-110 transition-all"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = movie.posterUrl;
                        }}
                      />
                      <div className="absolute inset-0 bg-black/35 group-hover/thumb:bg-black/10 transition-colors flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-sky-400 text-black flex items-center justify-center opacity-90 group-hover/thumb:opacity-100 group-hover/thumb:scale-110 shadow-xl transition-all">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                      </div>
                      {/* Episode Number badge */}
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-sky-400 font-mono text-[10px] font-bold border border-white/15">
                        EP {ep.episodeNumber}
                      </span>
                      {/* Duration */}
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-white text-[10px] font-mono">
                        {ep.duration}
                      </span>
                    </button>

                    {/* Episode Meta & Summary */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-1">
                          {ep.episodeNumber}. {ep.title}
                        </span>
                        {ep.airDate && (
                          <span className="text-[11px] text-zinc-500 font-mono">
                            • {ep.airDate}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                        {ep.synopsis}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Sources Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {watchNowOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      onPlay(movie);
                      onClose();
                    }}
                    className="group flex items-start gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-sky-400/50 transition-all text-left focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer"
                  >
                    <div className="mt-0.5 p-2 rounded-xl bg-black/40 border border-white/10 group-hover:scale-110 transition-transform shrink-0">
                      {opt.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        <span className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors truncate">
                          {opt.label}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${opt.badgeColor}`}>
                          {opt.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-snug line-clamp-1">
                        {opt.details}
                      </p>
                    </div>
                    <Play className="w-3.5 h-3.5 text-zinc-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Synopsis */}
          <div className="my-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Synopsis
            </h3>
            <p className="text-sm md:text-base text-zinc-300 leading-relaxed max-w-2xl">
              {movie.summary || "In this cinematic masterpiece, dramatic forces collide as characters navigate an extraordinary story of ambition, destiny, and resilience. Streamed in pristine 4K master quality with Nascent Player hardware acceleration."}
            </p>
          </div>

          {/* Cast Gallery with Large Headshots */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Starring Cast & Crew
              </h3>
            </div>

            <div className="flex items-start gap-4 overflow-x-auto no-scrollbar pb-3">
              {currentCast && currentCast.length > 0 ? (
                currentCast.map((c, idx) => {
                  const name = typeof c === 'string' ? c : c.name;
                  const role = typeof c === 'object' && c.role ? c.role : null;
                  const photo = typeof c === 'object' ? c.photoUrl : undefined;
                  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2);

                  return (
                    <div
                      key={idx}
                      className="group flex flex-col items-center text-center p-2.5 rounded-2xl hover:bg-white/5 transition-all w-28 shrink-0 cursor-default"
                    >
                      {photo ? (
                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/20 group-hover:border-sky-400 group-hover:scale-105 transition-all shadow-xl bg-zinc-800 mb-2.5">
                          <img
                            src={photo}
                            alt={name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center shrink-0 border-2 border-white/20 group-hover:border-sky-400 group-hover:scale-105 transition-all shadow-xl mb-2.5">
                          {initials}
                        </div>
                      )}
                      <span className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-1 w-full">
                        {name}
                      </span>
                      {role && (
                        <span className="text-[10px] text-zinc-400 line-clamp-2 w-full mt-0.5 leading-tight">
                          {role}
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-zinc-400 italic">
                  Leading ensemble cast and original cinema crew.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stremio & Nuvio Streaming Platforms & Providers Modal */}
      {isStreamSelectorOpen && (
        <TvStreamSelectorModal
          movie={movie}
          isOpen={isStreamSelectorOpen}
          onClose={() => setIsStreamSelectorOpen(false)}
          onSelectStream={(m, stream) => {
            setIsStreamSelectorOpen(false);
            onPlay({
              ...m,
              title: `${m.title} • [${stream.provider}]`
            });
            onClose();
          }}
        />
      )}
    </div>
  );
};
