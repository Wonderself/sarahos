'use client';

import { useState, useEffect, useCallback } from 'react';
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
    if (!running) return;
    const iv = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(iv);
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

      // Check errors
      const newErrors = new Set<string>();
      if (n > 0 && n !== solution[r][c]) {
        newErrors.add(`${r}-${c}`);
      }
      setErrors(newErrors);

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
      if (n >= 0 && n <= 9) handleInput(n);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleInput]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (board.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Timer */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
          <span className="material-symbols-rounded" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }}>
            timer
          </span>
          {formatTime(timer)}
        </div>
        {won && (
          <div style={{ color: '#22c55e', fontWeight: 600, fontSize: 14 }}>
            Bravo ! Score : {Math.max(100, 1000 - timer * 2)}
          </div>
        )}
      </div>

      {/* Board */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(9, 40px)',
          gridTemplateRows: 'repeat(9, 40px)',
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
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
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

      {/* Number pad */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            onClick={() => handleInput(n)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              border: 'none',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => handleInput(0)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: 'rgba(239,68,68,0.15)',
            color: '#ef4444',
            border: 'none',
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          <span className="material-symbols-rounded" style={{ fontSize: 18 }}>backspace</span>
        </button>
      </div>

      {gameOver && (
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
          Nouvelle grille
        </button>
      )}
    </div>
  );
}
