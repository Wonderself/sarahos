'use client';

import React, { useState } from 'react';

interface Approval {
  id: string;
  title: string;
  requester: string;
  date: string;
  type: string;
}

interface ApprovalWidgetProps {
  approvals: Approval[];
}

export default function ApprovalWidget({ approvals }: ApprovalWidgetProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const pending = approvals.filter((a) => !dismissed.has(a.id));

  const handleApprove = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
    // TODO: call backend approve endpoint
  };

  const handleReject = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
    // TODO: call backend reject endpoint
  };

  return (
    <div
      style={{
        border: '1px solid #E5E5E5',
        borderRadius: 8,
        background: '#FFFFFF',
        padding: '20px 24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
          ✅ Approbations
        </h2>
        {pending.length > 0 && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#FFFFFF',
              background: '#DC2626',
              borderRadius: 10,
              padding: '2px 8px',
              minWidth: 20,
              textAlign: 'center',
            }}
          >
            {pending.length}
          </span>
        )}
      </div>

      {pending.length === 0 ? (
        <div style={{ fontSize: 13, color: '#9B9B9B', textAlign: 'center', padding: '12px 0' }}>
          Aucune approbation en attente
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pending.map((approval) => (
            <div
              key={approval.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                borderRadius: 6,
                border: '1px solid #E5E5E5',
                background: '#FAFAFA',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 2 }}>
                  {approval.title}
                </div>
                <div style={{ fontSize: 12, color: '#9B9B9B' }}>
                  {approval.requester} · {approval.type} · {approval.date}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => handleApprove(approval.id)}
                  style={{
                    padding: '6px 14px',
                    fontSize: 12,
                    fontWeight: 600,
                    border: 'none',
                    borderRadius: 4,
                    background: '#1A1A1A',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  Approuver
                </button>
                <button
                  onClick={() => handleReject(approval.id)}
                  style={{
                    padding: '6px 14px',
                    fontSize: 12,
                    fontWeight: 600,
                    border: '1px solid #E5E5E5',
                    borderRadius: 4,
                    background: '#FFFFFF',
                    color: '#DC2626',
                    cursor: 'pointer',
                  }}
                >
                  Rejeter
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
