'use client';

import { useState, useCallback, useMemo } from 'react';
import React from 'react';

// ─── Hook ───────────────────────────────────────────────

export function useBulkSelection<T extends { id: string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(items.map(item => item.id)));
  }, [items]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds],
  );

  const isAllSelected = useMemo(
    () => items.length > 0 && selectedIds.size === items.length,
    [items.length, selectedIds.size],
  );

  const selectedItems = useMemo(
    () => items.filter(item => selectedIds.has(item.id)),
    [items, selectedIds],
  );

  const selectionCount = selectedIds.size;

  return {
    selectedIds: Array.from(selectedIds),
    selectedItems,
    isSelected,
    toggle,
    selectAll,
    deselectAll,
    isAllSelected,
    selectionCount,
  };
}

// ─── BulkActionBar Component ────────────────────────────

interface BulkAction {
  label: string;
  icon: string;
  onClick: (ids: string[]) => void;
  variant?: 'danger' | 'default';
}

interface BulkActionBarProps {
  selectedIds: string[];
  selectionCount: number;
  actions: BulkAction[];
  onDeselectAll: () => void;
}

export function BulkActionBar({
  selectedIds,
  selectionCount,
  actions,
  onDeselectAll,
}: BulkActionBarProps) {
  if (selectionCount === 0) return null;

  return React.createElement(
    'div',
    {
      style: {
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 20px',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-secondary)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 1000,
        animation: 'bulkBarSlideUp 0.3s ease-out',
        fontFamily: 'var(--font-sans)',
      },
    },
    // Count label
    React.createElement(
      'span',
      {
        className: 'text-sm font-semibold',
        style: { color: 'var(--text-primary)', whiteSpace: 'nowrap' },
      },
      `${selectionCount} \u00e9l\u00e9ment${selectionCount > 1 ? 's' : ''} s\u00e9lectionn\u00e9${selectionCount > 1 ? 's' : ''}`,
    ),
    // Separator
    React.createElement('div', {
      style: {
        width: 1,
        height: 24,
        background: 'var(--border-secondary)',
        flexShrink: 0,
      },
    }),
    // Action buttons
    ...actions.map((action, i) =>
      React.createElement(
        'button',
        {
          key: i,
          onClick: () => action.onClick(selectedIds),
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            border: '1px solid',
            borderColor:
              action.variant === 'danger'
                ? 'var(--danger)'
                : 'var(--border-secondary)',
            borderRadius: 'var(--radius-sm)',
            background:
              action.variant === 'danger'
                ? 'var(--danger-muted)'
                : 'var(--bg-secondary)',
            color:
              action.variant === 'danger'
                ? 'var(--danger)'
                : 'var(--text-primary)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            whiteSpace: 'nowrap' as const,
            transition: 'background 0.15s ease',
          },
        },
        React.createElement('span', null, action.icon),
        React.createElement('span', null, action.label),
      ),
    ),
    // Deselect all button
    React.createElement(
      'button',
      {
        onClick: onDeselectAll,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '6px 12px',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          background: 'transparent',
          color: 'var(--text-muted)',
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
          whiteSpace: 'nowrap' as const,
        },
      },
      'Tout d\u00e9s\u00e9lectionner',
    ),
    // Animation keyframes
    React.createElement('style', null, `
      @keyframes bulkBarSlideUp {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(16px);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }
    `),
  );
}
