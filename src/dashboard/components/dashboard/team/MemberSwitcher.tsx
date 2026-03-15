'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface Org {
  id: string;
  name: string;
  role: string;
}

interface MemberSwitcherProps {
  orgs: Org[];
  activeOrgId: string;
  onSwitch: (orgId: string) => void;
}

const STORAGE_KEY = 'fz_active_org_id';

export default function MemberSwitcher({ orgs, activeOrgId, onSwitch }: MemberSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const activeOrg = orgs.find((o) => o.id === activeOrgId);

  // Close on outside click
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const handleSelect = (orgId: string) => {
    setOpen(false);
    localStorage.setItem(STORAGE_KEY, orgId);
    onSwitch(orgId);
  };

  if (orgs.length <= 1) return null;

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 14px',
          borderRadius: 6,
          border: '1px solid #E5E5E5',
          background: '#FFFFFF',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 500,
          color: '#1A1A1A',
          minWidth: 160,
        }}
      >
        <span style={{ fontSize: 14 }}>🏢</span>
        <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {activeOrg?.name ?? 'Organisation'}
        </span>
        <span style={{ fontSize: 10, color: '#9B9B9B', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
          ▼
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 4,
            minWidth: '100%',
            background: '#FFFFFF',
            border: '1px solid #E5E5E5',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          {orgs.map((org) => {
            const isActive = org.id === activeOrgId;
            return (
              <button
                key={org.id}
                onClick={() => handleSelect(org.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 14px',
                  border: 'none',
                  background: isActive ? '#FAFAFA' : '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: 13,
                  color: '#1A1A1A',
                  borderBottom: '1px solid #E5E5E5',
                }}
              >
                <span style={{ fontWeight: isActive ? 600 : 400 }}>{org.name}</span>
                <span
                  style={{
                    fontSize: 10,
                    color: '#9B9B9B',
                    background: '#FAFAFA',
                    border: '1px solid #E5E5E5',
                    borderRadius: 3,
                    padding: '1px 6px',
                    textTransform: 'uppercase',
                  }}
                >
                  {org.role}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
