// messaging.ts — localStorage-based team messaging system
// All keys use fz_ prefix per project convention

// ─── Interfaces ───────────────────────────────────────────────

export interface Channel {
  id: string;
  name: string;
  type: 'channel' | 'dm' | 'group';
  emoji: string;
  color: string;
  members: string[];
  createdAt: string;
  description: string;
  isPinned: boolean;
  lastMessageAt: string;
}

export interface TeamMessage {
  id: string;
  channelId: string;
  authorId: string;
  authorName: string;
  authorEmoji: string;
  content: string;
  timestamp: string;
  threadId?: string;
  reactions: { emoji: string; users: string[] }[];
  mentions: string[];
  isEdited: boolean;
  isPinned: boolean;
  replyTo?: { id: string; authorName: string; preview: string };
}

export interface Thread {
  parentMessageId: string;
  channelId: string;
  replies: TeamMessage[];
  lastActivity: string;
  participantCount: number;
}

// ─── Constants ────────────────────────────────────────────────

const CHANNELS_KEY = 'fz_channels';
const UNREAD_KEY = 'fz_unread';
const messagesKey = (channelId: string): string => `fz_messages_${channelId}`;

// ─── Utility ──────────────────────────────────────────────────

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// ─── Channels ─────────────────────────────────────────────────

export function getChannels(): Channel[] {
  try {
    const raw = localStorage.getItem(CHANNELS_KEY);
    if (!raw) {
      seedDefaultChannels();
      const seeded = localStorage.getItem(CHANNELS_KEY);
      return seeded ? (JSON.parse(seeded) as Channel[]) : [];
    }
    const parsed = JSON.parse(raw) as Channel[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      seedDefaultChannels();
      const seeded = localStorage.getItem(CHANNELS_KEY);
      return seeded ? (JSON.parse(seeded) as Channel[]) : [];
    }
    return parsed;
  } catch {
    return [];
  }
}

export function saveChannels(channels: Channel[]): void {
  try {
    localStorage.setItem(CHANNELS_KEY, JSON.stringify(channels));
  } catch {
    // storage full or unavailable
  }
}

export function createChannel(
  name: string,
  type: 'channel' | 'dm' | 'group',
  emoji: string,
  description: string,
  members?: string[]
): Channel {
  const now = new Date().toISOString();
  const channel: Channel = {
    id: generateId(),
    name,
    type,
    emoji,
    color: '#7c3aed',
    members: members ?? [],
    createdAt: now,
    description,
    isPinned: false,
    lastMessageAt: now,
  };
  const channels = getChannels();
  channels.push(channel);
  saveChannels(channels);
  return channel;
}

export function deleteChannel(channelId: string): void {
  const channels = getChannels().filter((c) => c.id !== channelId);
  saveChannels(channels);
  try {
    localStorage.removeItem(messagesKey(channelId));
  } catch {
    // ignore
  }
}

// ─── Messages ─────────────────────────────────────────────────

export function getMessages(channelId: string): TeamMessage[] {
  try {
    const raw = localStorage.getItem(messagesKey(channelId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TeamMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveMessages(channelId: string, messages: TeamMessage[]): void {
  try {
    localStorage.setItem(messagesKey(channelId), JSON.stringify(messages));
  } catch {
    // storage full or unavailable
  }
}

export function sendMessage(
  channelId: string,
  content: string,
  author: { id: string; name: string; emoji: string }
): TeamMessage {
  const now = new Date().toISOString();

  // Extract mentions (@name)
  const mentionMatches = content.match(/@(\S+)/g);
  const mentions: string[] = mentionMatches
    ? mentionMatches.map((m) => m.slice(1))
    : [];

  const message: TeamMessage = {
    id: generateId(),
    channelId,
    authorId: author.id,
    authorName: author.name,
    authorEmoji: author.emoji,
    content,
    timestamp: now,
    reactions: [],
    mentions,
    isEdited: false,
    isPinned: false,
  };

  const messages = getMessages(channelId);
  messages.push(message);
  saveMessages(channelId, messages);

  // Update channel lastMessageAt
  const channels = getChannels();
  const idx = channels.findIndex((c) => c.id === channelId);
  if (idx !== -1) {
    channels[idx].lastMessageAt = now;
    saveChannels(channels);
  }

  // Increment unread for this channel
  incrementUnread(channelId);

  return message;
}

export function editMessage(
  channelId: string,
  messageId: string,
  newContent: string
): void {
  const messages = getMessages(channelId);
  const idx = messages.findIndex((m) => m.id === messageId);
  if (idx !== -1) {
    messages[idx].content = newContent;
    messages[idx].isEdited = true;
    saveMessages(channelId, messages);
  }
}

export function deleteMessage(channelId: string, messageId: string): void {
  const messages = getMessages(channelId).filter((m) => m.id !== messageId);
  saveMessages(channelId, messages);
}

export function addReaction(
  channelId: string,
  messageId: string,
  emoji: string,
  userId: string
): void {
  const messages = getMessages(channelId);
  const msgIdx = messages.findIndex((m) => m.id === messageId);
  if (msgIdx === -1) return;

  const msg = messages[msgIdx];
  const reactionIdx = msg.reactions.findIndex((r) => r.emoji === emoji);

  if (reactionIdx === -1) {
    // New reaction emoji — add it
    msg.reactions.push({ emoji, users: [userId] });
  } else {
    const reaction = msg.reactions[reactionIdx];
    const userIdx = reaction.users.indexOf(userId);
    if (userIdx === -1) {
      // User hasn't reacted with this emoji yet — add
      reaction.users.push(userId);
    } else {
      // User already reacted — remove (toggle)
      reaction.users.splice(userIdx, 1);
      if (reaction.users.length === 0) {
        msg.reactions.splice(reactionIdx, 1);
      }
    }
  }

  saveMessages(channelId, messages);
}

export function pinMessage(channelId: string, messageId: string): void {
  const messages = getMessages(channelId);
  const idx = messages.findIndex((m) => m.id === messageId);
  if (idx !== -1) {
    messages[idx].isPinned = !messages[idx].isPinned;
    saveMessages(channelId, messages);
  }
}

// ─── Unread Counts ────────────────────────────────────────────

export function getUnreadCounts(): Record<string, number> {
  try {
    const raw = localStorage.getItem(UNREAD_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, number>;
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function saveUnreadCounts(counts: Record<string, number>): void {
  try {
    localStorage.setItem(UNREAD_KEY, JSON.stringify(counts));
  } catch {
    // ignore
  }
}

export function markAsRead(channelId: string): void {
  const counts = getUnreadCounts();
  counts[channelId] = 0;
  saveUnreadCounts(counts);
}

export function incrementUnread(channelId: string): void {
  const counts = getUnreadCounts();
  counts[channelId] = (counts[channelId] ?? 0) + 1;
  saveUnreadCounts(counts);
}

// ─── Search ───────────────────────────────────────────────────

export function searchMessages(
  query: string
): (TeamMessage & { channelName: string })[] {
  const channels = getChannels();
  const results: (TeamMessage & { channelName: string })[] = [];
  const lowerQuery = query.toLowerCase();

  for (const channel of channels) {
    const messages = getMessages(channel.id);
    for (const msg of messages) {
      if (msg.content.toLowerCase().includes(lowerQuery)) {
        results.push({ ...msg, channelName: channel.name });
      }
    }
  }

  // Sort by timestamp descending (most recent first)
  results.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return results;
}

// ─── Threads ──────────────────────────────────────────────────

export function getThreadReplies(
  channelId: string,
  parentMessageId: string
): TeamMessage[] {
  const messages = getMessages(channelId);
  return messages.filter((m) => m.threadId === parentMessageId);
}

export function replyToThread(
  channelId: string,
  parentMessageId: string,
  content: string,
  author: { id: string; name: string; emoji: string }
): TeamMessage {
  const now = new Date().toISOString();

  const mentionMatches = content.match(/@(\S+)/g);
  const mentions: string[] = mentionMatches
    ? mentionMatches.map((m) => m.slice(1))
    : [];

  // Find parent message for replyTo preview
  const messages = getMessages(channelId);
  const parent = messages.find((m) => m.id === parentMessageId);

  const message: TeamMessage = {
    id: generateId(),
    channelId,
    authorId: author.id,
    authorName: author.name,
    authorEmoji: author.emoji,
    content,
    timestamp: now,
    threadId: parentMessageId,
    reactions: [],
    mentions,
    isEdited: false,
    isPinned: false,
    replyTo: parent
      ? {
          id: parent.id,
          authorName: parent.authorName,
          preview: parent.content.slice(0, 80),
        }
      : undefined,
  };

  messages.push(message);
  saveMessages(channelId, messages);

  // Update channel lastMessageAt
  const channels = getChannels();
  const chIdx = channels.findIndex((c) => c.id === channelId);
  if (chIdx !== -1) {
    channels[chIdx].lastMessageAt = now;
    saveChannels(channels);
  }

  incrementUnread(channelId);

  return message;
}

// ─── Seed Defaults ────────────────────────────────────────────

export function seedDefaultChannels(): void {
  try {
    const existing = localStorage.getItem(CHANNELS_KEY);
    if (existing) {
      const parsed = JSON.parse(existing) as Channel[];
      if (Array.isArray(parsed) && parsed.length > 0) return;
    }
  } catch {
    // proceed to seed
  }

  const now = new Date().toISOString();

  const generalId = generateId();
  const annoncesId = generateId();
  const randomId = generateId();

  const channels: Channel[] = [
    {
      id: generalId,
      name: 'general',
      type: 'channel',
      emoji: '\u{1F4AC}',
      color: '#0EA5E9',
      members: [],
      createdAt: now,
      description: "Discussions générales de l'équipe",
      isPinned: true,
      lastMessageAt: now,
    },
    {
      id: annoncesId,
      name: 'annonces',
      type: 'channel',
      emoji: '\u{1F4E2}',
      color: '#D97706',
      members: [],
      createdAt: now,
      description: 'Annonces importantes',
      isPinned: true,
      lastMessageAt: now,
    },
    {
      id: randomId,
      name: 'random',
      type: 'channel',
      emoji: '\u{1F3B2}',
      color: '#16A34A',
      members: [],
      createdAt: now,
      description: 'Discussions libres',
      isPinned: false,
      lastMessageAt: now,
    },
  ];

  try {
    localStorage.setItem(CHANNELS_KEY, JSON.stringify(channels));
  } catch {
    return;
  }

  // Seed welcome messages in #general
  const systemAuthor = { id: 'system', name: 'System', emoji: '\u{1F916}' };

  const welcomeMessages: TeamMessage[] = [
    {
      id: generateId(),
      channelId: generalId,
      authorId: systemAuthor.id,
      authorName: systemAuthor.name,
      authorEmoji: systemAuthor.emoji,
      content:
        "Bienvenue dans le chat d'équipe ! \u{1F389} Utilisez les channels pour organiser vos conversations.",
      timestamp: now,
      reactions: [],
      mentions: [],
      isEdited: false,
      isPinned: false,
    },
    {
      id: generateId(),
      channelId: generalId,
      authorId: systemAuthor.id,
      authorName: systemAuthor.name,
      authorEmoji: systemAuthor.emoji,
      content:
        'Créez de nouveaux channels avec le bouton + pour des discussions thématiques.',
      timestamp: new Date(Date.now() + 1000).toISOString(),
      reactions: [],
      mentions: [],
      isEdited: false,
      isPinned: false,
    },
    {
      id: generateId(),
      channelId: generalId,
      authorId: systemAuthor.id,
      authorName: systemAuthor.name,
      authorEmoji: systemAuthor.emoji,
      content:
        "Mentionnez @nom pour notifier un membre, et \u{1F4AC} pour répondre en fil de discussion.",
      timestamp: new Date(Date.now() + 2000).toISOString(),
      reactions: [],
      mentions: [],
      isEdited: false,
      isPinned: false,
    },
  ];

  try {
    localStorage.setItem(
      messagesKey(generalId),
      JSON.stringify(welcomeMessages)
    );
  } catch {
    // storage full or unavailable
  }
}
