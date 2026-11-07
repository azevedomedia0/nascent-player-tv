export interface EpisodeItem {
  id: string;
  season: number;
  episodeNumber: number;
  title: string;
  duration: string;
  synopsis: string;
  thumbnailUrl: string;
  airDate?: string;
  rating?: string;
}

export const isTvSeries = (movie?: {
  id?: string;
  title?: string;
  certification?: string;
  statusBadge?: string;
  genres?: string[];
} | null): boolean => {
  if (!movie) return false;

  const badge = movie.statusBadge?.toLowerCase() || '';
  if (badge === 'movie') return false;
  if (badge.includes('tv series') || badge.includes('series') || badge.includes('show')) return true;

  const genres = (movie.genres || []).map((g) => g.toLowerCase());
  if (genres.some((g) => g === 'movie' || g === 'film')) return false;
  if (genres.some((g) => g.includes('tv series') || g === 'tv show' || g === 'series')) return true;

  const id = movie.id?.toLowerCase() || '';
  const title = movie.title?.toLowerCase() || '';
  const cert = movie.certification?.toLowerCase() || '';

  if (cert.startsWith('tv')) return true;
  if (title.includes('season') || title.includes('series') || title.includes('|')) return true;

  const showKeywords = [
    'shogun', 'shōgun', 'severance', 'the-bear', 'loki', 'last-of-us', 'last of us',
    'stranger-things', 'stranger things', 'squid-game', 'squid game', 'mandalorian',
    'andor', 'ted-lasso', 'ted lasso', 'succession', 'house-of-the-dragon', 'fallout',
    'the-boys', 'yellowstone', 'true-detective', 'fargo', 'white-lotus', 'wednesday',
    'arcane', 'invincible', 'silo', 'slow-horses', 'daredevil', 'x-men-97', 'reacher',
    'heartstopper', 'cobra-kai', 'percy-jackson', 'ahsoka', 'rings-of-power'
  ];

  return showKeywords.some((k) => id.includes(k) || title.includes(k));
};

export const EPISODE_DATABASE: Record<string, Record<number, EpisodeItem[]>> = {
  // 1. SHŌGUN
  "shogun": {
    1: [
      {
        id: "shogun-s1e1",
        season: 1,
        episodeNumber: 1,
        title: "Chapter One: Anjin",
        duration: "60m",
        airDate: "Feb 27, 2024",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/7O4iVfOMQmdCSxhOg1WNzG1AgYT.jpg",
        synopsis: "Destinies converge in Japan when an English ship is marooned in Lord Yoshii Toranaga's province, upending the delicate balance between regents."
      },
      {
        id: "shogun-s1e2",
        season: 1,
        episodeNumber: 2,
        title: "Chapter Two: Servants of Two Masters",
        duration: "58m",
        airDate: "Feb 27, 2024",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/59SVNwL1a7G1IRoDuqdW4x80oMm.jpg",
        synopsis: "Blackthorne's arrival in Osaka stirs political rivalries, and Toranaga must protect the foreigner from Catholic assassination attempts."
      },
      {
        id: "shogun-s1e3",
        season: 1,
        episodeNumber: 3,
        title: "Chapter Three: Tomorrow is Tomorrow",
        duration: "56m",
        airDate: "Mar 5, 2024",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/9ZyAUZScnh9i1N9jP1r7z3z9G8z.jpg",
        synopsis: "After Blackthorne discovers Toranaga's dangerous retreat plan, he navigates Osaka Bay under heavy naval cannon fire."
      },
      {
        id: "shogun-s1e4",
        season: 1,
        episodeNumber: 4,
        title: "Chapter Four: The Eightfold Fence",
        duration: "59m",
        airDate: "Mar 12, 2024",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/laCJxobHoPVaLQTKxc14Y2zV64C.jpg",
        synopsis: "Blackthorne and Mariko test their new alliance as they train Toranaga's gun regiment for impending war against Ishido's army."
      },
      {
        id: "shogun-s1e5",
        season: 1,
        episodeNumber: 5,
        title: "Chapter Five: Broken to the Fist",
        duration: "57m",
        airDate: "Mar 19, 2024",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/eU1iPfJxT1vVI7cvg2TTeTM8Y9P.jpg",
        synopsis: "Blackthorne and Mariko struggle to conceal their secret as an earthquake strikes and an assassin infiltrates the coastal camp."
      },
      {
        id: "shogun-s1e6",
        season: 1,
        episodeNumber: 6,
        title: "Chapter Six: Ladies of the Willow World",
        duration: "55m",
        airDate: "Mar 26, 2024",
        thumbnailUrl: "/assets/loki-hero.jpg",
        synopsis: "Lady Ochiba arrives in Osaka, while Toranaga must make concessions with council regents to buy precious survival time."
      },
      {
        id: "shogun-s1e7",
        season: 1,
        episodeNumber: 7,
        title: "Chapter Seven: A Stick of Time",
        duration: "54m",
        airDate: "Apr 2, 2024",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/tnx7iRvg13f9N40qj6kP8rN9G.jpg",
        synopsis: "Toranaga is forced to reconsider his entire battle strategy when his estranged half-brother makes an impossible ultimatum."
      },
      {
        id: "shogun-s1e8",
        season: 1,
        episodeNumber: 8,
        title: "Chapter Eight: The Abyss of Life",
        duration: "56m",
        airDate: "Apr 9, 2024",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg",
        synopsis: "Toranaga's army relocates to Edo in bitter sorrow, as surrender seems the only path forward for his grieving retainers."
      },
      {
        id: "shogun-s1e9",
        season: 1,
        episodeNumber: 9,
        title: "Chapter Nine: Crimson Sky",
        duration: "61m",
        airDate: "Apr 16, 2024",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
        synopsis: "Mariko enters Osaka Castle under direct hostage orders, putting her life on the line to break Ishido's political blockade."
      },
      {
        id: "shogun-s1e10",
        season: 1,
        episodeNumber: 10,
        title: "Chapter Ten: A Dream of a Dream",
        duration: "63m",
        airDate: "Apr 23, 2024",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/7O4iVfOMQmdCSxhOg1WNzG1AgYT.jpg",
        synopsis: "In the aftermath of heartbreaking sacrifice, Toranaga executes his master stroke to claim the unified title of Shōgun."
      }
    ]
  },

  // 2. SEVERANCE
  "severance": {
    1: [
      {
        id: "sev-s1e1",
        season: 1,
        episodeNumber: 1,
        title: "Good News About Hell",
        duration: "57m",
        airDate: "Feb 18, 2022",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/9ZyAUZScnh9i1N9jP1r7z3z9G8z.jpg",
        synopsis: "Mark Scout leads a team at Lumon Industries whose employees have had their memories surgically divided between work and home lives."
      },
      {
        id: "sev-s1e2",
        season: 1,
        episodeNumber: 2,
        title: "Half Loop",
        duration: "53m",
        airDate: "Feb 18, 2022",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/eU1iPfJxT1vVI7cvg2TTeTM8Y9P.jpg",
        synopsis: "The Macrodata Refinement crew trains defiant new hire Helly on numbers sorting, while Mark meets Petey on the outside."
      },
      {
        id: "sev-s1e3",
        season: 1,
        episodeNumber: 3,
        title: "In Perpetuity",
        duration: "54m",
        airDate: "Feb 25, 2022",
        thumbnailUrl: "/assets/loki-hero.jpg",
        synopsis: "Mark takes the team on an illicit field trip to the Perpetuity Wing, uncovering hidden folklore behind company founder Kier Eagan."
      },
      {
        id: "sev-s1e4",
        season: 1,
        episodeNumber: 4,
        title: "The You You Are",
        duration: "53m",
        airDate: "Mar 4, 2022",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/laCJxobHoPVaLQTKxc14Y2zV64C.jpg",
        synopsis: "Helly attempts an audacious escape message to her Outie, while Mark discovers a contraband revolutionary book left in the facility."
      },
      {
        id: "sev-s1e5",
        season: 1,
        episodeNumber: 5,
        title: "The Grim Barbarity of Optics and Design",
        duration: "54m",
        airDate: "Mar 11, 2022",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/tnx7iRvg13f9N40qj6kP8rN9G.jpg",
        synopsis: "Irving bonds with Burt over art in Optics & Design, while Dylan suspects rumors of department-wide sabotage."
      },
      {
        id: "sev-s1e6",
        season: 1,
        episodeNumber: 6,
        title: "Hide and Seek",
        duration: "54m",
        airDate: "Mar 18, 2022",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/59SVNwL1a7G1IRoDuqdW4x80oMm.jpg",
        synopsis: "Cobel tightens the screws on Mark as the Macrodata team orchestrates a covert cross-departmental pact."
      },
      {
        id: "sev-s1e7",
        season: 1,
        episodeNumber: 7,
        title: "Defiant Jazz",
        duration: "53m",
        airDate: "Mar 25, 2022",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg",
        synopsis: "Milchick hosts a 5-minute Dance Experience reward, triggering Dylan into a violent confrontation after learning about his son."
      },
      {
        id: "sev-s1e8",
        season: 1,
        episodeNumber: 8,
        title: "What's for Dinner?",
        duration: "51m",
        airDate: "Apr 1, 2022",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
        synopsis: "The MDR team prepares for activation of the Overtime Contingency as company leadership closes in on their plot."
      },
      {
        id: "sev-s1e9",
        season: 1,
        episodeNumber: 9,
        title: "The We We Are",
        duration: "58m",
        airDate: "Apr 8, 2022",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/7O4iVfOMQmdCSxhOg1WNzG1AgYT.jpg",
        synopsis: "The Innies awaken simultaneously in the outside world, learning world-shattering truths about their true identities."
      }
    ],
    2: [
      {
        id: "sev-s2e1",
        season: 2,
        episodeNumber: 1,
        title: "Line of Succession",
        duration: "58m",
        airDate: "Jan 17, 2025",
        thumbnailUrl: "/assets/loki-hero.jpg",
        synopsis: "Following the Lumon gala breach, Mark and Helly face the severe corporate ramifications of their outside revelation."
      },
      {
        id: "sev-s2e2",
        season: 2,
        episodeNumber: 2,
        title: "The Cold Floor",
        duration: "55m",
        airDate: "Jan 24, 2025",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/9ZyAUZScnh9i1N9jP1r7z3z9G8z.jpg",
        synopsis: "Cobel returns to the severed floor with new corporate mandates, while Mark questions his memories of Gemma."
      },
      {
        id: "sev-s2e3",
        season: 2,
        episodeNumber: 3,
        title: "Protocol Zero",
        duration: "56m",
        airDate: "Jan 31, 2025",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/eU1iPfJxT1vVI7cvg2TTeTM8Y9P.jpg",
        synopsis: "A new division arrives on the severed floor as Macrodata attempts to decipher the origin of cold files."
      }
    ]
  },

  // 3. LOKI
  "loki": {
    1: [
      {
        id: "loki-s1e1",
        season: 1,
        episodeNumber: 1,
        title: "Glorious Purpose",
        duration: "52m",
        airDate: "Jun 9, 2021",
        thumbnailUrl: "/assets/loki-hero.jpg",
        synopsis: "After escaping with the Tesseract in 2012, Loki is arrested by the Time Variance Authority, an agency outside time."
      },
      {
        id: "loki-s1e2",
        season: 1,
        episodeNumber: 2,
        title: "The Variant",
        duration: "54m",
        airDate: "Jun 16, 2021",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/laCJxobHoPVaLQTKxc14Y2zV64C.jpg",
        synopsis: "Agent Mobius recruits Loki to track down a dangerous fugitive variant who has been ambushing TVA minutemen across history."
      },
      {
        id: "loki-s1e3",
        season: 1,
        episodeNumber: 3,
        title: "Lamentis",
        duration: "43m",
        airDate: "Jun 23, 2021",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/59SVNwL1a7G1IRoDuqdW4x80oMm.jpg",
        synopsis: "Loki and Sylvie end up stranded on Lamentis-1 in the year 2077 on the eve of a moon crashing into the planet."
      },
      {
        id: "loki-s1e4",
        season: 1,
        episodeNumber: 4,
        title: "The Nexus Event",
        duration: "48m",
        airDate: "Jun 30, 2021",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/9ZyAUZScnh9i1N9jP1r7z3z9G8z.jpg",
        synopsis: "Faced with total erasure, Loki and Sylvie generate a massive branching timeline anomaly, leading to a trial before the Time-Keepers."
      },
      {
        id: "loki-s1e5",
        season: 1,
        episodeNumber: 5,
        title: "Journey into Mystery",
        duration: "50m",
        airDate: "Jul 7, 2021",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/eU1iPfJxT1vVI7cvg2TTeTM8Y9P.jpg",
        synopsis: "Loki wakes up in the Void at the end of time, encountering bizarre variant versions of himself fleeing the temporal beast Alioth."
      },
      {
        id: "loki-s1e6",
        season: 1,
        episodeNumber: 6,
        title: "For All Time. Always.",
        duration: "54m",
        airDate: "Jul 14, 2021",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/7O4iVfOMQmdCSxhOg1WNzG1AgYT.jpg",
        synopsis: "Loki and Sylvie step inside the Citadel at the End of Time to face He Who Remains, keeper of the Sacred Timeline."
      }
    ],
    2: [
      {
        id: "loki-s2e1",
        season: 2,
        episodeNumber: 1,
        title: "Ouroboros",
        duration: "47m",
        airDate: "Oct 5, 2023",
        thumbnailUrl: "/assets/loki-hero.jpg",
        synopsis: "Loki experiences violent involuntary time-slipping between past, present, and future, seeking help from TVA engineer O.B."
      },
      {
        id: "loki-s2e2",
        season: 2,
        episodeNumber: 2,
        title: "Breaking Brad",
        duration: "49m",
        airDate: "Oct 12, 2023",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/laCJxobHoPVaLQTKxc14Y2zV64C.jpg",
        synopsis: "Loki and Mobius hunt down rogue Hunter X-5 in 1977 London where he is masquerading as a movie movie star."
      },
      {
        id: "loki-s2e3",
        season: 2,
        episodeNumber: 3,
        title: "1893",
        duration: "53m",
        airDate: "Oct 19, 2023",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/tnx7iRvg13f9N40qj6kP8rN9G.jpg",
        synopsis: "Loki, Mobius, and Renslayer track Victor Timely to the 1893 World's Fair in Chicago to restore the Loom's throughput."
      },
      {
        id: "loki-s2e4",
        season: 2,
        episodeNumber: 4,
        title: "Heart of the TVA",
        duration: "49m",
        airDate: "Oct 26, 2023",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/9ZyAUZScnh9i1N9jP1r7z3z9G8z.jpg",
        synopsis: "The Temporal Loom approaches catastrophic radiation overload as Miss Minutes and Renslayer launch a hostile assault."
      },
      {
        id: "loki-s2e5",
        season: 2,
        episodeNumber: 5,
        title: "Science/Fiction",
        duration: "45m",
        airDate: "Nov 2, 2023",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/59SVNwL1a7G1IRoDuqdW4x80oMm.jpg",
        synopsis: "Loki slips across shattered timelines to find his TVA comrades living regular lives as doctors, convicts, and scientists on Earth."
      },
      {
        id: "loki-s2e6",
        season: 2,
        episodeNumber: 6,
        title: "Glorious Purpose",
        duration: "56m",
        airDate: "Nov 9, 2023",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/7O4iVfOMQmdCSxhOg1WNzG1AgYT.jpg",
        synopsis: "Loki masters his time powers and steps onto the broken Loom, weaving all branching multiverse timelines onto his golden throne."
      }
    ]
  },

  // 4. THE BEAR
  "the-bear": {
    1: [
      {
        id: "bear-s1e1",
        season: 1,
        episodeNumber: 1,
        title: "System",
        duration: "30m",
        airDate: "Jun 23, 2022",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/eU1iPfJxT1vVI7cvg2TTeTM8Y9P.jpg",
        synopsis: "Fine dining chef Carmy Berzatto returns home to Chicago to run his family's beef sandwich shop after his brother's suicide."
      },
      {
        id: "bear-s1e2",
        season: 1,
        episodeNumber: 2,
        title: "Hands",
        duration: "31m",
        airDate: "Jun 23, 2022",
        thumbnailUrl: "/assets/loki-hero.jpg",
        synopsis: "A surprise health inspection reveals disastrous structural issues in the kitchen, and Sydney proposes standard operating procedures."
      },
      {
        id: "bear-s1e3",
        season: 1,
        episodeNumber: 3,
        title: "Brigade",
        duration: "32m",
        airDate: "Jun 23, 2022",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/laCJxobHoPVaLQTKxc14Y2zV64C.jpg",
        synopsis: "Carmy introduces the French brigade kitchen system to bring order to the chaos, but tempers rapidly boil over."
      },
      {
        id: "bear-s1e4",
        season: 1,
        episodeNumber: 4,
        title: "Dogs",
        duration: "34m",
        airDate: "Jun 23, 2022",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/59SVNwL1a7G1IRoDuqdW4x80oMm.jpg",
        synopsis: "Carmy and Richie cater a neighborhood children's party, while Marcus experiments with donut recipes in the pastry corner."
      },
      {
        id: "bear-s1e7",
        season: 1,
        episodeNumber: 7,
        title: "Review",
        duration: "20m",
        airDate: "Jun 23, 2022",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/9ZyAUZScnh9i1N9jP1r7z3z9G8z.jpg",
        synopsis: "A glowing review brings an impossible avalanche of automated takeout orders, triggering a legendary one-shot kitchen breakdown."
      },
      {
        id: "bear-s1e8",
        season: 1,
        episodeNumber: 8,
        title: "Braciole",
        duration: "48m",
        airDate: "Jun 23, 2022",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/7O4iVfOMQmdCSxhOg1WNzG1AgYT.jpg",
        synopsis: "Things reach a boiling point, until a letter from Mikey leads the staff to find hundred-dollar bills sealed inside crushed tomato cans."
      }
    ],
    2: [
      {
        id: "bear-s2e1",
        season: 2,
        episodeNumber: 1,
        title: "Beef",
        duration: "35m",
        airDate: "Jun 22, 2023",
        thumbnailUrl: "/assets/loki-hero.jpg",
        synopsis: "Carmy, Sydney, and Natalie begin the intense demolition work to open a high-end restaurant within three short months."
      },
      {
        id: "bear-s2e6",
        season: 2,
        episodeNumber: 6,
        title: "Fishes",
        duration: "66m",
        airDate: "Jun 22, 2023",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/9ZyAUZScnh9i1N9jP1r7z3z9G8z.jpg",
        synopsis: "An emotional flashback to a chaotic Berzatto family Christmas dinner hosted by their manic mother Donna."
      },
      {
        id: "bear-s2e7",
        season: 2,
        episodeNumber: 7,
        title: "Forks",
        duration: "38m",
        airDate: "Jun 22, 2023",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/7O4iVfOMQmdCSxhOg1WNzG1AgYT.jpg",
        synopsis: "Richie stages at Chicago's finest fine-dining restaurant, discovering the dignity and joy of passionate hospitality."
      }
    ]
  },

  // 5. THE LAST OF US
  "the-last-of-us": {
    1: [
      {
        id: "tlou-s1e1",
        season: 1,
        episodeNumber: 1,
        title: "When You're Lost in the Darkness",
        duration: "81m",
        airDate: "Jan 15, 2023",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/eU1iPfJxT1vVI7cvg2TTeTM8Y9P.jpg",
        synopsis: "Twenty years after a fungal outbreak ravages society, hardened smuggler Joel is hired to escort 14-year-old Ellie across quarantine walls."
      },
      {
        id: "tlou-s1e2",
        season: 1,
        episodeNumber: 2,
        title: "Infected",
        duration: "53m",
        airDate: "Jan 22, 2023",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/59SVNwL1a7G1IRoDuqdW4x80oMm.jpg",
        synopsis: "Joel, Tess, and Ellie navigate through flooded Boston streets and face deadly Clickers inside a decaying museum."
      },
      {
        id: "tlou-s1e3",
        season: 1,
        episodeNumber: 3,
        title: "Long, Long Time",
        duration: "75m",
        airDate: "Jan 29, 2023",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/laCJxobHoPVaLQTKxc14Y2zV64C.jpg",
        synopsis: "Survivalist Bill turns his suburban town into an impenetrable sanctuary, until an unexpected stranger named Frank changes his life."
      },
      {
        id: "tlou-s1e4",
        season: 1,
        episodeNumber: 4,
        title: "Please Hold to My Hand",
        duration: "45m",
        airDate: "Feb 5, 2023",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/tnx7iRvg13f9N40qj6kP8rN9G.jpg",
        synopsis: "Driving through Kansas City, Joel and Ellie are ambushed by a ruthless rebel militia hunting for informants."
      },
      {
        id: "tlou-s1e5",
        season: 1,
        episodeNumber: 5,
        title: "Endure and Survive",
        duration: "59m",
        airDate: "Feb 10, 2023",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/9ZyAUZScnh9i1N9jP1r7z3z9G8z.jpg",
        synopsis: "Joel and Ellie team up with Henry and Sam to navigate maintenance tunnels, erupting in a nightmarish Bloater siege."
      },
      {
        id: "tlou-s1e9",
        season: 1,
        episodeNumber: 9,
        title: "Look for the Light",
        duration: "44m",
        airDate: "Mar 12, 2023",
        thumbnailUrl: "https://image.tmdb.org/t/p/w780/7O4iVfOMQmdCSxhOg1WNzG1AgYT.jpg",
        synopsis: "Upon reaching the Firefly medical hospital in Salt Lake City, Joel faces a devastating choice when he learns what curing humanity requires."
      }
    ]
  }
};

/**
 * Returns available season numbers for a given movie/show.
 */
export const getAvailableSeasons = (movieId?: string, title?: string): number[] => {
  if (!movieId && !title) return [1];

  const mid = movieId?.toLowerCase() || '';
  const mTitle = title?.toLowerCase() || '';

  // Match direct keys in EPISODE_DATABASE
  for (const key of Object.keys(EPISODE_DATABASE)) {
    if (mid.includes(key) || mTitle.includes(key)) {
      return Object.keys(EPISODE_DATABASE[key]).map(Number).sort((a, b) => a - b);
    }
  }

  // Multi-season detection for prominent titles
  if (mid.includes('stranger') || mTitle.includes('stranger')) return [1, 2, 3, 4];
  if (mid.includes('mandalorian') || mTitle.includes('mandalorian')) return [1, 2, 3];
  if (mid.includes('ted-lasso') || mTitle.includes('ted lasso')) return [1, 2, 3];
  if (mid.includes('succession') || mTitle.includes('succession')) return [1, 2, 3, 4];
  if (mid.includes('house-of-the-dragon') || mTitle.includes('dragon')) return [1, 2];
  if (mid.includes('the-boys') || mTitle.includes('the boys')) return [1, 2, 3, 4];

  // Default to Season 1
  return [1, 2];
};

/**
 * Returns rich episodes for a given show and season.
 */
export const getEpisodesForSeason = (
  movieId?: string,
  title?: string,
  season: number = 1,
  fallbackImage?: string
): EpisodeItem[] => {
  const mid = movieId?.toLowerCase() || '';
  const mTitle = title?.toLowerCase() || '';

  // Check custom database
  for (const key of Object.keys(EPISODE_DATABASE)) {
    if (mid.includes(key) || mTitle.includes(key)) {
      const showSeasons = EPISODE_DATABASE[key];
      if (showSeasons[season]) {
        return showSeasons[season];
      }
      if (showSeasons[1]) {
        return showSeasons[1];
      }
    }
  }

  // Realistic dynamic generator for any other show in the catalogue
  const cleanTitle = (title || 'Series').replace(/\|.*$/, '').trim();
  const defaultEpisodesCount = 8;
  const genericEpisodeTitles = [
    "Pilot: The Beginning of the Descent",
    "Point of No Return",
    "The Eightfold Shadow",
    "Beneath the Surface",
    "Collision Course",
    "Whispers in the Dark",
    "The Breaking Point",
    "Season Finale: Reckoning"
  ];

  const defaultEpisodes: EpisodeItem[] = [];
  for (let i = 1; i <= defaultEpisodesCount; i++) {
    const epTitle = genericEpisodeTitles[i - 1] || `Chapter ${i}: The Revelation`;
    const durations = ["48m", "52m", "56m", "50m", "54m", "58m", "61m", "64m"];
    defaultEpisodes.push({
      id: `${mid || 'show'}-s${season}e${i}`,
      season,
      episodeNumber: i,
      title: epTitle,
      duration: durations[(i - 1) % durations.length],
      airDate: `Episode ${i}`,
      thumbnailUrl: fallbackImage || "https://image.tmdb.org/t/p/w780/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg",
      synopsis: `In episode ${i} of ${cleanTitle}, key tensions escalate as hidden truths emerge and the protagonists are forced to make high-stakes choices.`
    });
  }

  return defaultEpisodes;
};
