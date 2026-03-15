'use client';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export default function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === 'user';
  const time = new Date(timestamp);
  const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 10,
    }}>
      <div style={{ maxWidth: '80%' }}>
        <div style={{
          padding: '10px 14px',
          borderRadius: 12,
          fontSize: 13,
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          ...(isUser
            ? {
                background: '#1A1A1A',
                color: '#FFFFFF',
                borderBottomRightRadius: 4,
              }
            : {
                background: '#FAFAFA',
                color: '#1A1A1A',
                border: '1px solid #E5E5E5',
                borderBottomLeftRadius: 4,
              }),
        }}>
          {content}
        </div>
        <div style={{
          fontSize: 10,
          color: '#9B9B9B',
          marginTop: 3,
          textAlign: isUser ? 'right' : 'left',
          paddingLeft: isUser ? 0 : 4,
          paddingRight: isUser ? 4 : 0,
        }}>
          {timeStr}
        </div>
      </div>
    </div>
  );
}
