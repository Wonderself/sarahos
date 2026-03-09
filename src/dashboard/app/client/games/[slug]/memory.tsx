'use client';

import { useState, useEffect, useCallback } from 'react';
import { recordGameScore } from '@/lib/games-engine';

const ICONS = [
  'favorite', 'star', 'diamond', 'bolt',
  'rocket_launch', 'pets', 'music_note', 'local_fire_department',
  'emoji_objects', 'spa', 'ac_unit', 'eco',
];

interface Card {
  id: number;
  icon: string;
  pairId: number;
  flipped: boolean;
  matched: boolean;
}

function createCards(pairs: number = 8): Card[] {
  const icons = ICONS.slice(0, pairs);
  const cards: Card[] = [];
  icons.forEach((icon, i) => {
    cards.push({ id: i * 2, icon, pairId: i, flipped: false, matched: false });
    cards.push({ id: i * 2 + 1, icon, pairId: i, flipped: false, matched: false });
  });
  // Shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#64748b', '#16a34a', '#eab308', '#a855f7'];

export default function MemoryGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [locked, setLocked] = useState(false);

  const reset = useCallback(() => {
    setCards(createCards(8));
    setFlipped([]);
    setMoves(0);
    setTimer(0);
    setRunning(true);
    setGameOver(false);
    setLocked(false);
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
          // Match
          const matched = newCards.map((c, i) =>
            i === a || i === b ? { ...c, matched: true } : c
          );
          setCards(matched);
          setFlipped([]);
          setLocked(false);

          // Check win
          if (matched.every((c) => c.matched)) {
            setRunning(false);
            setGameOver(true);
            const score = Math.max(50, 1000 - (moves + 1) * 20 - timer * 5);
            recordGameScore('memory', score);
          }
        } else {
          // No match — flip back
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c, i) => (i === a || i === b ? { ...c, flipped: false } : c))
            );
            setFlipped([]);
            setLocked(false);
          }, 800);
        }
      }
    },
    [cards, flipped, locked, gameOver, moves, timer]
  );

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Stats */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
          <span className="material-symbols-rounded" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }}>
            touch_app
          </span>
          {moves} coups
        </div>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
          <span className="material-symbols-rounded" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }}>
            timer
          </span>
          {formatTime(timer)}
        </div>
      </div>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 80px)',
          gap: 10,
        }}
      >
        {cards.map((card, idx) => {
          const show = card.flipped || card.matched;
          return (
            <div
              key={card.id}
              onClick={() => handleClick(idx)}
              style={{
                width: 80,
                height: 80,
                borderRadius: 12,
                background: show
                  ? card.matched
                    ? `${COLORS[card.pairId]}22`
                    : 'rgba(255,255,255,0.06)'
                  : 'rgba(255,255,255,0.04)',
                border: show
                  ? `2px solid ${COLORS[card.pairId]}88`
                  : '2px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: show ? 'default' : 'pointer',
                transition: 'transform 0.3s, background 0.3s',
                transform: show ? 'rotateY(0deg)' : 'rotateY(0deg)',
                opacity: card.matched ? 0.6 : 1,
              }}
            >
              {show ? (
                <span
                  className="material-symbols-rounded"
                  style={{ fontSize: 32, color: COLORS[card.pairId] }}
                >
                  {card.icon}
                </span>
              ) : (
                <span
                  className="material-symbols-rounded"
                  style={{ fontSize: 24, color: 'rgba(255,255,255,0.15)' }}
                >
                  help
                </span>
              )}
            </div>
          );
        })}
      </div>

      {gameOver && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#22c55e', fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
            Bravo !
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 16 }}>
            {moves} coups en {formatTime(timer)} — Score : {Math.max(50, 1000 - moves * 20 - timer * 5)}
          </div>
          <button
            onClick={reset}
            style={{
              background: '#8b5cf6',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Rejouer
          </button>
        </div>
      )}
    </div>
  );
}
