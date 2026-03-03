'use client';

import { useState, useCallback, useRef } from 'react';

// ─── Types ────────────────────────────────────────────────

export interface KanbanItem {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
}

export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  items: KanbanItem[];
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  onDragEnd?: (itemId: string, fromColumn: string, toColumn: string) => void;
  onAddTask?: (columnId: string) => void;
}

// ─── Priority config ──────────────────────────────────────

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  low: { color: 'var(--success)', bg: 'var(--success-muted)', label: 'Basse' },
  medium: { color: 'var(--warning)', bg: 'var(--warning-muted)', label: 'Moyenne' },
  high: { color: 'var(--danger)', bg: 'var(--danger-muted)', label: 'Haute' },
};

// ─── Kanban Card ──────────────────────────────────────────

function KanbanCard({
  item,
  columnId,
  onDragStart,
}: {
  item: KanbanItem;
  columnId: string;
  onDragStart: (e: React.DragEvent, itemId: string, columnId: string) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const priority = item.priority ? PRIORITY_CONFIG[item.priority] : null;

  return (
    <div
      draggable
      onDragStart={(e) => {
        setIsDragging(true);
        onDragStart(e, item.id, columnId);
      }}
      onDragEnd={() => setIsDragging(false)}
      style={{
        padding: '10px 12px',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-md)',
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        transition: 'opacity 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease',
        fontFamily: 'var(--font-sans)',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Priority badge + title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: item.description ? 6 : 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-primary)',
              lineHeight: 1.4,
              wordBreak: 'break-word',
            }}
          >
            {item.title}
          </div>
        </div>
        {priority && (
          <span
            style={{
              flexShrink: 0,
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)',
              background: priority.bg,
              color: priority.color,
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
            }}
          >
            {priority.label}
          </span>
        )}
      </div>

      {/* Description */}
      {item.description && (
        <div
          style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            lineHeight: 1.4,
            marginBottom: 8,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {item.description}
        </div>
      )}

      {/* Footer: tags + assignee */}
      {(item.tags?.length || item.assignee) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
          {item.tags?.map((tag, i) => (
            <span
              key={i}
              style={{
                fontSize: 10,
                padding: '1px 6px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-tertiary)',
                fontWeight: 500,
              }}
            >
              {tag}
            </span>
          ))}
          {item.assignee && (
            <span
              style={{
                marginLeft: 'auto',
                fontSize: 10,
                fontWeight: 600,
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: 3,
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: 'var(--accent-muted)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 9,
                  fontWeight: 700,
                }}
              >
                {item.assignee.charAt(0).toUpperCase()}
              </span>
              {item.assignee}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Kanban Board ─────────────────────────────────────────

export default function KanbanBoard({ columns, onDragEnd, onAddTask }: KanbanBoardProps) {
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const dragItemRef = useRef<{ itemId: string; fromColumnId: string } | null>(null);

  const handleDragStart = useCallback((_e: React.DragEvent, itemId: string, columnId: string) => {
    dragItemRef.current = { itemId, fromColumnId: columnId };
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumnId(columnId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverColumnId(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, toColumnId: string) => {
      e.preventDefault();
      setDragOverColumnId(null);

      if (!dragItemRef.current) return;

      const { itemId, fromColumnId } = dragItemRef.current;
      dragItemRef.current = null;

      if (fromColumnId !== toColumnId && onDragEnd) {
        onDragEnd(itemId, fromColumnId, toColumnId);
      }
    },
    [onDragEnd],
  );

  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        overflowX: 'auto',
        paddingBottom: 8,
        minHeight: 400,
        width: '100%',
      }}
    >
      {columns.map((column) => {
        const isOver = dragOverColumnId === column.id;

        return (
          <div
            key={column.id}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
            style={{
              flex: '0 0 280px',
              minWidth: 280,
              maxWidth: 320,
              display: 'flex',
              flexDirection: 'column',
              background: isOver ? 'var(--bg-hover)' : 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              border: `1px solid ${isOver ? column.color + '66' : 'var(--border-primary)'}`,
              transition: 'background 0.2s ease, border-color 0.2s ease',
              overflow: 'hidden',
            }}
          >
            {/* Column Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderBottom: `2px solid ${column.color}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: column.color,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {column.title}
                </span>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: column.color + '18',
                  color: column.color,
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {column.items.length}
              </span>
            </div>

            {/* Cards container */}
            <div
              style={{
                flex: 1,
                padding: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                overflowY: 'auto',
                minHeight: 80,
              }}
            >
              {column.items.length === 0 && (
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px 16px',
                    border: '2px dashed var(--border-secondary)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-muted)',
                    fontSize: 12,
                    fontStyle: 'italic',
                    textAlign: 'center',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  Glissez un element ici
                </div>
              )}

              {column.items.map((item) => (
                <KanbanCard
                  key={item.id}
                  item={item}
                  columnId={column.id}
                  onDragStart={handleDragStart}
                />
              ))}
            </div>

            {/* Add task button */}
            <div style={{ padding: '8px 10px', borderTop: '1px solid var(--border-primary)' }}>
              <button
                onClick={() => onAddTask?.(column.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '8px 12px',
                  background: 'transparent',
                  border: '1px dashed var(--border-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-muted)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  transition: 'background 0.15s ease, color 0.15s ease, border-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  const btn = e.currentTarget;
                  btn.style.background = 'var(--accent-muted)';
                  btn.style.color = 'var(--accent)';
                  btn.style.borderColor = 'var(--accent)';
                }}
                onMouseLeave={(e) => {
                  const btn = e.currentTarget;
                  btn.style.background = 'transparent';
                  btn.style.color = 'var(--text-muted)';
                  btn.style.borderColor = 'var(--border-secondary)';
                }}
              >
                <span style={{ fontSize: 14, lineHeight: 1 }}>+</span>
                Ajouter une tache
              </button>
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes kanbanFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
