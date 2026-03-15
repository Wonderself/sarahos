'use client';

import React, { useRef, useEffect } from 'react';

interface DevisPreviewProps {
  content: string;
  companyName?: string;
  editable?: boolean;
  onEdit?: (newContent: string) => void;
}

interface DevisLine {
  designation: string;
  qty: number;
  unitPrice: number;
}

const DEFAULT_LINES: DevisLine[] = [
  { designation: 'Consultation stratégique IA', qty: 1, unitPrice: 1500 },
  { designation: 'Intégration agents automatisés', qty: 3, unitPrice: 800 },
  { designation: 'Formation équipe (demi-journée)', qty: 2, unitPrice: 450 },
];

function formatEuro(amount: number): string {
  return amount.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' €';
}

function getToday(): string {
  const d = new Date();
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function DevisPreview({
  content,
  companyName = 'Freenzy.io',
  editable = false,
  onEdit,
}: DevisPreviewProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editable && textareaRef.current) {
      const ta = textareaRef.current;
      ta.style.height = 'auto';
      ta.style.height = `${ta.scrollHeight}px`;
    }
  }, [content, editable]);

  const lines = DEFAULT_LINES;
  const subtotal = lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
  const tva = subtotal * 0.2;
  const total = subtotal + tva;

  const cellStyle: React.CSSProperties = {
    padding: '8px 10px',
    fontSize: 12,
    color: '#1A1A1A',
    borderBottom: '1px solid #E5E5E5',
  };

  const headerCellStyle: React.CSSProperties = {
    ...cellStyle,
    background: '#F5F5F5',
    fontWeight: 600,
    fontSize: 11,
    color: '#6B6B6B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  };

  return (
    <div
      style={{
        background: '#F0F0F0',
        borderRadius: 8,
        padding: 16,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* A4-like document */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 4,
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          maxWidth: 400,
          margin: '0 auto',
        }}
      >
        {/* Header band */}
        <div
          style={{
            background: '#1A1A1A',
            padding: '20px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
              {companyName}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#FFFFFF', letterSpacing: 2 }}>
              DEVIS
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
              N° DEV-2026-001
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
              {getToday()}
            </div>
          </div>
        </div>

        {/* Client block */}
        <div
          style={{
            margin: '16px 20px 0 20px',
            background: '#FAFAFA',
            borderRadius: 6,
            padding: '12px 16px',
            border: '1px solid #E5E5E5',
          }}
        >
          <div style={{ fontSize: 10, color: '#9B9B9B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
            Client
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>
            Entreprise Exemple SAS
          </div>
          <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 2 }}>
            12 rue de la Paix, 75002 Paris
          </div>
        </div>

        {/* Description / content area */}
        <div style={{ padding: '16px 20px 8px 20px' }}>
          <div style={{ fontSize: 10, color: '#9B9B9B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
            Description
          </div>
          {editable ? (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => onEdit?.(e.target.value)}
              style={{
                width: '100%',
                border: '1px solid #E5E5E5',
                borderRadius: 4,
                outline: 'none',
                resize: 'none',
                fontSize: 12,
                lineHeight: 1.5,
                color: '#1A1A1A',
                fontFamily: 'inherit',
                background: '#FAFAFA',
                padding: '8px 10px',
                overflow: 'hidden',
              }}
            />
          ) : (
            <div style={{ fontSize: 12, lineHeight: 1.5, color: '#1A1A1A', whiteSpace: 'pre-wrap' }}>
              {content}
            </div>
          )}
        </div>

        {/* Items table */}
        <div style={{ padding: '8px 20px' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1px solid #E5E5E5',
              borderRadius: 4,
            }}
          >
            <thead>
              <tr>
                <th style={{ ...headerCellStyle, textAlign: 'left', width: '50%' }}>Désignation</th>
                <th style={{ ...headerCellStyle, textAlign: 'center', width: '10%' }}>Qté</th>
                <th style={{ ...headerCellStyle, textAlign: 'right', width: '20%' }}>PU HT</th>
                <th style={{ ...headerCellStyle, textAlign: 'right', width: '20%' }}>Total HT</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx}>
                  <td style={{ ...cellStyle, textAlign: 'left' }}>{line.designation}</td>
                  <td style={{ ...cellStyle, textAlign: 'center' }}>{line.qty}</td>
                  <td style={{ ...cellStyle, textAlign: 'right' }}>{formatEuro(line.unitPrice)}</td>
                  <td style={{ ...cellStyle, textAlign: 'right' }}>{formatEuro(line.qty * line.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div style={{ padding: '8px 20px 0 20px' }}>
          <div
            style={{
              marginLeft: 'auto',
              width: '55%',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6B6B6B' }}>
              <span>Sous-total HT</span>
              <span>{formatEuro(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6B6B6B' }}>
              <span>TVA 20%</span>
              <span>{formatEuro(tva)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 14,
                fontWeight: 700,
                color: '#1A1A1A',
                borderTop: '2px solid #1A1A1A',
                paddingTop: 6,
                marginTop: 4,
              }}
            >
              <span>Total TTC</span>
              <span>{formatEuro(total)}</span>
            </div>
          </div>
        </div>

        {/* Conditions */}
        <div
          style={{
            margin: '16px 20px 0 20px',
            padding: '10px 14px',
            background: '#FAFAFA',
            borderRadius: 4,
            border: '1px solid #E5E5E5',
          }}
        >
          <div style={{ fontSize: 11, color: '#6B6B6B', lineHeight: 1.6 }}>
            <strong>Validité :</strong> 30 jours &nbsp;|&nbsp; <strong>Paiement :</strong> 30% à la commande, solde à la livraison
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 20px',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: 10, color: '#9B9B9B' }}>
            Document généré par Freenzy.io
          </span>
        </div>
      </div>
    </div>
  );
}
