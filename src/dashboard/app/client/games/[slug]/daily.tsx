'use client';

import { useState, useEffect, useCallback } from 'react';
import { getDailyGameSlug, loadDaily, completeDailyChallenge, GAME_CATALOG } from '@/lib/games-engine';

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
  }, []);

  const handleComplete = useCallback(() => {
    if (completed || alreadyDone) return;
    const result = completeDailyChallenge();
    setStreak(result.streak);
    setCompleted(true);
  }, [completed, alreadyDone]);

  if (!mounted) return null;

  const config = GAME_CATALOG.find((g) => g.slug === slug);
  const GameComponent = GAME_MAP[slug];

  if (alreadyDone) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: 40 }}>
        <span className="material-symbols-rounded" style={{ fontSize: 56, color: '#22c55e' }}>
          check_circle
        </span>
        <h2 style={{ color: '#fff', margin: 0, fontSize: 22 }}>Défi du jour complété !</h2>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(239,68,68,0.1)',
            padding: '10px 20px',
            borderRadius: 10,
          }}
        >
          <span className="material-symbols-rounded" style={{ fontSize: 22, color: '#ef4444' }}>
            local_fire_department
          </span>
          <span style={{ color: '#ef4444', fontWeight: 700, fontSize: 18 }}>
            {streak} jour{streak !== 1 ? 's' : ''}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>de série</span>
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
    <div>
      {/* Daily header */}
      <div
        style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 14,
          padding: '16px 20px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="material-symbols-rounded" style={{ fontSize: 24, color: '#ef4444' }}>
            today
          </span>
          <div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>
              Défi du jour : {config.name}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
              Terminez le jeu pour valider votre défi quotidien
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="material-symbols-rounded" style={{ fontSize: 18, color: '#ef4444' }}>
            local_fire_department
          </span>
          <span style={{ color: '#ef4444', fontWeight: 700 }}>{streak}</span>
        </div>
      </div>

      {completed && (
        <div
          style={{
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: 10,
            padding: '12px 16px',
            marginBottom: 20,
            textAlign: 'center',
            color: '#22c55e',
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Défi complété ! Série : {streak} jour{streak !== 1 ? 's' : ''}
        </div>
      )}

      {/* Wrap game component with completion detection */}
      <div onClickCapture={() => {
        // Simple heuristic: after user interacts, check completion after a delay
        if (!completed && !alreadyDone) {
          setTimeout(() => handleComplete(), 30000);
        }
      }}>
        <GameComponent />
      </div>

      {!completed && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button
            onClick={handleComplete}
            style={{
              background: 'rgba(34,197,94,0.15)',
              color: '#22c55e',
              border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: 10,
              padding: '10px 20px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <span className="material-symbols-rounded" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 6 }}>
              check
            </span>
            Marquer comme terminé
          </button>
        </div>
      )}
    </div>
  );
}
