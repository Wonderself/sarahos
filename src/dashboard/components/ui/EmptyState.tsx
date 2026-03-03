'use client';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon = '📋',
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <div className="empty-state-text">{title}</div>
      {description && (
        <div className="text-sm text-muted" style={{ marginTop: 4, maxWidth: 360, lineHeight: 1.5 }}>
          {description}
        </div>
      )}
      {actionLabel && (actionHref || onAction) && (
        <div style={{ marginTop: 16 }}>
          {actionHref ? (
            <a href={actionHref} className="btn btn-primary btn-sm">{actionLabel}</a>
          ) : (
            <button onClick={onAction} className="btn btn-primary btn-sm">{actionLabel}</button>
          )}
        </div>
      )}
    </div>
  );
}
