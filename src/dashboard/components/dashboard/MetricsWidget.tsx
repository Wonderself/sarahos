'use client';

import React from 'react';

interface Metric {
  label: string;
  value: string;
  change: number;
  icon: string;
}

interface MetricsWidgetProps {
  metrics: Metric[];
}

export default function MetricsWidget({ metrics }: MetricsWidgetProps) {
  if (metrics.length === 0) {
    return (
      <div
        style={{
          padding: '24px',
          border: '1px solid #E5E5E5',
          borderRadius: 8,
          background: '#FAFAFA',
          textAlign: 'center',
          color: '#9B9B9B',
          fontSize: 13,
        }}
      >
        Aucune métrique disponible
      </div>
    );
  }

  return (
    <div
      style={{
        border: '1px solid #E5E5E5',
        borderRadius: 8,
        background: '#FFFFFF',
        padding: '20px 24px',
      }}
    >
      <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A', margin: '0 0 16px' }}>
        📊 Indicateurs clés
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 12,
        }}
      >
        {metrics.map((metric, idx) => (
          <MetricCard key={idx} metric={metric} />
        ))}
      </div>
    </div>
  );
}

function MetricCard({ metric }: { metric: Metric }) {
  const isPositive = metric.change >= 0;
  const changeColor = isPositive ? '#38A169' : '#DC2626';
  const changePrefix = isPositive ? '+' : '';

  return (
    <div
      style={{
        padding: '16px',
        borderRadius: 6,
        border: '1px solid #E5E5E5',
        background: '#FAFAFA',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 20 }}>{metric.icon}</span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: changeColor,
            background: isPositive ? '#F0FFF4' : '#FFF5F5',
            padding: '2px 6px',
            borderRadius: 4,
          }}
        >
          {changePrefix}{metric.change}%
        </span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>
        {metric.value}
      </div>
      <div style={{ fontSize: 12, color: '#9B9B9B' }}>
        {metric.label}
      </div>
    </div>
  );
}
