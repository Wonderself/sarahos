'use client';

import { estimateWorkflowCost, formatCredits } from '../../lib/studio-costs';

interface CostEstimatorProps {
  costSteps: string[];
  onConfirm: () => void;
  confirmed: boolean;
}

export default function CostEstimator({ costSteps, onConfirm, confirmed }: CostEstimatorProps) {
  const { items, total } = estimateWorkflowCost(costSteps);

  return (
    <div style={{
      padding: 16, borderRadius: 10, border: '1px solid #e5e7eb',
      background: '#fafafa',
    }}>
      <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#1d1d1f' }}>
        Estimation du cout
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
        {items.map((item, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', fontSize: 12,
            color: item.available ? '#4b5563' : '#9ca3af',
          }}>
            <span>
              {item.label}
              {!item.available && <span style={{ fontSize: 10, marginLeft: 4, color: '#d97706' }}>(bientot)</span>}
            </span>
            <span style={{ fontWeight: 600 }}>{formatCredits(item.credits)}</span>
          </div>
        ))}
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', padding: '10px 0',
        borderTop: '1px solid #e5e7eb', fontSize: 14, fontWeight: 700,
        color: '#1d1d1f',
      }}>
        <span>Total estime</span>
        <span>{formatCredits(total)}</span>
      </div>

      <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 8, marginBottom: 12 }}>
        Le cout reel peut varier selon la duree de la video et le nombre de messages echanges.
      </p>

      {!confirmed ? (
        <button
          onClick={onConfirm}
          style={{
            width: '100%', padding: '10px 0', borderRadius: 8, border: 'none',
            background: '#5b6cf7', color: 'white', fontSize: 13, fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Confirmer et continuer
        </button>
      ) : (
        <div style={{
          textAlign: 'center', padding: 8, fontSize: 12, color: '#10b981', fontWeight: 600,
        }}>
          Cout confirme ✓
        </div>
      )}
    </div>
  );
}
