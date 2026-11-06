/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, 
  Film, 
  Plus, 
  Check, 
  Users, 
  Info, 
  Star, 
  Volume2, 
  Clock, 
  Zap, 
  FolderPlus,
  Upload,
  Bookmark,
  Sparkles,
  Gamepad2,
  Settings,
  ArrowRight,
  HardDrive,
  Share2,
  Wifi,
  Server,
  CheckCircle2,
  RefreshCw,
  FileVideo,
  Radio,
  Database,
  ShieldCheck,
  X
} from 'lucide-react';
import { TvTopNav, TvTab } from './components/tv/TvTopNav';
import { 
  TvHeroBillboard, 
  FeaturedMovie, 
  SPOTLIGHT_SHOWS, 
  SPOTLIGHT_MOVIES, 
  DEFAULT_CONTINUE_WATCHING, 
  DEFAULT_CONTINUE_WATCHING_SHOWS 
} from './components/tv/TvHeroBillboard';
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
import { EXPAND_TO_50, SUPPLEMENTAL_MOVIES, SUPPLEMENTAL_SHOWS } from './lib/top50Expansion';
import { 
  DISNEY_PLUS_TOP_20,
  DISNEY_PLUS_TOP_20_SHOWS,
  AMAZON_PRIME_TOP_20,
  AMAZON_PRIME_TOP_20_SHOWS,
  APPLE_TV_TOP_20,
  APPLE_TV_TOP_20_SHOWS,
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

// Global library of movies with high-res poster and banner art
export const NETFLIX_TOP_20: FeaturedMovie[] = [
  { id: "spider-verse", title: "Spider-Man: Across the Spider-Verse", releaseYear: "2023", posterUrl: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj7sR48.jpg", genres: ["Animation", "Action", "Adventure"], rating: 8.6, certification: "PG", director: "Joaquim Dos Santos", summary: "Miles Morales catapults across the Multiverse with Gwen Stacy and an elite Spider-Society." },
  { id: "society-of-the-snow", title: "Society of the Snow", releaseYear: "2023", posterUrl: "https://image.tmdb.org/t/p/w500/2e85me2vAjLRTjCuXM4nhcwQpqU.jpg", genres: ["Drama", "Adventure", "History"], rating: 7.9, certification: "R", director: "J.A. Bayona", summary: "The flight of a rugby team crashes onto a glacier in the heart of the Andes, requiring extreme measures to survive." },
  { id: "rebel-ridge", title: "Rebel Ridge", releaseYear: "2024", posterUrl: "https://image.tmdb.org/t/p/w500/xEt2GSz9z5r5EG2qvIOk8P9hea3.jpg", genres: ["Action", "Crime", "Thriller"], rating: 7.1, certification: "R", director: "Jeremy Saulnier", summary: "A former Marine confronts corruption in a small town after local law enforcement unjustly seizes his cousin's bail money." },
  { id: "babygirl", title: "Babygirl", releaseYear: "2024", posterUrl: "https://image.tmdb.org/t/p/w500/ilwO6elz3mLV9CToT7C8pjVeKX0.jpg", genres: ["Drama", "Thriller", "Romance"], rating: 6.6, certification: "R", director: "Halina Reijn", summary: "A high-powered CEO puts her career and family on the line when she begins a torrid affair with her intern." },
  { id: "glass-onion", title: "Glass Onion: A Knives Out Mystery", releaseYear: "2022", posterUrl: "https://image.tmdb.org/t/p/w500/vDGr1YdrlfbU9wxTOdpf3zChmv9.jpg", genres: ["Comedy", "Crime", "Mystery"], rating: 7.1, certification: "PG-13", director: "Rian Johnson", summary: "Famed Southern detective Benoit Blanc travels to a private Greek island for a tech billionaire's murder mystery game." },
  { id: "uncut-gems", title: "Uncut Gems", releaseYear: "2019", posterUrl: "https://image.tmdb.org/t/p/w500/6XN1vxHc7kUSqNWtaQKN45J5x2v.jpg", genres: ["Crime", "Thriller", "Drama"], rating: 7.4, certification: "R", director: "Josh Safdie", summary: "A charismatic New York jeweler makes a high-stakes bet that could lead to the windfall of a lifetime." },
  { id: "the-irishman", title: "The Irishman", releaseYear: "2019", posterUrl: "https://image.tmdb.org/t/p/w500/mbm8k3GFfdXS0b9UiOdr4C0Pm38.jpg", genres: ["Crime", "Drama", "Biography"], rating: 7.8, certification: "R", director: "Martin Scorsese", summary: "Hitman Frank Sheeran reflects on the secrets he kept as a loyal member of the Bufalino crime family." },
  { id: "materialists", title: "Materialists", releaseYear: "2025", posterUrl: "https://image.tmdb.org/t/p/w500/eDo0pNruy0Qgj6BdTyHIR4cxHY8.jpg", genres: ["Romance", "Comedy", "Drama"], rating: 7.3, certification: "R", director: "Celine Song", summary: "A professional New York matchmaker finds herself torn between a wealthy suitor and an old flame." },
  { id: "pearl", title: "Pearl", releaseYear: "2022", posterUrl: "https://image.tmdb.org/t/p/w500/wqPjKHBPk41X2lnZ0zbw0clY6w1.jpg", genres: ["Horror", "Drama"], rating: 7.0, certification: "R", director: "Ti West", summary: "Trapped on her family's isolated farm in 1918, young Pearl must tend to her ailing father under her mother's thumb." },
  { id: "past-lives", title: "Past Lives", releaseYear: "2023", posterUrl: "https://image.tmdb.org/t/p/w500/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg", genres: ["Drama", "Romance"], rating: 7.9, certification: "PG-13", director: "Celine Song", summary: "Two deeply connected childhood friends are reunited in New York for one fateful week." },
  { id: "moonlight", title: "Moonlight", releaseYear: "2016", posterUrl: "https://image.tmdb.org/t/p/w500/3rWk9g0Oup5WHcrpjvw5zW1WhLc.jpg", genres: ["Drama"], rating: 7.4, certification: "R", director: "Barry Jenkins", summary: "A young African-American man struggles with identity and connection while growing up in Miami." },
  { id: "heretic", title: "Heretic", releaseYear: "2024", posterUrl: "https://image.tmdb.org/t/p/w500/fr96XzlzsONrQrGfdLMiwtQjott.jpg", genres: ["Horror", "Thriller"], rating: 7.2, certification: "R", director: "Scott Beck", summary: "Two missionaries are forced into a deadly battle of wits when they knock on the door of the reclusive Mr. Reed." },
  { id: "eddington", title: "Eddington", releaseYear: "2025", posterUrl: "https://image.tmdb.org/t/p/w500/4GIqZUgPZ146BhibsPHMHef2nXX.jpg", genres: ["Drama", "Western", "Thriller"], rating: 7.8, certification: "R", director: "Ari Aster", summary: "A small-town New Mexico sheriff harbors cosmic and political aspirations that threaten to unravel the town." },
  { id: "extraction-2", title: "Extraction 2", releaseYear: "2023", posterUrl: "https://image.tmdb.org/t/p/w500/7gKI9hpEMcZUwYeCuVmACArrURM.jpg", genres: ["Action", "Thriller"], rating: 7.0, certification: "R", director: "Sam Hargrave", summary: "Back from the brink of death, commando Tyler Rake embarks on a dangerous mission to save an imprisoned family." },
  { id: "the-gray-man", title: "The Gray Man", releaseYear: "2022", posterUrl: "https://image.tmdb.org/t/p/w500/8cXbitszbSpqBlaIWnWqwpdoD33.jpg", genres: ["Action", "Thriller"], rating: 6.5, certification: "PG-13", director: "Anthony Russo", summary: "When the CIA's top operative accidentally uncovers dark agency secrets, a psychotic rogue operative hunts him." },
  { id: "red-notice", title: "Red Notice", releaseYear: "2021", posterUrl: "https://image.tmdb.org/t/p/w500/wdE6duaDUwf2XRBIZhuO5z87Wd7.jpg", genres: ["Action", "Comedy", "Crime"], rating: 6.3, certification: "PG-13", director: "Rawson Marshall Thurber", summary: "An FBI profiler pursuing the world's most wanted art thief becomes his reluctant partner to catch an elusive crook." },
  { id: "roma", title: "Roma", releaseYear: "2018", posterUrl: "https://image.tmdb.org/t/p/w500/dtIL4bcm1g8Z8rT5X85n8X0m9A0.jpg", genres: ["Drama"], rating: 7.7, certification: "R", director: "Alfonso Cuarón", summary: "A year in the life of a middle-class family's maid in Mexico City during the tumultuous early 1970s." },
  { id: "all-quiet", title: "All Quiet on the Western Front", releaseYear: "2022", posterUrl: "https://image.tmdb.org/t/p/w500/hYqOjJ7Gh5fZq69BWAsLQI5aWqZ.jpg", genres: ["War", "Action", "Drama"], rating: 7.8, certification: "R", director: "Edward Berger", summary: "A young German soldier's initial euphoria transforms into heartbreak and desperation in the trenches of WWI." },
  { id: "bbb-sample", title: "Big Buck Bunny (4K 60FPS Master)", releaseYear: "2008", posterUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Big_Buck_Bunny_堅毅的大兔子.jpg", genres: ["Animation", "Comedy"], rating: 8.1, certification: "G", director: "Sacha Goedegeboure", summary: "A giant fluffy rabbit exacts sweet revenge on three bullying rodents in high definition 4K 60FPS master quality." },
  { id: "spirited-away", title: "Spirited Away", releaseYear: "2001", posterUrl: "https://image.tmdb.org/t/p/w500/3939210928310921.jpg", genres: ["Animation", "Fantasy", "Adventure"], rating: 8.6, certification: "PG", director: "Hayao Miyazaki", summary: "During her family's move, a young girl wanders into an enchanting world ruled by gods, witches, and spirits." }
];

export const HULU_TOP_20: FeaturedMovie[] = [
  { id: "anatomy-of-a-fall", title: "Anatomy of a Fall", releaseYear: "2023", posterUrl: "https://image.tmdb.org/t/p/w500/kQs6keheMwCxJxrzV03VUvNsno.jpg", genres: ["Crime", "Drama", "Mystery"], rating: 7.7, certification: "R", director: "Justine Triet", summary: "A woman is suspected of her husband's murder, and their blind son faces a moral dilemma as the sole witness." },
  { id: "blackberry", title: "BlackBerry", releaseYear: "2023", posterUrl: "https://image.tmdb.org/t/p/w500/ne1N9jP1r7z3z9G8z8k9B5jP1r7.jpg", genres: ["Comedy", "Drama", "History"], rating: 7.4, certification: "R", director: "Matt Johnson", summary: "The story of the meteoric rise and catastrophic demise of the world's first smartphone." },
  { id: "deadpool-wolverine", title: "Deadpool & Wolverine", releaseYear: "2024", posterUrl: "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg", genres: ["Action", "Comedy", "Sci-Fi"], rating: 7.8, certification: "R", director: "Shawn Levy", summary: "Deadpool is recruited by the Time Variance Authority, dragging a reluctant variant of Wolverine along for the ride." },
  { id: "poor-things", title: "Poor Things", releaseYear: "2023", posterUrl: "https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg", genres: ["Sci-Fi", "Comedy", "Romance"], rating: 7.9, certification: "R", director: "Yorgos Lanthimos", summary: "The incredible tale about the fantastical evolution of Bella Baxter, a young woman brought back to life by a brilliant scientist." },
  { id: "prey", title: "Prey", releaseYear: "2022", posterUrl: "https://image.tmdb.org/t/p/w500/ujr5pztc1oitbe79F20iBD3Yvyj.jpg", genres: ["Action", "Sci-Fi", "Thriller"], rating: 7.1, certification: "R", director: "Dan Trachtenberg", summary: "The origin story of the Predator in the world of the Comanche Nation 300 years ago." },
  { id: "palm-springs", title: "Palm Springs", releaseYear: "2020", posterUrl: "https://image.tmdb.org/t/p/w500/yf5IuMw6GHNsOVoM3P923qaUbss.jpg", genres: ["Comedy", "Romance", "Sci-Fi"], rating: 7.4, certification: "R", director: "Max Barbakow", summary: "Stuck in a time loop at a resort wedding, two guests find solace and hilarity as they relive the same day repeatedly." },
  { id: "bring-her-back", title: "Bring Her Back", releaseYear: "2025", posterUrl: "https://image.tmdb.org/t/p/w500/1Q3GlCXGYWELifxANYZ5OVMRVZl.jpg", genres: ["Horror", "Thriller"], rating: 7.1, certification: "R", director: "Danny Philippou", summary: "A chilling paranormal thriller surrounding a mysterious portal, supernatural contracts, and psychic decay." },
  { id: "x", title: "X", releaseYear: "2022", posterUrl: "https://image.tmdb.org/t/p/w500/h8C6NGgVANv0SB343JZqdxfu1D9.jpg", genres: ["Horror", "Mystery"], rating: 6.6, certification: "R", director: "Ti West", summary: "In 1979, an adult film crew rents an isolated farmhouse in rural Texas, where bizarre elderly hosts harbor sinister secrets." },
  { id: "love-lies-bleeding", title: "Love Lies Bleeding", releaseYear: "2024", posterUrl: "https://image.tmdb.org/t/p/w500/xImj8RLe39YK0lyVu9kXv7ApN8p.jpg", genres: ["Crime", "Thriller", "Action"], rating: 7.0, certification: "R", director: "Rose Glass", summary: "Gym manager Lou falls hard for ambitious bodybuilder Jackie, sparking a dark descent into family crime and violence." },
  { id: "highest-2-lowest", title: "Highest 2 Lowest", releaseYear: "2025", posterUrl: "https://image.tmdb.org/t/p/w500/RFQtinuiHhOnbmJaCn3uzegCYF.jpg", genres: ["Drama", "Music"], rating: 6.9, certification: "PG-13", director: "Sebastian Stan", summary: "A musical drama tracing the rapid rise and catastrophic fall of record producers in a hyper-digitized studio environment." },
  { id: "sharper", title: "Sharper", releaseYear: "2023", posterUrl: "https://image.tmdb.org/t/p/w500/ow3EzTlqMvHBUVe6gPgOQcHAtaG.jpg", genres: ["Drama", "Thriller"], rating: 6.6, certification: "R", director: "Benjamin Caron", summary: "A con artist takes on Manhattan's billionaire elite in a high-stakes psychological game of greed and deception." },
  { id: "maxxxine", title: "MaXXXine", releaseYear: "2024", posterUrl: "https://image.tmdb.org/t/p/w500/ArvoFK6nlouZRxYmtIOUzKIrg90.jpg", genres: ["Horror", "Thriller"], rating: 6.5, certification: "R", director: "Ti West", summary: "In 1980s Hollywood, adult film star Maxine Minx gets her big cinema break, but a mysterious night killer stalks the starlets." },
  { id: "the-menu", title: "The Menu", releaseYear: "2022", posterUrl: "https://image.tmdb.org/t/p/w500/fPtUgRPZIyg9GkQ0W3k95a4pQeE.jpg", genres: ["Comedy", "Horror", "Thriller"], rating: 7.2, certification: "R", director: "Mark Mylod", summary: "A young couple travels to an exclusive coastal restaurant where an eccentric chef has prepared a shocking degustation menu." },
  { id: "nomadland", title: "Nomadland", releaseYear: "2020", posterUrl: "https://image.tmdb.org/t/p/w500/66MCEL2F96Hk3W11bBvU7Q3rLzR.jpg", genres: ["Drama"], rating: 7.3, certification: "R", director: "Chloé Zhao", summary: "Following the economic collapse of a company town in rural Nevada, Fern packs her van and explores life outside society." },
  { id: "triangle-of-sadness", title: "Triangle of Sadness", releaseYear: "2022", posterUrl: "https://image.tmdb.org/t/p/w500/k9VqdIdqaP1pff92voTfq7RuvWn.jpg", genres: ["Comedy", "Drama"], rating: 7.3, certification: "R", director: "Ruben Östlund", summary: "A fashion model celebrity couple is invited on a luxury cruise for the super-rich, where things go catastrophically wrong." },
  { id: "fresh", title: "Fresh", releaseYear: "2022", posterUrl: "https://image.tmdb.org/t/p/w500/tL0f4zX8rN9Gk6rG7z7Ck0Q2Pj6.jpg", genres: ["Horror", "Comedy", "Thriller"], rating: 6.7, certification: "R", director: "Mimi Cave", summary: "A young woman dating a charming plastic surgeon uncovers his dark culinary appetites during an isolated weekend away." },
  { id: "holdovers", title: "The Holdovers", releaseYear: "2023", posterUrl: "https://image.tmdb.org/t/p/w500/a2E0aX8rN9Gk6rG7z7Ck0Q2Pj6.jpg", genres: ["Comedy", "Drama"], rating: 7.9, certification: "R", director: "Alexander Payne", summary: "A cranky prep school teacher remains on campus over the holidays to babysit the handful of students with nowhere to go." },
  { id: "run", title: "Run", releaseYear: "2020", posterUrl: "https://image.tmdb.org/t/p/w500/r0Q0w0uH9Y0o4rC9g8j9m1P0w0p.jpg", genres: ["Thriller", "Horror", "Mystery"], rating: 6.7, certification: "PG-13", director: "Aneesh Chaganty", summary: "A homeschooled teenager begins to suspect her mother is hiding an unnerving secret from her about her medication." },
  { id: "boston-strangler", title: "Boston Strangler", releaseYear: "2023", posterUrl: "https://image.tmdb.org/t/p/w500/1Q0w0uH9Y0o4rC9g8j9m1P0w0p.jpg", genres: ["Crime", "Drama", "History"], rating: 6.5, certification: "R", director: "Matt Ruskin", summary: "Pioneering reporters Loretta McLaughlin and Jean Cole break the story of the notorious Boston Strangler murders." },
  { id: "sintel-sample", title: "Sintel (HDR Cinematic Master)", releaseYear: "2010", posterUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8f/Sintel_poster.jpg", genres: ["Animation", "Fantasy", "Adventure"], rating: 7.7, certification: "PG", director: "Colin Levy", summary: "A young woman embarks on a quest across the snowy mountains to rescue Scales, her baby dragon companion." }
];

export const HBO_MAX_TOP_20: FeaturedMovie[] = [
  { id: "dune-two", title: "Dune: Part Two", releaseYear: "2024", posterUrl: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg", bannerUrl: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg", genres: ["Sci-Fi", "Adventure", "Action"], rating: 8.5, certification: "PG-13", director: "Denis Villeneuve", summary: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family." },
  { id: "interstellar", title: "Interstellar", releaseYear: "2014", posterUrl: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", bannerUrl: "https://image.tmdb.org/t/p/original/8sNiAPPYU14PUepFNeSNGUTiHW.jpg", genres: ["Sci-Fi", "Drama", "Adventure"], rating: 8.7, certification: "PG-13", director: "Christopher Nolan", summary: "When Earth becomes uninhabitable, a team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival." },
  { id: "civil-war", title: "Civil War", releaseYear: "2024", posterUrl: "https://image.tmdb.org/t/p/w500/sh7Rg8Er3tFcN9BpKIPOMvALgZd.jpg", bannerUrl: "https://image.tmdb.org/t/p/original/t2SXZ7KLriaLyf5QT8Iar6fSOGp.jpg", genres: ["Action", "Drama", "War"], rating: 7.1, certification: "R", director: "Alex Garland", summary: "A journey across a dystopian future America, following military-embedded journalists racing to reach Washington D.C." },
  { id: "the-batman", title: "The Batman", releaseYear: "2022", posterUrl: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg", bannerUrl: "https://image.tmdb.org/t/p/original/eUORREWq2ThkkxyiCESCu3sVdGg.jpg", genres: ["Action", "Crime", "Drama"], rating: 7.8, certification: "PG-13", director: "Matt Reeves", summary: "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city's corruption." },
  { id: "oppenheimer", title: "Oppenheimer", releaseYear: "2023", posterUrl: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", bannerUrl: "https://image.tmdb.org/t/p/original/cUIqZd6jJCbO94Txt1CkTs7MSeP.jpg", genres: ["Biography", "Drama", "History"], rating: 8.9, certification: "R", director: "Christopher Nolan", summary: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during the Manhattan Project." },
  { id: "parasite", title: "Parasite", releaseYear: "2019", posterUrl: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", genres: ["Comedy", "Drama", "Thriller"], rating: 8.5, certification: "R", director: "Bong Joon-ho", summary: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan." },
  { id: "mad-max-fury-road", title: "Mad Max: Fury Road", releaseYear: "2015", posterUrl: "https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg", genres: ["Action", "Adventure", "Sci-Fi"], rating: 8.1, certification: "R", director: "George Miller", summary: "In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search for her homeland with the aid of female prisoners." },
  { id: "the-zone-of-interest", title: "The Zone of Interest", releaseYear: "2023", posterUrl: "https://image.tmdb.org/t/p/w500/hUu9zyZmDd8VZegKi1iK1Vk0RYS.jpg", bannerUrl: "https://image.tmdb.org/t/p/original/pnTSOKcYnvdpQNQElAtJM1rWOxH.jpg", genres: ["Drama", "History", "War"], rating: 7.5, certification: "PG-13", director: "Jonathan Glazer", summary: "Auschwitz commandant Rudolf Höss and his wife Hedwig strive to build an idyllic domestic life for their family right next to the camp." },
  { id: "beau-is-afraid", title: "Beau Is Afraid", releaseYear: "2023", posterUrl: "https://image.tmdb.org/t/p/w500/wgVkkjigF31r1nZV80uV0xNIoun.jpg", genres: ["Comedy", "Drama", "Horror"], rating: 6.7, certification: "R", director: "Ari Aster", summary: "Following the sudden death of his overbearing mother, an anxiety-ridden man embarks on a surreal odyssey back home." },
  { id: "warfare", title: "Warfare", releaseYear: "2025", posterUrl: "https://image.tmdb.org/t/p/w500/7e44PdsYpzOBDNDda50mANxH2Jg.jpg", genres: ["War", "Action", "Drama"], rating: 7.6, certification: "R", director: "Alex Garland", summary: "An intense historical exploration of ground warfare tactics, military brotherhood, and psychological endurance." },
  { id: "the-legend-of-ochi", title: "The Legend of Ochi", releaseYear: "2025", posterUrl: "https://image.tmdb.org/t/p/w500/qYyEelO4JfOwE0Ui5KsrCE0O8UA.jpg", genres: ["Adventure", "Fantasy", "Family"], rating: 7.4, certification: "PG", director: "Isaiah Saxon", summary: "A young girl runs away from home and learns to communicate with an elusive, mythical species of woodland animal." },
  { id: "barbie", title: "Barbie", releaseYear: "2023", posterUrl: "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg", genres: ["Comedy", "Adventure", "Fantasy"], rating: 6.8, certification: "PG-13", director: "Greta Gerwig", summary: "Stereotypical Barbie experiences an existential crisis that prompts her to embark on a journey of self-discovery in the real world." },
  { id: "furiosa", title: "Furiosa: A Mad Max Saga", releaseYear: "2024", posterUrl: "https://image.tmdb.org/t/p/w500/iADOJ8Zymht2JPMoy3R7xUMZqaC.jpg", genres: ["Action", "Adventure", "Sci-Fi"], rating: 7.6, certification: "R", director: "George Miller", summary: "The origin story of renegade warrior Furiosa before her encounter and teamup with Mad Max in Fury Road." },
  { id: "godzilla-minus-one", title: "Godzilla Minus One", releaseYear: "2023", posterUrl: "https://image.tmdb.org/t/p/w500/hkxxMIGaiCTmrEArK7J56JTKUlB.jpg", genres: ["Action", "Sci-Fi", "Horror"], rating: 7.9, certification: "PG-13", director: "Takashi Yamazaki", summary: "Post-war Japan is at its lowest point when an unexpected colossal monster emerges, tested by the nuclear fires." },
  { id: "the-green-knight", title: "The Green Knight", releaseYear: "2021", posterUrl: "https://image.tmdb.org/t/p/w500/if4hw3Ou5Sav9Em7WWHj66mnywp.jpg", genres: ["Drama", "Fantasy", "Adventure"], rating: 6.6, certification: "R", director: "David Lowery", summary: "A fantasy retelling of the medieval story of Sir Gawain and his quest to confront the enigmatic Green Knight." },
  { id: "gladiator-two", title: "Gladiator II", releaseYear: "2024", posterUrl: "https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg", bannerUrl: "https://image.tmdb.org/t/p/original/tOqIwliWMovSIZ9DyvHcHI7p2im.jpg", genres: ["Action", "Adventure", "Drama"], rating: 7.1, certification: "R", director: "Ridley Scott", summary: "Years after Maximus's heroic sacrifice, Lucius enters the Colosseum after tyrannical emperors conquer his home." },
  { id: "the-whale", title: "The Whale", releaseYear: "2022", posterUrl: "https://image.tmdb.org/t/p/w500/jQ0gylJMxWSL490sy0RrPj1Lj7e.jpg", genres: ["Drama"], rating: 7.7, certification: "R", director: "Darren Aronofsky", summary: "A reclusive, morbidly obese English teacher attempts to reconnect with his estranged teenage daughter." },
  { id: "godzilla-kong", title: "Godzilla x Kong: The New Empire", releaseYear: "2024", posterUrl: "https://image.tmdb.org/t/p/w500/bQ2ywkch07zgNqB2BLAnAqzyMv0.jpg", genres: ["Action", "Sci-Fi", "Adventure"], rating: 6.4, certification: "PG-13", director: "Adam Wingard", summary: "Two ancient titans, Godzilla and Kong, clash in an epic battle as humans unravel their intertwined origins." },
  { id: "blade-runner-2049", title: "Blade Runner 2049", releaseYear: "2017", posterUrl: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg", bannerUrl: "https://image.tmdb.org/t/p/original/gNdLJU9TxrpGx4dkZidjys3fyy0.jpg", genres: ["Sci-Fi", "Mystery", "Drama"], rating: 8.0, certification: "R", director: "Denis Villeneuve", summary: "Young Blade Runner K's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard." },
  { id: "tears-sample", title: "Tears of Steel (Sci-Fi Atmos Master)", releaseYear: "2012", posterUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Tears_of_steel_poster.jpg", genres: ["Sci-Fi", "Action", "Cyberpunk"], rating: 7.4, certification: "PG-13", director: "Ian Hubert", summary: "In a dystopian Amsterdam, scientists turn an observatory into a defense weapon against mechanical giants in 4K Atmos." }
];

export const NETFLIX_TOP_20_SHOWS: FeaturedMovie[] = [
  { id: "squid-game", title: "Squid Game", releaseYear: "2024", posterUrl: "https://image.tmdb.org/t/p/w500/dDlG1T8v4Zc5N1gq1Xw1k0B9p9p.jpg", genres: ["Thriller", "Drama", "Action"], rating: 8.0, certification: "TV-MA", director: "Hwang Dong-hyuk", summary: "Hundreds of cash-strapped players accept a deadly invitation to compete in children's games for 45.6 billion won." },
  { id: "stranger-things", title: "Stranger Things", releaseYear: "2025", posterUrl: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg", genres: ["Sci-Fi", "Horror", "Adventure"], rating: 8.7, certification: "TV-14", director: "The Duffer Brothers", summary: "A small Indiana town uncovers terrifying supernatural forces, clandestine government labs, and the Upside Down." },
  { id: "wednesday", title: "Wednesday", releaseYear: "2023", posterUrl: "https://image.tmdb.org/t/p/w500/9PFonB99qQeFL4BoLZYneST8aYF.jpg", genres: ["Comedy", "Fantasy", "Mystery"], rating: 8.1, certification: "TV-14", director: "Tim Burton", summary: "Wednesday Addams investigates a monstrous murder spree while attending Nevermore Academy." },
  { id: "the-crown", title: "The Crown", releaseYear: "2023", posterUrl: "https://image.tmdb.org/t/p/w500/1E5baAaEse26fej7uHcjOgEE2t2.jpg", genres: ["Drama", "History"], rating: 8.6, certification: "TV-MA", director: "Peter Morgan", summary: "Chronicles the life of Queen Elizabeth II from the 1940s to modern times, exploring the romances and rivalries." },
  { id: "black-mirror", title: "Black Mirror", releaseYear: "2023", posterUrl: "https://image.tmdb.org/t/p/w500/7RumAnp6e1j8gqY5LkJQpQkC44j.jpg", genres: ["Sci-Fi", "Drama", "Thriller"], rating: 8.7, certification: "TV-MA", director: "Charlie Brooker", summary: "An anthology series exploring a twisted, high-tech multiverse where humanity's innovations and dark instincts collide." },
  { id: "bridgerton", title: "Bridgerton", releaseYear: "2024", posterUrl: "https://image.tmdb.org/t/p/w500/luoKqm9udvfnZ2N48wM4g5V9P7N.jpg", genres: ["Drama", "Romance"], rating: 8.2, certification: "TV-MA", director: "Chris Van Dusen", summary: "Eight close-knit siblings of the Bridgerton family search for love and happiness in London high society." },
  { id: "ozark", title: "Ozark", releaseYear: "2022", posterUrl: "https://image.tmdb.org/t/p/w500/m73Qd3u1B5jP1r7z3z9G8z8k9B.jpg", genres: ["Crime", "Drama", "Thriller"], rating: 8.5, certification: "TV-MA", director: "Bill Dubuque", summary: "A financial advisor drags his family from Chicago to the Missouri Ozarks to launder $500 million for a drug cartel." },
  { id: "queen-gambit", title: "The Queen's Gambit", releaseYear: "2020", posterUrl: "https://image.tmdb.org/t/p/w500/zU0htwkhNvBQdVSIKB9lf6vBiKy.jpg", genres: ["Drama"], rating: 8.6, certification: "TV-MA", director: "Scott Frank", summary: "Orphaned at tender age nine, prodigious introvert Beth Harmon discovers and masters the game of chess in 1960s USA." },
  { id: "mindhunter", title: "Mindhunter", releaseYear: "2019", posterUrl: "https://image.tmdb.org/t/p/w500/fbKE87mojpIETWepSbD58742p9p.jpg", genres: ["Crime", "Drama", "Thriller"], rating: 8.6, certification: "TV-MA", director: "David Fincher", summary: "In the late 1970s two FBI agents expand criminal science by delving into the psychology of murder." },
  { id: "dark", title: "Dark", releaseYear: "2020", posterUrl: "https://image.tmdb.org/t/p/w500/apbrWg228vL7d9k5k4p6l4v4d9.jpg", genres: ["Sci-Fi", "Mystery", "Drama"], rating: 8.7, certification: "TV-MA", director: "Baran bo Odar", summary: "A family saga with a supernatural twist, set in a German town where children disappear into subterranean time portals." },
  { id: "money-heist", title: "Money Heist", releaseYear: "2021", posterUrl: "https://image.tmdb.org/t/p/w500/reEMJA1uzscCbk5rOpI165eum88.jpg", genres: ["Crime", "Action", "Thriller"], rating: 8.2, certification: "TV-MA", director: "Álex Pina", summary: "An unusual group of robbers attempt to carry out the most immaculate robbery in Spanish history at the Royal Mint." },
  { id: "narcos", title: "Narcos", releaseYear: "2017", posterUrl: "https://image.tmdb.org/t/p/w500/rTmal9f0wh5rRGeENWoG02oJ4D.jpg", genres: ["Crime", "Drama", "Biography"], rating: 8.8, certification: "TV-MA", director: "Chris Brancato", summary: "A chronicled look at the criminal exploits of Colombian drug lord Pablo Escobar and the DEA agents hunting him." },
  { id: "peaky-blinders", title: "Peaky Blinders", releaseYear: "2022", posterUrl: "https://image.tmdb.org/t/p/w500/vUUqzWa2LnHIVqkaKVlVGkVcZIW.jpg", genres: ["Crime", "Drama"], rating: 8.8, certification: "TV-MA", director: "Steven Knight", summary: "A notorious gangster family epic set in Birmingham, England, in 1919 following the brutal aftermath of WWI." },
  { id: "beef", title: "Beef", releaseYear: "2023", posterUrl: "https://image.tmdb.org/t/p/w500/m1N9jP1r7z3z9G8z8k9B5jP1r7.jpg", genres: ["Comedy", "Drama"], rating: 8.0, certification: "TV-MA", director: "Lee Sung Jin", summary: "A road rage incident between two strangers brings out their deepest, darkest impulses and unravels their lives." },
  { id: "heartstopper", title: "Heartstopper", releaseYear: "2023", posterUrl: "https://image.tmdb.org/t/p/w500/pB0w0uH9Y0o4rC9g8j9m1P0w0p.jpg", genres: ["Drama", "Romance"], rating: 8.6, certification: "TV-14", director: "Euros Lyn", summary: "Teens Charlie and Nick discover their unlikely friendship might be something more as they navigate school and young love." },
  { id: "better-call-saul", title: "Better Call Saul", releaseYear: "2022", posterUrl: "https://image.tmdb.org/t/p/w500/fC2HDm5t0kHVR79ujTVnpIxNGm2.jpg", genres: ["Crime", "Drama"], rating: 9.0, certification: "TV-MA", director: "Vince Gilligan", summary: "The trials and tribulations of criminal lawyer Jimmy McGill in the years leading up to his fateful run-in with Walter White." },
  { id: "breaking-bad", title: "Breaking Bad", releaseYear: "2013", posterUrl: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg", genres: ["Crime", "Drama", "Thriller"], rating: 9.5, certification: "TV-MA", director: "Vince Gilligan", summary: "A chemistry teacher diagnosed with terminal lung cancer teams up with a former student to manufacture crystal meth." },
  { id: "the-witcher", title: "The Witcher", releaseYear: "2023", posterUrl: "https://image.tmdb.org/t/p/w500/cZ0d3rtvXMTv1A3p5p1r9G8z8k.jpg", genres: ["Action", "Adventure", "Fantasy"], rating: 8.1, certification: "TV-MA", director: "Lauren Schmidt Hissrich", summary: "Geralt of Rivia, a mutated monster-hunter for hire, journeys toward his destiny in a turbulent world." },
  { id: "you", title: "YOU", releaseYear: "2024", posterUrl: "https://image.tmdb.org/t/p/w500/ne1N9jP1r7z3z9G8z8k9B5jP1r7.jpg", genres: ["Crime", "Drama", "Romance"], rating: 7.7, certification: "TV-MA", director: "Greg Berlanti", summary: "A dangerously charming young man goes to hyper-calculated lengths to insert himself into the lives of his obsessions." },
  { id: "cobra-kai", title: "Cobra Kai", releaseYear: "2024", posterUrl: "https://image.tmdb.org/t/p/w500/6POBWybSBDBKjSs1VAQcnQC1q2.jpg", genres: ["Action", "Comedy", "Drama"], rating: 8.4, certification: "TV-14", director: "Josh Heald", summary: "Decades after their 1984 tournament bout, Daniel LaRusso and Johnny Lawrence reignite their martial-arts rivalry." }
];

export const HULU_TOP_20_SHOWS: FeaturedMovie[] = [
  { id: "shogun", title: "Shōgun", releaseYear: "2024", posterUrl: "https://image.tmdb.org/t/p/w500/7O4iVfOMQmdCSxhOg1WnzG1AgYT.jpg", bannerUrl: "https://images.unsplash.com/photo-1528164344705-475426879c0d?q=80&w=1600&auto=format&fit=crop", genres: ["Drama", "Historical", "Adventure"], rating: 8.7, certification: "TV-MA", director: "Rachel Kondo", summary: "Lord Yoshii Toranaga discovers secrets that could tip the scales of power and devastate his enemies in feudal Japan." },
  { id: "the-bear", title: "The Bear", releaseYear: "2024", posterUrl: "https://image.tmdb.org/t/p/w500/sHFlwB5y0v6F0r0eU1m5B0M9B9B.jpg", bannerUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1600&auto=format&fit=crop", genres: ["Drama", "Comedy"], rating: 8.6, certification: "TV-MA", director: "Christopher Storer", summary: "A young fine-dining chef returns home to Chicago to run his family's chaotic Italian beef sandwich shop." },
  { id: "only-murders", title: "Only Murders in the Building", releaseYear: "2024", posterUrl: "https://image.tmdb.org/t/p/w500/3kAgfT3qBf9Lg0Oup5WHcrpjvw.jpg", genres: ["Comedy", "Crime", "Mystery"], rating: 8.1, certification: "TV-MA", director: "John Hoffman", summary: "Three true-crime podcast enthusiasts find themselves investigating a grisly murder inside their apartment building." },
  { id: "fargo", title: "Fargo", releaseYear: "2024", posterUrl: "https://image.tmdb.org/t/p/w500/pB0w0uH9Y0o4rC9g8j9m1P0w0p.jpg", genres: ["Crime", "Drama", "Thriller"], rating: 8.9, certification: "TV-MA", director: "Noah Hawley", summary: "Chronicles eccentric Midwestern crimes and the relentless local law enforcement officers tasked with unraveling them." },
  { id: "handmaids-tale", title: "The Handmaid's Tale", releaseYear: "2024", posterUrl: "https://image.tmdb.org/t/p/w500/oIkxqtug5QIhx5rajcVvCJFYMm.jpg", genres: ["Drama", "Sci-Fi", "Thriller"], rating: 8.4, certification: "TV-MA", director: "Bruce Miller", summary: "Set in a dystopian future, a woman is forced to live as a concubine under a fundamentalist theocratic dictatorship." },
  { id: "what-we-do-in-shadows", title: "What We Do in the Shadows", releaseYear: "2024", posterUrl: "https://image.tmdb.org/t/p/w500/7Ew0h8j9m1P0w0pa2E0aX8rN9G.jpg", genres: ["Comedy", "Fantasy", "Horror"], rating: 8.6, certification: "TV-MA", director: "Jemaine Clement", summary: "A look into the daily, centuries-old lives of four vampires who've lived together for over a hundred years on Staten Island." },
  { id: "dopesick", title: "Dopesick", releaseYear: "2021", posterUrl: "https://image.tmdb.org/t/p/w500/71N9jP1r7z3z9G8z8k9B5jP1r7.jpg", genres: ["Drama"], rating: 8.6, certification: "TV-MA", director: "Danny Strong", summary: "Examines how one company triggered the worst drug epidemic in American history, from Big Pharma to mining communities." },
  { id: "under-the-banner", title: "Under the Banner of Heaven", releaseYear: "2022", posterUrl: "https://image.tmdb.org/t/p/w500/91N9jP1r7z3z9G8z8k9B5jP1r7.jpg", genres: ["Crime", "Drama", "Mystery"], rating: 7.5, certification: "TV-MA", director: "Dustin Lance Black", summary: "A devout detective's faith is tested as he investigates a brutal double murder connected to fundamentalist LDS secrets." },
  { id: "the-dropout", title: "The Dropout", releaseYear: "2022", posterUrl: "https://image.tmdb.org/t/p/w500/51N9jP1r7z3z9G8z8k9B5jP1r7.jpg", genres: ["Biography", "Drama"], rating: 7.5, certification: "TV-MA", director: "Elizabeth Meriwether", summary: "Chronicles Theranos founder Elizabeth Holmes's ambition and fame that plunged into a sensational biotech scandal." },
  { id: "the-great", title: "The Great", releaseYear: "2023", posterUrl: "https://image.tmdb.org/t/p/w500/41N9jP1r7z3z9G8z8k9B5jP1r7.jpg", genres: ["Biography", "Comedy", "Drama"], rating: 8.2, certification: "TV-MA", director: "Tony McNamara", summary: "An occasionally true satirical story of an idealistic young girl who arrives in Russia for an arranged marriage to Emperor Peter." },
  { id: "atlanta", title: "Atlanta", releaseYear: "2022", posterUrl: "https://image.tmdb.org/t/p/w500/x1N9jP1r7z3z9G8z8k9B5jP1r7.jpg", genres: ["Comedy", "Drama", "Music"], rating: 8.6, certification: "TV-MA", director: "Donald Glover", summary: "Two cousins work through the Atlanta music scene in a bid to better their lives and the lives of their families." },
  { id: "justified", title: "Justified: City Primeval", releaseYear: "2023", posterUrl: "https://image.tmdb.org/t/p/w500/b1N9jP1r7z3z9G8z8k9B5jP1r7.jpg", genres: ["Action", "Crime", "Drama"], rating: 8.1, certification: "TV-MA", director: "Dave Andron", summary: "US Marshal Raylan Givens is drawn into the violent underworld of Detroit when a chance encounter leads him north." },
  { id: "devs", title: "Devs", releaseYear: "2020", posterUrl: "https://image.tmdb.org/t/p/w500/c1N9jP1r7z3z9G8z8k9B5jP1r7.jpg", genres: ["Drama", "Mystery", "Sci-Fi"], rating: 7.7, certification: "TV-MA", director: "Alex Garland", summary: "A software engineer investigates a secretive development division in her quantum computing employer." },
  { id: "fleishman", title: "Fleishman Is in Trouble", releaseYear: "2022", posterUrl: "https://image.tmdb.org/t/p/w500/d1N9jP1r7z3z9G8z8k9B5jP1r7.jpg", genres: ["Drama"], rating: 7.7, certification: "TV-MA", director: "Taffy Brodesser-Akner", summary: "Toby Fleishman dives into dating apps, but just as his summer of freedom begins, his ex-wife disappears without a trace." },
  { id: "a-murder-at-the-end", title: "A Murder at the End of the World", releaseYear: "2023", posterUrl: "https://image.tmdb.org/t/p/w500/e1N9jP1r7z3z9G8z8k9B5jP1r7.jpg", genres: ["Drama", "Mystery", "Thriller"], rating: 7.1, certification: "TV-MA", director: "Brit Marling", summary: "A Gen Z amateur sleuth is invited to a reclusive billionaire's retreat in remote Iceland where a guest is murdered." },
  { id: "normal-people", title: "Normal People", releaseYear: "2020", posterUrl: "https://image.tmdb.org/t/p/w500/f1N9jP1r7z3z9G8z8k9B5jP1r7.jpg", genres: ["Drama", "Romance"], rating: 8.4, certification: "TV-MA", director: "Lenny Abrahamson", summary: "Follows Marianne and Connell as they weave in and out of each other's romantic lives in Ireland." },
  { id: "ramy", title: "Ramy", releaseYear: "2022", posterUrl: "https://image.tmdb.org/t/p/w500/g1N9jP1r7z3z9G8z8k9B5jP1r7.jpg", genres: ["Comedy", "Drama"], rating: 8.0, certification: "TV-MA", director: "Ramy Youssef", summary: "A first-generation Egyptian-American is on a spiritual journey in his politically divided New Jersey neighborhood." },
  { id: "the-old-man", title: "The Old Man", releaseYear: "2024", posterUrl: "https://image.tmdb.org/t/p/w500/h1N9jP1r7z3z9G8z8k9B5jP1r7.jpg", genres: ["Action", "Drama", "Thriller"], rating: 7.6, certification: "TV-MA", director: "Jonathan E. Steinberg", summary: "A retired CIA operative who's been living off the grid finds his past catching up when an assassin arrives." },
  { id: "abbott-elementary", title: "Abbott Elementary", releaseYear: "2024", posterUrl: "https://image.tmdb.org/t/p/w500/i1N9jP1r7z3z9G8z8k9B5jP1r7.jpg", genres: ["Comedy"], rating: 8.2, certification: "TV-PG", director: "Quinta Brunson", summary: "Dedicated teachers in a Philadelphia public school work against the odds to help their students succeed." },
  { id: "reservation-dogs", title: "Reservation Dogs", releaseYear: "2023", posterUrl: "https://image.tmdb.org/t/p/w500/j1N9jP1r7z3z9G8z8k9B5jP1r7.jpg", genres: ["Comedy", "Crime", "Drama"], rating: 8.2, certification: "TV-MA", director: "Sterlin Harjo", summary: "Four Indigenous teenagers in rural Oklahoma steal, rob and save in order to get to the exotic land of California." }
];

export const HBO_MAX_TOP_20_SHOWS: FeaturedMovie[] = [
  { id: "the-last-of-us", title: "The Last of Us", releaseYear: "2024", posterUrl: "https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2V7J78ED.jpg", bannerUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop", genres: ["Sci-Fi", "Drama", "Action"], rating: 8.8, certification: "TV-MA", director: "Craig Mazin", summary: "After a global pandemic destroys civilization, a hardened survivor takes charge of a 14-year-old girl who may be humanity's last hope." },
  { id: "succession", title: "Succession", releaseYear: "2023", posterUrl: "https://image.tmdb.org/t/p/w500/7DVk6m2m6yvU1B9rN9Gk6rG7z7C.jpg", genres: ["Drama"], rating: 8.9, certification: "TV-MA", director: "Jesse Armstrong", summary: "The Roy family is known for controlling the biggest media and entertainment company in the world as their aging father contemplates stepping down." },
  { id: "house-of-dragon", title: "House of the Dragon", releaseYear: "2024", posterUrl: "https://image.tmdb.org/t/p/w500/7QMsOTMUswlwxJP0rTTZfmz2tX2.jpg", genres: ["Action", "Adventure", "Drama"], rating: 8.4, certification: "TV-MA", director: "Ryan J. Condal", summary: "An internal succession war within House Targaryen at the height of its power, 172 years before the birth of Daenerys Targaryen." },
  { id: "white-lotus", title: "The White Lotus", releaseYear: "2023", posterUrl: "https://image.tmdb.org/t/p/w500/r00L1wH9Y0o4rC9g8j9m1P0w0p.jpg", genres: ["Comedy", "Drama"], rating: 8.0, certification: "TV-MA", director: "Mike White", summary: "Follows the exploits of various guests and employees at an exclusive resort over the span of a transformative week." },
  { id: "chernobyl", title: "Chernobyl", releaseYear: "2019", posterUrl: "https://image.tmdb.org/t/p/w500/hlLXt2tOPT6RRnjiUmoxyG1LTFi.jpg", genres: ["Drama", "History", "Thriller"], rating: 9.3, certification: "TV-MA", director: "Craig Mazin", summary: "Dramatizes the true story of the 1986 nuclear plant disaster in the USSR and the heroic sacrifices made to save Europe." },
  { id: "game-of-thrones", title: "Game of Thrones", releaseYear: "2019", posterUrl: "https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg", genres: ["Action", "Adventure", "Drama"], rating: 9.2, certification: "TV-MA", director: "David Benioff", summary: "Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia." },
  { id: "true-detective", title: "True Detective: Night Country", releaseYear: "2024", posterUrl: "https://image.tmdb.org/t/p/w500/cuV2O529pqAG83q0bp5p1r9G8z.jpg", genres: ["Crime", "Drama", "Mystery"], rating: 8.9, certification: "TV-MA", director: "Issa López", summary: "When the long winter night falls in Ennis, Alaska, the men that operate the Tsalal Arctic Research Station vanish without a trace." },
  { id: "the-wire", title: "The Wire", releaseYear: "2008", posterUrl: "https://image.tmdb.org/t/p/w500/og79IHwhdPfJz1qYyL1N9jP1r7.jpg", genres: ["Crime", "Drama", "Thriller"], rating: 9.3, certification: "TV-MA", director: "David Simon", summary: "The Baltimore drug scene, as seen through the eyes of drug dealers and law enforcement." },
  { id: "the-sopranos", title: "The Sopranos", releaseYear: "2007", posterUrl: "https://image.tmdb.org/t/p/w500/670x9sf0p1r9G8z8k9B5jP1r7.jpg", genres: ["Crime", "Drama"], rating: 9.2, certification: "TV-MA", director: "David Chase", summary: "New Jersey mob boss Tony Soprano deals with personal and professional issues in his home and business life that affect his mental state." },
  { id: "euphoria", title: "Euphoria", releaseYear: "2024", posterUrl: "https://image.tmdb.org/t/p/w500/jtnfNzqZwN4E32FGGxx1YZaB59n.jpg", genres: ["Drama"], rating: 8.3, certification: "TV-MA", director: "Sam Levinson", summary: "A look at life for a group of high school students as they grapple with issues of drugs, sex, identity, and love." },
  { id: "barry", title: "Barry", releaseYear: "2023", posterUrl: "https://image.tmdb.org/t/p/w500/71N9jP1r7z3z9G8z8k9B5jP1r8.jpg", genres: ["Action", "Comedy", "Crime"], rating: 8.4, certification: "TV-MA", director: "Bill Hader", summary: "A hitman from the Midwest moves to Los Angeles and gets caught up in the city's theatre arts scene." },
  { id: "peacemaker", title: "Peacemaker", releaseYear: "2024", posterUrl: "https://image.tmdb.org/t/p/w500/hE3LRZAY8cuG1dpqen69BWAsLQI.jpg", genres: ["Action", "Adventure", "Comedy"], rating: 8.3, certification: "TV-MA", director: "James Gunn", summary: "Picking up where The Suicide Squad left off, Peacemaker returns home after recovering from his encounter with Bloodsport." },
  { id: "hacks", title: "Hacks", releaseYear: "2024", posterUrl: "https://image.tmdb.org/t/p/w500/91N9jP1r7z3z9G8z8k9B5jP1r8.jpg", genres: ["Comedy", "Drama"], rating: 8.2, certification: "TV-MA", director: "Lucia Aniello", summary: "Explores a dark mentorship that forms between Deborah Vance, a legendary Las Vegas comedian, and an entitled 25-year-old outcast." },
  { id: "station-eleven", title: "Station Eleven", releaseYear: "2022", posterUrl: "https://image.tmdb.org/t/p/w500/41N9jP1r7z3z9G8z8k9B5jP1r8.jpg", genres: ["Drama", "Mystery", "Sci-Fi"], rating: 7.7, certification: "TV-MA", director: "Patrick Somerville", summary: "A post-apocalyptic saga spanning multiple timelines, telling the stories of survivors of a devastating flu." },
  { id: "watchmen", title: "Watchmen", releaseYear: "2019", posterUrl: "https://image.tmdb.org/t/p/w500/51N9jP1r7z3z9G8z8k9B5jP1r8.jpg", genres: ["Action", "Crime", "Drama"], rating: 8.2, certification: "TV-MA", director: "Damon Lindelof", summary: "Set in an alternate history where masked vigilantes are treated as outlaws, Watchmen embraces the nostalgia of the graphic novel." },
  { id: "mare-of-easttown", title: "Mare of Easttown", releaseYear: "2021", posterUrl: "https://image.tmdb.org/t/p/w500/b1N9jP1r7z3z9G8z8k9B5jP1r8.jpg", genres: ["Crime", "Drama", "Mystery"], rating: 8.4, certification: "TV-MA", director: "Brad Ingelsby", summary: "A detective in a small Pennsylvania town investigates a local murder while trying to keep her life from falling apart." },
  { id: "silicon-valley", title: "Silicon Valley", releaseYear: "2019", posterUrl: "https://image.tmdb.org/t/p/w500/c1N9jP1r7z3z9G8z8k9B5jP1r8.jpg", genres: ["Comedy"], rating: 8.5, certification: "TV-MA", director: "Mike Judge", summary: "Follows the struggle of Richard Hendricks, a Silicon Valley engineer trying to build his own company called Pied Piper." },
  { id: "the-penguin", title: "The Penguin", releaseYear: "2024", posterUrl: "https://image.tmdb.org/t/p/w500/v0Q0w0uH9Y0o4rC9g8j9m1P0w0p.jpg", genres: ["Crime", "Drama"], rating: 8.8, certification: "TV-MA", director: "Lauren LeFranc", summary: "Following the events of The Batman, Oz Cobb seeks to seize control of Gotham's underworld in the power vacuum left by Falcone." },
  { id: "tokyo-vice", title: "Tokyo Vice", releaseYear: "2024", posterUrl: "https://image.tmdb.org/t/p/w500/d1N9jP1r7z3z9G8z8k9B5jP1r8.jpg", genres: ["Crime", "Drama", "Thriller"], rating: 8.0, certification: "TV-MA", director: "J.T. Rogers", summary: "A Western journalist working for a publication in Tokyo takes on one of the city's most powerful crime bosses." },
  { id: "band-of-brothers", title: "Band of Brothers", releaseYear: "2001", posterUrl: "https://image.tmdb.org/t/p/w500/e1N9jP1r7z3z9G8z8k9B5jP1r8.jpg", genres: ["Action", "Drama", "History"], rating: 9.4, certification: "TV-MA", director: "Tom Hanks", summary: "The story of Easy Company of the U.S. Army 101st Airborne Division and their mission in World War II Europe." }
];

// Expanded TOP 50 Lists (50 items each)
export const NETFLIX_TOP_50: FeaturedMovie[] = EXPAND_TO_50(NETFLIX_TOP_20, SUPPLEMENTAL_MOVIES, 'netflix-movie');
export const HULU_TOP_50: FeaturedMovie[] = EXPAND_TO_50(HULU_TOP_20, SUPPLEMENTAL_MOVIES, 'hulu-movie');
export const HBO_MAX_TOP_50: FeaturedMovie[] = EXPAND_TO_50(HBO_MAX_TOP_20, SUPPLEMENTAL_MOVIES, 'hbo-movie');
export const DISNEY_PLUS_TOP_50: FeaturedMovie[] = EXPAND_TO_50(DISNEY_PLUS_TOP_20, SUPPLEMENTAL_MOVIES, 'disney-movie');
export const AMAZON_PRIME_TOP_50: FeaturedMovie[] = EXPAND_TO_50(AMAZON_PRIME_TOP_20, SUPPLEMENTAL_MOVIES, 'amazon-movie');
export const APPLE_TV_TOP_50: FeaturedMovie[] = EXPAND_TO_50(APPLE_TV_TOP_20, SUPPLEMENTAL_MOVIES, 'apple-movie');

export const NETFLIX_TOP_50_SHOWS: FeaturedMovie[] = EXPAND_TO_50(NETFLIX_TOP_20_SHOWS, SUPPLEMENTAL_SHOWS, 'netflix-tv');
export const HULU_TOP_50_SHOWS: FeaturedMovie[] = EXPAND_TO_50(HULU_TOP_20_SHOWS, SUPPLEMENTAL_SHOWS, 'hulu-tv');
export const HBO_MAX_TOP_50_SHOWS: FeaturedMovie[] = EXPAND_TO_50(HBO_MAX_TOP_20_SHOWS, SUPPLEMENTAL_SHOWS, 'hbo-tv');
export const DISNEY_PLUS_TOP_50_SHOWS: FeaturedMovie[] = EXPAND_TO_50(DISNEY_PLUS_TOP_20_SHOWS, SUPPLEMENTAL_SHOWS, 'disney-tv');
export const AMAZON_PRIME_TOP_50_SHOWS: FeaturedMovie[] = EXPAND_TO_50(AMAZON_PRIME_TOP_20_SHOWS, SUPPLEMENTAL_SHOWS, 'amazon-tv');
export const APPLE_TV_TOP_50_SHOWS: FeaturedMovie[] = EXPAND_TO_50(APPLE_TV_TOP_20_SHOWS, SUPPLEMENTAL_SHOWS, 'apple-tv');

export const GLOBAL_MOVIE_POSTERS: FeaturedMovie[] = [
  ...HBO_MAX_TOP_50,
  ...NETFLIX_TOP_50.filter(n => !HBO_MAX_TOP_50.some(h => h.id === n.id)),
  ...HULU_TOP_50.filter(u => !HBO_MAX_TOP_50.some(h => h.id === u.id) && !NETFLIX_TOP_50.some(n => n.id === u.id)),
  ...DISNEY_PLUS_TOP_50.filter(d => !HBO_MAX_TOP_50.some(h => h.id === d.id) && !NETFLIX_TOP_50.some(n => n.id === d.id)),
  ...AMAZON_PRIME_TOP_50.filter(a => !HBO_MAX_TOP_50.some(h => h.id === a.id) && !NETFLIX_TOP_50.some(n => n.id === a.id)),
  ...APPLE_TV_TOP_50.filter(ap => !HBO_MAX_TOP_50.some(h => h.id === ap.id) && !NETFLIX_TOP_50.some(n => n.id === ap.id)),
  ...HBO_MAX_TOP_50_SHOWS.filter(s => !HBO_MAX_TOP_50.some(h => h.id === s.id)),
  ...NETFLIX_TOP_50_SHOWS.filter(s => !HBO_MAX_TOP_50.some(h => h.id === s.id) && !NETFLIX_TOP_50.some(n => n.id === s.id)),
  ...HULU_TOP_50_SHOWS.filter(s => !HBO_MAX_TOP_50.some(h => h.id === s.id) && !NETFLIX_TOP_50.some(n => n.id === s.id)),
  ...DISNEY_PLUS_TOP_50_SHOWS.filter(s => !HBO_MAX_TOP_50.some(h => h.id === s.id)),
  ...AMAZON_PRIME_TOP_50_SHOWS.filter(s => !HBO_MAX_TOP_50.some(h => h.id === s.id)),
  ...APPLE_TV_TOP_50_SHOWS.filter(s => !HBO_MAX_TOP_50.some(h => h.id === s.id)),
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

// Helper to compute daily updated Top 50 lists deterministically by calendar date
export function getDailyUpdatedTop50(items: FeaturedMovie[], seedOffset: number = 0): FeaturedMovie[] {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  
  // The first 6 items are the headline items, rotating daily
  const headline = items.slice(0, 6);
  const headlineShift = (dayOfYear + seedOffset) % Math.max(1, headline.length);
  const rotatedHeadline = [
    ...headline.slice(headlineShift),
    ...headline.slice(0, headlineShift)
  ];

  // The remaining 44 items rotate deterministically
  const tail = items.slice(6);
  const tailShift = (dayOfYear * 2 + seedOffset) % Math.max(1, tail.length);
  const rotatedTail = [
    ...tail.slice(tailShift),
    ...tail.slice(0, tailShift)
  ];

  return [...rotatedHeadline, ...rotatedTail].slice(0, 50);
}
export const KNOWN_TV_SHOW_IDS = new Set([
  'squid-game', 'stranger-things', 'wednesday', 'the-crown', 'black-mirror', 'bridgerton', 
  'ozark', 'queen-gambit', 'mindhunter', 'dark', 'money-heist', 'narcos', 'peaky-blinders', 
  'beef', 'heartstopper', 'better-call-saul', 'breaking-bad', 'the-witcher', 'you', 'cobra-kai',
  'shogun', 'the-bear', 'only-murders', 'fargo', 'handmaids-tale', 'what-we-do-in-shadows', 
  'dopesick', 'under-the-banner', 'the-dropout', 'the-great', 'atlanta', 'justified', 'devs', 
  'fleishman', 'a-murder-at-the-end', 'normal-people', 'ramy', 'the-old-man', 'abbott-elementary', 
  'reservation-dogs', 'the-last-of-us', 'succession', 'house-of-dragon', 'white-lotus', 'chernobyl', 
  'game-of-thrones', 'true-detective', 'the-wire', 'the-sopranos', 'euphoria', 'barry', 'peacemaker', 
  'hacks', 'station-eleven', 'watchmen', 'mare-of-easttown', 'silicon-valley', 'the-penguin', 
  'tokyo-vice', 'band-of-brothers', 'the-mandalorian', 'loki', 'andor', 'percy-jackson', 
  'x-men-97', 'ahsoka', 'bluey', 'what-if', 'the-simpsons', 'ms-marvel', 'national-treasure-series',
  'the-boys', 'fallout', 'reacher', 'rings-of-power', 'invincible', 'fleabag', 'gen-v',
  'mrs-maisel', 'jack-ryan', 'the-expanse', 'good-omens', 'bosch', 'wheel-of-time', 'outer-range',
  'mr-mrs-smith', 'clarksons-farm', 'patriot', 'tales-from-loop', 'terminal-list', 'cross',
  'severance', 'ted-lasso', 'the-morning-show', 'slow-horses', 'shrinking', 'bad-sisters',
  'foundation', 'silo', 'for-all-mankind', 'black-bird', 'pachinko', 'defending-jacob', 'wecrashed'
]);

export const isMovieItem = (item: FeaturedMovie): boolean => {
  if (!item) return false;
  if (KNOWN_TV_SHOW_IDS.has(item.id)) return false;
  if (item.id.includes('-tv') || item.id.includes('-show') || item.id.includes('-series')) return false;
  if (item.certification && item.certification.startsWith('TV-')) return false;
  return true;
};

export const getDailyUpdatedTop20 = getDailyUpdatedTop50;

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
  const [selectedLibraryFolder, setSelectedLibraryFolder] = useState<{
    id: string;
    name: string;
    path: string;
  } | null>(null);
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
  
  // Daily Top 50 update tracking
  const todayDateString = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, []);

  // Pure Movies Only list for the Movies tab hero & navigation
  const pureMoviesList = useMemo(() => {
    return GLOBAL_MOVIE_POSTERS.filter(isMovieItem);
  }, []);

  // Pure TV Shows list for the TV Shows tab
  const pureShowsList = useMemo(() => {
    return [
      ...NETFLIX_TOP_50_SHOWS,
      ...HULU_TOP_50_SHOWS,
      ...HBO_MAX_TOP_50_SHOWS,
      ...DISNEY_PLUS_TOP_50_SHOWS,
      ...AMAZON_PRIME_TOP_50_SHOWS,
      ...APPLE_TV_TOP_50_SHOWS,
    ];
  }, []);

  // Top 50 Movies per platform (strictly filtered to movies only)
  const dailyNetflixMovies = useMemo(() => getDailyUpdatedTop50(NETFLIX_TOP_50, 0).filter(isMovieItem), []);
  const dailyHuluMovies = useMemo(() => getDailyUpdatedTop50(HULU_TOP_50, 0).filter(isMovieItem), []);
  const dailyHboMovies = useMemo(() => getDailyUpdatedTop50(HBO_MAX_TOP_50, 0).filter(isMovieItem), []);
  const dailyDisneyMovies = useMemo(() => getDailyUpdatedTop50(DISNEY_PLUS_TOP_50, 1).filter(isMovieItem), []);
  const dailyAmazonMovies = useMemo(() => getDailyUpdatedTop50(AMAZON_PRIME_TOP_50, 2).filter(isMovieItem), []);
  const dailyAppleMovies = useMemo(() => getDailyUpdatedTop50(APPLE_TV_TOP_50, 3).filter(isMovieItem), []);

  // Top 50 TV Shows per platform
  const dailyNetflixShows = useMemo(() => getDailyUpdatedTop50(NETFLIX_TOP_50_SHOWS, 0), []);
  const dailyHuluShows = useMemo(() => getDailyUpdatedTop50(HULU_TOP_50_SHOWS, 0), []);
  const dailyHboShows = useMemo(() => getDailyUpdatedTop50(HBO_MAX_TOP_50_SHOWS, 0), []);
  const dailyDisneyShows = useMemo(() => getDailyUpdatedTop50(DISNEY_PLUS_TOP_50_SHOWS, 1), []);
  const dailyAmazonShows = useMemo(() => getDailyUpdatedTop50(AMAZON_PRIME_TOP_50_SHOWS, 2), []);
  const dailyAppleShows = useMemo(() => getDailyUpdatedTop50(APPLE_TV_TOP_50_SHOWS, 3), []);
  
  // UI Dialog states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isVoiceSearchRequested, setIsVoiceSearchRequested] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPluginModalOpen, setIsPluginModalOpen] = useState(false);
  const [pluginsActivated, setPluginsActivated] = useState(() => {
    try {
      return localStorage.getItem('nascent-plugins-activated') === '1';
    } catch {
      return false;
    }
  });
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
        showPluginsButton={pluginsActivated}
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
              if (tab === 'shared-libraries') setSelectedLibraryFolder(null);
            }}
            selectedPeerId={selectedPeerId}
            onSelectPeer={(peerId) => {
              setSelectedPeerId(peerId);
              setSelectedLibraryFolder(null);
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
            selectedFolderId={selectedLibraryFolder?.id ?? null}
            onSelectFolder={(folder) => {
              if (!folder) {
                setSelectedLibraryFolder(null);
                return;
              }
              setSelectedLibraryFolder({
                id: folder.id,
                name: folder.name,
                path: folder.path,
              });
              setSelectedPeerId(null);
              setActiveTab('local-media');
            }}
            onAddFolderSource={(folder) => {
              setSelectedLibraryFolder({
                id: folder.id,
                name: folder.name,
                path: folder.path,
              });
              setSelectedPeerId(null);
              setActiveTab('local-media');
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

              {/* Row 1: Top 50 Movies on Netflix */}
              <TvContentRow
                title="Top 50 Movies on Netflix"
                items={dailyNetflixMovies}
                onSelectItem={(m) => setInspectedMovie(m)}
                onFocusItem={(m) => setSelectedMovie(m)}
                isRanked={true}
                updatedDaily={true}
                dailyDateString={todayDateString}
                selectedItemId={currentFeatured.id}
              />

              {/* Row 2: Top 50 Movies on Hulu */}
              <TvContentRow
                title="Top 50 Movies on Hulu"
                items={dailyHuluMovies}
                onSelectItem={(m) => setInspectedMovie(m)}
                onFocusItem={(m) => setSelectedMovie(m)}
                isRanked={true}
                updatedDaily={true}
                dailyDateString={todayDateString}
                selectedItemId={currentFeatured.id}
              />

              {/* Row 3: Top 50 Movies on HBO Max */}
              <TvContentRow
                title="Top 50 Movies on HBO Max"
                items={dailyHboMovies}
                onSelectItem={(m) => setInspectedMovie(m)}
                onFocusItem={(m) => setSelectedMovie(m)}
                isRanked={true}
                updatedDaily={true}
                dailyDateString={todayDateString}
                selectedItemId={currentFeatured.id}
              />

              {/* Row 4: Top 50 Movies on Disney+ */}
              <TvContentRow
                title="Top 50 Movies on Disney+"
                items={dailyDisneyMovies}
                onSelectItem={(m) => setInspectedMovie(m)}
                onFocusItem={(m) => setSelectedMovie(m)}
                isRanked={true}
                updatedDaily={true}
                dailyDateString={todayDateString}
                selectedItemId={currentFeatured.id}
              />

              {/* Row 5: Top 50 Movies on Amazon Prime */}
              <TvContentRow
                title="Top 50 Movies on Amazon Prime"
                items={dailyAmazonMovies}
                onSelectItem={(m) => setInspectedMovie(m)}
                onFocusItem={(m) => setSelectedMovie(m)}
                isRanked={true}
                updatedDaily={true}
                dailyDateString={todayDateString}
                selectedItemId={currentFeatured.id}
              />

              {/* Row 6: Top 50 Movies on Apple TV+ */}
              <TvContentRow
                title="Top 50 Movies on Apple TV+"
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

              {/* Row 1: Top 50 TV Shows on Netflix */}
              <TvContentRow
                title="Top 50 TV Shows on Netflix"
                items={dailyNetflixShows}
                onSelectItem={(m) => setInspectedMovie(m)}
                onFocusItem={(m) => setSelectedShow(m)}
                isRanked={true}
                updatedDaily={true}
                dailyDateString={todayDateString}
                selectedItemId={currentFeaturedShow.id}
              />

              {/* Row 2: Top 50 TV Shows on Hulu */}
              <TvContentRow
                title="Top 50 TV Shows on Hulu"
                items={dailyHuluShows}
                onSelectItem={(m) => setInspectedMovie(m)}
                onFocusItem={(m) => setSelectedShow(m)}
                isRanked={true}
                updatedDaily={true}
                dailyDateString={todayDateString}
                selectedItemId={currentFeaturedShow.id}
              />

              {/* Row 3: Top 50 TV Shows on HBO Max */}
              <TvContentRow
                title="Top 50 TV Shows on HBO Max"
                items={dailyHboShows}
                onSelectItem={(m) => setInspectedMovie(m)}
                onFocusItem={(m) => setSelectedShow(m)}
                isRanked={true}
                updatedDaily={true}
                dailyDateString={todayDateString}
                selectedItemId={currentFeaturedShow.id}
              />

              {/* Row 4: Top 50 TV Shows on Disney+ */}
              <TvContentRow
                title="Top 50 TV Shows on Disney+"
                items={dailyDisneyShows}
                onSelectItem={(m) => setInspectedMovie(m)}
                onFocusItem={(m) => setSelectedShow(m)}
                isRanked={true}
                updatedDaily={true}
                dailyDateString={todayDateString}
                selectedItemId={currentFeaturedShow.id}
              />

              {/* Row 5: Top 50 TV Shows on Amazon Prime */}
              <TvContentRow
                title="Top 50 TV Shows on Amazon Prime"
                items={dailyAmazonShows}
                onSelectItem={(m) => setInspectedMovie(m)}
                onFocusItem={(m) => setSelectedShow(m)}
                isRanked={true}
                updatedDaily={true}
                dailyDateString={todayDateString}
                selectedItemId={currentFeaturedShow.id}
              />

              {/* Row 6: Top 50 TV Shows on Apple TV+ */}
              <TvContentRow
                title="Top 50 TV Shows on Apple TV+"
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
            localMediaFiles={LOCAL_MEDIA_FILES}
            peerLibraries={SHARED_PEER_LIBRARIES}
            onPlayMovie={handlePlayMovie}
            onInspectMovie={(movie) => setInspectedMovie(movie)}
            onStreamSelectorMovie={(movie) => setStreamSelectorMovie(movie)}
            onOpenWatchParty={(movie) => setWatchPartyMovie(movie)}
            selectedPeerId={selectedPeerId}
            onSelectPeer={(peerId) => {
              setSelectedPeerId(peerId);
              setSelectedLibraryFolder(null);
              if (peerId) {
                setActiveTab('shared-libraries');
              } else {
                setActiveTab('local-media');
              }
            }}
            selectedFolder={selectedLibraryFolder}
            onClearFolder={() => setSelectedLibraryFolder(null)}
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

        {/* TAB 6: WATCH PARTY */}
        {activeTab === 'watch-party' && (
          <div className="px-8 lg:px-14 pt-6 flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display font-extrabold text-3xl lg:text-4xl text-white tracking-wide">
                  Live Watch Party Hub
                </h1>
                <p className="text-sm text-zinc-400 mt-1">
                  Watch synced 4K movies with friends across TVs with zero audio drift.
                </p>
              </div>

              <button
                onClick={() => setWatchPartyMovie(currentFeatured)}
                className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 text-black font-extrabold text-sm shadow-xl transition-all hover:scale-105"
              >
                <Users className="w-5 h-5" />
                <span>Host Watch Party Now</span>
              </button>
            </div>

            <TvContentRow
              title="Party Suggestions: Crowd Pleasers"
              items={moviesList.slice(0, 8)}
              onSelectItem={(m) => setWatchPartyMovie(m)}
            />
          </div>
        )}

        {/* TAB 7: SEARCH */}
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
        onOpenStreamingHUD={() => setIsStreamingHUDOpen(true)}
        onToggleRemote={() => setIsRemoteOpen((prev) => !prev)}
        isRemoteOpen={isRemoteOpen}
        onOpenPlugins={() => setIsPluginModalOpen(true)}
        pluginsActivated={pluginsActivated}
        onPluginsActivatedChange={(activated) => {
          setPluginsActivated(activated);
          try {
            localStorage.setItem('nascent-plugins-activated', activated ? '1' : '0');
          } catch {
            /* ignore */
          }
        }}
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
