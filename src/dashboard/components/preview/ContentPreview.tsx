'use client';

import React, { useState, useEffect, useCallback } from 'react';
import LinkedInPreview from './LinkedInPreview';
import EmailPreview from './EmailPreview';
import GoogleReviewPreview from './GoogleReviewPreview';
import SMSPreview from './SMSPreview';

type PreviewType = 'linkedin' | 'email' | 'google-review' | 'sms';

interface ContentPreviewMetadata {
  from?: string;
  to?: string;
  subject?: string;
  stars?: number;
  authorName?: string;
  reviewText?: string;
  businessName?: string;
  recipientName?: string;
}

interface ContentPreviewProps {
  type: PreviewType;
  content: string;
  metadata?: ContentPreviewMetadata;
  open: boolean;
  onClose: () => void;
  onConfirm: (editedContent: string) => void;
  editable?: boolean;
}

const TYPE_CONFIG: Record<PreviewType, { icon: string; label: string }> = {
  linkedin: { icon: '💼', label: 'LinkedIn' },
  email: { icon: '📧', label: 'Email' },
  'google-review': { icon: '⭐', label: 'Google Avis' },
  sms: { icon: '💬', label: 'SMS' },
};

export default function ContentPreview({
  type,
  content,
  metadata,
  open,
  onClose,
  onConfirm,
  editable = true,
}: ContentPreviewProps) {
  const [editedContent, setEditedContent] = useState(content);
  const [isEditing, setIsEditing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync content from props
  useEffect(() => {
    setEditedContent(content);
    setIsEditing(false);
  }, [content]);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Animate in/out
  useEffect(() => {
    if (open) {
      // Force a frame so the initial transform is applied before transitioning
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true));
      });
    } else {
      setIsVisible(false);
    }
  }, [open]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  const handleConfirm = useCallback(() => {
    onConfirm(editedContent);
    handleClose();
  }, [editedContent, onConfirm, handleClose]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(editedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = editedContent;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [editedContent]);

  if (!open) return null;

  const config = TYPE_CONFIG[type];

  const renderPreview = () => {
    const editing = editable && isEditing;
    switch (type) {
      case 'linkedin':
        return (
          <LinkedInPreview
            content={editedContent}
            authorName={metadata?.authorName}
            editable={editing}
            onEdit={setEditedContent}
          />
        );
      case 'email':
        return (
          <EmailPreview
            content={editedContent}
            subject={metadata?.subject}
            from={metadata?.from}
            to={metadata?.to}
            editable={editing}
            onEdit={setEditedContent}
          />
        );
      case 'google-review':
        return (
          <GoogleReviewPreview
            content={editedContent}
            stars={metadata?.stars}
            reviewText={metadata?.reviewText}
            businessName={metadata?.businessName}
            editable={editing}
            onEdit={setEditedContent}
          />
        );
      case 'sms':
        return (
          <SMSPreview
            content={editedContent}
            recipientName={metadata?.recipientName}
            editable={editing}
            onEdit={setEditedContent}
          />
        );
      default:
        return null;
    }
  };

  // Footer buttons
  const footer = (
    <div
      style={{
        display: 'flex',
        gap: 8,
        padding: '12px 16px',
        borderTop: '1px solid #E5E5E5',
        background: '#FFFFFF',
      }}
    >
      {editable && !isEditing && (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          style={{
            flex: 1,
            padding: '10px 16px',
            minHeight: 44,
            border: '1px solid #E5E5E5',
            borderRadius: 8,
            background: '#FFFFFF',
            color: '#1A1A1A',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          ✏️ Modifier
        </button>
      )}
      <button
        type="button"
        onClick={handleCopy}
        style={{
          flex: 1,
          padding: '10px 16px',
          minHeight: 44,
          border: '1px solid #E5E5E5',
          borderRadius: 8,
          background: '#FFFFFF',
          color: '#1A1A1A',
          fontSize: 14,
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        {copied ? '✅ Copié !' : '📋 Copier'}
      </button>
      <button
        type="button"
        onClick={handleConfirm}
        style={{
          flex: 1,
          padding: '10px 16px',
          minHeight: 44,
          border: 'none',
          borderRadius: 8,
          background: '#1A1A1A',
          color: '#FFFFFF',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        ✅ Confirmer
      </button>
    </div>
  );

  // ── MOBILE: Bottom Sheet ──
  if (isMobile) {
    return (
      <>
        {/* Overlay */}
        <div
          onClick={handleClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 9998,
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        />
        {/* Sheet */}
        <div
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            height: '85vh',
            background: '#FFFFFF',
            borderRadius: '16px 16px 0 0',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform 0.3s ease',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
          }}
        >
          {/* Drag handle */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '10px 0 6px 0',
            }}
          >
            <div
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                background: '#DADCE0',
              }}
            />
          </div>

          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '4px 16px 12px 16px',
              borderBottom: '1px solid #E5E5E5',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>{config.icon}</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A' }}>
                Aperçu {config.label}
              </span>
            </div>
            <button
              type="button"
              onClick={handleClose}
              style={{
                width: 32,
                height: 32,
                border: 'none',
                background: '#F5F5F5',
                borderRadius: '50%',
                fontSize: 16,
                color: '#6B6B6B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              padding: 16,
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {renderPreview()}
          </div>

          {/* Footer */}
          {footer}
        </div>
      </>
    );
  }

  // ── DESKTOP: Side Panel ──
  return (
    <>
      {/* Overlay */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.15)',
          zIndex: 9998,
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />
      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 420,
          background: '#FFFFFF',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
          boxShadow: '-4px 0 20px rgba(0,0,0,0.08)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            borderBottom: '1px solid #E5E5E5',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>{config.icon}</span>
            <span style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A' }}>
              Aperçu {config.label}
            </span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            style={{
              width: 34,
              height: 34,
              border: '1px solid #E5E5E5',
              background: '#FFFFFF',
              borderRadius: 8,
              fontSize: 16,
              color: '#6B6B6B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          {renderPreview()}
        </div>

        {/* Footer */}
        {footer}
      </div>
    </>
  );
}
