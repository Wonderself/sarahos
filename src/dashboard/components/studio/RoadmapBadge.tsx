'use client';

export default function RoadmapBadge({ label }: { label?: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 12,
      background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
      color: '#92400e', fontSize: 11, fontWeight: 600,
      border: '1px solid #fcd34d',
    }}>
      {label ?? 'Bientot disponible'}
    </span>
  );
}
