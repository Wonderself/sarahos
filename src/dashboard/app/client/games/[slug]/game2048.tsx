'use client';

import { useState, useEffect, useCallback } from 'react';
import { recordGameScore } from '@/lib/games-engine';

type Grid = number[][];

function emptyGrid(): Grid {
  return Array.from({ length: 4 }, () => Array(4).fill(0));
}

function addRandom(grid: Grid): Grid {
  const g = grid.map((r) => [...r]);
  const empty: [number, number][] = [];
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++)
      if (g[r][c] === 0) empty.push([r, c]);
  if (empty.length === 0) return g;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  g[r][c] = Math.random() < 0.9 ? 2 : 4;
  return g;
}

function slideRow(row: number[]): { row: number[]; score: number } {
  const nums = row.filter((n) => n !== 0);
  let score = 0;
  const merged: number[] = [];
  let i = 0;
  while (i < nums.length) {
    if (i + 1 < nums.length && nums[i] === nums[i + 1]) {
      merged.push(nums[i] * 2);
      score += nums[i] * 2;
      i += 2;
    } else {
      merged.push(nums[i]);
      i++;
    }
  }
  while (merged.length < 4) merged.push(0);
  return { row: merged, score };
}

function moveLeft(grid: Grid): { grid: Grid; score: number; moved: boolean } {
  let score = 0;
  let moved = false;
  const g = grid.map((row) => {
    const { row: newRow, score: s } = slideRow(row);
    score += s;
    if (row.some((v, i) => v !== newRow[i])) moved = true;
    return newRow;
  });
  return { grid: g, score, moved };
}

function rotateGrid(grid: Grid): Grid {
  const g = emptyGrid();
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++)
      g[c][3 - r] = grid[r][c];
  return g;
}

function move(grid: Grid, dir: 'left' | 'right' | 'up' | 'down'): { grid: Grid; score: number; moved: boolean } {
  let g = grid.map((r) => [...r]);
  const rotations: Record<string, number> = { left: 0, down: 1, right: 2, up: 3 };
  for (let i = 0; i < rotations[dir]; i++) g = rotateGrid(g);
  const result = moveLeft(g);
  g = result.grid;
  for (let i = 0; i < (4 - rotations[dir]) % 4; i++) g = rotateGrid(g);
  return { grid: g, score: result.score, moved: result.moved };
}

function canMove(grid: Grid): boolean {
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === 0) return true;
      if (c < 3 && grid[r][c] === grid[r][c + 1]) return true;
      if (r < 3 && grid[r][c] === grid[r + 1][c]) return true;
    }
  return false;
}

function hasWon(grid: Grid): boolean {
  return grid.some((row) => row.some((v) => v >= 2048));
}

const TILE_COLORS: Record<number, { bg: string; fg: string }> = {
  0: { bg: 'rgba(255,255,255,0.04)', fg: 'transparent' },
  2: { bg: '#1e293b', fg: '#e2e8f0' },
  4: { bg: '#334155', fg: '#e2e8f0' },
  8: { bg: '#f97316', fg: '#fff' },
  16: { bg: '#ea580c', fg: '#fff' },
  32: { bg: '#ef4444', fg: '#fff' },
  64: { bg: '#dc2626', fg: '#fff' },
  128: { bg: '#eab308', fg: '#fff' },
  256: { bg: '#ca8a04', fg: '#fff' },
  512: { bg: '#a16207', fg: '#fff' },
  1024: { bg: '#854d0e', fg: '#fff' },
  2048: { bg: '#22c55e', fg: '#fff' },
  4096: { bg: '#8b5cf6', fg: '#fff' },
  8192: { bg: '#ec4899', fg: '#fff' },
};

function tileStyle(v: number) {
  const c = TILE_COLORS[v] || { bg: '#0f172a', fg: '#fff' };
  return c;
}

export default function Game2048() {
  const [grid, setGrid] = useState<Grid>(emptyGrid());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [continuing, setContinuing] = useState(false);

  const initGame = useCallback(() => {
    let g = emptyGrid();
    g = addRandom(g);
    g = addRandom(g);
    setGrid(g);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setContinuing(false);
  }, []);

  useEffect(() => { initGame(); }, [initGame]);

  const handleMove = useCallback(
    (dir: 'left' | 'right' | 'up' | 'down') => {
      if (gameOver) return;
      const result = move(grid, dir);
      if (!result.moved) return;
      const newGrid = addRandom(result.grid);
      const newScore = score + result.score;
      setGrid(newGrid);
      setScore(newScore);
      setBestScore((b) => Math.max(b, newScore));

      if (hasWon(newGrid) && !won && !continuing) {
        setWon(true);
      }
      if (!canMove(newGrid)) {
        setGameOver(true);
        recordGameScore('game2048', newScore);
      }
    },
    [grid, score, gameOver, won, continuing]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, 'left' | 'right' | 'up' | 'down'> = {
        ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
      };
      if (map[e.key]) { handleMove(map[e.key]); e.preventDefault(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleMove]);

  // Touch swipe
  useEffect(() => {
    let sx = 0, sy = 0;
    const ts = (e: TouchEvent) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; };
    const te = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;
      if (Math.abs(dx) > Math.abs(dy)) handleMove(dx > 0 ? 'right' : 'left');
      else handleMove(dy > 0 ? 'down' : 'up');
    };
    window.addEventListener('touchstart', ts);
    window.addEventListener('touchend', te);
    return () => { window.removeEventListener('touchstart', ts); window.removeEventListener('touchend', te); };
  }, [handleMove]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Score */}
      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '8px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Score</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{score}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '8px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Meilleur</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#f97316' }}>{bestScore}</div>
        </div>
      </div>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 72px)',
          gridTemplateRows: 'repeat(4, 72px)',
          gap: 8,
          padding: 10,
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 14,
        }}
      >
        {grid.flat().map((val, i) => {
          const { bg, fg } = tileStyle(val);
          return (
            <div
              key={i}
              style={{
                width: 72,
                height: 72,
                borderRadius: 10,
                background: bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: val >= 1024 ? 18 : val >= 128 ? 22 : 26,
                fontWeight: 700,
                color: fg,
                transition: 'background 0.15s',
              }}
            >
              {val > 0 ? val : ''}
            </div>
          );
        })}
      </div>

      {/* Win overlay */}
      {won && !continuing && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#22c55e', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
            Vous avez atteint 2048 !
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              onClick={() => setContinuing(true)}
              style={{
                background: '#22c55e',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Continuer
            </button>
            <button
              onClick={initGame}
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Recommencer
            </button>
          </div>
        </div>
      )}

      {gameOver && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#ef4444', fontWeight: 600, marginBottom: 12 }}>Partie terminée !</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 12 }}>
            Score final : {score}
          </p>
          <button
            onClick={initGame}
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

      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, textAlign: 'center' }}>
        Flèches directionnelles ou swipe tactile
      </p>
    </div>
  );
}
