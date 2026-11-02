import React from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  Home, 
  RotateCcw, 
  Mic, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Volume1, 
  Menu, 
  X, 
  FastForward, 
  Rewind,
  Tv,
  Gamepad2
} from 'lucide-react';

interface TvRemoteOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onDpadUp: () => void;
  onDpadDown: () => void;
  onDpadLeft: () => void;
  onDpadRight: () => void;
  onSelect: () => void;
  onHome: () => void;
  onBack: () => void;
  onTogglePlay: () => void;
  onToggleMenu?: () => void;
  onFastForward?: () => void;
  onRewind?: () => void;
  onVolumeUp?: () => void;
  onVolumeDown?: () => void;
  onMute?: () => void;
  onOpenSearch?: () => void;
  isPlaying?: boolean;
}

export const TvRemoteOverlay: React.FC<TvRemoteOverlayProps> = ({
  isOpen,
  onClose,
  onDpadUp,
  onDpadDown,
  onDpadLeft,
  onDpadRight,
  onSelect,
  onHome,
  onBack,
  onTogglePlay,
  onToggleMenu,
  onFastForward,
  onRewind,
  onVolumeUp,
  onVolumeDown,
  onMute,
  onOpenSearch,
  isPlaying = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center select-none animate-in fade-in slide-in-from-bottom-6 duration-300 pointer-events-auto">
      {/* Remote Shell */}
      <div className="relative w-72 bg-zinc-950/95 backdrop-blur-xl border border-white/20 rounded-[40px] p-5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_30px_rgba(56,189,248,0.25)] flex flex-col items-center">
        {/* Remote Header / Brand & Close */}
        <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-white/10">
          <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-sky-400">
            <Gamepad2 className="w-4 h-4" />
            <span>ANDROID & PLASMA REMOTE</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Minimize Remote"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Control Cluster: Home, Menu, Voice & Back */}
        <div className="w-full grid grid-cols-4 gap-1.5 px-1 mb-4">
          <button
            onClick={onHome}
            className="py-2.5 rounded-2xl bg-white/5 hover:bg-white/15 active:scale-95 text-zinc-300 hover:text-white border border-white/10 transition-all flex flex-col items-center gap-1 focus:outline-none focus:ring-1 focus:ring-sky-400"
            title="Home Screen"
          >
            <Home className="w-4 h-4 text-sky-400" />
            <span className="text-[9px] font-semibold text-zinc-400">HOME</span>
          </button>

          <button
            onClick={onToggleMenu}
            className="py-2.5 rounded-2xl bg-white/5 hover:bg-white/15 active:scale-95 text-zinc-300 hover:text-white border border-white/10 transition-all flex flex-col items-center gap-1 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            title="Toggle Navigation Menu (M / Android Menu)"
          >
            <Menu className="w-4 h-4 text-emerald-400" />
            <span className="text-[9px] font-semibold text-zinc-400">MENU</span>
          </button>

          <button
            onClick={onOpenSearch}
            className="py-2.5 rounded-2xl bg-white/5 hover:bg-white/15 active:scale-95 text-zinc-300 hover:text-white border border-white/10 transition-all flex flex-col items-center gap-1 focus:outline-none focus:ring-1 focus:ring-rose-400"
            title="Voice Search (Press /)"
          >
            <Mic className="w-4 h-4 text-rose-400" />
            <span className="text-[9px] font-semibold text-zinc-400">VOICE</span>
          </button>

          <button
            onClick={onBack}
            className="py-2.5 rounded-2xl bg-white/5 hover:bg-white/15 active:scale-95 text-zinc-300 hover:text-white border border-white/10 transition-all flex flex-col items-center gap-1 focus:outline-none focus:ring-1 focus:ring-amber-400"
            title="Back / Exit (Esc / Backspace)"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span className="text-[9px] font-semibold text-zinc-400">BACK</span>
          </button>
        </div>

        {/* Circular D-Pad Navigator */}
        <div className="relative w-44 h-44 rounded-full bg-gradient-to-b from-zinc-800/80 to-zinc-900/90 border-2 border-white/15 p-2 shadow-inner flex items-center justify-center my-2">
          {/* UP Button */}
          <button
            onClick={onDpadUp}
            className="absolute top-1 inset-x-0 mx-auto w-12 h-10 flex items-center justify-center text-zinc-300 hover:text-white active:scale-90 transition-transform focus:outline-none"
            title="D-Pad Up (ArrowUp)"
          >
            <ArrowUp className="w-6 h-6" />
          </button>

          {/* DOWN Button */}
          <button
            onClick={onDpadDown}
            className="absolute bottom-1 inset-x-0 mx-auto w-12 h-10 flex items-center justify-center text-zinc-300 hover:text-white active:scale-90 transition-transform focus:outline-none"
            title="D-Pad Down (ArrowDown)"
          >
            <ArrowDown className="w-6 h-6" />
          </button>

          {/* LEFT Button */}
          <button
            onClick={onDpadLeft}
            className="absolute left-1 inset-y-0 my-auto w-10 h-12 flex items-center justify-center text-zinc-300 hover:text-white active:scale-90 transition-transform focus:outline-none"
            title="D-Pad Left (ArrowLeft)"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          {/* RIGHT Button */}
          <button
            onClick={onDpadRight}
            className="absolute right-1 inset-y-0 my-auto w-10 h-12 flex items-center justify-center text-zinc-300 hover:text-white active:scale-90 transition-transform focus:outline-none"
            title="D-Pad Right (ArrowRight)"
          >
            <ArrowRight className="w-6 h-6" />
          </button>

          {/* CENTER OK / SELECT Button */}
          <button
            onClick={onSelect}
            className="w-18 h-18 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black text-sm tracking-wider shadow-lg shadow-sky-500/40 active:scale-90 transition-all flex items-center justify-center border border-white/30 focus:outline-none"
            title="OK / Select (Enter)"
          >
            OK
          </button>
        </div>

        {/* Media Transport Controls: Play/Pause, Rewind, Fast Forward */}
        <div className="w-full flex items-center justify-around mt-4 pt-3 border-t border-white/10">
          <button
            onClick={onRewind}
            className="p-3 rounded-full bg-white/5 hover:bg-white/15 active:scale-90 text-zinc-300 hover:text-white transition-all"
            title="Rewind 10s"
          >
            <Rewind className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            className="p-3.5 rounded-full bg-white text-zinc-950 hover:bg-sky-400 active:scale-90 shadow-md transition-all"
            title="Play / Pause (Space)"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={onFastForward}
            className="p-3 rounded-full bg-white/5 hover:bg-white/15 active:scale-90 text-zinc-300 hover:text-white transition-all"
            title="Fast Forward 10s"
          >
            <FastForward className="w-4 h-4" />
          </button>
        </div>

        {/* Volume & Mute Row */}
        <div className="w-full flex items-center justify-between px-3 mt-3">
          <button
            onClick={onMute}
            className="p-2.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Mute"
          >
            <VolumeX className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 bg-white/5 rounded-full p-1 border border-white/10">
            <button
              onClick={onVolumeDown}
              className="px-3 py-1 text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              title="Volume Down"
            >
              VOL -
            </button>
            <button
              onClick={onVolumeUp}
              className="px-3 py-1 text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              title="Volume Up"
            >
              VOL +
            </button>
          </div>
        </div>

        {/* Keyboard and Gamepad shortcut hint */}
        <div className="mt-3 text-[10px] text-zinc-500 font-mono text-center flex flex-col gap-0.5">
          <span>Remote / Keyboard: ↑ ↓ ← → | Enter | M (Menu) | Esc</span>
          <span className="text-zinc-600">Gamepad: D-Pad | A (OK) | B (Back) | Start/Y (Menu)</span>
        </div>
      </div>
    </div>
  );
};
