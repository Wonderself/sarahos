'use client';

interface AgentIconProps {
  materialIcon: string;
  color?: string;
  size?: number;
  filled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function AgentIcon({ materialIcon, color, size = 20, filled, className = '', style }: AgentIconProps) {
  return (
    <span
      className={`material-symbols-rounded${filled ? ' mi-filled' : ''} ${className}`}
      style={{
        fontSize: size,
        color: color || 'var(--accent)',
        lineHeight: 1,
        ...style,
      }}
    >
      {materialIcon}
    </span>
  );
}

export function AgentIconBadge({ materialIcon, color, size = 30 }: { materialIcon: string; color?: string; size?: number }) {
  const bgColor = color ? color + '22' : 'var(--accent-bg)';
  const borderColor = color ? color + '44' : 'var(--accent)33';
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.27,
      background: bgColor, border: `1px solid ${borderColor}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span
        className="material-symbols-rounded"
        style={{ fontSize: size * 0.55, color: color || 'var(--accent)', lineHeight: 1 }}
      >
        {materialIcon}
      </span>
    </div>
  );
}
