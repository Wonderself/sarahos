'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  replies?: Comment[];
}

interface CommentsProps {
  entityId: string;
  entityType: string;
}

const MOCK_USERS = [
  { id: 'user-1', name: 'Alice Martin' },
  { id: 'user-2', name: 'Bruno Dupont' },
  { id: 'user-3', name: 'Claire Bernard' },
  { id: 'user-4', name: 'David Leroy' },
  { id: 'user-5', name: 'Emma Moreau' },
];

const CURRENT_USER_ID = 'user-1';
const CURRENT_USER_NAME = 'Alice Martin';

function getStorageKey(entityType: string, entityId: string): string {
  return `sarah_comments_${entityType}_${entityId}`;
}

function loadComments(entityType: string, entityId: string): Comment[] {
  try {
    const raw = localStorage.getItem(getStorageKey(entityType, entityId));
    if (raw) return JSON.parse(raw);
  } catch { /* corrupted data */ }
  return [];
}

function saveComments(entityType: string, entityId: string, comments: Comment[]): void {
  try {
    localStorage.setItem(getStorageKey(entityType, entityId), JSON.stringify(comments));
  } catch { /* localStorage unavailable */ }
}

function generateId(): string {
  return `cmt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "a l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  if (diffHour < 24) return `il y a ${diffHour}h`;
  if (diffDay < 7) return `il y a ${diffDay}j`;
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function avatarColor(userId: string): string {
  const colors = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#16a34a', '#2563eb', '#9333ea'];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function Comments({ entityId, entityType }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [activeMentionField, setActiveMentionField] = useState<'new' | 'reply' | 'edit' | null>(null);
  const newCommentRef = useRef<HTMLTextAreaElement>(null);
  const replyRef = useRef<HTMLTextAreaElement>(null);
  const editRef = useRef<HTMLTextAreaElement>(null);
  const mentionDropdownRef = useRef<HTMLDivElement>(null);

  // Load comments from localStorage
  useEffect(() => {
    setComments(loadComments(entityType, entityId));
  }, [entityType, entityId]);

  // Persist comments
  const persistComments = useCallback((updated: Comment[]) => {
    setComments(updated);
    saveComments(entityType, entityId, updated);
  }, [entityType, entityId]);

  // Handle @ mention detection
  function handleMentionInput(value: string, field: 'new' | 'reply' | 'edit') {
    const cursorPos = field === 'new'
      ? newCommentRef.current?.selectionStart ?? value.length
      : field === 'reply'
        ? replyRef.current?.selectionStart ?? value.length
        : editRef.current?.selectionStart ?? value.length;

    const textBeforeCursor = value.slice(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');

    if (atIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(atIndex + 1);
      // Only show dropdown if @ is at start or preceded by a space, and no space in the filter
      if ((atIndex === 0 || textBeforeCursor[atIndex - 1] === ' ') && !textAfterAt.includes(' ')) {
        setMentionFilter(textAfterAt.toLowerCase());
        setShowMentionDropdown(true);
        setActiveMentionField(field);
        return;
      }
    }
    setShowMentionDropdown(false);
    setActiveMentionField(null);
  }

  function insertMention(userName: string) {
    const getRef = () => {
      if (activeMentionField === 'new') return { ref: newCommentRef, value: newComment, setter: setNewComment };
      if (activeMentionField === 'reply') return { ref: replyRef, value: replyContent, setter: setReplyContent };
      if (activeMentionField === 'edit') return { ref: editRef, value: editContent, setter: setEditContent };
      return null;
    };

    const fieldInfo = getRef();
    if (!fieldInfo) return;

    const { ref, value, setter } = fieldInfo;
    const cursorPos = ref.current?.selectionStart ?? value.length;
    const textBeforeCursor = value.slice(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');

    if (atIndex !== -1) {
      const before = value.slice(0, atIndex);
      const after = value.slice(cursorPos);
      setter(`${before}@${userName} ${after}`);
    }

    setShowMentionDropdown(false);
    setActiveMentionField(null);
    setTimeout(() => ref.current?.focus(), 0);
  }

  const filteredUsers = MOCK_USERS.filter(u =>
    u.name.toLowerCase().includes(mentionFilter)
  );

  // Add new comment
  function handleAddComment() {
    const trimmed = newComment.trim();
    if (!trimmed) return;

    const comment: Comment = {
      id: generateId(),
      userId: CURRENT_USER_ID,
      userName: CURRENT_USER_NAME,
      content: trimmed,
      createdAt: new Date().toISOString(),
      replies: [],
    };

    persistComments([comment, ...comments]);
    setNewComment('');
  }

  // Add reply to a comment
  function handleAddReply(parentId: string) {
    const trimmed = replyContent.trim();
    if (!trimmed) return;

    const reply: Comment = {
      id: generateId(),
      userId: CURRENT_USER_ID,
      userName: CURRENT_USER_NAME,
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    const updated = comments.map(c => {
      if (c.id === parentId) {
        return { ...c, replies: [...(c.replies || []), reply] };
      }
      return c;
    });

    persistComments(updated);
    setReplyContent('');
    setReplyingTo(null);
  }

  // Edit a comment or reply
  function handleSaveEdit(commentId: string, parentId?: string) {
    const trimmed = editContent.trim();
    if (!trimmed) return;

    const updated = comments.map(c => {
      if (!parentId && c.id === commentId) {
        return { ...c, content: trimmed };
      }
      if (parentId && c.id === parentId) {
        return {
          ...c,
          replies: (c.replies || []).map(r =>
            r.id === commentId ? { ...r, content: trimmed } : r
          ),
        };
      }
      return c;
    });

    persistComments(updated);
    setEditingId(null);
    setEditContent('');
  }

  // Delete a comment or reply
  function handleDelete(commentId: string, parentId?: string) {
    let updated: Comment[];
    if (!parentId) {
      updated = comments.filter(c => c.id !== commentId);
    } else {
      updated = comments.map(c => {
        if (c.id === parentId) {
          return { ...c, replies: (c.replies || []).filter(r => r.id !== commentId) };
        }
        return c;
      });
    }

    persistComments(updated);
    setDeleteConfirmId(null);
  }

  // Render a single comment
  function renderComment(comment: Comment, parentId?: string, isReply = false) {
    const isOwn = comment.userId === CURRENT_USER_ID;
    const isEditing = editingId === comment.id;
    const isDeleting = deleteConfirmId === comment.id;

    return (
      <div
        key={comment.id}
        style={{
          display: 'flex',
          gap: 10,
          padding: isReply ? '10px 0 0 0' : '14px 0',
          borderBottom: !isReply ? '1px solid var(--border-primary)' : 'none',
        }}
      >
        {/* Avatar */}
        <div style={{
          width: isReply ? 28 : 34,
          height: isReply ? 28 : 34,
          borderRadius: '50%',
          background: avatarColor(comment.userId),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: isReply ? 10 : 12,
          fontWeight: 700,
          color: '#fff',
          flexShrink: 0,
        }}>
          {getInitials(comment.userName)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 4,
          }}>
            <span style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}>
              {comment.userName}
            </span>
            <span style={{
              fontSize: 11,
              color: 'var(--text-muted)',
            }}>
              {timeAgo(comment.createdAt)}
            </span>
          </div>

          {/* Content or edit form */}
          {isEditing ? (
            <div style={{ marginBottom: 8 }}>
              <textarea
                ref={editRef}
                value={editContent}
                onChange={e => {
                  setEditContent(e.target.value);
                  handleMentionInput(e.target.value, 'edit');
                }}
                style={{
                  width: '100%',
                  minHeight: 60,
                  padding: '8px 10px',
                  fontSize: 13,
                  border: '1px solid var(--border-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-secondary)')}
              />
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <button
                  onClick={() => handleSaveEdit(comment.id, parentId)}
                  style={{
                    padding: '4px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#fff',
                    background: 'var(--accent)',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                  }}
                >
                  Enregistrer
                </button>
                <button
                  onClick={() => { setEditingId(null); setEditContent(''); }}
                  style={{
                    padding: '4px 12px',
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    background: 'var(--bg-tertiary)',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                  }}
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <p style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              margin: 0,
              marginBottom: 6,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {renderContentWithMentions(comment.content)}
            </p>
          )}

          {/* Actions */}
          {!isEditing && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {!isReply && (
                <button
                  onClick={() => {
                    setReplyingTo(replyingTo === comment.id ? null : comment.id);
                    setReplyContent('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: 12,
                    cursor: 'pointer',
                    padding: 0,
                    fontWeight: 500,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  Repondre
                </button>
              )}
              {isOwn && (
                <>
                  <button
                    onClick={() => {
                      setEditingId(comment.id);
                      setEditContent(comment.content);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      fontSize: 12,
                      cursor: 'pointer',
                      padding: 0,
                      fontWeight: 500,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    Modifier
                  </button>
                  {isDeleting ? (
                    <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'var(--danger)' }}>Supprimer ?</span>
                      <button
                        onClick={() => handleDelete(comment.id, parentId)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--danger)',
                          fontSize: 12,
                          cursor: 'pointer',
                          padding: 0,
                          fontWeight: 600,
                        }}
                      >
                        Oui
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          fontSize: 12,
                          cursor: 'pointer',
                          padding: 0,
                          fontWeight: 500,
                        }}
                      >
                        Non
                      </button>
                    </span>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(comment.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: 12,
                        cursor: 'pointer',
                        padding: 0,
                        fontWeight: 500,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      Supprimer
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Replies */}
          {!isReply && comment.replies && comment.replies.length > 0 && (
            <div style={{
              marginTop: 8,
              paddingLeft: 12,
              borderLeft: '2px solid var(--border-primary)',
            }}>
              {comment.replies.map(reply => renderComment(reply, comment.id, true))}
            </div>
          )}

          {/* Reply input */}
          {!isReply && replyingTo === comment.id && (
            <div style={{
              marginTop: 10,
              display: 'flex',
              gap: 8,
              alignItems: 'flex-start',
            }}>
              <div style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: avatarColor(CURRENT_USER_ID),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 9,
                fontWeight: 700,
                color: '#fff',
                flexShrink: 0,
                marginTop: 2,
              }}>
                {getInitials(CURRENT_USER_NAME)}
              </div>
              <div style={{ flex: 1, position: 'relative' }}>
                <textarea
                  ref={replyRef}
                  value={replyContent}
                  onChange={e => {
                    setReplyContent(e.target.value);
                    handleMentionInput(e.target.value, 'reply');
                  }}
                  placeholder="Ecrire une reponse..."
                  autoFocus
                  style={{
                    width: '100%',
                    minHeight: 50,
                    padding: '8px 10px',
                    fontSize: 13,
                    border: '1px solid var(--border-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    outline: 'none',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-secondary)')}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleAddReply(comment.id);
                    }
                    if (e.key === 'Escape') {
                      setReplyingTo(null);
                      setReplyContent('');
                    }
                  }}
                />
                {showMentionDropdown && activeMentionField === 'reply' && (
                  <MentionDropdown
                    ref={mentionDropdownRef}
                    users={filteredUsers}
                    onSelect={insertMention}
                  />
                )}
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <button
                    onClick={() => handleAddReply(comment.id)}
                    disabled={!replyContent.trim()}
                    style={{
                      padding: '4px 12px',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#fff',
                      background: replyContent.trim() ? 'var(--accent)' : 'var(--bg-tertiary)',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: replyContent.trim() ? 'pointer' : 'default',
                    }}
                  >
                    Repondre
                  </button>
                  <button
                    onClick={() => { setReplyingTo(null); setReplyContent(''); }}
                    style={{
                      padding: '4px 12px',
                      fontSize: 12,
                      fontWeight: 500,
                      color: 'var(--text-secondary)',
                      background: 'var(--bg-tertiary)',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render @mentions as styled spans
  function renderContentWithMentions(content: string): React.ReactNode {
    const parts = content.split(/(@\w[\w\s]*?\w(?=\s|$))/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return (
          <span
            key={i}
            style={{
              color: 'var(--accent)',
              fontWeight: 600,
              background: 'var(--accent-muted)',
              padding: '1px 4px',
              borderRadius: 3,
              fontSize: 12,
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  }

  return (
    <div style={{
      background: 'var(--bg-elevated)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-primary)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--border-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <h3 style={{
          margin: 0,
          fontSize: 15,
          fontWeight: 700,
          color: 'var(--text-primary)',
        }}>
          Commentaires
        </h3>
        <span style={{
          fontSize: 12,
          color: 'var(--text-muted)',
          fontWeight: 500,
        }}>
          {comments.length} commentaire{comments.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* New comment input */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-primary)',
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
      }}>
        <div style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: avatarColor(CURRENT_USER_ID),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 700,
          color: '#fff',
          flexShrink: 0,
          marginTop: 2,
        }}>
          {getInitials(CURRENT_USER_NAME)}
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <textarea
            ref={newCommentRef}
            value={newComment}
            onChange={e => {
              setNewComment(e.target.value);
              handleMentionInput(e.target.value, 'new');
            }}
            placeholder="Ecrire un commentaire... (utilisez @ pour mentionner)"
            rows={2}
            style={{
              width: '100%',
              minHeight: 60,
              padding: '10px 12px',
              fontSize: 13,
              border: '1px solid var(--border-secondary)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-secondary)')}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleAddComment();
              }
            }}
          />
          {showMentionDropdown && activeMentionField === 'new' && (
            <MentionDropdown
              ref={mentionDropdownRef}
              users={filteredUsers}
              onSelect={insertMention}
            />
          )}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 8,
          }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Ctrl+Entree pour publier
            </span>
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              style={{
                padding: '6px 16px',
                fontSize: 13,
                fontWeight: 600,
                color: '#fff',
                background: newComment.trim() ? 'var(--accent)' : 'var(--bg-tertiary)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: newComment.trim() ? 'pointer' : 'default',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => {
                if (newComment.trim()) e.currentTarget.style.background = 'var(--accent-hover)';
              }}
              onMouseLeave={e => {
                if (newComment.trim()) e.currentTarget.style.background = 'var(--accent)';
              }}
            >
              Publier
            </button>
          </div>
        </div>
      </div>

      {/* Comments list */}
      <div style={{ padding: '0 20px' }}>
        {comments.length === 0 ? (
          <div style={{
            padding: '40px 0',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.4 }}>💬</div>
            <p style={{
              fontSize: 14,
              color: 'var(--text-muted)',
              margin: 0,
            }}>
              Aucun commentaire
            </p>
            <p style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              margin: '4px 0 0',
              opacity: 0.7,
            }}>
              Soyez le premier a commenter
            </p>
          </div>
        ) : (
          comments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  );
}

// Mention dropdown component
import { forwardRef } from 'react';

interface MentionDropdownProps {
  users: { id: string; name: string }[];
  onSelect: (name: string) => void;
}

const MentionDropdown = forwardRef<HTMLDivElement, MentionDropdownProps>(
  function MentionDropdown({ users, onSelect }, ref) {
    if (users.length === 0) return null;

    return (
      <div
        ref={ref}
        style={{
          position: 'absolute',
          bottom: '100%',
          left: 0,
          width: '100%',
          maxWidth: 240,
          maxHeight: 160,
          overflowY: 'auto',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-secondary)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-md)',
          zIndex: 100,
          marginBottom: 4,
        }}
      >
        {users.map(user => (
          <button
            key={user.id}
            onMouseDown={e => {
              e.preventDefault();
              onSelect(user.name);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: '6px 10px',
              fontSize: 13,
              color: 'var(--text-primary)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <div style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: avatarColor(user.id),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 9,
              fontWeight: 700,
              color: '#fff',
              flexShrink: 0,
            }}>
              {getInitials(user.name)}
            </div>
            <span>{user.name}</span>
          </button>
        ))}
      </div>
    );
  }
);
