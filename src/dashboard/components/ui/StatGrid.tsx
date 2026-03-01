interface StatItem {
  label: string;
  value: string | number;
  color?: string;
  suffix?: string;
  change?: { value: string; up: boolean };
}

interface StatGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4 | 5;
  compact?: boolean;
}

export default function StatGrid({ stats, columns = 4, compact = false }: StatGridProps) {
  const gridClass = `grid-${columns} section`;
  const cardClass = compact ? 'stat-card-mini' : 'stat-card';

  return (
    <div className={gridClass}>
      {stats.map((stat) => (
        <div key={stat.label} className={cardClass}>
          <span className="stat-label">{stat.label}</span>
          <span
            className={`stat-value ${compact ? '' : 'stat-value-sm'}`}
            style={stat.color ? { color: stat.color } : undefined}
          >
            {stat.value}
            {stat.suffix && <span className="text-xs text-muted ml-1">{stat.suffix}</span>}
          </span>
          {stat.change && (
            <span className={`stat-change ${stat.change.up ? 'stat-change-up' : 'stat-change-down'}`}>
              {stat.change.up ? '↑' : '↓'} {stat.change.value}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
