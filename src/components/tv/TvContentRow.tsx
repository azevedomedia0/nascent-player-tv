import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Star, Clock } from 'lucide-react';
import { FeaturedMovie } from './TvHeroBillboard';

interface TvContentRowProps {
  title: string;
  subtitle?: string;
  items: FeaturedMovie[];
  onSelectItem: (item: FeaturedMovie) => void;
  onFocusItem?: (item: FeaturedMovie) => void;
  isTop10?: boolean;
  isRanked?: boolean;
  isContinueWatching?: boolean;
  progressMap?: Record<string, number>; // item id -> percentage 0-100
  selectedItemId?: string;
  updatedDaily?: boolean;
  dailyDateString?: string;
}

export const TvContentRow: React.FC<TvContentRowProps> = ({
  title,
  subtitle,
  items,
  onSelectItem,
  onFocusItem,
  isTop10 = false,
  isRanked = false,
  isContinueWatching = false,
  progressMap = {},
  selectedItemId,
  updatedDaily = false,
  dailyDateString,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -600 : 600;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="relative w-full my-3 sm:my-3.5 select-none group/row">
      {/* Row Header */}
      <div className="px-6 lg:px-12 mb-2 flex flex-col md:flex-row md:items-baseline justify-between gap-1.5">
        <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-3 max-w-5xl">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="font-display font-bold text-lg lg:text-xl text-white tracking-wide">
              {title}
            </h2>
          </div>
          {subtitle && (
            <span className="text-[11px] lg:text-xs text-zinc-400 font-medium leading-relaxed">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {/* Row Container with Scroll Buttons */}
      <div className="relative w-full">
        {/* Left Scroll Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/80 hover:bg-sky-500 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all backdrop-blur-md shadow-2xl border border-white/20 hover:border-sky-400 focus:opacity-100 focus:outline-none hover:scale-110 active:scale-95"
          aria-label="Scroll left"
          tabIndex={-1}
        >
          <ChevronLeft className="w-5 h-5 mr-0.5" />
        </button>

        {/* Right Scroll Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/80 hover:bg-sky-500 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all backdrop-blur-md shadow-2xl border border-white/20 hover:border-sky-400 focus:opacity-100 focus:outline-none hover:scale-110 active:scale-95"
          aria-label="Scroll right"
          tabIndex={-1}
        >
          <ChevronRight className="w-5 h-5 ml-0.5" />
        </button>

        {/* Horizontal Card Shelf */}
        <div
          ref={rowRef}
          className="flex items-center gap-3.5 lg:gap-4 overflow-x-auto no-scrollbar px-6 lg:px-12 py-2.5 scroll-smooth"
        >
          {items.map((item, index) => {
            const isSelected = selectedItemId === item.id;
            const progress = progressMap[item.id] ?? (isContinueWatching ? 35 + ((index * 27) % 55) : 0);

            if (isTop10 || isRanked) {
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  onFocus={() => onFocusItem && onFocusItem(item)}
                  onMouseEnter={() => onFocusItem && onFocusItem(item)}
                  tabIndex={0}
                  className="flex-shrink-0 cursor-pointer group/card focus:outline-none"
                >
                  {/* Card Artwork */}
                  <div className={`relative w-36 sm:w-40 lg:w-44 aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-900 border transition-all duration-300 transform group-hover/card:scale-105 group-focus/card:scale-105 group-focus/card:ring-4 group-focus/card:ring-sky-400 group-focus/card:border-white shadow-xl ${
                    isSelected ? 'ring-4 ring-sky-400 border-white scale-105' : 'border-white/10 group-hover/card:border-white/40'
                  }`}>
                    <img
                      src={item.posterUrl}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover/card:brightness-110 transition-all"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 group-focus/card:opacity-100 transition-opacity flex flex-col justify-end p-2.5">
                      <span className="font-display font-bold text-xs text-white line-clamp-1">{item.title}</span>
                      <span className="text-[10px] text-sky-300">{item.releaseYear}</span>
                    </div>
                  </div>

                  {/* Caption underneath */}
                  <div className="mt-1.5 max-w-[144px] sm:max-w-[160px] lg:max-w-[176px]">
                    <h3 className="font-display font-medium text-xs lg:text-sm text-zinc-200 group-hover/card:text-white line-clamp-1">
                      {item.title}
                    </h3>
                    <div className="text-[10px] lg:text-[11px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                      <span className="text-sky-400 font-mono font-semibold">#{index + 1}</span>
                      <span>·</span>
                      <span>{item.releaseYear}</span>
                      <span>·</span>
                      <span>{item.genres?.[0] || 'Movie'}</span>
                    </div>
                  </div>
                </div>
              );
            }

            if (isContinueWatching) {
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  onFocus={() => onFocusItem && onFocusItem(item)}
                  onMouseEnter={() => onFocusItem && onFocusItem(item)}
                  tabIndex={0}
                  className="flex-shrink-0 cursor-pointer group/card focus:outline-none"
                >
                  <div className={`relative w-56 sm:w-60 lg:w-64 aspect-video rounded-2xl overflow-hidden bg-zinc-900 border transition-all duration-300 transform group-hover/card:scale-105 group-focus/card:scale-105 group-focus/card:ring-4 group-focus/card:ring-sky-400 group-focus/card:border-white shadow-xl ${
                    isSelected ? 'ring-4 ring-sky-400 border-white scale-105' : 'border-white/10 group-hover/card:border-white/40'
                  }`}>
                    <img
                      src={item.bannerUrl || item.posterUrl}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover/card:brightness-110 transition-all"
                    />

                    {/* Play Overlay Button */}
                    <div className="absolute inset-0 bg-black/30 group-hover/card:bg-black/10 flex items-center justify-center transition-all">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/90 text-black flex items-center justify-center shadow-lg transform group-hover/card:scale-110 group-focus/card:scale-110 transition-transform">
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Time remaining overlay */}
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[9px] sm:text-[10px] font-mono text-zinc-300 flex items-center gap-1 border border-white/10">
                      <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-sky-400" />
                      <span>{item.remainingTime || `${Math.max(1, Math.round((item.duration ? item.duration : 7200) * (1 - progress / 100) / 60))}m left`}</span>
                    </div>

                    {/* Progress Bar at bottom */}
                    <div className="absolute bottom-0 inset-x-0 h-1.5 bg-black/60">
                      <div
                        className="h-full bg-gradient-to-r from-sky-500 to-indigo-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Title & Info under card */}
                  <div className="mt-1.5 flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-semibold text-xs sm:text-sm text-zinc-100 group-hover/card:text-white line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-zinc-400 font-medium">
                        Resume · {progress}% watched
                      </p>
                    </div>
                  </div>
                </div>
              );
            }

            // Standard Vertical Movie/Show Card
            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                onFocus={() => onFocusItem && onFocusItem(item)}
                onMouseEnter={() => onFocusItem && onFocusItem(item)}
                tabIndex={0}
                className="flex-shrink-0 cursor-pointer group/card focus:outline-none"
              >
                <div className={`relative w-36 sm:w-40 lg:w-44 aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-900 border transition-all duration-300 transform group-hover/card:scale-105 group-focus/card:scale-105 group-focus/card:ring-4 group-focus/card:ring-sky-400 group-focus/card:border-white shadow-xl ${
                  isSelected ? 'ring-4 ring-sky-400 border-white scale-105' : 'border-white/10 group-hover/card:border-white/40'
                }`}>
                  <img
                    src={item.posterUrl}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover/card:brightness-110 transition-all"
                  />

                  {/* Quick Play Floating Pill on Hover/Focus */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover/card:opacity-100 group-focus/card:opacity-100 transition-opacity flex flex-col justify-between p-2.5">
                    <div className="flex justify-end">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/70 border border-white/20 text-amber-400 flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-amber-400" />
                        {item.rating || '8.2'}
                      </span>
                    </div>
                    <div>
                      <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg mb-2 transform group-hover/card:scale-105">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                      <h3 className="font-display font-bold text-xs text-white line-clamp-1">{item.title}</h3>
                      <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                        <span>{item.releaseYear}</span>
                        <span>·</span>
                        <span>{item.genres?.[0] || 'Drama'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quiet caption underneath for TV glanceability */}
                <div className="mt-2 max-w-[160px] lg:max-w-[192px]">
                  <h3 className="font-display font-medium text-xs lg:text-sm text-zinc-200 group-hover/card:text-white line-clamp-1">
                    {item.title}
                  </h3>
                  <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                    <span>{item.releaseYear}</span>
                    <span>·</span>
                    <span>{item.genres?.[0] || 'Movie'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
