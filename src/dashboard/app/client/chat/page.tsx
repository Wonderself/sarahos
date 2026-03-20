'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useUserData } from '../../../lib/use-user-data';
import Link from 'next/link';
import { recordEvent } from '../../../lib/gamification';
import { DEFAULT_AGENTS, ALL_AGENTS, loadAgentConfigs, getEffectiveAgent, type ResolvedAgent } from '../../../lib/agent-config';
import { recordAgentInteraction, recordFeedback, getBond, LEVEL_NAMES, LEVEL_ICONS } from '../../../lib/agent-bonding';
import { parseActionProposals, ACTION_TYPE_ICONS, ACTION_TYPE_LABELS, PRIORITY_LABELS, PRIORITY_COLORS, formatDueDate, type ParsedActionProposal } from '../../../lib/action-parser';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import { CU, pageContainer, headerRow, emojiIcon } from '../../../lib/page-styles';
import PageBlogSection from '@/components/blog/PageBlogSection';
import { Channel, TeamMessage, getChannels, getMessages as getTeamMessages, sendMessage as sendTeamMessage, editMessage, deleteMessage, addReaction, pinMessage, createChannel, deleteChannel, getUnreadCounts, markAsRead, searchMessages as searchTeamMessages, getThreadReplies, replyToThread, seedDefaultChannels } from '../../../lib/messaging';
import { useIsMobile } from '../../../lib/use-media-query';
import { VisitorEmptyState } from '../../../components/VisitorBanner';

type CommMode = 'chat' | 'visio' | 'whatsapp' | 'repondeur';
const COMM_TABS: { id: CommMode; label: string; icon: string }[] = [
  { id: 'chat', label: 'Chat texte', icon: '💬' },
  { id: 'visio', label: 'Appel vocal', icon: '🎤' },
  { id: 'whatsapp', label: 'WhatsApp', icon: '📱' },
  { id: 'repondeur', label: 'Répondeur IA', icon: '📞' },
];
import { useAuthGuard } from '../../../lib/useAuthGuard';
import { useVisitorDraft } from '../../../lib/useVisitorDraft';
import VoiceInput from '../../../components/VoiceInput';
import AudioPlayback from '../../../components/AudioPlayback';
import { MarkdownContent } from '@/lib/markdown';
import { MemoryService } from '@/lib/memory';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens?: number;
  cost?: number;
  timestamp?: string;
  isFaq?: boolean;
}

interface ConversationEntry {
  id: string;
  agentId: string;
  agentEmoji: string;
  title: string;
  messages: Message[];
  date: string;
  totalTokens: number;
}

interface FaqEntry {
  id: string;
  agentId: string;
  question: string;
  answer: string;
  keywords: string[];
  usedCount: number;
  createdAt: string;
}

const MAX_HISTORY = 50;
const MAX_CONTEXT_MESSAGES = 8; // Keep last 8 messages for API calls (saves tokens)
const FAQ_STORAGE_KEY = 'fz_faq';
const FAQ_MATCH_THRESHOLD = 0.4; // 40% keyword match = FAQ hit

// Simple keyword-based FAQ matching
function normalizeTxt(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9àâäéèêëïîôùûüÿç\s]/g, '').split(/\s+/).filter(w => w.length > 2);
}

function matchFaq(query: string, faqEntries: FaqEntry[], agentId: string): FaqEntry | null {
  const queryWords = normalizeTxt(query);
  if (queryWords.length === 0) return null;
  let bestMatch: FaqEntry | null = null;
  let bestScore = 0;
  for (const entry of faqEntries) {
    if (entry.agentId !== agentId) continue;
    const matchCount = queryWords.filter(w => entry.keywords.some(k => k.includes(w) || w.includes(k))).length;
    const score = matchCount / queryWords.length;
    if (score > bestScore && score >= FAQ_MATCH_THRESHOLD) {
      bestScore = score;
      bestMatch = entry;
    }
  }
  return bestMatch;
}

function loadFaq(): FaqEntry[] {
  try {
    const raw = localStorage.getItem(FAQ_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveFaq(entries: FaqEntry[]) {
  try { localStorage.setItem(FAQ_STORAGE_KEY, JSON.stringify(entries)); } catch { /* */ }
}

// ─── Question frequency tracker for auto-FAQ suggestions ───
const FREQ_STORAGE_KEY = 'fz_question_freq';

interface QuestionFreqEntry {
  keywords: string[];
  count: number;
  lastQuestion: string;
}

function loadQuestionFreq(): QuestionFreqEntry[] {
  try { return JSON.parse(localStorage.getItem(FREQ_STORAGE_KEY) ?? '[]'); } catch { return []; }
}

function saveQuestionFreq(entries: QuestionFreqEntry[]) {
  try { localStorage.setItem(FREQ_STORAGE_KEY, JSON.stringify(entries)); } catch { /* */ }
}

function trackQuestion(question: string, faqEntriesList: FaqEntry[], agentId: string): boolean {
  const keywords = normalizeTxt(question);
  if (keywords.length < 2) return false;
  // Don't suggest if already saved as FAQ
  if (matchFaq(question, faqEntriesList, agentId)) return false;

  const freq = loadQuestionFreq();
  let found = false;
  for (const entry of freq) {
    const matchCount = keywords.filter(w => entry.keywords.some(k => k.includes(w) || w.includes(k))).length;
    const score = matchCount / Math.max(keywords.length, entry.keywords.length);
    if (score >= FAQ_MATCH_THRESHOLD) {
      entry.count++;
      entry.lastQuestion = question;
      found = true;
      if (entry.count >= 3) {
        saveQuestionFreq(freq);
        return true;
      }
      break;
    }
  }
  if (!found) {
    freq.push({ keywords, count: 1, lastQuestion: question });
  }
  saveQuestionFreq(freq);
  return false;
}

// ─── Get current user from session ───
function getCurrentUser(): { id: string; name: string; emoji: string } {
  try {
    const session = JSON.parse(localStorage.getItem('fz_session') || '{}');
    return { id: session.userId || 'me', name: session.displayName || 'Moi', emoji: '\u{1F464}' };
  } catch { return { id: 'me', name: 'Moi', emoji: '\u{1F464}' }; }
}

// ─── MessageBubble sub-component ───
interface MessageBubbleProps {
  message: TeamMessage;
  onReply?: () => void;
  onReact?: (emoji: string) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onPin?: () => void;
}

function MessageBubble({ message, onReply, onReact, onEdit, onDelete, onPin }: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const QUICK_EMOJIS = ['\u{1F44D}', '❤️', '\u{1F604}', '\u{1F389}', '\u{1F914}', '\u{1F44F}'];

  return (
    <div
      className="cu-message"
      style={{ position: 'relative' }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="cu-message-avatar">
        <div className="cu-avatar" style={{ width: 28, height: 28, fontSize: 14 }}>
          {message.authorEmoji || '\u{1F464}'}
        </div>
      </div>
      <div className="cu-message-content">
        <div className="cu-message-header">
          <span className="cu-message-author">{message.authorName}</span>
          <span className="cu-message-time">
            {new Date(message.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {message.isEdited && <span style={{ fontSize: 11, color: 'var(--fz-text-muted)' }}>(modifié)</span>}
          {message.isPinned && <span style={{ fontSize: 12 }}>{'\u{1F4CC}'}</span>}
        </div>
        <div className="cu-message-text">{message.content}</div>
        {message.reactions.length > 0 && (
          <div className="cu-reactions">
            {message.reactions.map((r, i) => (
              <button
                key={i}
                className={`cu-reaction ${r.users.includes('me') ? 'cu-reaction-active' : ''}`}
                onClick={() => onReact?.(r.emoji)}
              >
                <span>{r.emoji}</span>
                <span className="cu-reaction-count">{r.users.length}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {showActions && (onReply || onReact || onPin || onEdit || onDelete) && (
        <div style={{
          position: 'absolute', top: -4, right: 8, display: 'flex', gap: 2,
          background: 'var(--fz-bg, #fff)', border: '1px solid var(--fz-border)', borderRadius: 6,
          padding: '2px 4px',
        }}>
          {onReply && (
            <button onClick={onReply} title="Répondre" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: '2px 4px', borderRadius: 4 }}>{'\u{1F4AC}'}</button>
          )}
          {onReact && (
            <>
              {QUICK_EMOJIS.map(e => (
                <button key={e} onClick={() => onReact(e)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: '6px', borderRadius: 4, minWidth: 32, minHeight: 32 }}>{e}</button>
              ))}
            </>
          )}
          {onPin && (
            <button onClick={onPin} title="Épingler" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: '2px 4px', borderRadius: 4 }}>{'\u{1F4CC}'}</button>
          )}
          {onEdit && (
            <button onClick={onEdit} title="Modifier" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: '2px 4px', borderRadius: 4 }}>{'✏️'}</button>
          )}
          {onDelete && (
            <button onClick={onDelete} title="Supprimer" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: '2px 4px', borderRadius: 4 }}>{'\u{1F5D1}️'}</button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── TeamChat component ───
function TeamChat() {
  const isMobile = useIsMobile();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string>('');
  const [teamMessages, setTeamMessagesState] = useState<TeamMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [threadMessageId, setThreadMessageId] = useState<string | null>(null);
  const [threadReplies, setThreadReplies] = useState<TeamMessage[]>([]);
  const [threadReply, setThreadReply] = useState('');
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelEmoji, setNewChannelEmoji] = useState('\u{1F4AC}');
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const teamMessagesEndRef = useRef<HTMLDivElement>(null);

  const activeChannel = channels.find(c => c.id === activeChannelId);

  const refreshChannels = useCallback(() => {
    const ch = getChannels();
    setChannels(ch);
    return ch;
  }, []);

  const refreshMessages = useCallback((channelId: string) => {
    const msgs = getTeamMessages(channelId);
    setTeamMessagesState(msgs);
  }, []);

  const refreshUnread = useCallback(() => {
    setUnreadCounts(getUnreadCounts());
  }, []);

  // Mount: seed + load
  useEffect(() => {
    seedDefaultChannels();
    const ch = refreshChannels();
    refreshUnread();
    if (ch.length > 0) {
      setActiveChannelId(ch[0].id);
    }
  }, [refreshChannels, refreshUnread]);

  // On active channel change: load messages + mark as read
  useEffect(() => {
    if (!activeChannelId) return;
    refreshMessages(activeChannelId);
    markAsRead(activeChannelId);
    refreshUnread();
  }, [activeChannelId, refreshMessages, refreshUnread]);

  // Scroll to bottom when messages change
  useEffect(() => {
    teamMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [teamMessages]);

  // Refresh thread replies when thread opens or messages change
  useEffect(() => {
    if (threadMessageId && activeChannelId) {
      setThreadReplies(getThreadReplies(activeChannelId, threadMessageId));
    }
  }, [threadMessageId, activeChannelId, teamMessages]);

  function handleSend() {
    if (!newMessage.trim() || !activeChannelId) return;
    const user = getCurrentUser();
    if (editingMessageId) {
      editMessage(activeChannelId, editingMessageId, newMessage.trim());
      setEditingMessageId(null);
      setEditContent('');
    } else {
      sendTeamMessage(activeChannelId, newMessage.trim(), user);
    }
    setNewMessage('');
    refreshMessages(activeChannelId);
    refreshUnread();
    markAsRead(activeChannelId);
  }

  function handleThreadSend() {
    if (!threadReply.trim() || !threadMessageId || !activeChannelId) return;
    const user = getCurrentUser();
    replyToThread(activeChannelId, threadMessageId, threadReply.trim(), user);
    setThreadReply('');
    refreshMessages(activeChannelId);
    setThreadReplies(getThreadReplies(activeChannelId, threadMessageId));
  }

  function handleReaction(messageId: string, emoji: string) {
    if (!activeChannelId) return;
    const user = getCurrentUser();
    addReaction(activeChannelId, messageId, emoji, user.id);
    refreshMessages(activeChannelId);
  }

  function handleEdit(messageId: string, content: string) {
    setEditingMessageId(messageId);
    setEditContent(content);
    setNewMessage(content);
  }

  function handleDeleteMsg(messageId: string) {
    if (!activeChannelId) return;
    deleteMessage(activeChannelId, messageId);
    refreshMessages(activeChannelId);
  }

  function handlePin(messageId: string) {
    if (!activeChannelId) return;
    pinMessage(activeChannelId, messageId);
    refreshMessages(activeChannelId);
  }

  function handleCreateChannel() {
    if (!newChannelName.trim()) return;
    createChannel(newChannelName.trim(), 'channel', newChannelEmoji, newChannelDesc.trim());
    setNewChannelName('');
    setNewChannelEmoji('\u{1F4AC}');
    setNewChannelDesc('');
    setShowCreateChannel(false);
    const ch = refreshChannels();
    if (ch.length > 0) setActiveChannelId(ch[ch.length - 1].id);
  }

  function handleDeleteChannel(channelId: string) {
    deleteChannel(channelId);
    const ch = refreshChannels();
    if (activeChannelId === channelId && ch.length > 0) {
      setActiveChannelId(ch[0].id);
    }
  }

  function handleThreadKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleThreadSend();
    }
  }

  function handleChannelSelect(channelId: string) {
    setActiveChannelId(channelId);
    if (isMobile) setShowMobileSidebar(false);
  }

  // Filter channels by search
  const filteredChannels = teamSearchQuery.trim()
    ? channels.filter(c => c.name.toLowerCase().includes(teamSearchQuery.toLowerCase()) || c.description.toLowerCase().includes(teamSearchQuery.toLowerCase()))
    : channels;

  const pinnedChannels = filteredChannels.filter(c => c.isPinned);
  const regularChannels = filteredChannels.filter(c => c.type === 'channel' && !c.isPinned);
  const groupChannels = filteredChannels.filter(c => c.type === 'group');

  // Channel sidebar content (shared between mobile and desktop)
  const sidebarContent = (
    <>
      <div style={{ padding: '8px', borderBottom: '1px solid var(--fz-border-light, var(--fz-border, #E5E5E5))' }}>
        <input
          placeholder="Rechercher..."
          value={teamSearchQuery}
          onChange={e => setTeamSearchQuery(e.target.value)}
          style={{ width: '100%', height: 36, border: '1px solid var(--fz-border, #E5E5E5)', borderRadius: 6, padding: '0 8px', fontSize: 13, background: 'var(--fz-bg, #fff)', color: 'var(--fz-text, #1A1A1A)', fontFamily: 'inherit', outline: 'none' }}
        />
      </div>
      {pinnedChannels.length > 0 && (
        <>
          <div className="cu-channel-section-title">{'\u{1F4CC}'} Épinglés</div>
          {pinnedChannels.map(channel => (
            <div
              key={channel.id}
              className={`cu-channel-item ${activeChannelId === channel.id ? 'cu-channel-item-active' : ''}`}
              onClick={() => handleChannelSelect(channel.id)}
            >
              <span className="cu-channel-emoji">{channel.emoji}</span>
              <span className="cu-channel-name">{channel.name}</span>
              {(unreadCounts[channel.id] ?? 0) > 0 && (
                <span className="cu-channel-unread">{unreadCounts[channel.id]}</span>
              )}
            </div>
          ))}
        </>
      )}
      <div className="cu-channel-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{'\u{1F4AC}'} Channels</span>
        <button onClick={() => setShowCreateChannel(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--fz-text-muted, #9B9B9B)' }}>+</button>
      </div>
      {regularChannels.map(channel => (
        <div
          key={channel.id}
          className={`cu-channel-item ${activeChannelId === channel.id ? 'cu-channel-item-active' : ''}`}
          onClick={() => handleChannelSelect(channel.id)}
        >
          <span className="cu-channel-emoji">{channel.emoji}</span>
          <span className="cu-channel-name">{channel.name}</span>
          {(unreadCounts[channel.id] ?? 0) > 0 && (
            <span className="cu-channel-unread">{unreadCounts[channel.id]}</span>
          )}
        </div>
      ))}
      {groupChannels.length > 0 && (
        <>
          <div className="cu-channel-section-title">{'\u{1F465}'} Groupes</div>
          {groupChannels.map(channel => (
            <div
              key={channel.id}
              className={`cu-channel-item ${activeChannelId === channel.id ? 'cu-channel-item-active' : ''}`}
              onClick={() => handleChannelSelect(channel.id)}
            >
              <span className="cu-channel-emoji">{channel.emoji}</span>
              <span className="cu-channel-name">{channel.name}</span>
              {(unreadCounts[channel.id] ?? 0) > 0 && (
                <span className="cu-channel-unread">{unreadCounts[channel.id]}</span>
              )}
            </div>
          ))}
        </>
      )}
    </>
  );

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 120px)', borderTop: '1px solid var(--fz-border, #E5E5E5)' }}>
      {/* Mobile sidebar toggle */}
      {isMobile && (
        <button
          onClick={() => setShowMobileSidebar(true)}
          style={{
            position: 'absolute', top: 8, left: 8, zIndex: 10, background: 'var(--fz-bg, #fff)',
            border: '1px solid var(--fz-border, #E5E5E5)', borderRadius: 6, padding: '10px 14px',
            cursor: 'pointer', fontSize: 14, minWidth: 44, minHeight: 44,
          }}
        >
          {'☰'}
        </button>
      )}

      {/* Mobile sidebar overlay */}
      {isMobile && showMobileSidebar && (
        <>
          <div onClick={() => setShowMobileSidebar(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }} />
          <div className="cu-channel-sidebar" style={{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 50, width: 260 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid var(--fz-border, #E5E5E5)' }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--fz-text, #1A1A1A)' }}>Channels</span>
              <button onClick={() => setShowMobileSidebar(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--fz-text-muted, #9B9B9B)' }}>{'✕'}</button>
            </div>
            {sidebarContent}
          </div>
        </>
      )}

      {/* Desktop sidebar */}
      {!isMobile && (
        <div className="cu-channel-sidebar" style={{ width: 220, flexShrink: 0 }}>
          {sidebarContent}
        </div>
      )}

      {/* Message Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Channel Header */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--fz-border, #E5E5E5)', display: 'flex', alignItems: 'center', gap: 8 }}>
          {isMobile && <div style={{ width: 28 }} />}
          <span style={{ fontSize: 20 }}>{activeChannel?.emoji}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fz-text, #1A1A1A)' }}>{activeChannel?.name}</div>
            <div style={{ fontSize: 12, color: 'var(--fz-text-muted, #9B9B9B)' }}>{activeChannel?.description}</div>
          </div>
          {activeChannel && !activeChannel.isPinned && (
            <button
              onClick={() => handleDeleteChannel(activeChannel.id)}
              title="Supprimer le channel"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--fz-text-muted, #9B9B9B)' }}
            >
              {'\u{1F5D1}️'}
            </button>
          )}
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }} className="fz-scroll">
          {teamMessages.length === 0 && (
            <div className="cu-empty-state">
              <div className="cu-empty-emoji">{activeChannel?.emoji || '\u{1F4AC}'}</div>
              <div className="cu-empty-title">Bienvenue dans #{activeChannel?.name || 'channel'}</div>
              <div className="cu-empty-desc">Commencez la conversation en envoyant un message.</div>
            </div>
          )}
          {teamMessages.filter(m => !m.threadId).map(msg => {
            const user = getCurrentUser();
            const isOwn = msg.authorId === user.id;
            return (
              <div key={msg.id}>
                {editingMessageId === msg.id ? (
                  <div style={{ padding: '8px 16px', display: 'flex', gap: 8 }}>
                    <input
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') { handleSend(); }
                        if (e.key === 'Escape') { setEditingMessageId(null); setNewMessage(''); }
                      }}
                      style={{ flex: 1, padding: '6px 10px', border: '1px solid var(--fz-border, #E5E5E5)', borderRadius: 6, fontSize: 13, background: 'var(--fz-bg, #fff)', color: 'var(--fz-text, #1A1A1A)', fontFamily: 'inherit', outline: 'none' }}
                      autoFocus
                    />
                    <button onClick={handleSend} style={{ background: 'var(--accent, #1A1A1A)', color: 'white', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 12 }}>OK</button>
                    <button onClick={() => { setEditingMessageId(null); setNewMessage(''); }} style={{ background: 'none', border: '1px solid var(--fz-border, #E5E5E5)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 12, color: 'var(--fz-text-muted, #9B9B9B)' }}>{'✕'}</button>
                  </div>
                ) : (
                  <MessageBubble
                    message={msg}
                    onReply={() => setThreadMessageId(msg.id)}
                    onReact={(emoji) => handleReaction(msg.id, emoji)}
                    onEdit={isOwn ? () => handleEdit(msg.id, msg.content) : undefined}
                    onDelete={isOwn ? () => handleDeleteMsg(msg.id) : undefined}
                    onPin={() => handlePin(msg.id)}
                  />
                )}
                {/* Thread indicator */}
                {(() => {
                  const replyCount = teamMessages.filter(m => m.threadId === msg.id).length;
                  if (replyCount === 0) return null;
                  return (
                    <button
                      onClick={() => setThreadMessageId(msg.id)}
                      style={{ marginLeft: 44, marginBottom: 4, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--accent, #1A1A1A)', fontFamily: 'inherit' }}
                    >
                      {'\u{1F4AC}'} {replyCount} réponse{replyCount !== 1 ? 's' : ''}
                    </button>
                  );
                })()}
              </div>
            );
          })}
          <div ref={teamMessagesEndRef} />
        </div>

        {/* Composer */}
        <div className="cu-composer">
          <textarea
            className="cu-composer-input"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder={editingMessageId ? 'Modifier le message...' : 'Écrire un message...'}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            rows={1}
          />
          <button className="cu-composer-send" onClick={handleSend} disabled={!newMessage.trim()}>{'➤'}</button>
        </div>
      </div>

      {/* Thread Panel */}
      {threadMessageId && (
        <div className="cu-thread-panel" style={isMobile ? { position: 'fixed', inset: 0, zIndex: 50, width: '100%', paddingBottom: 'max(16px, env(safe-area-inset-bottom))' } : undefined}>
          <div className="cu-thread-header">
            <span>Fil de discussion</span>
            <button className="cu-thread-close" onClick={() => setThreadMessageId(null)} style={{ minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{'✕'}</button>
          </div>
          <div className="cu-thread-messages fz-scroll">
            {(() => {
              const parentMsg = teamMessages.find(m => m.id === threadMessageId);
              if (!parentMsg) return null;
              return <MessageBubble message={parentMsg} onReact={(emoji) => handleReaction(parentMsg.id, emoji)} />;
            })()}
            <div style={{ borderTop: '1px solid var(--fz-border-light, var(--fz-border, #E5E5E5))', margin: '8px 0', padding: '4px 12px', fontSize: 11, color: 'var(--fz-text-muted, #9B9B9B)' }}>
              {threadReplies.length} réponse{threadReplies.length !== 1 ? 's' : ''}
            </div>
            {threadReplies.map(reply => (
              <MessageBubble key={reply.id} message={reply} onReact={(emoji) => handleReaction(reply.id, emoji)} />
            ))}
          </div>
          <div className="cu-composer" style={{ borderTop: '1px solid var(--fz-border, #E5E5E5)' }}>
            <textarea
              className="cu-composer-input"
              value={threadReply}
              onChange={e => setThreadReply(e.target.value)}
              placeholder="Répondre..."
              onKeyDown={handleThreadKeyDown}
              rows={1}
            />
            <button className="cu-composer-send" onClick={handleThreadSend} disabled={!threadReply.trim()}>{'➤'}</button>
          </div>
        </div>
      )}

      {/* Create Channel Modal */}
      {showCreateChannel && (
        <>
          <div className="cu-modal-overlay" onClick={() => setShowCreateChannel(false)} />
          <div className="cu-modal" style={{ maxWidth: isMobile ? 'calc(100vw - 32px)' : 520, width: '100%' }}>
            <div className="cu-modal-header">
              <span className="cu-modal-title">Créer un channel</span>
              <button onClick={() => setShowCreateChannel(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--fz-text-muted, #9B9B9B)' }}>{'✕'}</button>
            </div>
            <div className="cu-modal-body">
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--fz-text, #1A1A1A)' }}>Emoji</label>
                <input
                  value={newChannelEmoji}
                  onChange={e => setNewChannelEmoji(e.target.value)}
                  style={{ width: 60, height: 36, textAlign: 'center', fontSize: 20, border: '1px solid var(--fz-border, #E5E5E5)', borderRadius: 6, background: 'var(--fz-bg, #fff)', outline: 'none' }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--fz-text, #1A1A1A)' }}>Nom du channel</label>
                <input
                  value={newChannelName}
                  onChange={e => setNewChannelName(e.target.value)}
                  placeholder="ex: marketing"
                  style={{ width: '100%', height: 36, border: '1px solid var(--fz-border, #E5E5E5)', borderRadius: 6, padding: '0 10px', fontSize: 13, background: 'var(--fz-bg, #fff)', color: 'var(--fz-text, #1A1A1A)', fontFamily: 'inherit', outline: 'none' }}
                  onKeyDown={e => { if (e.key === 'Enter') handleCreateChannel(); }}
                  autoFocus
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--fz-text, #1A1A1A)' }}>Description</label>
                <input
                  value={newChannelDesc}
                  onChange={e => setNewChannelDesc(e.target.value)}
                  placeholder="De quoi parle ce channel ?"
                  style={{ width: '100%', height: 36, border: '1px solid var(--fz-border, #E5E5E5)', borderRadius: 6, padding: '0 10px', fontSize: 13, background: 'var(--fz-bg, #fff)', color: 'var(--fz-text, #1A1A1A)', fontFamily: 'inherit', outline: 'none' }}
                />
              </div>
            </div>
            <div className="cu-modal-footer">
              <button onClick={() => setShowCreateChannel(false)} style={{ padding: '8px 16px', border: '1px solid var(--fz-border, #E5E5E5)', borderRadius: 6, background: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--fz-text-muted, #9B9B9B)', fontFamily: 'inherit' }}>Annuler</button>
              <button onClick={handleCreateChannel} disabled={!newChannelName.trim()} style={{ padding: '8px 16px', border: 'none', borderRadius: 6, background: 'var(--accent, #1A1A1A)', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', opacity: newChannelName.trim() ? 1 : 0.5 }}>Créer</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function ChatPage() {
  const isMobile = useIsMobile();
  const { isAuthenticated, requireAuth, LoginModalComponent } = useAuthGuard();
  const [chatMode, setChatMode] = useState<'ai' | 'team'>('ai');
  const [agents, setAgents] = useState<ResolvedAgent[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput, clearInputDraft] = useVisitorDraft('chat', 'message', '');
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<ResolvedAgent | null>(null);
  const [totalTokens, setTotalTokens] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const { data: history, setData: setHistory } = useUserData<ConversationEntry[]>('chat_history', [], 'fz_chat_history');
  const [showHistory, setShowHistory] = useState(false);
  const [currentConvoId, setCurrentConvoId] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const { data: faqEntries, setData: setFaqEntries } = useUserData<FaqEntry[]>('chat_faq', [], 'fz_faq');
  const [faqMatch, setFaqMatch] = useState<FaqEntry | null>(null);
  const [showFaqPanel, setShowFaqPanel] = useState(false);
  const [savedFaqIdx, setSavedFaqIdx] = useState<number | null>(null);
  const [faqSuggestion, setFaqSuggestion] = useState(false);
  const [commMode, setCommMode] = useState<CommMode>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const sendingRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [feedbackGiven, setFeedbackGiven] = useState<Record<number, 'positive' | 'negative'>>({});
  const [assistantMsgCount, setAssistantMsgCount] = useState(0);
  const [actionProposals, setActionProposals] = useState<ParsedActionProposal[]>([]);
  const [acceptedActions, setAcceptedActions] = useState<Set<number>>(new Set());
  const [actionSaving, setActionSaving] = useState(false);

  function parseFollowUps(text: string): { cleanContent: string; questions: string[] } {
    const questions: string[] = [];
    const regex = /\[Q\d+:\s*(.+?)\]/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      questions.push(match[1].trim());
    }
    const cleanContent = text.replace(/\[Q\d+:\s*.+?\]/g, '').trim();
    return { cleanContent, questions };
  }

  // Load agents from config (defaults + custom overrides)
  useEffect(() => {
    const configs = loadAgentConfigs();
    const resolved = DEFAULT_AGENTS.map(a => getEffectiveAgent(a.id, configs));
    setAgents(resolved);
    setSelectedAgent(resolved[0]);
    // History + FAQ loaded by useUserData hooks
    return () => { controllerRef.current?.abort(); };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem('fz_session') ?? '{}');
    } catch { return {}; }
  }

  // Check FAQ as user types
  function onInputChange(val: string) {
    setInput(val);
    if (val.trim().length > 10 && selectedAgent) {
      setFaqMatch(matchFaq(val, faqEntries, selectedAgent.id));
    } else {
      setFaqMatch(null);
    }
  }

  // Use a FAQ answer instead of calling the API
  function useFaqAnswer(entry: FaqEntry) {
    const userMsg: Message = { role: 'user', content: input.trim(), timestamp: new Date().toISOString() };
    const faqMsg: Message = {
      role: 'assistant', content: entry.answer, tokens: 0, cost: 0,
      timestamp: new Date().toISOString(), isFaq: true,
    };
    setMessages(prev => [...prev, userMsg, faqMsg]);
    setInput('');
    setFaqMatch(null);
    // Update usage count
    const updated = faqEntries.map(e => e.id === entry.id ? { ...e, usedCount: e.usedCount + 1 } : e);
    setFaqEntries(updated);
    // saveFaq removed — useUserData hook handles persistence
  }

  // Save a Q&A pair as FAQ
  function saveAsFaq(questionIdx: number, answerIdx: number) {
    const q = messages[questionIdx];
    const a = messages[answerIdx];
    if (!q || !a || !selectedAgent) return;
    const entry: FaqEntry = {
      id: Date.now().toString(),
      agentId: selectedAgent.id,
      question: q.content,
      answer: a.content,
      keywords: normalizeTxt(q.content),
      usedCount: 0,
      createdAt: new Date().toISOString(),
    };
    const updated = [...faqEntries, entry];
    setFaqEntries(updated);
    // saveFaq removed — useUserData hook handles persistence
    setSavedFaqIdx(answerIdx);
    setTimeout(() => setSavedFaqIdx(null), 2000);
  }

  // Delete a FAQ entry
  function deleteFaqEntry(id: string) {
    const updated = faqEntries.filter(e => e.id !== id);
    setFaqEntries(updated);
    // saveFaq removed — useUserData hook handles persistence
  }

  async function sendMessage() {
    if (!input.trim() || loading || !selectedAgent) return;
    if (!requireAuth('Connectez-vous pour envoyer un message')) return;
    const session = getSession();
    if (!session.token) return;

    const userMsg: Message = { role: 'user', content: input.trim(), timestamp: new Date().toISOString() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setFollowUpQuestions([]);
    setFaqMatch(null);
    setLoading(true);

    try {
      // Build API messages with truncation: system prompt + last N messages
      const conversationMsgs = newMessages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      // Truncate: keep only last MAX_CONTEXT_MESSAGES
      const truncated = conversationMsgs.length > MAX_CONTEXT_MESSAGES
        ? conversationMsgs.slice(-MAX_CONTEXT_MESSAGES)
        : conversationMsgs;

      // Inject user memories into system prompt if available
      let enrichedSystemPrompt = selectedAgent.systemPrompt;
      try {
        const memoryContext = MemoryService.buildContextForAssistant(selectedAgent.id);
        if (memoryContext) {
          enrichedSystemPrompt = `${memoryContext}\n\n---\n\n${selectedAgent.systemPrompt}`;
        }
      } catch { /* MemoryService error — continue without memory */ }

      const apiMessages = [
        { role: 'user' as const, content: enrichedSystemPrompt },
        { role: 'assistant' as const, content: `Compris, je suis ${selectedAgent.name}, ${selectedAgent.role}. Comment puis-je vous aider?` },
        ...(conversationMsgs.length > MAX_CONTEXT_MESSAGES
          ? [{ role: 'user' as const, content: '[Note: messages précédents résumés pour optimiser les tokens. Concentre-toi sur les messages récents ci-dessous.]' },
             { role: 'assistant' as const, content: 'Compris, je me concentre sur la conversation récente.' }]
          : []),
        ...truncated,
      ];

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: session.token,
          model: selectedAgent.model,
          messages: apiMessages,
          maxTokens: 4096,
          agentName: selectedAgent.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.error ?? data.message ?? `Erreur ${res.status}`;
        let userContent: string;
        if (res.status === 402 || data.code === 'INSUFFICIENT_BALANCE') {
          userContent = '💳 Crédits insuffisants. [Rechargez votre compte](/client/finances) pour continuer.';
        } else if (res.status === 429) {
          userContent = '⏳ Trop de requêtes. Veuillez patienter quelques secondes avant de réessayer.';
        } else {
          userContent = `❌ Erreur de communication. Veuillez réessayer. (${errorMsg})`;
        }
        setMessages(prev => [...prev, {
          role: 'system',
          content: userContent,
          timestamp: new Date().toISOString(),
        }]);
      } else {
        const tokens = Number(data.totalTokens ?? 0);
        const cost = Number(data.billedCredits ?? 0);
        setTotalTokens(t => t + tokens);
        setTotalCost(c => c + cost);
        const rawContent = data.content ?? data.text ?? 'Pas de réponse';
        const { cleanContent: contentNoActions, proposals } = parseActionProposals(rawContent);
        const { cleanContent, questions } = parseFollowUps(contentNoActions);
        setFollowUpQuestions(questions);
        setActionProposals(proposals);
        setAcceptedActions(new Set());
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: cleanContent,
          tokens,
          cost,
          timestamp: new Date().toISOString(),
        }]);
        // Track gamification
        const result = recordEvent({ type: 'message', tokens, cost });
        if (result.leveledUp) {
          setMessages(prev => [...prev, {
            role: 'system',
            content: `Niveau ${result.state.level} atteint! Bravo, continuez comme ca!`,
            timestamp: new Date().toISOString(),
          }]);
        }
        if (result.newAchievements.length > 0) {
          setMessages(prev => [...prev, {
            role: 'system',
            content: `Nouveau succès débloqué : ${result.newAchievements.join(', ')}! +50 XP`,
            timestamp: new Date().toISOString(),
          }]);
        }
        // Agent bonding
        if (selectedAgent) {
          const bondResult = recordAgentInteraction(selectedAgent.id);
          if (bondResult.leveledUp) {
            recordEvent({ type: 'agent_bond_levelup' });
            setMessages(prev => [...prev, {
              role: 'system',
              content: `${LEVEL_ICONS[bondResult.bond.relationshipLevel]} Votre relation avec ${selectedAgent.name} a évolué : ${LEVEL_NAMES[bondResult.bond.relationshipLevel]}!`,
              timestamp: new Date().toISOString(),
            }]);
          }
          setAssistantMsgCount(c => c + 1);
        }
        // Check if question asked 3+ times -> suggest FAQ
        if (selectedAgent && trackQuestion(userMsg.content, faqEntries, selectedAgent.id)) {
          setFaqSuggestion(true);
        }
      }
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'system',
        content: `❌ Erreur de connexion: ${e instanceof Error ? e.message : 'inconnue'}`,
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  // ─── SSE Streaming version of sendMessage ───
  async function sendMessageStream() {
    if (!input.trim() || loading || !selectedAgent) return;
    if (sendingRef.current) return;
    sendingRef.current = true;
    if (!requireAuth('Connectez-vous pour envoyer un message')) { sendingRef.current = false; return; }
    const session = getSession();
    if (!session.token) { sendingRef.current = false; return; }

    const userContent = input.trim();
    const userMsg: Message = { role: 'user', content: userContent, timestamp: new Date().toISOString() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    clearInputDraft();
    setFollowUpQuestions([]);
    setFaqMatch(null);
    setFaqSuggestion(false);
    setLoading(true);

    try {
      const conversationMsgs = newMessages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      const truncated = conversationMsgs.length > MAX_CONTEXT_MESSAGES
        ? conversationMsgs.slice(-MAX_CONTEXT_MESSAGES)
        : conversationMsgs;

      // Inject user memories into system prompt if available
      let enrichedSystemPrompt = selectedAgent.systemPrompt;
      try {
        const memoryContext = MemoryService.buildContextForAssistant(selectedAgent.id);
        if (memoryContext) {
          enrichedSystemPrompt = `${memoryContext}\n\n---\n\n${selectedAgent.systemPrompt}`;
        }
      } catch { /* MemoryService error — continue without memory */ }

      const apiMessages = [
        { role: 'user' as const, content: enrichedSystemPrompt },
        { role: 'assistant' as const, content: `Compris, je suis ${selectedAgent.name}, ${selectedAgent.role}. Comment puis-je vous aider?` },
        ...(conversationMsgs.length > MAX_CONTEXT_MESSAGES
          ? [{ role: 'user' as const, content: '[Note: messages précédents résumés pour optimiser les tokens. Concentre-toi sur les messages récents ci-dessous.]' },
             { role: 'assistant' as const, content: 'Compris, je me concentre sur la conversation récente.' }]
          : []),
        ...truncated,
      ];

      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: session.token,
          model: selectedAgent.model,
          messages: apiMessages,
          maxTokens: 4096,
          agentName: selectedAgent.id,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        let errorMsg = `Erreur ${res.status}`;
        try { const data = await res.json(); errorMsg = data.error ?? data.message ?? errorMsg; } catch { /* */ }
        let userContent: string;
        if (res.status === 402) {
          userContent = '💳 Crédits insuffisants. [Rechargez votre compte](/client/finances) pour continuer.';
        } else if (res.status === 429) {
          userContent = '⏳ Trop de requêtes. Veuillez patienter quelques secondes avant de réessayer.';
        } else {
          userContent = `❌ Erreur de communication. Veuillez réessayer. (${errorMsg})`;
        }
        setMessages(prev => [...prev, {
          role: 'system',
          content: userContent,
          timestamp: new Date().toISOString(),
        }]);
        return;
      }

      // Parse SSE stream
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No stream reader');
      const decoder = new TextDecoder();
      let streamedContent = '';
      let streamTokens = 0;
      let streamCost = 0;

      // Add empty assistant message to fill incrementally
      setMessages(prev => [...prev, { role: 'assistant', content: '', tokens: 0, cost: 0, timestamp: new Date().toISOString() }]);

      let buffer = '';
      let currentEvent = '';
      const MAX_STREAM_SIZE = 100 * 1024; // 100KB safety limit
      const streamTimeout = setTimeout(() => controller.abort(), 30000);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (currentEvent === 'done' || dataStr === '[DONE]') { currentEvent = ''; continue; }
            try {
              const data = JSON.parse(dataStr);
              if (currentEvent === 'content_delta' && data.text !== undefined) {
                streamedContent += data.text;
                if (streamedContent.length > MAX_STREAM_SIZE) { controller.abort(); break; }
                const content = streamedContent;
                setMessages(prev => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === 'assistant') {
                    updated[updated.length - 1] = { ...last, content };
                  }
                  return updated;
                });
              } else if (currentEvent === 'message_complete') {
                streamTokens = data.totalTokens ?? 0;
                streamCost = data.billedCredits ?? 0;
              } else if (currentEvent === 'error') {
                setMessages(prev => [...prev, { role: 'system', content: `Erreur: ${data.error}`, timestamp: new Date().toISOString() }]);
              }
            } catch { /* non-JSON */ }
            currentEvent = '';
          }
        }
      }

      clearTimeout(streamTimeout);

      // Finalize: parse actions
      const { cleanContent: contentNoActions, proposals } = parseActionProposals(streamedContent);
      const { cleanContent, questions } = parseFollowUps(contentNoActions);
      setFollowUpQuestions(questions);
      setActionProposals(proposals);
      setAcceptedActions(new Set());
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last && last.role === 'assistant') {
          updated[updated.length - 1] = { ...last, content: cleanContent, tokens: streamTokens, cost: streamCost };
        }
        return updated;
      });
      setTotalTokens(t => t + streamTokens);
      setTotalCost(c => c + streamCost);

      // Gamification
      const result = recordEvent({ type: 'message', tokens: streamTokens, cost: streamCost });
      if (result.leveledUp) {
        setMessages(prev => [...prev, { role: 'system', content: `Niveau ${result.state.level} atteint! Bravo, continuez comme ca!`, timestamp: new Date().toISOString() }]);
      }
      if (result.newAchievements.length > 0) {
        setMessages(prev => [...prev, { role: 'system', content: `Nouveau succès débloqué : ${result.newAchievements.join(', ')}! +50 XP`, timestamp: new Date().toISOString() }]);
      }
      // Agent bonding
      if (selectedAgent) {
        const bondResult = recordAgentInteraction(selectedAgent.id);
        if (bondResult.leveledUp) {
          recordEvent({ type: 'agent_bond_levelup' });
          setMessages(prev => [...prev, {
            role: 'system',
            content: `${LEVEL_ICONS[bondResult.bond.relationshipLevel]} Votre relation avec ${selectedAgent.name} a évolué : ${LEVEL_NAMES[bondResult.bond.relationshipLevel]}!`,
            timestamp: new Date().toISOString(),
          }]);
        }
        setAssistantMsgCount(c => c + 1);
      }
      // Check auto-FAQ suggestion
      if (selectedAgent && trackQuestion(userContent, faqEntries, selectedAgent.id)) {
        setFaqSuggestion(true);
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        // Stream was intentionally aborted (timeout or user action)
      } else {
        setMessages(prev => [...prev, { role: 'system', content: `❌ Erreur de connexion: ${e instanceof Error ? e.message : 'inconnue'}`, timestamp: new Date().toISOString() }]);
      }
    } finally {
      sendingRef.current = false;
      controllerRef.current = null;
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessageStream();
    }
  }

  function saveCurrentConvo() {
    if (messages.length === 0 || !selectedAgent) return;
    const id = currentConvoId ?? Date.now().toString();
    const firstUserMsg = messages.find(m => m.role === 'user');
    const title = firstUserMsg ? firstUserMsg.content.substring(0, 60) + (firstUserMsg.content.length > 60 ? '...' : '') : 'Conversation';
    const entry: ConversationEntry = {
      id, agentId: selectedAgent.id, agentEmoji: selectedAgent.emoji,
      title, messages: messages.slice(-50), date: new Date().toISOString(), totalTokens,
    };
    setHistory(prev => [entry, ...prev.filter(h => h.id !== id)].slice(0, MAX_HISTORY));
    setCurrentConvoId(id);
  }

  function loadConversation(entry: ConversationEntry) {
    // Save current first
    saveCurrentConvo();
    setMessages(entry.messages);
    setTotalTokens(entry.totalTokens);
    setTotalCost(0);
    setCurrentConvoId(entry.id);
    setFollowUpQuestions([]);
    const agent = agents.find(a => a.id === entry.agentId);
    if (agent) setSelectedAgent(agent);
    setShowHistory(false);
  }

  function startNewChat() {
    saveCurrentConvo();
    setMessages([]);
    setTotalTokens(0);
    setTotalCost(0);
    setFollowUpQuestions([]);
    setCurrentConvoId(null);
    setShowHistory(false);
    setFaqSuggestion(false);
  }

  function clearHistory() {
    setHistory([]);
  }

  function copyMessage(content: string, idx: number) {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    }).catch(() => { /* fallback: noop */ });
  }

  // Auto-save conversation after each assistant response (debounced)
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => saveCurrentConvo(), 300);
    }
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  function highlightText(text: string, query: string): React.ReactNode {
    if (!query.trim() || !searchActive) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? <mark key={i} style={{ background: CU.accentLight, color: CU.text, borderRadius: 2 }}>{part}</mark>
        : part
    );
  }

  function exportConversation() {
    if (!selectedAgent || messages.length === 0) return;
    const lines: string[] = [
      `# Conversation avec ${selectedAgent.name} (${selectedAgent.role})`,
      `Date : ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
      '',
    ];
    for (const msg of messages) {
      if (msg.role === 'system') continue;
      const speaker = msg.role === 'user' ? 'Vous' : selectedAgent.name;
      lines.push(`**${speaker}** : ${msg.content}`);
      if (msg.tokens) {
        lines.push(`*${msg.tokens} tokens — ${((msg.cost ?? 0) / 1_000_000).toFixed(4)} crédits*`);
      }
      lines.push('');
    }
    lines.push('---');
    lines.push(`*Total : ${totalTokens.toLocaleString()} tokens — ${(totalCost / 1_000_000).toFixed(4)} crédits*`);
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${selectedAgent.id}-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ─── Agent bottom sheet state ───
  const [showAgentSheet, setShowAgentSheet] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState('auto');

  // Auto-resize textarea
  function handleTextareaInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onInputChange(e.target.value);
    e.target.style.height = 'auto';
    const newHeight = Math.min(e.target.scrollHeight, 200);
    e.target.style.height = newHeight + 'px';
    setTextareaHeight(newHeight + 'px');
  }

  // Reset textarea height after send
  function resetTextareaHeight() {
    setTextareaHeight('auto');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  }

  // Keyboard detection
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;
    const vv = window.visualViewport;
    function onResize() {
      const keyboardOpen = window.innerHeight - (vv?.height ?? window.innerHeight) > 150;
      document.documentElement.classList.toggle('keyboard-open', keyboardOpen);
    }
    vv.addEventListener('resize', onResize);
    return () => vv.removeEventListener('resize', onResize);
  }, []);

  if (!selectedAgent) return <div className="animate-pulse p-24 text-center text-muted">Chargement...</div>;

  if (!isAuthenticated) {
    return (
      <div style={{ padding: isMobile ? '16px 12px' : '24px 32px', maxWidth: 800, margin: '0 auto', background: CU.bg }}>
        <VisitorEmptyState
          icon="💬"
          title="Chat IA — 150+ assistants specialises"
          description="Chattez en temps réel avec vos assistants IA. Créez un compte gratuit pour commencer."
          features={[
            { icon: '🤖', label: 'Agents spécialisés', desc: 'Juridique, comptable, marketing, RH et plus' },
            { icon: '🧠', label: 'Mémoire contextuelle', desc: 'L\'agent retient vos préférences et votre historique' },
            { icon: '⚡', label: 'Réponses instantanées', desc: 'Streaming en temps réel avec suivi de questions' },
          ]}
        />
        {LoginModalComponent}
      </div>
    );
  }

  return (
    <div className="chat-page">
      {/* ═══ PAGE HEADER — compact ═══ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 8, padding: isMobile ? '8px 10px 6px' : '10px 16px 8px', borderBottom: `1px solid ${CU.border}`, background: CU.bg }}>
        <span style={emojiIcon(isMobile ? 14 : 16)}>{PAGE_META.chat.emoji}</span>
        <div style={{ flex: 1 }}>
          <h1 style={{ ...CU.pageTitle, fontSize: isMobile ? 14 : 16, margin: 0 }}>{PAGE_META.chat.title}</h1>
          <p style={{ ...CU.pageSubtitle, fontSize: isMobile ? 10 : 11, margin: 0 }}>{PAGE_META.chat.subtitle}</p>
        </div>
        <HelpBubble text={PAGE_META.chat.helpText} />
      </div>
      <PageExplanation pageId="chat" text={PAGE_META.chat?.helpText} />

      {/* ═══ MODE SWITCHER TABS ═══ */}
      <div className="cu-tabs" style={{ padding: '0 16px' }}>
        <button className={`cu-tab ${chatMode === 'ai' ? 'cu-tab-active' : ''}`} onClick={() => setChatMode('ai')}>
          <span style={{ fontSize: 16 }}>{'\u{1F916}'}</span> Outils IA
        </button>
        <button className={`cu-tab ${chatMode === 'team' ? 'cu-tab-active' : ''}`} onClick={() => setChatMode('team')}>
          <span style={{ fontSize: 16 }}>{'\u{1F465}'}</span> Équipe
        </button>
      </div>

      {chatMode === 'team' && <TeamChat />}

      {chatMode === 'ai' && <>
      {/* ═══ COMPACT HEADER ═══ */}
      <div className="chat-header-compact">
        {/* Agent info — clickable to open agent selector */}
        <div className="chat-header-agent" onClick={() => setShowAgentSheet(true)}>
          <div className="chat-header-agent-avatar" style={{ background: selectedAgent.color + '22' }}>
            {selectedAgent.emoji}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="chat-header-agent-name">
              {selectedAgent.name}
              {selectedAgent.isCustomized && <span style={{ fontSize: 9, marginLeft: 4, color: 'var(--accent)' }}>✨</span>}
            </div>
            <div className="chat-header-agent-status">
              {selectedAgent.role} · {totalTokens.toLocaleString()} tokens
              {(() => {
                const bond = getBond(selectedAgent.id);
                return bond.relationshipLevel > 1 ? ` · ${LEVEL_ICONS[bond.relationshipLevel]} ${LEVEL_NAMES[bond.relationshipLevel]}` : '';
              })()}
            </div>
          </div>
          <span style={{ fontSize: 12, color: 'var(--fz-text-muted, #9B9B9B)' }}>&#9662;</span>
        </div>

        {/* Actions menu */}
        <div className="chat-header-actions" style={{ position: 'relative' }}>
          <button onClick={startNewChat} className="chat-header-action-btn" title="Nouvelle conversation">+</button>
          <button
            onClick={() => setShowActionsMenu(v => !v)}
            className="chat-header-action-btn"
            title="Plus d'options"
          >
            &#8943;
          </button>
          {showActionsMenu && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 4, zIndex: 20,
              background: 'var(--fz-bg, #fff)', border: '1px solid var(--fz-border, #E5E5E5)',
              borderRadius: 'var(--radius-md)',
              backdropFilter: 'blur(12px)',
              minWidth: 180, padding: 4,
            }}>
              <button onClick={() => { setSearchActive(s => !s); setSearchQuery(''); setShowActionsMenu(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--fz-text, #1A1A1A)', borderRadius: 6, fontFamily: 'inherit' }}>
                🔍 Rechercher
              </button>
              {messages.length > 0 && (
                <button onClick={() => { exportConversation(); setShowActionsMenu(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--fz-text, #1A1A1A)', borderRadius: 6, fontFamily: 'inherit' }}>
                  📥 Exporter
                </button>
              )}
              <button onClick={() => { setShowHistory(!showHistory); setShowActionsMenu(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--fz-text, #1A1A1A)', borderRadius: 6, fontFamily: 'inherit' }}>
                🕐 Historique {history.length > 0 && `(${history.length})`}
              </button>
              {faqEntries.length > 0 && (
                <button onClick={() => { setShowFaqPanel(!showFaqPanel); setShowActionsMenu(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--fz-text, #1A1A1A)', borderRadius: 6, fontFamily: 'inherit' }}>
                  💡 FAQ ({faqEntries.filter(e => e.agentId === selectedAgent?.id).length})
                </button>
              )}
              <button onClick={() => { setShowActionsMenu(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--fz-text, #1A1A1A)', borderRadius: 6, fontFamily: 'inherit' }}>
                <Link href="/client/agents/customize" style={{ color: 'inherit', textDecoration: 'none' }}>🎨 Personnaliser</Link>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Close actions menu on click outside */}
      {showActionsMenu && <div onClick={() => setShowActionsMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 15 }} />}

      {/* ═══ SEARCH BAR ═══ */}
      {searchActive && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--fz-bg-secondary, #F7F7F7)', borderBottom: '1px solid var(--fz-border, #E5E5E5)' }}>
          <span style={{ fontSize: 14 }}>🔍</span>
          <input
            autoFocus
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Escape' && (setSearchActive(false), setSearchQuery(''))}
            placeholder="Rechercher dans la conversation..."
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: 'var(--fz-text, #1A1A1A)', fontFamily: 'inherit' }}
          />
          {searchQuery && (
            <span style={{ fontSize: 11, color: 'var(--fz-text-muted, #9B9B9B)' }}>
              {messages.filter(m => m.content.toLowerCase().includes(searchQuery.toLowerCase())).length} résultat(s)
            </span>
          )}
          <button onClick={() => { setSearchActive(false); setSearchQuery(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fz-text-muted, #9B9B9B)', fontSize: 16 }}>✕</button>
        </div>
      )}

      {/* ═══ HISTORY PANEL ═══ */}
      {showHistory && (
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--fz-border, #E5E5E5)', maxHeight: 280, overflowY: 'auto', background: 'var(--fz-bg-secondary, #F7F7F7)', backdropFilter: 'blur(12px)' }}>
          <div className="flex flex-between items-center mb-8">
            <span className="text-md font-bold">Conversations récentes</span>
            <div className="flex gap-4">
              {history.length > 0 && (
                <button onClick={clearHistory} className="btn btn-ghost btn-sm text-xs text-danger">Effacer tout</button>
              )}
              <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fz-text-muted, #9B9B9B)', fontSize: 16 }}>✕</button>
            </div>
          </div>
          {history.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, padding: '5px 8px', background: 'var(--fz-bg, #fff)', borderRadius: 6, border: '1px solid var(--fz-border, #E5E5E5)' }}>
              <span style={{ fontSize: 13 }}>🔍</span>
              <input
                value={historySearchQuery}
                onChange={e => setHistorySearchQuery(e.target.value)}
                placeholder="Rechercher dans l'historique..."
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 12, color: 'var(--fz-text, #1A1A1A)', fontFamily: 'inherit' }}
              />
              {historySearchQuery && <button onClick={() => setHistorySearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fz-text-muted, #9B9B9B)', fontSize: 13 }}>✕</button>}
            </div>
          )}
          {history.length === 0 ? (
            <div className="text-sm text-muted" style={{ padding: '8px 0' }}>Aucune conversation sauvegardée</div>
          ) : (
            <div className="flex flex-col gap-4">
              {history
                .filter(h => !historySearchQuery.trim() || h.title.toLowerCase().includes(historySearchQuery.toLowerCase()) || h.messages.some(m => m.content.toLowerCase().includes(historySearchQuery.toLowerCase())))
                .map(h => {
                const matchMsg = historySearchQuery.trim()
                  ? h.messages.find(m => m.content.toLowerCase().includes(historySearchQuery.toLowerCase()))
                  : null;
                return (
                <button
                  key={h.id}
                  onClick={() => loadConversation(h)}
                  className="flex items-center gap-8 rounded-sm border pointer w-full"
                  style={{
                    padding: '8px 12px',
                    background: h.id === currentConvoId ? 'var(--accent-muted)' : 'var(--fz-bg, #fff)',
                    textAlign: 'left', fontFamily: 'var(--font-sans)',
                  }}
                >
                  <span className="text-lg">{h.agentEmoji}</span>
                  <div className="flex-1" style={{ minWidth: 0 }}>
                    <div className="text-sm font-semibold truncate">{h.title}</div>
                    <div className="text-xs text-muted">
                      {h.messages.length} msg · {new Date(h.date).toLocaleDateString('fr-FR')}
                    </div>
                    {matchMsg && (
                      <div className="text-xs" style={{ color: 'var(--accent)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        ...{matchMsg.content.substring(Math.max(0, matchMsg.content.toLowerCase().indexOf(historySearchQuery.toLowerCase()) - 20), Math.min(matchMsg.content.length, matchMsg.content.toLowerCase().indexOf(historySearchQuery.toLowerCase()) + 60))}...
                      </div>
                    )}
                  </div>
                </button>
              );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══ FAQ PANEL ═══ */}
      {showFaqPanel && selectedAgent && (
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--fz-border, #E5E5E5)', maxHeight: 250, overflowY: 'auto', background: 'var(--fz-bg-secondary, #F7F7F7)', backdropFilter: 'blur(12px)' }}>
          <div className="flex flex-between items-center mb-8">
            <span className="text-md font-bold">💡 FAQ de {selectedAgent.name}</span>
            <button onClick={() => setShowFaqPanel(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fz-text-muted, #9B9B9B)', fontSize: 16 }}>✕</button>
          </div>
          <div className="text-xs text-muted mb-8">Réponses gratuites (0 token)</div>
          {faqEntries.filter(e => e.agentId === selectedAgent.id).length === 0 ? (
            <div className="text-sm text-muted" style={{ padding: '8px 0' }}>
              Aucune FAQ pour cet assistant. Cliquez &laquo; FAQ &raquo; sur une réponse pour la sauvegarder.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {faqEntries.filter(e => e.agentId === selectedAgent.id).map(entry => (
                <div key={entry.id} className="rounded-sm border" style={{ padding: '8px 12px', background: 'var(--fz-bg, #fff)' }}>
                  <div className="flex flex-between items-center">
                    <div className="text-sm font-semibold" style={{ flex: 1, minWidth: 0 }}>
                      Q: {entry.question.substring(0, 80)}{entry.question.length > 80 ? '...' : ''}
                    </div>
                    <div className="flex gap-4 items-center">
                      <span className="text-xs text-success">Utilisée {entry.usedCount}x</span>
                      <button onClick={() => deleteFaqEntry(entry.id)} className="text-xs text-danger pointer"
                        style={{ background: 'none', border: 'none', fontFamily: 'var(--font-sans)' }}>✕</button>
                    </div>
                  </div>
                  <div className="text-xs text-muted truncate mt-4">R: {entry.answer.substring(0, 120)}...</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ VISIO TAB ═══ */}
      {commMode === 'visio' && (
        <div className="flex-1" style={{ overflowY: 'auto', padding: '24px 16px' }}>
          <div style={{ marginBottom: 20 }}>
            <h2 className="text-lg font-bold" style={{ marginBottom: 6 }}>Appel vocal avec vos <span className="fz-logo-word">assistants</span></h2>
            <p className="text-sm text-secondary" style={{ lineHeight: 1.6 }}>
              Parlez en temps réel avec vos assistants IA. Micro + synthèse vocale <span className="fz-logo-word">ElevenLabs</span>.
            </p>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10,
              padding: '5px 10px', borderRadius: 8, background: 'var(--warning-muted)', border: '1px solid var(--warning)',
              fontSize: 11, color: 'var(--warning)',
            }}>
              Consomme ~3x plus de crédits (STT + LLM + TTS)
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: 14 }}>
            {ALL_AGENTS.map(agent => (
              <Link key={agent.id} href={`/client/visio/${agent.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card card-lift" style={{ padding: 16, textAlign: 'center' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%', margin: '0 auto 10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${agent.color}15`, border: `2px solid ${agent.color}40`, fontSize: 24,
                  }}>
                    {agent.emoji}
                  </div>
                  <div className="text-sm font-bold">{agent.name}</div>
                  <div className="text-xs text-muted" style={{ marginTop: 2 }}>{agent.role}</div>
                  <div className="text-xs font-semibold mt-8" style={{ color: agent.color, padding: '3px 8px', borderRadius: 6, background: `${agent.color}10`, display: 'inline-block' }}>
                    Appeler
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ═══ WHATSAPP TAB ═══ */}
      {commMode === 'whatsapp' && (
        <div className="flex-1 flex flex-center" style={{ padding: '40px 20px' }}>
          <div className="card" style={{ padding: 32, maxWidth: 500, textAlign: 'center' }}>
            <div style={{ marginBottom: 16, fontSize: 48 }}>📱</div>
            <h2 className="text-xl font-bold mb-8">WhatsApp Business</h2>
            <p className="text-sm text-secondary mb-16" style={{ lineHeight: 1.6 }}>
              Discutez avec vos <span className="fz-logo-word">assistants IA</span> directement depuis WhatsApp.
            </p>
            <div className="flex flex-col gap-8 mb-20" style={{ textAlign: 'left' }}>
              {['Messages texte et vocaux', 'Briefings quotidiens', 'Alertes en temps réel', 'Support multi-agents', 'Répondeur IA intégré'].map(f => (
                <div key={f} className="flex items-center gap-8 text-sm"><span style={{ fontSize: 14 }}>✅</span> {f}</div>
              ))}
            </div>
            <Link href="/client/whatsapp" className="btn btn-primary">Configurer WhatsApp →</Link>
          </div>
        </div>
      )}

      {/* ═══ REPONDEUR TAB ═══ */}
      {commMode === 'repondeur' && (
        <div className="flex-1 flex flex-center" style={{ padding: '40px 20px' }}>
          <div className="card" style={{ padding: 32, maxWidth: 500, textAlign: 'center' }}>
            <div style={{ marginBottom: 16, fontSize: 48 }}>📞</div>
            <h2 className="text-xl font-bold mb-8">Répondeur <span className="fz-logo-word">IA</span></h2>
            <p className="text-sm text-secondary mb-16" style={{ lineHeight: 1.6 }}>
              Votre standard téléphonique <span className="fz-logo-word">intelligent 24/7</span>.
            </p>
            <div className="flex flex-col gap-8 mb-20" style={{ textAlign: 'left' }}>
              {['7 modes de fonctionnement', '7 styles de réponse', '10 compétences IA', 'FAQ automatique', 'Détection VIP & anti-spam', 'Résumés horaires/quotidiens', 'Intégration Twilio complète'].map(f => (
                <div key={f} className="flex items-center gap-8 text-sm"><span style={{ fontSize: 14 }}>✅</span> {f}</div>
              ))}
            </div>
            <Link href="/client/repondeur" className="btn btn-primary">Configurer le répondeur →</Link>
          </div>
        </div>
      )}

      {/* ═══ CHAT TAB ═══ */}
      {commMode === 'chat' && <>

      {/* Messages Area */}
      <div className="chat-messages-area">
        {messages.length === 0 && (
          <div className="text-center text-tertiary" style={{ padding: '40px 12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <div className="mb-16" style={{ fontSize: 48 }}>{selectedAgent.emoji}</div>
            <div className="text-xl font-semibold mb-8" style={{ color: 'var(--fz-text, #1A1A1A)' }}>
              Bonjour, je suis {selectedAgent.name}
            </div>
            <div className="text-base" style={{ maxWidth: 400, margin: '0 auto', lineHeight: 1.6, color: 'var(--fz-text-secondary, #6B6B6B)' }}>
              Votre {selectedAgent.role}. Posez-moi vos questions, demandez-moi de rédiger, analyser, planifier...
            </div>
            {/* Agent Modes */}
            {(() => {
              const agentDef = DEFAULT_AGENTS.find(a => a.id === selectedAgent.id);
              if (!agentDef?.modes?.length) return null;
              return (
                <div className="flex gap-8 flex-center flex-wrap mt-16">
                  {agentDef.modes.map(mode => (
                    <div key={mode.id} className="rounded-md bg-secondary border text-sm" style={{ padding: '10px 14px', maxWidth: 200, textAlign: 'left' }}>
                      <div className="font-bold" style={{ marginBottom: 2 }}>{mode.icon} {mode.name}</div>
                      <div className="text-xs text-muted">{mode.description}</div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Suggested questions */}
            <div className="flex gap-8 flex-center flex-wrap mt-24">
              {(selectedAgent.id === 'fz-repondeur' ? [
                'Configure mon message d\'accueil',
                'Comment gerer les appels manques ?',
                'Cree une FAQ pour mes clients',
                'Quels horaires d\'ouverture recommandes-tu ?',
              ] : selectedAgent.id === 'fz-assistante' ? [
                'Rédige un email professionnel',
                'Organise mon planning de la semaine',
                'Prepare un compte-rendu de reunion',
                'Conseille-moi sur ma productivite',
              ] : selectedAgent.id === 'fz-commercial' ? [
                'Rédige un email de prospection',
                'Comment améliorer mon taux de closing ?',
                'Structure mon pipeline commercial',
                'Prepare mon pitch de vente',
              ] : selectedAgent.id === 'fz-marketing' ? [
                'Fais-moi un plan marketing',
                'Cree un post LinkedIn',
                'Analyse ma strategie SEO',
                'Comment booster ma visibilite ?',
              ] : selectedAgent.id === 'fz-rh' ? [
                'Rédige une fiche de poste',
                'Prepare mes questions d\'entretien',
                'Cree un plan de formation',
                'Comment améliorer ma marque employeur ?',
              ] : selectedAgent.id === 'fz-communication' ? [
                'Rédige un communiqué de presse',
                'Prepare ma communication interne',
                'Comment gerer une crise mediatique ?',
                'Cree une newsletter',
              ] : selectedAgent.id === 'fz-finance' ? [
                'Analyse mes dépenses du mois',
                'Prepare un prévisionnel',
                'Comment optimiser ma trésorerie ?',
                'Quels KPIs financiers suivre ?',
              ] : selectedAgent.id === 'fz-dev' ? [
                'Review mon architecture technique',
                'Conseille-moi sur le choix de stack',
                'Comment améliorer mes performances ?',
                'Planifie ma roadmap technique',
              ] : selectedAgent.id === 'fz-juridique' ? [
                'Revois mon contrat commercial',
                'Suis-je conforme au RGPD ?',
                'Rédige mes CGV',
                'Quels risques juridiques anticiper ?',
              ] : selectedAgent.id === 'fz-dg' ? [
                'Quelle strategie pour ce trimestre ?',
                'Analyse mon positionnement marche',
                'Comment structurer ma croissance ?',
                'Conseille-moi sur la levee de fonds',
              ] : selectedAgent.id === 'fz-qualite' ? [
                'Lance un audit qualite interne',
                'Analyse cette non-conformite avec Ishikawa',
                'Prepare ma certification ISO 9001',
                'Cree un plan DMAIC pour ce probleme',
              ] : selectedAgent.id === 'fz-data' ? [
                'Analyse ce dataset et trouve des insights',
                'Concois un dashboard pour mes KPIs',
                'Quel modele ML pour ce probleme ?',
                'Aide-moi a structurer ma data governance',
              ] : selectedAgent.id === 'fz-product' ? [
                'Structure ma roadmap produit Q2',
                'Priorise mon backlog avec RICE',
                'Redige des user stories pour cette feature',
                'Lance un discovery sprint',
              ] : selectedAgent.id === 'fz-csm' ? [
                'Analyse le risque de churn de mes clients',
                'Structure mon onboarding client',
                'Prepare une QBR pour ce client',
                'Comment ameliorer mon NPS ?',
              ] : selectedAgent.id === 'fz-rse' ? [
                'Realise mon bilan carbone simplifie',
                'Prepare mon reporting CSRD',
                'Definis ma strategie RSE',
                'Quels ODD prioriser pour mon secteur ?',
              ] : selectedAgent.id === 'fz-operations' ? [
                'Optimise ce processus avec le Lean',
                'Cartographie ma supply chain',
                'Identifie les goulots d\'etranglement',
                'Planifie ce projet complexe',
              ] : selectedAgent.id === 'fz-design' ? [
                'Cree un brief creatif pour ce projet',
                'Audite l\'UX de mon application',
                'Structure mon design system',
                'Comment ameliorer l\'accessibilite ?',
              ] : selectedAgent.id === 'fz-formation' ? [
                'Concois un module de formation',
                'Elabore mon plan de formation annuel',
                'Evalue l\'impact de cette formation',
                'Cree un parcours d\'onboarding',
              ] : selectedAgent.id === 'fz-innovation' ? [
                'Anime un Design Sprint',
                'Genere des idees avec SCAMPER',
                'Evalue cette idee avec Impact/Effort',
                'Definis un MVP pour ce concept',
              ] : selectedAgent.id === 'fz-international' ? [
                'Analyse ce marche etranger (PESTEL)',
                'Quel mode d\'entree pour ce pays ?',
                'Adapte ma strategie a cette culture',
                'Aide-moi avec les Incoterms',
              ] : [
                'Pose-moi ta question',
                'Comment puis-je t\'aider ?',
                'De quoi as-tu besoin ?',
                'Décris-moi ton problème',
              ]).map(q => (
                <button key={q} onClick={() => { setInput(q); inputRef.current?.focus(); }}
                  className="chat-guided-option">
                  {q}
                </button>
              ))}
            </div>

            {/* Reunions multi-agents */}
            <div style={{ marginTop: 32, textAlign: 'left', maxWidth: 600, margin: '32px auto 0' }}>
              <div className="flex items-center gap-8 mb-8" style={{ justifyContent: 'center' }}>
                <span style={{ fontSize: 20 }}>🏛️</span>
                <span className="text-base font-bold" style={{ color: 'var(--fz-text, #1A1A1A)' }}>Reunions multi-assistants</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(170px, 100%), 1fr))', gap: 8 }}>
                {([
                  { id: 'lancement-projet', emoji: '🚀', title: 'Lancement de projet', desc: 'Scope, roles et timeline' },
                  { id: 'revue-trimestrielle', emoji: '📊', title: 'Revue trimestrielle', desc: 'Resultats et strategie' },
                  { id: 'brainstorming-produit', emoji: '💡', title: 'Brainstorming', desc: 'Idees innovantes' },
                  { id: 'resolution-crise', emoji: '🛡️', title: 'Resolution de crise', desc: 'Situation urgente' },
                  { id: 'planification-annuelle', emoji: '📅', title: 'Planification', desc: 'Vision et objectifs' },
                  { id: 'partenariat-strategique', emoji: '🤝', title: 'Partenariat', desc: 'Opportunites' },
                ] as const).map(tpl => (
                  <Link key={tpl.id} href={`/client/meeting?template=${tpl.id}`} style={{
                    display: 'block', padding: '10px 12px', borderRadius: 8,
                    border: '1px solid var(--fz-border, #E5E5E5)', background: 'var(--fz-bg-secondary, #F7F7F7)',
                    textDecoration: 'none', color: 'inherit', transition: 'border-color 0.15s',
                  }}>
                    <div className="text-sm font-semibold">{tpl.emoji} {tpl.title}</div>
                    <div className="text-xs text-muted">{tpl.desc}</div>
                  </Link>
                ))}
              </div>
              <div style={{ marginTop: 10, textAlign: 'center' }}>
                <Link href="/client/meeting" className="btn btn-primary btn-sm" style={{ fontSize: 12 }}>
                  Lancer une reunion
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-6 mt-16" style={{ justifyContent: 'center' }}>
              <span className="text-xs text-muted">📱 Vous pouvez aussi discuter via</span>
              <Link href="/client/whatsapp" className="text-xs font-semibold" style={{ color: 'var(--accent)', textDecoration: 'none' }}>WhatsApp</Link>
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((msg, i) => (
          <div key={i}>
            <div className={`chat-msg ${msg.role === 'user' ? 'chat-msg-user' : msg.role === 'assistant' ? 'chat-msg-assistant' : ''}`}
              style={msg.role === 'system' ? { alignSelf: 'center', maxWidth: '90%' } : undefined}>
              {msg.role === 'assistant' && (
                <div className="chat-msg-avatar" style={{ background: selectedAgent.color + '22' }}>
                  {selectedAgent.emoji}
                </div>
              )}
              <div>
                <div className="chat-msg-content" style={
                  msg.role === 'system' ? {
                    background: 'var(--danger-muted)', color: 'var(--danger)',
                    borderRadius: 'var(--radius-md)', fontSize: 13, fontStyle: 'italic',
                  } : undefined
                }>
                  {msg.role === 'assistant' && !(searchActive && searchQuery) ? (
                    <div>
                      <MarkdownContent content={msg.content} />
                      {loading && i === messages.length - 1 && msg.content && (
                        <span className="chat-typing-cursor" />
                      )}
                    </div>
                  ) : (
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {searchActive && searchQuery ? highlightText(msg.content, searchQuery) : msg.content}
                      {loading && i === messages.length - 1 && msg.role === 'assistant' && msg.content && (
                        <span className="chat-typing-cursor" />
                      )}
                    </div>
                  )}
                </div>
                {/* Meta info — timestamp + actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                  <div className="chat-msg-timestamp">
                    {msg.timestamp && new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    {msg.tokens ? ` · ${msg.tokens} tokens · ${((msg.cost ?? 0) / 1_000_000).toFixed(4)} cr` : ''}
                  </div>
                  {msg.role === 'assistant' && (
                    <div className="chat-msg-actions">
                      <AudioPlayback text={msg.content} gender={selectedAgent?.gender ?? 'F'} size="sm" />
                      {msg.isFaq && (
                        <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: CU.accentLight, color: CU.text, fontWeight: 600 }}>
                          FAQ
                        </span>
                      )}
                      <button onClick={() => copyMessage(msg.content, i)}
                        style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, cursor: 'pointer', background: 'none', border: '1px solid var(--fz-border, #E5E5E5)', color: copiedIdx === i ? 'var(--success)' : 'var(--fz-text-muted, #9B9B9B)', fontFamily: 'var(--font-sans)', transition: 'all 0.15s' }}
                        title="Copier">
                        {copiedIdx === i ? '✅' : '📋'}
                      </button>
                      {!msg.isFaq && i > 0 && messages[i - 1]?.role === 'user' && (
                        <button onClick={() => saveAsFaq(i - 1, i)}
                          style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, cursor: 'pointer', background: 'none', border: '1px solid var(--fz-border, #E5E5E5)', color: savedFaqIdx === i ? '#1A1A1A' : 'var(--fz-text-muted, #9B9B9B)', fontFamily: 'var(--font-sans)', transition: 'all 0.15s' }}
                          title="Sauvegarder en FAQ">
                          {savedFaqIdx === i ? '✅' : '💾'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Feedback buttons every 5th assistant message */}
            {msg.role === 'assistant' && (() => {
              const assistantIdx = messages.slice(0, i + 1).filter(m => m.role === 'assistant').length;
              return assistantIdx > 0 && assistantIdx % 5 === 0 && !feedbackGiven[i];
            })() && (
              <div style={{ display: 'flex', gap: 6, marginTop: 6, paddingLeft: 38 }}>
                <button
                  onClick={() => { if (selectedAgent) { recordFeedback(selectedAgent.id, true); recordEvent({ type: 'agent_feedback' }); } setFeedbackGiven(prev => ({ ...prev, [i]: 'positive' })); }}
                  style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, cursor: 'pointer', border: '1px solid var(--fz-border, #E5E5E5)', background: 'var(--fz-bg-secondary, #F7F7F7)', color: 'var(--fz-text-secondary, #6B6B6B)', fontFamily: 'var(--font-sans)' }}>
                  Utile 👍
                </button>
                <button
                  onClick={() => { if (selectedAgent) { recordFeedback(selectedAgent.id, false); recordEvent({ type: 'agent_feedback' }); } setFeedbackGiven(prev => ({ ...prev, [i]: 'negative' })); }}
                  style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, cursor: 'pointer', border: '1px solid var(--fz-border, #E5E5E5)', background: 'var(--fz-bg-secondary, #F7F7F7)', color: 'var(--fz-text-secondary, #6B6B6B)', fontFamily: 'var(--font-sans)' }}>
                  A ameliorer 👎
                </button>
              </div>
            )}
            {feedbackGiven[i] && (
              <div style={{ fontSize: 11, color: feedbackGiven[i] === 'positive' ? CU.text : CU.textSecondary, marginTop: 4, fontWeight: 500, paddingLeft: 38 }}>
                {feedbackGiven[i] === 'positive' ? <>🙏 Merci pour votre retour !</> : 'Noté, on va s\'améliorer !'}
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {loading && !(messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' && messages[messages.length - 1]?.content) && (
          <div className="chat-msg chat-msg-assistant">
            <div className="chat-msg-avatar" style={{ background: selectedAgent.color + '22' }}>
              {selectedAgent.emoji}
            </div>
            <div className="chat-msg-content" style={{ background: 'var(--fz-bg-secondary, #F7F7F7)' }}>
              <div className="animate-pulse text-tertiary" style={{ fontSize: 14 }}>
                {selectedAgent.name} réfléchit...
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ═══ GUIDED OPTIONS ZONE (above input) ═══ */}

      {/* Action Proposals */}
      {actionProposals.length > 0 && !loading && (
        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--fz-border, #E5E5E5)', background: 'var(--fz-bg-secondary, #F7F7F7)', backdropFilter: 'blur(12px)', maxHeight: isMobile ? 100 : 200, overflowY: 'auto' }}>
          <div className="flex flex-between items-center mb-4">
            <span className="text-sm font-semibold" style={{ color: 'var(--fz-text-secondary, #6B6B6B)' }}>
              Actions proposées ({actionProposals.length})
            </span>
            {actionProposals.length > 1 && (
              <button
                disabled={actionSaving || acceptedActions.size === actionProposals.length}
                onClick={async () => {
                  setActionSaving(true);
                  try {
                    const token = (() => { try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}').token; } catch { return undefined; } })();
                    const actions = actionProposals.map(p => ({
                      type: p.type, title: p.title, description: p.description,
                      priority: p.priority, dueDate: p.dueDate, sourceAgent: selectedAgent?.id ?? 'unknown',
                    }));
                    const res = await fetch('/api/portal/actions/batch', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                      body: JSON.stringify({ actions }),
                    });
                    if (res.ok) setAcceptedActions(new Set(actionProposals.map((_, i) => i)));
                  } catch {}
                  setActionSaving(false);
                }}
                className="btn btn-sm" style={{ fontSize: 11, background: 'var(--accent)', color: 'white', borderColor: 'var(--accent)' }}>
                Tout accepter
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, WebkitOverflowScrolling: 'touch' }}>
            {actionProposals.map((p, i) => (
              <div key={i} className="rounded-sm" style={{
                padding: '8px 12px', minWidth: 220, flexShrink: 0,
                border: acceptedActions.has(i) ? '1px solid var(--success)' : '1px solid var(--fz-border, #E5E5E5)',
                background: acceptedActions.has(i) ? 'var(--success-muted)' : 'var(--fz-bg, #fff)',
                opacity: acceptedActions.has(i) ? 0.7 : 1,
              }}>
                <div className="flex items-center gap-6 mb-2">
                  <span style={{ fontSize: 14 }}>{ACTION_TYPE_ICONS[p.type] ?? '⚡'}</span>
                  <span className="text-xs font-semibold" style={{ flex: 1 }}>{p.title}</span>
                  <span className="text-xs" style={{ padding: '1px 4px', borderRadius: 3, background: `${PRIORITY_COLORS[p.priority]}22`, color: PRIORITY_COLORS[p.priority] }}>
                    {PRIORITY_LABELS[p.priority] ?? p.priority}
                  </span>
                </div>
                {p.description && <p className="text-xs mb-2" style={{ color: 'var(--fz-text-secondary, #6B6B6B)', lineHeight: 1.3 }}>{p.description}</p>}
                <div className="flex flex-between items-center">
                  <span className="text-xs" style={{ color: 'var(--fz-text-muted, #9B9B9B)' }}>{ACTION_TYPE_LABELS[p.type] ?? p.type}{p.dueDate ? ` · ${formatDueDate(p.dueDate)}` : ''}</span>
                  {acceptedActions.has(i) ? (
                    <span style={{ fontSize: 14, color: 'var(--success)' }}>✅</span>
                  ) : (
                    <button disabled={actionSaving} onClick={async () => {
                      setActionSaving(true);
                      try {
                        const token = (() => { try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}').token; } catch { return undefined; } })();
                        const res = await fetch('/api/portal/actions', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                          body: JSON.stringify({ type: p.type, title: p.title, description: p.description, priority: p.priority, dueDate: p.dueDate, sourceAgent: selectedAgent?.id ?? 'unknown' }),
                        });
                        if (res.ok) setAcceptedActions(prev => new Set([...prev, i]));
                      } catch {}
                      setActionSaving(false);
                    }} className="btn btn-sm" style={{ fontSize: 10, background: 'var(--accent)', color: 'white', borderColor: 'var(--accent)', padding: '2px 8px' }}>
                      Accepter
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {acceptedActions.size > 0 && (
            <div className="text-xs mt-4" style={{ color: 'var(--success)' }}>
              {acceptedActions.size} action{acceptedActions.size > 1 ? 's' : ''} ajoutée{acceptedActions.size > 1 ? 's' : ''} —{' '}
              <Link href="/client/actions" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Voir le centre d&apos;actions</Link>
            </div>
          )}
        </div>
      )}

      {/* Follow-up Questions */}
      {followUpQuestions.length > 0 && !loading && (
        <div className="chat-guided-options">
          <div className="chat-guided-options-list">
            {followUpQuestions.map((q, i) => (
              <button key={i} onClick={() => { setInput(q); inputRef.current?.focus(); }} className="chat-guided-option">
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Auto-FAQ suggestion */}
      {faqSuggestion && !loading && messages.length >= 2 && (
        <div className="flex flex-between items-center flex-wrap gap-6" style={{
          padding: '6px 16px', background: 'var(--info-muted)', borderTop: '1px solid var(--info)',
        }}>
          <span className="text-xs font-medium" style={{ color: 'var(--info)' }}>
            💡 Question fréquente ! Sauvegardez en FAQ (gratuit).
          </span>
          <div className="flex gap-4">
            <button onClick={() => {
              const lastAssistantIdx = messages.length - 1;
              const lastUserIdx = messages.length - 2;
              if (messages[lastAssistantIdx]?.role === 'assistant' && messages[lastUserIdx]?.role === 'user') saveAsFaq(lastUserIdx, lastAssistantIdx);
              setFaqSuggestion(false);
            }} className="btn btn-sm" style={{ fontSize: 10, background: 'var(--accent)', color: 'white', borderColor: 'var(--accent)' }}>
              Sauvegarder
            </button>
            <button onClick={() => setFaqSuggestion(false)} className="btn btn-ghost btn-sm" style={{ fontSize: 10 }}>Ignorer</button>
          </div>
        </div>
      )}

      {/* FAQ match hint */}
      {faqMatch && !loading && (
        <div className="flex flex-between items-center flex-wrap gap-6" style={{
          padding: '6px 16px', background: CU.bgSecondary, borderTop: `1px solid ${CU.border}`,
        }}>
          <span className="text-xs font-semibold text-success">💡 FAQ trouvée — 0 token</span>
          <div className="flex gap-4">
            <button onClick={() => useFaqAnswer(faqMatch)} className="btn btn-sm"
              style={{ fontSize: 10, background: CU.accent, color: '#fff', borderColor: CU.accent }}>Utiliser FAQ</button>
            <button onClick={() => setFaqMatch(null)} className="btn btn-ghost btn-sm" style={{ fontSize: 10 }}>IA</button>
          </div>
        </div>
      )}

      {/* ═══ INPUT BAR — ChatGPT-like ═══ */}
      <div className="chat-input-bar">
        <button className="chat-input-action" onClick={() => setShowActionsMenu(v => !v)} title="Plus d'options">
          +
        </button>
        <div className="chat-input-wrapper">
          <textarea
            ref={inputRef}
            className="chat-input-textarea"
            value={input}
            onChange={handleTextareaInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessageStream();
                resetTextareaHeight();
              }
            }}
            placeholder={`Écrivez à ${selectedAgent?.name ?? 'votre assistant'}...`}
            rows={1}
            style={{ height: textareaHeight }}
          />
        </div>
        <div className="chat-send-modes">
          {input.trim() ? (
            <button className="chat-send-btn chat-send-text" onClick={() => { sendMessageStream(); resetTextareaHeight(); }} title="Envoyer">
              📤
            </button>
          ) : (
            <>
              <VoiceInput
                onTranscript={(t) => setInput(prev => prev ? prev + ' ' + t : t)}
                disabled={loading}
                size="sm"
              />
              <Link href={`/client/visio/${selectedAgent?.id ?? 'fz-assistante'}`}>
                <button className="chat-send-btn chat-send-visio" title="Appel visio">
                  📹
                </button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mode pills */}
      <div className="chat-mode-bar">
        {COMM_TABS.map(tab => (
          <button
            key={tab.id}
            className={`chat-mode-pill ${commMode === tab.id ? 'active' : ''}`}
            onClick={() => setCommMode(tab.id)}
          >
            <span style={{ fontSize: 14 }}>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      </>}

      {/* ═══ AGENT BOTTOM SHEET ═══ */}
      {showAgentSheet && <>
        <div className="agent-bottom-sheet-overlay open" onClick={() => setShowAgentSheet(false)} />
        <div className="agent-bottom-sheet open">
          <div className="agent-bottom-sheet-handle" />
          <div style={{ ...CU.sectionTitle, marginBottom: 12 }}>Choisir un assistant</div>
          {agents.map(agent => (
            <div
              key={agent.id}
              className={`agent-bottom-sheet-item ${selectedAgent.id === agent.id ? 'active' : ''}`}
              onClick={() => { setSelectedAgent(agent); setShowAgentSheet(false); }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: agent.color + '22', fontSize: 18, flexShrink: 0,
              }}>
                {agent.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{agent.name}</div>
                <div style={{ fontSize: 12, color: 'var(--fz-text-muted, #9B9B9B)' }}>{agent.role}</div>
              </div>
              {agent.isCustomized && <span style={{ fontSize: 10, color: 'var(--accent)' }}>✨ Perso</span>}
              {selectedAgent.id === agent.id && <span style={{ color: 'var(--accent)', fontSize: 16 }}>✅</span>}
            </div>
          ))}
        </div>
      </>}
      </>}
      {LoginModalComponent}
      <PageBlogSection pageId="chat" />
    </div>
  );
}
