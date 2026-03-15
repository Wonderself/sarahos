'use client';

import React from 'react';

interface TeamOverviewProps {
  orgName: string;
  memberCount: number;
  poolCredits: number;
  poolUsed: number;
  pendingApprovals: number;
  userRole: 'admin' | 'operator' | 'viewer' | 'system';
}

export default function TeamOverview({
  orgName,
  memberCount,
  poolCredits,
  poolUsed,
  pendingApprovals,
  userRole,
}: TeamOverviewProps) {
  const isAdmin = userRole === 'admin';
  const isOperator = userRole === 'operator';
  const creditsRemaining = poolCredits - poolUsed;
  const usagePercent = poolCredits > 0 ? Math.round((poolUsed / poolCredits) * 100) : 0;

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
          🏢 {orgName}
        </h2>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#6B6B6B',
            background: '#FAFAFA',
            border: '1px solid #E5E5E5',
            borderRadius: 4,
            padding: '2px 8px',
            textTransform: 'uppercase',
          }}
        >
          {userRole}
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 12,
        }}
      >
        {/* Members */}
        <InfoCard icon="👥" label="Membres" value={String(memberCount)} />

        {/* Credits — visible to admin/operator */}
        {(isAdmin || isOperator) && (
          <InfoCard
            icon="💰"
            label="Crédits restants"
            value={String(creditsRemaining)}
            subtitle={`${usagePercent}% utilisé`}
            alert={creditsRemaining < poolCredits * 0.2}
          />
        )}

        {/* Pending approvals — admin only */}
        {isAdmin && (
          <InfoCard
            icon="📋"
            label="Approbations"
            value={String(pendingApprovals)}
            alert={pendingApprovals > 0}
          />
        )}

        {/* Usage — viewer sees only basic info */}
        {!isAdmin && !isOperator && (
          <InfoCard icon="📊" label="Utilisation" value={`${usagePercent}%`} />
        )}
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
  subtitle,
  alert,
}: {
  icon: string;
  label: string;
  value: string;
  subtitle?: string;
  alert?: boolean;
}) {
  return (
    <div
      style={{
        padding: '14px 16px',
        borderRadius: 6,
        border: `1px solid ${alert ? '#FECACA' : '#E5E5E5'}`,
        background: alert ? '#FFF5F5' : '#FAFAFA',
      }}
    >
      <div style={{ fontSize: 18, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', marginBottom: 2 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: '#9B9B9B' }}>{label}</div>
      {subtitle && (
        <div style={{ fontSize: 11, color: alert ? '#DC2626' : '#9B9B9B', marginTop: 4 }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}
