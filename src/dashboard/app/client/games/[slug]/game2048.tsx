'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { recordGameScore } from '@/lib/games-engine';
import Link from 'next/link';

type Grid = number[][];

const BEST_SCORE_KEY = 'fz_game2048_best';

function loadBestScore(): number {
  if (typeof window === 'undefined') return 0;
  try {
    return parseInt(localStorage.getItem(BEST_SCORE_KEY) || '0', 10) || 0;
  } catch { return 0; }
}

function saveBestScore(s: number) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(BEST_SCORE_KEY, String(s)); } catch {}
}

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
  0: { bg: 'rgba(255,255,255,0.05)', fg: 'transparent' },
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
  4096: { bg: 'var(--accent)', fg: '#fff' },
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
  const [mergedCells, setMergedCells] = useState<Set<number>>(new Set());
  const gridRef = useRef<HTMLDivElement>(null);
  const mergeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load persisted best score on mount
  useEffect(() => {
    setBestScore(loadBestScore());
    return () => { if (mergeTimerRef.current) clearTimeout(mergeTimerRef.current); };
  }, []);

  const initGame = useCallback(() => {
    let g = emptyGrid();
    g = addRandom(g);
    g = addRandom(g);
    setGrid(g);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setContinuing(false);
    setMergedCells(new Set());
  }, []);

  useEffect(() => { initGame(); }, [initGame]);

  const handleMove = useCallback(
    (dir: 'left' | 'right' | 'up' | 'down') => {
      if (gameOver || (won && !continuing)) return;
      const result = move(grid, dir);
      if (!result.moved) return;
      const newGrid = addRandom(result.grid);
      const newScore = score + result.score;
      setGrid(newGrid);
      setScore(newScore);

      // Track merged cells for pop animation
      if (result.score > 0) {
        const merged = new Set<number>();
        newGrid.forEach((row, r) => row.forEach((v, c) => {
          if (v > 0 && (grid[r][c] !== v || result.grid[r][c] !== v)) {
            // This cell had a merge
            merged.add(r * 4 + c);
          }
        }));
        setMergedCells(merged);
        if (mergeTimerRef.current) clearTimeout(mergeTimerRef.current);
        mergeTimerRef.current = setTimeout(() => { setMergedCells(new Set()); mergeTimerRef.current = null; }, 200);
      }

      // Update best score (state + localStorage)
      const newBest = Math.max(bestScore, newScore);
      if (newBest > bestScore) {
        setBestScore(newBest);
        saveBestScore(newBest);
      }

      if (hasWon(newGrid) && !won && !continuing) {
        setWon(true);
      }
      if (!canMove(newGrid)) {
        setGameOver(true);
        recordGameScore('game2048', newScore);
      }
    },
    [grid, score, bestScore, gameOver, won, continuing]
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

  // Touch swipe — scoped to grid element to avoid interfering with page scroll
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    let sx = 0, sy = 0;
    const ts = (e: TouchEvent) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; };
    const te = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;
      e.preventDefault();
      if (Math.abs(dx) > Math.abs(dy)) handleMove(dx > 0 ? 'right' : 'left');
      else handleMove(dy > 0 ? 'down' : 'up');
    };
    el.addEventListener('touchstart', ts, { passive: true });
    el.addEventListener('touchend', te, { passive: false });
    return () => { el.removeEventListener('touchstart', ts); el.removeEventListener('touchend', te); };
  }, [handleMove]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%', maxWidth: 500, margin: '0 auto', padding: '0 16px', boxSizing: 'border-box' }}>
      {/* Score */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '8px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Score</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{score}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '8px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Meilleur</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#f97316' }}>{bestScore}</div>
        </div>
      </div>

      {/* Grid — responsive with 1fr columns, capped max-width */}
      <div
        ref={gridRef}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8,
          padding: 10,
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 14,
          width: '100%',
          maxWidth: 340,
          touchAction: 'none',
        }}
      >
        {grid.flat().map((val, i) => {
          const { bg, fg } = tileStyle(val);
          const isMerged = mergedCells.has(i);
          return (
            <div
              key={i}
              style={{
                aspectRatio: '1',
                borderRadius: 10,
                background: bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: val >= 1024 ? 'min(4.5vw, 18px)' : val >= 128 ? 'min(5.5vw, 22px)' : 'min(6.5vw, 26px)',
                fontWeight: 700,
                color: fg,
                transition: 'background 0.15s, transform 0.15s',
                transform: isMerged ? 'scale(1.12)' : 'scale(1)',
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
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
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
          <p style={{ color: '#ef4444', fontWeight: 700, fontSize: 20, marginBottom: 4 }}>Partie terminée !</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 16 }}>
            Score final : {score}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={initGame}
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

      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, textAlign: 'center' }}>
        Flèches directionnelles ou swipe tactile
      </p>
    </div>
  );
}
