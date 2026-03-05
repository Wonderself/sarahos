export function Skeleton({
  width = '100%',
  height = 18,
  borderRadius = 6,
  className = '',
}: {
  width?: string | number;
  height?: number;
  borderRadius?: number;
  className?: string;
}) {
  return (
    <div
      className={`animate-pulse ${className}`}
      style={{
        width,
        height,
        borderRadius,
        background: 'var(--bg-tertiary)',
        display: 'block',
      }}
    />
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={i === 0 ? '55%' : '100%'} height={i === 0 ? 22 : 14} />
      ))}
    </div>
  );
}
