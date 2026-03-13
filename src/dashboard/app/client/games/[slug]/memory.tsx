'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { recordGameScore } from '@/lib/games-engine';
import Link from 'next/link';

const ICONS = [
  '❤️', '⭐', '💎', '⚡',
  '🚀', '🐾', '🎵', '🔥',
  '💡', '🧘', '❄️', '🌿',
];

interface Card {
  id: number;
  icon: string;
  pairId: number;
  flipped: boolean;
  matched: boolean;
  justMatched: boolean;
}

function createCards(pairs: number = 8): Card[] {
  const icons = ICONS.slice(0, pairs);
  const cards: Card[] = [];
  icons.forEach((icon, i) => {
    cards.push({ id: i * 2, icon, pairId: i, flipped: false, matched: false, justMatched: false });
    cards.push({ id: i * 2 + 1, icon, pairId: i, flipped: false, matched: false, justMatched: false });
  });
  // Shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#0EA5E9', '#ec4899', '#06b6d4', '#f97316', '#64748b', '#16a34a', '#eab308', '#a855f7'];

export default function MemoryGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [locked, setLocked] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const matchAnimRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flipBackRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (matchAnimRef.current) clearTimeout(matchAnimRef.current);
      if (flipBackRef.current) clearTimeout(flipBackRef.current);
    };
  }, []);

  const reset = useCallback(() => {
    setCards(createCards(8));
    setFlipped([]);
    setMoves(0);
    setTimer(0);
    setRunning(true);
    setGameOver(false);
    setLocked(false);
    setFinalScore(0);
  }, []);

  useEffect(() => { reset(); }, [reset]);

  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(iv);
  }, [running]);

  const handleClick = useCallback(
    (idx: number) => {
      if (locked || cards[idx].flipped || cards[idx].matched || gameOver) return;

      const newCards = cards.map((c, i) => (i === idx ? { ...c, flipped: true } : c));
      const newFlipped = [...flipped, idx];
      setCards(newCards);
      setFlipped(newFlipped);

      if (newFlipped.length === 2) {
        setMoves((m) => m + 1);
        setLocked(true);
        const [a, b] = newFlipped;
        if (newCards[a].pairId === newCards[b].pairId) {
          // Match — mark justMatched for animation
          const matched = newCards.map((c, i) =>
            i === a || i === b ? { ...c, matched: true, justMatched: true } : c
          );
          setCards(matched);
          setFlipped([]);
          setLocked(false);

          // Clear justMatched after animation
          matchAnimRef.current = setTimeout(() => {
            setCards((prev) => prev.map((c) => ({ ...c, justMatched: false })));
            matchAnimRef.current = null;
          }, 600);

          // Check win
          if (matched.every((c) => c.matched)) {
            setRunning(false);
            setGameOver(true);
            const score = Math.max(50, 1000 - (moves + 1) * 20 - timer * 5);
            setFinalScore(score);
            recordGameScore('memory', score);
          }
        } else {
          // No match — flip back
          flipBackRef.current = setTimeout(() => {
            setCards((prev) =>
              prev.map((c, i) => (i === a || i === b ? { ...c, flipped: false } : c))
            );
            setFlipped([]);
            setLocked(false);
            flipBackRef.current = null;
          }, 800);
        }
      }
    },
    [cards, flipped, locked, gameOver, moves, timer]
  );

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%', maxWidth: 500, margin: '0 auto', padding: '0 16px', boxSizing: 'border-box' }}>
      {/* Stats */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
          👆
          {moves} coups
        </div>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
          ⏱️
          {formatTime(timer)}
        </div>
      </div>

      {/* Grid — responsive: cards adapt to screen width, capped at 80px */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8,
          width: '100%',
          maxWidth: 360,
          touchAction: 'manipulation',
        }}
      >
        {cards.map((card, idx) => {
          const show = card.flipped || card.matched;
          return (
            <div
              key={card.id}
              onClick={() => handleClick(idx)}
              style={{
                aspectRatio: '1',
                borderRadius: 12,
                background: show
                  ? card.matched
                    ? `${COLORS[card.pairId]}22`
                    : 'rgba(255,255,255,0.08)'
                  : 'rgba(255,255,255,0.05)',
                border: show
                  ? `2px solid ${COLORS[card.pairId]}88`
                  : '2px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: show ? 'default' : 'pointer',
                transition: 'transform 0.4s ease, background 0.3s, box-shadow 0.3s',
                transform: card.justMatched
                  ? 'scale(1.12)'
                  : show
                    ? 'rotateY(0deg)'
                    : 'rotateY(180deg)',
                boxShadow: card.justMatched
                  ? `0 0 16px ${COLORS[card.pairId]}66`
                  : 'none',
                opacity: card.matched && !card.justMatched ? 0.65 : 1,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {show ? (
                <span style={{ fontSize: 'min(8vw, 32px)', color: COLORS[card.pairId] }}
                >
                  {card.icon}
                </span>
              ) : (
                <span style={{ fontSize: 'min(6vw, 24px)', color: 'rgba(255,255,255,0.15)' }}
                >
                  ❓
                </span>
              )}
            </div>
          );
        })}
      </div>

      {gameOver && (
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <div style={{ color: '#22c55e', fontWeight: 700, fontSize: 20, marginBottom: 4 }}>
            Bravo !
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 20 }}>
            {moves} coups en {formatTime(timer)} — Score : {finalScore}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={reset}
              style={{
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '12px 28px',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Rejouer
            </button>
            <Link
              href="/client/games"
              style={{
                color: 'rgba(255,255,255,0.5)',
                textDecoration: 'none',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              ←
              Arcade
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
