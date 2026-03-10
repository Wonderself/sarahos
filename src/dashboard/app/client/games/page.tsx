'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GAME_CATALOG,
  loadScores,
  getTotalGamesPlayed,
  getTotalCreditsFromGames,
  loadDaily,
  GameScore,
} from '@/lib/games-engine';
import {
  getArcadeProfile,
  getLevelInfo,
  getProfileBorderColor,
  getBadgeDefinitions,
  getLeaderboard,
  checkWeeklyReset,
  ArcadeProfile,
  ArcadeLeaderboardEntry,
  Badge,
} from '@/lib/arcade-profile';
import BadgeUnlockPopup from '@/components/BadgeUnlockPopup';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import { useIsMobile } from '../../../lib/use-media-query';

// ─── Icon-to-Emoji mapping for dynamic game/badge icons ─────────────────────

const ICON_EMOJI_MAP: Record<string, string> = {
  // Game icons
  sports_esports: '🎮', spellcheck: '🔤', grid_on: '🔢', route: '🐍',
  view_comfy_alt: '🧱', quiz: '❓', psychology: '🧠', calculate: '🔢',
  crisis_alert: '💣', keyboard: '⌨️', today: '📅',
  // Badge icons
  emoji_events: '🏆', speed: '⚡', extension: '🧩', auto_stories: '📖',
  pest_control: '🐍', view_in_ar: '🧱', neurology: '🧠', bomb: '💣',
  local_fire_department: '🔥', whatshot: '🔥', paid: '💰', diamond: '💎',
  military_tech: '🎖️', workspace_premium: '🥇', auto_awesome: '✨',
  grid_view: '🔲', bolt: '⚡', refresh: '🔄', stars: '⭐',
  // Stats icons
  videogame_asset: '🎮', toll: '💰', favorite: '❤️',
  // Other
  leaderboard: '🏆', add: '➕', groups: '👥',
};

function iconToEmoji(icon: string): string {
  return ICON_EMOJI_MAP[icon] ?? '🎯';
}

export default function GamesHubPage() {
  const isMobile = useIsMobile();
  const [scores, setScores] = useState<Record<string, GameScore>>({});
  const [totalPlayed, setTotalPlayed] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [streak, setStreak] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<ArcadeProfile | null>(null);
  const [leaderboard, setLeaderboard] = useState<ArcadeLeaderboardEntry[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [lbMode, setLbMode] = useState<'all' | 'weekly'>('all');

  useEffect(() => {
    setMounted(true);
    setScores(loadScores());
    setTotalPlayed(getTotalGamesPlayed());
    setTotalCredits(getTotalCreditsFromGames());
    const daily = loadDaily();
    setStreak(daily.streak || 0);

    checkWeeklyReset();
    setProfile(getArcadeProfile());
    setLeaderboard(getLeaderboard());
    setBadges(getBadgeDefinitions());
  }, []);

  if (!mounted || !profile) return null;

  const levelInfo = getLevelInfo(profile.totalPoints);
  const borderColor = getProfileBorderColor(profile.level);
  const isGradient = borderColor?.startsWith('linear-gradient');

  // Find favorite game
  const allScores = loadScores();
  let favoriteGame = '—';
  let maxPlayed = 0;
  for (const g of GAME_CATALOG) {
    const s = allScores[g.slug];
    if (s && s.gamesPlayed > maxPlayed) {
      maxPlayed = s.gamesPlayed;
      favoriteGame = g.name;
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--fz-bg-secondary, #F8FAFC)', padding: isMobile ? '16px 12px' : '32px 24px' }}>
      <BadgeUnlockPopup />
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>{PAGE_META.games.emoji}</span>
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 600, color: 'var(--fz-text)', margin: 0 }}>{PAGE_META.games.title}</h1>
              <p style={{ fontSize: 12, color: 'var(--fz-text-muted)', margin: '2px 0 0' }}>{PAGE_META.games.subtitle}</p>
            </div>
            <HelpBubble text={PAGE_META.games.helpText} />
          </div>
        </div>
        <PageExplanation pageId="games" text={PAGE_META.games?.helpText} />

        {/* Arcade Profile Card */}
        <div
          style={{
            background: 'var(--fz-bg, #FFFFFF)',
            borderRadius: 14,
            padding: '24px',
            marginBottom: 24,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: borderColor
              ? isGradient
                ? '2px solid transparent'
                : `2px solid ${borderColor}`
              : '1px solid var(--fz-border, #E2E8F0)',
            ...(isGradient ? {
              backgroundImage: `${borderColor}, linear-gradient(var(--fz-bg, #FFFFFF), var(--fz-bg, #FFFFFF))`,
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
            } as React.CSSProperties : {}),
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            {/* Level badge */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--fz-accent, #0EA5E9), #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>{profile.level}</span>
            </div>

            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--fz-text, #1E293B)' }}>{levelInfo.title}</span>
                <span style={{ fontSize: 13, color: 'var(--fz-text-muted, #94A3B8)' }}>Niv. {profile.level}</span>
              </div>

              <div style={{ fontSize: 12, color: 'var(--fz-text-muted)', marginBottom: 10 }}>
                {profile.totalPoints.toLocaleString()} points
                {levelInfo.level < 50 && (
                  <span> — {levelInfo.nextLevelPoints.toLocaleString()} pour le prochain niveau</span>
                )}
              </div>

              {/* Progress bar */}
              <div style={{ height: 6, borderRadius: 3, background: 'var(--fz-border, #E2E8F0)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.round(levelInfo.progress * 100)}%`,
                    background: 'linear-gradient(90deg, var(--fz-accent, #0EA5E9), #06b6d4)',
                    borderRadius: 3,
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </div>

            {/* Streak */}
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                <span style={{ fontSize: 22 }}>🔥</span>
                <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--fz-text, #1E293B)' }}>{profile.streak}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)' }}>
                Série{profile.bestStreak > 0 ? ` (record : ${profile.bestStreak})` : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Badge Showcase */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 20 }}>🏆</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--fz-text, #1E293B)' }}>
              Badges ({profile.badges.length}/{badges.filter(b => !b.secret).length})
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              gap: 10,
              overflowX: 'auto',
              paddingBottom: 8,
              scrollbarWidth: 'thin',
            }}
          >
            {badges
              .filter(b => !b.secret || profile.badges.includes(b.id))
              .map((badge) => {
                const earned = profile.badges.includes(badge.id);
                return (
                  <div
                    key={badge.id}
                    title={`${badge.name} — ${badge.condition}`}
                    style={{
                      flexShrink: 0,
                      width: isMobile ? 56 : 72,
                      textAlign: 'center',
                      padding: '10px 6px',
                      borderRadius: 10,
                      background: earned ? 'rgba(139,92,246,0.08)' : 'var(--fz-bg-secondary, #F8FAFC)',
                      border: earned ? '1px solid rgba(139,92,246,0.2)' : '1px solid var(--fz-border, #E2E8F0)',
                      opacity: earned ? 1 : 0.45,
                      cursor: 'default',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 28,
                        display: 'block',
                        marginBottom: 4,
                        filter: earned ? 'none' : 'grayscale(0.5)',
                      }}
                    >
                      {iconToEmoji(badge.icon)}
                    </span>
                    <div style={{ fontSize: 9, color: earned ? 'var(--fz-text-secondary, #64748B)' : 'var(--fz-text-muted, #94A3B8)', lineHeight: 1.2 }}>
                      {badge.name}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Stats Strip */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
          {[
            { emoji: '🎮', label: 'Parties jouées', value: totalPlayed, color: 'var(--fz-accent, #0EA5E9)' },
            { emoji: '💰', label: 'Crédits gagnés', value: totalCredits, color: '#22c55e' },
            { emoji: '⭐', label: 'Points Arcade', value: profile.totalPoints.toLocaleString(), color: '#f59e0b' },
            { emoji: '❤️', label: 'Jeu préféré', value: favoriteGame, color: '#ec4899' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                flex: isMobile ? '1 1 100px' : '1 1 160px',
                background: 'var(--fz-bg, #FFFFFF)',
                borderRadius: 12,
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                border: 'none', boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))',
              }}
            >
              <span style={{ fontSize: 26 }}>
                {stat.emoji}
              </span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--fz-text, #1E293B)' }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          <Link href="/client/games/create" style={{ textDecoration: 'none' }}>
            <button
              style={{
                background: 'linear-gradient(135deg, var(--fz-accent, #0EA5E9), #06b6d4)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 18 }}>➕</span>
              Créer un jeu
            </button>
          </Link>
          <Link href="/client/games/community" style={{ textDecoration: 'none' }}>
            <button
              style={{
                background: 'var(--fz-bg, #FFFFFF)',
                color: 'var(--fz-text, #1E293B)',
                border: 'none', boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))',
                borderRadius: 10,
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 18 }}>👥</span>
              Communauté
            </button>
          </Link>
        </div>

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>🏆</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--fz-text, #1E293B)' }}>Classement</span>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {(['all', 'weekly'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setLbMode(mode)}
                    style={{
                      background: lbMode === mode ? 'rgba(139,92,246,0.1)' : 'transparent',
                      color: lbMode === mode ? 'var(--fz-accent, #0EA5E9)' : 'var(--fz-text-muted, #94A3B8)',
                      border: lbMode === mode ? '1px solid rgba(139,92,246,0.2)' : '1px solid var(--fz-border, #E2E8F0)',
                      borderRadius: 8,
                      padding: '5px 12px',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {mode === 'all' ? 'Tout' : 'Semaine'}
                  </button>
                ))}
              </div>
            </div>
            <div
              style={{
                background: 'var(--fz-bg, #FFFFFF)',
                borderRadius: 12,
                border: 'none', boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))',
                overflow: 'hidden',
              }}
            >
              {leaderboard.slice(0, 10).map((entry, i) => (
                <div
                  key={`${entry.name}-${i}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '12px 18px',
                    borderBottom: i < 9 ? '1px solid var(--fz-border, #E2E8F0)' : 'none',
                  }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      fontWeight: 700,
                      background:
                        i === 0 ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                        : i === 1 ? 'linear-gradient(135deg, #94a3b8, #64748b)'
                        : i === 2 ? 'linear-gradient(135deg, #b45309, #92400e)'
                        : 'var(--fz-bg-secondary, #F8FAFC)',
                      color: i < 3 ? '#fff' : 'var(--fz-text-muted, #94A3B8)',
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fz-text, #1E293B)' }}>{entry.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)' }}>
                      Niv. {entry.level} — {entry.title}
                    </div>
                  </div>
                  {entry.badges.length > 0 && (
                    <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                      {entry.badges.slice(0, 3).map((bId) => {
                        const bd = badges.find(b => b.id === bId);
                        if (!bd) return null;
                        return (
                          <span
                            key={bId}
                            title={bd.name}
                            style={{ fontSize: 16 }}
                          >
                            {iconToEmoji(bd.icon)}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fz-accent, #0EA5E9)', flexShrink: 0 }}>
                    {entry.points.toLocaleString()} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Game Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
          }}
        >
          {GAME_CATALOG.map((game) => {
            const s = scores[game.slug];
            return (
              <Link
                key={game.slug}
                href={`/client/games/${game.slug}`}
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    background: 'var(--fz-bg, #FFFFFF)',
                    border: 'none', boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))',
                    borderRadius: 14,
                    padding: '20px 18px',
                    cursor: 'pointer',
                    transition: 'transform 0.15s, border-color 0.2s',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                    (e.currentTarget as HTMLElement).style.borderColor = game.color;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--fz-border, #E2E8F0)';
                  }}
                >
                  {/* Color accent top */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: game.color,
                      borderRadius: '14px 14px 0 0',
                    }}
                  />

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: `${game.color}18`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ fontSize: 24 }}>
                        {iconToEmoji(game.icon)}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--fz-text, #1E293B)' }}>
                        {game.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)' }}>
                        {game.category === 'classic'
                          ? 'Classique'
                          : game.category === 'puzzle'
                          ? 'Puzzle'
                          : game.category === 'speed'
                          ? 'Vitesse'
                          : 'Quotidien'}
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: 12, color: 'var(--fz-text-muted)', margin: '0 0 14px 0', lineHeight: 1.4 }}>
                    {game.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 14 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fz-text, #1E293B)' }}>
                          {s?.bestScore ?? '—'}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--fz-text-muted, #94A3B8)' }}>Meilleur</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fz-text, #1E293B)' }}>
                          {s?.gamesPlayed ?? 0}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--fz-text-muted, #94A3B8)' }}>Parties</div>
                      </div>
                    </div>
                    <div
                      style={{
                        background: `${game.color}22`,
                        color: game.color,
                        fontSize: 11,
                        fontWeight: 600,
                        height: 36, padding: '0 12px',
                        borderRadius: 20,
                      }}
                    >
                      +10 pts/partie
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
