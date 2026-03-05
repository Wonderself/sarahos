'use client';

interface AgentAvatarProps {
  name: string;
  emoji: string;
  color: string;
  avatarUrl?: string;
  isSpeaking?: boolean;
  size?: number;
}

export default function AgentAvatar({ name, emoji, color, avatarUrl, isSpeaking, size = 200 }: AgentAvatarProps) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: avatarUrl ? 'transparent' : `${color}20`,
      border: `3px solid ${color}`,
      boxShadow: isSpeaking ? `0 0 0 6px ${color}30, 0 0 20px ${color}40` : 'none',
      transition: 'box-shadow 0.3s ease',
    }}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      ) : (
        <span style={{ fontSize: size * 0.4 }}>{emoji}</span>
      )}

      {/* Speaking pulse animation */}
      {isSpeaking && (
        <>
          <div style={{
            position: 'absolute', inset: -8, borderRadius: '50%',
            border: `2px solid ${color}40`,
            animation: 'visio-pulse 1.5s ease-out infinite',
          }} />
          <div style={{
            position: 'absolute', inset: -16, borderRadius: '50%',
            border: `1px solid ${color}20`,
            animation: 'visio-pulse 1.5s ease-out infinite 0.3s',
          }} />
        </>
      )}

      {/* Status indicator */}
      <div style={{
        position: 'absolute', bottom: 8, right: 8,
        width: 16, height: 16, borderRadius: '50%',
        background: isSpeaking ? '#22c55e' : '#6b7280',
        border: '2px solid white',
        boxShadow: isSpeaking ? '0 0 6px #22c55e' : 'none',
      }} />

      <style>{`
        @keyframes visio-pulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.3); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
