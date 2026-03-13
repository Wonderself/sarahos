'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import StarRating from '@/components/StarRating';
import { CU, pageContainer, headerRow, emojiIcon } from '../../../../lib/page-styles';
import { useIsMobile } from '../../../../lib/use-media-query';
import { PAGE_META } from '../../../../lib/emoji-map';
import PageExplanation from '../../../../components/PageExplanation';
import {
  loadCommunityGames,
  rateGame,
  hasRated,
  UserGame,
  GeneratedQuestion,
} from '@/lib/user-games';

type SortMode = 'recent' | 'rated' | 'played';

export default function CommunityPage() {
  const isMobile = useIsMobile();
  const meta = PAGE_META['games-community'];
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
        <div style={{ ...pageContainer(isMobile), maxWidth: 600, textAlign: 'center' }}>
            <span style={CU.emptyEmoji}>
              🏆
            </span>
            <h2 style={{ color: CU.text, margin: '0 0 8px 0' }}>Jeu terminé !</h2>
            <p style={{ color: CU.textMuted, fontSize: 14, marginBottom: 8 }}>
              {playing.title}
            </p>
            <div style={{ color: '#f59e0b', fontSize: 22, fontWeight: 700, marginBottom: 24 }}>
              {correct}/{playing.questions.length} bonnes réponses
            </div>

            {!alreadyRated && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ color: CU.textMuted, fontSize: 13, marginBottom: 10 }}>
                  Notez ce jeu :
                </p>
                <StarRating value={0} size={32} onChange={(r) => handleRate(playing.id, r)} />
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => startGame(playing)}
                style={CU.btnGhost}
              >
                Rejouer
              </button>
              <button
                onClick={() => { setPlaying(null); loadGames(); }}
                style={CU.btnPrimary}
              >
                Retour
              </button>
            </div>
        </div>
      );
    }

    const q = playing.questions[current];
    return (
      <div style={{ ...pageContainer(isMobile), maxWidth: 600 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ color: CU.textMuted, fontSize: 13 }}>
              {playing.title}
            </span>
            <span style={{ color: CU.textMuted, fontSize: 13 }}>
              {current + 1}/{playing.questions.length}
            </span>
          </div>

          <div style={{ height: 3, background: CU.border, borderRadius: 2, marginBottom: 24 }}>
            <div
              style={{
                height: '100%',
                width: `${((current + 1) / playing.questions.length) * 100}%`,
                background: CU.accent,
                borderRadius: 2,
                transition: 'width 0.3s',
              }}
            />
          </div>

          <div
            style={{
              background: CU.bgSecondary,
              borderRadius: 8,
              padding: '24px 20px',
              marginBottom: 16,
            }}
          >
            <p style={{ color: CU.text, fontSize: 16, fontWeight: 600, margin: 0, lineHeight: 1.5 }}>
              {q.question}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {q.choices.map((choice, idx) => {
              let bg = CU.bgSecondary;
              let border = CU.border;
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
                    borderRadius: 8,
                    padding: '14px 16px',
                    color: CU.text,
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
    );
  }

  // Games list
  return (
    <div style={pageContainer(isMobile)}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Link
            href="/client/games"
            style={{
              color: CU.textMuted,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 13,
            }}
          >
            ←
            Arcade
          </Link>
          <span style={{ color: CU.border }}>/</span>
          <span style={{ color: CU.text, fontWeight: 600 }}>Communauté</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={headerRow()}>
            <span style={emojiIcon(24)}>{meta.emoji}</span>
            <h1 style={CU.pageTitle}>Jeux de la communauté</h1>
            <PageExplanation pageId="games-community" />
          </div>
          <p style={CU.pageSubtitle}>
            {meta.subtitle}
          </p>
        </div>

        {/* Sort */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSort(opt.value)}
              style={{
                ...CU.btnSmall,
                background: sort === opt.value ? CU.accentLight : CU.bg,
                border: `1px solid ${sort === opt.value ? CU.accent : CU.border}`,
                color: sort === opt.value ? CU.text : CU.textMuted,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Games grid */}
        {games.length === 0 ? (
          <div style={CU.emptyState}>
            <span style={CU.emptyEmoji}>🎮</span>
            <div style={CU.emptyTitle}>Aucun jeu publié</div>
            <div style={CU.emptyDesc}>
              Aucun jeu publié pour le moment.
            </div>
            <Link href="/client/games/create" style={{ color: CU.accent, textDecoration: 'none', fontSize: 13 }}>
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
                  ...CU.cardHoverable,
                  background: CU.bgSecondary,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#f59e0b';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = CU.border;
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <h3 style={{ color: CU.text, fontSize: 15, fontWeight: 600, margin: 0, flex: 1 }}>
                    {game.title}
                  </h3>
                  <span
                    style={{
                      fontSize: 10,
                      padding: '2px 8px',
                      borderRadius: 8,
                      background: game.type === 'quiz' ? 'rgba(245,158,11,0.15)' : game.type === 'enigma' ? 'rgba(14,165,233,0.15)' : 'rgba(6,182,212,0.15)',
                      color: game.type === 'quiz' ? '#f59e0b' : game.type === 'enigma' ? CU.accent : '#06b6d4',
                      marginLeft: 8,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {game.type === 'quiz' ? 'Quiz' : game.type === 'enigma' ? 'Énigme' : 'Défi'}
                  </span>
                </div>

                <div style={{ fontSize: 12, color: CU.textMuted, marginBottom: 10 }}>
                  par {game.authorName} — {game.questions.length} questions
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <StarRating value={game.averageRating} size={14} readonly showCount count={game.ratings.length} />
                  <div style={{ fontSize: 11, color: CU.textMuted }}>
                    <span style={{ fontSize: 13, verticalAlign: 'middle', marginRight: 3 }}>
                      ▶️
                    </span>
                    {game.playCount}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
