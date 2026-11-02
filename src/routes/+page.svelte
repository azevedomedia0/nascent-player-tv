<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import {
    Play, Pause, Sliders, Settings, Radio, Plus, Trash2, Send, Users, Sparkles,
    Upload, FileVideo, Layers, Globe, Clock, Volume2, Maximize, AlertCircle,
    RefreshCw, Check, Code, MessageSquare, Info, SlidersHorizontal, FolderOpen,
    ArrowRight, Tv, Share2, VolumeX, Sparkle, Search, Bell, Tv2, Gamepad2,
    ChevronLeft, ChevronRight, ChevronDown, LayoutGrid, Folder, Clapperboard,
    ArrowLeft, Heart, Home, PlayCircle, Puzzle, Menu, Repeat, Shuffle,
    SkipBack, SkipForward, Music, Image as ImageIcon, Palette
  } from 'lucide-svelte';
  import type { MediaItem, SubtitleTrack, WatchParty, ChatMessage, PlayerPlugin, PlayHistoryItem } from '$lib/types';

  // Constants
  const USER_SESSION_ID = typeof window !== 'undefined' 
    ? (localStorage.getItem('iina_session_id') || ('user_' + Math.random().toString(36).substring(2, 8).toUpperCase())) 
    : 'user_temp';
  const USER_DEFAULT_NAME = 'Guest_' + Math.random().toString(36).substring(2, 6).toUpperCase();

  const IMDB_DATA: Record<string, { rating: string; certification: string; director: string; cast: string[]; plot: string; votes: string }> = {
    "babygirl": { rating: "6.6", certification: "R", director: "Halina Reijn", cast: ["Nicole Kidman", "Harris Dickinson", "Antonio Banderas"], plot: "A high-powered CEO puts her career and family on the line when she begins a torrid affair with her much younger intern.", votes: "15.4K" },
    "beau-is-afraid": { rating: "6.7", certification: "R", director: "Ari Aster", cast: ["Joaquin Phoenix", "Patti LuPone", "Amy Ryan"], plot: "Following the sudden death of his mother, an anxiety-ridden man embarks on a surreal odyssey home.", votes: "48.1K" },
    "bring-her-back": { rating: "7.1", certification: "R", director: "Danny Philippou", cast: ["Michael Philippou", "Sally Hawkins"], plot: "A chilling thriller surrounding supernatural bindings and the psychological unraveling of a family in distress.", votes: "8.2K" },
    "civil-war": { rating: "7.1", certification: "R", director: "Alex Garland", cast: ["Kirsten Dunst", "Wagner Moura", "Cailee Spaeny"], plot: "A journey across a dystopian future America, following a team of military-embedded journalists as they race to reach DC.", votes: "116K" },
    "eddington": { rating: "7.8", certification: "R", director: "Ari Aster", cast: ["Joaquin Phoenix", "Pedro Pascal", "Emma Stone"], plot: "A small-town New Mexico sheriff harbors cosmic and political aspirations that threaten to unravel the local peace.", votes: "12K" },
    "the-green-knight": { rating: "6.6", certification: "R", director: "David Lowery", cast: ["Dev Patel", "Alicia Vikander", "Joel Edgerton"], plot: "A fantasy retelling of the medieval story of Sir Gawain and the Green Knight, a giant emerald-skinned stranger.", votes: "94K" },
    "heretic": { rating: "7.2", certification: "R", director: "Scott Beck", cast: ["Hugh Grant", "Sophie Thatcher", "Chloe East"], plot: "Two young Mormon missionaries are forced to prove their faith when they knock on the door of the deceptive Mr. Reed.", votes: "38K" },
    "highest-2-lowest": { rating: "6.9", certification: "PG-13", director: "Sebastian Stan", cast: ["Sebastian Stan", "Renate Reinsve"], plot: "A musical drama tracing the rapid rise and catastrophic fall of record producers in a hyper-digitized studio environment.", votes: "4.5K" },
    "the-legend-of-ochi": { rating: "7.4", certification: "PG", director: "Isaiah Saxon", cast: ["Helena Zengel", "Finn Wolfhard", "Willem Dafoe"], plot: "A young girl runs away from home and learns to communicate with an elusive and magical species of animal.", votes: "2.1K" },
    "love-lies-bleeding": { rating: "7.0", certification: "R", director: "Rose Glass", cast: ["Kristen Stewart", "Katy O'Brian", "Ed Harris"], plot: "Gym manager Lou falls hard for Jackie, an ambitious bodybuilder, sparking a dark descent into violence and family crime.", votes: "29K" },
    "materialists": { rating: "7.3", certification: "R", director: "Celine Song", cast: ["Dakota Johnson", "Pedro Pascal", "Chris Evans"], plot: "A professional matchmaker gets caught in a tense love triangle in New York with a wealthy suitor and an old flame.", votes: "1.1K" },
    "maxxxine": { rating: "6.5", certification: "R", director: "Ti West", cast: ["Mia Goth", "Elizabeth Debicki", "Moses Sumney"], plot: "In 1980s Hollywood, adult film star Maxine Minx gets her big break, but a mysterious killer stalks the starlets.", votes: "55K" },
    "moonlight": { rating: "7.4", certification: "R", director: "Barry Jenkins", cast: ["Mahershala Ali", "Shariff Earp", "Trevante Rhodes"], plot: "A young African-American man struggles with his identity and sexuality while growing up in a Miami neighborhood.", votes: "310K" },
    "past-lives": { rating: "7.9", certification: "PG-13", director: "Celine Song", cast: ["Greta Lee", "Teo Yoo", "John Magaro"], plot: "Nora and Hae Sung, two deeply connected childhood friends, are reunited for one week in New York.", votes: "125K" },
    "pearl": { rating: "7.0", certification: "R", director: "Ti West", cast: ["Mia Goth", "David Corenswet", "Tandi Wright"], plot: "Trapped on her family's isolated farm, Pearl must tend to her ailing father under the watch of her mother.", votes: "112K" },
    "sharper": { rating: "6.6", certification: "R", director: "Benjamin Caron", cast: ["Julianne Moore", "Sebastian Stan", "Justice Smith"], plot: "A con artist takes on Manhattan's billionaires in a high-stakes game of greed, desire, and deception.", votes: "44K" },
    "uncut-gems": { rating: "7.4", certification: "R", director: "Josh Safdie", cast: ["Adam Sandler", "Julia Fox", "Idina Menzel"], plot: "A charismatic jeweler makes a bet that could lead to the windfall of a lifetime, if he can survive.", votes: "280K" },
    "warfare": { rating: "7.6", certification: "R", director: "Alex Garland", cast: ["Charles Melton", "Joseph Quinn"], plot: "An intense historical exploration of ground warfare tactics, military honor, and psychological stress.", votes: "3.2K" },
    "x": { rating: "6.6", certification: "R", director: "Ti West", cast: ["Mia Goth", "Jenna Ortega", "Brittany Snow"], plot: "In 1979, film crews set out to make an adult film in rural Texas, only to find themselves fighting for lives.", votes: "165K" },
    "the-zone-of-interest": { rating: "7.5", certification: "PG-13", director: "Jonathan Glazer", cast: ["Sandra Hüller", "Christian Friedel"], plot: "The commandant of Auschwitz, Rudolf Höss, and his wife Hedwig, strive to build a dream life for their family nearby.", votes: "89K" },
    "bbb-sample": { rating: "8.1", certification: "G", director: "Sacha Goedegeboure", cast: ["Big Buck Bunny", "Forest Animals"], plot: "A comedy about a fluffy rabbit who exacts revenge on three bullying rodents in a beautiful forest.", votes: "18K" },
    "sintel-sample": { rating: "7.7", certification: "PG", director: "Colin Levy", cast: ["Sintel", "Scales the Dragon"], plot: "A young woman named Sintel embarks on a dangerous quest to rescue Scales, her baby dragon companion.", votes: "12K" },
    "tears-sample": { rating: "7.4", certification: "PG-13", director: "Ian Hubert", cast: ["Celia", "VFX Crew"], plot: "Amsterdam scientists utilize a defense weapon to halt rogue mechanical giants, resurrecting romance.", votes: "9K" }
  };

  // State declaration utilizing Svelte 5 Runes
  let userName = $state('');
  let profileAvatar = $state('⚡');
  let profileBio = $state('Retro Streamer & Audiophile');
  let profileRole = $state('Super User');
  let profileColor = $state('pink');

  let mediaItems = $state<MediaItem[]>([]);
  let activeMedia = $state<MediaItem | null>(null);
  let activeTab = $state<'now-playing' | 'library' | 'friends' | 'plugins' | 'settings' | 'profile'>('profile');
  let playerWidth = $state(1024);
  let isResizingPlayer = $state(false);
  let isSidebarOpen = $state(false);
  let isLoadingMedia = $state(true);
  let showImdbPanel = $state(true);
  let isScrapingImdb = $state(false);
  let checkingUpdates = $state(false);
  let updateStatus = $state<'idle' | 'up-to-date' | 'found'>('idle');

  // Advanced Library Categories, Formats, and Folders
  let folders = $state<string[]>(['Root Directory', 'Favorites', 'Action Movies', 'Chill Clips', 'Audio Recordings']);
  let selectedFolder = $state('Root Directory');
  let newFolderName = $state('');
  let selectedFormat = $state<'all' | 'video' | 'audio' | 'image'>('all');
  let libraryLayout = $state<'grid' | 'list'>('grid');

  // Friends Sync state
  let friends = $state([
    { id: '1', name: 'Sophia_Streams', status: 'Online', avatar: 'S', watching: 'Master Live League Showdown' },
    { id: '2', name: 'Retro_Jack', status: 'Idle', avatar: 'J', watching: 'Retro Horizon Chase' },
    { id: '3', name: 'Elena_VLC', status: 'Offline', avatar: 'E', watching: null },
    { id: '4', name: 'Alex_Gamer', status: 'Online', avatar: 'A', watching: 'Tears of Steel' }
  ]);
  let pendingFriends = $state([
    { id: '5', name: 'Marcus_Core', avatar: 'M' },
    { id: '6', name: 'Cyber_Zero', avatar: 'C' }
  ]);
  let friendNameInput = $state('');
  let friendLogs = $state([
    { id: 'l1', friendName: 'Sophia_Streams', action: 'accessed', mediaTitle: 'Master Live League Showdown', timestamp: '5 mins ago' },
    { id: 'l2', friendName: 'Retro_Jack', action: 'synced watch-party', mediaTitle: 'Retro Horizon Chase', timestamp: '12 mins ago' },
    { id: 'l3', friendName: 'Alex_Gamer', action: 'streamed audio track', mediaTitle: 'Lofi Chill Air.mp3', timestamp: '2 hours ago' },
    { id: 'l4', friendName: 'Elena_VLC', action: 'updated metadata on', mediaTitle: 'Tears of Steel', timestamp: 'Yesterday' }
  ]);

  // Server state settings
  let serverOnline = $state(true);
  let serverPort = $state('3000');
  let serverTranscoder = $state('1080p Original');
  let serverBandwidthLimit = $state<'unlimited' | '10mbps' | '5mbps'>('unlimited');
  let accessLogs = $state([
    { id: 'a1', ip: '192.168.1.104', user: 'Sophia_Streams', action: 'STREAM_START', detail: 'Master Live League Showdown', time: '14:24:10' },
    { id: 'a2', ip: '192.168.1.189', user: 'Retro_Jack', action: 'SYNC_LOBBY', detail: 'Authorized token matching', time: '14:18:02' },
    { id: 'a3', ip: '75.142.92.51', user: 'Marcus_Core', action: 'AUTH_DENIED', detail: 'Invalid guest pass-key', time: '13:55:40' }
  ]);
  let allowedAccessUsers = $state([
    { id: '1', name: 'Sophia_Streams', permission: 'Full Access' },
    { id: '2', name: 'Retro_Jack', permission: 'Sync Lock' },
    { id: '3', name: 'Elena_VLC', permission: 'Read-only' }
  ]);
  let newAccessUser = $state('');
  let newAccessPermission = $state('Full Access');

  // Playback Control states
  let playbackSpeed = $state(1);
  let subtitleOffset = $state(0); // in seconds
  let audioPreset = $state<'normal' | 'vocal' | 'bass' | 'low-volume'>('normal');
  let selectedSubTrack = $state<SubtitleTrack | null>(null);

  // Equalizer Frequencies (standard high fidelity visualizer)
  let eqGains = $state({
    hz60: 0,
    hz230: 0,
    hz910: 0,
    hz4000: 0,
    hz14000: 0
  });

  // Upload progress simulation to maintain perfect responsive indicators
  let isUploading = $state(false);
  let uploadProgress = $state(0);
  let dragOver = $state(false);

  // Watch Party States
  let watchParty = $state<WatchParty | null>(null);
  let roomCodeInput = $state('');
  let isHost = $state(false);
  let chatMessage = $state('');
  let partyStatus = $state('');

  // Custom Video Player States
  let isPlaying = $state(false);
  let isLooping = $state(true);
  let isShuffle = $state(false);
  let currentTime = $state(0);
  let duration = $state(0);
  let videoVolume = $state(1);
  let isMuted = $state(false);
  let showSubSelection = $state(false);
  let showSpeedDial = $state(false);

  // Plugins state
  let plugins = $state<PlayerPlugin[]>([]);
  let newPluginName = $state('');
  let newPluginCode = $state('');
  let newPluginType = $state<'metadata' | 'video-filter' | 'subtitle-translator' | 'visuals' | 'stremio'>('video-filter');

  // Stremio & Plugins Extended states
  let pluginsSubTab = $state<'js-hooks' | 'stremio-addons' | 'guide'>('js-hooks');
  let stremioUrlInput = $state('');
  let stremioLoading = $state(false);
  let stremioError = $state<string | null>(null);

  // Stremio Stream searcher states
  let selectedStremioAddonId = $state('');
  let streamSearchId = $state('bbb-sample');
  let foundStreams = $state<any[]>([]);
  let streamsLoading = $state(false);

  // AI Assistant states
  let aiQuery = $state('');
  let aiGenerating = $state(false);
  let aiFeedback = $state<string | null>(null);
  let addLinkUrl = $state('');
  let addLinkTitle = $state('');
  let searchQuery = $state('');
  let filterFavoritesOnly = $state(false);

  // Media Library dynamic drop-down selections
  let selectedLibrary = $state('All Libraries');
  let libraries = $state<string[]>(['All Libraries', 'A24 Collection', 'Sci-Fi Folder', 'Local Disk']);
  let selectedType = $state('All Types');
  let selectedGenre = $state('All Genres');
  let selectedStudio = $state('All Studios');
  let selectedSortFilter = $state('Newest First');
  let selectedGroup = $state('None');
  let recursiveMode = $state(true);

  // States to toggle dropdown visibility
  let isLibraryDropdownOpen = $state(false);
  let isImportMenuOpen = $state(false);
  let isTypeDropdownOpen = $state(false);
  let isGenreDropdownOpen = $state(false);
  let isSortDropdownOpen = $state(false);

  let playHistory = $state<PlayHistoryItem[]>([]);

  // Video Binding Element
  let videoRef = $state<HTMLVideoElement | null>(null);

  // Synchronizers timers
  let syncInterval: any = null;

  // Svelte 5 Derived styling states
  const accentHex = $derived(getAccentColor(profileColor));

  // Initialize profile settings on mount
  onMount(async () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('iina_session_id', USER_SESSION_ID);
      userName = localStorage.getItem('iina_username') || USER_DEFAULT_NAME;
      profileAvatar = localStorage.getItem('iina_avatar') || '⚡';
      profileBio = localStorage.getItem('iina_bio') || 'Retro Streamer & Audiophile';
      profileRole = localStorage.getItem('iina_role') || 'Super User';
      profileColor = localStorage.getItem('iina_color') || 'pink';
    }

    try {
      await fetchMedia();
      await fetchHistory();
      await fetchPlugins();
    } catch (e) {
      console.error("Mount data loading failures", e);
    }
  });

  onDestroy(() => {
    if (syncInterval) clearInterval(syncInterval);
  });

  // Watchers & Effects with standard Svelte 5 `$effect`
  $effect(() => {
    // Save to localStorage when profile edits execute
    if (typeof window !== 'undefined' && userName) {
      localStorage.setItem('iina_username', userName);
      localStorage.setItem('iina_avatar', profileAvatar);
      localStorage.setItem('iina_bio', profileBio);
      localStorage.setItem('iina_role', profileRole);
      localStorage.setItem('iina_color', profileColor);
    }
  });

  $effect(() => {
    // Dynamic Accent Colors theme binding
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--accent-color', accentHex);
    }
  });

  // Watch Party synchronizer poller loop
  $effect(() => {
    if (watchParty) {
      if (!syncInterval) {
        syncInterval = setInterval(pollSyncLobby, 2500);
      }
    } else {
      if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
      }
    }
  });

  // Fetch API handlers
  async function fetchMedia() {
    isLoadingMedia = true;
    try {
      const resp = await fetch('/api/media');
      if (resp.ok) {
        mediaItems = await resp.json();
      }
    } catch(e) {
      console.error(e);
    } finally {
      isLoadingMedia = false;
    }
  }

  async function fetchHistory() {
    try {
      const resp = await fetch('/api/history');
      if (resp.ok) {
        playHistory = await resp.json();
      }
    } catch(e) {
      console.error(e);
    }
  }

  async function fetchPlugins() {
    try {
      const resp = await fetch('/api/plugins');
      if (resp.ok) {
        plugins = await resp.json();
      }
    } catch(e) {
      console.error(e);
    }
  }

  // Accent selector helper
  function getAccentColor(clr: string): string {
    switch (clr) {
      case 'orange': return '#ffa033';
      case 'purple': return '#a855f7';
      case 'emerald': return '#10b981';
      case 'cyan': return '#06b6d4';
      case 'crimson': return '#f43f5e';
      default: return '#ec4899'; // pink
    }
  }

  function getMediaFormat(media: MediaItem | null): 'video' | 'audio' | 'photo' {
    if (!media) return 'video';
    const ext = media.filename.split('.').pop()?.toLowerCase() || '';
    if (['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'].includes(ext) || media.title.toLowerCase().includes('lofi') || media.title.toLowerCase().includes('audio')) {
      return 'audio';
    }
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext) || media.title.toLowerCase().includes('photo') || media.title.toLowerCase().includes('image') || media.title.toLowerCase().includes('poster')) {
      return 'photo';
    }
    return 'video';
  }

  // Playback control procedures
  function handlePlayMedia(item: MediaItem) {
    activeMedia = item;
    selectedSubTrack = item.subtitles && item.subtitles.length > 0 ? item.subtitles[0] : null;
    activeTab = 'now-playing';
    isPlaying = true;

    // Report play history start
    fetch('/api/history/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mediaId: item.id,
        title: item.title,
        posterUrl: item.posterUrl,
        progress: 0,
        duration: item.duration
      })
    }).then(() => fetchHistory());

    // Update play progress count
    fetch('/api/media/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: item.id,
        playProgress: 0,
        playCountIncrement: true
      })
    }).then(() => fetchMedia());

    setTimeout(() => {
      if (videoRef) {
        videoRef.play().catch(() => {});
      }
    }, 100);
  }

  function togglePlay() {
    if (!videoRef) return;
    if (isPlaying) {
      videoRef.pause();
      isPlaying = false;
    } else {
      videoRef.play().catch(() => {});
      isPlaying = true;
    }
    syncLobbyImmediate();
  }

  function toggleMute() {
    isMuted = !isMuted;
    if (videoRef) {
      videoRef.muted = isMuted;
    }
  }

  function triggerNextMedia() {
    if (mediaItems.length === 0 || !activeMedia) return;
    const idx = mediaItems.findIndex(m => m.id === activeMedia?.id);
    let nIndex = 0;
    if (isShuffle) {
      nIndex = Math.floor(Math.random() * mediaItems.length);
    } else {
      nIndex = (idx + 1) % mediaItems.length;
    }
    handlePlayMedia(mediaItems[nIndex]);
  }

  function triggerPrevMedia() {
    if (mediaItems.length === 0 || !activeMedia) return;
    const idx = mediaItems.findIndex(m => m.id === activeMedia?.id);
    let pIdx = idx - 1;
    if (pIdx < 0) pIdx = mediaItems.length - 1;
    handlePlayMedia(mediaItems[pIdx]);
  }

  async function deleteMediaItem(id: string) {
    if (confirm("Delete this streams article from local server storage?")) {
      const resp = await fetch(`/api/media/${id}`, { method: 'DELETE' });
      if (resp.ok) {
        if (activeMedia?.id === id) activeMedia = null;
        await fetchMedia();
      }
    }
  }

  // Metadata AI Assistant generator pipeline
  async function generateAIMetadataDirect() {
    if (!aiQuery) return;
    aiGenerating = true;
    aiFeedback = null;
    try {
      const resp = await fetch('/api/metadata/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: aiQuery })
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({ error: 'Fetch failure code' }));
        aiFeedback = `Enrichment Failed: ${errData.error}`;
        return;
      }
      const data = await resp.json();
      aiFeedback = `Gemini matched: '${data.title}' (Year: ${data.releaseYear}) successfully parsed!`;
      
      // Catalog matching
      const targetItem = mediaItems.find(m => m.title.toLowerCase().includes(aiQuery.toLowerCase()));
      if (targetItem) {
        const upResp = await fetch('/api/media/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...targetItem,
            title: data.title,
            releaseYear: data.releaseYear,
            genres: data.genres,
            summary: data.summary,
            director: data.director,
            rating: data.rating,
            posterUrl: data.posterUrl,
            bannerUrl: data.bannerUrl
          })
        });
        if (upResp.ok) {
          fetch(`/api/media/${targetItem.id}`, { method: 'DELETE' }); // remove uncategorized original
          await fetchMedia();
        }
      } else {
        // Create as custom online stream option
        const addNewResp = await fetch('/api/media/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: data.title,
            filename: `${data.title.replace(/\s+/g, '')}.mp4`,
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            type: 'movie',
            duration: 600,
            posterUrl: data.posterUrl,
            bannerUrl: data.bannerUrl,
            releaseYear: data.releaseYear,
            genres: data.genres,
            summary: data.summary,
            director: data.director,
            rating: data.rating,
            isLocal: false
          })
        });
        if (addNewResp.ok) {
          await fetchMedia();
        }
      }
      aiQuery = '';
    } catch(err: any) {
      aiFeedback = `AI Scraping Failure: ${err.message}`;
    } finally {
      aiGenerating = false;
    }
  }

  // Manual Remote Link streaming setup
  async function handleAddCustomLink() {
    if (!addLinkUrl || !addLinkTitle) return;
    try {
      const resp = await fetch('/api/media/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: addLinkTitle,
          filename: addLinkTitle.replace(/\s+/g, '_') + '.mp4',
          url: addLinkUrl,
          type: 'clip',
          duration: 320,
          posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=600',
          bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200',
          releaseYear: new Date().getFullYear().toString(),
          genres: ['Web Cast'],
          summary: `Independently registered network link stream playing at target source address.`,
          isLocal: false
        })
      });
      if (resp.ok) {
        addLinkTitle = '';
        addLinkUrl = '';
        isImportMenuOpen = false;
        await fetchMedia();
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Watch Party Synchronizations Routines
  async function createWatchLobby() {
    try {
      const resp = await fetch('/api/watchparty/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostName: userName,
          hostId: USER_SESSION_ID,
          currentMediaId: activeMedia?.id || null
        })
      });
      if (resp.ok) {
        watchParty = await resp.json();
        isHost = true;
        partyStatus = `Joined Lobby Room: ${watchParty?.roomId}`;
      }
    } catch(e) {
      console.error(e);
    }
  }

  async function joinWatchLobby() {
    if (!roomCodeInput) return;
    try {
      const resp = await fetch('/api/watchparty/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: roomCodeInput.trim().toUpperCase(),
          userId: USER_SESSION_ID,
          userName: userName
        })
      });
      if (resp.ok) {
        watchParty = await resp.json();
        isHost = false;
        roomCodeInput = '';
        partyStatus = `Joined Lobby Room: ${watchParty?.roomId}`;
        
        // Match active stream item
        if (watchParty?.currentMediaId) {
          const matchedItem = mediaItems.find(m => m.id === watchParty?.currentMediaId);
          if (matchedItem && matchedItem.id !== activeMedia?.id) {
            activeMedia = matchedItem;
          }
        }
      } else {
        alert("Lobby room not found. Double check code.");
      }
    } catch(e) {
      console.error(e);
    }
  }

  async function pollSyncLobby() {
    if (!watchParty) return;
    try {
      const resp = await fetch(`/api/watchparty/${watchParty.roomId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: USER_SESSION_ID,
          userName: userName,
          playbackState: isPlaying ? 'playing' : 'paused',
          currentTime: videoRef ? videoRef.currentTime : currentTime,
          currentMediaId: activeMedia?.id || null,
          isHost: isHost
        })
      });
      if (resp.ok) {
        const updatedRoom = await resp.json();
        watchParty = updatedRoom;

        // Apply host timing changes to clients
        if (!isHost && videoRef) {
          if (updatedRoom.playbackState === 'playing' && videoRef.paused) {
            videoRef.play().catch(() => {});
            isPlaying = true;
          } else if (updatedRoom.playbackState === 'paused' && !videoRef.paused) {
            videoRef.pause();
            isPlaying = false;
          }

          // Buffer adjustments
          const delta = Math.abs(videoRef.currentTime - updatedRoom.currentTime);
          if (delta > 3.0) {
            videoRef.currentTime = updatedRoom.currentTime;
          }
        }
      }
    } catch(e) {
      console.error("Watch polling failed", e);
    }
  }

  function syncLobbyImmediate() {
    if (watchParty) pollSyncLobby();
  }

  async function sendWatchPartyChat() {
    if (!chatMessage || !watchParty) return;
    try {
      const resp = await fetch(`/api/watchparty/${watchParty.roomId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: userName,
          text: chatMessage
        })
      });
      if (resp.ok) {
        chatMessage = '';
        pollSyncLobby();
      }
    } catch(e) {
      console.error(e);
    }
  }

  function leaveWatchParty() {
    watchParty = null;
    isHost = false;
    partyStatus = 'Left watch lobby';
  }

  // Binary drop-uploader engine
  async function handleFileInputChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      uploadBinaryFile(target.files[0]);
    }
  }

  async function handleFileDrop(event: DragEvent) {
    dragOver = false;
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      uploadBinaryFile(event.dataTransfer.files[0]);
    }
  }

  function uploadBinaryFile(file: File) {
    isUploading = true;
    uploadProgress = 0;

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/api/upload?fileName=${encodeURIComponent(file.name)}&type=video`);
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        uploadProgress = Math.round((e.loaded / e.total) * 100);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 201) {
        uploadProgress = 100;
        setTimeout(async () => {
          isUploading = false;
          await fetchMedia();
        }, 800);
      } else {
        alert("Upload parsing failure on server");
        isUploading = false;
      }
    });

    xhr.addEventListener('error', () => {
      alert("Network upload failure.");
      isUploading = false;
    });

    xhr.send(file);
  }

  // Svelte filter computations using standard JS reactive declarations
  const filteredCatalog = $derived(
    mediaItems.filter(item => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDirector = item.director?.toLowerCase().includes(query) || false;
        const matchesGenres = item.genres.some(g => g.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDirector && !matchesGenres) return false;
      }
      
      if (selectedFolder !== 'Root Directory' && item.library !== selectedFolder) {
        // Mock folder filtering
        if (selectedFolder === 'Favorites' && !item.playProgress) return false;
      }

      if (selectedFormat !== 'all') {
        const format = getMediaFormat(item);
        if (format !== selectedFormat) return false;
      }

      if (selectedGenre !== 'All Genres') {
        if (!item.genres.includes(selectedGenre)) return false;
      }

      if (selectedType !== 'All Types') {
        if (selectedType === 'Movies Only' && item.type !== 'movie') return false;
        if (selectedType === 'Shows Only' && item.type !== 'show') return false;
      }

      return true;
    })
  );

  // Stremio addon installers
  async function connectStremioAddon() {
    if (!stremioUrlInput) return;
    stremioLoading = true;
    stremioError = null;
    try {
      const targetUrl = `/api/stremio/proxy?url=${encodeURIComponent(stremioUrlInput.trim())}`;
      const resp = await fetch(targetUrl);
      if (resp.ok) {
        const manifest = await resp.json();
        
        // Register as custom plugin
        const saveResp = await fetch('/api/plugins/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: manifest.name,
            description: manifest.description || 'Stremio community catalog aggregator stream addon.',
            version: manifest.version || '1.0.0',
            author: 'Torrent Community',
            type: 'stremio',
            enabled: true,
            manifestUrl: stremioUrlInput.trim(),
            code: JSON.stringify(manifest)
          })
        });
        if (saveResp.ok) {
          stremioUrlInput = '';
          await fetchPlugins();
        }
      } else {
        stremioError = "CORS bypass endpoint failed fetching metadata.";
      }
    } catch(err: any) {
      stremioError = `Addon Connection Failure: ${err.message}`;
    } finally {
      stremioLoading = false;
    }
  }

  async function quickInstallStremio(url: string) {
    stremioUrlInput = url;
    await connectStremioAddon();
  }

  async function queryStremioStreams() {
    if (!selectedStremioAddonId || !streamSearchId) return;
    streamsLoading = true;
    foundStreams = [];
    try {
      const addon = plugins.find(p => p.id === selectedStremioAddonId);
      if (!addon || !addon.manifestUrl) return;

      const manifestCleanUrl = addon.manifestUrl.replace('stremio://', 'https://');
      const baseApi = manifestCleanUrl.replace('/manifest.json', '');
      
      const streamUrl = `${baseApi}/stream/movie/${streamSearchId}.json`;
      const proxyTarget = `/api/stremio/proxy?url=${encodeURIComponent(streamUrl)}`;
      
      const resp = await fetch(proxyTarget);
      if (resp.ok) {
        const data = await resp.json();
        foundStreams = data.streams || [];
      } else {
        alert("Failed fetching stream allocations on server provider.");
      }
    } catch(e) {
      console.error(e);
    } finally {
      streamsLoading = false;
    }
  }

  async function togglePlugin(p: PlayerPlugin) {
    try {
      const resp = await fetch('/api/plugins/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: p.id, enabled: !p.enabled })
      });
      if (resp.ok) {
        await fetchPlugins();
      }
    } catch(e) {
      console.error(e);
    }
  }

  async function createCustomPlugin() {
    if (!newPluginName || !newPluginCode) return;
    try {
      const resp = await fetch('/api/plugins/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPluginName,
          code: newPluginCode,
          type: newPluginType,
          author: userName,
          version: '1.0.0',
          description: 'Client side sandboxed Javascript hooks.'
        })
      });
      if (resp.ok) {
        newPluginName = '';
        newPluginCode = '';
        await fetchPlugins();
      }
    } catch(e) {
      console.error(e);
    }
  }

  async function deletePlugin(id: string) {
    if (confirm("Permanently uninstall this hook sandbox?")) {
      const resp = await fetch(`/api/plugins/${id}`, { method: 'DELETE' });
      if (resp.ok) {
        await fetchPlugins();
      }
    }
  }

  // Plugin active validators
  const isCrtPluginEnabled = $derived(plugins.some(p => p.id === 'retro-crt-shader' && p.enabled));
  const isAmbientPluginEnabled = $derived(plugins.some(p => p.id === 'ambient-glow-plugin' && p.enabled));
</script>

<style>
  :global(:root) {
    --accent-color: #ec4899;
  }
</style>

<div class="flex h-screen bg-[#0d0e10] text-[#cacacc] font-sans overflow-hidden select-none">
  <!-- Interactive Side Navigation Rail -->
  <aside class="w-20 md:w-24 bg-[#08090a] border-r border-white/5 flex flex-col justify-between py-6 items-center shrink-0 z-30 transition-all duration-300">
    <div class="flex flex-col items-center gap-7 w-full">
      <!-- High Contrast IINA launcher logo -->
      <div class="p-3 bg-gradient-to-tr from-[#1b1c1f] to-[#25262a] rounded-xl border border-white/10 shadow-2xl relative group cursor-pointer">
        <span class="text-sm font-black text-white px-0.5 tracking-wider font-mono">IINA</span>
        <div class="absolute -right-1.5 -top-1.5 w-3 h-3 bg-pink-500 rounded-full animate-ping pointer-events-none" style="background-color: {accentHex}" />
        <div class="absolute -right-1.5 -top-1.5 w-3 h-3 bg-pink-500 rounded-full border border-black pointer-events-none" style="background-color: {accentHex}" />
      </div>

      <div class="w-8 h-[1px] bg-white/5" />

      <!-- Tab Button triggers -->
      <nav class="flex flex-col items-center gap-2.5 w-full px-2" aria-label="Main Navigation">
        <!-- Tab 0: Profile representation -->
        <button
          onclick={() => activeTab = 'profile'}
          class="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex flex-col justify-center items-center transition relative shrink-0 cursor-pointer text-zinc-400 hover:text-white"
          class:bg-white-5={activeTab === 'profile'}
          style={activeTab === 'profile' ? `border-color: ${accentHex}; box-shadow: 0 0 12px ${accentHex}40; background-color: ${accentHex}15; border-width: 1px; color: ${accentHex}` : ''}
          title="Profile Console"
        >
          <span class="text-lg leading-none font-bold select-none">{profileAvatar}</span>
          <span class="text-[9px] font-mono tracking-tighter mt-1 hover:opacity-100 opacity-60">PROFILE</span>
        </button>

        <!-- Tab 1: Now Playing View -->
        <button
          onclick={() => {
            if (activeMedia) activeTab = 'now-playing';
            else activeTab = 'library';
          }}
          class="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex flex-col justify-center items-center transition relative shrink-0 cursor-pointer text-zinc-400 hover:text-white"
          style={activeTab === 'now-playing' ? `border-color: ${accentHex}; box-shadow: 0 0 12px ${accentHex}40; background-color: ${accentHex}15; border-width: 1px; color: ${accentHex}` : ''}
          title="Theater Core Stream"
        >
          <Tv class="w-4 h-4 md:w-4.5 md:h-4.5" />
          <span class="text-[9px] font-mono tracking-tighter mt-1.5">STREAM</span>
          {#if activeMedia}
            <span class="absolute right-1.5 top-1.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          {/if}
        </button>

        <!-- Tab 2: Explorer Media Library -->
        <button
          onclick={() => activeTab = 'library'}
          class="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex flex-col justify-center items-center transition relative shrink-0 cursor-pointer text-zinc-400 hover:text-white"
          style={activeTab === 'library' ? `border-color: ${accentHex}; box-shadow: 0 0 12px ${accentHex}40; background-color: ${accentHex}15; border-width: 1px; color: ${accentHex}` : ''}
          title="Cinephile Vault Library"
        >
          <Clapperboard class="w-4 h-4 md:w-4.5 md:h-4.5" />
          <span class="text-[9px] font-mono tracking-tighter mt-1.5">CATALOG</span>
        </button>

        <!-- Tab 3: Friends Watch-Party Network -->
        <button
          onclick={() => activeTab = 'friends'}
          class="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex flex-col justify-center items-center transition relative shrink-0 cursor-pointer text-zinc-400 hover:text-white"
          style={activeTab === 'friends' ? `border-color: ${accentHex}; box-shadow: 0 0 12px ${accentHex}40; background-color: ${accentHex}15; border-width: 1px; color: ${accentHex}` : ''}
          title="Watch-Party Mesh Sync"
        >
          <Users class="w-4 h-4 md:w-4.5 md:h-4.5" />
          <span class="text-[9px] font-mono tracking-tighter mt-1.5">LOBBY</span>
          {#if watchParty}
            <span class="absolute right-1.5 top-1.5 w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
          {/if}
        </button>

        <!-- Tab 4: Plugin Extension Manager -->
        <button
          onclick={() => activeTab = 'plugins'}
          class="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex flex-col justify-center items-center transition relative shrink-0 cursor-pointer text-zinc-400 hover:text-white"
          style={activeTab === 'plugins' ? `border-color: ${accentHex}; box-shadow: 0 0 12px ${accentHex}40; background-color: ${accentHex}15; border-width: 1px; color: ${accentHex}` : ''}
          title="Player Client Plugins"
        >
          <Layers class="w-4 h-4 md:w-4.5 md:h-4.5" />
          <span class="text-[9px] font-mono tracking-tighter mt-1.5">ADDONS</span>
        </button>

        <!-- Tab 5: Unified Settings Panel -->
        <button
          onclick={() => activeTab = 'settings'}
          class="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex flex-col justify-center items-center transition relative shrink-0 cursor-pointer text-zinc-400 hover:text-white"
          style={activeTab === 'settings' ? `border-color: ${accentHex}; box-shadow: 0 0 12px ${accentHex}40; background-color: ${accentHex}15; border-width: 1px; color: ${accentHex}` : ''}
          title="Equalizers & Buffers"
        >
          <Sliders class="w-4 h-4 md:w-4.5 md:h-4.5" />
          <span class="text-[9px] font-mono tracking-tighter mt-1.5">CONTROL</span>
        </button>
      </nav>
    </div>

    <!-- Bottom Indicator actions -->
    <div class="flex flex-col items-center gap-4 text-zinc-500 text-[10px] tracking-widest font-bold font-mono">
      <span class="animate-pulse text-[#ffa033]">ONLINE</span>
      <Tv class="w-4 h-4 hover:text-white transition cursor-pointer" onclick={() => activeTab = 'settings'} />
    </div>
  </aside>

  <!-- Principal Content Container -->
  <div class="flex-1 flex flex-col min-w-0 bg-[#0a0b0c] relative">
    <!-- Main Window Top Accent boundary Bar -->
    <header class="h-14 bg-[#08090a]/80 backdrop-blur border-b border-white/5 px-6 flex justify-between items-center z-10">
      <div class="flex items-center gap-3">
        <SlidersHorizontal class="w-4 h-4 text-zinc-400" />
        <span class="text-xs font-mono font-bold tracking-wider text-zinc-400">
          IINA ENGINE HOST // CONTEXT: {activeTab.toUpperCase()}
        </span>
      </div>
      <div class="flex items-center gap-4">
        {#if isUploading}
          <div class="flex items-center gap-2 bg-pink-500/10 border border-pink-500/25 px-3 py-1 rounded-full text-[10px] text-pink-400 font-mono">
            <RefreshCw class="w-3 h-3 animate-spin" />
            <span>UPLOADING STREAM ({uploadProgress}%)</span>
          </div>
        {/if}
        <div class="text-[11px] font-mono font-bold text-zinc-500 flex items-center gap-1.5 bg-black/45 hover:bg-black/80 px-3 py-1.5 rounded-lg border border-white/5">
          <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          <span>PORT 3000 ACCESSIBLE</span>
        </div>
      </div>
    </header>

    <main class="flex-1 overflow-y-auto relative {activeTab === 'now-playing' ? 'p-0 w-full h-full' : 'p-6'}">
      
      <!-- ================== TAB 0: PROFILE OVERVIEW ================== -->
      {#if activeTab === 'profile'}
        <div id="tab-profile" class="w-full max-w-5xl mx-auto space-y-6 text-left font-sans pb-12 animate-fade-in">
          <!-- Main visual splash panel -->
          <div class="bg-gradient-to-r from-[#17181c] to-[#0f1012] border border-white/5 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
            <div class="absolute -right-32 -bottom-32 w-96 h-96 rounded-full blur-3xl opacity-15 pointer-events-none" style="background-color: {accentHex}" />
            
            <div class="flex flex-col md:flex-row items-center gap-7 relative z-10 text-center md:text-left">
              <span class="text-6xl md:text-7xl p-6 bg-black/45 rounded-3xl border border-white/10 shadow-inner flex justify-center items-center select-none w-28 h-28 shrink-0">
                {profileAvatar}
              </span>
              <div class="space-y-2 flex-grow">
                <div class="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                  <h1 class="text-2xl md:text-3xl font-black text-white">{userName}</h1>
                  <span class="text-[10px] uppercase font-mono tracking-wider font-bold bg-white/5 text-zinc-300 border border-white/10 px-2 rounded-md">{profileRole}</span>
                </div>
                <p class="text-xs text-zinc-400 max-w-lg font-mono">{profileBio}</p>
                <div class="flex items-center gap-5 justify-center md:justify-start pt-1.5">
                  <div class="text-center md:text-left">
                    <span class="text-xl font-bold text-white block">{(mediaItems.length * 123)}</span>
                    <span class="text-[9px] font-mono uppercase tracking-wider text-zinc-500">Watched Minutes</span>
                  </div>
                  <div class="w-[1px] h-7 bg-white/5" />
                  <div class="text-center md:text-left">
                    <span class="text-xl font-bold text-white block">{mediaItems.length}</span>
                    <span class="text-[9px] font-mono uppercase tracking-wider text-zinc-500">Database Streams</span>
                  </div>
                  <div class="w-[1px] h-7 bg-white/5" />
                  <div class="text-center md:text-left">
                    <span class="text-xl font-bold text-white block">{plugins.filter(p => p.enabled).length}</span>
                    <span class="text-[9px] font-mono uppercase tracking-wider text-zinc-500">Active Addons</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Splitted Config Columns -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div class="lg:col-span-4 space-y-6">
              <!-- Fast profile customizer form -->
              <div class="bg-[#141517] rounded-3xl p-6 border border-white/5 space-y-4 shadow-xl">
                <div>
                  <h3 class="text-sm font-bold text-zinc-200">Adjust Identifier Card</h3>
                  <p class="text-[11px] text-zinc-500 mt-0.5">Edit credentials stored in browser persistence.</p>
                </div>
                
                <div class="space-y-3 text-xs">
                  <label class="block space-y-1">
                    <span class="text-zinc-500 font-bold uppercase text-[9px] tracking-wider block">Username</span>
                    <input type="text" bind:value={userName} class="w-full bg-black/35 hover:bg-black/60 focus:bg-black border border-white/5 focus:border-[#ffa033]/25 p-2.5 rounded-xl text-zinc-200 outline-none transition" />
                  </label>
                  <label class="block space-y-1">
                    <span class="text-zinc-500 font-bold uppercase text-[9px] tracking-wider block">Emoji Avatar Icon</span>
                    <input type="text" bind:value={profileAvatar} class="w-full bg-black/35 hover:bg-black/60 focus:bg-black border border-white/5 focus:border-[#ffa033]/25 p-2.5 rounded-xl text-zinc-200 outline-none transition" />
                  </label>
                  <label class="block space-y-1">
                    <span class="text-zinc-500 font-bold uppercase text-[9px] tracking-wider block">Bios Tagline</span>
                    <input type="text" bind:value={profileBio} class="w-full bg-black/35 hover:bg-black/60 focus:bg-black border border-white/5 focus:border-[#ffa033]/25 p-2.5 rounded-xl text-zinc-200 outline-none transition" />
                  </label>
                  <label class="block space-y-1">
                    <span class="text-zinc-500 font-bold uppercase text-[9px] tracking-wider block">Personal Accent Color Theme</span>
                    <select bind:value={profileColor} class="w-full bg-black/35 border border-white/5 p-2.5 rounded-xl text-zinc-200 outline-none transition uppercase font-mono tracking-widest text-[10px]">
                      <option value="pink">Classic Pink</option>
                      <option value="orange">Cosmic Orange</option>
                      <option value="purple">Ultraviolet Purple</option>
                      <option value="emerald">Cyber Emerald</option>
                      <option value="cyan">Deep Oceans Cyan</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>

            <!-- Right Column History log -->
            <div class="lg:col-span-8 space-y-6">
              <div class="bg-[#141517] border border-white/5 rounded-3xl p-6 shadow-xl space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-bold text-zinc-200">Playback Activity Ledger</h3>
                    <p class="text-[11px] text-zinc-500">Record history of active media buffers played on this client machine.</p>
                  </div>
                  {#if playHistory.length > 0}
                    <button onclick={async () => { await fetch('/api/history', { method: 'DELETE' }); await fetchHistory(); }} class="p-2 text-zinc-500 hover:text-red-400 transition" title="Wipe History log">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  {/if}
                </div>

                <div class="space-y-2.5 max-h-96 overflow-y-auto">
                  {#if playHistory.length === 0}
                    <div class="p-8 border border-dashed border-white/5 rounded-2xl text-center text-zinc-500 text-xs text-mono space-y-2">
                      <Clock class="w-6 h-6 mx-auto stroke-1" />
                      <p>Ledger is empty. Stream movie and shows catalog articles to compile logs.</p>
                    </div>
                  {:else}
                    {#each playHistory as item (item.id)}
                      <div class="bg-black/25 flex items-center justify-between p-3 rounded-xl border border-white/[0.02]">
                        <div class="flex items-center gap-3">
                          <img src={item.posterUrl} alt="" class="w-9 h-12 rounded object-cover" />
                          <div class="text-left">
                            <h4 class="text-xs font-bold text-zinc-200">{item.title}</h4>
                            <p class="text-[9px] text-zinc-500 font-mono mt-0.5">Watched at: {new Date(item.watchedAt).toLocaleTimeString()}</p>
                          </div>
                        </div>
                        <span class="text-[10px] bg-white/5 px-2.5 py-1 text-zinc-400 rounded font-mono font-bold uppercase border border-white/5">COMPLETED</span>
                      </div>
                    {/each}
                  {/if}
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- ================== TAB 1: THEATER MEDIA CORE ================== -->
      {#if activeTab === 'now-playing'}
        <div id="tab-now-playing" class="w-full h-full min-h-0 text-left relative flex flex-col justify-center items-center bg-black group/theater">
          {#if isCrtPluginEnabled}
            <div class="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/10 to-black/10 mix-blend-overlay z-40 bg-[linear-gradient(rgba(18,16,16,0)+50%,rgba(0,0,0,0.25)+50%),linear-gradient(90deg,rgba(255,0,0,0.06)+0%,rgba(0,255,0,0.02)+33%,rgba(0,0,255,0.06)+66%)] bg-[size:100%_4px,6px_100%]" />
          {/if}

          {#if activeMedia}
            <!-- svelte-ignore a11y_media_has_caption -->
            <video
              bind:this={videoRef}
              id="iina-video-core"
              src={activeMedia.url}
              class="w-full h-full max-h-[85vh] object-contain bg-black"
              autoplay
              loop={isLooping}
              bind:currentTime={currentTime}
              bind:duration={duration}
              bind:paused={isMuted}
              onended={triggerNextMedia}
            >
              {#if selectedSubTrack}
                <track
                  label={selectedSubTrack.label}
                  kind="subtitles"
                  srclang={selectedSubTrack.language}
                  src={selectedSubTrack.url}
                  default
                />
              {/if}
            </video>

            <!-- Floating Top controller overlay -->
            <div class="absolute top-4 right-4 opacity-0 group-hover/theater:opacity-100 transition-all duration-300 pointer-events-none group-hover/theater:pointer-events-auto bg-black/75 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-3 z-40 shadow-xl">
              <span class="p-1 rounded bg-white/10 font-bold font-mono text-[9px] uppercase text-zinc-300">{getMediaFormat(activeMedia)}</span>
              <span class="text-white text-[10px] font-bold font-mono uppercase tracking-wider">{activeMedia.title.toUpperCase()}</span>
            </div>

            <!-- Dashboard controls panel overlay bottom -->
            <div class="absolute bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-xl z-40 flex flex-col items-center opacity-0 group-hover/theater:opacity-100 transition-all duration-300 pointer-events-none group-hover/theater:pointer-events-auto">
              
              <!-- Ambient dynamic lyric generator -->
              <div class="text-center mb-3 text-white drop-shadow">
                <p class="text-xs font-semibold max-w-md bg-black/45 backdrop-blur-sm py-1.5 px-3 rounded-full border border-white/5">
                  {#if currentTime < 5}
                    ♪ (Cinematic Stream Opening Loops) ♪
                  {:else if currentTime < 15}
                    ♪ Big Buck Bunny sets off his wonderful adventure... ♪
                  {:else if currentTime < 30}
                    ♪ Sintel journeys into the magical, dragon mountain range... ♪
                  {:else}
                    ♪ Live High-Speed Buffer streaming securely at 3000port ♪
                  {/if}
                </p>
              </div>

              <div class="w-full bg-[#141517]/95 backdrop-blur-lg border border-white/10 rounded-2xl p-4 shadow-2xl space-y-3">
                <!-- Timeline slider -->
                <div class="space-y-1">
                  <div class="flex justify-between text-[10px] font-mono text-zinc-400">
                    <span>{Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}</span>
                    <span>{Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, '0')}</span>
                  </div>
                  <!-- svelte-ignore svelte_a11y_interaction_events -->
                  <div class="h-1 bg-white/10 rounded-full overflow-hidden relative cursor-pointer" onclick={(e) => {
                    if (videoRef && duration) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pct = (e.clientX - rect.left) / rect.width;
                      videoRef.currentTime = pct * duration;
                    }
                  }}>
                    <div class="h-full bg-pink-500" style="width: {duration ? (currentTime / duration) * 100 : 0}%; background-color: {accentHex}" />
                  </div>
                </div>

                <!-- Controllers row -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <button onclick={triggerPrevMedia} class="text-zinc-400 hover:text-white transition cursor-pointer" title="Previous clip">
                      <SkipBack class="w-4 h-4" />
                    </button>
                    <!-- play button -->
                    <button onclick={togglePlay} class="p-2.5 bg-white text-black hover:scale-105 rounded-full transition flex items-center justify-center cursor-pointer" style="background-color: {accentHex}">
                      {#if isPlaying}
                        <Pause class="w-4 h-4 text-black" />
                      {:else}
                        <Play class="w-4 h-4 text-black fill-black" />
                      {/if}
                    </button>
                    <button onclick={triggerNextMedia} class="text-zinc-400 hover:text-white transition cursor-pointer" title="Skip forward">
                      <SkipForward class="w-4 h-4" />
                    </button>
                  </div>

                  <!-- Volume panel -->
                  <div class="flex items-center gap-2">
                    <button onclick={toggleMute} class="text-zinc-400 hover:text-white transition cursor-pointer">
                      {#if isMuted}
                        <VolumeX class="w-4 h-4" />
                      {:else}
                        <Volume2 class="w-4 h-4" />
                      {/if}
                    </button>
                    <input type="range" min="0" max="1" step="0.05" bind:value={videoVolume} oninput={() => { if (videoRef) videoRef.volume = videoVolume; }} class="w-16 accent-pink-500" style="accent-color: {accentHex}" />
                  </div>

                  <!-- Quick Action Panel triggers -->
                  <div class="flex items-center gap-2">
                    <button onclick={() => showSpeedDial = !showSpeedDial} class="p-1 px-2.5 rounded border border-white/10 text-[9px] font-mono text-zinc-300 hover:text-white transition cursor-pointer" title="Streaming velocity">
                      {playbackSpeed}x
                    </button>
                    <button onclick={() => activeTab = 'library'} class="p-2 rounded bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition cursor-pointer" title="Lobby library catalog">
                      <Clapperboard class="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <!-- Timing scale selection dials -->
                {#if showSpeedDial}
                  <div class="pt-2 border-t border-white/5 flex gap-2 justify-center text-[10px] font-mono animate-fade-in">
                    {#each [0.5, 1.0, 1.25, 1.5, 2.0] as speed}
                      <button onclick={() => { playbackSpeed = speed; if (videoRef) videoRef.playbackRate = speed; showSpeedDial = false; }} class="px-2 py-0.5 rounded transition uppercase" class:text-white={playbackSpeed === speed} class:bg-white-5={playbackSpeed === speed}>
                        {speed}X
                      </button>
                    {/each}
                  </div>
                {/if}
              </div>
            </div>

          {:else}
            <!-- Empty Stream screen -->
            <div class="text-center space-y-4 max-w-sm p-6">
              <div class="p-5 bg-zinc-900 border border-white/5 rounded-3xl inline-block shadow-2xl">
                <Tv class="w-8 h-8 text-zinc-400 mx-auto" />
              </div>
              <h3 class="text-sm font-bold text-white">No Stream Selected</h3>
              <p class="text-[11px] text-zinc-500 font-mono">Select a movie from the database catalog or enter custom streaming links to spin up media player feeds.</p>
              <button onclick={() => activeTab = 'library'} class="px-4 py-2 bg-pink-500 hover:bg-pink-600 font-mono text-xs uppercase leading-none rounded-xl font-extrabold text-white cursor-pointer" style="background-color: {accentHex}">
                Open Catalog
              </button>
            </div>
          {/if}
        </div>
      {/if}

      <!-- ================== TAB 2: EXPLORER LIBRARY ================== -->
      {#if activeTab === 'library'}
        <div id="tab-library" class="w-full max-w-6xl mx-auto space-y-6 text-left animate-fade-in pb-12">
          <!-- Filter Header card layout -->
          <div class="flex flex-col md:flex-row justify-between items-center bg-[#141517] border border-white/5 rounded-2xl p-4 gap-4 shadow-lg">
            <div class="flex items-center gap-2 bg-black/45 p-2 rounded-xl border border-white/5 w-full md:w-80">
              <Search class="w-4 h-4 text-zinc-500 shrink-0" />
              <input type="text" placeholder="Search title, director, or genre..." bind:value={searchQuery} class="bg-transparent border-none outline-none text-xs text-zinc-200 placeholder-zinc-500 w-full" />
            </div>

            <div class="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end text-xs">
              <button onclick={() => isGenreDropdownOpen = !isGenreDropdownOpen} class="px-3.5 py-2 bg-black/25 hover:bg-black/45 border border-white/5 rounded-xl text-zinc-300 flex items-center gap-1.5 cursor-pointer font-mono text-[10px] uppercase">
                Genre: {selectedGenre} <ChevronDown class="w-3.5 h-3.5 text-zinc-500" />
              </button>

              <button onclick={() => isSortDropdownOpen = !isSortDropdownOpen} class="px-3.5 py-2 bg-black/25 hover:bg-black/45 border border-white/5 rounded-xl text-zinc-300 flex items-center gap-1.5 cursor-pointer font-mono text-[10px] uppercase">
                Filter: {selectedType} <ChevronDown class="w-3.5 h-3.5 text-zinc-500" />
              </button>

              <button onclick={() => isImportMenuOpen = !isImportMenuOpen} class="px-3.5 py-2 bg-pink-600 hover:scale-105 rounded-xl text-white font-bold flex items-center gap-1.5 cursor-pointer font-mono text-[10px] uppercase" style="background-color: {accentHex}">
                <Plus class="w-3.5 h-3.5" /> Import Link
              </button>
            </div>
          </div>

          <!-- Modals trigger selectors -->
          {#if isGenreDropdownOpen}
            <div class="bg-black/35 border border-white/5 rounded-2xl p-4 animate-fade-in grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs font-mono">
              {#each ['All Genres', 'Comedy', 'Animation', 'Fantasy', 'Adventure', 'Sci-Fi', 'Action', 'Cyberpunk'] as genre}
                <button onclick={() => { selectedGenre = genre; isGenreDropdownOpen = false; }} class="p-2 border border-white/[0.02] bg-white-02 rounded-xl text-left hover:text-white">
                  {genre.toUpperCase()}
                </button>
              {/each}
            </div>
          {/if}

          {#if isSortDropdownOpen}
            <div class="bg-black/35 border border-white/5 rounded-2xl p-4 animate-fade-in flex gap-2.5 text-xs font-mono">
              {#each ['All Types', 'Movies Only', 'Shows Only'] as type}
                <button onclick={() => { selectedType = type; isSortDropdownOpen = false; }} class="p-2 px-3 border border-white/5 rounded-xl text-left hover:text-white">
                  {type.toUpperCase()}
                </button>
              {/each}
            </div>
          {/if}

          <!-- Import Stream Link Popup -->
          {#if isImportMenuOpen}
            <div class="bg-gradient-to-tr from-[#1b1c20] to-[#0f1012] border border-pink-500/10 rounded-2xl p-5 space-y-4 shadow-xl animate-fade-in relative overflow-hidden" style="border-color: {accentHex}20">
              <div>
                <h3 class="text-xs font-bold text-zinc-200">Import Remote Streaming Node</h3>
                <p class="text-[10px] text-zinc-500">Provide direct public endpoint HTTP URL addressing files (H264 mp4 links, WebM streams).</p>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <label class="block space-y-1">
                  <span class="text-zinc-500 uppercase text-[9px] block font-bold font-mono">Stream URL Link</span>
                  <input type="text" placeholder="https://commondatastorage.googleapis.com/..." bind:value={addLinkUrl} class="w-full bg-black/45 focus:bg-black border border-white/5 p-2.5 rounded-xl text-zinc-200 outline-none" />
                </label>
                <label class="block space-y-2">
                  <span class="text-zinc-500 uppercase text-[9px] block font-bold font-mono">Label Title</span>
                  <input type="text" placeholder="Marvel Epic Clip" bind:value={addLinkTitle} class="w-full bg-black/45 focus:bg-black border border-white/5 p-2.5 rounded-xl text-zinc-200 outline-none" />
                </label>
              </div>
              <div class="flex gap-2.5 justify-end">
                <button onclick={() => { isImportMenuOpen = false; addLinkUrl = ''; addLinkTitle = ''; }} class="px-3.5 py-1.5 bg-zinc-800 text-zinc-400 font-bold hover:text-zinc-200 text-xs rounded-xl font-mono uppercase cursor-pointer">Discard</button>
                <button onclick={handleAddCustomLink} class="px-4 py-1.5 bg-pink-500 font-extrabold text-white text-xs rounded-xl font-mono uppercase cursor-pointer" style="background-color: {accentHex}">Mount Link</button>
              </div>
            </div>
          {/if}

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <!-- Left Side Categories list -->
            <div class="lg:col-span-3 space-y-6">
              <!-- Drag and Drop interactive visual container -->
              <!-- svelte-ignore svelte_a11y_click_events_have_key_actions -->
              <div 
                class="border-2 border-dashed rounded-3xl p-6 text-center transition-all cursor-pointer relative overflow-hidden select-none"
                class:border-pink-500={dragOver}
                class:bg-pink-10={dragOver}
                class:border-white-10={!dragOver}
                class:hover:border-white-20={!dragOver}
                onclick={() => document.getElementById('iina-file-uploader')?.click()}
                ondragover={(e) => { e.preventDefault(); dragOver = true; }}
                ondragleave={() => dragOver = false}
                ondrop|preventDefault={handleFileDrop}
              >
                <input type="file" id="iina-file-uploader" onchange={handleFileInputChange} class="hidden" accept="video/*,audio/*" />
                <Upload class="w-7 h-7 mx-auto stroke-1 text-zinc-500 relative z-10 animate-pulse" />
                <h4 class="text-xs font-bold text-zinc-200 mt-2.5 relative z-10">Ingest Media Archive</h4>
                <p class="text-[9px] text-zinc-500 font-mono mt-1 relative z-10">Drag or drop local files here to deploy immediate video indexing.</p>
              </div>

              <!-- Gemini AI Instant metadata Curation panel -->
              <div class="bg-[#141517] rounded-3xl p-5 border border-white/5 space-y-4 shadow-xl">
                <div>
                  <span class="text-[9px] font-mono tracking-wider font-bold text-zinc-500 block uppercase">Gemini AI Helper</span>
                  <h4 class="text-xs font-bold text-zinc-200 mt-0.5">Scrape & Enrich Catalog</h4>
                </div>

                <div class="space-y-3">
                  <p class="text-[10px] text-zinc-500 font-mono leading-relaxed">Let Gemini AI automatically scrape plot, director, high-fidelity posters, and real IMDb scores for custom titles in the catalog lists.</p>
                  <div class="flex gap-2">
                    <input type="text" placeholder="Title keywords..." bind:value={aiQuery} class="w-full bg-black/45 focus:bg-black border border-white/5 p-2 rounded-xl text-xs text-zinc-200 outline-none font-mono" />
                    <button onclick={generateAIMetadataDirect} disabled={aiGenerating} class="p-2 px-3 bg-pink-500 text-white rounded-xl flex items-center justify-center cursor-pointer" style="background-color: {accentHex}">
                      {#if aiGenerating}
                        <RefreshCw class="w-3.5 h-3.5 animate-spin" />
                      {:else}
                        <Sparkles class="w-3.5 h-3.5" />
                      {/if}
                    </button>
                  </div>
                  {#if aiFeedback}
                    <p class="text-[9px] font-mono bg-black/35 border border-white/5 p-2 rounded-lg text-yellow-400">{aiFeedback}</p>
                  {/if}
                </div>
              </div>
            </div>

            <!-- Right side Grid list catalogs -->
            <div class="lg:col-span-9 space-y-5">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-bold text-zinc-200 uppercase font-mono tracking-wider">Cinephile catalogs</h3>
                  <p class="text-[11px] text-zinc-500">{filteredCatalog.length} records matching guidelines index filters.</p>
                </div>
              </div>

              {#if isLoadingMedia}
                <div class="p-20 text-center text-zinc-500 text-xs font-mono space-y-2.5">
                  <RefreshCw class="w-7 h-7 mx-auto animate-spin text-zinc-600" />
                  <p>Spanning local disks libraries...</p>
                </div>
              {:else if filteredCatalog.length === 0}
                <div class="p-20 border border-dashed border-white/5 rounded-3xl text-center text-zinc-500 text-xs font-mono space-y-2">
                  <Search class="w-8 h-8 text-zinc-600 mx-auto stroke-1" />
                  <p>No streams spotted matching these search specifications.</p>
                </div>
              {:else}
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-7">
                  {#each filteredCatalog as item (item.id)}
                    <div class="group relative flex flex-col justify-between text-left h-full">
                      <!-- Movie cover item -->
                      <div class="relative aspect-[2/3] overflow-hidden rounded-2xl bg-zinc-900 border border-white/5 shadow group-hover:border-pink-500 transition-all duration-300" style="border-color: {activeMedia?.id === item.id ? accentHex : ''}">
                        <img src={item.posterUrl} alt={item.title} class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3.5 space-y-2 z-10">
                          <p class="text-[10px] text-zinc-300 line-clamp-3 font-mono leading-normal">{item.summary}</p>
                          <div class="flex gap-1">
                            <button onclick={() => handlePlayMedia(item)} class="w-full py-1.5 bg-pink-500 text-white font-extrabold text-[10px] uppercase font-mono rounded-lg flex items-center justify-center gap-1 cursor-pointer" style="background-color: {accentHex}">
                              <Play class="w-3 h-3 fill-white" /> Stream
                            </button>
                            <button onclick={() => deleteMediaItem(item.id)} class="p-1 px-2 bg-zinc-800 text-zinc-400 hover:text-red-400 transition rounded-lg cursor-pointer">
                              <Trash2 class="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        {#if item.rating}
                          <span class="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-md text-[9px] font-bold text-[#ffa033] px-2 py-0.5 rounded-md border border-white/5 font-mono">
                            ★ {item.rating}
                          </span>
                        {/if}
                        {#if item.isLocal}
                          <span class="absolute bottom-2.5 right-2.5 bg-zinc-900/90 text-[8px] font-bold text-zinc-400 px-1.5 py-0.5 rounded border border-white/5 font-mono uppercase tracking-wider">
                            LOCAL DISK
                          </span>
                        {/if}
                      </div>

                      <div class="mt-2.5">
                        <h4 class="text-xs font-bold text-zinc-200 line-clamp-1">{item.title}</h4>
                        <div class="flex justify-between items-center text-[10px] font-mono text-zinc-500 mt-0.5">
                          <span>{item.releaseYear || '2024'} • {item.genres[0]}</span>
                          <span>Scored: {item.playCount || 0}x</span>
                        </div>
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/if}

      <!-- ================== TAB 3: FRIENDS WATCH LOBBY ================== -->
      {#if activeTab === 'friends'}
        <div id="tab-friends" class="w-full max-w-5xl mx-auto space-y-6 text-left animate-fade-in pb-12">
          <!-- Main Watch party active rooms header -->
          <div class="bg-gradient-to-tr from-[#1b1c20] to-[#0f1012] p-8 border border-white/5 rounded-3xl relative overflow-hidden shadow-2xl">
            <div class="absolute -right-32 -bottom-32 w-80 h-80 rounded-full blur-3xl opacity-10" style="background-color: {accentHex}" />
            
            <div class="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
              <div class="space-y-2">
                <span class="text-[10px] font-mono uppercase tracking-wider font-bold bg-[#ffa033]/15 text-[#ffa033] border border-[#ffa033]/25 px-2.5 py-0.5 rounded">WATCH TOGETHER</span>
                <h1 class="text-2xl font-black text-white">Active Synchronization Lobbies</h1>
                <p class="text-xs text-zinc-400 max-w-lg font-mono">Generate localized sharing links to match timing coordinates with friends watching movie, audio, or clip streams synchronously.</p>
              </div>

              <div class="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <div class="flex items-center gap-2 bg-black/45 p-2.5 rounded-xl border border-white/5 w-60">
                  <input type="text" placeholder="Enter Room Code..." bind:value={roomCodeInput} class="bg-transparent text-xs text-zinc-200 outline-none w-full font-mono uppercase" />
                  <button onclick={joinWatchLobby} class="text-pink-500 hover:text-pink-400 transition cursor-pointer" style="color: {accentHex}">
                    <ArrowRight class="w-4 h-4" />
                  </button>
                </div>
                
                <span class="text-xs font-mono text-zinc-500">OR</span>
                <button onclick={createWatchLobby} class="px-4 py-2.5 bg-pink-500 hover:scale-105 rounded-xl font-extrabold text-white text-xs font-mono uppercase transition cursor-pointer" style="background-color: {accentHex}">
                  Create Room
                </button>
              </div>
            </div>
          </div>

          <!-- Active watch details synced -->
          {#if watchParty}
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <!-- Chat Box -->
              <div class="lg:col-span-8 bg-[#141517] rounded-3xl border border-white/5 p-6 space-y-4 shadow-xl">
                <div class="flex justify-between items-center border-b border-white/5 pb-3">
                  <div>
                    <span class="text-[9px] font-mono uppercase text-pink-400 font-bold" style="color: {accentHex}">Active party</span>
                    <h3 class="text-sm font-bold text-zinc-200 mt-0.5">Lobby Synchronized Feed ({watchParty.roomId})</h3>
                  </div>
                  <button onclick={leaveWatchParty} class="px-3 py-1 bg-zinc-800 text-zinc-400 uppercase font-mono font-bold text-[9px] rounded hover:text-white transition cursor-pointer">Leave Room</button>
                </div>

                <!-- Chat message logs -->
                <div class="h-64 overflow-y-auto space-y-3 p-2 bg-black/20 rounded-2xl border border-white/[0.03]">
                  {#each watchParty.chat as msg}
                    <div class="text-xs">
                      <span class="font-bold text-zinc-200">{msg.userName}:</span>
                      <span class="text-zinc-400 ml-1.5">{msg.text}</span>
                      <span class="text-[9px] text-zinc-600 font-mono ml-2">({msg.timestamp})</span>
                    </div>
                  {/each}
                </div>

                <div class="flex gap-2.5">
                  <input type="text" placeholder="Type room messages..." bind:value={chatMessage} onkeydown={(e) => { if (e.key === 'Enter') sendWatchPartyChat(); }} class="w-full bg-black/45 focus:bg-black border border-white/5 p-3 rounded-xl text-xs outline-none text-zinc-200" />
                  <button onclick={sendWatchPartyChat} class="p-3 bg-pink-500 text-white rounded-xl flex items-center justify-center cursor-pointer" style="background-color: {accentHex}">
                    <Send class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <!-- Lobby members -->
              <div class="lg:col-span-4 bg-[#141517] rounded-3xl border border-white/5 p-6 shadow-xl space-y-4">
                <div>
                  <h3 class="text-sm font-bold text-zinc-200">Active Participants</h3>
                  <p class="text-[10px] text-zinc-500">Live watchers synced under exact timing buffers.</p>
                </div>
                <div class="space-y-2">
                  {#each watchParty.participants as viewer}
                    <div class="bg-black/35 p-3 rounded-xl border border-white/[0.02] flex items-center justify-between">
                      <div class="flex items-center gap-2.5">
                        <span class="w-7 h-7 bg-pink-500/10 text-pink-400 rounded-lg flex items-center justify-center font-bold font-mono text-xs uppercase" style="color: {accentHex}">{viewer.name.charAt(0)}</span>
                        <div class="text-left">
                          <p class="text-xs font-bold text-zinc-200">{viewer.name}</p>
                          <p class="text-[9px] text-zinc-500 font-mono mt-0.5">Id: {viewer.id.substring(0,6)}</p>
                        </div>
                      </div>
                      <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          {/if}

          <!-- Standard sidebar logs list -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div class="lg:col-span-4 bg-[#141517] rounded-3xl p-6 border border-white/5 space-y-4 shadow-xl">
              <div class="flex justify-between items-center text-xs">
                <span class="text-zinc-500 font-bold uppercase tracking-wider text-[9px] font-mono block">Peer Contacts</span>
              </div>
              <div class="space-y-3">
                {#each friends as user}
                  <div class="flex items-center justify-between p-3 bg-black/25 rounded-2xl border border-white/[0.02]">
                    <div class="flex items-center gap-2.5">
                      <span class="w-7 h-7 bg-zinc-800 text-zinc-300 rounded font-bold font-mono flex items-center justify-center text-xs">{user.avatar}</span>
                      <div class="text-left">
                        <span class="text-xs font-bold text-zinc-200">{user.name}</span>
                        {#if user.watching}
                          <p class="text-[9px] text-zinc-500 line-clamp-1 font-mono">{user.watching}</p>
                        {/if}
                      </div>
                    </div>
                    <span class="text-[9px] font-mono px-2 py-0.5 rounded border border-white/5" class:bg-emerald-500-10={user.status === 'Online'} class:text-emerald-400={user.status === 'Online'} class:text-zinc-500={user.status === 'Offline'}>
                      {user.status.toUpperCase()}
                    </span>
                  </div>
                {/each}
              </div>
            </div>

            <div class="lg:col-span-8 bg-[#141517] border border-white/5 rounded-3xl p-6 shadow-xl space-y-4">
              <div>
                <h3 class="text-sm font-bold text-zinc-200">Network Streams Ledger</h3>
                <p class="text-[10px] text-zinc-500">Live telemetry matching actions generated by sandbox friends connection.</p>
              </div>
              <div class="space-y-2.5">
                {#each friendLogs as log}
                  <div class="p-3 bg-black/25 rounded-2xl border border-white/[0.02] flex justify-between items-center text-xs text-zinc-300 font-mono">
                    <span class="text-zinc-400"><strong class="text-white">{log.friendName}</strong>: {log.action} <em class="text-zinc-400">'{log.mediaTitle}'</em></span>
                    <span class="text-[9px] text-zinc-600">{log.timestamp}</span>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- ================== TAB 4: ADDONS PLUGINS SYSTEM ================== -->
      {#if activeTab === 'plugins'}
        <div id="tab-plugins" class="w-full max-w-5xl mx-auto space-y-6 text-left animate-fade-in pb-12">
          
          <div class="bg-gradient-to-r from-[#17181c] to-[#0f1012] p-8 border border-white/5 rounded-3xl relative overflow-hidden shadow-2xl">
            <div class="absolute -right-32 -bottom-32 w-80 h-80 rounded-full blur-3xl opacity-10" style="background-color: {accentHex}" />
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 relative z-10">
              <div class="space-y-1.5">
                <span class="text-[10px] font-mono uppercase tracking-wider font-bold bg-[#ec4899]/15 text-[#ec4899] border border-[#ec4899]/25 px-2.5 py-0.5 rounded" style="color: {accentHex}; background-color: {accentHex}15; border-color: {accentHex}25">SANDBOX PLUGINS</span>
                <h1 class="text-2xl font-black text-white">Advanced Player Addons</h1>
                <p class="text-xs text-zinc-400 max-w-xl font-mono">Customize video buffers decoding filters, hook custom Javascript sandbox engines, or parse Stremio catalog streams.</p>
              </div>

              <!-- Sub tabs selection options -->
              <div class="bg-black/45 p-1 rounded-xl border border-white/5 flex gap-1 text-[10px] font-mono font-bold uppercase shrink-0">
                <button onclick={() => pluginsSubTab = 'js-hooks'} class="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white transition" class:bg-white-5={pluginsSubTab === 'js-hooks'} class:text-white={pluginsSubTab === 'js-hooks'}>
                  Hooks
                </button>
                <button onclick={() => pluginsSubTab = 'stremio-addons'} class="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white transition" class:bg-white-5={pluginsSubTab === 'stremio-addons'} class:text-white={pluginsSubTab === 'stremio-addons'}>
                  community_addons
                </button>
              </div>
            </div>
          </div>

          <!-- Plugin Views -->
          {#if pluginsSubTab === 'js-hooks'}
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <!-- Plugin Creator -->
              <div class="lg:col-span-5 bg-[#141517] rounded-3xl p-6 border border-white/5 space-y-4 shadow-xl text-xs">
                <div>
                  <h3 class="text-sm font-bold text-zinc-200">Inject Sandbox JS Module</h3>
                  <p class="text-[10px] text-zinc-500 font-mono mt-0.5">Author custom scripts utilizing API event listeners.</p>
                </div>

                <div class="space-y-3">
                  <label class="block space-y-1">
                    <span class="text-zinc-500 font-bold uppercase tracking-wider text-[9px] font-mono">Addon Name</span>
                    <input type="text" placeholder="Night Vision shader" bind:value={newPluginName} class="w-full bg-black/45 focus:bg-black border border-white/5 p-2.5 rounded-xl text-zinc-200" />
                  </label>
                  
                  <label class="block space-y-1">
                    <span class="text-zinc-500 font-bold uppercase tracking-wider text-[9px] font-mono">Module Type</span>
                    <select bind:value={newPluginType} class="w-full bg-black/45 border border-white/5 p-2.5 rounded-xl text-zinc-200 outline-none uppercase font-mono tracking-widest text-[9px]">
                      <option value="video-filter">Video Filter Shader</option>
                      <option value="subtitle-translator">Subtitles Translator</option>
                      <option value="visuals">Visual Bloom</option>
                    </select>
                  </label>

                  <label class="block space-y-1">
                    <span class="text-zinc-500 font-bold uppercase tracking-wider text-[9px] font-mono">Code Script</span>
                    <textarea placeholder="// custom plugin module template" bind:value={newPluginCode} rows="6" class="w-full bg-black/45 focus:bg-black border border-white/5 p-2.5 rounded-xl text-zinc-200 font-mono text-[10px]" />
                  </label>

                  <button onclick={createCustomPlugin} class="w-full py-2.5 bg-pink-500 hover:bg-pink-600 rounded-xl font-bold uppercase font-mono text-[10px] tracking-wider text-white flex items-center justify-center gap-1 cursor-pointer" style="background-color: {accentHex}">
                    <Check class="w-3.5 h-3.5" /> Save Plugin
                  </button>
                </div>
              </div>

              <!-- Plugins list -->
              <div class="lg:col-span-7 bg-[#141517] rounded-3xl border border-white/5 p-6 shadow-xl space-y-4">
                <div>
                  <h3 class="text-sm font-bold text-zinc-200">Active Pipeline Addons</h3>
                  <p class="text-[10px] text-zinc-500 font-mono mt-0.5">Toggle active components intercepting player processes.</p>
                </div>

                <div class="space-y-3.5">
                  {#each plugins as p (p.id)}
                    <div class="p-4 bg-black/35 rounded-2xl border border-white/[0.02] flex items-start justify-between gap-4">
                      <div class="space-y-1 flex-grow text-left">
                        <div class="flex items-center gap-2.5">
                          <span class="text-xs font-bold text-zinc-200">{p.name}</span>
                          <span class="text-[8px] bg-white/5 font-mono font-bold px-1.5 py-0.5 rounded text-zinc-500 uppercase">{p.type}</span>
                        </div>
                        <p class="text-[10px] text-zinc-500 leading-normal">{p.description}</p>
                        <p class="text-[9px] text-zinc-600 font-mono">Author: {p.author} • v{p.version}</p>
                      </div>

                      <div class="flex items-center gap-3 shrink-0">
                        <!-- Switch toggle -->
                        <!-- svelte-ignore a11y_click_events_have_key_actions -->
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <div onclick={() => togglePlugin(p)} class="w-9 h-5 bg-zinc-800 rounded-full flex items-center p-0.5 cursor-pointer transition-all duration-300" style={p.enabled ? `background-color: ${accentHex}` : ''}>
                          <div class="w-4 h-4 bg-white rounded-full shadow transition-transform duration-300" style={p.enabled ? 'transform: translateX(16px)' : ''} />
                        </div>
                        <button onclick={() => deletePlugin(p.id)} class="text-zinc-600 hover:text-red-400 transition cursor-pointer">
                          <Trash2 class="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          {/if}

          <!-- Stremio Addons manager -->
          {#if pluginsSubTab === 'stremio-addons'}
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
              <div class="lg:col-span-12 bg-[#141517] rounded-3xl p-6 border border-white/5 space-y-4 shadow-xl text-xs">
                <div class="flex justify-between items-start flex-wrap gap-4">
                  <div class="text-left">
                    <h3 class="text-sm font-bold text-zinc-200">Stremio Addon manifest Installer</h3>
                    <p class="text-[10px] text-zinc-500 font-mono">Provide direct addon manifest URL (starts with https:// or stremio://) to load mock Stremio endpoints directly.</p>
                  </div>
                </div>

                <div class="flex gap-2.5">
                  <input type="text" placeholder="stremio://torrentio.strem.fun/manifest.json" bind:value={stremioUrlInput} class="w-full bg-black/45 focus:bg-black border border-white/5 p-3 rounded-xl outline-none font-mono text-zinc-300" />
                  <button onclick={connectStremioAddon} disabled={stremioLoading} class="px-5 py-3 bg-pink-500 hover:scale-105 transition rounded-xl font-bold uppercase font-mono text-white tracking-wider cursor-pointer font-extrabold" style="background-color: {accentHex}">
                    {#if stremioLoading}Connecting{:else}Deploy{/if}
                  </button>
                </div>
                {#if stremioError}
                  <p class="text-[10px] font-mono text-red-400 bg-red-500/10 p-2.5 border border-red-500/25 rounded-xl">{stremioError}</p>
                {/if}
              </div>

              <!-- Stream query client -->
              <div class="lg:col-span-12 bg-[#141517] border border-white/5 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
                <div>
                  <h3 class="text-sm font-bold text-zinc-200">Stremio Torrent Streams Explorer</h3>
                  <p class="text-[10px] text-zinc-500 mt-0.5">Test torrent indexes parsing logic directly on your player core.</p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label class="block space-y-1">
                    <span class="text-[9px] uppercase tracking-wider font-bold text-zinc-500 font-mono block">Installed Addon</span>
                    <select bind:value={selectedStremioAddonId} class="w-full bg-black/45 border border-white/5 p-2.5 rounded-xl text-zinc-200 outline-none">
                      <option value="">-- Choose Installed Addon --</option>
                      {#each plugins.filter(p => p.type === 'stremio') as addon}
                        <option value={addon.id}>{addon.name}</option>
                      {/each}
                    </select>
                  </label>

                  <label class="block space-y-1">
                    <span class="text-[9px] uppercase tracking-wider font-bold text-zinc-500 font-mono block">Mock IMDb ID</span>
                    <select bind:value={streamSearchId} class="w-full bg-black/45 border border-white/5 p-2.5 rounded-xl text-zinc-200 outline-none font-mono">
                      <option value="bbb-sample">tt0874211 (Big Buck Bunny)</option>
                      <option value="sintel-sample">tt1727581 (Sintel)</option>
                      <option value="tears-sample">tt2405051 (Tears of Steel)</option>
                    </select>
                  </label>

                  <div class="flex items-end">
                    <button onclick={queryStremioStreams} disabled={streamsLoading} class="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-white/5 rounded-xl text-zinc-300 font-bold uppercase font-mono cursor-pointer">
                      {#if streamsLoading}Spanning mesh...{:else}Query Streams{/if}
                    </button>
                  </div>
                </div>

                <!-- Streams Results list -->
                <div class="space-y-2.5 pt-2">
                  {#if foundStreams.length > 0}
                    {#each foundStreams as s}
                      <div class="bg-black/35 p-3.5 rounded-xl border border-white/[0.02] flex items-center justify-between gap-4 animate-fade-in text-left">
                        <div>
                          <p class="text-xs font-black text-[#ffa033]" style="color: {accentHex}">{s.name}</p>
                          <p class="text-[10px] text-zinc-400 mt-1 leading-normal font-mono">{s.title}</p>
                        </div>
                        <button onclick={() => {
                          const customMedia: MediaItem = {
                            id: 'stremio_' + Math.random().toString(36).substring(2,8),
                            title: s.name + ` (${streamSearchId})`,
                            filename: 'strem_stream.mp4',
                            url: s.url,
                            type: 'movie',
                            duration: 900,
                            posterUrl: 'https://images.unsplash.com/photo-1542204172-e7052809a936?q=80&w=800',
                            bannerUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200',
                            releaseYear: '2024',
                            genres: ['Addon Cast'],
                            summary: s.title,
                            playCount: 1,
                            playProgress: 0,
                            isLocal: false,
                            subtitles: []
                          };
                          handlePlayMedia(customMedia);
                        }} class="px-3.5 py-1.5 bg-pink-500 font-extrabold text-[10px] uppercase font-mono rounded-lg text-white shrink-0 cursor-pointer" style="background-color: {accentHex}">
                          Play
                        </button>
                      </div>
                    {/each}
                  {:else if !streamsLoading}
                    <p class="text-[10px] text-zinc-500 font-mono text-center py-4">Choose an active Stremio addon above and trigger Query Streams parameter.</p>
                  {/if}
                </div>
              </div>
            </div>
          {/if}
        </div>
      {/if}

      <!-- ================== TAB 5: UNIFIED CONTROL CENTER ================== -->
      {#if activeTab === 'settings'}
        <div id="tab-settings" class="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 text-left font-sans animate-fade-in pb-12">
          
          <div class="lg:col-span-6 flex flex-col gap-6">
            <!-- Audio Equalizer visualizer card -->
            <div class="bg-[#141517] rounded-3xl p-6 border border-white/5 space-y-6 shadow-xl relative overflow-hidden">
              <div>
                <span class="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-bold block">Digital processing</span>
                <h3 class="text-sm font-bold text-zinc-100 mt-0.5">IINA Core Audio Equalizer</h3>
              </div>

              <!-- High contrast graphic frequency visualizer node -->
              <div class="bg-black/35 rounded-2xl border border-white/[0.02] p-4 flex items-end justify-between h-36">
                {#each [
                  { label: "60Hz", val: eqGains.hz60, field: 'hz60' },
                  { label: "230Hz", val: eqGains.hz230, field: 'hz230' },
                  { label: "910Hz", val: eqGains.hz910, field: 'hz910' },
                  { label: "4KHz", val: eqGains.hz4000, field: 'hz4000' },
                  { label: "14KHz", val: eqGains.hz14000, field: 'hz14000' }
                ] as freq}
                  <div class="flex flex-col items-center gap-1.5 h-full justify-between">
                    <span class="text-[8px] font-mono text-zinc-500">{freq.val > 0 ? '+' : ''}{freq.val}dB</span>
                    <div class="h-20 flex items-center justify-center relative w-6">
                      <input type="range" min="-12" max="12" bind:value={eqGains[freq.field]} class="absolute -rotate-90 origin-center w-20 accent-pink-500" style="accent-color: {accentHex}" />
                    </div>
                    <span class="text-[9px] font-mono text-zinc-400 font-black tracking-normal select-all mt-1">{freq.label}</span>
                  </div>
                {/each}
              </div>

              <div class="flex flex-wrap gap-2 text-[10px] font-mono">
                {#each [
                  { id: 'normal', name: 'FLAT NORMAL' },
                  { id: 'vocal', name: 'NIGHTTIME VOCAL' },
                  { id: 'bass', name: 'SUBBASS EXPLOSIONS' }
                ] as preset}
                  <button onclick={() => {
                    audioPreset = preset.id;
                    if (preset.id === 'normal') eqGains = { hz60: 0, hz230: 0, hz910: 0, hz4000: 0, hz14000: 0 };
                    if (preset.id === 'vocal') eqGains = { hz60: -3, hz230: -1, hz910: 5, hz4000: 4, hz14000: 1 };
                    if (preset.id === 'bass') eqGains = { hz60: 8, hz230: 6, hz910: 0, hz4000: -2, hz14000: -4 };
                  }} class="px-3 py-1.5 rounded-lg border border-white/5 bg-zinc-900 transition hover:text-white uppercase" class:text-white={audioPreset === preset.id} style={audioPreset === preset.id ? `background-color: ${accentHex}20; border-color: ${accentHex}40; color: ${accentHex}` : ''}>
                    {preset.name}
                  </button>
                {/each}
              </div>
            </div>

            <!-- Server decoders settings options -->
            <div class="bg-[#141517] rounded-3xl p-6 border border-white/5 space-y-4 shadow-xl">
              <div>
                <h3 class="text-sm font-bold text-zinc-200">Hardware & Buffer Pipeline</h3>
                <p class="text-[11px] text-zinc-500 mt-0.5">Customize real-time transcoder profiles.</p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label class="block space-y-1">
                  <span class="text-zinc-500 uppercase text-[9px] tracking-wider block font-bold font-mono">Decoder Channel</span>
                  <select bind:value={serverTranscoder} class="w-full bg-black/45 border border-white/5 p-2 rounded-xl text-zinc-300">
                    <option value="1080p Original">1080p Copy Original</option>
                    <option value="720p Compressed">720p Web Optimized</option>
                    <option value="Dolby Atoms Audio">Dolby Atoms Passthrough</option>
                  </select>
                </label>

                <label class="block space-y-1">
                  <span class="text-zinc-500 uppercase text-[9px] tracking-wider block font-bold font-mono">Bandwidth limits</span>
                  <select bind:value={serverBandwidthLimit} class="w-full bg-black/45 border border-white/5 p-2 rounded-xl text-zinc-300 select-none">
                    <option value="unlimited">Unlimited Gigabuffer</option>
                    <option value="10mbps">Restrict 10Mbps</option>
                    <option value="5mbps">Restrict 5Mbps Mobile</option>
                  </select>
                </label>
              </div>
            </div>
          </div>

          <div class="lg:col-span-6 flex flex-col gap-6">
            <!-- App Info & System updates -->
            <div class="bg-[#141517] rounded-3xl p-6 border border-white/5 space-y-5 shadow-2xl relative overflow-hidden text-left">
              <div class="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 blur-3xl pointer-events-none rounded-full" style="background-color: {accentHex}10" />
              
              <div class="flex justify-between items-start border-b border-white/5 pb-3">
                <div>
                  <span class="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold block">Release Channel: Stable</span>
                  <h3 class="text-sm font-bold text-white mt-1">Application Info & Updates</h3>
                </div>
                <span class="text-[9px] bg-white/5 text-zinc-300 font-mono font-bold px-2.5 py-1 rounded-md uppercase border border-white/5">
                  v2.2.0-secure
                </span>
              </div>

              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-3 text-xs">
                  <div class="bg-black/20 p-3 rounded-lg border border-white/[0.03]">
                    <p class="text-[9px] text-zinc-500 font-mono uppercase">Framework</p>
                    <p class="font-semibold text-zinc-200 mt-1">SvelteKit 2 / Tailwind</p>
                  </div>
                  <div class="bg-black/20 p-3 rounded-lg border border-white/[0.03]">
                    <p class="text-[9px] text-zinc-500 font-mono uppercase">License Mode</p>
                    <p class="font-semibold text-zinc-200 mt-1">Apache-2.0</p>
                  </div>
                  <div class="bg-black/20 p-3 rounded-lg border border-white/[0.03]">
                    <p class="text-[9px] text-zinc-500 font-mono uppercase">Last Build</p>
                    <p class="font-semibold text-zinc-200 mt-1">2026-06-19</p>
                  </div>
                  <div class="bg-black/20 p-3 rounded-lg border border-[#ffffff05]">
                    <p class="text-[9px] text-zinc-500 font-mono uppercase">Security Patch</p>
                    <p class="font-semibold text-emerald-400 mt-1">Verified</p>
                  </div>
                </div>

                <div class="bg-black/35 border border-white/5 rounded-xl p-4 space-y-4 text-xs">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="p-1.5 rounded-lg bg-white/5 text-zinc-400">
                        <RefreshCw class="w-4 h-4" class:animate-spin={checkingUpdates} style={checkingUpdates ? `color: ${accentHex}` : ''} />
                      </span>
                      <div class="text-left">
                        <h4 class="text-xs font-bold text-zinc-200">System Updater</h4>
                        <p class="text-[10px] text-zinc-400">
                          {#if updateStatus === 'idle'}
                            Last checked: Just now
                          {:else if updateStatus === 'up-to-date'}
                            Your application is fully up-to-date.
                          {:else if updateStatus === 'found'}
                            New stable release available!
                          {/if}
                        </p>
                      </div>
                    </div>
                    
                    {#if updateStatus !== 'found'}
                      <button
                        onclick={() => {
                          if (checkingUpdates) return;
                          checkingUpdates = true;
                          updateStatus = 'idle';
                          setTimeout(() => {
                            checkingUpdates = false;
                            updateStatus = Math.random() > 0.4 ? 'found' : 'up-to-date';
                          }, 1200);
                        }}
                        class="px-3 py-1.5 bg-[#1b1c1e] hover:bg-zinc-800 border border-white/10 rounded-lg text-xs font-semibold text-zinc-200 hover:text-white transition cursor-pointer font-mono uppercase"
                        disabled={checkingUpdates}
                      >
                        {checkingUpdates ? 'Checking...' : 'Check'}
                      </button>
                    {/if}
                  </div>

                  {#if updateStatus === 'up-to-date'}
                    <div class="bg-[#121314]/85 border border-[#10b98125] p-3 rounded-lg flex items-center gap-2 text-xs text-emerald-400 font-mono">
                      <Check class="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>No updates found. Your application is fully opt-in and up-to-date.</span>
                    </div>
                  {/if}

                  {#if updateStatus === 'found'}
                    <div class="bg-[#2d1e0d] border border-[#ffa033]/20 p-3.5 rounded-lg space-y-2.5" style="background-color: {accentHex}10; border-color: {accentHex}30">
                      <div class="flex items-start gap-2.5 text-xs text-[#ffa033]" style="color: {accentHex}">
                        <Sparkles class="w-4 h-4 shrink-0 mt-0.5" />
                        <div class="text-left">
                          <span class="font-bold">v2.2.2 stable available</span>
                          <p class="text-[10px] text-zinc-400 mt-0.5">Includes Dolby Atmos surround expansion options and native H.265 level-5 profiling enhancements.</p>
                        </div>
                      </div>
                      <div class="flex gap-2 justify-end text-[10px] font-mono uppercase">
                        <button onclick={() => updateStatus = 'idle'} class="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold transition py-1 px-3 rounded-md cursor-pointer">
                          Ignore
                        </button>
                        <button
                          onclick={() => {
                            alert("Installing SvelteKit updates. The player client will now hot-patch.");
                            checkingUpdates = true;
                            setTimeout(() => {
                              checkingUpdates = false;
                              updateStatus = 'up-to-date';
                            }, 1500);
                          }}
                          class="bg-[#ffa033] hover:bg-[#ffb459] text-black font-extrabold transition py-1 px-3 rounded-md cursor-pointer"
                          style="background-color: {accentHex}"
                        >
                          Install Update
                        </button>
                      </div>
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}

    </main>
  </div>
</div>
