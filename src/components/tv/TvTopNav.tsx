import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Tv, 
  Film, 
  Clapperboard, 
  Folder, 
  Settings, 
  Bookmark, 
  Sparkles,
  HardDrive,
  Users,
  Bell,
  Menu,
  Lock,
  CheckCircle2,
  X,
  Info,
  Radio,
} from 'lucide-react';
import { AppLogo } from '../AppLogo';
import { FeaturedMovie } from '../../lib/types';

export type TvTab = 'movies' | 'shows' | 'local-media' | 'shared-libraries' | 'library' | 'watchlists' | 'search';

type AppNotification =
  | {
      id: string;
      kind: 'message';
      title: string;
      message: string;
      time: string;
      read: boolean;
    }
  | {
      id: string;
      kind: 'watch-party';
      title: string;
      message: string;
      time: string;
      read: boolean;
      hostHandle: string;
      avatarInitials: string;
      avatarColor: string;
      viewerCount: number;
      movie: FeaturedMovie;
    };

interface TvTopNavProps {
  activeTab: TvTab;
  onTabChange: (tab: TvTab) => void;
  onOpenSearch: () => void;
  onToggleRemote: () => void;
  isRemoteOpen: boolean;
  onOpenStreamingHUD: () => void;
  onOpenSettings?: () => void;
  onOpenPlugins?: () => void;
  onToggleMenu?: () => void;
  activeMediaTitle?: string;
  isEngineActive?: boolean;
  isSearchOpen?: boolean;
  /** Accept a peer watch-party invite from the notifications panel. */
  onAcceptWatchPartyInvite?: (movie: FeaturedMovie) => void;
  /** Open title details for a watch-party invite. */
  onInspectWatchPartyInvite?: (movie: FeaturedMovie) => void;
}

export const TvTopNav: React.FC<TvTopNavProps> = ({
  activeTab,
  onTabChange,
  onOpenSearch,
  onToggleRemote,
  isRemoteOpen,
  onOpenStreamingHUD,
  onOpenSettings,
  onToggleMenu,
  activeMediaTitle,
  isEngineActive = true,
  isSearchOpen = false,
  onAcceptWatchPartyInvite,
  onInspectWatchPartyInvite,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'wp-dune',
      kind: 'watch-party',
      title: 'Watch Party Invite',
      message:
        'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
      time: '14m ago',
      read: false,
      hostHandle: '@steven_az',
      avatarInitials: 'SA',
      avatarColor: 'bg-sky-500',
      viewerCount: 3,
      movie: {
        id: 'dune-two',
        title: 'Dune: Part Two',
        releaseYear: '2024',
        posterUrl:
          'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
        bannerUrl:
          'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
        genres: ['Sci-Fi', 'Adventure', 'Action'],
        rating: 8.5,
        certification: 'PG-13',
        director: 'Denis Villeneuve',
        summary:
          'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
      },
    },
    {
      id: 'n1',
      kind: 'message',
      title: 'New Episode Alert',
      message: 'Severance Season 2 Episode 3 is now ready to stream in 4K HDR.',
      time: '15m ago',
      read: false,
    },
    {
      id: 'n2',
      kind: 'message',
      title: 'Peer Mesh Active',
      message: "Steven's 4K Vault Shared Node connected at 98 Mbps Gigabit link.",
      time: '1h ago',
      read: false,
    },
    {
      id: 'n3',
      kind: 'message',
      title: 'Hardware Decoder',
      message: 'Zero-transcode HEVC Main 10 hardware acceleration pipeline active.',
      time: '3h ago',
      read: true,
    },
  ]);
  const notificationRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotificationsOpen]);

  const navItems: { id: TvTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'shows', label: 'TV Shows', icon: Clapperboard },
    { id: 'local-media', label: 'Libraries', icon: HardDrive },
  ];

  return (
    <header 
      data-tab={activeTab}
      className="absolute top-0 inset-x-0 z-40 w-full pl-2 pr-6 lg:pl-3 lg:pr-12 pt-3 pb-2 flex items-center justify-between pointer-events-none bg-transparent"
    >
      {/* Brand & Left Navigation — hidden on library tabs (brand lives in TvSidebar) */}
      {!['local-media', 'library', 'shared-libraries'].includes(activeTab) && (
        <div className="flex items-center gap-3 lg:gap-4 z-10 flex-shrink-0 pointer-events-auto">
          <div 
            onClick={() => onTabChange('movies')}
            className="flex items-center gap-2.5 cursor-pointer group focus:outline-none"
            tabIndex={0}
          >
            <div className="w-12 h-12 group-hover:scale-105 group-focus-visible:ring-2 group-focus-visible:ring-sky-400 rounded-xl transition-all">
              <AppLogo className="w-full h-full" showBackground={false} />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-lg tracking-wide text-white">
                Nascent Player <span className="text-zinc-300 text-[10px] font-semibold tracking-widest px-1.5 py-0.5 rounded-full bg-transparent border border-white/20 ml-1">TV</span>
              </span>
            </div>
          </div>
        </div>
      )}
      {['local-media', 'library', 'shared-libraries'].includes(activeTab) && (
        <div className="w-12 flex-shrink-0" aria-hidden="true" />
      )}

      {/* Centered TV Top Navigation Links */}
      <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-0.5 lg:gap-1 z-10 pointer-events-auto px-1.5 py-1 rounded-full bg-black/45 backdrop-blur-xl border border-white/15 shadow-lg shadow-black/40">
        {/* Search Quick Action */}
        <button
          onClick={onOpenSearch}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium text-xs sm:text-sm transition-all focus:outline-none ${
            isSearchOpen
              ? 'text-black font-bold nascent-logo-gradient shadow-md shadow-pink-500/25'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
          title="Search movies, shows, genres (Press /)"
          aria-label="Search"
          tabIndex={0}
        >
          <Search className={`w-3.5 h-3.5 transition-colors ${isSearchOpen ? 'text-black' : 'text-zinc-400'}`} />
          <span>Search</span>
        </button>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = !isSearchOpen && (activeTab === item.id || (item.id === 'local-media' && activeTab === 'library'));
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium text-xs sm:text-sm transition-all focus:outline-none ${
                isActive
                  ? 'text-black font-bold nascent-logo-gradient shadow-md shadow-pink-500/25'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
              tabIndex={0}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right TV Status & Quick Controls */}
      <div className="flex items-center gap-3 z-10 flex-shrink-0 pointer-events-auto">
        {/* Current Time (TV Clock) */}
        <div className="font-time text-sm lg:text-[15px] font-medium text-white/90 tracking-normal tabular-nums pl-2 select-none flex items-center drop-shadow-sm">
          {currentTime || '12:00 PM'}
        </div>

        {/* Notification Bell Icon Button (to the right of the time) */}
        <div ref={notificationRef} className="relative flex items-center">
          <button
            type="button"
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
            className={`relative p-2.5 rounded-full transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400 ${
              isNotificationsOpen
                ? 'bg-white/20 text-white'
                : 'text-zinc-300 hover:text-white hover:bg-white/10 active:scale-95'
            }`}
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 lg:w-[22px] lg:h-[22px]" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-sky-400 ring-2 ring-[#131313] animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotificationsOpen && (
            <div className="absolute right-0 top-full mt-2.5 w-[22.5rem] p-3.5 rounded-2xl bg-[#0c0c11]/98 backdrop-blur-2xl border border-white/15 shadow-2xl z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-sky-400" />
                  <span className="font-display font-bold text-xs uppercase tracking-wider text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setNotifications([])}
                    className="text-[10px] text-sky-400 hover:text-sky-300 font-medium cursor-pointer"
                  >
                    Clear Messages
                  </button>
                )}
              </div>

              <div className="space-y-2.5 max-h-[28rem] overflow-y-auto no-scrollbar">
                {notifications.length === 0 ? (
                  <p className="py-6 text-center text-[11px] text-zinc-500">No messages</p>
                ) : (
                  notifications.map((n) =>
                    n.kind === 'watch-party' ? (
                      <div
                        key={n.id}
                        className="relative overflow-hidden rounded-xl border border-pink-500/35 bg-gradient-to-br from-[#180c14] via-[#24111d] to-[#120d10] text-left"
                      >
                        {n.movie.bannerUrl ? (
                          <img
                            src={n.movie.bannerUrl}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm pointer-events-none"
                            aria-hidden
                          />
                        ) : null}
                        <div className="relative z-10 p-3 space-y-2.5">
                          <div className="flex items-start gap-2.5">
                            <div className="relative w-12 h-[4.5rem] rounded-lg overflow-hidden border border-pink-500/40 shrink-0 bg-zinc-900">
                              <img
                                src={n.movie.posterUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute top-1 left-1 px-1 py-0.5 rounded bg-rose-600/95 text-white font-mono text-[8px] font-bold uppercase tracking-wider">
                                Live
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span
                                    className={`w-4 h-4 rounded-full ${n.avatarColor} text-white text-[8px] font-bold flex items-center justify-center shrink-0`}
                                  >
                                    {n.avatarInitials}
                                  </span>
                                  <span className="text-[10px] font-mono text-pink-300 truncate">
                                    {n.hostHandle}
                                  </span>
                                </div>
                                <span className="text-[10px] text-zinc-500 font-mono shrink-0">{n.time}</span>
                              </div>
                              <p className="text-[10px] font-mono uppercase tracking-wider text-pink-400 font-bold flex items-center gap-1 mb-1">
                                <Users className="w-3 h-3 shrink-0" />
                                Invited you to Watch Party
                              </p>
                              <p className="text-xs font-bold text-white line-clamp-1">
                                {n.movie.title}{' '}
                                <span className="text-zinc-400 font-mono font-normal">
                                  ({n.movie.releaseYear})
                                </span>
                              </p>
                              <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                                <Radio className="w-2.5 h-2.5 animate-pulse" />
                                {n.viewerCount} peers in sync
                              </p>
                              <p className="text-[10px] text-zinc-400 leading-snug line-clamp-2 mt-1">
                                {n.message}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              title="View details"
                              onClick={() => {
                                onInspectWatchPartyInvite?.(n.movie);
                                setIsNotificationsOpen(false);
                                setNotifications((prev) =>
                                  prev.map((item) =>
                                    item.id === n.id ? { ...item, read: true } : item
                                  )
                                );
                              }}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-[10px] font-semibold border border-white/10 cursor-pointer"
                            >
                              <Info className="w-3 h-3" />
                              Details
                            </button>
                            <button
                              type="button"
                              title="Accept invitation"
                              onClick={() => {
                                onAcceptWatchPartyInvite?.(n.movie);
                                dismissNotification(n.id);
                                setIsNotificationsOpen(false);
                              }}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-400 text-white text-[10px] font-extrabold shadow-md shadow-pink-500/25 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Accept
                            </button>
                            <button
                              type="button"
                              title="Decline invitation"
                              onClick={() => dismissNotification(n.id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 text-[10px] border border-white/5 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                              Decline
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          n.read
                            ? 'bg-white/[0.03] border-white/5 opacity-75'
                            : 'bg-white/[0.08] border-white/15'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white line-clamp-1">{n.title}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-zinc-300 leading-snug line-clamp-2">{n.message}</p>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div 
          onClick={onOpenSettings}
          className="flex items-center gap-2.5 pl-1 cursor-pointer group"
          title="Steven Azevedo (Settings & Profile)"
        >
          <div className="w-8 h-8 rounded-full ring-2 ring-sky-500/40 group-hover:ring-sky-400 overflow-hidden bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
            SA
          </div>
        </div>
      </div>
    </header>
  );
};
