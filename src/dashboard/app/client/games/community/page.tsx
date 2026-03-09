'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import StarRating from '@/components/StarRating';
import {
  loadCommunityGames,
  rateGame,
  hasRated,
  UserGame,
  GeneratedQuestion,
} from '@/lib/user-games';

type SortMode = 'recent' | 'rated' | 'played';

export default function CommunityPage() {
  const [games, setGames] = useState<UserGame[]>([]);
  const [sort, setSort] = useState<SortMode>('recent');
  const [playing, setPlaying] = useState<UserGame | null>(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const [mounted, setMounted] = useState(false);

  const loadGames = useCallback(() => {
    let g = loadCommunityGames();
    switch (sort) {
      case 'rated':
        g = [...g].sort((a, b) => b.averageRating - a.averageRating);
        break;
      case 'played':
        g = [...g].sort((a, b) => b.playCount - a.playCount);
        break;
      default:
        g = [...g].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    setGames(g);
  }, [sort]);

  useEffect(() => {
    setMounted(true);
    loadGames();
  }, [loadGames]);

  const startGame = (game: UserGame) => {
    setPlaying(game);
    setCurrent(0);
    setSelected(null);
    setShowResult(false);
    setCorrect(0);
    setFinished(false);
  };

  const handleAnswer = (idx: number) => {
    if (showResult || !playing) return;
    setSelected(idx);
    setShowResult(true);
    const q = playing.questions[current];
    if (q.choices[idx] === q.answer) {
      setCorrect((c) => c + 1);
    }
    setTimeout(() => {
      if (current + 1 >= playing.questions.length) {
        setFinished(true);
      } else {
        setCurrent((c) => c + 1);
        setSelected(null);
        setShowResult(false);
      }
    }, 1200);
  };

  const handleRate = (gameId: string, rating: number) => {
    rateGame(gameId, rating);
    loadGames();
    setPlaying(null);
  };

  if (!mounted) return null;

  const sortOptions: { value: SortMode; label: string }[] = [
    { value: 'recent', label: 'Plus récents' },
    { value: 'rated', label: 'Mieux notés' },
    { value: 'played', label: 'Plus joués' },
  ];

  // Playing a community game
  if (playing) {
    if (finished) {
      const alreadyRated = hasRated(playing.id);
      return (
        <div style={{ minHeight: '100vh', background: '#0f0720', padding: '32px 24px' }}>
          <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
            <span className="material-symbols-rounded" style={{ fontSize: 48, color: '#f59e0b', marginBottom: 12, display: 'block' }}>
              emoji_events
            </span>
            <h2 style={{ color: '#fff', margin: '0 0 8px 0' }}>Jeu terminé !</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 8 }}>
              {playing.title}
            </p>
            <div style={{ color: '#f59e0b', fontSize: 22, fontWeight: 700, marginBottom: 24 }}>
              {correct}/{playing.questions.length} bonnes réponses
            </div>

            {!alreadyRated && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 10 }}>
                  Notez ce jeu :
                </p>
                <StarRating value={0} size={32} onChange={(r) => handleRate(playing.id, r)} />
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => startGame(playing)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  padding: '10px 20px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Rejouer
              </button>
              <button
                onClick={() => { setPlaying(null); loadGames(); }}
                style={{
                  background: '#7c3aed',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px 20px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Retour
              </button>
            </div>
          </div>
        </div>
      );
    }

    const q = playing.questions[current];
    return (
      <div style={{ minHeight: '100vh', background: '#0f0720', padding: '32px 24px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
              {playing.title}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
              {current + 1}/{playing.questions.length}
            </span>
          </div>

          <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginBottom: 24 }}>
            <div
              style={{
                height: '100%',
                width: `${((current + 1) / playing.questions.length) * 100}%`,
                background: '#7c3aed',
                borderRadius: 2,
                transition: 'width 0.3s',
              }}
            />
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 14,
              padding: '24px 20px',
              marginBottom: 16,
            }}
          >
            <p style={{ color: '#fff', fontSize: 16, fontWeight: 600, margin: 0, lineHeight: 1.5 }}>
              {q.question}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {q.choices.map((choice, idx) => {
              let bg = 'rgba(255,255,255,0.05)';
              let border = 'rgba(255,255,255,0.08)';
              if (showResult) {
                if (choice === q.answer) { bg = 'rgba(34,197,94,0.15)'; border = '#22c55e'; }
                else if (idx === selected && choice !== q.answer) { bg = 'rgba(239,68,68,0.15)'; border = '#ef4444'; }
              }
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  style={{
                    background: bg,
                    border: `1px solid ${border}`,
                    borderRadius: 10,
                    padding: '14px 16px',
                    color: '#fff',
                    fontSize: 14,
                    textAlign: 'left',
                    cursor: showResult ? 'default' : 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  {choice}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Games list
  return (
    <div style={{ minHeight: '100vh', background: '#0f0720', padding: '32px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Link
            href="/client/games"
            style={{
              color: 'rgba(255,255,255,0.5)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 13,
            }}
          >
            <span className="material-symbols-rounded" style={{ fontSize: 18 }}>arrow_back</span>
            Arcade
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
          <span style={{ color: '#fff', fontWeight: 600 }}>Communauté</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <span className="material-symbols-rounded" style={{ fontSize: 30, color: '#f59e0b' }}>
            groups
          </span>
          <div>
            <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0 }}>Jeux de la communauté</h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: 0 }}>
              Jouez aux créations des autres joueurs
            </p>
          </div>
        </div>

        {/* Sort */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSort(opt.value)}
              style={{
                background: sort === opt.value ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${sort === opt.value ? '#f59e0b' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 8,
                padding: '6px 14px',
                color: sort === opt.value ? '#f59e0b' : 'rgba(255,255,255,0.5)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Games grid */}
        {games.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <span className="material-symbols-rounded" style={{ fontSize: 48, color: 'rgba(255,255,255,0.15)', display: 'block', marginBottom: 12 }}>
              sports_esports
            </span>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
              Aucun jeu publié pour le moment.
            </p>
            <Link href="/client/games/create" style={{ color: '#7c3aed', textDecoration: 'none', fontSize: 13 }}>
              Créez le premier !
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 14,
            }}
          >
            {games.map((game) => (
              <div
                key={game.id}
                onClick={() => startGame(game)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 14,
                  padding: '18px 16px',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s, transform 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#f59e0b';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 600, margin: 0, flex: 1 }}>
                    {game.title}
                  </h3>
                  <span
                    style={{
                      fontSize: 10,
                      padding: '2px 8px',
                      borderRadius: 10,
                      background: game.type === 'quiz' ? 'rgba(245,158,11,0.15)' : game.type === 'enigma' ? 'rgba(124,58,237,0.15)' : 'rgba(6,182,212,0.15)',
                      color: game.type === 'quiz' ? '#f59e0b' : game.type === 'enigma' ? '#7c3aed' : '#06b6d4',
                      marginLeft: 8,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {game.type === 'quiz' ? 'Quiz' : game.type === 'enigma' ? 'Énigme' : 'Défi'}
                  </span>
                </div>

                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>
                  par {game.authorName} — {game.questions.length} questions
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <StarRating value={game.averageRating} size={14} readonly showCount count={game.ratings.length} />
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 13, verticalAlign: 'middle', marginRight: 3 }}>
                      play_arrow
                    </span>
                    {game.playCount}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
