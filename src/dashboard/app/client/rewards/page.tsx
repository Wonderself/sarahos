'use client';

import { useState, useEffect } from 'react';
import {
  REWARD_ACTIONS, REWARD_CATEGORIES, loadRewards, claimReward, canClaim,
  getClaimCount, getTotalPossibleCredits, getShareUrl,
} from '../../../lib/rewards';
import type { RewardsState, RewardAction } from '../../../lib/rewards';

type Category = keyof typeof REWARD_CATEGORIES;

function getToken() {
  if (typeof window === 'undefined') return '';
  try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}').token ?? ''; } catch { return ''; }
}

function getReferralCode() {
  if (typeof window === 'undefined') return '';
  try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}').referralCode ?? ''; } catch { return ''; }
}

export default function RewardsPage() {
  const [state, setState] = useState<RewardsState>({ totalEarned: 0, claimed: [], pendingActions: [] });
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const referralCode = getReferralCode();

  useEffect(() => {
    setState(loadRewards());
  }, []);

  const handleClaim = (action: RewardAction) => {
    // For share actions, open share URL then claim
    if (action.category === 'social' && action.id.startsWith('share_')) {
      const platform = action.id.replace('share_', '');
      const url = getShareUrl(referralCode || 'FREENZY', platform);
      window.open(url, '_blank', 'width=600,height=400');
    }

    if (action.id === 'google_review') {
      window.open('https://g.page/r/freenzy-io/review', '_blank');
    }

    const result = claimReward(action.id);
    if (result.success) {
      setState(loadRewards());
      setToast({ message: result.message, type: 'success' });
    } else {
      setToast({ message: result.message, type: 'error' });
    }
    setTimeout(() => setToast(null), 3000);
  };

  const categories = Object.entries(REWARD_CATEGORIES) as [Category, typeof REWARD_CATEGORIES[Category]][];
  const filteredActions = activeCategory === 'all'
    ? REWARD_ACTIONS
    : REWARD_ACTIONS.filter(a => a.category === activeCategory);

  const totalPossible = getTotalPossibleCredits();
  const progress = totalPossible > 0 ? Math.round((state.totalEarned / totalPossible) * 100) : 0;

  return (
    <div style={{ padding: '24px 20px', maxWidth: 900, margin: '0 auto' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '12px 20px', borderRadius: 10,
          background: toast.type === 'success' ? '#22c55e' : '#ef4444',
          color: '#fff', fontWeight: 700, fontSize: 14,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          animation: 'lp-fade-in 0.3s ease',
        }}>
          <span className="material-symbols-rounded" style={{ fontSize: 18, verticalAlign: 'middle', marginRight: 8 }}>
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="material-symbols-rounded" style={{ fontSize: 32, color: '#f59e0b' }}>card_giftcard</span>
          Récompenses
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>
          Gagnez des crédits gratuits en partageant, en utilisant la plateforme et en invitant vos proches.
        </p>
      </div>

      {/* Stats strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28,
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 14, padding: '18px 16px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#22c55e' }}>{state.totalEarned}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginTop: 4 }}>CRÉDITS GAGNÉS</div>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 14, padding: '18px 16px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#f59e0b' }}>{state.claimed.length}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginTop: 4 }}>ACTIONS COMPLÉTÉES</div>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 14, padding: '18px 16px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#5b6cf7' }}>{progress}%</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginTop: 4 }}>PROGRESSION</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        background: 'rgba(255,255,255,0.06)', borderRadius: 6, height: 8, marginBottom: 32, overflow: 'hidden',
      }}>
        <div style={{
          width: `${progress}%`, height: '100%', borderRadius: 6,
          background: 'linear-gradient(90deg, #22c55e, #5b6cf7)',
          transition: 'width 0.5s ease',
        }} />
      </div>

      {/* Referral link */}
      {referralCode && (
        <div style={{
          background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)',
          borderRadius: 14, padding: '16px 20px', marginBottom: 28,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <span className="material-symbols-rounded" style={{ fontSize: 28, color: '#f97316' }}>link</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Votre lien de parrainage</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              freenzy.io/?ref={referralCode}
            </div>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`https://freenzy.io/?ref=${referralCode}`);
              setToast({ message: 'Lien copié !', type: 'success' });
              setTimeout(() => setToast(null), 2000);
            }}
            style={{
              padding: '8px 16px', borderRadius: 8, border: 'none',
              background: '#f97316', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer',
            }}
          >
            <span className="material-symbols-rounded" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }}>content_copy</span>
            Copier
          </button>
        </div>
      )}

      {/* Category filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        <button
          onClick={() => setActiveCategory('all')}
          style={{
            padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 700,
            background: activeCategory === 'all' ? '#5b6cf7' : 'rgba(255,255,255,0.06)',
            color: activeCategory === 'all' ? '#fff' : 'rgba(255,255,255,0.6)',
          }}
        >
          Toutes ({REWARD_ACTIONS.length})
        </button>
        {categories.map(([key, meta]) => {
          const count = REWARD_ACTIONS.filter(a => a.category === key).length;
          return (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              style={{
                padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 700,
                background: activeCategory === key ? meta.color : 'rgba(255,255,255,0.06)',
                color: activeCategory === key ? '#fff' : 'rgba(255,255,255,0.6)',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: 14 }}>{meta.icon}</span>
              {meta.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Action cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filteredActions.map((action) => {
          const claimed = !canClaim(action.id);
          const claimCount = getClaimCount(action.id);
          const catMeta = REWARD_CATEGORIES[action.category];

          return (
            <div
              key={action.id}
              style={{
                background: claimed ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${claimed ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 14, padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: 14,
                opacity: claimed ? 0.5 : 1,
                transition: 'all 0.2s',
              }}
            >
              {/* Icon */}
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: `${catMeta.color}15`, border: `1px solid ${catMeta.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span className="material-symbols-rounded" style={{ fontSize: 22, color: catMeta.color }}>
                  {action.icon}
                </span>
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{action.label}</span>
                  {action.oneTime && claimCount > 0 && (
                    <span className="material-symbols-rounded" style={{ fontSize: 16, color: '#22c55e' }}>check_circle</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
                  {action.description}
                </div>
                {!action.oneTime && action.maxClaims && (
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>
                    {claimCount}/{action.maxClaims} fois
                  </div>
                )}
              </div>

              {/* Credits badge */}
              <div style={{
                padding: '6px 14px', borderRadius: 8,
                background: claimed ? 'rgba(255,255,255,0.05)' : `${catMeta.color}15`,
                color: claimed ? 'rgba(255,255,255,0.3)' : catMeta.color,
                fontSize: 14, fontWeight: 800, flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <span className="material-symbols-rounded" style={{ fontSize: 16 }}>toll</span>
                +{action.credits}
              </div>

              {/* Action button */}
              <button
                onClick={() => handleClaim(action)}
                disabled={claimed}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: 'none',
                  background: claimed ? 'rgba(255,255,255,0.05)' : catMeta.color,
                  color: claimed ? 'rgba(255,255,255,0.3)' : '#fff',
                  fontWeight: 700, fontSize: 12, cursor: claimed ? 'default' : 'pointer',
                  flexShrink: 0, minWidth: 80, textAlign: 'center',
                }}
              >
                {claimed ? 'Fait' : 'Réclamer'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom summary */}
      <div style={{
        marginTop: 32, padding: '20px 24px', borderRadius: 14,
        background: 'rgba(91,108,247,0.08)', border: '1px solid rgba(91,108,247,0.15)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
          Total possible
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, color: '#5b6cf7' }}>
          {totalPossible} crédits
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
          en complétant toutes les actions disponibles
        </div>
      </div>
    </div>
  );
}
