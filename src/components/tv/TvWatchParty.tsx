import React, { useState } from 'react';
import { Users, Play, Copy, Check, Radio, MessageSquare, Send, Sparkles, Smile, Flame, Heart } from 'lucide-react';
import { FeaturedMovie } from './TvHeroBillboard';

interface TvWatchPartyProps {
  movie: FeaturedMovie;
  onStartParty: () => void;
  onClose: () => void;
}

export const TvWatchParty: React.FC<TvWatchPartyProps> = ({
  movie,
  onStartParty,
  onClose,
}) => {
  const [roomCode] = useState(() => 'NASCENT-' + Math.floor(1000 + Math.random() * 9000));
  const [copied, setCopied] = useState(false);
  const [participants, setParticipants] = useState([
    { id: '1', name: 'Steven_HQ (Host)', avatar: 'SA', status: 'Ready' },
    { id: '2', name: 'Sophia_Streams', avatar: 'SS', status: 'Ready' },
    { id: '3', name: 'Retro_Jack', avatar: 'RJ', status: 'Syncing' },
  ]);
  const [messages, setMessages] = useState([
    { id: '1', sender: 'Sophia_Streams', text: 'Ready for 4K Atmos! Soundbar is set.', time: 'Just now' },
    { id: '2', sender: 'Retro_Jack', text: 'Connecting from living room Shield TV.', time: '1m ago' },
  ]);
  const [newMsg, setNewMsg] = useState('');
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string; left: number }[]>([]);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmoji = (emoji: string) => {
    const newEmoji = { id: Date.now(), emoji, left: 30 + Math.random() * 40 };
    setFloatingEmojis((prev) => [...prev, newEmoji]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e.id !== newEmoji.id));
    }, 2500);
  };

  const handleSendMessage = () => {
    if (!newMsg.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        sender: 'Steven_HQ',
        text: newMsg.trim(),
        time: 'Just now',
      },
    ]);
    setNewMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#131313]/95 backdrop-blur-2xl flex items-center justify-center p-8 select-none animate-in fade-in duration-200">
      {/* Floating Reaction Emojis Animation */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {floatingEmojis.map((e) => (
          <div
            key={e.id}
            className="absolute bottom-12 text-4xl animate-bounce transition-all duration-1000"
            style={{
              left: `${e.left}%`,
              animation: 'floatUp 2.5s ease-out forwards',
            }}
          >
            {e.emoji}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(0.8); opacity: 1; }
          100% { transform: translateY(-400px) scale(1.4); opacity: 0; }
        }
      `}</style>

      {/* Main TV Watch Party Modal */}
      <div className="relative w-full max-w-4xl bg-zinc-950/90 border border-white/20 rounded-[32px] p-8 lg:p-10 shadow-2xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display font-bold text-2xl text-white">
                Leanback Watch Party Lobby
              </h2>
              <span className="text-xs text-zinc-400">
                Synchronized 4K streaming session for {movie.title}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm"
          >
            Close
          </button>
        </div>

        {/* Room Code Strip */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-sky-950/50 to-indigo-950/50 border border-sky-400/30">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-sky-300 uppercase tracking-wider">
              Google TV Room Code
            </span>
            <span className="font-mono font-black text-2xl text-white tracking-widest">
              {roomCode}
            </span>
          </div>

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs transition-all shadow-md"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Code Copied' : 'Share Room Code'}</span>
          </button>
        </div>

        {/* Content Layout: Left Participants, Right Chat & Reactions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Participants list */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Connected Friends ({participants.length})
            </h3>
            <div className="flex flex-col gap-2">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
                      {p.avatar}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white">{p.name}</span>
                      <span className="text-[10px] text-zinc-400">Android TV Client</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                    {p.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Cheer Emoji Bar */}
            <div className="mt-2 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-around">
              {['🍿', '🔥', '🎉', '❤️', '🚀'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleSendEmoji(emoji)}
                  className="text-2xl hover:scale-125 active:scale-95 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Live Room Message Feed */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Watch Party Feed
            </h3>
            <div className="h-44 overflow-y-auto no-scrollbar flex flex-col gap-2 p-3 rounded-2xl bg-black/40 border border-white/10">
              {messages.map((m) => (
                <div key={m.id} className="text-xs">
                  <span className="font-bold text-sky-400 mr-1.5">{m.sender}:</span>
                  <span className="text-zinc-200">{m.text}</span>
                </div>
              ))}
            </div>

            {/* Message input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Send a cheer to the room..."
                className="flex-1 px-4 py-2.5 rounded-full bg-white/10 border border-white/15 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-sky-400"
              />
              <button
                onClick={handleSendMessage}
                className="p-2.5 rounded-full bg-sky-500 hover:bg-sky-400 text-black transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Start Synced Watch Button */}
        <div className="flex justify-end pt-4 border-t border-white/10">
          <button
            onClick={() => {
              onStartParty();
              onClose();
            }}
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 text-black font-extrabold text-base shadow-xl shadow-sky-500/30 hover:scale-105 active:scale-95 transition-all"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Start Synced Watch</span>
          </button>
        </div>
      </div>
    </div>
  );
};
