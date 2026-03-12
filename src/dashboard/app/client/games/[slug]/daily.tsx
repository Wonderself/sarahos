'use client';

import { useState, useEffect, useRef } from 'react';
import { getDailyGameSlug, loadDaily, completeDailyChallenge, GAME_CATALOG, loadScores } from '@/lib/games-engine';

// Import all game components
import WordleGame from './wordle';
import SudokuGame from './sudoku';
import SnakeGame from './snake';
import TetrisGame from './tetris';
import QuizGame from './quiz';
import MemoryGame from './memory';
import Game2048 from './game2048';
import MinesweeperGame from './minesweeper';
import TypingGame from './typing';

const GAME_MAP: Record<string, React.ComponentType> = {
  wordle: WordleGame,
  sudoku: SudokuGame,
  snake: SnakeGame,
  tetris: TetrisGame,
  quiz: QuizGame,
  memory: MemoryGame,
  game2048: Game2048,
  minesweeper: MinesweeperGame,
  typing: TypingGame,
};

export default function DailyGame() {
  const [slug, setSlug] = useState('');
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [streak, setStreak] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const initialGamesRef = useRef(0);

  useEffect(() => {
    setMounted(true);
    const dailySlug = getDailyGameSlug();
    setSlug(dailySlug);
    const daily = loadDaily();
    const today = new Date().toISOString().split('T')[0];
    if (daily.lastDate === today && daily.completed) {
      setAlreadyDone(true);
      setStreak(daily.streak);
    } else {
      setStreak(daily.streak || 0);
    }
    // Track initial games played for this slug to detect completion
    const scores = loadScores();
    initialGamesRef.current = scores[dailySlug]?.gamesPlayed || 0;
  }, []);

  // Auto-detect game completion by watching for score changes (no manual button)
  useEffect(() => {
    if (completed || alreadyDone || !slug) return;
    const checkCompletion = () => {
      const scores = loadScores();
      const currentPlayed = scores[slug]?.gamesPlayed || 0;
      if (currentPlayed > initialGamesRef.current) {
        const result = completeDailyChallenge();
        setStreak(result.streak);
        setCompleted(true);
      }
    };
    // Poll every 2s to detect when child game records a score
    const iv = setInterval(checkCompletion, 2000);
    window.addEventListener('storage', checkCompletion);
    return () => { clearInterval(iv); window.removeEventListener('storage', checkCompletion); };
  }, [completed, alreadyDone, slug]);

  if (!mounted) return null;

  const config = GAME_CATALOG.find((g) => g.slug === slug);
  const GameComponent = GAME_MAP[slug];

  if (alreadyDone) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: '100%', maxWidth: 500, margin: '0 auto', padding: '0 16px', boxSizing: 'border-box' }}>
        ✅
        <h2 style={{ color: '#fff', margin: 0, fontSize: 22, textAlign: 'center' }}>Défi du jour complété !</h2>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(239,68,68,0.1)',
            padding: '12px 24px',
            borderRadius: 12,
          }}
        >
          🔥
          <span style={{ color: '#ef4444', fontWeight: 700, fontSize: 22 }}>
            {streak} jour{streak !== 1 ? 's' : ''}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>de série</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, textAlign: 'center' }}>
          Revenez demain pour un nouveau défi et maintenir votre série !
        </p>
      </div>
    );
  }

  if (!config || !GameComponent) {
    return (
      <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: 40 }}>
        Chargement...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%', maxWidth: 500, margin: '0 auto', padding: '0 16px', boxSizing: 'border-box' }}>
      {/* Daily header */}
      <div
        style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 14,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          📅
          <div style={{ minWidth: 0 }}>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Défi : {config.name}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>
              Terminez pour valider le défi
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          🔥
          <span style={{ color: '#ef4444', fontWeight: 700, fontSize: 18 }}>{streak}</span>
        </div>
      </div>

      {completed && (
        <div
          style={{
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: 10,
            padding: '12px 16px',
            textAlign: 'center',
            color: '#22c55e',
            fontWeight: 600,
            fontSize: 14,
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          Défi complété ! Série : {streak} jour{streak !== 1 ? 's' : ''}
        </div>
      )}

      {/* Game component — full width */}
      <div style={{ width: '100%' }}>
        <GameComponent />
      </div>

      {!completed && (
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, textAlign: 'center' }}>
          Terminez une partie pour valider votre défi quotidien
        </p>
      )}
    </div>
  );
}
