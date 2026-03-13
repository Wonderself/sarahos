'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GAME_CATALOG, getPointsEarnedThisGame, getBadgesEarnedThisGame } from '@/lib/games-engine';
import { getBadgeDefinitions, Badge } from '@/lib/arcade-profile';
import BadgeUnlockPopup from '@/components/BadgeUnlockPopup';
import { CU, pageContainer, headerRow, emojiIcon } from '../../../../lib/page-styles';
import { useIsMobile } from '../../../../lib/use-media-query';
import { PAGE_META } from '../../../../lib/emoji-map';
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
  const isMobile = useIsMobile();

  const [sessionPoints, setSessionPoints] = useState(0);
  const [sessionBadgeIds, setSessionBadgeIds] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);

  useEffect(() => {
    setAllBadges(getBadgeDefinitions());

    // Poll for session updates (games call recordGameScore which updates session tracking)
    const interval = setInterval(() => {
      const pts = getPointsEarnedThisGame();
      const bgs = getBadgesEarnedThisGame();
      if (pts > 0 && !showResults) {
        setSessionPoints(pts);
        setSessionBadgeIds(bgs);
        setShowResults(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [showResults]);

  if (!config || !GameComponent) {
    return (
      <div style={{ ...pageContainer(isMobile), textAlign: 'center' }}>
        <div style={CU.emptyState}>
          <span style={CU.emptyEmoji}>🎮</span>
          <div style={CU.emptyTitle}>Jeu introuvable</div>
          <Link href="/client/games" style={{ color: CU.accent, textDecoration: 'none', fontSize: 13 }}>
            ← Retour à l&apos;Arcade
          </Link>
        </div>
      </div>
    );
  }

  const earnedBadges = sessionBadgeIds
    .map(id => allBadges.find(b => b.id === id))
    .filter(Boolean) as Badge[];

  return (
    <div style={pageContainer(isMobile)}>
      <BadgeUnlockPopup />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
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
          <div style={headerRow()}>
            <span style={emojiIcon(18)}>{config.icon}</span>
            <span style={{ color: CU.text, fontWeight: 600, fontSize: 16 }}>{config.name}</span>
          </div>
        </div>

        <GameComponent />

        {/* ═══ Points earned this session ═══ */}
        {showResults && sessionPoints > 0 && (
          <div
            style={{
              marginTop: 20,
              background: 'rgba(14,165,233,0.08)',
              border: '1px solid rgba(14,165,233,0.2)',
              borderRadius: 8,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 26 }}>
                ⭐
              </span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: CU.text }}>
                  +{sessionPoints} pts
                </div>
                <div style={{ fontSize: 12, color: CU.textMuted }}>
                  Points gagnés cette partie
                </div>
              </div>
            </div>

            {earnedBadges.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {earnedBadges.map((badge) => (
                  <div
                    key={badge.id}
                    title={badge.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'rgba(245,158,11,0.12)',
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: '1px solid rgba(245,158,11,0.2)',
                    }}
                  >
                    <span style={{ fontSize: 16 }}>
                      {badge.icon}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#f59e0b' }}>
                      {badge.name}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowResults(false)}
              style={{
                background: 'none',
                border: 'none',
                color: CU.textMuted,
                cursor: 'pointer',
                fontSize: 18,
                padding: 4,
                display: 'flex',
              }}
            >
              ✕
            </button>
          </div>
        )}
    </div>
  );
}
