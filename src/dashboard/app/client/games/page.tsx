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

export default function GamesHubPage() {
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
    <div style={{ minHeight: '100vh', background: '#0f0720', padding: '32px 24px' }}>
      <BadgeUnlockPopup />
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <span className="material-symbols-rounded" style={{ fontSize: 36, color: '#7c3aed' }}>
            sports_esports
          </span>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: 0 }}>Arcade</h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: '0 0 28px 0' }}>
          Jouez, gagnez des points et grimpez dans le classement
        </p>

        {/* ═══ Arcade Profile Card ═══ */}
        <div
          style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 14,
            padding: '24px',
            marginBottom: 24,
            backdropFilter: 'blur(12px)',
            boxShadow: '0 0 40px rgba(124,58,237,0.15)',
            border: borderColor
              ? isGradient
                ? '2px solid transparent'
                : `2px solid ${borderColor}`
              : '1px solid rgba(255,255,255,0.08)',
            ...(isGradient ? {
              backgroundImage: `${borderColor}, linear-gradient(#0f0720, #0f0720)`,
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
                background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
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
                <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{levelInfo.title}</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Niv. {profile.level}</span>
              </div>

              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>
                {profile.totalPoints.toLocaleString()} points
                {levelInfo.level < 50 && (
                  <span> — {levelInfo.nextLevelPoints.toLocaleString()} pour le prochain niveau</span>
                )}
              </div>

              {/* Progress bar */}
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.round(levelInfo.progress * 100)}%`,
                    background: 'linear-gradient(90deg, #7c3aed, #06b6d4)',
                    borderRadius: 3,
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </div>

            {/* Streak */}
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                <span className="material-symbols-rounded" style={{ fontSize: 22, color: '#ef4444' }}>
                  local_fire_department
                </span>
                <span style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>{profile.streak}</span>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                Série{profile.bestStreak > 0 ? ` (record : ${profile.bestStreak})` : ''}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ Badge Showcase ═══ */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span className="material-symbols-rounded" style={{ fontSize: 20, color: '#f59e0b' }}>
              emoji_events
            </span>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>
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
                      width: 72,
                      textAlign: 'center',
                      padding: '10px 6px',
                      borderRadius: 10,
                      background: earned ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.02)',
                      border: earned ? '1px solid rgba(139,92,246,0.2)' : '1px solid rgba(255,255,255,0.04)',
                      opacity: earned ? 1 : 0.35,
                      cursor: 'default',
                    }}
                  >
                    <span
                      className="material-symbols-rounded"
                      style={{
                        fontSize: 28,
                        color: earned ? '#f59e0b' : 'rgba(255,255,255,0.3)',
                        display: 'block',
                        marginBottom: 4,
                      }}
                    >
                      {badge.icon}
                    </span>
                    <div style={{ fontSize: 9, color: earned ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)', lineHeight: 1.2 }}>
                      {badge.name}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* ═══ Stats Strip ═══ */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
          {[
            { icon: 'videogame_asset', label: 'Parties jouées', value: totalPlayed, color: '#7c3aed' },
            { icon: 'toll', label: 'Crédits gagnés', value: totalCredits, color: '#22c55e' },
            { icon: 'stars', label: 'Points Arcade', value: profile.totalPoints.toLocaleString(), color: '#f59e0b' },
            { icon: 'favorite', label: 'Jeu préféré', value: favoriteGame, color: '#ec4899' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                flex: '1 1 160px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 12,
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: 26, color: stat.color }}>
                {stat.icon}
              </span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          <Link href="/client/games/create" style={{ textDecoration: 'none' }}>
            <button
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
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
              <span className="material-symbols-rounded" style={{ fontSize: 18 }}>add</span>
              Créer un jeu
            </button>
          </Link>
          <Link href="/client/games/community" style={{ textDecoration: 'none' }}>
            <button
              style={{
                background: 'rgba(255,255,255,0.07)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
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
              <span className="material-symbols-rounded" style={{ fontSize: 18 }}>groups</span>
              Communauté
            </button>
          </Link>
        </div>

        {/* ═══ Leaderboard ═══ */}
        {leaderboard.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="material-symbols-rounded" style={{ fontSize: 20, color: '#f59e0b' }}>
                  leaderboard
                </span>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Classement</span>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {(['all', 'weekly'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setLbMode(mode)}
                    style={{
                      background: lbMode === mode ? 'rgba(139,92,246,0.2)' : 'transparent',
                      color: lbMode === mode ? '#a78bfa' : 'rgba(255,255,255,0.4)',
                      border: lbMode === mode ? '1px solid rgba(139,92,246,0.3)' : '1px solid rgba(255,255,255,0.08)',
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
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(12px)',
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
                    borderBottom: i < 9 ? '1px solid rgba(255,255,255,0.04)' : 'none',
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
                        : 'rgba(255,255,255,0.06)',
                      color: i < 3 ? '#fff' : 'rgba(255,255,255,0.4)',
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{entry.name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
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
                            className="material-symbols-rounded"
                            title={bd.name}
                            style={{ fontSize: 16, color: '#f59e0b' }}
                          >
                            {bd.icon}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#7c3aed', flexShrink: 0 }}>
                    {entry.points.toLocaleString()} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ Game Cards Grid ═══ */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
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
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 14,
                    padding: '20px 18px',
                    backdropFilter: 'blur(12px)',
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
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
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
                      <span
                        className="material-symbols-rounded"
                        style={{ fontSize: 24, color: game.color }}
                      >
                        {game.icon}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
                        {game.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
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

                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: '0 0 14px 0', lineHeight: 1.4 }}>
                    {game.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 14 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                          {s?.bestScore ?? '—'}
                        </div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>Meilleur</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                          {s?.gamesPlayed ?? 0}
                        </div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>Parties</div>
                      </div>
                    </div>
                    <div
                      style={{
                        background: `${game.color}22`,
                        color: game.color,
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '4px 10px',
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
