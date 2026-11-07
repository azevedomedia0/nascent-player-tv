import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  Volume1,
  VolumeX, 
  Shuffle,
  Maximize, 
  Minimize, 
  Sliders, 
  Languages, 
  Gauge, 
  ArrowLeft, 
  FastForward, 
  Rewind, 
  Zap, 
  Check, 
  X,
  Sparkles,
  Settings,
  Music
} from 'lucide-react';
import { FeaturedMovie, SubtitleTrack } from '../../lib/types';

interface TvPlayerProps {
  movie: FeaturedMovie;
  videoUrl: string;
  onClose: () => void;
  onOpenStreamingHUD?: () => void;
  eqGains: {
    hz60: number;
    hz230: number;
    hz910: number;
    hz4000: number;
    hz14000: number;
  };
  onEqChange: (freq: string, val: number) => void;
  audioPreset: 'normal' | 'vocal' | 'bass' | 'cinema' | 'custom';
  onAudioPresetChange: (preset: 'normal' | 'vocal' | 'bass' | 'cinema' | 'custom') => void;
  onNextMedia?: () => void;
  onPrevMedia?: () => void;
}

export const TvPlayer: React.FC<TvPlayerProps> = ({
  movie,
  videoUrl,
  onClose,
  onOpenStreamingHUD,
  eqGains,
  onEqChange,
  audioPreset,
  onAudioPresetChange,
  onNextMedia,
  onPrevMedia,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [activeSubtitle, setActiveSubtitle] = useState<string>('none');
  const [quality, setQuality] = useState<'4k' | '1080p' | '720p'>('4k');

  // Drawers
  const [activeDrawer, setActiveDrawer] = useState<'none' | 'audio' | 'subtitles' | 'quality' | 'speed'>('none');
  
  // OSD auto-hide
  const [showControls, setShowControls] = useState<boolean>(true);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetHideTimer = () => {
    setShowControls(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      if (isPlaying && activeDrawer === 'none') {
        setShowControls(false);
      }
    }, 4000);
  };

  useEffect(() => {
    resetHideTimer();
    const handleMouseMove = () => resetHideTimer();
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [isPlaying, activeDrawer]);

  // Video event handlers
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || movie.duration || 600);
      videoRef.current.play().catch(() => setIsPlaying(false));
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    resetHideTimer();
  };

  const seek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, time));
      setCurrentTime(videoRef.current.currentTime);
    }
    resetHideTimer();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Keyboard navigation inside player
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      resetHideTimer();
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowLeft') {
        seek(currentTime - 10);
      } else if (e.key === 'ArrowRight') {
        seek(currentTime + 10);
      } else if (e.key === 'ArrowUp') {
        setVolume((v) => Math.min(1, v + 0.1));
        if (videoRef.current) videoRef.current.volume = Math.min(1, volume + 0.1);
      } else if (e.key === 'ArrowDown') {
        setVolume((v) => Math.max(0, v - 0.1));
        if (videoRef.current) videoRef.current.volume = Math.max(0, volume - 0.1);
      } else if (e.key === 'Escape' || e.key === 'Backspace') {
        if (activeDrawer !== 'none') {
          setActiveDrawer('none');
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, duration, volume, activeDrawer, isPlaying]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden select-none"
    >
      {/* Dynamic Atmospheric Ambilight Glow */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 blur-[140px] scale-110"
        style={{
          background: `radial-gradient(circle at center, rgba(56, 189, 248, 0.4) 0%, rgba(99, 102, 241, 0.2) 50%, transparent 80%)`
        }}
      />

      {/* Main Leanback HTML5 Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={movie.bannerUrl || movie.posterUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => onNextMedia && onNextMedia()}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        playsInline
      />

      {/* Top Bar Navigation (Google TV Back & Title OSD) */}
      <div className={`absolute top-0 inset-x-0 p-8 lg:px-14 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/40 to-transparent transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/25 text-white font-medium text-sm border border-white/20 focus:ring-2 focus:ring-sky-400 focus:outline-none transition-all"
            title="Exit Player (Esc)"
          >
            <ArrowLeft className="w-5 h-5 text-sky-400" />
            <span>Back to Google TV</span>
          </button>

          <div className="flex flex-col">
            <h1 className="font-display font-bold text-xl text-white tracking-wide drop-shadow-md">
              {movie.title}
            </h1>
            <div className="text-xs text-zinc-300 flex items-center gap-2">
              <span>{movie.releaseYear}</span>
              <span>·</span>
              <span>{movie.genres?.[0] || 'Movie'}</span>
              <span>·</span>
              <span className="text-sky-400 font-semibold uppercase">{quality} HDR 60FPS</span>
            </div>
          </div>
        </div>

        {/* Top Right Quick Actions */}
        <div className="flex items-center gap-3" />
      </div>

      {/* Bottom Leanback OSD Controls */}
      <div className={`absolute bottom-0 inset-x-0 p-8 lg:px-14 pb-10 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-300 flex flex-col gap-4 ${
        showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        {/* Progress Bar & Timestamp */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-time font-medium tabular-nums text-zinc-300">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* TV Scrubber Slider */}
          <div 
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              seek(pos * duration);
            }}
            className="relative w-full h-2.5 rounded-full bg-white/20 hover:h-4 cursor-pointer transition-all group/scrub flex items-center"
          >
            {/* Played Track */}
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 relative"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg ring-4 ring-sky-400 scale-0 group-hover/scrub:scale-100 transition-transform" />
            </div>
          </div>
        </div>

        {/* Media Transport Button Row */}
        <div className="flex items-center justify-between pt-2">
          {/* Left Transport */}
          <div className="flex items-center gap-3">
            {/* Rewind 10s */}
            <button
              onClick={() => seek(currentTime - 10)}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 focus:ring-2 focus:ring-sky-400 focus:outline-none"
              title="Rewind 10s (Left Arrow)"
            >
              <Rewind className="w-5 h-5" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="p-4 rounded-full bg-white text-zinc-950 hover:bg-sky-400 active:scale-95 shadow-xl transition-all focus:ring-4 focus:ring-sky-400 focus:outline-none"
              title="Play / Pause (Space)"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current ml-0.5" />
              )}
            </button>

            {/* Fast-Forward 10s */}
            <button
              onClick={() => seek(currentTime + 10)}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 focus:ring-2 focus:ring-sky-400 focus:outline-none"
              title="Fast Forward 10s (Right Arrow)"
            >
              <FastForward className="w-5 h-5" />
            </button>

            {/* Shuffle Button */}
            <button
              onClick={() => {
                const nextShuffle = !isShuffle;
                setIsShuffle(nextShuffle);
                if (onNextMedia) onNextMedia();
              }}
              className={`p-3 rounded-full transition-all active:scale-95 focus:ring-2 focus:ring-sky-400 focus:outline-none ${
                isShuffle
                  ? 'bg-sky-500 text-black shadow-lg shadow-sky-500/30'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title={isShuffle ? "Shuffle Queue: Active (Click to play next random)" : "Shuffle Queue: Inactive (Click to shuffle)"}
            >
              <Shuffle className="w-5 h-5" />
            </button>

            {/* Volume Control with Slider */}
            <div className="flex items-center gap-2.5 bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-full transition-all border border-white/10 ml-1">
              <button
                onClick={() => {
                  const nextMute = !isMuted;
                  setIsMuted(nextMute);
                  if (videoRef.current) {
                    videoRef.current.muted = nextMute;
                    if (!nextMute && volume === 0) {
                      videoRef.current.volume = 0.5;
                      setVolume(0.5);
                    }
                  }
                }}
                className="text-white hover:text-sky-400 transition-colors focus:outline-none cursor-pointer"
                title={isMuted || volume === 0 ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-rose-400" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const newVol = parseFloat(e.target.value);
                  setVolume(newVol);
                  if (videoRef.current) {
                    videoRef.current.volume = newVol;
                    videoRef.current.muted = newVol === 0;
                  }
                  setIsMuted(newVol === 0);
                  resetHideTimer();
                }}
                className="w-20 md:w-28 h-1.5 bg-white/25 hover:bg-white/35 rounded-lg appearance-none cursor-pointer accent-sky-400 focus:outline-none"
                title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
              />

              <span className="text-[11px] font-mono font-medium text-zinc-300 w-7 text-right">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>
          </div>

          {/* Right TV Drawer Toggles */}
          <div className="flex items-center gap-2.5">
            {/* Audio Equalizer & Presets Drawer Toggle */}
            <button
              onClick={() => setActiveDrawer(activeDrawer === 'audio' ? 'none' : 'audio')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold transition-all focus:ring-2 focus:ring-sky-400 focus:outline-none ${
                activeDrawer === 'audio'
                  ? 'bg-sky-500 text-black border-sky-400 shadow-lg'
                  : 'bg-white/10 hover:bg-white/20 text-zinc-200 border-white/20'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Audio EQ</span>
            </button>

            {/* Subtitles Drawer Toggle */}
            <button
              onClick={() => setActiveDrawer(activeDrawer === 'subtitles' ? 'none' : 'subtitles')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold transition-all focus:ring-2 focus:ring-sky-400 focus:outline-none ${
                activeDrawer === 'subtitles'
                  ? 'bg-sky-500 text-black border-sky-400 shadow-lg'
                  : 'bg-white/10 hover:bg-white/20 text-zinc-200 border-white/20'
              }`}
            >
              <Languages className="w-4 h-4" />
              <span>Subtitles</span>
            </button>

            {/* Quality Switcher */}
            <button
              onClick={() => setActiveDrawer(activeDrawer === 'quality' ? 'none' : 'quality')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold transition-all focus:ring-2 focus:ring-sky-400 focus:outline-none ${
                activeDrawer === 'quality'
                  ? 'bg-sky-500 text-black border-sky-400 shadow-lg'
                  : 'bg-white/10 hover:bg-white/20 text-zinc-200 border-white/20'
              }`}
            >
              <Gauge className="w-4 h-4" />
              <span className="uppercase">{quality}</span>
            </button>

            {/* Speed Switcher */}
            <button
              onClick={() => setActiveDrawer(activeDrawer === 'speed' ? 'none' : 'speed')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-semibold transition-all focus:ring-2 focus:ring-sky-400 focus:outline-none ${
                activeDrawer === 'speed'
                  ? 'bg-sky-500 text-black border-sky-400 shadow-lg'
                  : 'bg-white/10 hover:bg-white/20 text-zinc-200 border-white/20'
              }`}
            >
              <span>{playbackSpeed}x</span>
            </button>
          </div>
        </div>
      </div>

      {/* Leanback Settings Drawers / Modals */}
      {/* 1. Audio Equalizer Drawer */}
      {activeDrawer === 'audio' && (
        <div className="absolute right-8 bottom-32 z-50 w-96 p-6 rounded-3xl bg-zinc-950/95 border border-white/20 backdrop-blur-2xl shadow-2xl flex flex-col gap-5 animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 font-display font-bold text-base text-white">
              <Sliders className="w-5 h-5 text-sky-400" />
              <span>Cinema Audio Equalizer</span>
            </div>
            <button
              onClick={() => setActiveDrawer('none')}
              className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Presets */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-zinc-400">Audio Profile Preset</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'normal', label: 'Cinema Studio' },
                { id: 'vocal', label: 'Dialogue Clear' },
                { id: 'bass', label: 'Bass Nascent Boost' },
                { id: 'cinema', label: 'Surround 5.1' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => onAudioPresetChange(p.id as any)}
                  className={`py-2 px-3.5 rounded-full text-xs font-medium border text-left transition-all ${
                    audioPreset === p.id
                      ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold'
                      : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5-Band Equalizer Sliders */}
          <div className="flex items-end justify-between gap-3 pt-3">
            {[
              { id: 'hz60', label: '60Hz' },
              { id: 'hz230', label: '230Hz' },
              { id: 'hz910', label: '910Hz' },
              { id: 'hz4000', label: '4kHz' },
              { id: 'hz14000', label: '14kHz' },
            ].map((band) => (
              <div key={band.id} className="flex flex-col items-center gap-2 flex-1">
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="1"
                  value={(eqGains as any)[band.id] || 0}
                  onChange={(e) => onEqChange(band.id, parseFloat(e.target.value))}
                  className="h-28 w-2 accent-sky-400 [writing-mode:vertical-lr] [direction:rtl] cursor-pointer"
                />
                <span className="text-[10px] font-mono text-zinc-400">{band.label}</span>
                <span className="text-[10px] font-mono text-sky-400">
                  {((eqGains as any)[band.id] || 0) > 0 ? `+${(eqGains as any)[band.id]}` : (eqGains as any)[band.id]}dB
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Subtitles Drawer */}
      {activeDrawer === 'subtitles' && (
        <div className="absolute right-8 bottom-32 z-50 w-80 p-5 rounded-3xl bg-zinc-950/95 border border-white/20 backdrop-blur-2xl shadow-2xl flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 font-display font-bold text-base text-white">
              <Languages className="w-5 h-5 text-sky-400" />
              <span>Subtitles & CC</span>
            </div>
            <button onClick={() => setActiveDrawer('none')} className="text-zinc-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {[
              { id: 'none', label: 'Off' },
              { id: 'en', label: 'English [CC]' },
              { id: 'es', label: 'Spanish (Español)' },
              { id: 'fr', label: 'French (Français)' },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setActiveSubtitle(sub.id)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-full border text-sm font-medium transition-all ${
                  activeSubtitle === sub.id
                    ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold'
                    : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                }`}
              >
                <span>{sub.label}</span>
                {activeSubtitle === sub.id && <Check className="w-4 h-4 text-sky-400" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Quality & Hardware Transcoding Drawer */}
      {activeDrawer === 'quality' && (
        <div className="absolute right-8 bottom-32 z-50 w-80 p-5 rounded-3xl bg-zinc-950/95 border border-white/20 backdrop-blur-2xl shadow-2xl flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 font-display font-bold text-base text-white">
              <Gauge className="w-5 h-5 text-sky-400" />
              <span>Playback Resolution</span>
            </div>
            <button onClick={() => setActiveDrawer('none')} className="text-zinc-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {[
              { id: '4k', label: '4K Ultra HD (Original Master)', note: '60 FPS · 38.4 Mbps HEVC' },
              { id: '1080p', label: '1080p Nitro ABR (Hardware Accel)', note: 'Dynamic Bitrate · 8.2 Mbps' },
              { id: '720p', label: '720p HD (Low Latency / Mobile)', note: 'Fast Buffer · 3.5 Mbps' },
            ].map((q) => (
              <button
                key={q.id}
                onClick={() => setQuality(q.id as any)}
                className={`flex flex-col text-left px-4 py-2.5 rounded-full border transition-all ${
                  quality === q.id
                    ? 'bg-sky-500/20 border-sky-400 text-white font-bold'
                    : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{q.label}</span>
                  {quality === q.id && <Check className="w-4 h-4 text-sky-400" />}
                </div>
                <span className="text-[11px] text-zinc-400 font-mono mt-0.5">{q.note}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Playback Speed Drawer */}
      {activeDrawer === 'speed' && (
        <div className="absolute right-8 bottom-32 z-50 w-72 p-5 rounded-3xl bg-zinc-950/95 border border-white/20 backdrop-blur-2xl shadow-2xl flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="font-display font-bold text-base text-white">Playback Speed</span>
            <button onClick={() => setActiveDrawer('none')} className="text-zinc-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                className={`p-2.5 rounded-full border text-sm font-semibold transition-all ${
                  playbackSpeed === s
                    ? 'bg-sky-500 text-black border-sky-400 font-bold'
                    : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                }`}
              >
                {s === 1 ? '1.0x Normal' : `${s}x`}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
