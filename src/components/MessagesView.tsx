import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  X,
  Phone,
  AtSign,
  Paperclip,
  Send,
  FileText,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  Check,
  CheckCheck,
  Globe,
  Film,
  Play,
  Star,
  Cpu,
  SquarePen,
  Mail,
  Smile,
  Shield,
  Radio,
  Network,
  Trash2
} from 'lucide-react';
import { MediaItem } from '../types';
import {
  globalWakuEngine,
  WakuNodeTelemetry,
  DecodedWakuMessage
} from '../lib/wakuEngine';

/**
 * Format any timestamp string into 12-hour AM/PM format (e.g. "6:28 PM")
 */
export const formatMessageTime = (timeStr?: string): string => {
  if (!timeStr) return '';
  const trimmed = timeStr.trim();
  if (/am|pm/i.test(trimmed)) {
    return trimmed;
  }
  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    let hour = parseInt(match24[1], 10);
    const minute = match24[2];
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  }
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
  return trimmed;
};

export const getAmPmTime = (date: Date = new Date()): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export interface MessageReaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

export interface ChatMessageItem {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderColor?: string;
  isMe: boolean;
  text?: string;
  image?: string;
  timestamp: string;
  sharedMedia?: MediaItem;
  reactions?: MessageReaction[];
  wakuHash?: string;
  contentTopic?: string;
  isEphemeral?: boolean;
}

export interface SharedFileItem {
  id: string;
  name: string;
  date: string;
  type: 'pdf' | 'docx' | 'xlsx' | 'pptx';
  size?: string;
}

export interface SharedPhotoItem {
  id: string;
  url: string;
  title: string;
}

export interface SharedVoiceItem {
  id: string;
  title: string;
  duration: string;
  date: string;
}

export interface Conversation {
  id: string;
  name: string;
  username?: string;
  role?: string;
  address?: string;
  phone?: string;
  email?: string;
  type: 'channel' | 'direct';
  avatar: string;
  avatarColor?: string;
  status?: 'Online' | 'Idle' | 'Offline';
  watching?: string | null;
  unreadCount: number;
  lastMessageText: string;
  lastMessageTime: string;
  contentTopic: string;
  messages: ChatMessageItem[];
  sharedFiles?: SharedFileItem[];
  sharedPhotos?: SharedPhotoItem[];
  sharedVoices?: SharedVoiceItem[];
}

interface MessagesViewProps {
  friends: Array<{ id: string; name: string; status: string; avatar: string; watching: string | null }>;
  mediaItems: MediaItem[];
  onPlayMedia: (item: MediaItem) => void;
  onOpenMediaDetail: (item: MediaItem) => void;
  onStartWatchParty?: (item?: MediaItem) => void;
  accentColor?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
  onUnreadChange?: (totalUnread: number) => void;
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'peer-kayode',
    name: 'Kayode Chun',
    username: '@kayode_sound',
    role: 'Lead Audio Engineer',
    address: '190 Silicon Blvd',
    phone: '(555) 441-9012',
    email: 'kayode.chun@soundstage.io',
    type: 'direct',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=280&auto=format&fit=crop',
    status: 'Online',
    watching: 'Spatial Audio Lab',
    unreadCount: 0,
    lastMessageText: 'You: 8:30 PM',
    lastMessageTime: 'Jun 04',
    contentTopic: '/iina-player/1/direct-kayode/proto',
    messages: [
      {
        id: 'msg-kc0',
        senderId: 'kayode',
        senderName: 'Kayode Chun',
        senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=280&auto=format&fit=crop',
        isMe: false,
        text: 'The Dolby Atmos 7.1 mixdown is finished! Check out the master files below.',
        timestamp: '8:24 PM',
        wakuHash: '0x33aa0120',
        contentTopic: '/iina-player/1/direct-kayode/proto'
      },
      {
        id: 'msg-kc1',
        senderId: 'me',
        senderName: 'You',
        senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
        isMe: true,
        text: 'Let us sync up around 8:30 PM for the 7.1 surround sound test.',
        timestamp: '8:30 PM',
        wakuHash: '0x33aa0122',
        contentTopic: '/iina-player/1/direct-kayode/proto'
      }
    ],
    sharedFiles: [
      { id: 'f1', name: 'DolbyAtmos_7_1_Master.pdf', date: '04 Jun 2024 20:30', type: 'pdf', size: '3.4 MB' },
      { id: 'f2', name: 'AcousticCalibration.xlsx', date: '03 Jun 2024 16:15', type: 'xlsx', size: '1.1 MB' },
      { id: 'f3', name: 'SpatialAudio_Notes.docx', date: '01 Jun 2024 11:20', type: 'docx', size: '210 KB' },
      { id: 'f4', name: 'DSP_Equalizer_Profile.pptx', date: '28 May 2024 14:00', type: 'pptx', size: '8.2 MB' }
    ],
    sharedPhotos: [
      { id: 'p1', url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600', title: 'Studio Mixing Console' },
      { id: 'p2', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600', title: 'Acoustic Soundproofing' },
      { id: 'p3', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600', title: 'Concert Stage Rig' }
    ]
  },
  {
    id: 'peer-emilie',
    name: 'Emilie Walton',
    username: '@emilie_w',
    role: 'Art Lead',
    address: '14 Boulevard St',
    phone: '(555) 782-9912',
    email: 'emilie.w@reed.co',
    type: 'direct',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=280&auto=format&fit=crop',
    status: 'Offline',
    watching: null,
    unreadCount: 2,
    lastMessageText: 'https://dribbble.com/shots/21...',
    lastMessageTime: 'Jun 02',
    contentTopic: '/iina-player/1/direct-emilie/proto',
    messages: [
      {
        id: 'msg-ew1',
        senderId: 'emilie',
        senderName: 'Emilie Walton',
        senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=280&auto=format&fit=crop',
        isMe: false,
        text: 'Check this clean player palette: https://dribbble.com/shots/2104829',
        timestamp: '11:24 AM',
        wakuHash: '0xee1290bb',
        contentTopic: '/iina-player/1/direct-emilie/proto'
      }
    ]
  },
  {
    id: 'peer-seiguys',
    name: 'S.E.I Guys',
    username: '@seinetwork',
    role: 'P2P Network Core',
    address: 'Decentralized Waku Mesh',
    phone: '(555) 902-1133',
    email: 'mesh@sei.network',
    type: 'channel',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=280&auto=format&fit=crop',
    status: 'Online',
    watching: 'Node Synchronization',
    unreadCount: 0,
    lastMessageText: 'You: No thanks',
    lastMessageTime: 'May 29',
    contentTopic: '/iina-player/1/sei-network/proto',
    messages: [
      {
        id: 'msg-sei1',
        senderId: 'me',
        senderName: 'You',
        senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
        isMe: true,
        text: 'No thanks, we have already established our Waku LightPush relay.',
        timestamp: '2:15 PM',
        wakuHash: '0x09ff44b1',
        contentTopic: '/iina-player/1/sei-network/proto'
      }
    ]
  },
  {
    id: 'peer-marcos',
    name: 'Marcos Helios',
    username: '@helios_vfx',
    role: 'VFX Supervisor',
    address: '900 Hollywood Way',
    phone: '(555) 301-4490',
    email: 'helios@vfx.studio',
    type: 'direct',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=280&auto=format&fit=crop',
    status: 'Idle',
    watching: 'Big Buck Bunny 4K',
    unreadCount: 0,
    lastMessageText: 'You: How To Boost my buss...',
    lastMessageTime: 'May 27',
    contentTopic: '/iina-player/1/direct-marcos/proto',
    messages: []
  },
  {
    id: 'peer-marisa',
    name: 'Marisa We.Si',
    username: '@marisa_wesi',
    role: 'Art Historian',
    address: '22 Louvre Way',
    phone: '(555) 819-2231',
    email: 'marisa.wesi@reed.co',
    type: 'direct',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=280&auto=format&fit=crop',
    status: 'Online',
    watching: null,
    unreadCount: 0,
    lastMessageText: 'Nine Features Of Ancient art',
    lastMessageTime: 'May 27',
    contentTopic: '/iina-player/1/direct-marisa/proto',
    messages: []
  },
  {
    id: 'peer-haba',
    name: 'HABA Group',
    username: '@haba_studio',
    role: 'Production Studio',
    address: '400 Media District',
    phone: '(555) 678-0012',
    email: 'contact@haba.group',
    type: 'channel',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=280&auto=format&fit=crop',
    status: 'Offline',
    watching: null,
    unreadCount: 0,
    lastMessageText: 'Oh.. last time checked by Emani',
    lastMessageTime: 'May 22',
    contentTopic: '/iina-player/1/haba-group/proto',
    messages: []
  },
  {
    id: 'peer-pablo',
    name: 'Pablo Po',
    username: '@pablopo',
    role: 'Frontend Architect',
    address: '12 Code Lane',
    phone: '(555) 912-3301',
    email: 'pablo.po@open.dev',
    type: 'direct',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=280&auto=format&fit=crop',
    status: 'Idle',
    watching: null,
    unreadCount: 0,
    lastMessageText: 'You: Yes, I have done it on ...',
    lastMessageTime: 'May 21',
    contentTopic: '/iina-player/1/direct-pablo/proto',
    messages: []
  },
  {
    id: 'peer-sena',
    name: 'Sena Perez',
    username: '@sena_color',
    role: 'Colorist',
    address: '50 Sunset Blvd',
    phone: '(555) 332-9019',
    email: 'sena.p@post.net',
    type: 'direct',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=280&auto=format&fit=crop',
    status: 'Offline',
    watching: null,
    unreadCount: 0,
    lastMessageText: 'You: Good luck',
    lastMessageTime: 'May 16',
    contentTopic: '/iina-player/1/direct-sena/proto',
    messages: []
  }
];

export const MessagesView: React.FC<MessagesViewProps> = ({
  friends = [],
  mediaItems,
  onPlayMedia,
  onOpenMediaDetail,
  onStartWatchParty,
  accentColor = '#ec4899',
  currentUserName = 'You',
  currentUserAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
  onUnreadChange
}) => {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    return [...INITIAL_CONVERSATIONS];
  });

  const [activeConvId, setActiveConvId] = useState<string>(INITIAL_CONVERSATIONS[0]?.id || 'peer-kayode');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inputText, setInputText] = useState<string>('');
  const [activeSideTab, setActiveSideTab] = useState<'photo' | 'file'>('file');

  // Media share modal
  const [isShareMediaOpen, setIsShareMediaOpen] = useState<boolean>(false);
  const [mediaSearch, setMediaSearch] = useState<string>('');

  // Call simulation overlay
  const [isCalling, setIsCalling] = useState<'voice' | 'video' | null>(null);

  // New message modal
  const [isNewMessageOpen, setIsNewMessageOpen] = useState<boolean>(false);
  const [newRecipientSearch, setNewRecipientSearch] = useState<string>('');
  const messageInputRef = useRef<HTMLInputElement>(null);

  // Waku telemetry modal
  const [isWakuHudOpen, setIsWakuHudOpen] = useState<boolean>(false);
  const [wakuTelemetry, setWakuTelemetry] = useState<WakuNodeTelemetry>(globalWakuEngine.getTelemetry());

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to Waku telemetry and messages
  useEffect(() => {
    globalWakuEngine.init();

    const unsubStatus = globalWakuEngine.subscribeStatus((telemetry) => {
      setWakuTelemetry(telemetry);
    });

    const unsubMessages = globalWakuEngine.subscribeAll((decoded: DecodedWakuMessage) => {
      handleIncomingWakuMessage(decoded);
    });

    return () => {
      unsubStatus();
      unsubMessages();
    };
  }, []);

  // Delete / selection mode for conversations
  const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);
  const [selectedConvIds, setSelectedConvIds] = useState<Set<string>>(new Set());

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  useEffect(() => {
    if (onUnreadChange) {
      onUnreadChange(totalUnread);
    }
  }, [totalUnread, onUnreadChange]);

  const fallbackConversation: Conversation = {
    id: '',
    name: 'No Conversation',
    username: '',
    role: '',
    address: '',
    phone: '',
    email: '',
    type: 'direct',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
    status: 'Offline',
    watching: null,
    unreadCount: 0,
    lastMessageText: '',
    lastMessageTime: '',
    contentTopic: '',
    messages: []
  };

  const activeConversation: Conversation =
    conversations.find(c => c.id === activeConvId) || conversations[0] || fallbackConversation;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvId, activeConversation?.messages?.length]);

  const handleIncomingWakuMessage = (decoded: DecodedWakuMessage) => {
    const payload = decoded.payload;
    const isMine = payload.senderName === currentUserName;

    setConversations(prev => {
      let targetConvIndex = prev.findIndex(c => c.contentTopic === decoded.contentTopic);

      if (targetConvIndex === -1) {
        const topicSlug = decoded.contentTopic.split('/').filter(Boolean).pop() || 'peer';
        const newConversation: Conversation = {
          id: `conv-${decoded.contentTopic.replace(/[^a-zA-Z0-9]/g, '_')}`,
          name: payload.senderName || `@${topicSlug}`,
          role: 'Decentralized Peer',
          address: 'P2P Mesh Node',
          phone: '(555) 000-WAKU',
          email: `${payload.senderName?.toLowerCase().replace(/\s+/g, '') || 'peer'}@waku.net`,
          type: 'direct',
          avatar: payload.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=280&auto=format&fit=crop',
          status: 'Online',
          unreadCount: isMine ? 0 : 1,
          lastMessageText: payload.text || 'Shared an item',
          lastMessageTime: 'Just now',
          contentTopic: decoded.contentTopic,
          messages: []
        };
        return [
          {
            ...newConversation,
            messages: [
              {
                id: `msg-${decoded.hash || Date.now()}`,
                senderId: payload.senderName || 'peer',
                senderName: payload.senderName || 'Anonymous Peer',
                senderAvatar: payload.senderAvatar || newConversation.avatar,
                isMe: isMine,
                text: payload.text,
                timestamp: payload.timestamp ? formatMessageTime(payload.timestamp) : getAmPmTime(),
                wakuHash: decoded.hash,
                contentTopic: decoded.contentTopic
              }
            ]
          },
          ...prev
        ];
      }

      return prev.map((conv, idx) => {
        if (idx !== targetConvIndex) return conv;

        const isCurrentlyActive = conv.id === activeConvId;
        const newMsg: ChatMessageItem = {
          id: `msg-${decoded.hash || Date.now()}`,
          senderId: payload.senderName || 'peer',
          senderName: payload.senderName || 'Peer',
          senderAvatar: payload.senderAvatar || conv.avatar,
          isMe: isMine,
          text: payload.text,
          timestamp: payload.timestamp ? formatMessageTime(payload.timestamp) : getAmPmTime(),
          wakuHash: decoded.hash,
          contentTopic: decoded.contentTopic
        };

        return {
          ...conv,
          lastMessageText: payload.text || 'Sent message',
          lastMessageTime: 'Just now',
          unreadCount: isCurrentlyActive || isMine ? 0 : conv.unreadCount + 1,
          messages: [...conv.messages, newMsg]
        };
      });
    });
  };

  const handleSendMessage = (textToSend?: string, sharedMedia?: MediaItem) => {
    const content = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!content && !sharedMedia) return;

    const newMsg: ChatMessageItem = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      senderId: 'me',
      senderName: currentUserName || 'You',
      senderAvatar: currentUserAvatar,
      isMe: true,
      text: content,
      sharedMedia,
      timestamp: getAmPmTime(),
      wakuHash: `0x${Math.random().toString(16).substring(2, 10)}`,
      contentTopic: activeConversation.contentTopic
    };

    setConversations(prev =>
      prev.map(c => {
        if (c.id !== activeConversation.id) return c;
        return {
          ...c,
          lastMessageText: content || (sharedMedia ? `Shared ${sharedMedia.title}` : ''),
          lastMessageTime: 'Just now',
          messages: [...c.messages, newMsg]
        };
      })
    );

    // Relay over decentralized Waku engine
    globalWakuEngine.publishMessage(
      activeConversation.contentTopic,
      {
        id: newMsg.id,
        senderId: 'me',
        senderName: currentUserName,
        senderAvatar: currentUserAvatar,
        text: content,
        timestamp: newMsg.timestamp,
        sharedMedia
      },
      false
    );

    if (textToSend === undefined) {
      setInputText('');
    }
    setIsShareMediaOpen(false);

    // Simulated reply from peer if direct chat
    if (activeConversation.type === 'direct' && (content.toLowerCase().includes('feedback') || content.toLowerCase().includes('test') || content.toLowerCase().includes('audio') || content.toLowerCase().includes('sync'))) {
      setTimeout(() => {
        const replyMsg: ChatMessageItem = {
          id: `msg-reply-${Date.now()}`,
          senderId: activeConversation.id,
          senderName: activeConversation.name,
          senderAvatar: activeConversation.avatar,
          isMe: false,
          text: 'Sounds great! Everything is calibrated and running at peak fidelity.',
          timestamp: getAmPmTime(),
          wakuHash: `0x${Math.random().toString(16).substring(2, 10)}`,
          contentTopic: activeConversation.contentTopic
        };
        setConversations(prev =>
          prev.map(c =>
            c.id === activeConversation.id
              ? {
                  ...c,
                  lastMessageText: replyMsg.text || '',
                  lastMessageTime: 'Just now',
                  messages: [...c.messages, replyMsg]
                }
              : c
          )
        );
      }, 1400);
    }
  };

  const filteredConversations = conversations.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.role && c.role.toLowerCase().includes(q)) ||
      c.lastMessageText.toLowerCase().includes(q)
    );
  });

  const toggleSelectConv = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedConvIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedConvIds.size === filteredConversations.length && filteredConversations.length > 0) {
      setSelectedConvIds(new Set());
    } else {
      setSelectedConvIds(new Set(filteredConversations.map(c => c.id)));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedConvIds.size === 0) {
      setIsDeleteMode(false);
      return;
    }

    const remaining = conversations.filter(c => !selectedConvIds.has(c.id));
    setConversations(remaining);

    // If active conversation was deleted, select first remaining
    if (selectedConvIds.has(activeConvId)) {
      if (remaining.length > 0) {
        setActiveConvId(remaining[0].id);
      } else {
        setActiveConvId('');
      }
    }

    setSelectedConvIds(new Set());
    setIsDeleteMode(false);
  };

  const filteredMediaItems = mediaItems.filter(item => {
    if (!mediaSearch.trim()) return true;
    return item.title.toLowerCase().includes(mediaSearch.toLowerCase());
  });

  const availableFriends = friends.length > 0
    ? friends
    : [
        { id: 'sophia', name: 'Sophia Streams', status: 'Online', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=280&auto=format&fit=crop', watching: 'Master Live League' },
        { id: 'jack', name: 'Retro Jack', status: 'Idle', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=280&auto=format&fit=crop', watching: 'Retro Horizon Chase' },
        { id: 'alex', name: 'Alex Gamer', status: 'Online', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=280&auto=format&fit=crop', watching: 'Tears of Steel' },
        { id: 'elena', name: 'Elena VLC', status: 'Online', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=280&auto=format&fit=crop', watching: 'Sintel' }
      ];

  const handleSelectFriendForNewMessage = (friend: { id: string; name: string; avatar: string; status: string; watching: string | null }) => {
    const existing = conversations.find(c =>
      c.name.toLowerCase() === friend.name.toLowerCase() ||
      c.id === `peer-${friend.name.toLowerCase().replace(/\s+/g, '-')}`
    );

    if (existing) {
      setActiveConvId(existing.id);
    } else {
      const topicSlug = friend.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const newConv: Conversation = {
        id: `peer-${topicSlug}`,
        name: friend.name,
        username: `@${friend.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        role: 'Contact',
        address: 'Direct Node',
        phone: '(555) 012-3456',
        email: `${friend.name.toLowerCase().replace(/\s+/g, '')}@reed.co`,
        type: 'direct',
        avatar: friend.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=280&auto=format&fit=crop',
        status: (friend.status as any) || 'Online',
        watching: friend.watching,
        unreadCount: 0,
        lastMessageText: 'New direct chat initialized',
        lastMessageTime: 'Just now',
        contentTopic: `/iina-player/1/direct-${topicSlug}/proto`,
        messages: []
      };
      setConversations(prev => [newConv, ...prev]);
      setActiveConvId(newConv.id);
    }

    setIsNewMessageOpen(false);
    setNewRecipientSearch('');
    setTimeout(() => {
      messageInputRef.current?.focus();
    }, 120);
  };

  // Helper file icon renderer matching design
  const renderFileIcon = (type: SharedFileItem['type']) => {
    switch (type) {
      case 'pdf':
        return (
          <div className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/20 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-red-400" />
          </div>
        );
      case 'docx':
        return (
          <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-blue-400" />
          </div>
        );
      case 'xlsx':
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          </div>
        );
      case 'pptx':
        return (
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0">
            <FileCode className="w-4 h-4 text-amber-400" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
        );
    }
  };

  return (
    <div id="tab-messages" className="w-full h-full flex text-left font-sans bg-[#010105] text-zinc-200 select-none overflow-hidden">
      
      {/* ========================================================= */}
      {/* COLUMN 1: LEFT CONVERSATIONS LIST (matches app theme) */}
      {/* ========================================================= */}
      <div className="w-[300px] shrink-0 border-r border-white/5 flex flex-col bg-[#05060a] h-full">
        
        {/* Top Header: Current User Bar + Compose */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/5 bg-[#05060a]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src={currentUserAvatar}
                alt="You"
                className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#05060a]" />
            </div>
            <span className="text-xs font-semibold text-white tracking-wide truncate">
              {currentUserName || 'You'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-zinc-400">
            <button
              onClick={() => setIsNewMessageOpen(true)}
              className="p-1.5 rounded-lg hover:text-white hover:bg-white/5 transition cursor-pointer"
              title="New Message"
            >
              <SquarePen className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar matching the rest of the app */}
        <div className="px-3.5 py-3">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder={isDeleteMode ? "Filter conversations..." : "Search..."}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-8 pr-7 rounded-full bg-[#0b0d13] text-xs text-white placeholder-zinc-500 outline-none border border-white/5 focus:border-white/20 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-zinc-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {isDeleteMode && (
            <div className="flex items-center justify-between mt-2 px-1 text-[11px]">
              <span className="text-red-400 font-medium">Select conversations to delete</span>
              <button
                type="button"
                onClick={() => {
                  setIsDeleteMode(false);
                  setSelectedConvIds(new Set());
                }}
                className="text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
          {filteredConversations.length === 0 ? (
            <div className="py-12 px-4 text-center text-zinc-500 text-xs">
              No conversations found
            </div>
          ) : (
            filteredConversations.map(conv => {
              const isActive = conv.id === activeConvId;
              const isSelected = selectedConvIds.has(conv.id);
              return (
                <button
                  key={conv.id}
                  onClick={() => {
                    if (isDeleteMode) {
                      toggleSelectConv(conv.id);
                    } else {
                      setActiveConvId(conv.id);
                    }
                  }}
                  className={`w-full p-2.5 rounded-xl flex items-center gap-3 transition text-left cursor-pointer group ${
                    isDeleteMode && isSelected
                      ? 'bg-red-500/10 ring-1 ring-red-500/40 shadow-sm'
                      : isActive
                      ? 'bg-white/[0.08] shadow-sm'
                      : 'hover:bg-white/[0.03]'
                  }`}
                >
                  {/* Selection checkbox when in delete mode */}
                  {isDeleteMode && (
                    <div
                      onClick={(e) => toggleSelectConv(conv.id, e)}
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
                        isSelected
                          ? 'bg-red-500 border-red-500 text-white'
                          : 'border-white/20 bg-black/40 hover:border-white/40'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  )}

                  {/* Avatar with online dot */}
                  <div className="relative shrink-0">
                    <img
                      src={conv.avatar}
                      alt={conv.name}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10"
                    />
                    {conv.status && (
                      <span
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-[#05060a] ${
                          conv.status === 'Online'
                            ? 'bg-emerald-400'
                            : conv.status === 'Idle'
                            ? 'bg-amber-400'
                            : 'bg-zinc-500'
                        }`}
                      />
                    )}
                  </div>

                  {/* Name, Snippet & Timestamp */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                        {conv.name}
                      </span>
                      <span className="text-[10px] text-zinc-500 shrink-0 font-medium">
                        {conv.lastMessageTime}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] text-zinc-400 truncate">
                        {conv.lastMessageText}
                      </p>

                      {conv.unreadCount > 0 ? (
                        <span
                          className="px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white shrink-0 min-w-[16px] text-center"
                          style={{ backgroundColor: accentColor }}
                        >
                          {conv.unreadCount}
                        </span>
                      ) : (
                        <CheckCheck className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Bottom P2P Status Indicator & Delete Selection Action */}
        <div className="p-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500 bg-[#05060a]">
          {isDeleteMode ? (
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-1.5 hover:text-white transition cursor-pointer text-left"
              title={selectedConvIds.size === filteredConversations.length ? 'Deselect all' : 'Select all'}
            >
              <span className="font-medium text-zinc-300 hover:text-white">
                {selectedConvIds.size === filteredConversations.length && filteredConversations.length > 0
                  ? 'Deselect All'
                  : 'Select All'}
              </span>
              <span className="text-zinc-500 font-mono text-[10px]">
                ({selectedConvIds.size}/{filteredConversations.length})
              </span>
            </button>
          ) : (
            <button
              onClick={() => setIsWakuHudOpen(true)}
              className="flex items-center gap-1.5 hover:text-white transition cursor-pointer"
              title="Inspect Waku Protocol Node"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[10px]">Waku Mesh: {wakuTelemetry.peerCount} peers</span>
            </button>
          )}

          <button
            onClick={() => {
              if (!isDeleteMode) {
                setIsDeleteMode(true);
              } else {
                handleDeleteSelected();
              }
            }}
            className={`p-1.5 rounded transition cursor-pointer flex items-center gap-1.5 ${
              isDeleteMode
                ? selectedConvIds.size > 0
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 ring-1 ring-red-500/40 font-semibold'
                  : 'bg-white/10 text-zinc-300 hover:text-white'
                : 'hover:bg-white/5 hover:text-red-400 text-zinc-400'
            }`}
            title={
              !isDeleteMode
                ? 'Select conversations to delete'
                : selectedConvIds.size > 0
                ? `Delete ${selectedConvIds.size} selected conversation(s)`
                : 'Cancel delete mode'
            }
          >
            <Trash2 className="w-3.5 h-3.5" />
            {isDeleteMode && (
              <span className="text-[11px] font-medium pr-0.5">
                {selectedConvIds.size > 0 ? `Delete (${selectedConvIds.size})` : 'Cancel'}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* COLUMN 2: CENTER ACTIVE CHAT (matches app theme) */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col bg-[#010105] h-full min-w-0 border-r border-white/5">
        
        {/* Chat Header: Contact Avatar + Name/Status */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/5 bg-[#010105]/60 backdrop-blur-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <img
                src={activeConversation.avatar}
                alt={activeConversation.name}
                className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10"
              />
              {activeConversation.status === 'Online' && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#010105]" />
              )}
            </div>

            <div className="min-w-0">
              <h2 className="text-xs font-semibold text-white tracking-wide truncate">
                {activeConversation.name}
              </h2>
              <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5 mt-0.5">
                {activeConversation.status === 'Online' ? 'Online' : activeConversation.status || 'Offline'}
                {activeConversation.watching && (
                  <span className="text-zinc-500 font-normal truncate hidden sm:inline">
                    · Watching: {activeConversation.watching}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeConversation.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 space-y-2 p-6">
              <Globe className="w-8 h-8 text-zinc-600 stroke-1" />
              <p className="text-xs">No decentralized messages exchanged yet.</p>
              <p className="text-[11px] text-zinc-500">
                Type a message below to broadcast securely over Waku gossipsub.
              </p>
            </div>
          ) : (
            activeConversation.messages.map((msg) => {
              if (msg.isMe) {
                // Outgoing Bubble (Right side - colored bubble matching theme dynamic accent)
                return (
                  <div key={msg.id} className="flex flex-col items-end space-y-1 max-w-[70%] ml-auto">
                    <span className="text-[10px] text-zinc-500 pr-1">
                      {formatMessageTime(msg.timestamp)}
                    </span>
                    <div
                      className="px-4 py-3 rounded-2xl text-xs text-white leading-relaxed shadow-md"
                      style={{
                        backgroundColor: accentColor,
                        borderBottomRightRadius: '4px'
                      }}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                );
              }

              // Incoming Bubble (Left side - dark pill container with user avatar + timestamp above)
              return (
                <div key={msg.id} className="flex items-start gap-3 max-w-[72%] mr-auto">
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    className="w-7 h-7 rounded-full object-cover shrink-0 mt-3.5 ring-1 ring-white/10"
                  />

                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] text-zinc-500 pl-1 block">
                      {formatMessageTime(msg.timestamp)}
                    </span>

                    {/* Text Message Bubble */}
                    {msg.text && (
                      <div className="px-4 py-3 rounded-2xl bg-[#0e1017] border border-white/5 text-zinc-200 leading-relaxed shadow-md">
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    )}

                    {/* Image Bubble */}
                    {msg.image && (
                      <div className="rounded-2xl overflow-hidden bg-[#0e1017] shadow-md border border-white/5 max-w-[380px]">
                        <img
                          src={msg.image}
                          alt="Shared design"
                          className="w-full h-auto object-cover max-h-[260px]"
                        />
                      </div>
                    )}

                    {/* Shared Media item */}
                    {msg.sharedMedia && (
                      <div className="mt-2 p-2.5 rounded-xl bg-[#0e1017] border border-white/5 flex items-center gap-3">
                        <img
                          src={msg.sharedMedia.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=300'}
                          alt={msg.sharedMedia.title}
                          className="w-10 h-14 rounded-lg object-cover shrink-0 shadow"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-white truncate">{msg.sharedMedia.title}</h4>
                          <span className="text-[10px] text-zinc-400 block mt-0.5">{msg.sharedMedia.releaseYear}</span>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <button
                              onClick={() => onPlayMedia(msg.sharedMedia!)}
                              className="px-2 py-0.5 rounded bg-emerald-500 text-black text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer"
                            >
                              <Play className="w-2.5 h-2.5 fill-black" />
                              <span>Play</span>
                            </button>
                            <button
                              onClick={() => onOpenMediaDetail(msg.sharedMedia!)}
                              className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] cursor-pointer"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Bar */}
        <div className="p-3.5 border-t border-white/5 bg-[#010105]">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="h-11 px-3 bg-[#0b0d13] rounded-full flex items-center gap-2 border border-white/5 focus-within:border-white/20 transition-colors"
          >
            {/* Smile Emoji Trigger */}
            <button
              type="button"
              onClick={() => handleSendMessage('😊')}
              className="text-zinc-400 hover:text-white transition p-1 cursor-pointer"
              title="Add Emoji"
            >
              <Smile className="w-4 h-4" />
            </button>

            {/* Input Element */}
            <input
              ref={messageInputRef}
              type="text"
              placeholder="Type a message..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="flex-1 bg-transparent text-xs text-white placeholder-zinc-500 outline-none font-sans"
            />

            {/* Paperclip attachment */}
            <button
              type="button"
              onClick={() => setIsShareMediaOpen(!isShareMediaOpen)}
              className="text-zinc-400 hover:text-white transition p-1 cursor-pointer"
              title="Attach media or files"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Send Arrow Button */}
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-8 h-8 rounded-full flex items-center justify-center transition disabled:opacity-30 disabled:hover:opacity-30 text-white cursor-pointer active:scale-95"
              style={{
                backgroundColor: inputText.trim() ? accentColor : 'rgba(255,255,255,0.06)'
              }}
              title="Send Message"
            >
              <Send className="w-3.5 h-3.5 fill-current" />
            </button>
          </form>
        </div>
      </div>

      {/* ========================================================= */}
      {/* COLUMN 3: RIGHT CONTACT DETAILS & FILES (matches app theme) */}
      {/* ========================================================= */}
      <div className="w-[300px] shrink-0 flex flex-col bg-[#05060a] h-full overflow-y-auto">
        
        {/* Contact Hero: Large Avatar + Name */}
        <div className="p-6 flex flex-col items-center text-center border-b border-white/5">
          <div className="relative mb-3">
            <img
              src={activeConversation.avatar}
              alt={activeConversation.name}
              className="w-20 h-20 rounded-full object-cover ring-2 ring-white/10 shadow-lg"
            />
            {activeConversation.status === 'Online' && (
              <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-[#05060a]" />
            )}
          </div>

          <h3 className="text-sm font-bold text-white tracking-wide">
            {activeConversation.name}
          </h3>

          {/* Contact Details List: Username, Email */}
          <div className="w-full mt-5 space-y-2.5 text-left text-[11px] text-zinc-400">
            <div className="flex items-center gap-2.5">
              <AtSign className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span className="truncate">{activeConversation.username || `@${activeConversation.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span className="truncate">{activeConversation.email || 'Judisss90@reed.co'}</span>
            </div>
          </div>
        </div>

        {/* Tab Header: PHOTO | FILE */}
        <div className="flex items-center justify-around border-b border-white/5 text-xs font-bold tracking-wider text-zinc-500 px-3">
          {(['photo', 'file'] as const).map(tab => {
            const isTabActive = activeSideTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveSideTab(tab)}
                className={`py-3 px-2 uppercase text-[10px] tracking-widest transition-colors relative cursor-pointer ${
                  isTabActive ? 'text-white' : 'hover:text-zinc-300'
                }`}
              >
                {tab}
                {isTabActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                    style={{ backgroundColor: accentColor }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content List */}
        <div className="flex-1 p-3.5 space-y-2.5 overflow-y-auto">
          {activeSideTab === 'file' && (
            <div className="space-y-2">
              {(activeConversation.sharedFiles || []).map(file => (
                <div
                  key={file.id}
                  className="p-2 rounded-xl hover:bg-white/[0.04] transition flex items-center justify-between gap-3 group cursor-pointer"
                  onClick={() => handleSendMessage(`Shared document: ${file.name}`)}
                  title="Click to share file reference into chat"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {renderFileIcon(file.type)}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors truncate">
                        {file.name}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">
                        {file.date}
                      </p>
                    </div>
                  </div>
                  {file.size && (
                    <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                      {file.size}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeSideTab === 'photo' && (
            <div className="grid grid-cols-2 gap-2">
              {(activeConversation.sharedPhotos || []).map(photo => (
                <div
                  key={photo.id}
                  onClick={() => handleSendMessage(undefined, undefined)}
                  className="rounded-xl overflow-hidden aspect-square bg-[#0e1017] relative group cursor-pointer border border-white/5"
                >
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <span className="text-[10px] text-white font-medium truncate">{photo.title}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: CALL SIMULATION (Voice / Video) */}
      {/* ========================================================= */}
      {isCalling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0a0c12] border border-white/10 rounded-2xl w-full max-w-sm p-6 text-center space-y-5 shadow-2xl">
            <div className="relative inline-block">
              <img
                src={activeConversation.avatar}
                alt={activeConversation.name}
                className="w-24 h-24 rounded-full object-cover mx-auto ring-4 animate-pulse"
                style={{ ringColor: `${accentColor}50` }}
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 ring-2 ring-[#0a0c12]" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">{activeConversation.name}</h3>
              <p className="text-xs text-zinc-400 mt-1 font-mono">
                {isCalling === 'video' ? 'Connecting Waku P2P WebRTC Video...' : 'Calling over Decentralized Mesh...'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={() => setIsCalling(null)}
                className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-red-600/30 active:scale-95"
              >
                <Phone className="w-4 h-4 rotate-[135deg]" />
                <span>End Call</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: SHARE MEDIA LIBRARY */}
      {/* ========================================================= */}
      {isShareMediaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0a0c12] border border-white/10 rounded-2xl w-full max-w-md p-5 text-left space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4" style={{ color: accentColor }} />
                <h3 className="text-sm font-bold text-white">Share from Media Library</h3>
              </div>
              <button
                onClick={() => setIsShareMediaOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Search movies or videos..."
              value={mediaSearch}
              onChange={e => setMediaSearch(e.target.value)}
              className="w-full bg-[#050609] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-white/20"
            />

            <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
              {filteredMediaItems.slice(0, 8).map(item => (
                <div
                  key={item.id}
                  onClick={() => handleSendMessage(`Check out "${item.title}"!`, item)}
                  className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 transition flex items-center gap-2 cursor-pointer group"
                >
                  <img
                    src={item.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=300'}
                    alt={item.title}
                    className="w-9 h-12 rounded object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white group-hover:text-zinc-200 transition-colors truncate">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-mono">{item.releaseYear}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: START NEW MESSAGE */}
      {/* ========================================================= */}
      {isNewMessageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0a0c12] border border-white/10 rounded-2xl w-full max-w-sm p-5 text-left space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <SquarePen className="w-4 h-4" style={{ color: accentColor }} />
                <h3 className="text-sm font-bold text-white">Start New Message</h3>
              </div>
              <button
                onClick={() => setIsNewMessageOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Search or enter peer name..."
              value={newRecipientSearch}
              onChange={e => setNewRecipientSearch(e.target.value)}
              className="w-full bg-[#050609] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-white/20"
            />

            <div className="space-y-1 max-h-[260px] overflow-y-auto">
              {availableFriends
                .filter(f => !newRecipientSearch || f.name.toLowerCase().includes(newRecipientSearch.toLowerCase()))
                .map(friend => (
                  <button
                    key={friend.id}
                    onClick={() => handleSelectFriendForNewMessage(friend)}
                    className="w-full p-2.5 rounded-xl hover:bg-white/[0.04] transition flex items-center justify-between gap-3 text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={friend.avatar}
                        alt={friend.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{friend.name}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">{friend.status}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold shrink-0" style={{ color: accentColor }}>Chat →</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: WAKU TELEMETRY & NODE HUD */}
      {/* ========================================================= */}
      {isWakuHudOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0a0c12] border border-white/10 rounded-2xl w-full max-w-lg p-6 text-left space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <Network className="w-5 h-5" style={{ color: accentColor }} />
                <h3 className="text-sm font-bold text-white">Waku v2 Node Status & Peer Mesh</h3>
              </div>
              <button
                onClick={() => setIsWakuHudOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-[#050609] border border-white/5">
                <span className="text-[10px] text-zinc-500 uppercase block">Peers</span>
                <span className="text-emerald-400 font-bold">{wakuTelemetry.peerCount} Connected</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#050609] border border-white/5">
                <span className="text-[10px] text-zinc-500 uppercase block">Relay</span>
                <span className="text-white font-bold">{wakuTelemetry.relayEnabled ? 'ACTIVE' : 'OFF'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#050609] border border-white/5">
                <span className="text-[10px] text-zinc-500 uppercase block">Sent</span>
                <span className="text-white font-bold">{wakuTelemetry.messagesSent} msgs</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#050609] border border-white/5">
                <span className="text-[10px] text-zinc-500 uppercase block">Received</span>
                <span className="text-white font-bold">{wakuTelemetry.messagesReceived} msgs</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#050609] border border-white/5 text-[11px] font-mono text-zinc-400 space-y-1">
              <div><strong className="text-white">Active Topic:</strong> {activeConversation.contentTopic}</div>
              <div><strong className="text-white">Node Peer ID:</strong> {wakuTelemetry.nodeId}</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
