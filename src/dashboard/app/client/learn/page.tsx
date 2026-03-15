'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/lib/use-media-query';
import {
  ALL_PARCOURS,
  FORMATION_CATEGORIES,
  getAvailableParcours,
  getComingSoonParcours,
  calculateLevel,
  type FormationParcours,
} from '@/lib/formations';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LearnProgress {
  completedModules: string[];
  completedParcours: string[];
  quizScores: Record<string, number>;
  totalXP: number;
  streak: number;
  lastActivity: string;
}

const STORAGE_KEY = 'fz_learn_progress';

function loadProgress(): LearnProgress {
  if (typeof window === 'undefined') {
    return { completedModules: [], completedParcours: [], quizScores: {}, totalXP: 0, streak: 0, lastActivity: '' };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { completedModules: [], completedParcours: [], quizScores: {}, totalXP: 0, streak: 0, lastActivity: '' };
}

function computeStreak(lastActivity: string): number {
  if (!lastActivity) return 0;
  const last = new Date(lastActivity);
  const now = new Date();
  const diffMs = now.getTime() - last.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 1) return 1;
  return 0;
}

// ---------------------------------------------------------------------------
// Level badge colors
// ---------------------------------------------------------------------------

function levelBadgeStyle(level: FormationParcours['level']): React.CSSProperties {
  const map: Record<string, { bg: string; color: string }> = {
    debutant: { bg: '#DCFCE7', color: '#16A34A' },
    intermediaire: { bg: '#FEF3C7', color: '#D97706' },
    avance: { bg: '#FEE2E2', color: '#DC2626' },
    expert: { bg: '#F3E8FF', color: '#7C3AED' },
  };
  const c = map[level] || map.debutant;
  return {
    display: 'inline-block',
    fontSize: 10,
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: 99,
    backgroundColor: c.bg,
    color: c.color,
    whiteSpace: 'nowrap' as const,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LearnPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [progress, setProgress] = useState<LearnProgress>(loadProgress);
  const [activeCat, setActiveCat] = useState('all');
  const [activeLevel, setActiveLevel] = useState('all');

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const streak = useMemo(() => {
    const stored = progress.streak || 0;
    const computed = computeStreak(progress.lastActivity);
    return Math.max(stored, computed);
  }, [progress]);

  const level = useMemo(() => calculateLevel(progress.totalXP), [progress.totalXP]);

  const available = getAvailableParcours();
  const comingSoon = getComingSoonParcours();

  // Count total modules across all parcours
  const totalModules = useMemo(() => {
    return ALL_PARCOURS.reduce((sum, p) => sum + p.modules.length, 0);
  }, []);

  // Filter parcours
  const filteredParcours = useMemo(() => {
    let list = ALL_PARCOURS;
    if (activeCat !== 'all') {
      list = list.filter((p) => p.category === activeCat);
    }
    if (activeLevel !== 'all') {
      list = list.filter((p) => p.level === activeLevel);
    }
    return list;
  }, [activeCat, activeLevel]);

  // Card progress for a parcours
  function getParcoursProgress(p: FormationParcours) {
    if (p.modules.length === 0) return { started: false, percent: 0, completed: false };
    const moduleIds = p.modules.map((m) => m.id);
    const done = moduleIds.filter((id) => progress.completedModules.includes(id)).length;
    const total = moduleIds.length;
    return {
      started: done > 0,
      percent: Math.round((done / total) * 100),
      completed: progress.completedParcours.includes(p.id),
    };
  }

  const levelPills = [
    { key: 'all', label: 'Tous' },
    { key: 'debutant', label: '🌱 Débutant' },
    { key: 'intermediaire', label: '📚 Intermédiaire' },
    { key: 'avance', label: '🚀 Avancé' },
    { key: 'expert', label: '⭐ Expert' },
  ];

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: isMobile ? '16px 12px' : '24px 20px' }}>
      {/* HEADER */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#1A1A1A' }}>🎓 Formation</span>
          <span style={{ fontSize: 13, color: '#9B9B9B' }}>Développez vos compétences IA</span>
        </div>

        {/* Level display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>
            {level.emoji} Niveau {level.label}
          </span>
          <div style={{ flex: 1, minWidth: 120, maxWidth: 200, height: 8, backgroundColor: '#F0F0F0', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${level.progress}%`, height: '100%', backgroundColor: '#1A1A1A', borderRadius: 4, transition: 'width 0.3s' }} />
          </div>
          <span style={{ fontSize: 11, color: '#9B9B9B' }}>
            {progress.totalXP} / {level.nextLevelXP} XP
          </span>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 12, color: '#6B6B6B', flexWrap: 'wrap' }}>
          <span>{available.length} parcours</span>
          <span>·</span>
          <span>{totalModules} modules</span>
          <span>·</span>
          <span>{progress.totalXP} XP</span>
          <span>·</span>
          <span>🔥 {streak}j streak</span>
        </div>
      </div>

      {/* CATEGORY TABS */}
      <div style={{
        display: 'flex',
        gap: 4,
        overflowX: 'auto',
        whiteSpace: 'nowrap' as const,
        borderBottom: '1px solid #E5E5E5',
        marginBottom: 12,
        WebkitOverflowScrolling: 'touch',
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
      }}>
        <button
          onClick={() => setActiveCat('all')}
          style={{
            minHeight: 44,
            padding: '8px 14px',
            fontSize: 13,
            fontWeight: activeCat === 'all' ? 600 : 400,
            color: activeCat === 'all' ? '#1A1A1A' : '#6B6B6B',
            borderBottom: activeCat === 'all' ? '2px solid #1A1A1A' : '2px solid transparent',
            background: 'none',
            border: 'none',
            borderBottomStyle: 'solid',
            borderBottomWidth: 2,
            borderBottomColor: activeCat === 'all' ? '#1A1A1A' : 'transparent',
            cursor: 'pointer',
            whiteSpace: 'nowrap' as const,
          }}
        >
          Tous
        </button>
        {FORMATION_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.id)}
            style={{
              minHeight: 44,
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: activeCat === cat.id ? 600 : 400,
              color: activeCat === cat.id ? '#1A1A1A' : '#6B6B6B',
              background: 'none',
              border: 'none',
              borderBottomStyle: 'solid',
              borderBottomWidth: 2,
              borderBottomColor: activeCat === cat.id ? '#1A1A1A' : 'transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap' as const,
            }}
          >
            {cat.emoji} {cat.title}
          </button>
        ))}
      </div>

      {/* LEVEL FILTER PILLS */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {levelPills.map((pill) => (
          <button
            key={pill.key}
            onClick={() => setActiveLevel(pill.key)}
            style={{
              padding: '5px 12px',
              fontSize: 12,
              fontWeight: 500,
              borderRadius: 99,
              border: '1px solid #E5E5E5',
              backgroundColor: activeLevel === pill.key ? '#1A1A1A' : '#FFFFFF',
              color: activeLevel === pill.key ? '#FFFFFF' : '#6B6B6B',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* PARCOURS GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: 12,
        marginBottom: 24,
      }}>
        {filteredParcours.map((p) => {
          const prog = getParcoursProgress(p);
          const isComingSoon = p.comingSoon || !p.available;

          return (
            <div
              key={p.id}
              onClick={() => {
                if (!isComingSoon) router.push(`/client/learn/${p.id}`);
              }}
              style={{
                border: '1px solid #E5E5E5',
                borderRadius: 8,
                padding: 14,
                cursor: isComingSoon ? 'default' : 'pointer',
                opacity: isComingSoon ? 0.5 : 1,
                display: 'flex',
                gap: 10,
                transition: 'box-shadow 0.15s',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!isComingSoon) (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              {/* Left color bar */}
              <div style={{
                width: 4,
                minHeight: '100%',
                backgroundColor: p.color,
                borderRadius: '4px 0 0 4px',
                flexShrink: 0,
                marginLeft: -14,
                marginTop: -14,
                marginBottom: -14,
                borderTopLeftRadius: 8,
                borderBottomLeftRadius: 8,
              }} />

              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Row 1: emoji + title + level badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 16 }}>{p.emoji}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{p.title}</span>
                  <span style={levelBadgeStyle(p.level)}>{p.levelLabel}</span>
                </div>

                {/* Row 2: description */}
                <div style={{
                  fontSize: 12,
                  color: '#6B6B6B',
                  marginBottom: 6,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: '1.4',
                }}>
                  {p.description}
                </div>

                {/* Row 3: progress bar if started */}
                {prog.started && !prog.completed && (
                  <div style={{ marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ flex: 1, height: 6, backgroundColor: '#F0F0F0', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${prog.percent}%`, height: '100%', backgroundColor: '#16A34A', borderRadius: 3, transition: 'width 0.3s' }} />
                      </div>
                      <span style={{ fontSize: 11, color: '#6B6B6B', fontWeight: 600 }}>{prog.percent}%</span>
                    </div>
                  </div>
                )}

                {/* Row 4: meta info */}
                <div style={{ fontSize: 11, color: '#9B9B9B' }}>
                  ⏱ {p.totalDuration} · 📚 {p.modules.length} modules · ⭐ {p.totalXP} XP
                </div>

                {/* Row 5: diploma title */}
                <div style={{ fontSize: 11, color: '#9B9B9B', fontStyle: 'italic', marginTop: 2 }}>
                  🎓 {p.diplomaTitle}
                </div>

                {/* Badges */}
                <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                  {prog.completed && (
                    <>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#16A34A', backgroundColor: '#DCFCE7', padding: '2px 8px', borderRadius: 99 }}>✅ Complété</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/client/learn/${p.id}?diploma=1`);
                        }}
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#6B6B6B',
                          backgroundColor: '#F5F5F5',
                          padding: '2px 8px',
                          borderRadius: 99,
                          border: '1px solid #E5E5E5',
                          cursor: 'pointer',
                        }}
                      >
                        📄 Diplôme
                      </button>
                    </>
                  )}
                  {isComingSoon && (
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#9B9B9B', backgroundColor: '#F5F5F5', padding: '2px 8px', borderRadius: 99 }}>🔒 Bientôt</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No results */}
      {filteredParcours.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: '#9B9B9B', fontSize: 14 }}>
          Aucun parcours trouvé pour ces filtres.
        </div>
      )}

      {/* BOTTOM: Languages teaser */}
      <div style={{
        background: 'linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%)',
        borderRadius: 12,
        padding: isMobile ? 16 : 20,
        marginBottom: 16,
        border: '1px solid #E5E5E5',
      }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>
          🌍 Bientôt : Langues
        </div>
        <div style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 8 }}>
          Apprenez l&apos;anglais et l&apos;hébreu des affaires avec un coach IA — style Duolingo
        </div>
        <div style={{ fontSize: 24, display: 'flex', gap: 8 }}>
          🇫🇷 🇬🇧 🇮🇱
        </div>
      </div>

      {/* Stats footer */}
      <div style={{ fontSize: 12, color: '#9B9B9B', textAlign: 'center', marginBottom: 8 }}>
        {available.length} formations · {ALL_PARCOURS.reduce((s, p) => {
          const dur = parseFloat(p.totalDuration) || 0;
          return s + dur;
        }, 0)}h de contenu · {comingSoon.length} bientôt
      </div>

      {/* Suggestion */}
      <div style={{ fontSize: 12, color: '#9B9B9B', textAlign: 'center', marginBottom: 24 }}>
        💡 Suggestion ? <a href="mailto:support@freenzy.io" style={{ color: '#1A1A1A', textDecoration: 'underline' }}>support@freenzy.io</a>
      </div>
    </div>
  );
}
