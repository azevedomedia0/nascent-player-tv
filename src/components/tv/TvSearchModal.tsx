import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  X, 
  Film, 
  ArrowLeft, 
  Bookmark, 
  ListPlus, 
  FolderPlus, 
  Sparkles, 
  Play, 
  Star,
  Check,
  ChevronDown,
  HardDrive,
  Mic,
  MicOff,
  Volume2,
  Radio,
  AlertCircle
} from 'lucide-react';
import { FeaturedMovie } from '../../lib/types';
import { AppLogo } from '../AppLogo';
import { LOCAL_MEDIA_FILES, SHARED_PEER_LIBRARIES } from '../../lib/tvMediaData';

export interface UserCustomList {
  id: string;
  name: string;
  description?: string;
  movieIds: string[];
  createdAt: string;
}

interface TvSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  movies: FeaturedMovie[];
  onSelectMovie: (movie: FeaturedMovie) => void;
  watchlist?: FeaturedMovie[];
  userLists?: UserCustomList[];
  onCreateList?: (name: string, description?: string) => void;
  onRemoveFromList?: (listId: string, movieId: string) => void;
  initialVoiceActive?: boolean;
}

export type MediaTypeFilter = 'All' | 'Movie' | 'TV Show';
export type SortOption = 'Popular' | 'Top Rated' | 'Newest' | 'Title A-Z';
export type PlatformFilter = 
  | 'All Platforms'
  | 'Netflix'
  | 'Disney+'
  | 'Prime Video'
  | 'Apple TV+'
  | 'HBO Max'
  | 'Hulu'
  | 'Paramount+'
  | 'Peacock';

export const TvSearchModal: React.FC<TvSearchModalProps> = ({
  isOpen,
  onClose,
  movies,
  onSelectMovie,
  watchlist = [],
  userLists = [],
  onCreateList,
  onRemoveFromList,
  initialVoiceActive = false,
}) => {
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState<MediaTypeFilter>('Movie');
  const [selectedSort, setSelectedSort] = useState<SortOption>('Popular');
  const [selectedGenre, setSelectedGenre] = useState<string>('All Genres');
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformFilter>('All Platforms');
  const [searchLocalOnly, setSearchLocalOnly] = useState(false);

  // Active open dropdown
  const [openDropdown, setOpenDropdown] = useState<'type' | 'sort' | 'genre' | 'platform' | null>(null);

  // Voice Search states
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'processing' | 'error' | 'unsupported'>('idle');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const stopVoiceSearch = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {
        // ignore
      }
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsListening(false);
    setAudioLevel(0);
    setVoiceStatus('idle');
  };

  const startAudioLevelMonitoring = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.5;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        if (!mediaStreamRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 90) * 100)));
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch (err) {
      console.warn('Audio analyzer initialization notice:', err);
    }
  };

  const startVoiceSearch = async () => {
    stopVoiceSearch();
    setVoiceError(null);
    setVoiceTranscript('');
    setVoiceStatus('listening');
    setIsListening(true);

    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      startAudioLevelMonitoring(stream);
    } catch (err: any) {
      console.warn('Microphone permission or hardware access notice:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setVoiceError('Microphone permission denied. Allow mic access in your browser to speak.');
      } else {
        setVoiceError('Microphone not available on this device.');
      }
      setVoiceStatus('error');
      setIsListening(false);
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setVoiceStatus('unsupported');
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        const text = (final || interim).trim();
        if (text) {
          setVoiceTranscript(text);
          setQuery(text);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition notice:', event.error);
        if (event.error === 'not-allowed') {
          setVoiceError('Microphone permission blocked.');
          setVoiceStatus('error');
          stopVoiceSearch();
        } else if (event.error !== 'no-speech') {
          setVoiceError(`Speech: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setVoiceStatus('idle');
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Failed to start SpeechRecognition:', err);
      setVoiceStatus('unsupported');
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      if (initialVoiceActive) {
        startVoiceSearch();
      }
    } else {
      stopVoiceSearch();
      setQuery('');
      setIsCreatingList(false);
      setOpenDropdown(null);
    }
    return () => {
      stopVoiceSearch();
    };
  }, [isOpen, initialVoiceActive]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  const genresList = [
    'All Genres',
    'Action',
    'Animation',
    'Comedy',
    'Drama',
    'Family',
    'Horror',
    'Sci-Fi',
    'Adventure',
    'Thriller'
  ];

  const typeOptions: MediaTypeFilter[] = ['All', 'Movie', 'TV Show'];
  const sortOptions: SortOption[] = ['Popular', 'Top Rated', 'Newest', 'Title A-Z'];
  const platformOptions: PlatformFilter[] = [
    'All Platforms',
    'Netflix',
    'Disney+',
    'Prime Video',
    'Apple TV+',
    'HBO Max',
    'Hulu',
    'Paramount+',
    'Peacock'
  ];

  // Map local NVMe SSD master files and peer-shared library titles
  const localLibraryMovies: FeaturedMovie[] = useMemo(() => {
    const locals: FeaturedMovie[] = LOCAL_MEDIA_FILES.map((f) => ({
      id: f.id,
      title: f.title,
      releaseYear: f.releaseYear,
      posterUrl: f.posterUrl,
      bannerUrl: f.bannerUrl,
      genres: f.genres,
      rating: f.rating,
      certification: f.certification,
      director: f.director,
      summary: f.summary,
      statusBadge: 'Local NVMe Master'
    }));

    const shared: FeaturedMovie[] = SHARED_PEER_LIBRARIES.flatMap((p) =>
      p.media.map((m) => ({
        ...m,
        statusBadge: `Shared: ${p.name}`
      }))
    );

    return [...locals, ...shared];
  }, []);

  const filteredMovies = useMemo(() => {
    const isSearching =
      query.trim().length > 0 ||
      selectedGenre !== 'All Genres' ||
      selectedType !== 'Movie' ||
      selectedSort !== 'Popular' ||
      selectedPlatform !== 'All Platforms' ||
      searchLocalOnly;

    if (!isSearching && !query.trim()) return [];

    const baseSource = searchLocalOnly ? localLibraryMovies : movies;

    let list = baseSource.filter((m) => {
      // 1. Query match
      if (query.trim()) {
        const q = query.toLowerCase();
        const matches =
          m.title.toLowerCase().includes(q) ||
          (m.director && m.director.toLowerCase().includes(q)) ||
          (m.genres && m.genres.some((g) => g.toLowerCase().includes(q)));
        if (!matches) return false;
      }

      // 2. Type filter
      if (selectedType === 'Movie') {
        const isShow = ['severance', 'shogun', 'the-bear', 'the-last-of-us', 'stranger-things', 'squid-game', 'ted-lasso'].includes(m.id) ||
          m.genres?.includes('TV Show') || m.genres?.includes('TV Series');
        if (isShow) return false;
      } else if (selectedType === 'TV Show') {
        const isShow = ['severance', 'shogun', 'the-bear', 'the-last-of-us', 'stranger-things', 'squid-game', 'ted-lasso'].includes(m.id) ||
          m.genres?.includes('TV Show') || m.genres?.includes('TV Series');
        if (!isShow) return false;
      }

      // 3. Genre filter
      if (selectedGenre !== 'All Genres') {
        const hasGenre = m.genres && m.genres.some((g) => g.toLowerCase() === selectedGenre.toLowerCase());
        if (!hasGenre) return false;
      }

      // 4. Platform filter
      if (selectedPlatform !== 'All Platforms') {
        const id = m.id.toLowerCase();
        const title = m.title.toLowerCase();
        const genres = (m.genres || []).map((g) => g.toLowerCase());

        if (selectedPlatform === 'Netflix') {
          const isNetflix = id.includes('netflix') || genres.includes('netflix') ||
            ['spider-verse', 'society-of-the-snow', 'rebel-ridge', 'babygirl', 'glass-onion', 'uncut-gems', 'the-irishman', 'squid-game', 'stranger-things', 'pearl', 'materialists', 'love-lies-bleeding'].includes(m.id);
          if (!isNetflix) return false;
        } else if (selectedPlatform === 'Disney+') {
          const isDisney = id.includes('disney') || title.includes('star wars') || title.includes('loki') ||
            ['inside-out-2', 'deadpool-wolverine', 'shogun', 'the-bear', 'spirited-away', 'loki'].includes(m.id);
          if (!isDisney) return false;
        } else if (selectedPlatform === 'Prime Video') {
          const isPrime = id.includes('prime') || title.includes('boys') || title.includes('fallout') ||
            ['the-boys', 'fallout', 'reacher', 'road-house', 'invincible', 'rings-of-power', 'the-batman', 'interstellar'].includes(m.id);
          if (!isPrime) return false;
        } else if (selectedPlatform === 'Apple TV+') {
          const isApple = id.includes('apple') || title.includes('severance') || title.includes('ted lasso') ||
            ['severance', 'ted-lasso', 'slow-horses', 'silo', 'napoleon', 'killers-of-the-flower-moon', 'sharper', 'past-lives', 'eddington'].includes(m.id);
          if (!isApple) return false;
        } else if (selectedPlatform === 'HBO Max') {
          const isMax = id.includes('max') || id.includes('hbo') ||
            ['the-last-of-us', 'dune-two', 'civil-war', 'the-zone-of-interest', 'warfare', 'the-legend-of-ochi', 'beau-is-afraid', 'spirited-away'].includes(m.id);
          if (!isMax) return false;
        } else if (selectedPlatform === 'Hulu') {
          const isHulu = id.includes('hulu') ||
            ['shogun', 'the-bear', 'deadpool-wolverine', 'bring-her-back', 'moonlight', 'x', 'highest-2-lowest'].includes(m.id);
          if (!isHulu) return false;
        } else if (selectedPlatform === 'Paramount+') {
          const isParamount = id.includes('paramount') ||
            ['gladiator-two', 'maxxxine', 'babygirl', 'pearl', 'deadpool-wolverine', 'dune-two'].includes(m.id);
          if (!isParamount) return false;
        } else if (selectedPlatform === 'Peacock') {
          const isPeacock = id.includes('peacock') || genres.includes('peacock') ||
            ['heretic', 'civil-war', 'the-bear', 'uncut-gems', 'beau-is-afraid', 'past-lives', 'oppenheimer'].includes(m.id);
          if (!isPeacock) return false;
        }
      }

      return true;
    });

    // 5. Sorting
    if (selectedSort === 'Top Rated') {
      list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (selectedSort === 'Newest') {
      list = [...list].sort((a, b) => parseInt(b.releaseYear || '0') - parseInt(a.releaseYear || '0'));
    } else if (selectedSort === 'Title A-Z') {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [movies, query, selectedType, selectedSort, selectedGenre, selectedPlatform, searchLocalOnly, localLibraryMovies]);

  // Map user custom list IDs to movie objects
  const populatedUserLists = useMemo(() => {
    return userLists.map((list) => {
      const listMovies = list.movieIds
        .map((id) => movies.find((m) => m.id === id))
        .filter((m): m is FeaturedMovie => Boolean(m));
      return {
        ...list,
        movies: listMovies,
      };
    });
  }, [userLists, movies]);

  const handleCreateNewListSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    if (onCreateList) {
      onCreateList(newListName.trim(), newListDesc.trim() || undefined);
    }
    setNewListName('');
    setNewListDesc('');
    setIsCreatingList(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isListening) {
          stopVoiceSearch();
        } else if (openDropdown) {
          setOpenDropdown(null);
        } else if (isCreatingList) {
          setIsCreatingList(false);
        } else {
          onClose();
        }
      } else if (
        (e.key === 'v' || e.key === 'V') &&
        isOpen &&
        document.activeElement !== inputRef.current &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        e.preventDefault();
        if (isListening) {
          stopVoiceSearch();
        } else {
          startVoiceSearch();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isListening, openDropdown, isCreatingList, onClose]);

  if (!isOpen) return null;

  const hasActiveFiltersOrQuery = 
    query.trim().length > 0 || 
    selectedGenre !== 'All Genres' || 
    selectedType !== 'Movie' || 
    selectedSort !== 'Popular' ||
    selectedPlatform !== 'All Platforms' ||
    searchLocalOnly;

  return (
    <div 
      data-search-modal="true"
      className="fixed inset-0 z-50 flex flex-col p-6 lg:p-10 overflow-hidden select-none animate-in fade-in duration-200"
      style={{
        backgroundColor: '#0c101c',
        backgroundImage: `
          radial-gradient(ellipse 90% 70% at 5% 0%, rgba(56, 189, 248, 0.26) 0%, transparent 60%),
          radial-gradient(ellipse 75% 65% at 95% 5%, rgba(52, 211, 153, 0.22) 0%, transparent 55%),
          radial-gradient(ellipse 85% 75% at 8% 98%, rgba(244, 114, 182, 0.28) 0%, transparent 60%),
          radial-gradient(ellipse 80% 70% at 92% 95%, rgba(253, 224, 71, 0.18) 0%, transparent 55%),
          radial-gradient(ellipse 95% 85% at 50% 50%, rgba(168, 85, 247, 0.20) 0%, transparent 70%),
          linear-gradient(135deg, #0b1120 0%, #170d24 25%, #220b1f 50%, #0a1e19 75%, #1c1c0a 100%)
        `,
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Top Search Area Container */}
      <div className="pb-3.5 border-b border-white/10 flex flex-col gap-3">
        {/* Brand + centered Search header */}
        <div className="relative flex items-center justify-between min-h-10">
          <div className="flex items-center gap-2.5 z-10">
            <div className="w-10 h-10 rounded-xl overflow-hidden">
              <AppLogo className="w-full h-full" showBackground={false} />
            </div>
            <span className="font-display font-extrabold text-lg tracking-wide text-white">
              Nascent Player{' '}
              <span className="text-zinc-300 text-[10px] font-semibold tracking-widest px-1.5 py-0.5 rounded-full bg-transparent border border-white/20 ml-1">
                TV
              </span>
            </span>
          </div>
          <h1 className="pointer-events-none absolute inset-x-0 text-center font-display font-extrabold text-2xl sm:text-3xl tracking-wide text-white">
            Search
          </h1>
          <div className="w-[174px] shrink-0" aria-hidden="true" />
        </div>

        {/* Search Bar Row */}
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              stopVoiceSearch();
              onClose();
            }}
            className="shrink-0 h-[42px] flex items-center gap-2 px-5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white font-medium text-sm border border-white/15 focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all cursor-pointer"
            aria-label="Back"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5 text-sky-400" />
            <span>Back</span>
          </button>

          {/* Search Input Box - 25% Shorter (75% width) */}
          <div className="w-[75%] max-w-4xl relative flex items-center">
            <Search className="absolute left-4 w-4 h-4 text-sky-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies, shows, directors, genres, or click Voice..."
              className="w-full h-[42px] pl-11 pr-28 rounded-full bg-white/10 border border-white/20 focus:border-sky-400 focus:bg-white/15 text-white font-display text-sm sm:text-base placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-sky-400/20 transition-all"
            />
            
            <div className="absolute right-2.5 flex items-center gap-1.5">
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setVoiceTranscript('');
                  }}
                  className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : null}

              {/* Voice Search Button */}
              <button
                type="button"
                onClick={isListening ? stopVoiceSearch : startVoiceSearch}
                className={`p-2 rounded-full transition-all cursor-pointer focus:outline-none ${
                  isListening
                    ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.7)] animate-pulse ring-2 ring-rose-400/50'
                    : 'bg-sky-400/15 hover:bg-sky-400/25 text-sky-400 hover:text-sky-300 border border-sky-400/30'
                }`}
                title={isListening ? 'Listening... click to stop' : 'Voice Search (Click or press V)'}
                aria-label="Voice Search"
              >
                <Mic className={`w-4 h-4 ${isListening ? 'animate-bounce text-white' : 'text-sky-400'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Voice Search Leanback HUD / Visualizer */}
        {(isListening || voiceError || voiceStatus === 'unsupported' || (voiceTranscript && isListening)) && (
          <div className="w-[75%] max-w-4xl mx-auto p-4 rounded-3xl bg-gradient-to-r from-sky-950/80 via-zinc-900/90 to-indigo-950/80 border border-sky-500/30 shadow-[0_10px_35px_rgba(56,189,248,0.2)] animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Pulsing Mic Orb */}
                <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/50 text-sky-400 shrink-0">
                  {isListening && (
                    <span className="absolute inset-0 rounded-2xl bg-sky-400/30 animate-ping" />
                  )}
                  {voiceError ? (
                    <AlertCircle className="w-6 h-6 text-rose-400" />
                  ) : (
                    <Mic className="w-6 h-6 z-10" />
                  )}
                </div>

                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                      {voiceError ? 'Voice Input Alert' : isListening ? 'Google TV Voice Search' : 'Voice Search'}
                    </span>
                    {isListening && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                        Live Mic
                      </span>
                    )}
                  </div>

                  {/* Transcript or Status Message */}
                  <div className="text-white font-display text-base sm:text-lg font-bold flex items-center gap-2 mt-0.5">
                    {voiceError ? (
                      <span className="text-rose-300 text-sm font-normal">{voiceError}</span>
                    ) : voiceTranscript ? (
                      <span className="text-white drop-shadow">"{voiceTranscript}"</span>
                    ) : isListening ? (
                      <span className="text-zinc-300 italic font-medium">Say a movie title, show, actor, or genre...</span>
                    ) : (
                      <span className="text-zinc-400 text-sm font-normal">Click a suggestion or speak</span>
                    )}

                    {/* Microphone Audio Waveform Bars */}
                    {isListening && (
                      <div className="flex items-center gap-1 h-5 ml-2">
                        {[40, 80, 100, 65, 85, 50].map((base, i) => {
                          const computed = Math.max(20, Math.min(100, Math.round(((audioLevel || 30) * base) / 80)));
                          return (
                            <div
                              key={i}
                              className="w-1 rounded-full bg-gradient-to-t from-sky-400 to-indigo-300 transition-all duration-75"
                              style={{ height: `${computed}%` }}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons & Close */}
              <div className="flex items-center gap-2 shrink-0">
                {isListening ? (
                  <button
                    type="button"
                    onClick={stopVoiceSearch}
                    className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-bold text-white border border-white/20 transition-all cursor-pointer"
                  >
                    Done Speaking
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startVoiceSearch}
                    className="px-4 py-2 rounded-full bg-sky-500 hover:bg-sky-400 active:scale-95 text-xs font-bold text-black transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-sky-500/20"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Try Again</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    stopVoiceSearch();
                    setVoiceError(null);
                  }}
                  className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Close Voice HUD"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Voice Suggestions Chips */}
            <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-zinc-400 mr-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-sky-400" />
                <span>Try saying:</span>
              </span>
              {['Severance', 'Spider-Man', 'Sci-Fi', 'Christopher Nolan', 'Stranger Things', 'Animation'].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setQuery(suggestion);
                    setVoiceTranscript(suggestion);
                    stopVoiceSearch();
                  }}
                  className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 active:scale-95 text-zinc-300 hover:text-white text-xs font-medium border border-white/10 transition-all cursor-pointer"
                >
                  "{suggestion}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filter Bar Underneath Search Bar (Styled like Screenshot: Movie ▾ | Popular ▾ | Genre ▾ | Platform ▾ | Checkbox) */}
        <div ref={dropdownRef} className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 relative z-30">
          {/* 1. Media Type Pill Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
              className={`min-w-[100px] h-[34px] px-3.5 rounded-full border transition-all flex items-center justify-between gap-2 text-xs font-medium cursor-pointer shadow-sm focus:outline-none ${
                openDropdown === 'type' || selectedType !== 'Movie'
                  ? 'bg-sky-400 border-sky-400 text-black font-bold shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                  : 'bg-white/10 hover:bg-white/20 border-white/15 text-zinc-200 hover:text-white'
              }`}
            >
              <span className="truncate">{selectedType}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'type' ? 'rotate-180 text-black' : selectedType !== 'Movie' ? 'text-black' : 'text-zinc-400'}`} />
            </button>

            {openDropdown === 'type' && (
              <div className="absolute left-0 top-full mt-1.5 w-40 p-1.5 rounded-2xl bg-[#0c0c11]/98 backdrop-blur-2xl border border-white/15 shadow-2xl z-50 animate-in fade-in duration-150">
                {typeOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setSelectedType(opt);
                      setOpenDropdown(null);
                    }}
                    className={`w-full px-3 py-1.5 rounded-xl text-xs font-semibold text-left transition-all flex items-center justify-between cursor-pointer ${
                      selectedType === opt
                        ? 'bg-sky-500 text-black font-bold'
                        : 'text-zinc-200 hover:bg-white/10'
                    }`}
                  >
                    <span>{opt}</span>
                    {selectedType === opt && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Sort Menu Picker Pill Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
              className={`min-w-[105px] h-[34px] px-3.5 rounded-full border transition-all flex items-center justify-between gap-2 text-xs font-medium cursor-pointer shadow-sm focus:outline-none ${
                openDropdown === 'sort' || selectedSort !== 'Popular'
                  ? 'bg-sky-400 border-sky-400 text-black font-bold shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                  : 'bg-white/10 hover:bg-white/20 border-white/15 text-zinc-200 hover:text-white'
              }`}
            >
              <span className="truncate">{selectedSort}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'sort' ? 'rotate-180 text-black' : selectedSort !== 'Popular' ? 'text-black' : 'text-zinc-400'}`} />
            </button>

            {openDropdown === 'sort' && (
              <div className="absolute left-0 top-full mt-1.5 w-44 p-1.5 rounded-2xl bg-[#0c0c11]/98 backdrop-blur-2xl border border-white/15 shadow-2xl z-50 animate-in fade-in duration-150">
                {sortOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setSelectedSort(opt);
                      setOpenDropdown(null);
                    }}
                    className={`w-full px-3 py-1.5 rounded-xl text-xs font-semibold text-left transition-all flex items-center justify-between cursor-pointer ${
                      selectedSort === opt
                        ? 'bg-sky-500 text-black font-bold'
                        : 'text-zinc-200 hover:bg-white/10'
                    }`}
                  >
                    <span>{opt}</span>
                    {selectedSort === opt && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. Genre Pill Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'genre' ? null : 'genre')}
              className={`min-w-[100px] h-[34px] px-3.5 rounded-full border transition-all flex items-center justify-between gap-2 text-xs font-medium cursor-pointer shadow-sm focus:outline-none ${
                openDropdown === 'genre' || selectedGenre !== 'All Genres'
                  ? 'bg-sky-400 border-sky-400 text-black font-bold shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                  : 'bg-white/10 hover:bg-white/20 border-white/15 text-zinc-200 hover:text-white'
              }`}
            >
              <span className="truncate">{selectedGenre === 'All Genres' ? 'Genre' : selectedGenre}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'genre' ? 'rotate-180 text-black' : selectedGenre !== 'All Genres' ? 'text-black' : 'text-zinc-400'}`} />
            </button>

            {openDropdown === 'genre' && (
              <div className="absolute left-0 top-full mt-1.5 w-52 p-2 rounded-2xl bg-[#0c0c11]/98 backdrop-blur-2xl border border-white/15 shadow-2xl z-50 animate-in fade-in duration-150 max-h-72 overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-1 gap-1">
                  {genresList.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        setSelectedGenre(g);
                        setOpenDropdown(null);
                      }}
                      className={`w-full px-3 py-1.5 rounded-xl text-xs font-semibold text-left transition-all flex items-center justify-between cursor-pointer ${
                        selectedGenre === g
                          ? 'bg-sky-500 text-black font-bold'
                          : 'text-zinc-200 hover:bg-white/10'
                      }`}
                    >
                      <span>{g}</span>
                      {selectedGenre === g && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. Platform Picker Pill Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'platform' ? null : 'platform')}
              className={`min-w-[105px] h-[34px] px-3.5 rounded-full border transition-all flex items-center justify-between gap-2 text-xs font-medium cursor-pointer shadow-sm focus:outline-none ${
                openDropdown === 'platform' || selectedPlatform !== 'All Platforms'
                  ? 'bg-sky-400 border-sky-400 text-black font-bold shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                  : 'bg-white/10 hover:bg-white/20 border-white/15 text-zinc-200 hover:text-white'
              }`}
            >
              <span className="truncate">{selectedPlatform === 'All Platforms' ? 'Platform' : selectedPlatform}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'platform' ? 'rotate-180 text-black' : selectedPlatform !== 'All Platforms' ? 'text-black' : 'text-zinc-400'}`} />
            </button>

            {openDropdown === 'platform' && (
              <div className="absolute left-0 top-full mt-1.5 w-48 p-1.5 rounded-2xl bg-[#0c0c11]/98 backdrop-blur-2xl border border-white/15 shadow-2xl z-50 animate-in fade-in duration-150 max-h-72 overflow-y-auto no-scrollbar">
                {platformOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setSelectedPlatform(opt);
                      setOpenDropdown(null);
                    }}
                    className={`w-full px-3 py-1.5 rounded-xl text-xs font-semibold text-left transition-all flex items-center justify-between cursor-pointer ${
                      selectedPlatform === opt
                        ? 'bg-sky-500 text-black font-bold'
                        : 'text-zinc-200 hover:bg-white/10'
                    }`}
                  >
                    <span>{opt}</span>
                    {selectedPlatform === opt && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 5. Checkbox: Search Local & Shared Library Files Only */}
          <button
            type="button"
            onClick={() => setSearchLocalOnly((prev) => !prev)}
            className={`h-[34px] px-3.5 rounded-full border transition-all flex items-center gap-2 cursor-pointer select-none text-xs font-medium shadow-sm focus:outline-none ${
              searchLocalOnly
                ? 'bg-sky-400 border-sky-400 text-black font-bold shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                : 'bg-white/10 hover:bg-white/20 border-white/15 text-zinc-200 hover:text-white'
            }`}
          >
            <div className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-colors border ${
              searchLocalOnly 
                ? 'bg-black border-black text-sky-400' 
                : 'bg-black/40 border-white/30'
            }`}>
              {searchLocalOnly && <Check className="w-2.5 h-2.5 stroke-[3]" />}
            </div>
            <HardDrive className={`w-3 h-3 ${searchLocalOnly ? 'text-black' : 'text-zinc-400'}`} />
            <span className="truncate">Local & Shared Files</span>
          </button>

          {/* Reset Filters Shortcut (if customized) */}
          {(selectedType !== 'Movie' || selectedSort !== 'Popular' || selectedGenre !== 'All Genres' || selectedPlatform !== 'All Platforms' || searchLocalOnly) && (
            <button
              type="button"
              onClick={() => {
                setSelectedType('Movie');
                setSelectedSort('Popular');
                setSelectedGenre('All Genres');
                setSelectedPlatform('All Platforms');
                setSearchLocalOnly(false);
              }}
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold px-2 py-0.5 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main View Area */}
      {!hasActiveFiltersOrQuery ? (
        /* When no search or custom filters: Display Watchlist and user-created lists */
        <div className="flex-1 overflow-y-auto no-scrollbar py-6 space-y-8">
          {/* Quick Header Banner */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl lg:text-2xl font-display font-extrabold text-white flex items-center gap-2.5">
                <Bookmark className="w-6 h-6 text-sky-400" />
                <span>My Library Lists & Watchlist</span>
              </h2>
              <p className="text-xs lg:text-sm text-zinc-400 mt-1">
                Your saved media queues, playlists, and user-curated shelves ready to watch.
              </p>
            </div>

            <button
              onClick={() => setIsCreatingList(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-zinc-200 text-black font-bold text-xs tracking-wide shadow-lg shadow-black/50 active:scale-95 transition-all cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Create New List</span>
            </button>
          </div>

          {/* Create List Modal / Inline Prompt */}
          {isCreatingList && (
            <div className="p-5 rounded-2xl bg-[#0c0c11] border border-white/15 shadow-2xl animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ListPlus className="w-5 h-5 text-sky-400" />
                  <span className="font-display font-bold text-base text-white">Create New Custom List</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreatingList(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateNewListSubmit} className="space-y-3">
                <div>
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="List name (e.g., Weekend Horror Marathon, Oscar Nominees)"
                    className="w-full px-4 py-2 rounded-xl bg-black/50 border border-white/20 text-white text-sm focus:outline-none focus:border-sky-400"
                    autoFocus
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={newListDesc}
                    onChange={(e) => setNewListDesc(e.target.value)}
                    placeholder="Description (optional)"
                    className="w-full px-4 py-2 rounded-xl bg-black/50 border border-white/20 text-white text-xs focus:outline-none focus:border-sky-400"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingList(false)}
                    className="px-4 py-1.5 rounded-full text-xs text-zinc-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-1.5 rounded-full bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs shadow-md transition-all"
                  >
                    Create List
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 1. WATCHLIST SECTION */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-lg text-white">Watchlist Queue</span>
              </div>
            </div>

            {watchlist.length > 0 ? (
              <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2">
                {watchlist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectMovie(item);
                      onClose();
                    }}
                    className="flex-shrink-0 cursor-pointer group focus:outline-none"
                    tabIndex={0}
                  >
                    <div className="relative w-36 lg:w-44 aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-900 border border-white/15 group-hover:border-sky-400 group-hover:scale-105 group-focus:scale-105 group-focus:ring-4 group-focus:ring-sky-400 shadow-xl transition-all">
                      <img
                        src={item.posterUrl}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:brightness-110 transition-all"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity flex flex-col justify-end p-3">
                        <span className="font-display font-bold text-xs text-white line-clamp-1">{item.title}</span>
                        <span className="text-[10px] text-sky-400">{item.releaseYear}</span>
                      </div>
                    </div>
                    <div className="mt-2 max-w-[144px] lg:max-w-[176px]">
                      <h4 className="font-display font-semibold text-xs text-zinc-200 group-hover:text-white line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        {item.releaseYear} · {item.genres?.[0] || 'Cinema'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center flex flex-col items-center justify-center">
                <Bookmark className="w-8 h-8 text-zinc-600 mb-2" />
                <span className="text-zinc-300 font-medium text-sm">Your Watchlist is empty</span>
                <p className="text-xs text-zinc-500 mt-1">Browse any movie or show and click "+ Watchlist" to save it here.</p>
              </div>
            )}
          </section>

          {/* 2. USER-CREATED LISTS */}
          {populatedUserLists.map((list) => (
            <section key={list.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white border border-white/15 font-display font-bold text-sm tracking-wide flex items-center gap-1.5">
                    <ListPlus className="w-3.5 h-3.5 text-sky-400" />
                    {list.name}
                  </span>
                </div>
              </div>

              {list.movies.length > 0 ? (
                <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2">
                  {list.movies.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        onSelectMovie(item);
                        onClose();
                      }}
                      className="flex-shrink-0 cursor-pointer group focus:outline-none"
                      tabIndex={0}
                    >
                      <div className="relative w-36 lg:w-44 aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-900 border border-white/15 group-hover:border-sky-400 group-hover:scale-105 group-focus:scale-105 group-focus:ring-4 group-focus:ring-sky-400 shadow-xl transition-all">
                        <img
                          src={item.posterUrl}
                          alt={item.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:brightness-110 transition-all"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity flex flex-col justify-end p-3">
                          <span className="font-display font-bold text-xs text-white line-clamp-1">{item.title}</span>
                          <span className="text-[10px] text-sky-400">{item.releaseYear}</span>
                        </div>
                      </div>
                      <div className="mt-2 max-w-[144px] lg:max-w-[176px]">
                        <h4 className="font-display font-semibold text-xs text-zinc-200 group-hover:text-white line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-zinc-500 mt-0.5">
                          {item.releaseYear} · {item.genres?.[0] || 'Cinema'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center">
                  <span className="text-zinc-400 text-xs">This list is currently empty. Add titles while browsing library items.</span>
                </div>
              )}
            </section>
          ))}
        </div>
      ) : (
        /* When search or filters are active: Show results grid */
        <div className="flex-1 overflow-y-auto no-scrollbar py-4">
          <div className="flex items-center justify-between pb-3 text-xs text-zinc-400">
            <span>
              Showing <span className="text-white font-bold">{filteredMovies.length}</span> titles
              {selectedType !== 'All' ? ` in ${selectedType}` : ''}
              {selectedGenre !== 'All Genres' ? ` (${selectedGenre})` : ''}
              {query.trim() ? ` for "${query}"` : ''}
            </span>
            <span className="font-medium text-sky-400">Sorted by {selectedSort}</span>
          </div>

          {filteredMovies.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center">
              <Film className="w-12 h-12 text-zinc-600 mb-3" />
              <span className="text-zinc-300 font-display text-lg font-bold">No matching titles found</span>
              <p className="text-xs text-zinc-500 mt-1">Try switching the Media Type, clearing the genre filter, or refining your keywords.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 pb-8">
              {filteredMovies.map((movie) => (
                <div
                  key={movie.id}
                  onClick={() => {
                    onSelectMovie(movie);
                    onClose();
                  }}
                  className="cursor-pointer group focus:outline-none"
                  tabIndex={0}
                >
                  <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-900 border border-white/15 group-hover:border-sky-400 group-hover:scale-105 group-focus:scale-105 group-focus:ring-4 group-focus:ring-sky-400 shadow-xl transition-all">
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:brightness-110 transition-all"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity flex flex-col justify-end p-3">
                      <span className="font-display font-bold text-xs text-white line-clamp-1">{movie.title}</span>
                      <span className="text-[10px] text-sky-400">{movie.releaseYear}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <h4 className="font-display font-semibold text-xs text-zinc-200 group-hover:text-white line-clamp-1">
                      {movie.title}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mt-0.5">
                      <span>{movie.releaseYear}</span>
                      <span>·</span>
                      <span>{movie.genres?.[0] || 'Cinema'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
