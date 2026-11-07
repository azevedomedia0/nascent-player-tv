/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Wired to POST /api/watchparty/* — hostToken stays in component memory only
 * (never localStorage, never rendered). Joiners never receive it.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Users, Play, Copy, Check, Send, LogIn } from 'lucide-react';
import { FeaturedMovie } from '../../lib/types';
import { apiFetch } from '../../lib/apiAuth';

interface TvWatchPartyProps {
  movie: FeaturedMovie;
  onStartParty: () => void;
  onClose: () => void;
}

interface PartyParticipant {
  id: string;
  name: string;
  lastSeen: number;
}

interface PartyChatMessage {
  id: string;
  userName: string;
  text: string;
  timestamp: string;
}

interface PartyRoom {
  roomId: string;
  hostId: string;
  hostName: string;
  currentMediaId: string | null;
  playbackState: 'playing' | 'paused';
  currentTime: number;
  lastSyncTime: number;
  participants: PartyParticipant[];
  chat: PartyChatMessage[];
}

function displayInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function makeClientId(): string {
  try {
    return `client_${crypto.randomUUID().slice(0, 10)}`;
  } catch {
    return `client_${Date.now().toString(36)}`;
  }
}

export const TvWatchParty: React.FC<TvWatchPartyProps> = ({
  movie,
  onStartParty,
  onClose,
}) => {
  const [mode, setMode] = useState<'lobby' | 'create' | 'join'>('lobby');
  const [displayName, setDisplayName] = useState('Host');
  const [joinCode, setJoinCode] = useState('');
  const [room, setRoom] = useState<PartyRoom | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newMsg, setNewMsg] = useState('');
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string; left: number }[]>([]);

  // Host token: memory only — never persisted, never rendered.
  const hostTokenRef = useRef<string | null>(null);
  const userIdRef = useRef(makeClientId());
  const isHostRef = useRef(false);

  const applyRoom = useCallback((next: PartyRoom) => {
    // Defensive: strip hostToken if a buggy server ever returns it.
    const { hostToken: _drop, ...safe } = next as PartyRoom & { hostToken?: string };
    void _drop;
    setRoom(safe as PartyRoom);
  }, []);

  const createRoom = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch('/api/watchparty/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostName: displayName.trim() || 'Host',
          hostId: userIdRef.current,
          currentMediaId: movie.id,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Create failed (${res.status})`);
      }
      const data = await res.json();
      if (typeof data.hostToken === 'string' && data.hostToken) {
        hostTokenRef.current = data.hostToken;
        isHostRef.current = true;
      }
      const { hostToken: _t, ...publicFields } = data;
      void _t;
      applyRoom(publicFields as PartyRoom);
      setMode('create');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setBusy(false);
    }
  };

  const joinRoom = async () => {
    const code = joinCode.trim();
    if (!code) {
      setError('Enter a room code');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch('/api/watchparty/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: code,
          userId: userIdRef.current,
          userName: displayName.trim() || 'Watcher',
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Join failed (${res.status})`);
      }
      const data = await res.json();
      hostTokenRef.current = null;
      isHostRef.current = false;
      applyRoom(data as PartyRoom);
      setMode('join');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
    } finally {
      setBusy(false);
    }
  };

  // Poll sync while in a room
  useEffect(() => {
    if (!room?.roomId) return;

    let cancelled = false;
    const tick = async () => {
      try {
        const body: Record<string, unknown> = {
          userId: userIdRef.current,
          userName: displayName.trim() || (isHostRef.current ? 'Host' : 'Watcher'),
        };
        if (isHostRef.current && hostTokenRef.current) {
          body.hostToken = hostTokenRef.current;
          body.playbackState = room.playbackState;
          body.currentTime = room.currentTime;
          body.currentMediaId = movie.id;
        }
        const res = await apiFetch(`/api/watchparty/${encodeURIComponent(room.roomId)}/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!cancelled) applyRoom(data as PartyRoom);
      } catch {
        // Keep polling; transient network errors are fine
      }
    };

    tick();
    const id = setInterval(tick, 2000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [room?.roomId, room?.playbackState, room?.currentTime, movie.id, displayName, applyRoom]);

  // Clear host token on unmount
  useEffect(() => {
    return () => {
      hostTokenRef.current = null;
    };
  }, []);

  const handleCopyCode = () => {
    if (!room?.roomId) return;
    navigator.clipboard?.writeText(room.roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmoji = async (emoji: string) => {
    const newEmoji = { id: Date.now(), emoji, left: 30 + Math.random() * 40 };
    setFloatingEmojis((prev) => [...prev, newEmoji]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e.id !== newEmoji.id));
    }, 2500);
    if (!room?.roomId) return;
    try {
      await apiFetch(`/api/watchparty/${encodeURIComponent(room.roomId)}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: displayName.trim() || 'Watcher',
          text: emoji,
        }),
      });
    } catch {
      // Cheer is best-effort
    }
  };

  const handleSendMessage = async () => {
    if (!newMsg.trim() || !room?.roomId) return;
    const text = newMsg.trim();
    setNewMsg('');
    try {
      const res = await apiFetch(`/api/watchparty/${encodeURIComponent(room.roomId)}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: displayName.trim() || 'Watcher',
          text,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || 'Chat send failed');
        return;
      }
      // Sync will pick up the message; optimistic append:
      const msg = await res.json();
      setRoom((prev) =>
        prev
          ? { ...prev, chat: [...(prev.chat || []), msg].slice(-50) }
          : prev
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chat send failed');
    }
  };

  const participants = room?.participants ?? [];
  const messages = room?.chat ?? [];

  return (
    <div className="fixed inset-0 z-50 bg-[#131313]/95 backdrop-blur-2xl flex items-center justify-center p-8 select-none animate-in fade-in duration-200">
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

      <div className="relative w-full max-w-4xl bg-zinc-950/90 border border-white/20 rounded-[32px] p-8 lg:p-10 shadow-2xl flex flex-col gap-6">
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
                Synchronized session for {movie.title}
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

        {error && (
          <div className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
            {error}
          </div>
        )}

        {!room && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Display name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={50}
                className="mt-1.5 w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-sm focus:outline-none focus:border-sky-400"
                placeholder="Your name"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={createRoom}
                disabled={busy}
                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-sm disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                {busy && mode !== 'join' ? 'Creating…' : 'Create room'}
              </button>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ROOM_XXXXXX"
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-white/10 border border-white/15 text-white text-sm font-mono focus:outline-none focus:border-sky-400"
                />
                <button
                  onClick={joinRoom}
                  disabled={busy}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold border border-white/15 disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  Join
                </button>
              </div>
            </div>
            <p className="text-[11px] text-zinc-500">
              Requires the API token from Settings → Server &amp; LAN. Host token never leaves this browser tab&apos;s memory.
            </p>
          </div>
        )}

        {room && (
          <>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-sky-950/50 to-indigo-950/50 border border-sky-400/30">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-sky-300 uppercase tracking-wider">
                  Room code
                </span>
                <span className="font-mono font-black text-2xl text-white tracking-widest">
                  {room.roomId}
                </span>
                <span className="text-[10px] text-zinc-400 mt-1">
                  {isHostRef.current ? 'You are the host' : `Hosted by ${room.hostName}`}
                  {' · '}
                  {room.playbackState} @ {Math.floor(room.currentTime)}s
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Connected ({participants.length})
                </h3>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                  {participants.length === 0 && (
                    <p className="text-xs text-zinc-500">Waiting for friends…</p>
                  )}
                  {participants.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
                          {displayInitials(p.name)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-white">
                            {p.name}
                            {p.id === room.hostId ? ' (Host)' : ''}
                          </span>
                          <span className="text-[10px] text-zinc-400">Live</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                        Active
                      </span>
                    </div>
                  ))}
                </div>

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

              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Watch Party Feed
                </h3>
                <div className="h-44 overflow-y-auto no-scrollbar flex flex-col gap-2 p-3 rounded-2xl bg-black/40 border border-white/10">
                  {messages.length === 0 && (
                    <p className="text-xs text-zinc-500">No messages yet.</p>
                  )}
                  {messages.map((m) => (
                    <div key={m.id} className="text-xs">
                      <span className="font-bold text-sky-400 mr-1.5">{m.userName}:</span>
                      <span className="text-zinc-200">{m.text}</span>
                      <span className="text-zinc-600 ml-1.5">{m.timestamp}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Send a message to the room..."
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

            <div className="flex justify-end pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  onStartParty();
                  onClose();
                }}
                className="flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 text-black font-extrabold text-base shadow-xl shadow-sky-500/30 hover:scale-105 active:scale-95 transition-all"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>{isHostRef.current ? 'Start Synced Watch' : 'Join Playback'}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
