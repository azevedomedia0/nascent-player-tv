import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Play, Plus, Check, Film, Star, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { FeaturedMovie } from '../../lib/types';

export interface ContinueWatchingMediaItem extends FeaturedMovie {
  progress: number;
  remainingTime?: string;
}

export const DEFAULT_CONTINUE_WATCHING: ContinueWatchingMediaItem[] = [
  {
    id: "spider-verse",
    title: "Spider-Man: Across the Spider-Verse",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj7sR48.jpg",
    bannerUrl: "https://image.tmdb.org/t/p/original/kVd3a9YeLGkoeR50jGEXM6EqseS.jpg",
    genres: ["Animation", "Action", "Adventure"],
    rating: 8.6,
    certification: "PG",
    progress: 70,
    remainingTime: "42m left"
  },
  {
    id: "john-wick-4",
    title: "John Wick: Chapter 4",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
    bannerUrl: "https://image.tmdb.org/t/p/original/7I6VUdPj6tQECNHdviJkUHD2u89.jpg",
    genres: ["Action", "Thriller", "Crime"],
    rating: 7.7,
    certification: "R",
    progress: 48,
    remainingTime: "1h 14m left"
  },
  {
    id: "oppenheimer",
    title: "Oppenheimer",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    bannerUrl: "https://image.tmdb.org/t/p/original/cUIqZd6jJCbO94Txt1CkTs7MSeP.jpg",
    genres: ["Biography", "Drama", "History"],
    rating: 8.9,
    certification: "R",
    progress: 85,
    remainingTime: "24m left"
  },
  {
    id: "dune-two",
    title: "Dune: Part Two",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    bannerUrl: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
    genres: ["Sci-Fi", "Adventure", "Action"],
    rating: 8.5,
    certification: "PG-13",
    progress: 32,
    remainingTime: "1h 48m left"
  }
];

export const DEFAULT_CONTINUE_WATCHING_SHOWS: ContinueWatchingMediaItem[] = [
  {
    id: "loki",
    title: "Loki | S2:E4 'Heart of the TVA'",
    releaseYear: "2023",
    posterUrl: "/assets/loki-poster.jpg",
    bannerUrl: "/assets/loki-hero.jpg",
    genres: ["Action", "TV Show", "Sci-Fi"],
    rating: 8.2,
    certification: "TV-14",
    progress: 62,
    remainingTime: "18m left"
  },
  {
    id: "severance",
    title: "Severance | S1:E7 'Defiant Jazz'",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/9msdHwWv3sC6J26Z5f7O3jVw9J2.jpg",
    bannerUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
    genres: ["Sci-Fi", "Mystery", "TV Show"],
    rating: 8.7,
    certification: "TV-MA",
    progress: 45,
    remainingTime: "26m left"
  },
  {
    id: "the-bear",
    title: "The Bear | S2:E6 'Fishes'",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/z71h8m3lS8yS7v8aFkQ2kG8Z3vX.jpg",
    bannerUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop",
    genres: ["Comedy", "Drama", "TV Show"],
    rating: 8.6,
    certification: "TV-MA",
    progress: 78,
    remainingTime: "12m left"
  },
  {
    id: "shogun",
    title: "Shōgun | S1:E8 'The Abyss of Life'",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/7O4iVfOMQmdCSxhOg1WnzG1AgYT.jpg",
    bannerUrl: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=800&auto=format&fit=crop",
    genres: ["Drama", "History", "TV Show"],
    rating: 8.7,
    certification: "TV-MA",
    progress: 30,
    remainingTime: "41m left"
  }
];

// Curated authentic IMDb / TMDb 16:9 widescreen letterbox backdrop images dictionary
export const IMDB_LETTERBOX_IMAGES: Record<string, string> = {
  "dune-two": "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
  "loki": "/assets/loki-hero.jpg",
  "spider-verse": "https://image.tmdb.org/t/p/original/kVd3a9YeLGkoeR50jGEXM6EqseS.jpg",
  "oppenheimer": "https://image.tmdb.org/t/p/original/cUIqZd6jJCbO94Txt1CkTs7MSeP.jpg",
  "the-batman": "https://image.tmdb.org/t/p/original/eUORREWq2ThkkxyiCESCu3sVdGg.jpg",
  "shogun": "https://image.tmdb.org/t/p/original/bwSmgmd90hCWwqOKQYTEraeOZhJ.jpg",
  "severance": "https://image.tmdb.org/t/p/original/ixgFmf1X59PUZam2qbAfskx2gQr.jpg",
  "the-last-of-us": "https://image.tmdb.org/t/p/original/lY2DhbA7Hy44fAKddr06UrXWWaQ.jpg",
  "interstellar": "https://image.tmdb.org/t/p/original/8sNiAPPYU14PUepFNeSNGUTiHW.jpg",
  "civil-war": "https://image.tmdb.org/t/p/original/t2SXZ7KLriaLyf5QT8Iar6fSOGp.jpg",
  "gladiator-two": "https://image.tmdb.org/t/p/original/tOqIwliWMovSIZ9DyvHcHI7p2im.jpg",
  "deadpool-wolverine": "https://image.tmdb.org/t/p/original/wNa8cZp4fjF5Fa1oE5HhF6Km7kK.jpg",
  "the-bear": "https://image.tmdb.org/t/p/original/eh7hIGLq7IhddgOPYyprCbz8JtH.jpg",
  "squid-game": "https://image.tmdb.org/t/p/original/2meX1nMdScFOoV4370rqHWKmXhY.jpg",
  "stranger-things": "https://image.tmdb.org/t/p/original/9P4IIMYY3HifqeruZq0ZZ9g7YUi.jpg",
  "babygirl": "https://image.tmdb.org/t/p/original/co7oxvpWxgd6FZU24DnljDDHYQA.jpg",
  "heretic": "https://image.tmdb.org/t/p/original/1fL2S8LKxCVE9KoPRBXeagmBtex.jpg",
  "past-lives": "https://image.tmdb.org/t/p/original/7HR38hMBl23lf38MAN63y4pKsHz.jpg",
  "pearl": "https://image.tmdb.org/t/p/original/5hoS3nEkGGXUfmnu39yw1k52JX5.jpg",
  "x": "https://image.tmdb.org/t/p/original/o375tDNib7tihlkWdtLW1fQhNL1.jpg",
  "maxxxine": "https://image.tmdb.org/t/p/original/viKEEaaCaZ0hZ2nGuvIEozlLooL.jpg",
  "the-zone-of-interest": "https://image.tmdb.org/t/p/original/pnTSOKcYnvdpQNQElAtJM1rWOxH.jpg",
  "john-wick-4": "https://image.tmdb.org/t/p/original/7I6VUdPj6tQECNHdviJkUHD2u89.jpg",
  "bbb-sample": "https://upload.wikimedia.org/wikipedia/commons/c/c5/Big_Buck_Bunny_堅毅的大兔子.jpg",
  "sintel-sample": "https://upload.wikimedia.org/wikipedia/commons/8/8f/Sintel_poster.jpg",
  "tears-sample": "https://upload.wikimedia.org/wikipedia/commons/e/e0/Tears_of_steel_poster.jpg",
};

// Curated 4 spotlight items for TV Shows (with Loki Season 2 as first slide matching screenshot)
export const SPOTLIGHT_SHOWS: FeaturedMovie[] = [
  {
    id: "loki",
    title: "Loki | Season 2",
    releaseYear: "2023",
    posterUrl: "/assets/loki-poster.jpg",
    bannerUrl: "/assets/loki-hero.jpg",
    genres: ["Action", "TV Show", "United States"],
    rating: 8.2,
    certification: "TV-14",
    director: "Michael Waldron",
    statusBadge: "Ongoing",
    summary: "Loki navigates an ever-expanding and increasingly dangerous Multiverse in search of Sylvie, Judge Renslayer, Miss Minutes, and the truth of what it means to possess free will and glorious purpose."
  },
  {
    id: "shogun",
    title: "Shōgun | Season 1",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/7O4iVfOMQmdCSxhOg1WnzG1AgYT.jpg",
    bannerUrl: "https://image.tmdb.org/t/p/original/bwSmgmd90hCWwqOKQYTEraeOZhJ.jpg",
    genres: ["Drama", "History", "TV Show"],
    rating: 8.7,
    certification: "TV-MA",
    director: "Rachel Kondo",
    statusBadge: "Completed",
    summary: "When a mysterious European ship is found marooned in a nearby fishing village, Lord Yoshii Toranaga discovers secrets that could tip the scales of power in feudal Japan."
  },
  {
    id: "severance",
    title: "Severance | Season 2",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/9msdHwWv3sC6J26Z5f7O3jVw9J2.jpg",
    bannerUrl: "https://image.tmdb.org/t/p/original/ixgFmf1X59PUZam2qbAfskx2gQr.jpg",
    genres: ["Sci-Fi", "Mystery", "TV Show"],
    rating: 8.7,
    certification: "TV-MA",
    director: "Dan Erickson",
    statusBadge: "Ongoing",
    summary: "Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives, uncovering a corporate conspiracy."
  },
  {
    id: "the-last-of-us",
    title: "The Last of Us | Season 2",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2V7JMrRI.jpg",
    bannerUrl: "https://image.tmdb.org/t/p/original/lY2DhbA7Hy44fAKddr06UrXWWaQ.jpg",
    genres: ["Drama", "Sci-Fi", "Adventure"],
    rating: 8.8,
    certification: "TV-MA",
    director: "Craig Mazin",
    statusBadge: "Ongoing",
    summary: "After a global fungal pandemic destroys civilization, a hardened survivor takes charge of a 14-year-old girl who may be humanity's last hope."
  }
];

// Curated 4 spotlight items for Movies
export const SPOTLIGHT_MOVIES: FeaturedMovie[] = [
  {
    id: "dune-two",
    title: "Dune: Part Two",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    bannerUrl: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
    genres: ["Sci-Fi", "Adventure", "Action"],
    rating: 8.5,
    certification: "PG-13",
    director: "Denis Villeneuve",
    statusBadge: "4K HDR",
    summary: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family, facing a choice between love and the fate of the universe."
  },
  {
    id: "spider-verse",
    title: "Spider-Man: Across the Spider-Verse",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj7sR48.jpg",
    bannerUrl: "https://image.tmdb.org/t/p/original/kVd3a9YeLGkoeR50jGEXM6EqseS.jpg",
    genres: ["Animation", "Action", "Adventure"],
    rating: 8.6,
    certification: "PG",
    director: "Joaquim Dos Santos",
    statusBadge: "4K UHD",
    summary: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence."
  },
  {
    id: "oppenheimer",
    title: "Oppenheimer",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    bannerUrl: "https://image.tmdb.org/t/p/original/cUIqZd6jJCbO94Txt1CkTs7MSeP.jpg",
    genres: ["Biography", "Drama", "History"],
    rating: 8.9,
    certification: "R",
    director: "Christopher Nolan",
    statusBadge: "IMAX 70mm",
    summary: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II."
  },
  {
    id: "the-batman",
    title: "The Batman",
    releaseYear: "2022",
    posterUrl: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    bannerUrl: "https://image.tmdb.org/t/p/original/eUORREWq2ThkkxyiCESCu3sVdGg.jpg",
    genres: ["Action", "Crime", "Mystery"],
    rating: 7.8,
    certification: "PG-13",
    director: "Matt Reeves",
    statusBadge: "Dolby Vision",
    summary: "When a sadistic serial killer begins murdering key political figures in Gotham, the Batman is forced to investigate the city's hidden corruption."
  }
];

export interface TvHeroBillboardProps {
  movie: FeaturedMovie;
  featuredList?: FeaturedMovie[];
  activeIndex?: number;
  onSelectIndex?: (index: number) => void;
  onPlay: (movie: FeaturedMovie) => void;
  onPlayTrailer?: (movie: FeaturedMovie) => void;
  onToggleWatchlist: (movieId: string) => void;
  onOpenWatchParty?: (movie: FeaturedMovie) => void;
  onOpenDetails?: (movie: FeaturedMovie) => void;
  onOpenEngineHUD?: () => void;
  isWatchlistActive?: boolean;
  continueWatchingList?: ContinueWatchingMediaItem[];
  onSeeAllContinueWatching?: () => void;
}

export const TvHeroBillboard: React.FC<TvHeroBillboardProps> = ({
  movie,
  featuredList,
  onSelectIndex,
  onPlay,
  onPlayTrailer,
  onToggleWatchlist,
  onOpenWatchParty,
  onOpenDetails,
  isWatchlistActive = false,
}) => {
  // Determine if this is a TV show (either by genres or if currently showing Loki/shows)
  const isShowContext = 
    movie.genres?.some(g => g.toLowerCase().includes('show') || g.toLowerCase().includes('series')) ||
    movie.certification?.startsWith('TV-') ||
    movie.id === 'loki' ||
    movie.id === 'shogun' ||
    movie.id === 'the-bear' ||
    movie.id === 'severance' ||
    movie.id === 'stranger-things' ||
    movie.id === 'the-last-of-us';

  const spotlightItems = useMemo(() => {
    if (featuredList && featuredList.length >= 4) return featuredList.slice(0, 4);
    return isShowContext ? SPOTLIGHT_SHOWS : SPOTLIGHT_MOVIES;
  }, [featuredList, isShowContext]);

  // Track active slide segment
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(() => {
    const idx = spotlightItems.findIndex(item => item.id === movie.id);
    return idx >= 0 ? idx : 0;
  });

  // Sync only when the parent changes the featured movie (not on every render)
  useEffect(() => {
    const idx = spotlightItems.findIndex(item => item.id === movie.id);
    if (idx >= 0) {
      setSelectedSlideIndex(idx);
    }
  }, [movie.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const goToSlide = useCallback((index: number) => {
    const next = ((index % spotlightItems.length) + spotlightItems.length) % spotlightItems.length;
    setSelectedSlideIndex(next);
    onSelectIndex?.(next);
  }, [spotlightItems.length, onSelectIndex]);

  // Prefer the active spotlight slide; fall back to external movie if it's outside the carousel
  const activeSpotlight = spotlightItems[selectedSlideIndex] ?? spotlightItems[0];
  const activeItem = activeSpotlight ?? movie;

  // Title formatting: if Loki, ensure it matches "Loki | Season 2", else clean title
  let displayTitle = activeItem.title;
  if (activeItem.id === 'loki' && !displayTitle.includes('|')) {
    displayTitle = 'Loki | Season 2';
  } else if (isShowContext && !displayTitle.includes('|')) {
    displayTitle = `${displayTitle} | Season 1`;
  }

  // Rating string formatting: e.g. "8.2/10"
  const rawRating = activeItem.imdbRating || activeItem.rating || "8.2";
  const ratingString = typeof rawRating === 'number' ? rawRating.toFixed(1) : String(rawRating);

  // Status badge text: e.g. "Ongoing" or "Completed"
  const statusBadge = activeItem.statusBadge || (isShowContext ? "Ongoing" : "4K HDR");

  // Release year
  const releaseYear = activeItem.releaseYear || "2023";

  // Formatted genres string: "Action, TV Show, United States"
  const genreList = activeItem.genres && activeItem.genres.length > 0 
    ? activeItem.genres.slice(0, 2) 
    : ["Action", "Adventure"];
  const genresFormatted = isShowContext
    ? `${genreList.join(', ')}, TV Show, United States`
    : `${genreList.join(', ')}, United States`;

  // Plot description: high fidelity synopsis
  const plotDescription = activeItem.id === 'loki'
    ? "Loki navigates an ever-expanding and increasingly dangerous Multiverse in search of Sylvie, Judge Renslayer, Miss Minutes, and the truth of what it means to possess free will and glorious purpose."
    : (activeItem.summary || activeItem.plot || "An epic cinematic journey exploring uncharted frontiers, high-stakes alliances, and unexpected twists.");

  // Authentic IMDb / TMDb 16:9 cinematic letterbox backdrop
  const backdropImage = 
    IMDB_LETTERBOX_IMAGES[activeItem.id] ||
    activeItem.bannerUrl || 
    activeItem.posterUrl || 
    "/assets/loki-hero.jpg";

  return (
    <div className="relative w-full px-6 lg:px-12 xl:px-14 pt-20 pb-3 sm:pb-4 select-none">

      {/* Main Cinematic Hero Billboard Card — locked 16:9 frame */}
      <div
        className="relative w-full overflow-hidden rounded-[24px] sm:rounded-[32px] bg-zinc-950 border border-white/10 shadow-2xl group"
        style={{ aspectRatio: '16 / 9' }}
      >
        <img
          src={backdropImage}
          alt={displayTitle}
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.dataset.fallbackApplied) {
              target.dataset.fallbackApplied = 'true';
              target.src = '/assets/loki-hero.jpg';
            }
          }}
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-90 contrast-105 transition-all duration-700 ease-out group-hover:scale-102"
        />

        {/* Cinematic gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-transparent" />

        {/* Content Overlay */}
        <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 lg:p-10 pb-5 sm:pb-6 z-20 flex flex-col justify-end">
          {/* Title with vertical bar */}
          <h1 className="font-sans font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white tracking-tight leading-tight mb-2 drop-shadow-md">
            {displayTitle}
          </h1>

          {/* Metadata Row: ★ 8.2/10 · Ongoing · 2023 · Action, TV Show, United States */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs sm:text-sm font-medium text-zinc-200 mb-2.5 drop-shadow">
            {/* Golden Star Rating */}
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
              <span>{ratingString}/10</span>
            </div>

            <span className="text-zinc-500 font-bold">·</span>

            {/* Earthy Olive/Amber Status Pill Badge */}
            <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-[#50452f] text-[#f2dfb1] border border-[#716142] shadow-sm backdrop-blur-sm">
              {statusBadge}
            </span>

            <span className="text-zinc-500 font-bold">·</span>

            {/* Year */}
            <span className="text-zinc-300 font-medium">{releaseYear}</span>

            <span className="text-zinc-500 font-bold">·</span>

            {/* Genres / Format */}
            <span className="text-zinc-300 font-medium truncate max-w-md">
              {genresFormatted}
            </span>
          </div>

          {/* Synopsis Paragraph */}
          <p className="text-zinc-300 text-xs sm:text-sm font-normal leading-relaxed max-w-2xl mb-4 sm:mb-5 line-clamp-2 drop-shadow">
            {plotDescription}
          </p>

          {/* Bottom Controls Row: Buttons on Left, Segmented Indicators on Right */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
            {/* Action Buttons Group */}
            <div className="flex items-center gap-3">
              {/* Primary "Watch Now" Button: Solid White Pill with Solid Play Icon */}
              <button
                type="button"
                onClick={() => onPlay(activeItem)}
                className="flex items-center gap-2.5 px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-white hover:bg-zinc-200 text-black font-bold text-xs sm:text-sm tracking-wide shadow-xl shadow-black/50 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-white active:scale-95"
              >
                <Play className="w-4 h-4 fill-black text-black ml-0.5" />
                <span>Watch Now</span>
              </button>

              {/* Secondary "Trailer" Button: Icon-only button to the left of the Details and Watchlist buttons */}
              <button
                type="button"
                onClick={() => onPlayTrailer ? onPlayTrailer(activeItem) : onPlay(activeItem)}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/40 active:scale-95"
                title="Watch Trailer"
                aria-label="Watch Trailer"
              >
                <Film className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>

              {/* Details Button: Icon-only button to the right of the Trailer button */}
              <button
                type="button"
                onClick={() => onOpenDetails && onOpenDetails(activeItem)}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/40 active:scale-95"
                title="View Details"
                aria-label="View Details"
              >
                <Info className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>

              {/* "Add to Watchlist" Button */}
              <button
                type="button"
                onClick={() => onToggleWatchlist(activeItem.id)}
                className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-medium text-xs sm:text-sm transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/40 active:scale-95"
              >
                {isWatchlistActive ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                    <span>Added to Watchlist</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-white stroke-[2.5]" />
                    <span>Add to Watchlist</span>
                  </>
                )}
              </button>
            </div>

            {/* Prev / Next slide controls */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={() => goToSlide(selectedSlideIndex - 1)}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/40 active:scale-95"
                title="Previous featured title"
                aria-label="Previous featured title"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => goToSlide(selectedSlideIndex + 1)}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/40 active:scale-95"
                title="Next featured title"
                aria-label="Next featured title"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
