import { SHARED_PEER_LIBRARIES, type SharedPeerLibrary } from './tvMediaData';

const LIBRARIES_KEY = 'nascent_tv_peer_libraries_v1';
const META_KEY = 'nascent_tv_peer_meta_v1';

export type PeerRequest = {
  id: string;
  name: string;
  handle: string;
  initials: string;
  color: string;
  direction: 'incoming' | 'outgoing';
  library: string;
  sentAt: string;
  inviteCode?: string;
};

export type PeerShareMeta = {
  inviteCode: string;
  peerDiscovery: boolean;
  autoAcceptLanPeers: boolean;
  shareQuality: 'low' | 'med' | 'high';
  requests: PeerRequest[];
};

const DEFAULT_META: PeerShareMeta = {
  inviteCode: 'NV-7F2K-9QPM',
  peerDiscovery: true,
  autoAcceptLanPeers: false,
  shareQuality: 'high',
  requests: [
    {
      id: 'req-in-1',
      name: 'Jordan Lee',
      handle: '@jordan_l',
      initials: 'JL',
      color: 'bg-gradient-to-tr from-violet-500 to-fuchsia-600',
      direction: 'incoming',
      library: 'Wants access to your library',
      sentAt: '12m ago',
    },
    {
      id: 'req-in-2',
      name: 'Nova Media Lab',
      handle: '@nova_lab',
      initials: 'NM',
      color: 'bg-gradient-to-tr from-cyan-500 to-blue-600',
      direction: 'incoming',
      library: 'Wants access to your library',
      sentAt: '1h ago',
    },
    {
      id: 'req-out-1',
      name: 'Alex Remux Vault',
      handle: '@alex_r',
      initials: 'AR',
      color: 'bg-gradient-to-tr from-amber-500 to-orange-600',
      direction: 'outgoing',
      library: 'Pending access to Alex’s 4K Remux Vault',
      sentAt: '3h ago',
      inviteCode: 'PEER-ALEX-MESH',
    },
  ],
};

const AVATAR_COLORS = [
  'bg-gradient-to-tr from-sky-500 to-blue-600',
  'bg-gradient-to-tr from-amber-500 to-rose-600',
  'bg-gradient-to-tr from-emerald-500 to-teal-600',
  'bg-gradient-to-tr from-purple-500 to-pink-600',
  'bg-gradient-to-tr from-indigo-500 to-violet-600',
  'bg-gradient-to-tr from-cyan-500 to-blue-600',
];

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadPeerLibraries(): SharedPeerLibrary[] {
  const parsed = safeParse<SharedPeerLibrary[]>(
    typeof localStorage !== 'undefined' ? localStorage.getItem(LIBRARIES_KEY) : null
  );
  if (Array.isArray(parsed) && parsed.length >= 0) {
    // Empty array is valid (user disconnected everyone)
    return parsed;
  }
  return [...SHARED_PEER_LIBRARIES];
}

export function savePeerLibraries(libraries: SharedPeerLibrary[]) {
  try {
    localStorage.setItem(LIBRARIES_KEY, JSON.stringify(libraries));
  } catch {
    /* ignore quota */
  }
}

export function loadPeerShareMeta(): PeerShareMeta {
  const parsed = safeParse<Partial<PeerShareMeta>>(
    typeof localStorage !== 'undefined' ? localStorage.getItem(META_KEY) : null
  );
  if (!parsed) return { ...DEFAULT_META, requests: [...DEFAULT_META.requests] };
  return {
    inviteCode: parsed.inviteCode || DEFAULT_META.inviteCode,
    peerDiscovery: parsed.peerDiscovery ?? DEFAULT_META.peerDiscovery,
    autoAcceptLanPeers: parsed.autoAcceptLanPeers ?? DEFAULT_META.autoAcceptLanPeers,
    shareQuality: parsed.shareQuality || DEFAULT_META.shareQuality,
    requests: Array.isArray(parsed.requests) ? parsed.requests : [...DEFAULT_META.requests],
  };
}

export function savePeerShareMeta(meta: PeerShareMeta) {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch {
    /* ignore */
  }
}

export function generateInviteCode(prefix = 'NV'): string {
  const a = Math.random().toString(36).slice(2, 6).toUpperCase();
  const b = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${a}-${b}`;
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'PP';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
}

/** Build a new connected peer library entry from an invite / display name. */
export function createPeerLibrary(opts: {
  name: string;
  inviteCode?: string;
  owner?: string;
}): SharedPeerLibrary {
  const name = opts.name.trim() || 'Peer Library';
  const owner = opts.owner?.trim() || name;
  const handleSeed = (opts.inviteCode || name).toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 12);
  const ping = 12 + Math.floor(Math.random() * 40);
  const mbps = 40 + Math.floor(Math.random() * 90);
  const sampleMedia = SHARED_PEER_LIBRARIES.flatMap((p) => p.media).slice(0, 4);

  return {
    id: `peer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.includes('Vault') || name.includes('Library') || name.includes('Archive')
      ? name
      : `${name}'s Shared Library`,
    owner,
    ownerHandle: `@${handleSeed || 'peer'}`,
    avatarInitials: initialsFromName(owner),
    avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    itemCount: Math.max(sampleMedia.length, 12 + Math.floor(Math.random() * 80)),
    status: 'online',
    pingMs: ping,
    bandwidth: `${mbps} Mbps Direct P2P`,
    connectionType: 'Direct LAN P2P',
    storageShared: `${(1.5 + Math.random() * 8).toFixed(1)} TB Shared`,
    location: 'Trusted Peer Mesh',
    description: opts.inviteCode
      ? `Connected via invite ${opts.inviteCode}`
      : 'Manually added trusted peer library share.',
    media: sampleMedia.map((m, i) => ({
      ...m,
      id: `${m.id}-peer-${Date.now()}-${i}`,
    })),
  };
}

export function peerAlreadyConnected(
  libraries: SharedPeerLibrary[],
  nameOrCode: string
): SharedPeerLibrary | undefined {
  const q = nameOrCode.trim().toLowerCase();
  return libraries.find(
    (p) =>
      p.name.toLowerCase() === q ||
      p.owner.toLowerCase() === q ||
      p.ownerHandle.toLowerCase() === q ||
      p.description.toLowerCase().includes(q) ||
      p.id.toLowerCase() === q
  );
}
