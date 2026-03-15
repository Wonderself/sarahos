'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import ChatBubble from './ChatBubble';

const ChatWindow = lazy(() => import('./ChatWindow'));

interface ChatWidgetProps {
  userId?: string;
}

export default function ChatWidget({ userId }: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // On mobile when open, the ChatWindow handles its own fixed positioning (slide-up bottom sheet).
  // On desktop, we keep the fixed bottom-right anchor for both bubble and window.
  const wrapperStyle: React.CSSProperties = (open && isMobile)
    ? { position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999 }
    : { position: 'fixed', bottom: 24, right: 24, zIndex: 9999 };

  return (
    <div style={wrapperStyle}>
      {open ? (
        <Suspense fallback={
          <div style={{
            width: isMobile ? '100%' : 400,
            height: isMobile ? '90vh' : 560,
            background: '#FFFFFF',
            borderRadius: isMobile ? '16px 16px 0 0' : 16,
            border: isMobile ? 'none' : '1px solid #E5E5E5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }}>
            <div style={{ color: '#9B9B9B', fontSize: 14 }}>Chargement...</div>
          </div>
        }>
          <ChatWindow
            onClose={() => setOpen(false)}
            userId={userId}
            onMessage={() => setUnreadCount(0)}
          />
        </Suspense>
      ) : (
        <ChatBubble
          onClick={() => { setOpen(true); setUnreadCount(0); }}
          unreadCount={unreadCount}
        />
      )}
    </div>
  );
}
