'use client';

import React, { useState, useRef, useEffect } from 'react';

interface EditableFieldProps {
  label: string;
  value: string;
  onSave: (val: string) => void;
  type?: 'text' | 'url' | 'number';
  source?: string;
}

export default function EditableField({ label, value, onSave, type = 'text', source }: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const handleSave = () => {
    setEditing(false);
    if (draft !== value) {
      onSave(draft);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setDraft(value);
      setEditing(false);
    }
  };

  return (
    <div
      style={{
        padding: '8px 0',
        borderBottom: hovered ? '1px dashed #E5E5E5' : '1px solid transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: '#9B9B9B', marginBottom: 2 }}>
          {label}
          {source && (
            <span
              style={{
                marginLeft: 8,
                fontSize: 10,
                background: '#F3F4F6',
                color: '#6B6B6B',
                padding: '1px 6px',
                borderRadius: 4,
              }}
            >
              Source: {source}
            </span>
          )}
        </div>
        {editing ? (
          <input
            ref={inputRef}
            type={type}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%',
              fontSize: 14,
              color: '#1A1A1A',
              border: '1px solid #E5E5E5',
              borderRadius: 6,
              padding: '4px 8px',
              outline: 'none',
              background: '#FAFAFA',
            }}
          />
        ) : (
          <div
            style={{
              fontSize: 14,
              color: value ? '#1A1A1A' : '#9B9B9B',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {value || 'Non renseigne'}
          </div>
        )}
      </div>
      {!editing && hovered && (
        <button
          onClick={() => setEditing(true)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
            padding: '2px 6px',
            borderRadius: 4,
            color: '#6B6B6B',
            flexShrink: 0,
          }}
          title="Modifier"
        >
          ✏️
        </button>
      )}
    </div>
  );
}
