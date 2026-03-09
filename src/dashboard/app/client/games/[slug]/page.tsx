'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { GAME_CATALOG } from '@/lib/games-engine';
import WordleGame from './wordle';
import SudokuGame from './sudoku';
import SnakeGame from './snake';
import TetrisGame from './tetris';
import QuizGame from './quiz';
import MemoryGame from './memory';
import Game2048 from './game2048';
import MinesweeperGame from './minesweeper';
import TypingGame from './typing';
import DailyGame from './daily';

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
  daily: DailyGame,
};

export default function GamePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const config = GAME_CATALOG.find((g) => g.slug === slug);
  const GameComponent = GAME_MAP[slug];

  if (!config || !GameComponent) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', padding: '40px 24px', textAlign: 'center' }}>
        <p style={{ color: '#fff', fontSize: 18, marginBottom: 16 }}>Jeu introuvable</p>
        <Link href="/client/games" style={{ color: '#8b5cf6', textDecoration: 'none', fontSize: 14 }}>
          <span className="material-symbols-rounded" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }}>
            arrow_back
          </span>
          Retour à l&apos;Arcade
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', padding: '24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-symbols-rounded" style={{ fontSize: 20, color: config.color }}>
              {config.icon}
            </span>
            <span style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>{config.name}</span>
          </div>
        </div>
        <GameComponent />
      </div>
    </div>
  );
}
