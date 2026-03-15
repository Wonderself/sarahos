'use client';

import { useState, lazy, Suspense } from 'react';
import ChatBubble from './ChatBubble';

const ChatWindow = lazy(() => import('./ChatWindow'));

interface ChatWidgetProps {
  userId?: string;
}

export default function ChatWidget({ userId }: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
      {open ? (
        <Suspense fallback={
          <div style={{
            width: 380,
            height: 520,
            background: '#FFFFFF',
            borderRadius: 16,
            border: '1px solid #E5E5E5',
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
