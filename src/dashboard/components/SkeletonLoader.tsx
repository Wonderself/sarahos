// ─── Skeleton Loading Components ─────────────────────────────────────────────
// Used throughout the admin dashboard for loading states.

export function SkeletonText({
  width = '100%',
  height = 14,
  className = '',
}: {
  width?: string | number;
  height?: number;
  className?: string;
}) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: 4 }}
    />
  );
}

export function SkeletonBadge() {
  return (
    <div className="skeleton" style={{ height: 20, width: 64, borderRadius: 20 }} />
  );
}

export function SkeletonAvatar({ size = 24 }: { size?: number }) {
  return (
    <div
      className="skeleton"
      style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0 }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="stat-card">
      <div className="skeleton" style={{ height: 12, width: 80, borderRadius: 4 }} />
      <div className="skeleton" style={{ height: 28, width: 120, borderRadius: 4, marginTop: 8 }} />
    </div>
  );
}

export function SkeletonUserRow() {
  return (
    <tr>
      {/* Checkbox */}
      <td style={{ padding: '12px 16px', width: 36 }}>
        <div className="skeleton" style={{ width: 16, height: 16, borderRadius: 4 }} />
      </td>
      {/* User */}
      <td style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SkeletonAvatar size={24} />
          <div>
            <div className="skeleton" style={{ height: 13, width: 120, borderRadius: 4, marginBottom: 5 }} />
            <div className="skeleton" style={{ height: 10, width: 160, borderRadius: 4 }} />
          </div>
        </div>
      </td>
      {/* Role */}
      <td style={{ padding: '12px 16px' }}><SkeletonBadge /></td>
      {/* Tier */}
      <td style={{ padding: '12px 16px' }}><SkeletonBadge /></td>
      {/* API */}
      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
        <div className="skeleton" style={{ height: 13, width: 40, borderRadius: 4, margin: '0 auto 4px' }} />
        <div className="skeleton" style={{ height: 4, width: 80, borderRadius: 2, margin: '0 auto' }} />
      </td>
      {/* Status */}
      <td style={{ padding: '12px 16px', textAlign: 'center' }}><SkeletonBadge /></td>
      {/* Dates */}
      <td style={{ padding: '12px 16px' }}>
        <div className="skeleton" style={{ height: 12, width: 100, borderRadius: 4 }} />
      </td>
      <td style={{ padding: '12px 16px' }}>
        <div className="skeleton" style={{ height: 12, width: 80, borderRadius: 4 }} />
      </td>
      {/* Actions */}
      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
          <div className="skeleton" style={{ height: 24, width: 32, borderRadius: 4 }} />
          <div className="skeleton" style={{ height: 24, width: 40, borderRadius: 4 }} />
          <div className="skeleton" style={{ height: 24, width: 36, borderRadius: 4 }} />
        </div>
      </td>
    </tr>
  );
}

export function SkeletonUserTable({ rows = 8 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <SkeletonUserRow key={i} />
      ))}
    </>
  );
}

export function SkeletonGridCards({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </>
  );
}
