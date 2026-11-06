/**
 * IMDb Metadata & Search Client Service
 * Provides direct access to IMDb search, ratings, plot synopses, cast, and certifications.
 */

export interface CastMember {
  name: string;
  role?: string;
  character?: string;
  photoUrl?: string;
}

export const ACTOR_HEADSHOTS: Record<string, string> = {
  "Timothée Chalamet": "https://image.tmdb.org/t/p/w185/BE2sdjpgsa2rNTFa66f7upkaOP.jpg",
  "Zendaya": "https://image.tmdb.org/t/p/w185/so3GekKIFB2MbvdMRuy40krq7kg.jpg",
  "Pedro Pascal": "https://image.tmdb.org/t/p/w185/9VYK7oxcqhjd5LHsdit6FFJR6Tq.jpg",
  "Bella Ramsey": "https://image.tmdb.org/t/p/w185/bL32K6iW6f7p4p84KjQc899N8e8.jpg",
  "Joaquin Phoenix": "https://image.tmdb.org/t/p/w185/nXMzvVFPLx2XY26s37BM0GKaC9L.jpg",
  "Nicole Kidman": "https://image.tmdb.org/t/p/w185/wMArW7f7Q9x6JqBqT1KzT5f9L1r.jpg",
  "Harris Dickinson": "https://image.tmdb.org/t/p/w185/bV7Wn0Hq7d4Fj6pL1r9M8e8K5jP.jpg",
  "Antonio Banderas": "https://image.tmdb.org/t/p/w185/uqqUBqp5A7L3L6eGf8h1o5mF7r9.jpg",
  "Mia Goth": "https://image.tmdb.org/t/p/w185/7Vf8x1L1r9M8e8K5jP1r7z3z9G8.jpg",
  "Elizabeth Debicki": "https://image.tmdb.org/t/p/w185/9N1r7z3z9G8z8k9B5jP1r7z3z9G.jpg",
  "Ryan Reynolds": "https://image.tmdb.org/t/p/w185/4SYrm5OCx2qL3F4zG6vL8g7sW5m.jpg",
  "Hugh Jackman": "https://image.tmdb.org/t/p/w185/4Xujtewxqt6aU3Y81ga7Uv09h4L.jpg",
  "Emma Corrin": "https://image.tmdb.org/t/p/w185/a1N9jP1r7z3z9G8z8k9B5jP1r7z.jpg",
  "Hiroyuki Sanada": "https://image.tmdb.org/t/p/w185/4N1r7z3z9G8z8k9B5jP1r7z3z9G.jpg",
  "Cosmo Jarvis": "https://image.tmdb.org/t/p/w185/5N1r7z3z9G8z8k9B5jP1r7z3z9G.jpg",
  "Anna Sawai": "https://image.tmdb.org/t/p/w185/6N1r7z3z9G8z8k9B5jP1r7z3z9G.jpg",
  "Jeremy Allen White": "https://image.tmdb.org/t/p/w185/o1N9jP1r7z3z9G8z8k9B5jP1r7z.jpg",
  "Ayo Edebiri": "https://image.tmdb.org/t/p/w185/p1N9jP1r7z3z9G8z8k9B5jP1r7z.jpg",
  "Ebon Moss-Bachrach": "https://image.tmdb.org/t/p/w185/q1N9jP1r7z3z9G8z8k9B5jP1r7z.jpg",
  "Kirsten Dunst": "https://image.tmdb.org/t/p/w185/bL32K6iW6f7p4p84KjQc899N8e8.jpg",
  "Wagner Moura": "https://image.tmdb.org/t/p/w185/e1N9jP1r7z3z9G8z8k9B5jP1r7z.jpg",
  "Cailee Spaeny": "https://image.tmdb.org/t/p/w185/f1N9jP1r7z3z9G8z8k9B5jP1r7z.jpg",
  "Cillian Murphy": "https://image.tmdb.org/t/p/w185/3Dq5m1iE7d1p9v8s0g7r4h5j6k7.jpg",
  "Florence Pugh": "https://image.tmdb.org/t/p/w185/4N1r7z3z9G8z8k9B5jP1r7z3z9G.jpg",
  "Austin Butler": "https://image.tmdb.org/t/p/w185/5N1r7z3z9G8z8k9B5jP1r7z3z9G.jpg",
  "Emma Stone": "https://image.tmdb.org/t/p/w185/cZ0d3rtvXMTv1A3p5p1r9G8z8k.jpg",
  "Willem Dafoe": "https://image.tmdb.org/t/p/w185/ui8eFpn22ahHS7m64N9jP1r7z3z.jpg",
  "Finn Wolfhard": "https://image.tmdb.org/t/p/w185/4N1r7z3z9G8z8k9B5jP1r7z3z9G.jpg",
  "Millie Bobby Brown": "https://image.tmdb.org/t/p/w185/wMArW7f7Q9x6JqBqT1KzT5f9L1r.jpg",
  "Winona Ryder": "https://image.tmdb.org/t/p/w185/bV7Wn0Hq7d4Fj6pL1r9M8e8K5jP.jpg",
  "Lee Jung-jae": "https://image.tmdb.org/t/p/w185/7Vf8x1L1r9M8e8K5jP1r7z3z9G8.jpg",
  "Paul Mescal": "https://image.tmdb.org/t/p/w185/9N1r7z3z9G8z8k9B5jP1r7z3z9G.jpg",
  "Denzel Washington": "https://image.tmdb.org/t/p/w185/4SYrm5OCx2qL3F4zG6vL8g7sW5m.jpg",
  "Jason Sudeikis": "https://image.tmdb.org/t/p/w185/4Xujtewxqt6aU3Y81ga7Uv09h4L.jpg",
  "Brett Goldstein": "https://image.tmdb.org/t/p/w185/a1N9jP1r7z3z9G8z8k9B5jP1r7z.jpg",
  "Hannah Waddingham": "https://image.tmdb.org/t/p/w185/4N1r7z3z9G8z8k9B5jP1r7z3z9G.jpg",
  "Dakota Johnson": "https://image.tmdb.org/t/p/w185/5N1r7z3z9G8z8k9B5jP1r7z3z9G.jpg",
  "Chris Evans": "https://image.tmdb.org/t/p/w185/6N1r7z3z9G8z8k9B5jP1r7z3z9G.jpg",
  "Adam Sandler": "https://image.tmdb.org/t/p/w185/o1N9jP1r7z3z9G8z8k9B5jP1r7z.jpg",
  "Julia Fox": "https://image.tmdb.org/t/p/w185/p1N9jP1r7z3z9G8z8k9B5jP1r7z.jpg",
  "Dev Patel": "https://image.tmdb.org/t/p/w185/q1N9jP1r7z3z9G8z8k9B5jP1r7z.jpg",
  "Alicia Vikander": "https://image.tmdb.org/t/p/w185/bL32K6iW6f7p4p84KjQc899N8e8.jpg",
  "Hugh Grant": "https://image.tmdb.org/t/p/w185/e1N9jP1r7z3z9G8z8k9B5jP1r7z.jpg",
  "Sophie Thatcher": "https://image.tmdb.org/t/p/w185/f1N9jP1r7z3z9G8z8k9B5jP1r7z.jpg",
  "Sebastian Stan": "https://image.tmdb.org/t/p/w185/3Dq5m1iE7d1p9v8s0g7r4h5j6k7.jpg",
  "Renate Reinsve": "https://image.tmdb.org/t/p/w185/4N1r7z3z9G8z8k9B5jP1r7z3z9G.jpg",
  "Kristen Stewart": "https://image.tmdb.org/t/p/w185/5N1r7z3z9G8z8k9B5jP1r7z3z9G.jpg",
  "Katy O'Brian": "https://image.tmdb.org/t/p/w185/cZ0d3rtvXMTv1A3p5p1r9G8z8k.jpg",
  "Ed Harris": "https://image.tmdb.org/t/p/w185/ui8eFpn22ahHS7m64N9jP1r7z3z.jpg",
  "Mahershala Ali": "https://image.tmdb.org/t/p/w185/4N1r7z3z9G8z8k9B5jP1r7z3z9G.jpg",
  "Greta Lee": "https://image.tmdb.org/t/p/w185/5N1r7z3z9G8z8k9B5jP1r7z3z9G.jpg",
  "Teo Yoo": "https://image.tmdb.org/t/p/w185/6N1r7z3z9G8z8k9B5jP1r7z3z9G.jpg",
  "John Magaro": "https://image.tmdb.org/t/p/w185/o1N9jP1r7z3z9G8z8k9B5jP1r7z.jpg",
  "David Corenswet": "https://image.tmdb.org/t/p/w185/p1N9jP1r7z3z9G8z8k9B5jP1r7z.jpg",
  "Julianne Moore": "https://image.tmdb.org/t/p/w185/q1N9jP1r7z3z9G8z8k9B5jP1r7z.jpg",
  "Justice Smith": "https://image.tmdb.org/t/p/w185/bL32K6iW6f7p4p84KjQc899N8e8.jpg",
  "Charles Melton": "https://image.tmdb.org/t/p/w185/e1N9jP1r7z3z9G8z8k9B5jP1r7z.jpg",
  "Joseph Quinn": "https://image.tmdb.org/t/p/w185/f1N9jP1r7z3z9G8z8k9B5jP1r7z.jpg",
  "Jenna Ortega": "https://image.tmdb.org/t/p/w185/3Dq5m1iE7d1p9v8s0g7r4h5j6k7.jpg",
  "Sandra Hüller": "https://image.tmdb.org/t/p/w185/4N1r7z3z9G8z8k9B5jP1r7z3z9G.jpg",
  "Christian Friedel": "https://image.tmdb.org/t/p/w185/5N1r7z3z9G8z8k9B5jP1r7z3z9G.jpg",
  "Bryan Cranston": "https://image.tmdb.org/t/p/w185/7Jahy5LZX2Fo8fGJltMreAI49WJ.jpg",
  "Aaron Paul": "https://image.tmdb.org/t/p/w185/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
  "Bob Odenkirk": "https://image.tmdb.org/t/p/w185/xImj8RLe39YK0lyVu9kXv7ApN8p.jpg",
  "Antony Starr": "https://image.tmdb.org/t/p/w185/ne1N9jP1r7z3z9G8z8k9B5jP1r7.jpg",
  "Karl Urban": "https://image.tmdb.org/t/p/w185/pB0w0uH9Y0o4rC9g8j9m1P0w0p.jpg",
  "Gary Oldman": "https://image.tmdb.org/t/p/w185/bV7Wn0Hq7d4Fj6pL1r9M8e8K5jP.jpg",
  "Rebecca Ferguson": "https://image.tmdb.org/t/p/w185/7Vf8x1L1r9M8e8K5jP1r7z3z9G8.jpg",
  "Tom Hanks": "https://image.tmdb.org/t/p/w185/9N1r7z3z9G8z8k9B5jP1r7z3z9G.jpg",
  "Matt Damon": "https://image.tmdb.org/t/p/w185/elSlNg0mKM9NX784vW0M5x82twj.jpg"
};

function isUsableActorPhoto(url?: string | null): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  // Known-broken / placeholder sources — force a live IMDb refetch
  if (lower.includes('images.metahub.space/cast/')) return false;
  if (lower.includes('ui-avatars.com')) return false;
  // Prefer live IMDb / Amazon media assets over stale static TMDB stubs
  if (lower.includes('media-amazon.com') || lower.includes('imdb.com')) return true;
  if (lower.includes('image.tmdb.org')) return false;
  return true;
}

export function getActorHeadshot(name: string): string | undefined {
  if (ACTOR_HEADSHOTS[name]) return ACTOR_HEADSHOTS[name];
  const match = Object.keys(ACTOR_HEADSHOTS).find(
    k => k.toLowerCase() === name.toLowerCase() || name.toLowerCase().includes(k.toLowerCase())
  );
  if (match) return ACTOR_HEADSHOTS[match];
  return undefined;
}

export function enrichCastArray(cast: any[]): CastMember[] {
  if (!Array.isArray(cast)) return [];
  return cast.map((c: any) => {
    if (typeof c === 'string') {
      return {
        name: c,
        role: "Starring",
        photoUrl: getActorHeadshot(c)
      };
    }
    const name = c.name || "Actor";
    const candidate = c.photoUrl || c.image || getActorHeadshot(name);
    return {
      name,
      role: c.role || c.character || "Starring",
      character: c.character || c.role || "Starring",
      photoUrl: isUsableActorPhoto(candidate) ? candidate : undefined
    };
  });
}

/**
 * Always resolve live IMDb headshots for cast members missing usable photos.
 */
export async function fetchImdbCastImages(cast: CastMember[]): Promise<CastMember[]> {
  if (!Array.isArray(cast) || cast.length === 0) return [];

  const needsFetch = cast.filter((c) => c?.name && !isUsableActorPhoto(c.photoUrl));
  if (needsFetch.length === 0) return cast;

  try {
    const res = await fetch('/api/imdb/cast-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ names: needsFetch.map((c) => c.name) }),
    });
    if (!res.ok) return cast;
    const data = await res.json();
    const images: Record<string, string> = data.images || {};

    return cast.map((member) => {
      if (isUsableActorPhoto(member.photoUrl)) return member;
      const live =
        images[member.name] ||
        Object.entries(images).find(
          ([key]) => key.toLowerCase() === member.name.toLowerCase()
        )?.[1];
      return live ? { ...member, photoUrl: live } : { ...member, photoUrl: undefined };
    });
  } catch (err) {
    console.warn('Failed fetching IMDb cast images:', err);
    return cast;
  }
}

export interface ImdbSearchResult {
  id: string; // e.g. tt15239678
  title: string;
  year?: number | string;
  posterUrl?: string;
  cast?: string;
  type?: string; // movie, tvSeries, etc.
  rank?: number;
}

export interface ImdbMetadata {
  imdbId: string;
  title: string;
  imdbRating?: string | number;
  rating?: number;
  votes?: string;
  certification?: string;
  releaseYear: string;
  duration?: number;
  runtime?: string;
  genres: string[];
  director?: string;
  cast: CastMember[];
  summary: string;
  posterUrl: string;
  bannerUrl?: string;
  awards?: string;
  imdbUrl: string;
}

/**
 * Search IMDb for movies or TV shows
 */
export async function searchImdb(query: string, type?: 'movie' | 'series'): Promise<ImdbSearchResult[]> {
  if (!query || !query.trim()) return [];
  try {
    const params = new URLSearchParams({ q: query.trim() });
    if (type) params.append('type', type);
    const res = await fetch(`/api/imdb/search?${params.toString()}`);
    if (!res.ok) throw new Error(`IMDb search returned status ${res.status}`);
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error('Failed to search IMDb:', err);
    return [];
  }
}

/**
 * Fetch complete IMDb metadata for a title or IMDb ID
 */
export async function fetchImdbMetadata(titleOrId: string, type?: 'movie' | 'series'): Promise<ImdbMetadata | null> {
  if (!titleOrId || !titleOrId.trim()) return null;
  try {
    const isTtId = titleOrId.trim().startsWith('tt');
    const endpoint = isTtId 
      ? `/api/imdb/title/${encodeURIComponent(titleOrId.trim())}${type ? `?type=${type}` : ''}`
      : `/api/imdb/metadata?title=${encodeURIComponent(titleOrId.trim())}${type ? `&type=${type}` : ''}`;

    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`IMDb lookup returned status ${res.status}`);
    const data = await res.json();
    const meta: ImdbMetadata = data.metadata || data;
    if (meta && Array.isArray(meta.cast)) {
      meta.cast = await fetchImdbCastImages(enrichCastArray(meta.cast));
    }
    return meta;
  } catch (err) {
    console.error('Failed to fetch IMDb metadata:', err);
    return null;
  }
}

/**
 * Enrich an existing movie object with live IMDb data
 */
export async function enrichWithImdb(title: string, currentId?: string, type?: 'movie' | 'series'): Promise<Partial<ImdbMetadata> | null> {
  try {
    const res = await fetch('/api/imdb/enrich', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, id: currentId, type })
    });
    if (!res.ok) return null;
    const data = await res.json();
    const meta = data.metadata || data;
    if (meta && Array.isArray(meta.cast)) {
      meta.cast = enrichCastArray(meta.cast);
    }
    return meta;
  } catch (err) {
    console.error('Enrichment failed:', err);
    return null;
  }
}
