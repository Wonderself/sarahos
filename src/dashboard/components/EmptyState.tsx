'use client';

import Link from 'next/link';

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

export default function EmptyState({ icon, title, description, actionLabel, onAction, actionHref }: EmptyStateProps) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '60px 40px', margin: '24px 0' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: description ? 8 : 20 }}>{title}</div>
      {description && (
        <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20, maxWidth: 360, margin: '0 auto 20px' }}>
          {description}
        </div>
      )}
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn btn-primary" style={{ display: 'inline-block' }}>
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button onClick={onAction} className="btn btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
