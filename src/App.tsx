/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Bookmark } from 'lucide-react';
import { TvTopNav, TvTab } from './components/tv/TvTopNav';
import { 
  TvHeroBillboard, 
  SPOTLIGHT_SHOWS, 
  SPOTLIGHT_MOVIES, 
  DEFAULT_CONTINUE_WATCHING, 
  DEFAULT_CONTINUE_WATCHING_SHOWS 
} from './components/tv/TvHeroBillboard';
import { FeaturedMovie } from './lib/types';
import { TvContentRow } from './components/tv/TvContentRow';
import { TvPlayer } from './components/tv/TvPlayer';
import { TvDetailModal } from './components/tv/TvDetailModal';
import { TvStreamSelectorModal } from './components/tv/TvStreamSelectorModal';
import { TvRemoteOverlay } from './components/tv/TvRemoteOverlay';
import { TvSearchModal, UserCustomList } from './components/tv/TvSearchModal';
import { TvWatchParty } from './components/tv/TvWatchParty';
import { TvSettingsModal } from './components/tv/TvSettingsModal';
import { TvPluginModal } from './components/tv/TvPluginModal';
import { StreamingEngineHUD } from './components/StreamingEngineHUD';
import { globalStreamingEngine } from './lib/streamingEngine';
import { TvSidebar } from './components/tv/TvSidebar';
import { TvLibrariesView } from './components/tv/TvLibrariesView';
import { isTvSeries } from './lib/tvEpisodeData';
import { apiFetch } from './lib/apiAuth';
import { 
  DISNEY_PLUS_TOP_20,
  DISNEY_PLUS_TOP_20_SHOWS,
  AMAZON_PRIME_TOP_20,
  AMAZON_PRIME_TOP_20_SHOWS,
  APPLE_TV_TOP_20,
  APPLE_TV_TOP_20_SHOWS,
  NETFLIX_TOP_20,
  NETFLIX_TOP_20_SHOWS,
  HULU_TOP_20,
  HULU_TOP_20_SHOWS,
  HBO_MAX_TOP_20,
  HBO_MAX_TOP_20_SHOWS,
  LOCAL_MEDIA_FILES,
  SHARED_PEER_LIBRARIES,
  LocalMediaFileItem,
  SharedPeerLibrary
} from './lib/tvMediaData';

// Rich IMDb data dictionary for cinematic accuracy
export const IMDB_DATA: Record<string, { rating: string; certification: string; director: string; cast: string[]; plot: string; votes: string }> = {
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
  "dune-two": { rating: "8.5", certification: "PG-13", director: "Denis Villeneuve", cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson"], plot: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.", votes: "480K" },
  "deadpool-wolverine": { rating: "7.8", certification: "R", director: "Shawn Levy", cast: ["Ryan Reynolds", "Hugh Jackman", "Emma Corrin"], plot: "Deadpool is offered a place in the Marvel Cinematic Universe by the Time Variance Authority, but instead recruits a variant of Wolverine.", votes: "320K" },
  "shogun": { rating: "8.7", certification: "TV-MA", director: "Rachel Kondo", cast: ["Hiroyuki Sanada", "Cosmo Jarvis", "Anna Sawai"], plot: "When a mysterious European ship is found marooned in a nearby fishing village, Lord Yoshii Toranaga discovers secrets that could tip the scales of power.", votes: "190K" },
  "the-bear": { rating: "8.6", certification: "TV-MA", director: "Christopher Storer", cast: ["Jeremy Allen White", "Ayo Edebiri", "Ebon Moss-Bachrach"], plot: "A young chef from the fine dining world returns to Chicago to run his family's sandwich shop.", votes: "210K" },
  "severance": { rating: "8.7", certification: "TV-MA", director: "Dan Erickson", cast: ["Adam Scott", "Zach Cherry", "Britt Lower"], plot: "Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives.", votes: "230K" },
  "stranger-things": { rating: "8.7", certification: "TV-14", director: "The Duffer Brothers", cast: ["Millie Bobby Brown", "Finn Wolfhard", "Winona Ryder"], plot: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.", votes: "1.3M" },
  "squid-game": { rating: "8.0", certification: "TV-MA", director: "Hwang Dong-hyuk", cast: ["Lee Jung-jae", "Park Hae-soo", "Wi Ha-joon"], plot: "Hundreds of cash-strapped players accept a strange invitation to compete in children's games for a tempting prize.", votes: "540K" },
  "gladiator-two": { rating: "7.1", certification: "R", director: "Ridley Scott", cast: ["Paul Mescal", "Pedro Pascal", "Denzel Washington"], plot: "Years after witnessing the death of Maximus, Lucius must enter the Colosseum after his home is conquered by tyrannical emperors.", votes: "140K" },
  "the-last-of-us": { rating: "8.8", certification: "TV-MA", director: "Craig Mazin", cast: ["Pedro Pascal", "Bella Ramsey"], plot: "After a global pandemic destroys civilization, a hardened survivor takes charge of a 14-year-old girl who may be humanity's last hope.", votes: "560K" },
  "ted-lasso": { rating: "8.8", certification: "TV-MA", director: "Jason Sudeikis", cast: ["Jason Sudeikis", "Hannah Waddingham", "Brett Goldstein"], plot: "An American college football coach is hired to manage a British soccer team. What he lacks in knowledge, he makes up for with optimism.", votes: "310K" },
  "spirited-away": { rating: "8.6", certification: "PG", director: "Hayao Miyazaki", cast: ["Rumi Hiiragi", "Miyu Irino", "Mari Natsuki"], plot: "During her family's move to the suburbs, a 10-year-old girl wanders into a world ruled by gods, witches and spirits.", votes: "820K" },
  "spider-verse": { rating: "8.6", certification: "PG", director: "Joaquim Dos Santos", cast: ["Shameik Moore", "Hailee Steinfeld", "Oscar Isaac"], plot: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its existence.", votes: "360K" },
  "bbb-sample": { rating: "8.1", certification: "G", director: "Sacha Goedegeboure", cast: ["Big Buck Bunny", "Forest Animals"], plot: "A comedy about a fluffy rabbit who exacts revenge on three bullying rodents in a beautiful forest.", votes: "18K" },
  "sintel-sample": { rating: "7.7", certification: "PG", director: "Colin Levy", cast: ["Sintel", "Scales the Dragon"], plot: "A young woman named Sintel embarks on a dangerous quest to rescue Scales, her baby dragon companion.", votes: "12K" },
  "tears-sample": { rating: "7.4", certification: "PG-13", director: "Ian Hubert", cast: ["Celia", "VFX Crew"], plot: "Amsterdam scientists utilize a defense weapon to halt rogue mechanical giants, resurrecting romance.", votes: "9K" },
  "interstellar": { rating: "8.7", certification: "PG-13", director: "Christopher Nolan", cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"], plot: "When Earth becomes uninhabitable, a team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.", votes: "2.1M" },
  "parasite": { rating: "8.5", certification: "R", director: "Bong Joon-ho", cast: ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong"], plot: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.", votes: "950K" },
  "mad-max-fury-road": { rating: "8.1", certification: "R", director: "George Miller", cast: ["Tom Hardy", "Charlize Theron", "Nicholas Hoult"], plot: "In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search for her homeland with the aid of female prisoners.", votes: "1.1M" },
  "blade-runner-2049": { rating: "8.0", certification: "R", director: "Denis Villeneuve", cast: ["Ryan Gosling", "Harrison Ford", "Ana de Armas"], plot: "Young Blade Runner K's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard.", votes: "650K" },
  "godzilla-minus-one": { rating: "7.9", certification: "PG-13", director: "Takashi Yamazaki", cast: ["Ryunosuke Kamiki", "Minami Hamabe", "Yuki Yamada"], plot: "Post-war Japan is at its lowest point when an unexpected colossal monster emerges, tested by the nuclear fires.", votes: "180K" },
  "the-whale": { rating: "7.7", certification: "R", director: "Darren Aronofsky", cast: ["Brendan Fraser", "Sadie Sink", "Hong Chau"], plot: "A reclusive, morbidly obese English teacher attempts to reconnect with his estranged teenage daughter.", votes: "210K" },
  "anatomy-of-a-fall": { rating: "7.7", certification: "R", director: "Justine Triet", cast: ["Sandra Hüller", "Swann Arlaud", "Milo Machado-Graner"], plot: "A woman is suspected of murder after her husband's death in the snow, and their half-blind son is the sole witness.", votes: "160K" },
  "blackberry": { rating: "7.4", certification: "R", director: "Matt Johnson", cast: ["Jay Baruchel", "Glenn Howerton", "Matt Johnson"], plot: "The story of the meteoric rise and catastrophic demise of the world's first smartphone company.", votes: "78K" },
  "triangle-of-sadness": { rating: "7.3", certification: "R", director: "Ruben Östlund", cast: ["Thobias Thorwid", "Harris Dickinson", "Charlbi Dean"], plot: "A celebrity fashion couple is invited on a luxury cruise for the super-rich, where things go unpredictably awry.", votes: "155K" },
  "society-of-the-snow": { rating: "7.8", certification: "R", director: "J.A. Bayona", cast: ["Enzo Vogrincic", "Agustín Pardella", "Matías Recalt"], plot: "The flight of a rugby team crashes onto a glacier in the heart of the Andes, requiring heroic courage to survive.", votes: "135K" },
  "rebel-ridge": { rating: "7.0", certification: "R", director: "Jeremy Saulnier", cast: ["Aaron Pierre", "Don Johnson", "AnnaSophia Robb"], plot: "A former Marine confronts corruption in a small town after local law enforcement unjustly seizes his cousin's bail money.", votes: "92K" }
};

export const TRENDING_PLATFORMS: Record<string, { platforms: string[]; trendReason?: string }> = {
  "squid-game": { platforms: ["Netflix"], trendReason: "#1 Global Series" },
  "stranger-things": { platforms: ["Netflix"], trendReason: "#2 Top Watched Series" },
  "babygirl": { platforms: ["Netflix", "Paramount+"], trendReason: "#1 Movie on Netflix" },
  "spider-verse": { platforms: ["Netflix"], trendReason: "#1 Animated Hit on Netflix" },
  "materialists": { platforms: ["Netflix", "Apple TV"], trendReason: "#2 RomCom Hit" },
  "uncut-gems": { platforms: ["Netflix", "Peacock"], trendReason: "Top 10 Cult Thriller" },
  "pearl": { platforms: ["Netflix", "Paramount+"], trendReason: "#1 Horror on Paramount+" },
  "love-lies-bleeding": { platforms: ["Netflix", "Hulu"], trendReason: "Top 10 Thriller" },
  "shogun": { platforms: ["Hulu"], trendReason: "Emmy Award #1 Series on Hulu" },
  "the-bear": { platforms: ["Hulu", "Peacock"], trendReason: "#2 Top Comedy-Drama" },
  "deadpool-wolverine": { platforms: ["Hulu", "Paramount+"], trendReason: "#1 Action Movie Hit" },
  "bring-her-back": { platforms: ["Hulu"], trendReason: "#1 Horror Movie" },
  "moonlight": { platforms: ["Hulu", "Netflix"], trendReason: "Top 5 Drama Classic" },
  "x": { platforms: ["Hulu", "Paramount+"], trendReason: "Trending Slasher" },
  "the-last-of-us": { platforms: ["HBO Max"], trendReason: "#1 Sci-Fi Drama Series" },
  "dune-two": { platforms: ["HBO Max", "Paramount+"], trendReason: "#1 Sci-Fi Epic" },
  "civil-war": { platforms: ["HBO Max", "Peacock"], trendReason: "#1 Action Thriller" },
  "the-zone-of-interest": { platforms: ["HBO Max", "Apple TV"], trendReason: "Oscar Winning Drama" },
  "warfare": { platforms: ["HBO Max", "Paramount+"], trendReason: "Top 3 War Action" },
  "the-legend-of-ochi": { platforms: ["HBO Max", "Apple TV"], trendReason: "#1 Family Fantasy Hit" },
  "beau-is-afraid": { platforms: ["HBO Max", "Peacock"], trendReason: "Top 5 Surreal Feature" },
  "spirited-away": { platforms: ["HBO Max", "Netflix"], trendReason: "Top Anime Feature" },
  "severance": { platforms: ["Apple TV+"], trendReason: "#1 Sci-Fi Series on Apple TV+" },
  "ted-lasso": { platforms: ["Apple TV+"], trendReason: "#1 Comedy Series" },
  "sharper": { platforms: ["Apple TV+", "Paramount+"], trendReason: "#1 Thriller Movie" },
  "past-lives": { platforms: ["Apple TV+", "Peacock"], trendReason: "Top 5 Romance Drama" },
  "eddington": { platforms: ["Apple TV+", "Netflix"], trendReason: "#1 Western Drama" },
  "highest-2-lowest": { platforms: ["Apple TV+", "Hulu"], trendReason: "Trending Music Drama" },
  "gladiator-two": { platforms: ["Paramount+"], trendReason: "#1 Epic Release" },
  "heretic": { platforms: ["Peacock", "Netflix"], trendReason: "#1 Horror Stream" },
  "maxxxine": { platforms: ["Paramount+"], trendReason: "#1 Slasher Stream" },
  "bbb-sample": { platforms: ["Google TV Core"], trendReason: "Featured 4K Master" },
  "sintel-sample": { platforms: ["Google TV Core"], trendReason: "HDR Master Stream" },
  "tears-sample": { platforms: ["Google TV Core"], trendReason: "Sci-Fi Atmos Master" }
};

// Honest top-20 catalog rows — no modulo padding to fake a "Top 50".
export const NETFLIX_TOP_20_MOVIES = NETFLIX_TOP_20;
export const HULU_TOP_20_MOVIES = HULU_TOP_20;
export const HBO_MAX_TOP_20_MOVIES = HBO_MAX_TOP_20;
export const DISNEY_PLUS_TOP_20_MOVIES = DISNEY_PLUS_TOP_20;
export const AMAZON_PRIME_TOP_20_MOVIES = AMAZON_PRIME_TOP_20;
export const APPLE_TV_TOP_20_MOVIES = APPLE_TV_TOP_20;

export const GLOBAL_MOVIE_POSTERS: FeaturedMovie[] = [
  ...HBO_MAX_TOP_20,
  ...NETFLIX_TOP_20.filter(n => !HBO_MAX_TOP_20.some(h => h.id === n.id)),
  ...HULU_TOP_20.filter(u => !HBO_MAX_TOP_20.some(h => h.id === u.id) && !NETFLIX_TOP_20.some(n => n.id === u.id)),
  ...DISNEY_PLUS_TOP_20.filter(d => !HBO_MAX_TOP_20.some(h => h.id === d.id) && !NETFLIX_TOP_20.some(n => n.id === d.id)),
  ...AMAZON_PRIME_TOP_20.filter(a => !HBO_MAX_TOP_20.some(h => h.id === a.id) && !NETFLIX_TOP_20.some(n => n.id === a.id)),
  ...APPLE_TV_TOP_20.filter(ap => !HBO_MAX_TOP_20.some(h => h.id === ap.id) && !NETFLIX_TOP_20.some(n => n.id === ap.id)),
  ...HBO_MAX_TOP_20_SHOWS.filter(s => !HBO_MAX_TOP_20.some(h => h.id === s.id)),
  ...NETFLIX_TOP_20_SHOWS.filter(s => !HBO_MAX_TOP_20.some(h => h.id === s.id) && !NETFLIX_TOP_20.some(n => n.id === s.id)),
  ...HULU_TOP_20_SHOWS.filter(s => !HBO_MAX_TOP_20.some(h => h.id === s.id) && !NETFLIX_TOP_20.some(n => n.id === s.id)),
  ...DISNEY_PLUS_TOP_20_SHOWS.filter(s => !HBO_MAX_TOP_20.some(h => h.id === s.id)),
  ...AMAZON_PRIME_TOP_20_SHOWS.filter(s => !HBO_MAX_TOP_20.some(h => h.id === s.id)),
  ...APPLE_TV_TOP_20_SHOWS.filter(s => !HBO_MAX_TOP_20.some(h => h.id === s.id)),
];

export const getRichMovieDetail = (item: any) => {
  if (!item) return null;
  const imdbInfo = IMDB_DATA[item.id];
  return {
    ...item,
    rating: imdbInfo?.rating || item.rating || "8.4",
    certification: imdbInfo?.certification || item.certification || "PG-13",
    director: imdbInfo?.director || item.director || "Director",
    summary: imdbInfo?.plot || item.summary || "Full master resolution playback with Nascent ABR hardware acceleration.",
    cast: imdbInfo?.cast || item.cast || ["Ensemble Cast"]
  };
};

/** Rotate an honest top-20 list deterministically by calendar date (no padding). */
export function getDailyUpdatedTop20(items: FeaturedMovie[], seedOffset: number = 0): FeaturedMovie[] {
  const list = items.slice(0, 20);
  if (list.length === 0) return [];
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  const shift = (dayOfYear + seedOffset) % list.length;
  return [...list.slice(shift), ...list.slice(0, shift)];
}

export const isMovieItem = (item: FeaturedMovie): boolean => {
  if (!item) return false;
  return !isTvSeries(item);
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TvTab>('movies');
  const [moviesList, setMoviesList] = useState<FeaturedMovie[]>(GLOBAL_MOVIE_POSTERS);
  const [featuredIndex, setFeaturedIndex] = useState<number>(0);
  const [selectedMovie, setSelectedMovie] = useState<FeaturedMovie | null>(null);
  const [selectedShow, setSelectedShow] = useState<FeaturedMovie | null>(null);
  const [activePlayerMovie, setActivePlayerMovie] = useState<FeaturedMovie | null>(null);
  const [inspectedMovie, setInspectedMovie] = useState<FeaturedMovie | null>(null);
  const [watchPartyMovie, setWatchPartyMovie] = useState<FeaturedMovie | null>(null);

  // Left sidebar & Peer node state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedPeerId, setSelectedPeerId] = useState<string | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [connectCodeInput, setConnectCodeInput] = useState('');
  const [connectStatusMsg, setConnectStatusMsg] = useState<string | null>(null);
  const [isScanningLocal, setIsScanningLocal] = useState(false);
  const [scanFeedback, setScanFeedback] = useState<string | null>(null);

  // User-created custom lists
  const [userCustomLists, setUserCustomLists] = useState<UserCustomList[]>(() => {
    try {
      const saved = localStorage.getItem('nascent_tv_user_lists');
      return saved ? JSON.parse(saved) : [
        {
          id: 'favorites',
          name: 'Favorites',
          description: 'Personal all-time favorite cinematic masterpieces',
          movieIds: ['dune-two', 'oppenheimer', 'spider-verse', 'past-lives'],
          createdAt: new Date().toISOString()
        },
        {
          id: 'weekend-binge',
          name: 'Weekend Marathon',
          description: 'Addictive binge-worthy TV shows',
          movieIds: ['the-bear', 'shogun', 'stranger-things', 'succession'],
          createdAt: new Date().toISOString()
        },
        {
          id: 'sci-fi-hall-of-fame',
          name: 'Sci-Fi Hall of Fame',
          description: 'High concept mind-benders and space odysseys',
          movieIds: ['severance', 'dark', 'black-mirror', 'interstellar-master'],
          createdAt: new Date().toISOString()
        }
      ];
    } catch {
      return [];
    }
  });

  const handleCreateUserList = (name: string, description?: string) => {
    const newList: UserCustomList = {
      id: `list-${Date.now()}`,
      name,
      description,
      movieIds: [],
      createdAt: new Date().toISOString()
    };
    setUserCustomLists(prev => {
      const updated = [...prev, newList];
      localStorage.setItem('nascent_tv_user_lists', JSON.stringify(updated));
      return updated;
    });
  };
  
  // Daily top-20 catalog rotation
  const todayDateString = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, []);

  const [localMediaFiles, setLocalMediaFiles] = useState<LocalMediaFileItem[]>(LOCAL_MEDIA_FILES);

  // Pure Movies Only list for the Movies tab hero & navigation
  const pureMoviesList = useMemo(() => {
    return GLOBAL_MOVIE_POSTERS.filter(isMovieItem);
  }, []);

  // Pure TV Shows list for the TV Shows tab
  const pureShowsList = useMemo(() => {
    return [
      ...NETFLIX_TOP_20_SHOWS,
      ...HULU_TOP_20_SHOWS,
      ...HBO_MAX_TOP_20_SHOWS,
      ...DISNEY_PLUS_TOP_20_SHOWS,
      ...AMAZON_PRIME_TOP_20_SHOWS,
      ...APPLE_TV_TOP_20_SHOWS,
    ];
  }, []);

  // Top 20 Movies per platform (strictly filtered to movies only)
  const dailyNetflixMovies = useMemo(() => getDailyUpdatedTop20(NETFLIX_TOP_20, 0).filter(isMovieItem), []);
  const dailyHuluMovies = useMemo(() => getDailyUpdatedTop20(HULU_TOP_20, 0).filter(isMovieItem), []);
  const dailyHboMovies = useMemo(() => getDailyUpdatedTop20(HBO_MAX_TOP_20, 0).filter(isMovieItem), []);
  const dailyDisneyMovies = useMemo(() => getDailyUpdatedTop20(DISNEY_PLUS_TOP_20, 1).filter(isMovieItem), []);
  const dailyAmazonMovies = useMemo(() => getDailyUpdatedTop20(AMAZON_PRIME_TOP_20, 2).filter(isMovieItem), []);
  const dailyAppleMovies = useMemo(() => getDailyUpdatedTop20(APPLE_TV_TOP_20, 3).filter(isMovieItem), []);

  // Top 20 TV Shows per platform
  const dailyNetflixShows = useMemo(() => getDailyUpdatedTop20(NETFLIX_TOP_20_SHOWS, 0), []);
  const dailyHuluShows = useMemo(() => getDailyUpdatedTop20(HULU_TOP_20_SHOWS, 0), []);
  const dailyHboShows = useMemo(() => getDailyUpdatedTop20(HBO_MAX_TOP_20_SHOWS, 0), []);
  const dailyDisneyShows = useMemo(() => getDailyUpdatedTop20(DISNEY_PLUS_TOP_20_SHOWS, 1), []);
  const dailyAmazonShows = useMemo(() => getDailyUpdatedTop20(AMAZON_PRIME_TOP_20_SHOWS, 2), []);
  const dailyAppleShows = useMemo(() => getDailyUpdatedTop20(APPLE_TV_TOP_20_SHOWS, 3), []);

  const handleLibraryRescan = async () => {
    const res = await apiFetch('/api/media/rescan', { method: 'POST' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as { error?: string }).error || `Rescan failed (${res.status})`);
    }
    const data = await res.json();
    if (Array.isArray(data.media)) {
      const mapped: LocalMediaFileItem[] = data.media.map((m: Record<string, unknown>) => {
        const filename = String(m.filename || '');
        const streamUrl = String(
          m.url || (filename ? `/api/stream/${encodeURIComponent(filename)}` : '')
        );
        return {
          id: String(m.id),
          filename: filename || String(m.id),
          title: String(m.title || filename || 'Untitled'),
          path: filename ? `media/${filename}` : streamUrl,
          resolution: String(m.resolution || '—'),
          fps: String(m.fps || '—'),
          codec: String(m.codec || '—'),
          container: filename ? filename.split('.').pop()?.toUpperCase() || '—' : '—',
          audioTrack: String(m.audioTrack || '—'),
          fileSize: String(m.fileSize || '—'),
          bitrate: String(m.bitrate || '—'),
          duration:
            typeof m.duration === 'number'
              ? `${Math.floor(m.duration / 60)}m`
              : String(m.duration || '—'),
          releaseYear: String(m.releaseYear || ''),
          posterUrl: String(m.posterUrl || ''),
          bannerUrl: String(m.bannerUrl || ''),
          genres: Array.isArray(m.genres) ? (m.genres as string[]) : [],
          rating: typeof m.rating === 'number' ? m.rating : 0,
          certification: String(m.certification || ''),
          director: String(m.director || ''),
          summary: String(m.summary || ''),
          streamUrl,
        };
      });
      if (mapped.length > 0) setLocalMediaFiles(mapped);
    }
    return {
      scanned: Number(data.scanned) || 0,
      added: Number(data.added) || 0,
      total: Number(data.total) || 0,
    };
  };
  
  // UI Dialog states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isVoiceSearchRequested, setIsVoiceSearchRequested] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPluginModalOpen, setIsPluginModalOpen] = useState(false);
  const [isRemoteOpen, setIsRemoteOpen] = useState(false);
  const [isStreamingHUDOpen, setIsStreamingHUDOpen] = useState(false);
  const [streamSelectorMovie, setStreamSelectorMovie] = useState<FeaturedMovie | null>(null);

  // User Watchlist & History persistence
  const [watchlistIds, setWatchlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nitro_tv_watchlist');
      return saved ? JSON.parse(saved) : ['dune-two', 'severance', 'civil-war', 'shogun'];
    } catch {
      return ['dune-two', 'severance', 'civil-war'];
    }
  });

  const [progressMap, setProgressMap] = useState<Record<string, number>>(() => ({
    'dune-two': 72,
    'shogun': 45,
    'bbb-sample': 88,
    'severance': 25,
    'spider-verse': 60
  }));

  // Equalizer Frequencies
  const [eqGains, setEqGains] = useState({
    hz60: 3,
    hz230: 1,
    hz910: 0,
    hz4000: 2,
    hz14000: 4
  });
  const [audioPreset, setAudioPreset] = useState<'normal' | 'vocal' | 'bass' | 'cinema' | 'custom'>('cinema');

  const handleEqChange = (freq: string, val: number) => {
    setEqGains((prev) => ({ ...prev, [freq]: val }));
    setAudioPreset('custom');
  };

  const handleAudioPresetChange = (preset: 'normal' | 'vocal' | 'bass' | 'cinema' | 'custom') => {
    setAudioPreset(preset);
    if (preset === 'cinema') {
      setEqGains({ hz60: 4, hz230: 2, hz910: 0, hz4000: 3, hz14000: 5 });
    } else if (preset === 'bass') {
      setEqGains({ hz60: 7, hz230: 5, hz910: 1, hz4000: 0, hz14000: 1 });
    } else if (preset === 'vocal') {
      setEqGains({ hz60: -2, hz230: 0, hz910: 4, hz4000: 5, hz14000: 2 });
    } else if (preset === 'normal') {
      setEqGains({ hz60: 0, hz230: 0, hz910: 0, hz4000: 0, hz14000: 0 });
    }
  };

  const currentFeatured = selectedMovie || pureMoviesList[featuredIndex % pureMoviesList.length] || pureMoviesList[0];
  const currentFeaturedShow = selectedShow || pureShowsList[featuredIndex % pureShowsList.length] || pureShowsList[0];

  const toggleWatchlist = (id: string) => {
    setWatchlistIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('nitro_tv_watchlist', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handlePlayMovie = (movie: FeaturedMovie) => {
    setActivePlayerMovie(movie);
  };

  const handlePlayTrailer = (movie: FeaturedMovie) => {
    setActivePlayerMovie(movie);
  };

  // Video stream resolver
  const getStreamUrlForMovie = (movie: FeaturedMovie) => {
    if (movie.streamUrl) {
      return movie.streamUrl;
    }
    if (movie.id === 'bbb-sample' || movie.id === 'interstellar-sample') {
      return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    }
    if (movie.id === 'sintel-sample' || movie.id === 'neon-sample') {
      return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4";
    }
    if (movie.id === 'tears-sample' || movie.id === 'dune2-sample') {
      return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4";
    }
    // Reliable sample video for cinematic stream test
    return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  };

  // 10-Foot Leanback Navigation Menu Toggle (Android TV & KDE Plasma Bigscreen)
  const handleToggleNavigationMenu = () => {
    if (['movies', 'shows', 'watchlists', 'search'].includes(activeTab)) {
      setActiveTab('local-media');
      setIsSidebarCollapsed(false);
    } else {
      setIsSidebarCollapsed((prev) => !prev);
    }
    // Auto-focus the first accessible button in the navigation menu sidebar
    setTimeout(() => {
      const firstNavBtn = document.querySelector<HTMLElement>('aside button:not([disabled]), aside [tabindex="0"]');
      firstNavBtn?.focus();
    }, 120);
  };

  // Keyboard & Remote D-Pad Navigation for 10-foot TV experience (Android TV & KDE Plasma Bigscreen)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in search or text inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Android TV Menu (KeyCode 82 / ContextMenu) & KDE Plasma Bigscreen (F1, m, M)
      if (e.key === 'ContextMenu' || e.code === 'ContextMenu' || e.keyCode === 82 || e.key === 'F1' || e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleToggleNavigationMenu();
        return;
      }

      if (e.key === 'ArrowRight') {
        if (!activePlayerMovie && !inspectedMovie) {
          if (activeTab === 'movies') {
            setSelectedMovie(null);
            setFeaturedIndex((prev) => (prev + 1) % pureMoviesList.length);
          } else if (activeTab === 'shows') {
            setSelectedShow(null);
            setFeaturedIndex((prev) => (prev + 1) % pureShowsList.length);
          } else {
            setFeaturedIndex((prev) => (prev + 1) % moviesList.length);
          }
        }
      } else if (e.key === 'ArrowLeft') {
        if (!activePlayerMovie && !inspectedMovie) {
          // If on local media/shared libraries and currently in main content, jump focus to sidebar menu
          if (!['movies', 'shows', 'watchlists', 'search'].includes(activeTab)) {
            const activeEl = document.activeElement;
            const isInsideAside = activeEl && activeEl.closest('aside');
            if (!isInsideAside) {
              const asideBtn = document.querySelector<HTMLElement>('aside button:not([disabled]), aside [tabindex="0"]');
              if (asideBtn) {
                e.preventDefault();
                asideBtn.focus();
                return;
              }
            }
          }
          if (activeTab === 'movies') {
            setSelectedMovie(null);
            setFeaturedIndex((prev) => (prev - 1 + pureMoviesList.length) % pureMoviesList.length);
          } else if (activeTab === 'shows') {
            setSelectedShow(null);
            setFeaturedIndex((prev) => (prev - 1 + pureShowsList.length) % pureShowsList.length);
          } else {
            setFeaturedIndex((prev) => (prev - 1 + moviesList.length) % moviesList.length);
          }
        }
      } else if (e.key === 'Escape' || e.key === 'Backspace' || e.key === 'BrowserBack' || e.keyCode === 4) {
        if (activePlayerMovie) {
          setActivePlayerMovie(null);
        } else if (inspectedMovie) {
          setInspectedMovie(null);
        } else if (watchPartyMovie) {
          setWatchPartyMovie(null);
        } else if (isSearchOpen) {
          setIsSearchOpen(false);
          setIsVoiceSearchRequested(false);
        } else if (isSettingsOpen) {
          setIsSettingsOpen(false);
        } else if (isPluginModalOpen) {
          setIsPluginModalOpen(false);
        } else if (!['movies', 'shows', 'watchlists', 'search'].includes(activeTab) && !isSidebarCollapsed) {
          setIsSidebarCollapsed(true);
        }
      } else if (e.key === ' ' || e.code === 'Space') {
        if (!activePlayerMovie) {
          const target = activeTab === 'shows' ? currentFeaturedShow : currentFeatured;
          if (target) {
            e.preventDefault();
            handlePlayMovie(target);
          }
        }
      } else if (e.key === 'r' || e.key === 'R') {
        setIsRemoteOpen((prev) => !prev);
      } else if (e.key === 'p' || e.key === 'P') {
        setIsPluginModalOpen((prev) => !prev);
      } else if (e.key === '/') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePlayerMovie, inspectedMovie, watchPartyMovie, isSearchOpen, isSettingsOpen, isPluginModalOpen, currentFeatured, currentFeaturedShow, activeTab, isSidebarCollapsed, pureMoviesList.length, pureShowsList.length, moviesList.length]);

  // Gamepad Controller Polling (Nvidia Shield, Android TV Gamepads, Xbox, PS, Steam Deck & KDE Plasma Bigscreen)
  useEffect(() => {
    let animationFrameId: number;
    let lastButtonPressTime = 0;
    const DEBOUNCE_MS = 220;

    const pollGamepads = () => {
      const gamepads = typeof navigator.getGamepads === 'function' ? navigator.getGamepads() : [];
      const now = Date.now();

      for (const gp of gamepads) {
        if (!gp || !gp.connected) continue;

        if (now - lastButtonPressTime > DEBOUNCE_MS) {
          // Start button (index 9) or Y button (index 3) -> Menu toggle
          if (gp.buttons[9]?.pressed || gp.buttons[3]?.pressed) {
            lastButtonPressTime = now;
            handleToggleNavigationMenu();
            break;
          }

          // B button (index 1) -> Back / Close
          if (gp.buttons[1]?.pressed) {
            lastButtonPressTime = now;
            if (activePlayerMovie) setActivePlayerMovie(null);
            else if (inspectedMovie) setInspectedMovie(null);
            else if (watchPartyMovie) setWatchPartyMovie(null);
            else if (isSearchOpen) setIsSearchOpen(false);
            else if (isSettingsOpen) setIsSettingsOpen(false);
            else if (!['movies', 'shows', 'watchlists', 'search'].includes(activeTab) && !isSidebarCollapsed) {
              setIsSidebarCollapsed(true);
            }
            break;
          }

          // A button (index 0) -> Select / Enter
          if (gp.buttons[0]?.pressed) {
            lastButtonPressTime = now;
            const activeEl = document.activeElement as HTMLElement | null;
            if (activeEl && typeof activeEl.click === 'function') {
              activeEl.click();
            } else if (!activePlayerMovie) {
              const target = activeTab === 'shows' ? currentFeaturedShow : currentFeatured;
              if (target) handlePlayMovie(target);
            }
            break;
          }

          // D-Pad Up / Down navigation
          if (gp.buttons[12]?.pressed || (gp.axes[1] && gp.axes[1] < -0.65)) {
            lastButtonPressTime = now;
            window.scrollBy({ top: -320, behavior: 'smooth' });
            break;
          }
          if (gp.buttons[13]?.pressed || (gp.axes[1] && gp.axes[1] > 0.65)) {
            lastButtonPressTime = now;
            window.scrollBy({ top: 320, behavior: 'smooth' });
            break;
          }

          // D-Pad Left / Right navigation
          if (gp.buttons[14]?.pressed || (gp.axes[0] && gp.axes[0] < -0.65)) {
            lastButtonPressTime = now;
            if (!activePlayerMovie && !inspectedMovie) {
              if (!['movies', 'shows', 'watchlists', 'search'].includes(activeTab)) {
                const asideBtn = document.querySelector<HTMLElement>('aside button:not([disabled]), aside [tabindex="0"]');
                asideBtn?.focus();
              } else {
                setFeaturedIndex((prev) => (prev - 1 + pureMoviesList.length) % pureMoviesList.length);
              }
            }
            break;
          }
          if (gp.buttons[15]?.pressed || (gp.axes[0] && gp.axes[0] > 0.65)) {
            lastButtonPressTime = now;
            if (!activePlayerMovie && !inspectedMovie) {
              setFeaturedIndex((prev) => (prev + 1) % pureMoviesList.length);
            }
            break;
          }

          // Shoulder buttons L1 / R1 -> Tab cycling
          if (gp.buttons[4]?.pressed) {
            lastButtonPressTime = now;
            const tabs: TvTab[] = ['movies', 'shows', 'local-media', 'shared-libraries', 'watchlists'];
            const currentIndex = tabs.indexOf(activeTab);
            const nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
            setActiveTab(tabs[nextIndex]);
            break;
          }
          if (gp.buttons[5]?.pressed) {
            lastButtonPressTime = now;
            const tabs: TvTab[] = ['movies', 'shows', 'local-media', 'shared-libraries', 'watchlists'];
            const currentIndex = tabs.indexOf(activeTab);
            const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
            setActiveTab(tabs[nextIndex]);
            break;
          }
        }
      }

      animationFrameId = requestAnimationFrame(pollGamepads);
    };

    animationFrameId = requestAnimationFrame(pollGamepads);
    return () => cancelAnimationFrame(animationFrameId);
  }, [
    activePlayerMovie,
    inspectedMovie,
    watchPartyMovie,
    isSearchOpen,
    isSettingsOpen,
    activeTab,
    isSidebarCollapsed,
    currentFeatured,
    currentFeaturedShow,
    pureMoviesList.length
  ]);

  const localMediaMasters = useMemo(() => {
    return moviesList.filter((m) => m.id.includes('sample'));
  }, [moviesList]);

  const tvShowsOnly = useMemo(() => {
    return moviesList.filter((m) => ['severance', 'shogun', 'the-bear', 'the-last-of-us', 'stranger-things', 'squid-game', 'ted-lasso'].includes(m.id));
  }, [moviesList]);

  const userWatchlistMovies = useMemo(() => {
    return moviesList.filter((m) => watchlistIds.includes(m.id));
  }, [moviesList, watchlistIds]);

  return (
    <div className="relative min-h-screen w-full bg-transparent text-zinc-100 flex flex-col overflow-x-hidden selection:bg-sky-500 selection:text-black">
      {/* Google TV Top Navigation Header */}
      <TvTopNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSelectedMovie(null);
          setSelectedShow(null);
          if (tab !== 'shared-libraries') setSelectedPeerId(null);
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleRemote={() => setIsRemoteOpen((prev) => !prev)}
        isRemoteOpen={isRemoteOpen}
        onOpenStreamingHUD={() => setIsStreamingHUDOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPlugins={() => setIsPluginModalOpen(true)}
        onToggleMenu={handleToggleNavigationMenu}
        activeMediaTitle={activeTab === 'shows' ? currentFeaturedShow.title : currentFeatured.title}
        isSearchOpen={isSearchOpen}
      />

      {/* Main Leanback Canvas with Left Sidebar */}
      <div className="flex-1 w-full flex relative min-h-0">
        {/* Left Sidebar for Local Media Files & Shared Libraries (hidden on Movies, Shows, Watchlist, and Search tabs) */}
        {!['movies', 'shows', 'watchlists', 'search'].includes(activeTab) && (
          <TvSidebar
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              if (tab !== 'shared-libraries') setSelectedPeerId(null);
            }}
            selectedPeerId={selectedPeerId}
            onSelectPeer={(peerId) => {
              setSelectedPeerId(peerId);
              setActiveTab('shared-libraries');
            }}
            peers={SHARED_PEER_LIBRARIES.map((p) => ({
              id: p.id,
              name: p.name,
              owner: p.owner,
              avatarInitials: p.avatarInitials,
              avatarColor: p.avatarColor,
              itemCount: p.itemCount,
              status: p.status,
              pingMs: p.pingMs,
              bandwidth: p.bandwidth,
            }))}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
            onOpenConnectModal={() => setIsConnectModalOpen(true)}
            localFilesCount={LOCAL_MEDIA_FILES.length}
            onAddFolderSource={(folder) => {
              setScanFeedback(`Imported local system folder "${folder.name}" (${folder.path}) as active media source.`);
              setTimeout(() => setScanFeedback(null), 4500);
            }}
          />
        )}

        <main className={`flex-1 min-w-0 flex flex-col pb-14 overflow-x-hidden ${
          activeTab === 'movies' || activeTab === 'shows' ? '' : 'pt-16'
        }`}>
        {/* TAB 1: MOVIES */}
        {activeTab === 'movies' && (
          <>
            {/* Featured Cinematic Hero Billboard */}
            <TvHeroBillboard
              movie={selectedMovie || SPOTLIGHT_MOVIES[0]}
              featuredList={SPOTLIGHT_MOVIES}
              onSelectIndex={(index) => setSelectedMovie(SPOTLIGHT_MOVIES[index] ?? null)}
              onPlay={(m) => setStreamSelectorMovie(m)}
              onPlayTrailer={handlePlayTrailer}
              onToggleWatchlist={toggleWatchlist}
              onOpenWatchParty={(m) => setWatchPartyMovie(m)}
              onOpenDetails={(m) => setInspectedMovie(m)}
              onOpenEngineHUD={() => setIsStreamingHUDOpen(true)}
              isWatchlistActive={watchlistIds.includes((selectedMovie || SPOTLIGHT_MOVIES[0]).id)}
              onSeeAllContinueWatching={() => setIsSearchOpen(true)}
            />

            {/* Content Rails */}
            <div className="relative z-20 mt-0 flex flex-col gap-1">
              {/* Continue Watching Section */}
              <TvContentRow
                title="Continue Watching"
                items={DEFAULT_CONTINUE_WATCHING}
                onSelectItem={(m) => handlePlayMovie(m)}
                onFocusItem={(m) => setSelectedMovie(m)}
                isContinueWatching={true}
                selectedItemId={currentFeatured.id}
              />

              {/* Row 1: Top 20 Movies on Netflix */}
              <TvContentRow
                title="Top 20 Movies on Netflix"
                items={dailyNetflixMovies}
                onSelectItem={(m) => setInspectedMovie(m)}
                onFocusItem={(m) => setSelectedMovie(m)}
                isRanked={true}
                updatedDaily={true}
                dailyDateString={todayDateString}
                selectedItemId={currentFeatured.id}
              />

              {/* Row 2: Top 20 Movies on Hulu */}
              <TvContentRow
                title="Top 20 Movies on Hulu"
                items={dailyHuluMovies}
                onSelectItem={(m) => setInspectedMovie(m)}
                onFocusItem={(m) => setSelectedMovie(m)}
                isRanked={true}
                updatedDaily={true}
                dailyDateString={todayDateString}
                selectedItemId={currentFeatured.id}
              />

              {/* Row 3: Top 20 Movies on HBO Max */}
              <TvContentRow
                title="Top 20 Movies on HBO Max"
                items={dailyHboMovies}
                onSelectItem={(m) => setInspectedMovie(m)}
                onFocusItem={(m) => setSelectedMovie(m)}
                isRanked={true}
                updatedDaily={true}
                dailyDateString={todayDateString}
                selectedItemId={currentFeatured.id}
              />

              {/* Row 4: Top 20 Movies on Disney+ */}
              <TvContentRow
                title="Top 20 Movies on Disney+"
                items={dailyDisneyMovies}
                onSelectItem={(m) => setInspectedMovie(m)}
                onFocusItem={(m) => setSelectedMovie(m)}
                isRanked={true}
                updatedDaily={true}
                dailyDateString={todayDateString}
                selectedItemId={currentFeatured.id}
              />

              {/* Row 5: Top 20 Movies on Amazon Prime */}
              <TvContentRow
                title="Top 20 Movies on Amazon Prime"
                items={dailyAmazonMovies}
                onSelectItem={(m) => setInspectedMovie(m)}
                onFocusItem={(m) => setSelectedMovie(m)}
                isRanked={true}
                updatedDaily={true}
                dailyDateString={todayDateString}
                selectedItemId={currentFeatured.id}
              />

              {/* Row 6: Top 20 Movies on Apple TV+ */}
              <TvContentRow
                title="Top 20 Movies on Apple TV+"
                items={dailyAppleMovies}
                onSelectItem={(m) => setInspectedMovie(m)}
                onFocusItem={(m) => setSelectedMovie(m)}
                isRanked={true}
                updatedDaily={true}
                dailyDateString={todayDateString}
                selectedItemId={currentFeatured.id}
              />
            </div>
          </>
        )}

        {/* TAB 2: SHOWS */}
        {activeTab === 'shows' && (
          <>
            {/* Featured Cinematic Hero Billboard for TV Shows */}
            <TvHeroBillboard
              movie={selectedShow || SPOTLIGHT_SHOWS[0]}
              featuredList={SPOTLIGHT_SHOWS}
              onSelectIndex={(index) => setSelectedShow(SPOTLIGHT_SHOWS[index] ?? null)}
              onPlay={(m) => setStreamSelectorMovie(m)}
              onPlayTrailer={handlePlayTrailer}
              onToggleWatchlist={toggleWatchlist}
              onOpenWatchParty={(m) => setWatchPartyMovie(m)}
              onOpenDetails={(m) => setInspectedMovie(m)}
              onOpenEngineHUD={() => setIsStreamingHUDOpen(true)}
              isWatchlistActive={watchlistIds.includes((selectedShow || SPOTLIGHT_SHOWS[0]).id)}
              onSeeAllContinueWatching={() => setIsSearchOpen(true)}
            />

            {/* Content Rails */}
            <div className="relative z-20 mt-0 flex flex-col gap-1">
              {/* Continue Watching Section for TV Shows */}
              <TvContentRow
                title="Continue Watching"
                items={DEFAULT_CONTINUE_WATCHING_SHOWS}
                onSelectItem={(m) => handlePlayMovie(m)}
                onFocusItem={(m) => setSelectedShow(m)}
                isContinueWatching={true}
                selectedItemId={currentFeaturedShow.id}
              />

              {/* Row 1: Top 20 TV Shows on Netflix */}
              <TvContentRow
                title="Top 20 TV Shows on Netflix"
                items={dailyNetflixShows}
                onSelectItem={(m) => setInspectedMovie(m)}
                onFocusItem={(m) => setSelectedShow(m)}
                isRanked={true}
                updatedDaily={true}
                dailyDateString={todayDateString}
                selectedItemId={currentFeaturedShow.id}
              />

              {/* Row 2: Top 20 TV Shows on Hulu */}
              <TvContentRow
                title="Top 20 TV Shows on Hulu"
                items={dailyHuluShows}
                onSelectItem={(m) => setInspectedMovie(m)}
                onFocusItem={(m) => setSelectedShow(m)}
                isRanked={true}
                updatedDaily={true}
                dailyDateString={todayDateString}
                selectedItemId={currentFeaturedShow.id}
              />

              {/* Row 3: Top 20 TV Shows on HBO Max */}
              <TvContentRow
                title="Top 20 TV Shows on HBO Max"
                items={dailyHboShows}
                onSelectItem={(m) => setInspectedMovie(m)}
                onFocusItem={(m) => setSelectedShow(m)}
                isRanked={true}
                updatedDaily={true}
                dailyDateString={todayDateString}
                selectedItemId={currentFeaturedShow.id}
              />

              {/* Row 4: Top 20 TV Shows on Disney+ */}
              <TvContentRow
                title="Top 20 TV Shows on Disney+"
                items={dailyDisneyShows}
                onSelectItem={(m) => setInspectedMovie(m)}
                onFocusItem={(m) => setSelectedShow(m)}
                isRanked={true}
                updatedDaily={true}
                dailyDateString={todayDateString}
                selectedItemId={currentFeaturedShow.id}
              />

              {/* Row 5: Top 20 TV Shows on Amazon Prime */}
              <TvContentRow
                title="Top 20 TV Shows on Amazon Prime"
                items={dailyAmazonShows}
                onSelectItem={(m) => setInspectedMovie(m)}
                onFocusItem={(m) => setSelectedShow(m)}
                isRanked={true}
                updatedDaily={true}
                dailyDateString={todayDateString}
                selectedItemId={currentFeaturedShow.id}
              />

              {/* Row 6: Top 20 TV Shows on Apple TV+ */}
              <TvContentRow
                title="Top 20 TV Shows on Apple TV+"
                items={dailyAppleShows}
                onSelectItem={(m) => setInspectedMovie(m)}
                onFocusItem={(m) => setSelectedShow(m)}
                isRanked={true}
                updatedDaily={true}
                dailyDateString={todayDateString}
                selectedItemId={currentFeaturedShow.id}
              />
            </div>
          </>
        )}

        {/* TAB 3 & 4: LIBRARIES & MEDIA VAULT */}
        {(activeTab === 'local-media' || activeTab === 'library' || activeTab === 'shared-libraries') && (
          <TvLibrariesView
            localMediaFiles={localMediaFiles}
            peerLibraries={SHARED_PEER_LIBRARIES}
            onPlayMovie={handlePlayMovie}
            onInspectMovie={(movie) => setInspectedMovie(movie)}
            onStreamSelectorMovie={(movie) => setStreamSelectorMovie(movie)}
            onOpenWatchParty={(movie) => setWatchPartyMovie(movie)}
            onRescan={handleLibraryRescan}
            selectedPeerId={selectedPeerId}
            onSelectPeer={(peerId) => {
              setSelectedPeerId(peerId);
              if (peerId) {
                setActiveTab('shared-libraries');
              } else {
                setActiveTab('local-media');
              }
            }}
          />
        )}



        {/* TAB 5: WATCHLISTS */}
        {activeTab === 'watchlists' && (
          <div className="px-6 lg:px-12 pt-4 flex flex-col gap-5">
            <div>
              <h1 className="font-display font-extrabold text-3xl lg:text-4xl text-white tracking-wide">
                Your Curated Watchlists
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                Movies and shows saved to watch on your big screen.
              </p>
            </div>

            {userWatchlistMovies.length > 0 ? (
              <TvContentRow
                title="Watch Later Queue"
                subtitle={`${userWatchlistMovies.length} saved titles`}
                items={userWatchlistMovies}
                onSelectItem={(m) => setInspectedMovie(m)}
              />
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-8 rounded-3xl bg-white/5 border border-white/10">
                <Bookmark className="w-12 h-12 text-zinc-600 mb-3" />
                <span className="text-lg font-bold text-white">Your watchlist is empty</span>
                <p className="text-xs text-zinc-400 mt-1">
                  Browse titles and press "+ Watchlist" to save them for movie night!
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB: SEARCH */}
        {activeTab === 'search' && (
          <div className="w-full flex-1 min-h-[600px] relative">
            <TvSearchModal
              isOpen={true}
              onClose={() => setActiveTab('movies')}
              movies={moviesList}
              watchlist={userWatchlistMovies}
              userLists={userCustomLists}
              onCreateList={handleCreateUserList}
              onSelectMovie={(m) => setInspectedMovie(m)}
            />
          </div>
        )}
      </main>
      </div>

      {/* FULL-SCREEN 10-FOOT ANDROID TV PLAYER */}
      {activePlayerMovie && (
        <TvPlayer
          movie={activePlayerMovie}
          videoUrl={getStreamUrlForMovie(activePlayerMovie)}
          onClose={() => setActivePlayerMovie(null)}
          onOpenStreamingHUD={() => setIsStreamingHUDOpen(true)}
          eqGains={eqGains}
          onEqChange={handleEqChange}
          audioPreset={audioPreset}
          onAudioPresetChange={handleAudioPresetChange}
          onNextMedia={() => {
            const nextIdx = (moviesList.findIndex((m) => m.id === activePlayerMovie.id) + 1) % moviesList.length;
            setActivePlayerMovie(moviesList[nextIdx]);
          }}
          onPrevMedia={() => {
            const prevIdx = (moviesList.findIndex((m) => m.id === activePlayerMovie.id) - 1 + moviesList.length) % moviesList.length;
            setActivePlayerMovie(moviesList[prevIdx]);
          }}
        />
      )}

      {/* MOVIE DETAIL MODAL */}
      {inspectedMovie && (
        <TvDetailModal
          movie={inspectedMovie}
          onClose={() => setInspectedMovie(null)}
          onPlay={(m) => {
            setInspectedMovie(null);
            handlePlayMovie(m);
          }}
          onPlayTrailer={(m) => {
            setInspectedMovie(null);
            handlePlayTrailer(m);
          }}
          onToggleWatchlist={toggleWatchlist}
          onOpenWatchParty={(m) => {
            setInspectedMovie(null);
            setWatchPartyMovie(m);
          }}
          isWatchlistActive={watchlistIds.includes(inspectedMovie.id)}
          userLists={userCustomLists}
          onToggleAddToList={(listId, movieId) => {
            setUserCustomLists((prev) => {
              const updated = prev.map((l) => {
                if (l.id !== listId) return l;
                const exists = l.movieIds.includes(movieId);
                return {
                  ...l,
                  movieIds: exists ? l.movieIds.filter((id) => id !== movieId) : [...l.movieIds, movieId],
                };
              });
              localStorage.setItem('nascent_tv_user_lists', JSON.stringify(updated));
              return updated;
            });
          }}
          onCreateList={handleCreateUserList}
          onUpdateMetadata={(id, updated) => {
            setMoviesList((prev) =>
              prev.map((m) => (m.id === id ? { ...m, ...updated } : m))
            );
            setInspectedMovie((curr) => (curr && curr.id === id ? { ...curr, ...updated } : curr));
          }}
          onDeleteMovie={(id) => {
            setMoviesList((prev) => prev.filter((m) => m.id !== id));
          }}
        />
      )}

      {/* STREMIO & NUVIO STREAM PROVIDER SELECTOR MODAL */}
      {streamSelectorMovie && (
        <TvStreamSelectorModal
          movie={streamSelectorMovie}
          isOpen={!!streamSelectorMovie}
          onClose={() => setStreamSelectorMovie(null)}
          onSelectStream={(m, stream) => {
            setStreamSelectorMovie(null);
            handlePlayMovie({
              ...m,
              title: `${m.title} • [${stream.provider}]`
            });
          }}
        />
      )}

      {/* WATCH PARTY MODAL */}
      {watchPartyMovie && (
        <TvWatchParty
          movie={watchPartyMovie}
          onStartParty={() => {
            const movieToPlay = watchPartyMovie;
            setWatchPartyMovie(null);
            handlePlayMovie(movieToPlay);
          }}
          onClose={() => setWatchPartyMovie(null)}
        />
      )}

      {/* SEARCH MODAL */}
      {isSearchOpen && (
        <TvSearchModal
          isOpen={isSearchOpen}
          initialVoiceActive={isVoiceSearchRequested}
          onClose={() => {
            setIsSearchOpen(false);
            setIsVoiceSearchRequested(false);
          }}
          movies={moviesList}
          watchlist={userWatchlistMovies}
          userLists={userCustomLists}
          onCreateList={handleCreateUserList}
          onSelectMovie={(m) => {
            setIsSearchOpen(false);
            setIsVoiceSearchRequested(false);
            setInspectedMovie(m);
          }}
        />
      )}

      {/* SETTINGS MODAL */}
      <TvSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onToggleRemote={() => setIsRemoteOpen((prev) => !prev)}
        isRemoteOpen={isRemoteOpen}
        onOpenPlugins={() => setIsPluginModalOpen(true)}
        eqGains={eqGains}
        onEqChange={handleEqChange}
        audioPreset={audioPreset}
        onAudioPresetChange={handleAudioPresetChange}
      />

      {/* COMMUNITY PLUGINS & ADDONS MODAL */}
      <TvPluginModal
        isOpen={isPluginModalOpen}
        onClose={() => setIsPluginModalOpen(false)}
      />

      {/* STREAMING ENGINE HUD MODAL */}
      <StreamingEngineHUD
        engine={globalStreamingEngine}
        isOpen={isStreamingHUDOpen}
        onClose={() => setIsStreamingHUDOpen(false)}
      />

      {/* VIRTUAL ANDROID TV REMOTE CONTROLLER OVERLAY */}
      <TvRemoteOverlay
        isOpen={isRemoteOpen}
        onClose={() => setIsRemoteOpen(false)}
        onDpadUp={() => {
          window.scrollBy({ top: -350, behavior: 'smooth' });
        }}
        onDpadDown={() => {
          window.scrollBy({ top: 350, behavior: 'smooth' });
        }}
        onDpadLeft={() => {
          setFeaturedIndex((prev) => (prev - 1 + moviesList.length) % moviesList.length);
        }}
        onDpadRight={() => {
          setFeaturedIndex((prev) => (prev + 1) % moviesList.length);
        }}
        onSelect={() => {
          if (activePlayerMovie) {
            // inside player, toggles play
          } else if (inspectedMovie) {
            handlePlayMovie(inspectedMovie);
            setInspectedMovie(null);
          } else {
            handlePlayMovie(currentFeatured);
          }
        }}
        onHome={() => {
          setActiveTab('movies');
          setActivePlayerMovie(null);
          setInspectedMovie(null);
          setWatchPartyMovie(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onBack={() => {
          if (activePlayerMovie) setActivePlayerMovie(null);
          else if (inspectedMovie) setInspectedMovie(null);
          else if (watchPartyMovie) setWatchPartyMovie(null);
          else if (isSearchOpen) {
            setIsSearchOpen(false);
            setIsVoiceSearchRequested(false);
          } else if (isSettingsOpen) setIsSettingsOpen(false);
          else if (!['movies', 'shows', 'watchlists', 'search'].includes(activeTab) && !isSidebarCollapsed) {
            setIsSidebarCollapsed(true);
          }
        }}
        onToggleMenu={handleToggleNavigationMenu}
        onTogglePlay={() => {
          if (!activePlayerMovie && currentFeatured) {
            handlePlayMovie(currentFeatured);
          }
        }}
        onFastForward={() => {
          setFeaturedIndex((prev) => (prev + 1) % moviesList.length);
        }}
        onRewind={() => {
          setFeaturedIndex((prev) => (prev - 1 + moviesList.length) % moviesList.length);
        }}
        onOpenSearch={() => {
          setIsVoiceSearchRequested(true);
          setIsSearchOpen(true);
        }}
        isPlaying={!!activePlayerMovie}
      />
    </div>
  );
}
