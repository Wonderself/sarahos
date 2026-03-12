'use client';

import { useState, useEffect } from 'react';
import {
  REWARD_ACTIONS, REWARD_CATEGORIES, loadRewards, claimReward, canClaim,
  getClaimCount, getTotalPossibleCredits, getShareUrl,
} from '../../../lib/rewards';
import type { RewardsState, RewardAction } from '../../../lib/rewards';
import { useIsMobile } from '../../../lib/use-media-query';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';

type Category = keyof typeof REWARD_CATEGORIES;

// Material icon name -> emoji mapping for reward action icons
const ICON_EMOJI: Record<string, string> = {
  share: '🔗', // 🔗
  work: '💼', // 💼
  thumb_up: '👍', // 👍
  chat: '💬', // 💬
  star: '⭐', // ⭐
  verified: '✅', // ✅
  rocket_launch: '🚀', // 🚀
  chat_bubble: '💬', // 💬
  description: '📄', // 📄
  groups: '👥', // 👥
  call: '📞', // 📞
  tune: '🔧', // 🔧
  account_circle: '👤', // 👤
  login: '🔑', // 🔑
  diversity_3: '🤝', // 🤝
  palette: '🎨', // 🎨
  smartphone: '📱', // 📱
  person_add: '👥', // 👥
  emoji_people: '🙋', // 🙋
  paid: '💰', // 💰
  store: '🏪', // 🏪
  forum: '💬', // 💬
  rate_review: '✍️', // ✍️
  bug_report: '🐛', // 🐛
  lightbulb: '💡', // 💡
  local_fire_department: '🔥', // 🔥
  whatshot: '🔥', // 🔥
  military_tech: '🎖️', // 🎖️
  emoji_events: '🏆', // 🏆
  bolt: '⚡', // ⚡
  edit: '✏️', // ✏️
  toll: '🪙', // 🪙
  check_circle: '✅', // ✅
  error: '❌', // ❌
  link: '🔗', // 🔗
  content_copy: '📋', // 📋
  card_giftcard: '🏆', // 🏆
  lock_open: '🔓', // 🔓
  check: '✅', // ✅
  schedule: '🕐', // 🕐
};

function getIconEmoji(iconName: string): string {
  return ICON_EMOJI[iconName] || '⭐'; // fallback: ⭐
}

// Category icon mapping
const CAT_ICON_EMOJI: Record<string, string> = {
  share: '🔗', // 🔗
  bolt: '⚡', // ⚡
  person_add: '👥', // 👥
  edit: '✏️', // ✏️
  emoji_events: '🏆', // 🏆
};

function getToken() {
  if (typeof window === 'undefined') return '';
  try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}').token ?? ''; } catch { return ''; }
}

function getReferralCode() {
  if (typeof window === 'undefined') return '';
  try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}').referralCode ?? ''; } catch { return ''; }
}

export default function RewardsPage() {
  const isMobile = useIsMobile();
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
    if (action.id === 'trustpilot_review') {
      window.open('https://www.trustpilot.com/evaluate/freenzy.io', '_blank');
    }
    if (action.id === 'product_hunt_upvote') {
      window.open('https://www.producthunt.com/posts/freenzy', '_blank');
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

  const meta = PAGE_META.rewards;

  return (
    <div style={{ padding: '24px 20px', maxWidth: 900, margin: '0 auto' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '12px 20px', borderRadius: 8,
          background: toast.type === 'success' ? '#1A1A1A' : 'var(--danger)',
          color: '#fff', fontWeight: 700, fontSize: 14,
          animation: 'lp-fade-in 0.3s ease',
        }}>
          <span style={{ fontSize: 18, verticalAlign: 'middle', marginRight: 8 }}>
            {toast.type === 'success' ? '✅' : '❌'}
          </span>
          {toast.message}
        </div>
      )}

      {/* Page Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        marginBottom: 24, padding: '0 0 16px 0',
        borderBottom: '1px solid #E5E5E5',
      }}>
        <span style={{ fontSize: 32 }}>{meta.emoji}</span>
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: isMobile ? 22 : 28, fontWeight: 800, margin: 0,
            color: '#1A1A1A',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {meta.title}
            <HelpBubble text={meta.helpText} />
          </h1>
          <p style={{
            margin: '4px 0 0', fontSize: 14,
            color: '#6B6B6B',
          }}>
            {meta.subtitle}
          </p>
        </div>
      </div>
      <PageExplanation pageId="rewards" text={PAGE_META.rewards?.helpText} />

      {/* Stats strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 10 : 14, marginBottom: 28,
      }}>
        <div style={{
          background: '#F7F7F7', border: '1px solid #E5E5E5',
          borderRadius: 8, padding: '18px 16px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#1A1A1A' }}>{state.totalEarned}</div>
          <div style={{ fontSize: 11, color: '#9B9B9B', fontWeight: 600, marginTop: 4 }}>CRÉDITS GAGNÉS</div>
        </div>
        <div style={{
          background: '#F7F7F7', border: '1px solid #E5E5E5',
          borderRadius: 8, padding: '18px 16px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#1A1A1A' }}>{state.claimed.length}</div>
          <div style={{ fontSize: 11, color: '#9B9B9B', fontWeight: 600, marginTop: 4 }}>ACTIONS COMPLÉTÉES</div>
        </div>
        <div style={{
          background: '#F7F7F7', border: '1px solid #E5E5E5',
          borderRadius: 8, padding: '18px 16px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#1A1A1A' }}>{progress}%</div>
          <div style={{ fontSize: 11, color: '#9B9B9B', fontWeight: 600, marginTop: 4 }}>PROGRESSION</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        background: '#F7F7F7', borderRadius: 6, height: 8, marginBottom: 32, overflow: 'hidden',
        border: '1px solid #E5E5E5',
      }}>
        <div style={{
          width: `${progress}%`, height: '100%', borderRadius: 6,
          background: '#1A1A1A',
          transition: 'width 0.5s ease',
        }} />
      </div>

      {/* Referral link */}
      {referralCode && (
        <div style={{
          background: '#F7F7F7', border: '1px solid #E5E5E5',
          borderRadius: 8, padding: '16px 20px', marginBottom: 28,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <span style={{ fontSize: 28 }}>{'🔗'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>Votre lien de parrainage</div>
            <div style={{ fontSize: 12, color: '#9B9B9B', fontFamily: 'monospace', wordBreak: 'break-all' }}>
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
              padding: '8px 16px', borderRadius: 8, border: '1px solid #E5E5E5',
              background: '#1A1A1A', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }}>{'📋'}</span>
            Copier
          </button>
        </div>
      )}

      {/* Category filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        <button
          onClick={() => setActiveCategory('all')}
          style={{
            padding: '8px 16px', borderRadius: 8, border: '1px solid #E5E5E5', cursor: 'pointer',
            fontSize: 12, fontWeight: 700,
            background: activeCategory === 'all' ? '#1A1A1A' : 'var(--fz-bg-secondary, #F8FAFC)',
            color: activeCategory === 'all' ? '#fff' : 'var(--fz-text-secondary, #64748B)',
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
                padding: '8px 16px', borderRadius: 8, border: '1px solid #E5E5E5', cursor: 'pointer',
                fontSize: 12, fontWeight: 700,
                background: activeCategory === key ? '#1A1A1A' : 'var(--fz-bg-secondary, #F8FAFC)',
                color: activeCategory === key ? '#fff' : 'var(--fz-text-secondary, #64748B)',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <span style={{ fontSize: 14 }}>{CAT_ICON_EMOJI[meta.icon] || '⭐'}</span>
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
                background: claimed ? '#F7F7F7' : '#fff',
                border: `1px solid ${claimed ? '#E5E5E5' : '#E5E5E5'}`,
                borderRadius: 8, padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 14,
                flexWrap: isMobile ? 'wrap' as const : 'nowrap' as const,
                opacity: claimed ? 0.5 : 1,
                transition: 'all 0.2s',
              }}
            >
              {/* Icon */}
              <div style={{
                width: isMobile ? 44 : 48, height: isMobile ? 44 : 48, borderRadius: isMobile ? 10 : 12, flexShrink: 0,
                background: 'rgba(0,0,0,0.04)', border: '1px solid #E5E5E5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: isMobile ? 18 : 22 }}>
                  {getIconEmoji(action.icon)}
                </span>
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>{action.label}</span>
                  {action.oneTime && claimCount > 0 && (
                    <span style={{ fontSize: 16 }}>{'✅'}</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#9B9B9B', lineHeight: 1.4 }}>
                  {action.description}
                </div>
                {!action.oneTime && action.maxClaims && (
                  <div style={{ fontSize: 11, color: '#9B9B9B', marginTop: 3, opacity: 0.7 }}>
                    {claimCount}/{action.maxClaims} fois
                  </div>
                )}
              </div>

              {/* Credits badge */}
              <div style={{
                padding: isMobile ? '4px 10px' : '6px 14px', borderRadius: 8,
                background: claimed ? '#F7F7F7' : 'rgba(0,0,0,0.04)',
                color: claimed ? '#9B9B9B' : '#1A1A1A',
                fontSize: isMobile ? 12 : 14, fontWeight: 800, flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <span style={{ fontSize: 16 }}>{'🪙'}</span>
                +{action.credits}
              </div>

              {/* Action button */}
              <button
                onClick={() => handleClaim(action)}
                disabled={claimed}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: '1px solid #E5E5E5',
                  background: claimed ? '#F7F7F7' : '#1A1A1A',
                  color: claimed ? '#9B9B9B' : '#fff',
                  fontWeight: 700, fontSize: 12, cursor: claimed ? 'default' : 'pointer',
                  flexShrink: 0, minWidth: isMobile ? 60 : 80, textAlign: 'center',
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
        marginTop: 32, padding: '20px 24px', borderRadius: 8,
        background: '#F7F7F7', border: '1px solid #E5E5E5',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 14, color: '#6B6B6B', marginBottom: 8 }}>
          Total possible
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, color: '#1A1A1A' }}>
          {totalPossible} crédits
        </div>
        <div style={{ fontSize: 12, color: '#9B9B9B', marginTop: 4 }}>
          en complétant toutes les actions disponibles
        </div>
      </div>
    </div>
  );
}
