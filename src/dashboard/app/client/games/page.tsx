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

export default function GamesHubPage() {
  const [scores, setScores] = useState<Record<string, GameScore>>({});
  const [totalPlayed, setTotalPlayed] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [streak, setStreak] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setScores(loadScores());
    setTotalPlayed(getTotalGamesPlayed());
    setTotalCredits(getTotalCreditsFromGames());
    const daily = loadDaily();
    setStreak(daily.streak || 0);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <span className="material-symbols-rounded" style={{ fontSize: 36, color: '#8b5cf6' }}>
            sports_esports
          </span>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: 0 }}>Arcade</h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: '0 0 28px 0' }}>
          Jouez, gagnez des crédits et grimpez dans le classement
        </p>

        {/* Stats Strip */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginBottom: 32,
            flexWrap: 'wrap',
          }}
        >
          {[
            { icon: 'videogame_asset', label: 'Parties jouées', value: totalPlayed, color: '#8b5cf6' },
            { icon: 'toll', label: 'Crédits gagnés', value: totalCredits, color: '#22c55e' },
            { icon: 'local_fire_department', label: 'Série quotidienne', value: `${streak} jour${streak !== 1 ? 's' : ''}`, color: '#ef4444' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                flex: '1 1 180px',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 12,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <span
                className="material-symbols-rounded"
                style={{ fontSize: 28, color: stat.color }}
              >
                {stat.icon}
              </span>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          <Link href="/client/games/create" style={{ textDecoration: 'none' }}>
            <button
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
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
                background: 'rgba(255,255,255,0.06)',
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

        {/* Game Cards Grid */}
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
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
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
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
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
                      +{game.creditsPerPlay} cr/partie
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
