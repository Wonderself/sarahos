'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { recordGameScore } from '@/lib/games-engine';

type Board = (number | null)[][];

function createSolvedBoard(): number[][] {
  const board: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));
  function isValid(b: number[][], r: number, c: number, n: number): boolean {
    for (let i = 0; i < 9; i++) {
      if (b[r][i] === n || b[i][c] === n) return false;
    }
    const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
    for (let i = br; i < br + 3; i++)
      for (let j = bc; j < bc + 3; j++)
        if (b[i][j] === n) return false;
    return true;
  }
  function fill(b: number[][]): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (b[r][c] === 0) {
          const nums = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5);
          for (const n of nums) {
            if (isValid(b, r, c, n)) {
              b[r][c] = n;
              if (fill(b)) return true;
              b[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }
  fill(board);
  return board;
}

function generatePuzzle(difficulty: number = 40): { puzzle: Board; solution: number[][] } {
  const solution = createSolvedBoard();
  const puzzle: Board = solution.map((row) => [...row]);
  let removed = 0;
  const positions = Array.from({ length: 81 }, (_, i) => i).sort(() => Math.random() - 0.5);
  for (const pos of positions) {
    if (removed >= difficulty) break;
    const r = Math.floor(pos / 9), c = pos % 9;
    puzzle[r][c] = null;
    removed++;
  }
  return { puzzle, solution };
}

function useCellSize(): number {
  const [size, setSize] = useState(36);
  useEffect(() => {
    function calc() {
      // 9 cells + 2 thick borders (2px each) + 6 thin borders (1px each) + 32px padding
      // Available = min(window.innerWidth - 32, 500) for the grid
      const available = Math.min(window.innerWidth - 40, 400);
      // 9 cells, 2 thick borders at 2px = 4px, 6 thin borders at 1px = 6px, outer border 4px
      const cellMax = Math.floor((available - 14) / 9);
      setSize(Math.min(cellMax, 44));
    }
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);
  return size;
}

export default function SudokuGame() {
  const [puzzle, setPuzzle] = useState<Board>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [board, setBoard] = useState<Board>([]);
  const [fixed, setFixed] = useState<boolean[][]>([]);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cellSize = useCellSize();

  const reset = useCallback(() => {
    const { puzzle: p, solution: s } = generatePuzzle(40);
    setPuzzle(p);
    setSolution(s);
    setBoard(p.map((row) => [...row]));
    setFixed(p.map((row) => row.map((v) => v !== null)));
    setSelected(null);
    setTimer(0);
    setRunning(true);
    setGameOver(false);
    setWon(false);
    setErrors(new Set());
  }, []);

  useEffect(() => { reset(); }, [reset]);

  useEffect(() => {
    if (!running) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      return;
    }
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  }, [running]);

  const checkWin = useCallback(
    (b: Board) => {
      for (let r = 0; r < 9; r++)
        for (let c = 0; c < 9; c++)
          if (b[r][c] !== solution[r][c]) return false;
      return true;
    },
    [solution]
  );

  const handleInput = useCallback(
    (n: number) => {
      if (!selected || gameOver) return;
      const [r, c] = selected;
      if (fixed[r]?.[c]) return;
      const newBoard = board.map((row) => [...row]);
      newBoard[r][c] = n === 0 ? null : n;
      setBoard(newBoard);

      // Accumulate errors
      setErrors((prev) => {
        const next = new Set(prev);
        if (n > 0 && n !== solution[r][c]) {
          next.add(`${r}-${c}`);
        } else {
          next.delete(`${r}-${c}`);
        }
        return next;
      });

      if (checkWin(newBoard)) {
        setRunning(false);
        setGameOver(true);
        setWon(true);
        const score = Math.max(100, 1000 - timer * 2);
        recordGameScore('sudoku', score);
      }
    },
    [selected, gameOver, fixed, board, solution, checkWin, timer]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const n = parseInt(e.key);
      if (n >= 0 && n <= 9) { handleInput(n); return; }
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
        e.preventDefault();
        setSelected((prev) => {
          if (!prev) return [0, 0];
          const [r, c] = prev;
          switch (e.key) {
            case 'ArrowUp': return [Math.max(0, r - 1), c];
            case 'ArrowDown': return [Math.min(8, r + 1), c];
            case 'ArrowLeft': return [r, Math.max(0, c - 1)];
            case 'ArrowRight': return [r, Math.min(8, c + 1)];
            default: return prev;
          }
        });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleInput]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (board.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%', maxWidth: 500, margin: '0 auto', padding: '0 16px', boxSizing: 'border-box' }}>
      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
          <span style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }}>
            ⏱️
          </span>
          {formatTime(timer)}
        </div>
        {errors.size > 0 && (
          <div style={{ color: '#ef4444', fontSize: 13 }}>
            {errors.size} erreur{errors.size > 1 ? 's' : ''}
          </div>
        )}
        {won && (
          <div style={{ color: '#22c55e', fontWeight: 600, fontSize: 14 }}>
            Bravo ! Score : {Math.max(100, 1000 - timer * 2)}
          </div>
        )}
      </div>

      {/* Board — responsive cell sizes */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(9, ${cellSize}px)`,
          gridTemplateRows: `repeat(9, ${cellSize}px)`,
          gap: 0,
          border: '2px solid rgba(255,255,255,0.3)',
        }}
      >
        {board.map((row, r) =>
          row.map((val, c) => {
            const isSelected = selected?.[0] === r && selected?.[1] === c;
            const sameRow = selected?.[0] === r;
            const sameCol = selected?.[1] === c;
            const sameBox =
              selected &&
              Math.floor(selected[0] / 3) === Math.floor(r / 3) &&
              Math.floor(selected[1] / 3) === Math.floor(c / 3);
            const highlighted = sameRow || sameCol || sameBox;
            const isError = errors.has(`${r}-${c}`);
            const isFixed = fixed[r]?.[c];

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => setSelected([r, c])}
                style={{
                  width: cellSize,
                  height: cellSize,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: Math.max(12, cellSize * 0.45),
                  fontWeight: isFixed ? 700 : 400,
                  color: isError ? '#ef4444' : isFixed ? '#fff' : '#3b82f6',
                  background: isSelected
                    ? 'rgba(59,130,246,0.3)'
                    : highlighted
                    ? 'rgba(59,130,246,0.08)'
                    : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  borderRight: (c + 1) % 3 === 0 && c < 8 ? '2px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.08)',
                  borderBottom: (r + 1) % 3 === 0 && r < 8 ? '2px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.08)',
                  transition: 'background 0.15s',
                }}
              >
                {val ?? ''}
              </div>
            );
          })
        )}
      </div>

      {/* Number pad — responsive */}
      <div style={{ display: 'flex', gap: 'clamp(4px, 1.2vw, 6px)', flexWrap: 'wrap', justifyContent: 'center', maxWidth: cellSize * 9 + 50 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            onClick={() => handleInput(n)}
            style={{
              width: Math.max(36, cellSize),
              height: Math.max(36, cellSize),
              borderRadius: 8,
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              border: 'none',
              fontSize: Math.max(14, cellSize * 0.4),
              fontWeight: 600,
              cursor: 'pointer',
              minHeight: 44,
            }}
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => handleInput(0)}
          style={{
            width: Math.max(36, cellSize),
            height: Math.max(36, cellSize),
            borderRadius: 8,
            background: 'rgba(239,68,68,0.15)',
            color: '#ef4444',
            border: 'none',
            fontSize: 14,
            cursor: 'pointer',
            minHeight: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 18 }}>⌫</span>
        </button>
      </div>

      {/* Game over / Replay */}
      {gameOver && won && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ color: '#22c55e', fontWeight: 700, fontSize: 20 }}>
            Score : {Math.max(100, 1000 - timer * 2)}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <button
          onClick={reset}
          style={{
            background: gameOver ? '#7c3aed' : 'rgba(255,255,255,0.08)',
            color: gameOver ? '#fff' : 'rgba(255,255,255,0.5)',
            border: gameOver ? 'none' : '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10,
            padding: '12px 28px',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {gameOver ? 'Rejouer' : 'Nouvelle grille'}
        </button>
        {gameOver && (
          <Link
            href="/client/games"
            style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <span style={{ fontSize: 16 }}>←</span>
            Arcade
          </Link>
        )}
      </div>
    </div>
  );
}
