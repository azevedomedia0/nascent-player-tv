import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MessageSquare, Radio, Send, X, WifiOff, Users } from 'lucide-react';
import { apiFetch } from '../../lib/apiAuth';

const DEFAULT_TOPIC = '/iina-player/1/lounge/proto';

type WakuWireMessage = {
  payload: string;
  contentTopic: string;
  version: number;
  timestamp: number;
};

type ChatLine = {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
  mine: boolean;
};

type PeerRow = { id: string; latencyMs: number | null; status: string };

interface TvWakuChatProps {
  isOpen: boolean;
  onClose: () => void;
}

function decodePayload(payload: string): { text: string; sender: string } {
  try {
    const json = JSON.parse(atob(payload));
    return {
      text: String(json.text || json.message || ''),
      sender: String(json.senderName || json.sender || 'peer'),
    };
  } catch {
    try {
      return { text: atob(payload), sender: 'peer' };
    } catch {
      return { text: payload, sender: 'peer' };
    }
  }
}

function encodePayload(text: string, sender: string): string {
  return btoa(JSON.stringify({ text, senderName: sender, timestamp: Date.now() }));
}

export const TvWakuChat: React.FC<TvWakuChatProps> = ({ isOpen, onClose }) => {
  const [online, setOnline] = useState<boolean | null>(null);
  const [peerCount, setPeerCount] = useState(0);
  const [peerId, setPeerId] = useState<string>('');
  const [messages, setMessages] = useState<ChatLine[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayName] = useState(() => `TV-${Math.floor(1000 + Math.random() * 9000)}`);
  const esRef = useRef<EventSource | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const ingestWire = useCallback((wire: WakuWireMessage, mine = false) => {
    const { text, sender } = decodePayload(wire.payload);
    if (!text) return;
    setMessages((prev) => {
      const id = `${wire.timestamp}-${wire.payload.slice(0, 12)}`;
      if (prev.some((m) => m.id === id)) return prev;
      return [
        ...prev,
        {
          id,
          text,
          sender: mine ? displayName : sender,
          timestamp: wire.timestamp || Date.now(),
          mine,
        },
      ];
    });
  }, [displayName]);

  const refreshStatus = useCallback(async () => {
    try {
      const infoRes = await apiFetch('/api/waku/v2/debug/v1/info');
      if (infoRes.status === 503) {
        setOnline(false);
        setError('Waku offline');
        return;
      }
      if (!infoRes.ok) throw new Error('info failed');
      const info = await infoRes.json();
      setOnline(true);
      setError(null);
      setPeerId(info.peerId || '');
      setPeerCount(Number(info.peerCount) || 0);

      const peersRes = await apiFetch('/api/waku/v2/peers');
      if (peersRes.ok) {
        const peers = (await peersRes.json()) as PeerRow[];
        setPeerCount(peers.length);
      }

      await apiFetch('/api/waku/v2/filter/v1/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentFilters: [DEFAULT_TOPIC] }),
      });

      const histRes = await apiFetch(
        `/api/waku/v2/relay/v1/messages/${encodeURIComponent(DEFAULT_TOPIC)}`
      );
      if (histRes.ok) {
        const hist = (await histRes.json()) as WakuWireMessage[];
        hist.forEach((m) => ingestWire(m));
      }
    } catch {
      setOnline(false);
      setError('Waku offline');
    }
  }, [ingestWire]);

  useEffect(() => {
    if (!isOpen) return;
    void refreshStatus();

    const es = new EventSource('/api/waku/v2/stream');
    esRef.current = es;
    es.onmessage = (ev) => {
      try {
        const wire = JSON.parse(ev.data) as WakuWireMessage;
        if (wire.contentTopic === DEFAULT_TOPIC || !wire.contentTopic) {
          ingestWire(wire);
        }
      } catch {
        // ignore
      }
    };
    es.onerror = () => {
      // EventSource retries; mark offline if info also fails
      void refreshStatus();
    };

    const poll = window.setInterval(() => void refreshStatus(), 15_000);
    return () => {
      window.clearInterval(poll);
      es.close();
      esRef.current = null;
    };
  }, [isOpen, refreshStatus, ingestWire]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async () => {
    if (!draft.trim() || sending || online === false) return;
    setSending(true);
    setError(null);
    const text = draft.trim();
    const payload = encodePayload(text, displayName);
    const wire: WakuWireMessage = {
      payload,
      contentTopic: DEFAULT_TOPIC,
      version: 0,
      timestamp: Date.now(),
    };
    try {
      const res = await apiFetch(
        `/api/waku/v2/relay/v1/messages/${encodeURIComponent(DEFAULT_TOPIC)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(wire),
        }
      );
      if (res.status === 503) {
        setOnline(false);
        setError('Waku offline');
        return;
      }
      if (res.status === 401) {
        setError('API token required to publish — set it in Settings → Server & LAN');
        return;
      }
      if (res.status === 413) {
        setError('Message too large (64 KB limit)');
        return;
      }
      if (!res.ok) {
        setError('Publish failed');
        return;
      }
      setDraft('');
      ingestWire(wire, true);
    } catch {
      setError('Publish failed');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 lg:p-8 select-none animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg h-[min(640px,85vh)] bg-[#0c0c11]/98 border border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
              <Radio className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-bold text-sm text-white">Waku Lounge</h2>
              <p className="text-[10px] text-zinc-500 font-mono truncate">{DEFAULT_TOPIC}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-2 border-b border-white/5 flex items-center gap-3 text-[11px]">
          {online === false ? (
            <span className="inline-flex items-center gap-1.5 text-rose-300 font-semibold">
              <WifiOff className="w-3.5 h-3.5" />
              Waku offline
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-emerald-300 font-semibold">
              <Users className="w-3.5 h-3.5" />
              {peerCount} peer{peerCount === 1 ? '' : 's'}
            </span>
          )}
          {peerId && (
            <span className="text-zinc-500 font-mono truncate" title={peerId}>
              {peerId.slice(0, 12)}…
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3 space-y-2.5">
          {messages.length === 0 && online !== false && (
            <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-zinc-500 text-center gap-2">
              <MessageSquare className="w-7 h-7 text-zinc-600" />
              <p className="text-xs">No messages on this topic yet</p>
              <p className="text-[10px] max-w-[240px]">
                Messages publish over the real Waku network (LightPush) and arrive via Filter/SSE.
              </p>
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 border text-sm ${
                  m.mine
                    ? 'bg-sky-500/20 border-sky-400/30 text-sky-50'
                    : 'bg-white/5 border-white/10 text-zinc-100'
                }`}
              >
                <div className="text-[10px] font-semibold text-zinc-400 mb-0.5">{m.sender}</div>
                <p className="leading-snug whitespace-pre-wrap">{m.text}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {error && (
          <div className="mx-4 mb-2 px-3 py-2 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-[11px]">
            {error}
          </div>
        )}

        <form
          className="p-4 border-t border-white/10 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSend();
          }}
        >
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={online === false}
            placeholder={online === false ? 'Waku offline' : 'Message the lounge…'}
            className="flex-1 h-10 px-4 rounded-full bg-black/40 border border-white/15 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-sky-400 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!draft.trim() || sending || online === false}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-black cursor-pointer"
            aria-label="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
